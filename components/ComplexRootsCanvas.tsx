"use client";

import { useEffect, useRef } from "react";

// "Expand the domain." The real parabola y = x² + 1 floats clear of the axis —
// no real root — but z² + 1 = 0 has two solutions ±i, hiding off the real line.
// A disk widens out of ℝ until it captures them; the roots flare as it does.
// (The valedictory analogy, made live.)

export default function ComplexRootsCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const RX = 2.6, RY = 2.2;
    let w = 0, h = 0, sx = 1, sy = 1;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sx = w / (2 * RX);
      sy = h / (2 * RY);
    };
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw(8.0);
    });
    ro.observe(canvas);

    const px = (re: number) => w / 2 + re * sx;
    const py = (im: number) => h / 2 - im * sy;

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);

      // faint integer grid
      ctx.strokeStyle = "rgba(120, 200, 255, 0.055)";
      ctx.lineWidth = 1;
      for (let re = -2; re <= 2; re++) {
        ctx.beginPath(); ctx.moveTo(px(re), 0); ctx.lineTo(px(re), h); ctx.stroke();
      }
      for (let im = -2; im <= 2; im++) {
        ctx.beginPath(); ctx.moveTo(0, py(im)); ctx.lineTo(w, py(im)); ctx.stroke();
      }

      // the real line ℝ — drawn strong; everything starts here
      ctx.strokeStyle = "rgba(150, 190, 182, 0.5)";
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(0, py(0)); ctx.lineTo(w, py(0)); ctx.stroke();
      // imaginary axis, dimmer
      ctx.strokeStyle = "rgba(150, 190, 182, 0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px(0), 0); ctx.lineTo(px(0), h); ctx.stroke();

      // real parabola y = x² + 1 — warm/amber, contrasting; never meets ℝ
      ctx.strokeStyle = "rgba(242, 182, 92, 0.55)";
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      let pen = false;
      for (let x = -1.5; x <= 1.5; x += 0.02) {
        const y = x * x + 1;
        if (y > RY + 0.1) { pen = false; continue; }
        const X = px(x), Y = py(y);
        if (pen) ctx.lineTo(X, Y); else { ctx.moveTo(X, Y); pen = true; }
      }
      ctx.stroke();

      // the domain disk, widening out of the real line to reach ±i
      const grow = reduced ? 1 : 0.5 - 0.5 * Math.cos(t * 0.55); // 0 → 1 → 0
      const R = 0.08 + 1.08 * grow;
      ctx.strokeStyle = `rgba(93, 255, 176, ${0.12 + 0.22 * grow})`;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.ellipse(px(0), py(0), R * sx, R * sy, 0, 0, Math.PI * 2);
      ctx.stroke();

      // the two roots ±i, lit once the disk passes them
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.0);
      const roots: { im: number; rgb: string; label: string }[] = [
        { im: 1, rgb: "93, 255, 176", label: "i" },
        { im: -1, rgb: "78, 168, 255", label: "−i" },
      ];
      ctx.font = "12px ui-monospace, monospace";
      for (const r of roots) {
        const X = px(0), Y = py(r.im);
        const lit = R >= Math.abs(r.im) - 0.02;
        ctx.shadowColor = `rgba(${r.rgb}, 0.95)`;
        ctx.shadowBlur = lit ? 10 + 9 * pulse : 0;
        ctx.fillStyle = `rgba(${r.rgb}, ${lit ? 0.9 : 0.22})`;
        ctx.beginPath();
        ctx.arc(X, Y, lit ? 3.2 + 1.1 * pulse : 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(${r.rgb}, ${lit ? 0.85 : 0.3})`;
        ctx.fillText(r.label, X + 9, Y + (r.im > 0 ? -6 : 14));
      }

      // 1 on the real axis, for scale
      ctx.fillStyle = "rgba(150, 190, 182, 0.45)";
      ctx.beginPath(); ctx.arc(px(1), py(0), 1.6, 0, Math.PI * 2); ctx.fill();
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
