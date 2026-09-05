import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

// The banner every interior page opens with. Shared so /about, /services and
// /contact read as one site: same photograph treatment, same veil, same glass
// panel and white copy as the home hero, only shorter.
//
// The header is transparent until scrolled, so each page needs something dark
// beneath it — that is as much this component's job as the heading is.

export function PageHero({
  eyebrow,
  title,
  children,
  image,
  crumb,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  image: string;
  crumb: string;
}) {
  return (
    <section className="relative isolate overflow-hidden">
      <img
        src={image}
        alt=""
        aria-hidden="true"
        width={1600}
        height={686}
        className="hero-drift absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0" style={{ background: "var(--gradient-veil)" }} />
      <div className="absolute inset-0 bg-foreground/45" />

      <div className="relative mx-auto max-w-7xl px-4 pt-36 pb-16 sm:px-6 sm:pt-44 sm:pb-24">
        <div className="glass-panel max-w-3xl rounded-4xl p-6 text-white sm:p-10">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-white/70"
          >
            <Link to="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white/90">{crumb}</span>
          </nav>

          <p className="mt-6 text-xs font-medium tracking-[0.22em] text-white/75 uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-3xl leading-[1.05] text-white drop-shadow-sm sm:text-5xl">
            {title}
          </h1>
          {children && (
            <div className="mt-5 text-sm leading-relaxed text-white/80 sm:text-base">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/** Eyebrow + heading + optional lede, used to open a section on any page. */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
}) {
  const centred = align === "center";
  return (
    <div className={centred ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-xs font-medium tracking-[0.22em] text-primary uppercase">{eyebrow}</p>
      <h2 className="mt-3 text-3xl sm:text-4xl">{title}</h2>
      {lede && (
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">{lede}</p>
      )}
    </div>
  );
}
