"use client";

import { useEffect, useRef } from "react";

// A drifting pencil of elliptic curves y² = x³ + ax + b.
// The curve nearest the discriminant locus 4a³ + 27b² = 0 — the one about
// to acquire a node — is the one that glows.

const XMIN = -2.1, XMAX = 2.5, YMIN = -2.7, YMAX = 2.7;
const N_CURVES = 13;

export default function PencilCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0, h = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw(8.0);
    });
    ro.observe(canvas);

    const px = (x: number) => ((x - XMIN) / (XMAX - XMIN)) * w;
    const py = (y: number) => h * (1 - (y - YMIN) / (YMAX - YMIN));

    const strokeBranches = (a: number, b: number) => {
      // y = ±√(x³ + ax + b), with gaps where the cubic is negative
      for (const sgn of [1, -1]) {
        ctx.beginPath();
        let pen = false;
        for (let x = XMIN; x <= XMAX; x += 0.016) {
          const v = x * x * x + a * x + b;
          if (v >= 0) {
            const y = sgn * Math.sqrt(v);
            if (pen) ctx.lineTo(px(x), py(y));
            else { ctx.moveTo(px(x), py(y)); pen = true; }
          } else {
            pen = false;
          }
        }
        ctx.stroke();
      }
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(120, 200, 255, 0.10)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px(0), 0); ctx.lineTo(px(0), h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, py(0)); ctx.lineTo(w, py(0)); ctx.stroke();

      const a = -1.1 + 0.55 * Math.sin(t * 0.13);
      for (let i = 0; i < N_CURVES; i++) {
        const b = -1.0 + (2.0 * i) / (N_CURVES - 1) + 0.18 * Math.sin(t * 0.21 + i * 1.7);
        const disc = 4 * a * a * a + 27 * b * b;
        const near = Math.exp(-Math.abs(disc) * 1.3);
        // far curves drift cool (blue-green); the near-singular one flares violet
        const cool = i / (N_CURVES - 1); // 0 → green, 1 → blue across the pencil
        const baseR = 93 + (78 - 93) * cool;
        const baseG = 255 + (168 - 255) * cool;
        const baseB = 176 + (255 - 176) * cool;
        const r = Math.round(baseR + (155 - baseR) * near);
        const g = Math.round(baseG + (140 - baseG) * near);
        const bl = Math.round(baseB + (255 - baseB) * near);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${bl}, ${0.16 + 0.55 * near})`;
        ctx.lineWidth = 1 + 0.9 * near;
        ctx.shadowColor = `rgba(${r}, ${g}, ${bl}, 0.8)`;
        ctx.shadowBlur = 10 * near;
        strokeBranches(a, b);
      }
      ctx.shadowBlur = 0;
    };

    if (reduced) {
      draw(8.0);
      return () => ro.disconnect();
    }

    let raf = 0;
    let last = 0;
    let visible = true;
    const t0 = performance.now();

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || now - last < 33) return;
      last = now;
      draw((now - t0) / 1000);
    };
    raf = requestAnimationFrame(loop);

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" />;
}
