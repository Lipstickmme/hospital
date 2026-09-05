import { createFileRoute } from "@tanstack/react-router";

import { SiteHeader } from "@/components/site/SiteHeader";
import { Hero } from "@/components/site/Hero";
import {
  SafeToComeIn,
  ChooseBest,
  TrustedExperts,
  CtaBand,
  Services,
  Marquee,
  SiteFooter,
} from "@/components/site/Sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lifewell Medical Center Athens | Modern Healthcare" },
      {
        name: "description",
        content:
          "Lifewell Medical Center Athens offers immediate care, diagnostics, occupational health, paediatrics and specialist doctors — open 24/7 in Athens.",
      },
      { property: "og:title", content: "Lifewell Medical Center Athens | Modern Healthcare" },
      {
        property: "og:description",
        content:
          "Immediate care, diagnostic imaging, occupational health and paediatric services with specialist doctors in Athens.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <SafeToComeIn />
        <ChooseBest />
        <TrustedExperts />
        <CtaBand />
        <Services />
        <Marquee />
      </main>
      <SiteFooter />
    </div>
  );
}
