// Server-only helpers shared by the /api server functions and route handlers.
//
// The naming (`.server.ts`) tells the TanStack Start bundler this module must
// not ship to the browser — it references process.env, service-role keys and
// the Resend API. Import lazily from server-fn/route handlers only.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** First non-empty environment variable from a list of accepted names. */
export function env(names: string[]): string {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return "";
}

export const SUPABASE_URL = env(["SUPABASE_URL", "VITE_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"]);

export const SUPABASE_ANON_KEY = env([
  "SUPABASE_ANON_KEY",
  "VITE_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_PUBLISHABLE_KEY",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
]);

export const SERVICE_ROLE_KEY = env(["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY"]);

export const RESEND_API_KEY = process.env["RESEND_API_KEY"] ?? "";

/**
 * The company domain, in one place.
 *
 * It must match the domain verified in Resend exactly. Sending from anything
 * else returns 403 "Domain not verified" and the mail never leaves. Overridable
 * so a change does not need a code edit, but the default is the source of
 * truth for every address below.
 */
export const DOMAIN = process.env["MAIL_DOMAIN"] ?? "lifewellmedicalcenter.example";

export const FORM_TO = process.env["FORM_TO"] ?? `contact@${DOMAIN}`;
export const FORM_FROM = process.env["FORM_FROM"] ?? `Lifewell Website <website@${DOMAIN}>`;
/** The address staff correspond from. Replies are sent as this. */
export const MAILBOX = process.env["MAILBOX_ADDRESS"] ?? `Lifewell Medical <contact@${DOMAIN}>`;
/** Svix signing secret from Resend → Webhooks. Starts `whsec_`. */
export const RESEND_WEBHOOK_SECRET = process.env["RESEND_WEBHOOK_SECRET"] ?? "";
/** Optional: every inbound message is also forwarded here as a safety copy. */
export const FORWARD_TO = process.env["FORWARD_TO"] ?? "";

/** Trim, cap and reject anything that is not a usable string. */
export function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function json(status: number, payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

/** Service-role client. Bypasses row level security, server side only. */
export function adminClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

/**
 * Compares two secrets without leaking their difference through timing.
 * `crypto.subtle.timingSafeEqual` is not available on the edge runtime, so
 * this walks both strings in full regardless of where they diverge.
 */
export function secretsMatch(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Verifies a Resend webhook, delivered through Svix.
 *
 * The signature covers `id.timestamp.rawBody`, so the body must be the exact
 * bytes received. Parsing to JSON first and re-serialising changes key order
 * and whitespace and the HMAC no longer matches.
 */
export async function verifyResendWebhook(
  rawBody: string,
  headers: Headers,
): Promise<{ ok: boolean; reason: string }> {
  const fail = (reason: string) => ({ ok: false, reason });

  if (!RESEND_WEBHOOK_SECRET) {
    return fail("RESEND_WEBHOOK_SECRET is not set on this deployment");
  }

  const id = headers.get("svix-id") ?? headers.get("webhook-id");
  const timestamp = headers.get("svix-timestamp") ?? headers.get("webhook-timestamp");
  const signatures = headers.get("svix-signature") ?? headers.get("webhook-signature");

  if (!id || !timestamp || !signatures) {
    const seen: string[] = [];
    headers.forEach((_value, name) => seen.push(name));
    return fail(
      "no signature headers under either the svix-* or webhook-* names. " +
        `Headers seen: ${seen.join(", ")}`,
    );
  }

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age)) return fail(`unparseable svix-timestamp: ${timestamp}`);
  if (age > 300) {
    return fail(
      `webhook is ${Math.round(age)}s old, outside the 300s window: ` +
        "either a replay, or this deployment's clock is wrong",
    );
  }

  const secret = RESEND_WEBHOOK_SECRET.trim().replace(/^whsec_/, "");

  let expected: string;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      Uint8Array.from(atob(secret), (character) => character.charCodeAt(0)),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const signed = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(`${id}.${timestamp}.${rawBody}`),
    );
    expected = btoa(String.fromCharCode(...new Uint8Array(signed)));
  } catch (error) {
    return fail(
      `RESEND_WEBHOOK_SECRET is not usable as a signing key: ${errorMessage(error)}. ` +
        "Re-copy it whole from Resend, including the whsec_ prefix and nothing else.",
    );
  }

  const matched = signatures
    .split(" ")
    .some((entry) => secretsMatch(entry.split(",")[1] ?? "", expected));

  return matched
    ? { ok: true, reason: "" }
    : fail(
        "signature did not match. The RESEND_WEBHOOK_SECRET in Vercel is not " +
          "the signing secret of the webhook that sent this",
      );
}

