Institution / company logos for the LinkedIn-style CV cards
(referenced from lib/content.ts via each entry's `logo` field):

  waterloo.png  — University of Waterloo (Education, President's Scholarship)
  amris.jpg     — AMRIS Aviation (Data Science Intern)

Lisgar Collegiate Institute (Valedictorian, Teaching) currently uses a "LCI"
monogram badge — no logo file was supplied. To use a real logo instead:
  1. Drop the file here, e.g. lisgar.png
  2. In lib/content.ts, on each Lisgar entry, replace
        monogram: { text: "LCI", color: "#7a1f2b" }
     with
        logo: "/logos/lisgar.png"

Logos display on a light rounded tile, so a transparent or white-background
PNG/SVG-exported-PNG looks best. Square-ish source images crop cleanest.
