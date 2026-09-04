// GET /api/health — reports whether the backend is wired up.
//
// Dispatched from src/server.ts. A misconfigured deploy is diagnosed here
// without reading function logs.
//
// `missing` names the variables as they should be set in Vercel, not the
// internal aliases src/lib/env.server.ts fills in, so the answer is directly
// actionable.

export async function handleHealthCheck(request: Request): Promise<Response> {
  const pick = (names: string[]): string => {
    for (const name of names) {
      const value = process.env[name];
      if (value) return value;
    }
    return "";
  };

  const supabaseUrl = pick(["SUPABASE_URL", "VITE_SUPABASE_URL"]);
  const serviceRoleKey = pick(["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY"]);
  const anonKey = pick([
    "SUPABASE_ANON_KEY",
    "VITE_SUPABASE_ANON_KEY",
    "SUPABASE_PUBLISHABLE_KEY",
    "VITE_SUPABASE_PUBLISHABLE_KEY",
  ]);
  const resendKey = process.env["RESEND_API_KEY"] ?? "";
  const webhookSecret = process.env["RESEND_WEBHOOK_SECRET"] ?? "";
  const forwardTo = process.env["FORWARD_TO"] ?? "";
  const domain = process.env["MAIL_DOMAIN"] ?? "lifewellmedicalcenter.example";
  const mailbox = process.env["MAILBOX_ADDRESS"] ?? `Lifewell Medical <contact@${domain}>`;
  const formTo = process.env["FORM_TO"] ?? `contact@${domain}`;
  const formFrom = process.env["FORM_FROM"] ?? `Lifewell Website <website@${domain}>`;

  const missing = [
    !supabaseUrl && "VITE_SUPABASE_URL",
    !anonKey && "VITE_SUPABASE_ANON_KEY",
    !serviceRoleKey && "SUPABASE_SERVICE_ROLE_KEY",
  ].filter(Boolean) as string[];

  const inboundReady = Boolean(webhookSecret);

  let webhookSecretUsable: string | null = null;
  if (webhookSecret) {
    const trimmed = webhookSecret.trim();
    try {
      const decoded = atob(trimmed.replace(/^whsec_/, ""));
      webhookSecretUsable =
        decoded.length >= 16
          ? "yes"
          : `no, decodes to only ${decoded.length} bytes, looks truncated`;
      if (trimmed !== webhookSecret) {
        webhookSecretUsable += " (had surrounding whitespace, which is trimmed)";
      }
      if (!/^whsec_/.test(trimmed)) {
        webhookSecretUsable += " (no whsec_ prefix, check it was copied whole)";
      }
    } catch {
      webhookSecretUsable = "no, not valid base64 after the whsec_ prefix. Re-copy it from Resend.";
    }
  }

  const forwardLoops =
    Boolean(forwardTo) &&
    [mailbox, formTo, formFrom].some((value) => {
      const valueDomain = value.match(/@([^\s>]+)/)?.[0] ?? "";
      const forwardDomain = forwardTo.match(/@([^\s>]+)/)?.[0] ?? "x";
      return valueDomain.toLowerCase() === forwardDomain.toLowerCase();
    });

  let resendKeyCanRead: string | null = null;
  if (new URL(request.url).searchParams.has("probe") && resendKey) {
    try {
      const probe = await fetch("https://api.resend.com/emails/receiving?limit=1", {
        headers: { Authorization: `Bearer ${resendKey}` },
      });
      resendKeyCanRead = probe.ok
        ? "yes"
        : `no, HTTP ${probe.status}: ${(await probe.text()).slice(0, 160)}`;
    } catch (error) {
      resendKeyCanRead = `could not reach Resend: ${String(error).slice(0, 120)}`;
    }
  }

  return new Response(
    JSON.stringify(
      {
        ready: missing.length === 0,
        servedFrom: request.headers.get("host") ?? null,
        missing,
        supabaseUrl: supabaseUrl || null,
        supabaseAnonKey: Boolean(anonKey),
        supabaseServiceRoleKey: Boolean(serviceRoleKey),
        resendApiKey: Boolean(resendKey),
        resendKeyCanReadInbound: resendKeyCanRead ?? "not checked. Add ?probe=1 to test it",
        inboundEmail: inboundReady ? "configured" : "not configured (optional)",
        webhookSecretUsable: webhookSecretUsable ?? "no secret set",
        inboundForwardCopyTo: forwardTo || null,
        mailbox,
        formTo,
        formFrom,
        warning: forwardLoops
          ? "FORWARD_TO is one of this site's own addresses. Forwarding would loop mail back into the inbound webhook. Set it to a mailbox on another domain, or leave it unset."
          : null,
      },
      null,
      2,
    ),
    {
      status: missing.length === 0 ? 200 : 503,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    },
  );
}
