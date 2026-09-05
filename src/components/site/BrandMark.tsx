import { Link } from "@tanstack/react-router";

import { images } from "@/data/images";

// The lockup is three stacked lines beside the mark, each smaller than the one
// above it: LIFEWELL / Medical Center / Athens. Header and footer share it so
// the brand reads identically wherever it appears.

export function BrandMark({ onDark = false }: { onDark?: boolean }) {
  return (
    <Link to="/" className="group flex min-w-0 items-center gap-3">
      {/* The mark is blue on transparent, so it needs a light tile of its own
          to stay legible while the header is over a dark banner. */}
      <span className="grid h-13 w-13 shrink-0 place-items-center rounded-2xl bg-white/90 shadow-[var(--shadow-soft)] ring-1 ring-white/60 transition-transform duration-500 group-hover:scale-105">
        <img src={images.logo} alt="" width={52} height={52} className="h-8 w-8 object-contain" />
      </span>

      <span
        className={`flex min-w-0 flex-col justify-center transition-colors duration-500 ${
          onDark ? "text-primary-foreground drop-shadow-sm" : "text-foreground"
        }`}
      >
        <span className="text-xl leading-none font-bold tracking-[0.14em] sm:text-2xl">
          LIFEWELL
        </span>
        <span
          className={`mt-1.5 text-[0.6rem] leading-none font-medium tracking-[0.24em] uppercase sm:text-[0.68rem] ${
            onDark ? "text-primary-foreground/85" : "text-muted-foreground"
          }`}
        >
          Medical Center
        </span>
        <span
          className={`mt-1 text-[0.52rem] leading-none tracking-[0.3em] uppercase sm:text-[0.58rem] ${
            onDark ? "text-primary-foreground/70" : "text-muted-foreground/80"
          }`}
        >
          Athens
        </span>
      </span>
    </Link>
  );
}
