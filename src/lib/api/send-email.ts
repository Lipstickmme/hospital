import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// Sends a reply from the dashboard as the company mailbox, and records it on
// the thread so the conversation reads in one place.
//
// Staff-only: the caller's Supabase session is validated by the middleware
// and checked against the admins view before anything is sent.

const inputSchema = z.object({
  thread_id: z.string().uuid(),
  body: z.string().trim().min(1).max(50000),
});

export const sendEmailReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { adminClient, escapeHtml, isEmail, MAILBOX, parseAddress, sendEmail } =
      await import("./_shared.server");

    const db = adminClient();

    // Belt and braces: the middleware proves a valid session, but only an
    // admin may send mail as the company. Read membership with the service
    // role rather than as the caller, so the answer does not depend on the
    // caller being able to see their own admins row.
    const { data: admin } = await db
      .from("admins")
      .select("user_id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!admin) throw new Error("Not signed in as staff.");

    const { data: thread, error: threadError } = await db
      .from("email_threads")
      .select("id, subject, participant_email, participant_name")
      .eq("id", data.thread_id)
      .maybeSingle();

    if (threadError) throw new Error(threadError.message);
    if (!thread) throw new Error("That conversation no longer exists.");
    if (!isEmail(thread.participant_email)) {
      throw new Error("That conversation has no valid reply address.");
    }

    // Thread the reply onto the newest message we have from them, so it lands
    // in the right conversation in their mail client rather than as a new one.
    const { data: last } = await db
      .from("email_messages")
      .select("message_id")
      .eq("thread_id", data.thread_id)
      .eq("direction", "inbound")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const subject = /^re\s*:/i.test(thread.subject) ? thread.subject : `Re: ${thread.subject}`;

    const html = `<div style="color:#0c0d0e;font:400 15px/1.6 system-ui,-apple-system,Segoe UI,sans-serif">${escapeHtml(
      data.body,
    ).replace(/\n/g, "<br>")}</div>`;

    const resendId = await sendEmail({
      to: thread.participant_email,
      subject,
      html,
      text: data.body,
      from: MAILBOX,
      replyTo: parseAddress(MAILBOX).email,
      inReplyTo: last?.message_id ?? undefined,
    });

    if (!resendId) {
      throw new Error("Resend would not accept that message. Check the domain is verified.");
    }

    const { error: insertError } = await db.from("email_messages").insert({
      thread_id: data.thread_id,
      direction: "outbound",
      from_email: parseAddress(MAILBOX).email,
      from_name: parseAddress(MAILBOX).name || null,
      to_email: thread.participant_email,
      subject,
      body_text: data.body,
      body_html: html,
      message_id: `resend:${resendId}`,
    });

    if (insertError) throw new Error(insertError.message);

    // Answering is what moves a conversation off the waiting pile.
    await db.from("email_threads").update({ status: "in_progress" }).eq("id", data.thread_id);

    return { ok: true as const };
  });
