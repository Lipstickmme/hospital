// Every photograph on the marketing site, in one place.
//
// Components refer to slots by what they mean ("trustedExperts"), never to a
// filename, so swapping artwork is an edit here and nothing else. Imports are
// used rather than /public paths so Vite fingerprints and optimises them.
//
// The lw* set was supplied as ~1 MB PNGs; they are stored re-encoded as JPEG
// at width 1600, which is the widest they are ever displayed. That took the
// set from 6.0 MB to 393 KB with no visible difference. Re-encode any new
// photograph the same way rather than committing a PNG.

import lwBloodPressure from "@/assets/lw.jpg";
import lwNurse from "@/assets/lw1.jpg";
import lwTeam from "@/assets/lw2.jpg";
import lwScanner from "@/assets/lw3.jpg";
import lwSeniorDoctors from "@/assets/lw4.jpg";
import lwDoctor from "@/assets/lw5.jpg";
import svcPediatric from "@/assets/svc-pediatric.jpg";

export const images = {
  /** Hero carousel, in order: welcome, team, capability. */
  heroOne: lwNurse,
  heroTwo: lwTeam,
  heroThree: lwScanner,

  /** "Yes, It's Safe to Come In" — portrait beside the copy. */
  safeToComeIn: lwDoctor,
  /** "Choose the best" — wide image above the checklist. */
  chooseBest: lwTeam,
  /** "We are the trusted experts" — portrait beside the copy. */
  trustedExperts: lwSeniorDoctors,

  /** The four circular service cards. Square crops, so centre-weighted. */
  serviceImmediate: lwDoctor,
  serviceDiagnostic: lwScanner,
  serviceOccupational: lwBloodPressure,
  // Kept from the original set — none of the new photographs are paediatric.
  servicePediatric: svcPediatric,
} as const;
