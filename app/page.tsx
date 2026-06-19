import SurfaceCanvas from "@/components/SurfaceCanvas";
import Hud from "@/components/Hud";
import PencilCanvas from "@/components/PencilCanvas";
import ComplexRootsCanvas from "@/components/ComplexRootsCanvas";
import CurveMotif from "@/components/CurveMotif";
import Constellation from "@/components/Constellation";
import Reveals from "@/components/Reveals";
import EmailLink from "@/components/EmailLink";
import PhotoFrame from "@/components/PhotoFrame";
import {
  site,
  about,
  projects,
  cv,
  cvPdf,
  cvIntro,
  courses,
  coursesPhoto,
  links,
  asset,
  type CvEntry,
} from "@/lib/content";

const cvSections: { label: string; entries: CvEntry[] }[] = [
  { label: "Education", entries: cv.education },
  { label: "Work Experience", entries: cv.work },
  { label: "Awards & Honors", entries: cv.awards },
  { label: "Teaching", entries: cv.teaching },
];

export default function Page() {
  return (
    <>
      <div className="poster" aria-hidden="true" />
      <SurfaceCanvas />
      <div className="vignette" aria-hidden="true" />
      <Hud />

      <main>
        <section className="hero">
          <div className="wrap hero-lockup">
            <div className="kicker">{site.kicker}</div>
            <h1 className="name">{site.name}</h1>
            <p className="tagline">{site.tagline}</p>
            <div className="scroll-cue">
              <span className="cue-tick" />
              scroll — deform the family
            </div>
          </div>
        </section>

        <section className="block" id="about">
          <div className="wrap">
            <div className="sec-head" data-reveal>
              <span className="sec-index">§1</span>
              <h2>About</h2>
              <span className="sec-sub">the base field</span>
            </div>
            <div className="about-grid">
              <div className="about-text" data-reveal>
                {about.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <div className="about-portrait" data-reveal>
                <PhotoFrame photo={about.photo} wide />
              </div>
            </div>
            <div className="about-viz" data-reveal>
              <div className="viz-box">
                <PencilCanvas />
                <span className="viz-label">pencil y² = x³ + ax + b · live discriminant</span>
              </div>
              <div className="viz-box">
                <ComplexRootsCanvas />
                <span className="viz-label">z² + 1 = 0 · two roots appear off ℝ</span>
              </div>
            </div>
          </div>
        </section>

        <section className="block" id="projects">
          <div className="wrap">
            <div className="sec-head" data-reveal>
              <span className="sec-index">§2</span>
              <h2>Projects</h2>
              <span className="sec-sub">vanishing loci</span>
            </div>
            <div className="papers">
              {projects.map((p, i) => (
                <article className="paper" data-reveal key={i}>
                  <div className="paper-motif">
                    <CurveMotif kind={p.motif} />
                  </div>
                  <div>
                    <h3>{p.title}</h3>
                    <div className="paper-meta">
                      {p.coauthors} · {p.venue} · {p.year}
                    </div>
                    <p className="paper-abs">{p.abstract}</p>
                    <div className="paper-links">
                      <a className="btn" href={asset(p.pdf)} target="_blank" rel="noreferrer">
                        PDF ↗
                      </a>
                    </div>
                  </div>
                  <span className="paper-num">{String(i + 1).padStart(2, "0")}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="block" id="cv">
          <div className="wrap">
            <div className="sec-head" data-reveal>
              <span className="sec-index">§3</span>
              <h2>Curriculum Vitae</h2>
              <span className="sec-sub">invariants</span>
            </div>
            <p className="cv-intro" data-reveal>
              {cvIntro}
            </p>
            <div className="cv-actions" data-reveal>
              {cvPdf.available ? (
                <a className="btn" href={asset(cvPdf.href)} download>
                  Download PDF ↗
                </a>
              ) : (
                <span className="btn ghost-disabled">PDF — soon</span>
              )}
            </div>
            {cvSections.map((s) => (
              <div className="cv-block" data-reveal key={s.label}>
                <h3>{s.label}</h3>
                <div className="cv-card">
                  {s.entries.map((e, i) => (
                    <div className={`cv-entry${e.photo ? " has-photo" : ""}`} key={i}>
                      {e.logo ? (
                        <span className="cv-logo">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={asset(e.logo)} alt={`${e.org ?? e.title} logo`} />
                        </span>
                      ) : e.monogram ? (
                        <span
                          className="cv-logo cv-logo--mono"
                          style={{ ["--mono" as string]: e.monogram.color }}
                        >
                          {e.monogram.text}
                        </span>
                      ) : (
                        <span className="cv-logo cv-logo--empty" aria-hidden="true" />
                      )}
                      <div className="cv-entry-main">
                        <h4>{e.title}</h4>
                        {e.org && <div className="cv-org">{e.org}</div>}
                        <div className="cv-period">{e.period}</div>
                        {e.detail && <div className="cv-detail">{e.detail}</div>}
                        {e.aside && <p className="cv-aside">{e.aside}</p>}
                      </div>
                      {e.photo && <PhotoFrame photo={e.photo} />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="block" id="courses">
          <div className="wrap">
            <div className="sec-head" data-reveal>
              <span className="sec-index">§4</span>
              <h2>Courses</h2>
              <span className="sec-sub">the syllabus</span>
            </div>
            <div className="courses-layout">
              <div className="courses-groups">
                {courses.map((g) => (
                  <div
                    className={`course-group${g.note === "in progress" ? " course-group--current" : ""}`}
                    data-reveal
                    key={g.label}
                  >
                    <div className="course-group-head">
                      <h3>{g.label}</h3>
                      <span className="course-group-note">{g.note}</span>
                    </div>
                    <div className="course-list">
                      {g.items.map((c) => (
                        <div className="course-item" key={c.code}>
                          <span className="course-code">{c.code}</span>
                          <span className="course-title">{c.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="courses-aside" data-reveal>
                <PhotoFrame photo={coursesPhoto} />
              </div>
            </div>
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="wrap">
            <div className="contact-head" data-reveal>
              <span className="sec-index">§5</span>
              <h2>Contact</h2>
            </div>
            <div className="constellation-box" data-reveal>
              <Constellation />
            </div>
            <div className="constellation-label">
              what remains of X — 16 nodes ↔ A[2] ≅ (𝔽₂)⁴
            </div>
            <div className="contact-row" data-reveal>
              {links.map((l) => (
                <a className="btn" href={l.href} key={l.label} target="_blank" rel="noreferrer">
                  {l.label} ↗
                </a>
              ))}
              <EmailLink />
            </div>
            <div className="fineprint">
              © {new Date().getFullYear()} {site.name} — every figure on this page is the zero
              locus of a polynomial
            </div>
          </div>
        </section>
      </main>

      <Reveals />
    </>
  );
}
