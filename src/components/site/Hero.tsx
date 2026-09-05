import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import { images } from "@/data/images";

const slides = [
  {
    eyebrow: "We Are Ready To Serve You",
    title: "We Take Care Of Your Healthy Health",
    body: "We collaborate with national health programmes covering communicable and non-communicable diseases, injury prevention, health promotion, mental health and health systems development.",
    cta: "See All Services",
    image: images.heroOne,
  },
  {
    eyebrow: "We Educate Our Staffs",
    title: "Expert Care, Taught And Shared",
    body: "We provide education for both you and your caregiver — how to safely assist at home with exercise, positioning, transfer techniques and general mobility.",
    cta: "Learn More",
    image: images.heroTwo,
  },
  {
    eyebrow: "Every Milestone Matters",
    title: "Compassion From Day One",
    body: "From paediatrics to occupational health, our teams keep families well at every stage of life with modern diagnostics and 24/7 availability.",
    cta: "Explore Our Care",
    image: images.heroThree,
  },
];

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
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-[1400ms] ease-out ${
            i === index ? "scale-100 opacity-100" : "scale-105 opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0" style={{ background: "var(--gradient-veil)" }} />
      <div className="absolute inset-0 bg-foreground/20 sm:bg-transparent" />

      <div className="relative mx-auto flex min-h-[92vh] max-w-7xl items-end px-4 pt-32 pb-14 sm:px-6 sm:items-center sm:pb-20">
        <div className="w-full max-w-xl">
          <div className="glass rounded-4xl p-6 sm:p-10">
            {slides.map((s, i) => (
              <div
                key={s.title}
                className={`transition-all duration-700 ${
                  i === index ? "block opacity-100" : "hidden opacity-0"
                }`}
              >
                <p className="text-xs font-medium tracking-[0.22em] text-primary uppercase">
                  {s.eyebrow}
                </p>
                <h1 className="mt-4 text-3xl leading-[1.05] sm:text-5xl">{s.title}</h1>
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {s.body}
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <a href="#services" className="btn-glass">
                    {s.cta}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a href="#contact" className="btn-glass-ghost">
                    Book a visit
                  </a>
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
                    i === index ? "w-10 bg-primary" : "w-4 bg-foreground/20"
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
