# acd-portfolio — Vanishing Loci

Personal academic site for **Andrei Cezar Dragomir**. Dark, futuristic, and built
out of honest algebraic geometry: every figure on the page is the zero locus of an
explicit polynomial.

## The mathematical program

| Element | Object | Where |
|---|---|---|
| Hero / global background | **Kummer quartic family** X_μ : (x²+y²+z²−μ²)² = λ·p₀p₁p₂p₃, ray-marched in GLSL. Scroll drives μ², deforming the surface through its 16-node range; nodes (A₁ points) are detected in-shader as \|∇f\| → 0 and glow violet. | `lib/shaders.ts`, `components/SurfaceCanvas.tsx` |
| Research scanline | **Hyperplane sections** H ∩ X — a level-plane sweeps the surface while the research section is in view. | same shader (`uScanZ`) |
| About panel | A drifting **pencil of elliptic curves** y² = x³+ax+b; the curve nearest the discriminant 4a³+27b² = 0 glows as it degenerates. | `components/PencilCanvas.tsx` |
| Paper card badges | **Plane-curve singularities** (node, cusp, lemniscate, trifolium), singular point marked. | `components/CurveMotif.tsx` |
| Footer constellation | The **16 nodes ↔ A[2] ≅ (𝔽₂)⁴** of the resolving abelian surface, drawn as a tesseract rotating in two planes of R⁴. The surface dissolves at the end of the page; only its singular locus remains. | `components/Constellation.tsx` |
| HUD | Live readouts of real invariants: μ², scroll parameter t, scan height, “minimal resolution: K3, χ = 24”. | `components/Hud.tsx` |

Scroll is the deformation parameter of the family — the page *is* a one-parameter
degeneration.

## Run it

Node was installed portably at `%USERPROFILE%\.local\node-v24.16.0-win-x64` and
added to your user PATH (open a **new** terminal for it to be picked up).

```powershell
cd $env:USERPROFILE\code\acd-portfolio
npm run dev     # http://localhost:3000
npm run build   # production build
```

Deploy: push to GitHub and import in Vercel (zero config), or `npx vercel`.

## Fill in your content — all of it lives in `lib/content.ts`

Anything in `[square brackets]` is a placeholder:

1. **About** — replace the bracketed sentences (LinkedIn blocks automated reading,1
   so education/program details could not be pre-filled; paste yours).
2. **Papers** — one entry per paper; drop PDFs in `public/papers/` and point the
   `pdf` field at them. Motif options: `node`, `cusp`, `lemniscate`, `trifolium`.
3. **CV** — fill the `cv` arrays; set `cvPdf.available = true` once you put
   `cv.pdf` in `public/`.
4. **Links** — uncomment / add GitHub, arXiv, Scholar.
5. **Domain** — update `site.url` when you have one (used for OG metadata).

### Alternate hero taglines (pick or rewrite)

- “Studying the shapes that polynomials cut out of space — varieties, their
  singularities, and the families that connect them.” *(current)*
- “Mathematics student working where algebra becomes geometry.”
- “Varieties, degenerations, and what survives them.”

## Performance & accessibility

- `prefers-reduced-motion`: every canvas renders a single still frame; reveals and
  the scroll cue are disabled.
- Ray-marcher renders at 0.8× internal resolution with a DPR cap (1.5 desktop /
  1.2 touch) and a reduced step budget on touch devices; film grain hides the
  softness. Rendering pauses when the tab is hidden; 2D canvases pause offscreen.
- No WebGL2 → the static `.poster` layer (gradient + lattice) stands in.
- Fonts: Space Grotesk (display), IBM Plex Sans (body), IBM Plex Mono (HUD/labels),
  self-hosted via `next/font`.
