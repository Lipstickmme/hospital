import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bus,
  Car,
  Check,
  ChevronDown,
  Clock,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Train,
} from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/Sections";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { TiltCard } from "@/components/site/TiltCard";
import { useFormSubmit } from "@/hooks/useFormSubmit";
import { images } from "@/data/images";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | Lifewell Medical Center Athens" },
      {
        name: "description",
        content:
          "Call, message or visit Lifewell Medical Center Athens. Our care team answers enquiries in person, usually within a few hours.",
      },
      { property: "og:title", content: "Contact Lifewell Medical Center Athens" },
      {
        property: "og:description",
        content:
          "Emergency desk open 24/7, outpatient enquiries Mon-Sat. Send a message and a real person replies.",
      },
    ],
  }),
  component: ContactPage,
});

const channels = [
  {
    icon: Phone,
    title: "Call us",
    lines: ["+30-21-1234-7377", "Emergency desk, 24 hours"],
    href: "tel:+302111234737",
    action: "Call now",
  },
  {
    icon: Mail,
    title: "Email us",
    lines: ["care@lifewellathens.gr", "Replied within one working day"],
    href: "mailto:care@lifewellathens.gr",
    action: "Write to us",
  },
  {
    icon: MapPin,
    title: "Visit us",
    lines: ["Leoforos Kifisias 42", "Athens 115 26, Greece"],
    href: "https://maps.google.com/?q=Leoforos+Kifisias+42+Athens",
    action: "Get directions",
  },
  {
    icon: Clock,
    title: "Opening hours",
    lines: ["Emergency, always open", "Clinics Mon-Sat, 08:00-20:00"],
    href: "#enquiry",
    action: "Send a message",
  },
];

const departments = [
  "General enquiry",
  "Book an appointment",
  "Immediate Care",
  "Diagnostic Imaging",
  "Surgery & Theatres",
  "Occupational Health",
  "Maternity & Paediatrics",
  "Cardiology",
  "Billing and insurance",
  "Feedback or a complaint",
];

const gettingHere = [
  {
    icon: Train,
    title: "By metro",
    body: "Line 3 to Ambelokipi, then a six-minute walk north along Kifisias. The entrance is signposted from the station.",
  },
  {
    icon: Bus,
    title: "By bus",
    body: "Routes 550, A5 and X14 stop directly outside. The stop is announced as Lifewell Medical Center.",
  },
  {
    icon: Car,
    title: "By car",
    body: "Underground parking beneath the building, free for the first three hours with a validated ticket from reception.",
  },
];

const faqs = [
  {
    q: "Do I need a referral to be seen?",
    a: "No. You can book directly into any of our outpatient clinics, and the emergency department never requires one. If your insurer asks for a referral we can usually arrange it on the day.",
  },
  {
    q: "How quickly will somebody reply to this form?",
    a: "It reaches the care team's dashboard immediately and is usually answered the same working day. If it is urgent, please call the desk instead, because the form is not monitored overnight.",
  },
  {
    q: "Can I get my results sent to my own doctor?",
    a: "Yes, and we do it by default. Tell us your GP's details in the message and results go to both of you at the same time rather than one after the other.",
  },
  {
    q: "Do you work with insurers?",
    a: "We invoice all the major Greek and international insurers directly. Bring your policy number to reception and we will confirm cover before anything is booked.",
  },
  {
    q: "Is there somebody who speaks English?",
    a: "Our clinicians consult in Greek and English, and we can arrange an interpreter for other languages with a day's notice.",
  },
];

const inputClass =
  "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/25";

