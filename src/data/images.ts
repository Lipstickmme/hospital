// Every photograph on the site, in one place.
//
// Components refer to slots by what they mean ("trustedExperts"), never to a
// filename, so swapping artwork is an edit here and nothing else. Imports are
// used rather than /public paths so Vite fingerprints and optimises them.
//
// The photographs were supplied as ~1 MB PNGs and are stored re-encoded as
// JPEG at the widest size they are ever displayed. Re-encode any new
// photograph the same way rather than committing a PNG.

import lwBloodPressure from "@/assets/lw.jpg";
import lwNurse from "@/assets/lw1.jpg";
import lwTeam from "@/assets/lw2.jpg";
import lwScanner from "@/assets/lw3.jpg";
import lwSeniorDoctors from "@/assets/lw4.jpg";
import lwDoctor from "@/assets/lw5.jpg";
import lwImaging from "@/assets/lw11.jpg";
import lwTheatre from "@/assets/lw22.jpg";
import lwNewborn from "@/assets/pediatric.jpg";
import lwLogo from "@/assets/logo.png";

export const images = {
  /** Header and footer wordmark. Transparent PNG, blue on any ground. */
  logo: lwLogo,

  /** Hero carousel, in order: welcome, surgical capability, diagnostics. */
  heroOne: lwNurse,
  heroTwo: lwTheatre,
  heroThree: lwImaging,

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
  servicePediatric: lwNewborn,

  /** Page banners. Wide crops sitting behind a dark veil and white copy. */
  aboutBanner: lwSeniorDoctors,
  servicesBanner: lwTheatre,
  contactBanner: lwNurse,

  /** About page. */
  aboutStory: lwTeam,
  aboutCare: lwNurse,
  aboutTheatre: lwTheatre,

  /** Services page — one per specialty in the full catalogue. */
  specialtyEmergency: lwDoctor,
  specialtySurgery: lwTheatre,
  specialtyImaging: lwImaging,
  specialtyMaternity: lwNewborn,
  specialtyCardiology: lwBloodPressure,
  specialtyGeneral: lwSeniorDoctors,
} as const;
