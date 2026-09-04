import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// The only path from the public site into the form tables. The browser can
// never write to `enquiries` or `bookings` directly: RLS grants those tables
// to admins only, and this route writes with the service role. A leaked anon
// key therefore cannot be used to stuff the inbox, and the Resend key never
// reaches the client at all.
//
// Chat rows are written by the widget itself using the visitor's anon auth,
// so this route only raises the flag by email for the "chat" kind.

const enquirySchema = z.object({
  kind: z.literal("enquiry"),
  payload: z.object({
    name: z.string().trim().min(2).max(120),
    company: z.string().trim().max(160).optional().or(z.literal("")),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    subject: z.string().trim().max(160).optional().or(z.literal("")),
    scope: z.string().trim().min(5).max(5000),
    /** Honeypot: real users never fill a field they cannot see. */
    website: z.string().max(200).optional(),
  }),
});

const bookingSchema = z.object({
  kind: z.literal("booking"),
  payload: z.object({
    patientName: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().min(5).max(40),
    service: z.string().trim().min(2).max(120),
    preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    preferredTime: z.string().trim().min(2).max(40),
    notes: z.string().trim().max(2000).optional().or(z.literal("")),
    website: z.string().max(200).optional(),
  }),
});

const chatNotifySchema = z.object({
  kind: z.literal("chat"),
  payload: z.object({
    session_id: z.string().trim().min(1).max(64),
    name: z.string().trim().max(120).optional().or(z.literal("")),
    email: z.string().trim().max(254).optional().or(z.literal("")),
    message: z.string().trim().max(4000),
  }),
});

const inputSchema = z.discriminatedUnion("kind", [enquirySchema, bookingSchema, chatNotifySchema]);

export const submitForm = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const {
      adminClient,
      emailBody,
      FORM_TO,
      isEmail,
      sendEmail,
      SERVICE_ROLE_KEY,
      SUPABASE_URL,
      text,
    } = await import("./_shared.server");

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      console.error("Supabase server credentials are missing");
      throw new Error("The form is not available right now.");
    }

    // Honeypot handling for kinds that carry one.
    if ("website" in data.payload && text(data.payload.website, 200)) {
      return { ok: true as const };
    }

    const db = adminClient();

    if (data.kind === "enquiry") {
      const record = {
        name: data.payload.name,
        company: data.payload.company || null,
        email: data.payload.email,
        phone: data.payload.phone || null,
        subject: data.payload.subject || null,
        scope: data.payload.scope,
      };

      const { error } = await db.from("enquiries").insert(record);
      if (error) throw new Error(error.message);

      await sendEmail({
        to: FORM_TO,
        subject: `New enquiry: ${record.name}${record.company ? ` (${record.company})` : ""}`,
        html: emailBody([
          ["Name", record.name],
          ["Company", record.company ?? ""],
          ["Email", record.email],
          ["Phone", record.phone ?? ""],
          ["Subject", record.subject ?? ""],
          ["Scope", record.scope],
        ]),
        replyTo: record.email,
      });

      return { ok: true as const };
    }

    if (data.kind === "booking") {
      const record = {
        patient_name: data.payload.patientName,
        email: data.payload.email,
        phone: data.payload.phone,
        service: data.payload.service,
        preferred_date: data.payload.preferredDate,
        preferred_time: data.payload.preferredTime,
        notes: data.payload.notes || null,
      };

      const { data: booking, error } = await db
        .from("bookings")
        .insert(record)
        .select("id")
        .single();
      if (error || !booking) throw new Error("Could not save your booking.");

      await sendEmail({
        to: FORM_TO,
        subject: `New booking request: ${record.service}, ${record.patient_name}`,
        html: emailBody([
          ["Patient", record.patient_name],
          ["Email", record.email],
          ["Phone", record.phone],
          ["Service", record.service],
          ["Preferred", `${record.preferred_date} at ${record.preferred_time}`],
          ["Notes", record.notes ?? ""],
        ]),
        replyTo: record.email,
      });

      return { ok: true as const, id: booking.id };
    }

    // kind === "chat": rows are written by the widget under the visitor's
    // anon session (RLS enforces ownership), so this only raises the flag.
    const name = data.payload.name || "Website visitor";
    const email = data.payload.email;
    await sendEmail({
      to: FORM_TO,
      subject: `Live chat started: ${name}`,
      html: emailBody([
        ["Name", name],
        ["Email", email],
        ["First message", data.payload.message],
        ["Session", data.payload.session_id],
        ["Reply in", "Admin dashboard, Chat tab"],
      ]),
      replyTo: isEmail(email) ? email : undefined,
    });

    return { ok: true as const };
  });