function ContactPage() {
  const { state, error, submit, reset } = useFormSubmit({ kind: "enquiry" });
  const sending = state === "sending";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <PageHero
          crumb="Contact Us"
          eyebrow="Talk to us"
          title={
            <>
              A real person reads <br className="hidden sm:block" />
              every message
            </>
          }
          image={images.contactBanner}
        >
          <p>
            Whatever you send here lands on the care team's dashboard, not in an autoresponder. Tell
            us what you need and we will tell you plainly what happens next.
          </p>
        </PageHero>

        {/* Channels */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {channels.map((c, i) => (
              <Reveal key={c.title} delay={i * 90}>
                <TiltCard className="glass group flex h-full flex-col rounded-4xl p-7">
                  <span
                    className="grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground transition-transform duration-500 group-hover:scale-110"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <c.icon className="h-5 w-5" />
                  </span>
                  <h2 className="mt-5 text-lg">{c.title}</h2>
                  <div className="mt-3 flex-1 space-y-1 text-sm leading-relaxed text-muted-foreground">
                    {c.lines.map((l) => (
                      <p key={l}>{l}</p>
                    ))}
                  </div>
                  <a
                    href={c.href}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
                  >
                    {c.action}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Enquiry form */}
        <section
          id="enquiry"
          className="scroll-mt-28 border-y border-border/60 bg-secondary/40 py-20 sm:py-28"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-14">
              <Reveal>
                {state === "sent" ? (
                  <div className="glass rounded-4xl p-8 text-center sm:p-12">
                    <span
                      className="mx-auto grid h-14 w-14 place-items-center rounded-2xl text-primary-foreground"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      <Check className="h-6 w-6" />
                    </span>
                    <h2 className="mt-6 text-2xl">Thank you, that has reached the care team.</h2>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                      We have emailed you a confirmation. If you would rather not wait, open the chat
                      in the bottom-right corner and somebody will pick it up live.
                    </p>
                    <button type="button" onClick={reset} className="btn-glass mt-8">
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={submit} className="glass rounded-4xl p-6 sm:p-10">
                    <SectionHeading
                      eyebrow="Send a message"
                      title="Tell us what you need"
                      lede="Everything except the phone number is required. We only ask for what we need to answer you properly."
                    />

                    {/* Honeypot: real users never fill a field they cannot see. */}
                    <input
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      className="hidden"
                      aria-hidden="true"
                    />

                    <div className="mt-8 grid gap-5 sm:grid-cols-2">
                      <label className="block text-sm">
                        <span className="mb-1.5 block font-medium">Full name</span>
                        <input
                          required
                          name="name"
                          autoComplete="name"
                          placeholder="Maria Papadopoulou"
                          className={inputClass}
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="mb-1.5 block font-medium">Email</span>
                        <input
                          required
                          type="email"
                          name="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          className={inputClass}
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="mb-1.5 block font-medium">
                          Phone <span className="font-normal text-muted-foreground">(optional)</span>
                        </span>
                        <input
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          placeholder="+30 …"
                          className={inputClass}
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="mb-1.5 block font-medium">What is it about?</span>
                        <div className="relative">
                          <select
                            required
                            name="subject"
                            defaultValue=""
                            className={`${inputClass} appearance-none pr-10`}
                          >
                            <option value="" disabled>
                              Choose a department
                            </option>
                            {departments.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        </div>
                      </label>
                    </div>

                    <label className="mt-5 block text-sm">
                      <span className="mb-1.5 block font-medium">Your message</span>
                      <textarea
                        required
                        name="scope"
                        rows={7}
                        placeholder="Describe your symptoms, the appointment you need, or the question you have. Please do not include anything you would not want sent by email."
                        className={`${inputClass} resize-none`}
                      />
                    </label>

                    {error && (
                      <p role="alert" className="mt-4 text-sm text-destructive">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={sending}
                      className="btn-glass mt-7 w-full justify-center py-3.5 disabled:opacity-70"
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {sending ? "Sending…" : "Send to the care team"}
                      {!sending && <ArrowRight className="h-4 w-4" />}
                    </button>

                    <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      Sent over an encrypted connection and stored on our own systems. We never pass
                      your details to anyone outside the hospital.
                    </p>
                  </form>
                )}
              </Reveal>

              <div className="space-y-6">
                <Reveal delay={90}>
                  <TiltCard className="glass rounded-4xl p-7">
                    <h3 className="text-lg">What happens next</h3>
                    <ol className="mt-5 space-y-4">
                      {[
                        "Your message appears on the care team's dashboard straight away.",
                        "A coordinator reads it and routes it to the right department.",
                        "You get a reply by email, usually the same working day.",
                      ].map((t, i) => (
                        <li key={t} className="flex gap-3 text-sm leading-relaxed">
                          <span
                            className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[0.7rem] font-semibold text-primary-foreground"
                            style={{ background: "var(--gradient-primary)" }}
                          >
                            {i + 1}
                          </span>
                          <span className="text-muted-foreground">{t}</span>
                        </li>
                      ))}
                    </ol>
                  </TiltCard>
                </Reveal>

                <Reveal delay={160}>
                  <TiltCard
                    className="gradient-drift relative overflow-hidden rounded-4xl p-7 text-primary-foreground"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <MessageSquare className="float-soft absolute -right-4 -bottom-4 h-28 w-28 text-primary-foreground/15" />
                    <h3 className="relative text-lg">Need an answer now?</h3>
                    <p className="relative mt-3 text-sm leading-relaxed text-primary-foreground/85">
                      Open the chat in the bottom-right corner and a member of staff will answer live
                      during clinic hours. Out of hours, call the emergency desk.
                    </p>
                    <a href="tel:+302111234737" className="btn-glass-light relative mt-6 w-full">
                      <Phone className="h-4 w-4" />
                      Call the desk
                    </a>
                  </TiltCard>
                </Reveal>

                <Reveal delay={220}>
                  <TiltCard className="glass rounded-4xl p-7">
                    <h3 className="text-lg">In an emergency</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      For chest pain, difficulty breathing, severe bleeding or loss of consciousness,
                      call <strong className="font-semibold text-foreground">166</strong> for an
                      ambulance. Do not wait for a reply to this form.
                    </p>
                  </TiltCard>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* Getting here */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <SectionHeading
              eyebrow="Finding us"
              title="Getting here"
              lede="We are on Leoforos Kifisias, five minutes from Ambelokipi metro, with parking underneath the building."
            />
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {gettingHere.map((g, i) => (
              <Reveal key={g.title} delay={i * 100}>
                <TiltCard className="glass group h-full rounded-4xl p-7">
                  <span
                    className="grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground transition-transform duration-500 group-hover:scale-110"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <g.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-base">{g.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{g.body}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <a
              href="https://maps.google.com/?q=Leoforos+Kifisias+42+Athens"
              target="_blank"
              rel="noreferrer"
              className="btn-glass mt-10"
            >
              <MapPin className="h-4 w-4" />
              Open in maps
              <ArrowRight className="h-4 w-4" />
            </a>
          </Reveal>
        </section>

        {/* FAQ */}
        <section className="border-t border-border/60 bg-secondary/40 py-20 sm:py-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <Reveal>
              <SectionHeading
                align="center"
                eyebrow="Before you write"
                title="The things people ask most"
              />
            </Reveal>

            <div className="mt-12 space-y-4">
              {faqs.map((f, i) => (
                <Reveal key={f.q} delay={i * 70}>
                  <details className="glass hover-lift group rounded-3xl p-6 [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium sm:text-base">
                      {f.q}
                      <ChevronDown className="h-4 w-4 shrink-0 text-primary transition-transform duration-300 group-open:rotate-180" />
                    </summary>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                  </details>
                </Reveal>
              ))}
            </div>

            <Reveal delay={200}>
              <p className="mt-10 text-center text-sm text-muted-foreground">
                Still not covered?{" "}
                <a href="#enquiry" className="font-medium text-primary hover:underline">
                  Send us the question
                </a>{" "}
                or{" "}
                <Link to="/services" className="font-medium text-primary hover:underline">
                  read about the departments
                </Link>
                .
              </p>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
