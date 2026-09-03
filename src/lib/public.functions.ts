import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(5).max(4000),
});

const bookingSchema = z.object({
  patientName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(5).max(40),
  service: z.string().trim().min(2).max(120),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  preferredTime: z.string().trim().min(2).max(40),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

const startChatSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(2).max(2000),
});

const tokenSchema = z.object({ token: z.string().trim().min(20).max(120) });

const visitorReplySchema = tokenSchema.extend({
  message: z.string().trim().min(1).max(2000),
});

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => contactSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendMail, basicEmail, escapeHtml, getStaffInbox } = await import("./mailer.server");

    const { data: conversation, error } = await supabaseAdmin
      .from("conversations")
      .insert({
        kind: "contact",
        visitor_name: data.name,
        visitor_email: data.email,
        visitor_phone: data.phone || null,
        subject: data.subject,
      })
      .select("id, access_token")
      .single();
    if (error || !conversation) throw new Error("Could not save your message. Please try again.");

    const { error: messageError } = await supabaseAdmin.from("conversation_messages").insert({
      conversation_id: conversation.id,
      sender: "visitor",
      body: data.message,
    });
    if (messageError) throw new Error("Could not save your message. Please try again.");

    const staffInbox = getStaffInbox();
    if (staffInbox) {
      await sendMail({
        to: staffInbox,
        replyTo: data.email,
        subject: `New enquiry: ${data.subject}`,
        html: basicEmail("New enquiry received", [
          `<strong>${escapeHtml(data.name)}</strong> (${escapeHtml(data.email)})`,
          data.phone ? `Phone: ${escapeHtml(data.phone)}` : "",
          escapeHtml(data.message),
        ].filter(Boolean)),
      });
    }

    await sendMail({
      to: data.email,
      subject: "We received your message — Lifewell Medical Center Athens",
      html: basicEmail(`Thanks, ${data.name}`, [
        "Our care team has your message and will reply by email shortly.",
        `<em>${escapeHtml(data.subject)}</em>`,
      ]),
    });

    return { ok: true as const, token: conversation.access_token };
  });

export const submitBooking = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => bookingSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendMail, basicEmail, escapeHtml, getStaffInbox } = await import("./mailer.server");

    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .insert({
        patient_name: data.patientName,
        email: data.email,
        phone: data.phone,
        service: data.service,
        preferred_date: data.preferredDate,
        preferred_time: data.preferredTime,
        notes: data.notes || null,
      })
      .select("id")
      .single();
    if (error || !booking) throw new Error("Could not save your booking. Please try again.");

    const staffInbox = getStaffInbox();
    if (staffInbox) {
      await sendMail({
        to: staffInbox,
        replyTo: data.email,
        subject: `New booking request — ${data.service}`,
        html: basicEmail("New booking request", [
          `<strong>${escapeHtml(data.patientName)}</strong> (${escapeHtml(data.email)}, ${escapeHtml(data.phone)})`,
          `Service: ${escapeHtml(data.service)}`,
          `Preferred: ${escapeHtml(data.preferredDate)} at ${escapeHtml(data.preferredTime)}`,
          data.notes ? escapeHtml(data.notes) : "",
        ].filter(Boolean)),
      });
    }

    await sendMail({
      to: data.email,
      subject: "Your appointment request — Lifewell Medical Center Athens",
      html: basicEmail(`Thanks, ${data.patientName}`, [
        `We received your request for <strong>${escapeHtml(data.service)}</strong> on ${escapeHtml(data.preferredDate)} at ${escapeHtml(data.preferredTime)}.`,
        "Our team will confirm your slot by email shortly.",
      ]),
    });

    return { ok: true as const, id: booking.id };
  });

export const startChat = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => startChatSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendMail, basicEmail, escapeHtml, getStaffInbox } = await import("./mailer.server");

    const { data: conversation, error } = await supabaseAdmin
      .from("conversations")
      .insert({
        kind: "chat",
        visitor_name: data.name,
        visitor_email: data.email,
        subject: "Live chat",
      })
      .select("id, access_token")
      .single();
    if (error || !conversation) throw new Error("Could not start the chat. Please try again.");

    await supabaseAdmin.from("conversation_messages").insert({
      conversation_id: conversation.id,
      sender: "visitor",
      body: data.message,
    });

    const staffInbox = getStaffInbox();
    if (staffInbox) {
      await sendMail({
        to: staffInbox,
        replyTo: data.email,
        subject: `New live chat from ${data.name}`,
        html: basicEmail("New live chat", [
          `<strong>${escapeHtml(data.name)}</strong> (${escapeHtml(data.email)})`,
          escapeHtml(data.message),
        ]),
      });
    }

    return { ok: true as const, token: conversation.access_token };
  });

export const sendVisitorMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => visitorReplySchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendMail, basicEmail, escapeHtml, getStaffInbox } = await import("./mailer.server");

    const { data: conversation } = await supabaseAdmin
      .from("conversations")
      .select("id, visitor_name, visitor_email")
      .eq("access_token", data.token)
      .maybeSingle();
    if (!conversation) throw new Error("This chat is no longer available.");

    const { error } = await supabaseAdmin.from("conversation_messages").insert({
      conversation_id: conversation.id,
      sender: "visitor",
      body: data.message,
    });
    if (error) throw new Error("Could not send your message. Please try again.");

    await supabaseAdmin
      .from("conversations")
      .update({ status: "open", last_message_at: new Date().toISOString() })
      .eq("id", conversation.id);

    const staffInbox = getStaffInbox();
    if (staffInbox) {
      await sendMail({
        to: staffInbox,
        replyTo: conversation.visitor_email,
        subject: `New chat message from ${conversation.visitor_name}`,
        html: basicEmail("New chat message", [escapeHtml(data.message)]),
      });
    }

    return { ok: true as const };
  });

export const getChatThread = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: conversation } = await supabaseAdmin
      .from("conversations")
      .select("id, visitor_name, status, subject")
      .eq("access_token", data.token)
      .maybeSingle();
    if (!conversation) return null;

    const { data: messages } = await supabaseAdmin
      .from("conversation_messages")
      .select("id, sender, body, created_at")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true });

    return {
      status: conversation.status,
      visitorName: conversation.visitor_name,
      messages: messages ?? [],
    };
  });
