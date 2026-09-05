import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Baby,
  Check,
  Clock,
  Globe2,
  HeartPulse,
  Phone,
  PlaneTakeoff,
  Radio,
  ShieldPlus,
  Stethoscope,
  Users,
} from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { CtaBand, SiteFooter } from "@/components/site/Sections";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { TiltCard } from "@/components/site/TiltCard";
import { CountUp } from "@/components/site/CountUp";
import { images } from "@/data/images";

export const Route = createFileRoute("/medical-flight")({
  head: () => ({
    meta: [
      { title: "Medical Flight | Lifewell Medical Center Athens" },
      {
        name: "description",
        content:
          "Air ambulance and medical repatriation from Lifewell Medical Center Athens. Intensive-care transfer by fixed-wing aircraft and helicopter, crewed by our own retrieval consultants, 24 hours a day.",
      },
      { property: "og:title", content: "Medical Flight | Lifewell Medical Center Athens" },
      {
        property: "og:description",
        content:
          "Bedside to bedside intensive-care transfer across the islands, the mainland and Europe, coordinated from one desk that never closes.",
      },
    ],
  }),
  component: MedicalFlightPage,
});

const capabilities = [
  {
    icon: ShieldPlus,
    title: "Intensive care in the air",
    body: "Transport ventilators, syringe drivers, invasive monitoring and blood products, so a ventilated patient is looked after exactly as they were on the ward.",
  },
  {
    icon: Users,
    title: "Our own retrieval crew",
    body: "Every flight carries a retrieval consultant and a flight nurse from this hospital. Nobody is handed to a crew who has never met the case.",
  },
  {
    icon: Baby,
    title: "Neonatal and paediatric",
    body: "A transport incubator with its own ventilator and warming, escorted by the neonatal team, for babies who need a specialist unit fast.",
  },
  {
    icon: HeartPulse,
    title: "Cardiac and stroke pathways",
    body: "Direct handover into a catheter lab or stroke unit, with the receiving team briefed and waiting before the aircraft is on the ground.",
  },
  {
    icon: Globe2,
    title: "European repatriation",
    body: "Getting someone home after an illness or accident abroad, including the ground ambulance at both ends and the paperwork insurers ask for.",
  },
  {
    icon: Radio,
    title: "One coordination desk",
    body: "A single number, answered by a clinician, that stays with the case from the first call through to the handover at the receiving hospital.",
  },
];

const fleet = [
  {
    name: "Fixed-wing air ambulance",
    range: "Europe-wide",
    body: "A pressurised cabin configured as a single-patient intensive-care bay, for longer transfers and repatriation flights where cabin altitude matters clinically.",
    points: [
      "Stretcher loading without tilting the patient",
      "Oxygen and power for the full sector, plus reserve",
      "Room for a relative to travel alongside",
    ],
    image: images.flightCrew,
  },
  {
    name: "Helicopter retrieval",
    range: "Attica and the Aegean islands",
    body: "For island and mountain tasking where landing near the patient saves more time than anything that happens later, including transfers straight onto our own pad.",
    points: [
      "Scene and hospital-pad landings",
      "Winch-capable crew for difficult access",
      "Typically airborne within thirty minutes of tasking",
    ],
    image: images.flightMonitoring,
  },
];

const steps = [
  {
    icon: Phone,
    title: "One call starts it",
    body: "You, a hospital, or an insurer calls the flight desk. A retrieval consultant, not a call handler, picks up.",
  },
  {
    icon: Stethoscope,
    title: "Clinical assessment",
    body: "We speak to the treating team, read the notes and imaging, and decide honestly whether flying is the right thing at all.",
  },
  {
    icon: PlaneTakeoff,
    title: "Crew and aircraft go",
    body: "Aircraft, crew, equipment and landing permissions are arranged in parallel rather than one after another.",
  },
  {
    icon: Check,
    title: "Bedside to bedside",
    body: "The same crew stays with the patient from the sending ward to the receiving one, and calls the family once the handover is done.",
  },
];

const stats = [
  { to: 30, suffix: " min", label: "Typical time to airborne" },
  { to: 220, suffix: "+", label: "Transfers flown each year" },
  { to: 18, suffix: "", label: "Island airfields served" },
  { to: 24, suffix: "/7", label: "Flight desk staffed" },
];

function MedicalFlightPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <PageHero
          crumb="Medical Flight"
          eyebrow="Air ambulance & repatriation"
          title={
            <>
              When the distance is the <span className="whitespace-nowrap">emergency</span>
            </>
          }
          image={images.flightBanner}
        >
          <p>
            Some patients do not need a different treatment, they need a different hospital, and
            quickly. Our flight service moves them there with the same standard of care they would
            have had if they had never left the ward.
          </p>
        </PageHero>

        {/* Stats */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 90}>
                <TiltCard className="glass h-full rounded-4xl p-7 text-center">
                  <p className="text-3xl font-semibold text-primary sm:text-4xl">
                    <CountUp to={s.to} suffix={s.suffix} />
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">{s.label}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* What the service is */}
        <section className="border-t border-border/60 bg-secondary/40 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
              <Reveal>
                <TiltCard className="glass overflow-hidden rounded-4xl p-2">
                  <img
                    src={images.flightCrew}
                    alt="Retrieval consultant briefing colleagues before a transfer"
                    width={1280}
                    height={860}
                    loading="lazy"
                    className="h-64 w-full rounded-[1.75rem] object-cover sm:h-[26rem]"
                  />
                </TiltCard>
              </Reveal>

              <Reveal delay={90}>
                <SectionHeading
                  eyebrow="What we actually do"
                  title="An intensive care bed that happens to fly"
                  lede="A transfer is the most exposed part of a patient's care, because everything familiar is left behind. We plan it as a clinical episode in its own right, not as transport."
                />
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  We fly patients into Lifewell for treatment we can give and they cannot get
                  locally, out to specialist centres when someone else is better placed, and home
                  again once they are well enough to travel. The decision is always clinical first.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  If flying is not in a patient's interest we say so plainly, and help arrange the
                  road transfer or the local care that is.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a href="tel:+302111234737" className="btn-glass">
                    <Phone className="h-4 w-4" />
                    Flight desk, 24 hours
                  </a>
                  <Link to="/contact" hash="enquiry" className="btn-glass-ghost">
                    Send the case details
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <SectionHeading
              eyebrow="On board"
              title="What travels with the patient"
              lede="Everything below goes on every relevant tasking as standard, rather than being something you have to ask for."
            />
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((c, i) => (
              <Reveal key={c.title} delay={i * 80}>
                <TiltCard className="glass group flex h-full flex-col rounded-4xl p-7">
                  <span
                    className="grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground transition-transform duration-500 group-hover:scale-110"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <c.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg">{c.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {c.body}
                  </p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Fleet */}
        <section className="border-t border-border/60 bg-secondary/40 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl space-y-20 px-4 sm:space-y-28 sm:px-6">
            <Reveal>
              <SectionHeading
                align="center"
                eyebrow="How we get there"
                title="Two aircraft types, one crew standard"
                lede="Which one flies is a clinical and geographic decision, made on the call, not a menu you choose from."
              />
            </Reveal>

            {fleet.map((f, i) => {
              const flip = i % 2 === 1;
              return (
                <div key={f.name} className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
                  <Reveal className={flip ? "lg:order-2" : ""}>
                    <TiltCard className="glass overflow-hidden rounded-4xl p-2">
                      <img
                        src={f.image}
                        alt={f.name}
                        width={1280}
                        height={860}
                        loading="lazy"
                        className="h-64 w-full rounded-[1.75rem] object-cover sm:h-[24rem]"
                      />
                    </TiltCard>
                  </Reveal>

                  <Reveal delay={90} className={flip ? "lg:order-1" : ""}>
                    <p className="text-xs font-medium tracking-[0.22em] text-primary uppercase">
                      {f.range}
                    </p>
                    <h3 className="mt-4 text-2xl sm:text-3xl">{f.name}</h3>
                    <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {f.body}
                    </p>
                    <ul className="mt-8 grid gap-3">
                      {f.points.map((p, j) => (
                        <Reveal key={p} delay={120 + j * 70}>
                          <li className="glass hover-lift flex items-start gap-3 rounded-2xl p-4 text-sm">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span>{p}</span>
                          </li>
                        </Reveal>
                      ))}
                    </ul>
                  </Reveal>
                </div>
              );
            })}
          </div>
        </section>

        {/* Process */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Arranging a flight"
              title="From the first call to the handover"
              lede="Families and referring hospitals get the same process and the same phone number."
            />
          </Reveal>

          <div className="relative mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-16 right-10 left-10 hidden h-px lg:block"
              style={{
                background:
                  "repeating-linear-gradient(90deg, var(--color-border) 0 8px, transparent 8px 18px)",
              }}
            />
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 100}>
                <TiltCard className="glass relative h-full rounded-4xl p-7 text-center">
                  <span
                    className="mx-auto grid h-14 w-14 place-items-center rounded-2xl text-primary-foreground"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <s.icon className="h-6 w-6" />
                  </span>
                  <p className="mt-5 text-xs font-medium tracking-[0.22em] text-primary uppercase">
                    Step {i + 1}
                  </p>
                  <h3 className="mt-2 text-base">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Neonatal note + costs */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-28">
          <div className="grid gap-6 lg:grid-cols-3">
            <Reveal className="lg:col-span-2">
              <TiltCard className="glass h-full overflow-hidden rounded-4xl">
                <img
                  src={images.flightNeonatal}
                  alt="Neonatal nurse holding a newborn"
                  width={1280}
                  height={720}
                  loading="lazy"
                  className="h-56 w-full object-cover sm:h-72"
                />
                <div className="p-7 sm:p-9">
                  <h3 className="text-xl">Babies fly with their own team</h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    A neonatal transfer is not a small adult transfer. The transport incubator
                    carries its own ventilator, warming and monitoring, and the neonatal consultant
                    who stabilised the baby is the one who travels with them. Wherever the aircraft
                    and the family's seats allow it, a parent comes too.
                  </p>
                </div>
              </TiltCard>
            </Reveal>

            <Reveal delay={100}>
              <div
                className="gradient-drift relative flex h-full flex-col overflow-hidden rounded-4xl p-7 text-primary-foreground sm:p-9"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Clock className="float-soft absolute -right-6 -bottom-6 h-36 w-36 text-primary-foreground/15" />
                <div className="relative">
                  <h3 className="text-xl">Cost and insurance</h3>
                  <p className="mt-4 text-sm leading-relaxed text-primary-foreground/85">
                    Most flights are paid by a travel or health insurer, and we deal with them
                    directly. You will get a written quotation before anything is committed, and we
                    will tell you honestly if a road transfer would serve the patient just as well
                    for a fraction of the cost.
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-primary-foreground/85">
                    Clinical urgency is never held up while funding is sorted out.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <a href="tel:+302111234737" className="btn-glass-light">
                      <Phone className="h-4 w-4" />
                      Call the desk
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  );
}
