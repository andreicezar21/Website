"use client";

import { useEffect, useRef } from "react";

// "Live roots of unity." The zero locus of xⁿ − 1 = 0 is the n points
// ζ_k = e^(2πik/n) on the unit circle; n cycles slowly upward and the roots
// are joined in order into the regular {n/1} polygon. The primitive roots
// (gcd(k, n) = 1) are highlighted — these are exactly the elements permuted
// simply transitively by Gal(ℚ(ζ_n)/ℚ) ≅ (ℤ/nℤ)ˣ, and they number φ(n).

const N_MIN = 3;
const N_MAX = 24;
const HOLD = 0.95; // seconds each n is held before stepping up

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

export default function RootsOfUnityCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const VIEW = 1.5; // half-extent of the plane shown, in both axes
    let w = 0, h = 0, s = 1; // uniform scale keeps the unit circle round
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s = Math.min(w / (2 * VIEW), h / (2 * VIEW));
    };
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw(8.0);
    });
    ro.observe(canvas);

    const px = (re: number) => w / 2 + re * s;
    const py = (im: number) => h / 2 - im * s;

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);

      // faint integer grid — same styling as the sibling panel
      ctx.strokeStyle = "rgba(120, 200, 255, 0.055)";
      ctx.lineWidth = 1;
      for (let re = -1; re <= 1; re++) {
        ctx.beginPath(); ctx.moveTo(px(re), 0); ctx.lineTo(px(re), h); ctx.stroke();
      }
      for (let im = -1; im <= 1; im++) {
        ctx.beginPath(); ctx.moveTo(0, py(im)); ctx.lineTo(w, py(im)); ctx.stroke();
      }

      // real axis strong, imaginary axis dimmer
      ctx.strokeStyle = "rgba(150, 190, 182, 0.5)";
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(0, py(0)); ctx.lineTo(w, py(0)); ctx.stroke();
      ctx.strokeStyle = "rgba(150, 190, 182, 0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px(0), 0); ctx.lineTo(px(0), h); ctx.stroke();

      // the unit circle — the locus the roots live on (lavender, faint)
      ctx.strokeStyle = "rgba(139, 124, 246, 0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(px(0), py(0), s, 0, Math.PI * 2); ctx.stroke();

      // which n, and a soft fade as each new n appears
      const span = N_MAX - N_MIN + 1;
      const phase = t / HOLD;
      const n = reduced ? 12 : N_MIN + (Math.floor(phase) % span);
      const within = reduced ? 1 : phase - Math.floor(phase);
      const fade = Math.min(1, within / 0.22); // ramp in over the first fifth
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.0);

      const ang = (k: number) => (2 * Math.PI * k) / n;
      const ptx = (k: number) => px(Math.cos(ang(k)));
      const pty = (k: number) => py(Math.sin(ang(k)));

      // chords joining the roots in order: the regular {n/1} polygon
      ctx.strokeStyle = `rgba(93, 255, 176, ${0.42 * fade})`;
      ctx.lineWidth = 1.4;
      ctx.shadowColor = "rgba(93, 255, 176, 0.5)";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(ptx(0), pty(0));
      for (let k = 1; k <= n; k++) ctx.lineTo(ptx(k % n), pty(k % n));
      ctx.stroke();
      ctx.shadowBlur = 0;

      // the roots: primitive ones (gcd = 1) flare green; the rest sit dim in blue
      let phi = 0;
      for (let k = 0; k < n; k++) {
        const primitive = gcd(k, n) === 1;
        if (primitive) phi++;
        const X = ptx(k), Y = pty(k);
        if (primitive) {
          ctx.shadowColor = "rgba(93, 255, 176, 0.95)";
          ctx.shadowBlur = (10 + 9 * pulse) * fade;
          ctx.fillStyle = `rgba(93, 255, 176, ${0.92 * fade})`;
          ctx.beginPath();
          ctx.arc(X, Y, (3.0 + 1.0 * pulse) * Math.max(fade, 0.4), 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = `rgba(78, 168, 255, ${0.5 * fade})`;
          ctx.beginPath();
          ctx.arc(X, Y, 2.0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ζ_0 = 1 sits on the real axis; a faint tick for scale
      ctx.fillStyle = "rgba(150, 190, 182, 0.45)";
      ctx.beginPath(); ctx.arc(px(1), py(0), 1.4, 0, Math.PI * 2); ctx.fill();

      // live readout: n and φ(n) = #primitive roots = deg of the cyclotomic poly
      ctx.font = "11px ui-monospace, monospace";
      ctx.fillStyle = "rgba(150, 190, 182, 0.6)";
      ctx.fillText(`n = ${n}`, 12, 18);
      ctx.fillStyle = "rgba(93, 255, 176, 0.7)";
      ctx.fillText(`φ(n) = ${phi}`, 12, 32);
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
