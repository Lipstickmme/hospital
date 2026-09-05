import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  ClipboardList,
  Clock,
  MessageSquare,
  Phone,
  Stethoscope,
} from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/Sections";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { TiltCard } from "@/components/site/TiltCard";
import { images } from "@/data/images";
import { services } from "@/data/services";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services & Specialties | Lifewell Medical Center Athens" },
      {
        name: "description",
        content:
          "Immediate care, diagnostic imaging, surgery, occupational health, maternity, paediatrics and cardiology — consultant-led, in one building in Athens.",
      },
      { property: "og:title", content: "Services & Specialties | Lifewell Medical Center Athens" },
      {
        property: "og:description",
        content:
          "Six consultant-led departments, on-site imaging and pathology, and an emergency department that never closes.",
      },
    ],
  }),
  component: ServicesPage,
});

const steps = [
  {
    icon: MessageSquare,
    title: "Tell us what is wrong",
    body: "Message us, call the desk, or simply walk into the emergency department. Nothing here needs a referral letter first.",
  },
  {
    icon: CalendarCheck,
    title: "We find you a slot",
    body: "Routine clinics run within a week. Anything we judge urgent is seen the same day, and we will say plainly which one you are.",
  },
  {
    icon: ClipboardList,
    title: "Tests happen the same visit",
    body: "Imaging and pathology are in the same building, so you rarely need to come back on another day for a scan or a blood test.",
  },
  {
    icon: Stethoscope,
    title: "A consultant explains it",
    body: "Results are gone through with you, written down, and sent to your GP. If you need treatment we book it before you leave.",
  },
];

function ServicesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <PageHero
          crumb="Services"
          eyebrow="Services & specialties"
          title={
            <>
              Six departments, <span className="whitespace-nowrap">one building</span>
            </>
          }
          image={images.servicesBanner}
        >
          <p>
            Imaging, theatres, maternity and the emergency department are minutes apart from each
            other — which is the difference between an answer today and an answer next week.
          </p>
        </PageHero>

        {/* Specialty grid */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <SectionHeading
              eyebrow="What we treat"
              title="Care that does not stop at the referral"
              lede="Every department below is consultant-led, with the same record, the same imaging and the same team behind it."
            />
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <Reveal key={s.slug} delay={i * 80}>
                <a href={`#${s.slug}`} className="block h-full">
                  <TiltCard className="glass group flex h-full flex-col rounded-4xl p-7">
                    <span
                      className="grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground transition-transform duration-500 group-hover:scale-110"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      <s.icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-5 text-lg">{s.title}</h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {s.summary}
                    </p>
                    <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-primary" />
                      {s.hours}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                      Read more
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </TiltCard>
                </a>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Detail rows */}
        <section className="border-t border-border/60 bg-secondary/40 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl space-y-20 px-4 sm:space-y-28 sm:px-6">
            {services.map((s, i) => {
              const flip = i % 2 === 1;
              return (
                <article key={s.slug} id={s.slug} className="scroll-mt-28">
                  <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
                    <Reveal className={flip ? "lg:order-2" : ""}>
                      <TiltCard className="glass overflow-hidden rounded-4xl p-2">
                        <img
                          src={s.image}
                          alt={s.title}
                          width={1280}
                          height={860}
                          loading="lazy"
                          className="h-64 w-full rounded-[1.75rem] object-cover sm:h-[26rem]"
                        />
                      </TiltCard>
                    </Reveal>

                    <Reveal delay={90} className={flip ? "lg:order-1" : ""}>
                      <div className="flex items-center gap-3">
                        <span
                          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-primary-foreground"
                          style={{ background: "var(--gradient-primary)" }}
                        >
                          <s.icon className="h-5 w-5" />
                        </span>
                        <p className="text-xs font-medium tracking-[0.22em] text-primary uppercase">
                          {s.hours}
                        </p>
                      </div>

                      <h2 className="mt-5 text-2xl sm:text-4xl">{s.title}</h2>
                      <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {s.body}
                      </p>

                      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                        {s.points.map((p, j) => (
                          <Reveal key={p} delay={120 + j * 70}>
                            <li className="glass hover-lift flex h-full items-start gap-3 rounded-2xl p-4 text-sm">
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              <span>{p}</span>
                            </li>
                          </Reveal>
                        ))}
                      </ul>

                      <div className="mt-8 flex flex-wrap gap-3">
                        <Link to="/contact" className="btn-glass">
                          Ask about {s.title.toLowerCase()}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                        <a href="tel:+302111234737" className="btn-glass-ghost">
                          <Phone className="h-4 w-4" />
                          Call the desk
                        </a>
                      </div>
                    </Reveal>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Process */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="What to expect"
              title="How a visit actually goes"
              lede="No referral letters, no chasing results, and nobody sending you across town for a scan."
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

        {/* Emergency band */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-28">
          <Reveal>
            <div
              className="gradient-drift relative overflow-hidden rounded-4xl px-6 py-12 text-primary-foreground sm:px-12 sm:py-16"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Clock className="float-soft absolute -right-8 -bottom-8 h-44 w-44 text-primary-foreground/15" />
              <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="min-w-0">
                  <p className="text-xs font-medium tracking-[0.22em] uppercase opacity-80">
                    If it cannot wait
                  </p>
                  <h2 className="mt-3 text-2xl sm:text-4xl">
                    The emergency department is open right now
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
                    Walk in at any hour without an appointment. For chest pain, difficulty breathing
                    or severe bleeding, call 166 for an ambulance first.
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-3">
                  <a href="tel:+302111234737" className="btn-glass-light px-8 py-4">
                    <Phone className="h-4 w-4" />
                    +30-21-1234-7377
                  </a>
                  <Link to="/contact" className="btn-glass-light px-8 py-4">
                    Message us
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