/**
 * Resolves the caller to a signed-in admin (or returns null).
 *
 * The bearer token is validated by Supabase Auth rather than decoded here, so
 * a forged or expired one fails, and admin membership is then read with the
 * service role. Both checks are server side; nothing trusts the browser.
 */
export async function requireAdmin(request: Request): Promise<string | null> {
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.toLowerCase().startsWith("bearer ")) return null;

  const asCaller = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authorization } },
  });

  const { data, error } = await asCaller.auth.getUser();
  if (error || !data.user || data.user.is_anonymous) return null;

  const { data: admin } = await adminClient()
    .from("admins")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  return admin ? data.user.id : null;
}

type SendOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  /** Message-ID of the message being answered, so clients thread the reply. */
  inReplyTo?: string;
};

/**
 * Hands a message to Resend. Returns its id, or null if it was not accepted.
 * Callers decide whether that is fatal. For notifications it is not: the
 * record is already stored and the dashboard is the source of truth.
 */
export async function sendEmail(options: SendOptions): Promise<string | null> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set; skipping send");
    return null;
  }

  const headers: Record<string, string> = {};
  if (options.inReplyTo) {
    headers["In-Reply-To"] = options.inReplyTo;
    headers["References"] = options.inReplyTo;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: options.from ?? FORM_FROM,
      to: [options.to],
      subject: options.subject,
      html: options.html,
      ...(options.text ? { text: options.text } : {}),
      ...(options.replyTo ? { reply_to: options.replyTo } : {}),
      ...(Object.keys(headers).length ? { headers } : {}),
    }),
  });

  if (!response.ok) {
    console.error("Resend rejected the message:", await response.text());
    return null;
  }

  const body = (await response.json()) as { id?: string };
  return body.id ?? null;
}

/** Renders a label/value table, skipping anything empty. */
export function emailBody(rows: Array<[string, string]>): string {
  const cells = rows
    .filter(([, value]) => value)
    .map(
      ([label, value]) =>
        `<tr>
           <td style="padding:6px 16px 6px 0;color:#5c6467;font:500 12px/1.5 system-ui;text-transform:uppercase;letter-spacing:.08em;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>
           <td style="padding:6px 0;color:#0c0d0e;font:400 15px/1.6 system-ui">${escapeHtml(value).replace(/\n/g, "<br>")}</td>
         </tr>`,
    )
    .join("");

  return `<table style="border-collapse:collapse">${cells}</table>`;
}

/**
 * Every address that belongs to us.
 *
 * Forwarding an inbound message to one of these would loop: the copy arrives
 * back at the same mailbox, fires the webhook again, and is forwarded again.
 */
export function ownAddresses(): Set<string> {
  return new Set(
    [MAILBOX, FORM_FROM, FORM_TO].map((value) => parseAddress(value).email).filter(Boolean),
  );
}

/** Readable text out of anything thrown, including Supabase's plain objects. */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const shaped = error as { message?: unknown; code?: unknown; details?: unknown };
    const parts = [shaped.code, shaped.message, shaped.details]
      .filter((part) => typeof part === "string" && part)
      .join(": ");
    if (parts) return parts;
    try {
      return JSON.stringify(error);
    } catch {
      return "unserialisable error";
    }
  }
  return String(error);
}

/** "Re: Re: Fwd: Site visit" → "Site visit", for matching replies to threads. */
export function normaliseSubject(subject: string): string {
  return subject.replace(/^((re|fw|fwd)\s*:\s*)+/i, "").trim() || "(no subject)";
}

/** Splits `Jane Roberts <jane@example.com>` into its parts. */
export function parseAddress(value: string): { name: string; email: string } {
  const match = value.match(/^\s*"?([^"<]*)"?\s*<([^>]+)>\s*$/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim().toLowerCase() };
  }
  return { name: "", email: value.trim().toLowerCase() };
}
