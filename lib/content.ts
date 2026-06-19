// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for all site content.
// Anything in [square brackets] is a placeholder — replace it with real data.
// LinkedIn blocks automated reading, so education/experience fields could not
// be pre-filled; paste your profile text over the placeholders below.
// ─────────────────────────────────────────────────────────────────────────────

export const site = {
  name: "Andrei Cezar Dragomir",
  url: "https://acd-portfolio.vercel.app", // replace when you have a domain
  description:
    "Personal site of Andrei Cezar Dragomir, pure mathematics student at the University of Waterloo. Projects, write-ups, and CV.",
  kicker: "Pure Mathematics · University of Waterloo",
  tagline: "Pure mathematics student at the University of Waterloo.",
};

export const about = {
  paragraphs: [
    "I'm a pure mathematics student at the University of Waterloo, working through the core of the subject — algebra, analysis, and the structures that connect them. Lately that has meant fields and Galois theory, group representations, and a growing collection of write-ups, some of which live in the Projects section below.",
    "The visuals on this site borrow their language from algebraic geometry: every figure rendered here is the zero locus of an explicit polynomial, deformed live as you scroll.",
  ],
  // Candid for the About column — edit the caption/tag to taste.
  photo: {
    src: "/photos/exam-hall.jpg",
    caption: "My last exam of first year as a mathematician — the linear algebra final, which had a Putnam problem on it.",
    tag: "find your seat number",
    rotate: -1.8,
  } as Photo,
};

export interface Project {
  title: string;
  coauthors: string;
  venue: string;
  year: string;
  abstract: string;
  pdf: string; // drop the file in public/projects/ and point this at it
  thumb: string; // first-page preview (public/projects/thumbs/), links to the pdf
  motif: "node" | "cusp" | "lemniscate" | "trifolium" | "group" | "pi" | "grid";
}

export const projects: Project[] = [
  {
    title: "A Representation-Theoretic Proof of Burnside's Theorem",
    coauthors: "A. C. Dragomir",
    venue: "Expository write-up · PMATH 348, University of Waterloo",
    year: "2026",
    abstract:
      "Develops the basic character theory of finite groups — Schur's lemma, orthogonality of characters, and integrality of character values — and uses it to prove Burnside's theorem: every group of order pᵃqᵇ is solvable.",
    pdf: "/projects/burnside-theorem.pdf",
    thumb: "/projects/thumbs/burnside-theorem.png",
    motif: "group",
  },
  {
    title: "On the Transcendence of π",
    coauthors: "A. C. Dragomir",
    venue: "Expository write-up",
    year: "2026",
    abstract:
      "A proof of the Lindemann–Weierstrass theorem — exponentials of distinct algebraic numbers are linearly independent over the algebraic numbers — from which the transcendence of π and e falls out as a corollary.",
    pdf: "/projects/transcendence-of-pi.pdf",
    thumb: "/projects/thumbs/transcendence-of-pi.png",
    motif: "pi",
  },
  {
    title: "A Probabilistic Analysis and Optimization of a Casino Game",
    coauthors: "A. C. Dragomir",
    venue: "Course summative · Lisgar Collegiate Institute",
    year: "2024",
    abstract:
      "Designs a 4×4 minesweeper-style casino game, derives the distribution of the losing round and a payout function that holds the house edge in a target band, then validates the model against live data from a real casino night.",
    pdf: "/projects/A_Probabilistic_Analysis_and_Optimization_of_a_Casino_Game.pdf",
    thumb: "/projects/thumbs/A_Probabilistic_Analysis_and_Optimization_of_a_Casino_Game.png",
    motif: "grid",
  },
  {
    title:
      "Spousal Homicide Rates in Ontario and Quebec: Regional Patterns and the Relationship with Divorce",
    coauthors: "A. C. Dragomir",
    venue: "Statistical study · Statistics Canada data",
    year: "2024",
    abstract:
      "A statistical study of spousal homicide in Ontario and Quebec from 1997–2023, built on Statistics Canada data. Compares the two provinces through numerical summaries, box plots, histograms, normality tests, and time series, then fits a linear regression between Ontario's divorce and spousal-homicide rates. Finds Ontario's rate higher and steadier than Quebec's, and a moderate positive correlation between divorce and spousal homicide that strengthens once a 2001 outlier is removed.",
    pdf: "/projects/spousal-homicide-ontario-quebec.pdf",
    thumb: "/projects/thumbs/spousal-homicide-ontario-quebec.png",
    motif: "node",
  },
];

export interface Photo {
  src: string; // drop the file in public/photos/ and point this at it
  caption: string;
  tag?: string; // optional short mono label, e.g. a place or a theorem
  rotate?: number; // small tilt in degrees for the pinned-photo look
}

export interface CvEntry {
  title: string;
  org?: string;
  period: string;
  detail?: string;
  aside?: string; // a human margin-note; edit freely or delete
  photo?: Photo;
  logo?: string; // path to an institution/company logo in public/logos/
  monogram?: { text: string; color: string }; // fallback badge when no logo file
}

