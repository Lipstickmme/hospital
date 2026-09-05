// Every photograph on the marketing site, in one place.
//
// Components refer to slots by what they mean ("trustedExperts"), never to a
// filename, so swapping artwork is an edit here and nothing else. Imports are
// used rather than /public paths so Vite fingerprints and optimises them.
//
// To swap in a new set: drop the files in src/assets/ and repoint the slot.
// Only the right-hand side changes.

import corridor from "@/assets/hero-corridor.jpg";
import monitors from "@/assets/monitors.jpg";
import stethoscope from "@/assets/stethoscope.jpg";
import experts from "@/assets/experts.jpg";
import svcImmediate from "@/assets/svc-immediate.jpg";
import svcDiagnostic from "@/assets/svc-diagnostic.jpg";
import svcOccupational from "@/assets/svc-occupational.jpg";
import svcPediatric from "@/assets/svc-pediatric.jpg";

export const images = {
  /** Hero carousel, in order. */
  heroOne: corridor,
  heroTwo: monitors,
  heroThree: svcPediatric,

  /** "Yes, It's Safe to Come In" — portrait beside the copy. */
  safeToComeIn: stethoscope,
  /** "Choose the best" — wide image above the checklist. */
  chooseBest: monitors,
  /** "We are the trusted experts" — portrait beside the copy. */
  trustedExperts: experts,

  /** The four circular service cards. */
  serviceImmediate: svcImmediate,
  serviceDiagnostic: svcDiagnostic,
  serviceOccupational: svcOccupational,
  servicePediatric: svcPediatric,
} as const;
