import { useEffect, useState } from "react";
import { Menu, X, Plus } from "lucide-react";

const links = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about" },
  { label: "Services & Specialties", href: "#services" },
  { label: "Medical Flight", href: "#flight" },
  { label: "Contact Us", href: "#contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
      <div
        className={`mx-auto max-w-7xl rounded-3xl transition-all duration-500 ${
          scrolled ? "glass" : "border border-transparent bg-transparent"
        }`}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6 lg:flex lg:justify-between">
          <a href="#home" className="flex min-w-0 items-center gap-3">
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="h-5 w-5" strokeWidth={3} />
            </span>
            <span className="min-w-0 leading-tight">
              <span
                className={`block truncate text-sm font-semibold tracking-tight ${scrolled ? "" : "text-primary-foreground"}`}
              >
                LIFEWELL MEDICAL
              </span>
              <span
                className={`block truncate text-xs ${scrolled ? "text-muted-foreground" : "text-primary-foreground/70"}`}
              >
                CENTER ATHENS
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className={`rounded-full px-3 py-2 text-sm transition-colors ${scrolled ? "text-muted-foreground hover:bg-accent hover:text-accent-foreground" : "text-primary-foreground/85 hover:bg-primary-foreground/15 hover:text-primary-foreground"}`}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a href="#contact" className="btn-glass hidden text-sm sm:inline-flex">
              Contact Us Now
            </a>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="btn-glass-ghost h-11 w-11 shrink-0 !px-0 lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div
          className={`overflow-hidden transition-[max-height,opacity] duration-500 lg:hidden ${
            open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="flex flex-col gap-1 border-t border-border/60 px-4 py-4">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-3 py-3 text-sm font-medium transition-colors hover:bg-accent"
              >
                {l.label}
              </a>
            ))}
            <a href="#contact" onClick={() => setOpen(false)} className="btn-glass mt-2">
              Contact Us Now
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
