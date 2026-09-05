import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  Clock,
  HandHeart,
  Handshake,
  Microscope,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter, CtaBand } from "@/components/site/Sections";
import { PageHero, SectionHeading } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { TiltCard } from "@/components/site/TiltCard";
import { CountUp } from "@/components/site/CountUp";
import { images } from "@/data/images";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | Lifewell Medical Center Athens" },
      {
        name: "description",
        content:
          "Who we are, what we believe and how we work — the people, values and standards behind Lifewell Medical Center Athens.",
      },
      { property: "og:title", content: "About Lifewell Medical Center Athens" },
      {
        property: "og:description",
        content:
          "Consultant-led care, modern diagnostics and a 24/7 emergency department in the heart of Athens.",
      },
    ],
  }),
  component: AboutPage,
});

const stats = [
  { value: 32, suffix: "", label: "Years caring for Athens" },
  { value: 140, suffix: "+", label: "Doctors and nurses" },
  { value: 62, suffix: "k", label: "Patients seen each year" },
  { value: 24, suffix: "/7", label: "Emergency department" },
];

const values = [
  {
    icon: ShieldCheck,
    title: "Quality & safety",
    body: "Every pathway is audited against national standards, and every outcome is reviewed by the team that produced it. Where we fall short we publish it internally and fix the system, not the person.",
  },
  {
    icon: HandHeart,
    title: "Empathy",
    body: "We try to imagine what the person in front of us is going through, work to relieve suffering, and create some joy wherever it is possible to do so.",
  },
  {
    icon: Users,
    title: "Inclusion",
    body: "We deliberately build an environment of compassionate belonging, where patients and colleagues alike are valued, heard and respected whoever they are.",
  },
  {
    icon: Handshake,
    title: "Integrity",
    body: "Honesty, confidentiality and transparency are not policies here, they are the job. If we do not know the answer we will say so, and then go and find it.",
  },
  {
    icon: Microscope,
    title: "Evidence",
    body: "Treatment decisions follow the evidence rather than habit. Our clinicians teach, publish, and are given protected time to keep their practice current.",
  },
  {
    icon: Sparkles,
    title: "Continuity",
    body: "You should not have to repeat your story. One record follows you through imaging, theatre and clinic, and the consultant who admits you is the one who reviews you.",
  },
];

const timeline = [
  {
    year: "1993",
    title: "A single clinic in Kolonaki",
    body: "Four physicians opened a general practice with one X-ray room and a promise to see anyone who walked through the door.",
  },
  {
    year: "2004",
    title: "Emergency department opens",
    body: "The move to our present site brought a 24-hour emergency department, resuscitation bays and the first CT scanner in the district.",
  },
  {
    year: "2013",
    title: "Theatres and maternity",
    body: "Four laminar-flow theatres and a midwife-led birthing suite opened, with obstetric and neonatal cover on site around the clock.",
  },
  {
    year: "2021",
    title: "One record, one team",
    body: "Imaging, pathology and clinic notes were unified, so a result reaches whichever of our clinicians you see next without you carrying it.",
  },
  {
    year: "Today",
    title: "Care that keeps up",
    body: "MRI, rapid-access cardiology, occupational health and paediatrics — with a live chat and contact desk answered by real staff, not a script.",
  },
];

const facilities = [
  {
    image: images.aboutCare,
    title: "Wards and clinics",
    body: "Single rooms, daylight, and nursing ratios we publish rather than average away.",
  },
  {
    image: images.serviceDiagnostic,
    title: "Imaging suite",
    body: "MRI, CT and ultrasound reported on site by consultant radiologists.",
  },
  {
    image: images.aboutTheatre,
    title: "Operating theatres",
    body: "Four laminar-flow theatres with consultant anaesthetic cover at every list.",
  },
];

