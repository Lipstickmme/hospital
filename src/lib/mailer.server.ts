// Server-only email helper.
//
// Emails are sent through Lovable's managed email delivery. Until a sending
// domain is verified for this project, sendMail() logs the message and reports
// `skipped: true` so message/booking capture never fails because of email.
//
// Once the email domain is configured, this helper is swapped to use the
// generated transactional-email send helper.

type MailInput = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export type MailResult = { sent: boolean; skipped?: boolean; error?: string };

export function getStaffInbox(): string | undefined {
  return process.env["STAFF_NOTIFICATION_EMAIL"];
}

export async function sendMail(input: MailInput): Promise<MailResult> {
  // TODO: replaced with the generated transactional-email send helper once the
  // project's sending domain is verified.
  console.warn(
    `[mail] delivery not configured yet — would send "${input.subject}" to ${input.to}`,
  );
  return { sent: false, skipped: true };
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function basicEmail(title: string, bodyLines: string[]): string {
  const paragraphs = bodyLines
    .map((line) => `<p style="margin:0 0 12px;line-height:1.6;color:#0f172a">${line}</p>`)
    .join("");
  return `<div style="font-family:Geist,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px">
    <h2 style="margin:0 0 16px;color:#0b3f7a">${escapeHtml(title)}</h2>
    ${paragraphs}
    <p style="margin-top:24px;font-size:12px;color:#64748b">Lifewell Medical Center Athens</p>
  </div>`;
}
