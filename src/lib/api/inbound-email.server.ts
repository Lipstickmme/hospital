// Resend Inbound webhook handler.
//
// Wire it to `/api/inbound-email` (POST). In TanStack Start, register a
// server file route that awaits this handler; on a nitro adapter, add a
// `server/api/inbound-email.post.ts` that calls into it. Registered with
// Resend under "email.received", it receives the webhook and files the
// message into the email_threads / email_messages tables.
//
// The body is read as raw text: the Svix signature covers the exact bytes
// sent, so parsing to JSON first and re-serialising would break the HMAC.

import {
  FORWARD_TO,
  MAILBOX,
  RESEND_API_KEY,
  RESEND_WEBHOOK_SECRET,
  adminClient,
  errorMessage,
  escapeHtml,
  json,
  normaliseSubject,
  ownAddresses,
  parseAddress,
  sendEmail,
  text,
  verifyResendWebhook,
} from "./_shared.server";

type ReceivedEmail = {
  id: string;
  from: string;
  to: string[];
  subject: string;
  html: string | null;
  text: string | null;
  headers: Record<string, string> | null;
  message_id: string;
};

function header(headers: Record<string, string> | null, name: string): string {
  if (!headers) return "";
  const wanted = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === wanted) return value;
  }
  return "";
}

export async function handleInboundEmail(request: Request): Promise<Response> {
  if (request.method !== "POST") return json(405, { error: "Method not allowed" });

  if (!RESEND_WEBHOOK_SECRET) {
    console.error("RESEND_WEBHOOK_SECRET is not set; refusing inbound mail");
    return json(503, { error: "Inbound mail is not configured." });
  }

  const rawBody = await request.text();

  const verified = await verifyResendWebhook(rawBody, request.headers).catch(
    (error) => ({ ok: false as const, reason: `verifier threw: ${errorMessage(error)}` }),
  );

  if (!verified.ok) {
    console.error(`Rejected inbound webhook: ${verified.reason}`);
    return json(401, { error: "Unauthorised" });
  }

  try {
    const event = JSON.parse(rawBody) as {
      type?: string;
      data?: { email_id?: string };
    };

    if (event.type !== "email.received") {
      return json(200, { ok: true, ignored: event.type ?? "unknown" });
    }

    const emailId = text(event.data?.email_id, 64);
    if (!emailId) return json(400, { error: "Missing email_id" });

    const db = adminClient();

    // Retries deliver the same id; filing it twice would duplicate the thread.
    const { data: seen } = await db
      .from("email_messages")
      .select("id")
      .eq("message_id", `resend-in:${emailId}`)
      .maybeSingle();

    if (seen) return json(200, { ok: true, duplicate: true });

    const response = await fetch(
      `https://api.resend.com/emails/receiving/${emailId}`,
      { headers: { Authorization: `Bearer ${RESEND_API_KEY}` } },
    );

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 300);
      console.error(
        `Could not fetch received email ${emailId}: HTTP ${response.status} ${detail}`,
      );
      return json(502, {
        error: "Could not retrieve the message body.",
        stage: "fetch-received-email",
        upstreamStatus: response.status,
        upstreamBody: detail,
        hint:
          response.status === 401 || response.status === 403
            ? "RESEND_API_KEY cannot read received emails. A sending-only key is not enough; issue one with full access."
            : "Check the email id still exists in Resend.",
      });
    }

    const email = (await response.json()) as ReceivedEmail;
    const from = parseAddress(email.from);
    if (!from.email) return json(400, { error: "Missing sender" });

    const subject = text(email.subject, 300) || "(no subject)";
    const matchSubject = normaliseSubject(subject);
    const inReplyTo = text(header(email.headers, "in-reply-to"), 300) || null;

    let threadId: string | null = null;

    if (inReplyTo) {
      const { data: parent } = await db
        .from("email_messages")
        .select("thread_id")
        .eq("in_reply_to", inReplyTo)
        .maybeSingle();
      if (parent) threadId = parent.thread_id;
    }

    if (!threadId) {
      const { data: existing } = await db
        .from("email_threads")
        .select("id")
        .eq("participant_email", from.email)
        .ilike("subject", matchSubject)
        .maybeSingle();
      if (existing) threadId = existing.id;
    }

    if (!threadId) {
      const { data: created, error: threadError } = await db
        .from("email_threads")
        .insert({
          subject: matchSubject,
          participant_email: from.email,
          participant_name: from.name || null,
        })
        .select("id")
        .single();
      if (threadError) throw threadError;
      threadId = created.id;
    }

    const { error: messageError } = await db.from("email_messages").insert({
      thread_id: threadId,
      direction: "inbound",
      from_email: from.email,
      from_name: from.name || null,
      to_email: (email.to ?? []).join(", ").slice(0, 320),
      subject,
      body_text: text(email.text, 100000) || null,
      body_html: text(email.html, 200000) || null,
      message_id: `resend-in:${emailId}`,
      in_reply_to: text(email.message_id, 300) || null,
    });

    if (messageError && (messageError as { code?: string }).code !== "23505") {
      throw messageError;
    }

    const ours = ownAddresses();
    const forwardTarget = parseAddress(FORWARD_TO).email;

    if (FORWARD_TO && (ours.has(forwardTarget) || ours.has(from.email))) {
      console.warn(
        `Refusing to forward ${from.email} to ${forwardTarget}: that is a mail loop.`,
      );
    } else if (FORWARD_TO) {
      const body = email.text?.trim() || "See the dashboard for the full message.";
      sendEmail({
        to: FORWARD_TO,
        from: MAILBOX,
        subject: `Fwd: ${subject}`,
        html: `<p style="color:#5c6467;font:400 13px/1.6 system-ui">From ${escapeHtml(
          email.from,
        )}</p><div style="color:#0c0d0e;font:400 15px/1.6 system-ui">${escapeHtml(
          body,
        ).replace(/\n/g, "<br>")}</div>`,
        text: `From ${email.from}\n\n${body}`,
        replyTo: from.email,
      }).catch((error) => console.error("forward failed:", error));
    }

    return json(200, { ok: true, thread_id: threadId });
  } catch (error) {
    console.error("Failed to file inbound message:", error);
    const message = errorMessage(error);
    return json(500, {
      error: "Could not file that message.",
      stage: "store",
      detail: message.slice(0, 300),
      hint: /relation .* does not exist/i.test(message)
        ? "The email tables are missing. Run drizzle/migrations/0001_align_messaging_backend.sql."
        : "Check the Supabase service role key and that the migration has run.",
    });
  }
}