const accreditations = [
  "ISO 15189 accredited laboratories",
  "JCI-aligned patient safety programme",
  "EU Clinical Trials Regulation compliant",
  "Greek Ministry of Health licensed",
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <PageHero
          crumb="About Us"
          eyebrow="Who we are"
          title={
            <>
              Thirty-two years of looking after <br className="hidden sm:block" />
              the same city
            </>
          }
          image={images.aboutBanner}
        >
          <p>
            Lifewell began as four doctors and one X-ray room. It is now a consultant-led hospital
            with a 24-hour emergency department — and it is still run on the idea that the person in
            front of you matters more than the process around them.
          </p>
        </PageHero>

        {/* Stats */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 90}>
                <TiltCard className="glass h-full rounded-4xl p-6 text-center sm:p-8">
                  <p className="text-3xl font-semibold tracking-tight sm:text-5xl">
                    <span className="text-gradient">
                      <CountUp to={s.value} suffix={s.suffix} />
                    </span>
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {s.label}
                  </p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <div className="relative">
                <img
                  src={images.aboutStory}
                  alt="Nurses walking together through a hospital corridor"
                  width={1280}
                  height={960}
                  loading="lazy"
                  className="h-72 w-full rounded-4xl object-cover shadow-[var(--shadow-soft)] sm:h-[30rem]"
                />
                <div className="glass float-soft absolute -right-2 -bottom-6 max-w-[15rem] rounded-3xl p-5 sm:right-6">
                  <p className="text-sm font-semibold">Consultant-led, always</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    A senior clinician sees every patient who is admitted — including at three in the
                    morning.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={90}>
              <SectionHeading
                eyebrow="Our story"
                title={
                  <>
                    Built slowly, and <span className="text-gradient">on purpose</span>
                  </>
                }
                lede="We have grown one department at a time, and only once we could staff it properly. That is why the emergency department has never closed, and why the imaging you have at eight in the morning is reported before you go home."
              />
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                <p>
                  Athens does not lack hospitals. What it lacked, when we started, was somewhere that
                  would treat an anxious parent at midnight with the same seriousness as a scheduled
                  operation — and then tell them plainly what happens next.
                </p>
                <p>
                  That is still the whole of our strategy. Modern equipment matters, and we buy it.
                  But the thing patients tell us they remember is that somebody explained.
                </p>
              </div>
              <Link to="/services" className="btn-glass mt-8">
                See what we treat
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>
        </section>

        {/* Values */}
        <section className="border-y border-border/60 bg-secondary/40 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal>
              <SectionHeading
                align="center"
                eyebrow="What we believe"
                title="Six things we will not trade away"
                lede="These are not on a poster in reception. They are the criteria we hire against, and the ones we review ourselves by."
              />
            </Reveal>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {values.map((v, i) => (
                <Reveal key={v.title} delay={i * 80}>
                  <TiltCard className="glass group h-full rounded-4xl p-7">
                    <span
                      className="grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground transition-transform duration-500 group-hover:scale-110"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      <v.icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-5 text-lg">{v.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <SectionHeading
              eyebrow="How we got here"
              title="Three decades, one street"
              lede="Every step below was taken because a patient could not get something they needed nearby."
            />
          </Reveal>

          <ol className="relative mt-14 space-y-8 sm:space-y-10">
            <div
              aria-hidden="true"
              className="absolute top-2 bottom-2 left-[0.4375rem] w-px sm:left-[7.4375rem]"
              style={{
                background:
                  "linear-gradient(180deg, transparent, var(--color-border) 12%, var(--color-border) 88%, transparent)",
              }}
            />
            {timeline.map((t, i) => (
              <Reveal key={t.year} delay={i * 90}>
                <li className="relative grid gap-3 pl-8 sm:grid-cols-[7rem_auto_minmax(0,1fr)] sm:items-start sm:gap-6 sm:pl-0">
                  <span className="text-sm font-semibold tracking-tight text-primary sm:pt-1 sm:text-right">
                    {t.year}
                  </span>
                  <span
                    className="absolute top-2 left-0 h-3.5 w-3.5 rounded-full ring-4 ring-background sm:static sm:mt-2"
                    style={{ background: "var(--gradient-primary)" }}
                  />
                  <div className="glass hover-lift rounded-3xl p-6">
                    <h3 className="text-base sm:text-lg">{t.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* Facilities */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-28">
          <Reveal>
            <SectionHeading
              eyebrow="The building"
              title="Everything under one roof, deliberately"
              lede="Imaging, theatres and wards sit within a few minutes' walk of each other, which is the difference between a diagnosis today and a diagnosis next week."
            />
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {facilities.map((f, i) => (
              <Reveal key={f.title} delay={i * 100}>
                <TiltCard className="glass group h-full overflow-hidden rounded-4xl p-2">
                  <div className="overflow-hidden rounded-[1.75rem]">
                    <img
                      src={f.image}
                      alt={f.title}
                      width={1280}
                      height={860}
                      loading="lazy"
                      className="h-52 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-base">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Accreditation */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-24">
          <Reveal>
            <div className="glass rounded-4xl p-8 sm:p-12">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center">
                <div>
                  <span
                    className="grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <Award className="h-5 w-5" />
                  </span>
                  <h2 className="mt-5 text-2xl sm:text-3xl">Held to the same standard you are</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Our laboratories, safety programme and research governance are all externally
                    inspected. The certificates are on the wall in reception, and the reports are
                    available on request.
                  </p>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {accreditations.map((a, i) => (
                    <Reveal key={a} delay={i * 70}>
                      <li className="glass hover-lift flex h-full items-start gap-3 rounded-2xl p-4 text-sm">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{a}</span>
                      </li>
                    </Reveal>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Hours strip */}
        <section className="border-y border-border/60 bg-secondary/40 py-12">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-4 px-4 text-sm sm:px-6">
            <span className="glass flex items-center gap-3 rounded-full px-6 py-3">
              <Clock className="h-4 w-4 text-primary" />
              Emergency department never closes
            </span>
            <span className="glass flex items-center gap-3 rounded-full px-6 py-3">
              <Users className="h-4 w-4 text-primary" />
              Outpatient clinics, Mon–Sat 08:00–20:00
            </span>
          </div>
        </section>

        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  );
}
