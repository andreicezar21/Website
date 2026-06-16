"use client";

import { useEffect, useRef } from "react";

// The 16 nodes of the Kummer surface are the 2-torsion A[2] ≅ (𝔽₂)⁴ of the
// abelian surface it resolves — i.e. the vertices of a 4-cube. Drawn here as
// a tesseract rotating in two orthogonal planes of R⁴; edges join points at
// Hamming distance 1.

const VERTS: number[][] = [];
for (let i = 0; i < 16; i++) {
  VERTS.push([i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1, i & 8 ? 1 : -1]);
}

const EDGES: [number, number][] = [];
for (let i = 0; i < 16; i++) {
  for (let j = i + 1; j < 16; j++) {
    const d = i ^ j;
    if ((d & (d - 1)) === 0) EDGES.push([i, j]);
  }
}

export default function Constellation() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0, h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw(6.0);
    });
    ro.observe(canvas);

    const project = (t: number): [number, number, number, number][] => {
      const a = t * 0.21, b = t * 0.16, g = t * 0.12, tilt = 0.42;
      return VERTS.map(([x0, y0, z0, w0]) => {
        // rotate in the (x,w), (y,z), (z,w) planes
        let x = x0 * Math.cos(a) - w0 * Math.sin(a);
        let ww = x0 * Math.sin(a) + w0 * Math.cos(a);
        let y = y0 * Math.cos(b) - z0 * Math.sin(b);
        let z = y0 * Math.sin(b) + z0 * Math.cos(b);
        const z2 = z * Math.cos(g) - ww * Math.sin(g);
        ww = z * Math.sin(g) + ww * Math.cos(g);
        z = z2;
        // 4D → 3D perspective from w
        const s = 1.9 / (2.9 - ww * 0.8);
        x *= s; y *= s; z *= s;
        // gentle 3D tilt, then orthographic with depth cue
        const y2 = y * Math.cos(tilt) - z * Math.sin(tilt);
        const z3 = y * Math.sin(tilt) + z * Math.cos(tilt);
        const unit = Math.min(w, h) * 0.23;
        const depth = Math.max(0, Math.min(1, (z3 + 2.2) / 4.4));
        return [w / 2 + x * unit, h / 2 - y2 * unit, depth, 0];
      });
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const P = project(t);

      ctx.lineWidth = 1;
      for (const [i, j] of EDGES) {
        const a = (P[i][2] + P[j][2]) / 2;
        ctx.strokeStyle = `rgba(99, 242, 197, ${0.05 + 0.09 * a})`;
        ctx.beginPath();
        ctx.moveTo(P[i][0], P[i][1]);
        ctx.lineTo(P[j][0], P[j][1]);
        ctx.stroke();
      }

      P.forEach(([x, y, depth], i) => {
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.3 + i * 0.7);
        const r = (1.7 + 0.9 * pulse) * (0.65 + 0.55 * depth);
        ctx.shadowColor = "rgba(139, 124, 246, 0.9)";
        ctx.shadowBlur = 9 * depth;
        ctx.fillStyle = `rgba(${i % 5 === 0 ? "139, 124, 246" : "99, 242, 197"}, ${0.55 + 0.4 * depth})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    };

    if (reduced) {
      draw(6.0);
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
