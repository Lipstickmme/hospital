import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  MapPin,
  Phone,
  Stethoscope,
  Clock,
  ShieldCheck,
  HeartPulse,
  Mail,
} from "lucide-react";

import { Reveal } from "./Reveal";
import { images } from "@/data/images";

const quickLinks = [
  { label: "Learn More", icon: CalendarDays },
  { label: "Find Doctors", icon: Stethoscope },
  { label: "Find Locations", icon: MapPin },
  { label: "Emergency Contact", icon: Phone },
];

export function SafeToComeIn() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_minmax(0,0.9fr)] lg:items-center">
        <Reveal>
          <img
            src={images.safeToComeIn}
            alt="Doctor smiling in a hospital corridor, colleagues behind"
            width={1024}
            height={1280}
            loading="lazy"
            className="h-72 w-full rounded-4xl object-cover shadow-[var(--shadow-soft)] sm:h-96 lg:h-[30rem]"
          />
        </Reveal>

        <Reveal delay={80}>
          <h2 className="text-3xl sm:text-4xl">
            Yes, It&apos;s <span className="text-gradient">Safe to Come In</span>
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            You may wonder if it&apos;s safe to come in for care. Lifewell Medical Center Athens is
            among the safest places in healthcare today.
          </p>
          <p className="mt-4 text-sm leading-relaxed font-medium text-foreground sm:text-base">
            You should feel confident we&apos;re keeping your family — and our caregivers — safe.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            No matter what brings you in, we take steps every single day to keep you safe during
            your appointment, procedure or surgery.
          </p>
        </Reveal>

        <Reveal delay={160}>
          <div className="flex flex-col gap-3">
            {quickLinks.map(({ label, icon: Icon }) => (
              <a
                key={label}
                href="#contact"
                className="btn-glass group w-full justify-between px-6 py-4 text-left"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{label}</span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const promises = [
  "Free Consultation",
  "Quality Doctors",
  "Professional Experts",
  "Affordable Price",
  "24/7 Opened",
];

export function ChooseBest() {
  return (
    <section className="relative overflow-hidden">
      <div className="grid lg:grid-cols-2">
        <div
          className="relative px-4 py-16 text-primary-foreground sm:px-10 sm:py-24 lg:px-14"
          style={{ background: "var(--gradient-primary)" }}
        >
          <div className="ml-auto max-w-xl">
            <Reveal>
              <h2 className="text-3xl sm:text-4xl">Choose The Best For Your Health</h2>
              <p className="mt-6 text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
                <strong className="font-semibold">Quality &amp; Safety</strong> — we ensure the
                highest standards and excellent outcomes through effective interactions,
                decision-making and actions.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
                <strong className="font-semibold">Empathy</strong> — we imagine what another person
                is going through, work to alleviate suffering, and create joy whenever possible.
              </p>
            </Reveal>
            <ul className="mt-10 space-y-3">
              {promises.map((p, i) => (
                <Reveal key={p} delay={i * 70}>
                  <li className="btn-glass-light w-full justify-start px-5 py-3">
                    <ChevronRight className="h-4 w-4" />
                    <span>{p}</span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
        <img
          src={images.chooseBest}
          alt="Three nurses walking together through a hospital corridor"
          width={1280}
          height={960}
          loading="lazy"
          className="h-72 w-full object-cover sm:h-96 lg:h-auto"
        />
      </div>
    </section>
  );
}

const stats = [
  { label: "Efficiency", value: 80 },
  { label: "Experience", value: 90 },
  { label: "Patient care", value: 70 },
];

export function TrustedExperts() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <img
            src={images.trustedExperts}
            alt="Two senior doctors in white coats"
            width={1280}
            height={960}
            loading="lazy"
            className="h-72 w-full rounded-4xl object-cover shadow-[var(--shadow-soft)] sm:h-[26rem]"
          />
        </Reveal>
        <Reveal delay={90}>
          <h2 className="text-3xl sm:text-4xl">
            We are the trusted experts who keep <span className="text-gradient">things simple</span>
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <strong className="font-medium text-foreground">Inclusion</strong> — we intentionally
            create an environment of compassionate belonging where all are valued and respected.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <strong className="font-medium text-foreground">Integrity</strong> — we adhere to high
            moral principles and professional standards through honesty, confidentiality, trust,
            respect and transparency.
          </p>

          <div className="mt-10 space-y-6">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={120 + i * 90}>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{s.label}</span>
                    <span className="text-muted-foreground">{s.value}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-[width] duration-[1400ms] ease-out"
                      style={{ width: `${s.value}%`, background: "var(--gradient-primary)" }}
                    />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
      <Reveal>
        <div
          className="gradient-drift relative overflow-hidden rounded-4xl px-6 py-12 text-primary-foreground sm:px-12 sm:py-16"
          style={{ background: "var(--gradient-primary)" }}
        >
          <HeartPulse className="float-soft absolute -right-6 -bottom-6 h-40 w-40 text-primary-foreground/15" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0">
              <p className="text-xs font-medium tracking-[0.22em] uppercase opacity-80">
                Need a doctor for check-up?
              </p>
              <h2 className="mt-3 text-2xl sm:text-4xl">
                Send us a message now — we are ready to serve
              </h2>
            </div>
            <a href="#contact" className="btn-glass-light shrink-0 px-8 py-4">
              Contact Us
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const services = [
  {
    title: "Immediate Care",
    body: "Effective and affordable treatment for non-life threatening illnesses",
    image: images.serviceImmediate,
  },
  {
    title: "Diagnostic Center",
    body: "A wide array of reliable lab and diagnostic imaging services",
    image: images.serviceDiagnostic,
  },
  {
    title: "Occupational Health",
    body: "Our team keeps people well at work, physically and mentally",
    image: images.serviceOccupational,
  },
  {
    title: "Pediatric Services",
    body: "Helping you and your child stay healthy through every milestone",
    image: images.servicePediatric,
  },
];

export function Services() {
  return (
    <section id="services" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
      <Reveal>
        <p className="text-xs font-medium tracking-[0.22em] text-primary uppercase">
          Working process
        </p>
        <h2 className="mt-3 max-w-2xl text-3xl sm:text-4xl">How it helps you stay healthy</h2>
      </Reveal>

      <div className="relative mt-14 grid grid-cols-2 gap-6 sm:gap-10 lg:grid-cols-4">
        <div
          className="pointer-events-none absolute top-24 right-8 left-8 hidden h-px lg:block"
          style={{
            background:
              "repeating-linear-gradient(90deg, var(--color-border) 0 8px, transparent 8px 18px)",
          }}
        />
        {services.map((s, i) => (
          <Reveal key={s.title} delay={i * 110}>
            <div className="group relative text-center">
              <div className="glass hover-lift mx-auto aspect-square w-full max-w-[13rem] overflow-hidden rounded-full p-2">
                <img
                  src={s.image}
                  alt={s.title}
                  width={640}
                  height={640}
                  loading="lazy"
                  className="h-full w-full rounded-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <h3 className="mt-6 text-sm tracking-tight uppercase sm:text-base">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-[16rem] text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {s.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const badges = [
  { label: "24/7 Emergency", icon: Clock },
  { label: "ISO Certified Labs", icon: ShieldCheck },
  { label: "Cardiology Centre", icon: HeartPulse },
  { label: "Air Ambulance", icon: MapPin },
  { label: "Family Medicine", icon: Stethoscope },
];

export function Marquee() {
  const items = [...badges, ...badges];
  return (
    <section className="overflow-hidden border-y border-border/60 bg-secondary/40 py-8">
      <div className="marquee-track flex w-max items-center gap-4">
        {items.map(({ label, icon: Icon }, i) => (
          <span
            key={`${label}-${i}`}
            className="glass flex items-center gap-3 rounded-full px-6 py-3 text-sm whitespace-nowrap text-muted-foreground"
          >
            <Icon className="h-4 w-4 text-primary" />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer id="contact" className="bg-primary-deep text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h3 className="text-lg">Lifewell Medical Center Athens</h3>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-foreground/70">
              Modern, compassionate healthcare for every stage of life — diagnostics, specialist
              care, paediatrics and medical flight services.
            </p>
          </div>
          <div className="space-y-3 text-sm text-primary-foreground/80">
            <p className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0" /> +30-21-1234-7377
            </p>
            <p className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0" /> care@lifewellathens.gr
            </p>
            <p className="flex items-center gap-3">
              <MapPin className="h-4 w-4 shrink-0" /> Athens, Greece
            </p>
            <p className="flex items-center gap-3">
              <Clock className="h-4 w-4 shrink-0" /> Emergency open 24/7
            </p>
          </div>
          <div>
            <p className="text-sm text-primary-foreground/70">
              Book an appointment or reach our emergency desk any time.
            </p>
            <a href="tel:+302111234737" className="btn-glass-light mt-5 w-full sm:w-auto">
              Call the emergency desk
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
        <p className="mt-14 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/55">
          © {new Date().getFullYear()} Lifewell Medical Center Athens. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