// First-person line that opens the CV — keeps it from reading like a template.
export const cvIntro =
  "Less a résumé than a record of what I've actually been up to: the courses, the teaching, the odd honour — and a couple of photographs the formatting can't hold.";

export const cv: {
  education: CvEntry[];
  work: CvEntry[];
  awards: CvEntry[];
  teaching: CvEntry[];
} = {
  education: [
    {
      title: "Bachelor of Mathematics, Pure Mathematics",
      org: "University of Waterloo",
      period: "2025 – 2030",
      logo: "/logos/waterloo.png",
      detail: "GPA: 90.0 / 100.0",
      aside: "Working through the core — algebra, analysis, and the bridges between them.",
      photo: {
        src: "/photos/math145.jpg",
        caption: "Last lecture of MATH 145 — Galois theory on the board. One of the most fun courses I've taken.",
        rotate: -1.6,
      },
    },
  ],
  work: [
    {
      title: "Data Science Intern",
      org: "AMRIS Aviation",
      period: "May 2026 – Aug 2026",
      logo: "/logos/amris.jpg",
    },
  ],
  awards: [
    {
      title: "President's Scholarship",
      org: "University of Waterloo",
      period: "2025",
      logo: "/logos/waterloo.png",
    },
    {
      title: "Valedictorian",
      org: "Lisgar Collegiate Institute",
      period: "2025",
      logo: "/logos/lisgar.jpg",
      photo: {
        src: "/photos/valedictorian.jpg",
        caption:
          "My valedictory address: x² + 1 = 0 has no answer until you widen the domain. Complex numbers were dismissed as impossible — that step outside the box was the revolution.",
        tag: "expand your domain",
        rotate: -2.2,
      },
    },
  ],
  teaching: [
    {
      title: "Mathematics & Science Tutor",
      org: "Lisgar Collegiate Institute",
      period: "2023 – 2025",
      logo: "/logos/lisgar.jpg",
      aside: "Where I learned that explaining a proof is the fastest way to find the hole in it.",
      photo: {
        src: "/photos/chalkboard.jpg",
        caption: "Walking a friend through the Baire category theorem — and why ℝ∖ℚ is a dense Gδ.",
        tag: "ℝ∖ℚ is a dense Gδ",
        rotate: 1.8,
      },
    },
  ],
};

export const cvPdf = {
  available: false, // set true once you drop cv.pdf into public/
  href: "/cv.pdf",
};

export interface Course {
  code: string;
  title: string;
}

export const courses: { label: string; note: string; items: Course[] }[] = [
  {
    label: "Completed",
    note: "courses behind me",
    items: [
      { code: "MATH 147", title: "Elementary Analysis 1" },
      { code: "MATH 148", title: "Elementary Analysis 2" },
      { code: "MATH 145", title: "Introduction to Number Theory and Abstract Algebra" },
      { code: "PMATH 348", title: "Fields and Galois Theory" },
      { code: "MATH 146", title: "Introduction to Linear Algebra" },
      { code: "CS 135", title: "Functional Programming" },
      { code: "CS 136", title: "Imperative Programming" },
      { code: "ECON 101", title: "Microeconomics" },
      { code: "ECON 102", title: "Macroeconomics" },
      { code: "COMMST 223", title: "Public Speaking" },
    ],
  },
  {
    label: "Fall 2026",
    note: "in progress",
    items: [
      { code: "PMATH 446", title: "Introduction to Commutative Algebra" },
      { code: "MATH 245", title: "Linear Algebra 2" },
      { code: "MATH 247", title: "Multivariable Calculus" },
      { code: "STAT 240", title: "Introduction to Probability" },
      { code: "CS 246", title: "Introduction to Object-Oriented Programming" },
    ],
  },
];

// QNC building shot — lives in the Courses section.
export const coursesPhoto: Photo = {
  src: "/photos/qnc.jpg",
  caption: "QNC at golden hour — the Quantum-Nano Centre, looking up.",
  tag: "glass & lattice",
  rotate: 1.6,
};

export const links: { label: string; href: string }[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/andrei-cezar-dragomir" },
  // Add when ready:
  // { label: "GitHub", href: "https://github.com/your-handle" },
  // { label: "arXiv", href: "https://arxiv.org/a/your-id" },
  // { label: "Scholar", href: "https://scholar.google.com/citations?user=..." },
];

// Assembled at click-time so the address never sits in the static HTML.
export const emailParts = ["acdragom", "gmail.com"];

// Prefixes a public/ asset path (e.g. "/projects/x.pdf") with the deploy
// basePath. Needed because Next.js does not apply basePath to raw <a href>
// strings — only to <Link>/<Image>. Leaves absolute URLs (http...) untouched.
export function asset(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}${path}`;
}
