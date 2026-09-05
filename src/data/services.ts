import {
  Activity,
  Baby,
  HeartPulse,
  Scan,
  ShieldPlus,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

import { images } from "./images";

// One catalogue, read by both the home page's four-card summary and the full
// /services page. Keeping it here is what stops the two from drifting apart as
// the copy changes.

export type Service = {
  slug: string;
  title: string;
  /** One line, for the home page's circular cards. */
  summary: string;
  /** The fuller description on /services. */
  body: string;
  points: string[];
  image: string;
  icon: LucideIcon;
  /** Shown on /services so a visitor knows when to turn up. */
  hours: string;
};

export const services: Service[] = [
  {
    slug: "immediate-care",
    title: "Immediate Care",
    summary: "Effective, affordable treatment for non-life-threatening illness",
    body: "Walk in without an appointment for the things that cannot wait for a clinic slot but do not belong in a resuscitation bay: fevers, fractures, infections, cuts and sprains. A senior clinician sees every patient, and imaging and pathology are in the same building, so most people leave with an answer rather than a referral.",
    points: [
      "No appointment needed, 24 hours a day",
      "On-site X-ray, ultrasound and pathology",
      "Wound care, suturing and fracture management",
      "Direct admission if you need to stay",
    ],
    image: images.specialtyEmergency,
    icon: ShieldPlus,
    hours: "Open 24/7, including public holidays",
  },
  {
    slug: "diagnostics",
    title: "Diagnostic Imaging",
    summary: "A wide array of reliable laboratory and imaging services",
    body: "MRI, CT, digital radiography, mammography and ultrasound, reported by consultant radiologists who are on site rather than reading remotely. Urgent studies are reported the same day, and your images follow you to whichever of our clinicians you see next.",
    points: [
      "MRI, CT, ultrasound and digital X-ray",
      "Consultant-reported, same-day for urgent studies",
      "Results released to you and your GP together",
      "Contrast studies and image-guided biopsy",
    ],
    image: images.specialtyImaging,
    icon: Scan,
    hours: "Mon-Sat, 07:00-21:00 · urgent studies 24/7",
  },
  {
    slug: "surgery",
    title: "Surgery & Theatres",
    summary: "Modern theatres with consultant-led surgical and anaesthetic teams",
    body: "Four laminar-flow theatres running elective and emergency lists, staffed by consultant surgeons and anaesthetists who look after you from the pre-assessment clinic through to your follow-up. Day-case pathways mean most procedures need no overnight stay at all.",
    points: [
      "General, orthopaedic, gynaecological and ENT surgery",
      "Day-case pathways for most elective procedures",
      "Consultant anaesthetist at every list",
      "Pre-assessment clinic and structured follow-up",
    ],
    image: images.specialtySurgery,
    icon: Activity,
    hours: "Elective lists Mon-Fri · emergency theatre 24/7",
  },
  {
    slug: "occupational-health",
    title: "Occupational Health",
    summary: "Keeping people well at work, physically and mentally",
    body: "Pre-employment screening, statutory medicals, vaccination programmes and return-to-work assessments for employers across Attica, alongside confidential support for the people who work for them. We report on fitness to work, never on clinical detail.",
    points: [
      "Pre-employment and periodic health screening",
      "Statutory medicals and vaccination programmes",
      "Ergonomic and workplace risk assessment",
      "Confidential mental-health and return-to-work support",
    ],
    image: images.serviceOccupational,
    icon: Stethoscope,
    hours: "Mon-Fri, 08:00-18:00",
  },
  {
    slug: "maternity-paediatrics",
    title: "Maternity & Paediatrics",
    summary: "Helping you and your child stay healthy through every milestone",
    body: "Antenatal care, a midwife-led birthing suite with obstetric and neonatal cover on site, and paediatric clinics that carry on long after you go home: immunisations, development checks, allergy and asthma care, and a paediatrician on call around the clock.",
    points: [
      "Antenatal, birth and postnatal care in one place",
      "Midwife-led suite with obstetric cover on site",
      "Neonatal resuscitation team at every delivery",
      "Paediatric clinics, immunisation and development checks",
    ],
    image: images.specialtyMaternity,
    icon: Baby,
    hours: "Maternity 24/7 · paediatric clinics Mon-Sat",
  },
  {
    slug: "cardiology",
    title: "Cardiology",
    summary: "Heart assessment, monitoring and long-term cardiac care",
    body: "Rapid-access chest pain assessment, echocardiography, ambulatory monitoring and structured follow-up for blood pressure, arrhythmia and heart failure. Referrals seen within a week; anything urgent, the same day.",
    points: [
      "Rapid-access chest pain clinic",
      "Echocardiography and stress testing",
      "24-hour blood-pressure and rhythm monitoring",
      "Heart-failure and hypertension follow-up",
    ],
    image: images.specialtyCardiology,
    icon: HeartPulse,
    hours: "Mon-Fri, 08:00-20:00 · urgent same-day",
  },
];

/** The four the home page summarises, in the order it shows them. */
export const featuredServices = [
  services[0],
  services[1],
  services[3],
  services[4],
] as Service[];
