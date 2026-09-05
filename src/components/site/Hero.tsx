import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { images } from "@/data/images";

const slides = [
  {
    eyebrow: "We Are Ready To Serve You",
    title: "We Take Care Of Your Healthy Health",
    body: "We collaborate with national health programmes covering communicable and non-communicable diseases, injury prevention, health promotion, mental health and health systems development.",
    cta: "See All Services",
    to: "/services",
    image: images.heroOne,
  },
  {
    eyebrow: "Theatres That Never Close",
    title: "Consultant-Led Surgery, Around The Clock",
    body: "Four laminar-flow theatres run elective and emergency lists with a consultant surgeon and anaesthetist at every one — from the pre-assessment clinic through to your follow-up.",
    cta: "Explore Surgery",
    to: "/services",
    image: images.heroTwo,
  },
  {
    eyebrow: "Answers The Same Day",
    title: "Imaging Read Here, Not Somewhere Else",
    body: "MRI, CT, ultrasound and digital radiography reported on site by our own consultant radiologists, so an urgent scan becomes an answer today rather than an appointment next week.",
    cta: "See Diagnostics",
    to: "/services",
    image: images.heroThree,
  },
] as const;

export function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), 7000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section id="home" className="relative isolate min-h-[92vh] overflow-hidden">
      {slides.map((s, i) => (
        <img
          key={s.title}
          src={s.image}
          alt=""
          aria-hidden="true"
          width={1920}
          height={1088}
          loading={i === 0 ? "eager" : "lazy"}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-[1400ms] ease-out sm:object-left ${
            i === index ? "scale-100 opacity-100" : "scale-105 opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0" style={{ background: "var(--gradient-veil)" }} />
      <div className="absolute inset-0 bg-foreground/20 sm:bg-transparent" />

      <div className="relative mx-auto flex min-h-[92vh] max-w-7xl items-end px-4 pt-32 pb-14 sm:px-6 sm:items-center sm:pb-20">
        <div className="w-full max-w-xl">
          <div className="glass-panel rounded-4xl p-6 text-white sm:p-10">
            {slides.map((s, i) => (
              <div
                key={s.title}
                className={`transition-all duration-700 ${
                  i === index ? "block opacity-100" : "hidden opacity-0"
                }`}
              >
                <p className="text-xs font-medium tracking-[0.22em] text-white/75 uppercase">
                  {s.eyebrow}
                </p>
                <h1 className="mt-4 text-3xl leading-[1.05] text-white drop-shadow-sm sm:text-5xl">
                  {s.title}
                </h1>
                <p className="mt-5 text-sm leading-relaxed text-white/80 sm:text-base">{s.body}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link to={s.to} className="btn-glass">
                    {s.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/contact" hash="enquiry" className="btn-glass-light">
                    Book a visit
                  </Link>
                </div>
              </div>
            ))}

            <div className="mt-8 flex items-center gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.title}
                  type="button"
                  aria-label={`Show slide ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === index ? "w-10 bg-white" : "w-4 bg-white/35 hover:bg-white/55"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
