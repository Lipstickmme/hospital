import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

type StaffCheckClient = {
  rpc: (
    fn: "has_role",
    args: { _user_id: string; _role: "admin" | "staff" | "user" },
  ) => PromiseLike<{ data: unknown }>;
};

async function assertStaff(supabase: StaffCheckClient, userId: string) {
  const [{ data: isAdmin }, { data: isStaff }] = await Promise.all([
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
    supabase.rpc("has_role", { _user_id: userId, _role: "staff" }),
  ]);
  if (!isAdmin && !isStaff) throw new Error("Forbidden");
  return { isAdmin: Boolean(isAdmin) };
}

export const getStaffAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data: isAdmin }, { data: isStaff }] = await Promise.all([
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "staff" }),
    ]);
    return { isAdmin: Boolean(isAdmin), isStaff: Boolean(isStaff) };
  });

export const listConversations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("conversations")
      .select("id, kind, status, visitor_name, visitor_email, visitor_phone, subject, created_at, last_message_at")
      .order("last_message_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const { data: messages, error } = await context.supabase
      .from("conversation_messages")
      .select("id, sender, body, created_at, email_sent")
      .eq("conversation_id", data.id)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return messages ?? [];
  });

export const replyToConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), message: z.string().trim().min(1).max(4000) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);

    const { data: conversation, error: convError } = await context.supabase
      .from("conversations")
      .select("id, visitor_name, visitor_email, subject")
      .eq("id", data.id)
      .single();
    if (convError || !conversation) throw new Error("Conversation not found");

    const { sendMail, basicEmail, escapeHtml } = await import("./mailer.server");
    const mail = await sendMail({
      to: conversation.visitor_email,
      subject: `Re: ${conversation.subject} — Lifewell Medical Center Athens`,
      html: basicEmail(`Hello ${conversation.visitor_name}`, [
        escapeHtml(data.message).replace(/\n/g, "<br />"),
        "You can reply to this email and we will get back to you.",
      ]),
    });

    const { error } = await context.supabase.from("conversation_messages").insert({
      conversation_id: conversation.id,
      sender: "staff",
      author_id: context.userId,
      body: data.message,
      email_sent: mail.sent,
    });
    if (error) throw new Error(error.message);

    await context.supabase
      .from("conversations")
      .update({ status: "pending", last_message_at: new Date().toISOString() })
      .eq("id", conversation.id);

    return { ok: true as const, emailed: mail.sent };
  });

export const setConversationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["open", "pending", "closed"]) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("conversations")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const listBookings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const setBookingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["new", "confirmed", "cancelled", "completed"]),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);

    const { data: booking, error: bookingError } = await context.supabase
      .from("bookings")
      .select("id, patient_name, email, service, preferred_date, preferred_time")
      .eq("id", data.id)
      .single();
    if (bookingError || !booking) throw new Error("Booking not found");

    const { error } = await context.supabase
      .from("bookings")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    if (data.status === "confirmed" || data.status === "cancelled") {
      const { sendMail, basicEmail, escapeHtml } = await import("./mailer.server");
      await sendMail({
        to: booking.email,
        subject:
          data.status === "confirmed"
            ? "Your appointment is confirmed — Lifewell Medical Center Athens"
            : "Your appointment request — Lifewell Medical Center Athens",
        html: basicEmail(`Hello ${booking.patient_name}`, [
          data.status === "confirmed"
            ? `Your appointment for <strong>${escapeHtml(booking.service)}</strong> on ${escapeHtml(booking.preferred_date)} at ${escapeHtml(booking.preferred_time)} is confirmed.`
            : `Unfortunately we could not keep your requested slot on ${escapeHtml(booking.preferred_date)}. Please reply to this email and we will find a new time.`,
        ]),
      });
    }

    return { ok: true as const };
  });
