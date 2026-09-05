import { useRef, type CSSProperties, type ReactNode } from "react";

// Cards that tip towards the pointer. The rotation is written straight to the
// element's style rather than held in state: this fires on every mousemove, and
// a re-render per frame would make the whole page stutter.
//
// A second element tracks the pointer as a soft glare, which is what sells the
// tilt as a physical surface rather than a skewed rectangle.

const MAX_DEGREES = 7;

export function TiltCard({
  children,
  className = "",
  glare = true,
  style,
}: {
  children: ReactNode;
  className?: string;
  glare?: boolean;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    window.cancelAnimationFrame(frame.current);
    el.style.transform = "";
    if (glareRef.current) glareRef.current.style.opacity = "0";
  };

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = el.getBoundingClientRect();
    // -0.5 … 0.5 from the centre of the card.
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    window.cancelAnimationFrame(frame.current);
    frame.current = window.requestAnimationFrame(() => {
      el.style.transform =
        `perspective(1000px) rotateX(${(-y * MAX_DEGREES).toFixed(2)}deg) ` +
        `rotateY(${(x * MAX_DEGREES).toFixed(2)}deg) translateY(-6px) scale(1.015)`;
      if (glareRef.current) {
        glareRef.current.style.opacity = "1";
        glareRef.current.style.background =
          `radial-gradient(circle at ${((x + 0.5) * 100).toFixed(1)}% ${((y + 0.5) * 100).toFixed(1)}%, ` +
          `color-mix(in oklab, white 55%, transparent), transparent 55%)`;
      }
    });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ transformStyle: "preserve-3d", ...style }}
      className={`tilt-card ${className}`}
    >
      {glare && (
        <div
          ref={glareRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 mix-blend-soft-light transition-opacity duration-500"
        />
      )}
      {children}
    </div>
  );
}
