import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

import { BrandMark } from "./BrandMark";

// Every page now has its own route, so these are real links rather than the
// hash anchors the one-page version used.
const links = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Medical Flight", to: "/medical-flight" },
  { label: "Contact Us", to: "/contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Every page opens with a dark banner, so until the header picks up its glass
  // on scroll it is sitting on photography and needs light text.
  // Opening the mobile menu also brings the glass in: the drawer's dark text
  // needs a light surface behind it even at the top of the page.
  const solid = scrolled || open;
  const onDark = !solid;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
      <div
        className={`mx-auto max-w-7xl rounded-3xl transition-all duration-500 ${
          solid ? "glass" : "border border-transparent bg-transparent"
        }`}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6 lg:flex lg:justify-between">
          <BrandMark onDark={onDark} />

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((l) => {
              const active = pathname === l.to;
              return (
                <Link
                  key={l.label}
                  to={l.to}
                  className={`rounded-full px-3 py-2 text-sm whitespace-nowrap transition-colors ${
                    onDark
                      ? active
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "text-primary-foreground/85 hover:bg-primary-foreground/15 hover:text-primary-foreground"
                      : active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/contact" className="btn-glass hidden text-sm sm:inline-flex">
              Contact Us Now
            </Link>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="btn-glass-ghost h-11 w-11 shrink-0 !px-0 lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div
          className={`overflow-hidden rounded-b-3xl bg-background/95 transition-[max-height,opacity] duration-500 lg:hidden ${
            open ? "max-h-[30rem] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="flex flex-col gap-1 border-t border-border/60 px-4 py-4">
            {links.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`rounded-2xl px-3 py-3 text-sm font-medium transition-colors ${
                  pathname === l.to
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link to="/contact" onClick={() => setOpen(false)} className="btn-glass mt-2">
              Contact Us Now
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
