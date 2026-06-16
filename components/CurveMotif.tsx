"use client";

import { useEffect, useRef } from "react";
import type { Project } from "@/lib/content";

// Static badges for project cards. The plane-curve kinds are honest curves
// with the violet dot at the singular point; the others are emblems matched
// to each write-up (Cayley graph, unit circle at e^iπ, mine grid).

type Pt = [number, number];

function tracePolylines(kind: Project["motif"]): Pt[][] {
  const lines: Pt[][] = [];
  if (kind === "node") {
    // y² = x²(x + 1): x = t² − 1, y = t³ − t — the node is at the origin
    const pts: Pt[] = [];
    for (let t = -1.55; t <= 1.55; t += 0.02) pts.push([t * t - 1, t * t * t - t]);
    lines.push(pts);
  } else if (kind === "cusp") {
    // y² = x³: x = t², y = t³
    const pts: Pt[] = [];
    for (let t = -1.3; t <= 1.3; t += 0.02) pts.push([t * t, t * t * t]);
    lines.push(pts);
  } else if (kind === "lemniscate") {
    // (x² + y²)² = x² − y²
    for (const off of [0, Math.PI]) {
      const pts: Pt[] = [];
      for (let th = -Math.PI / 4; th <= Math.PI / 4; th += 0.015) {
        const c = Math.cos(2 * th);
        if (c < 0) continue;
        const r = Math.sqrt(c);
        pts.push([r * Math.cos(th + off), r * Math.sin(th + off)]);
      }
      lines.push(pts);
    }
  } else {
    // trifolium r = cos(3θ) — a triple point at the origin
    const pts: Pt[] = [];
    for (let th = 0; th <= Math.PI + 1e-6; th += 0.012) {
      const r = Math.cos(3 * th);
      pts.push([r * Math.cos(th), r * Math.sin(th)]);
    }
    lines.push(pts);
  }
  return lines;
}

const ACCENT = "rgba(99, 242, 197, 0.85)";
const ACCENT_FAINT = "rgba(148, 184, 173, 0.10)";
const VIOLET = "rgba(139, 124, 246, 0.95)";

// Cayley graph of Z/8 with generator 3 — the star polygon {8/3}.
function drawGroup(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const r = (Math.min(w, h) - 26) / 2;
  const v = (i: number): Pt => [
    w / 2 + r * Math.sin((i * 2 * Math.PI) / 8),
    h / 2 - r * Math.cos((i * 2 * Math.PI) / 8),
  ];
  ctx.strokeStyle = ACCENT_FAINT;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  let i = 0;
  ctx.moveTo(...v(0));
  do {
    i = (i + 3) % 8;
    ctx.lineTo(...v(i));
  } while (i !== 0);
  ctx.stroke();

  ctx.fillStyle = ACCENT;
  for (let k = 1; k < 8; k++) {
    ctx.beginPath();
    ctx.arc(...v(k), 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = VIOLET; // the identity
  ctx.beginPath();
  ctx.arc(...v(0), 2.4, 0, Math.PI * 2);
  ctx.fill();
}

// Unit circle with e⁰ = 1 marked in accent and e^iπ = −1 in violet.
function drawPi(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const r = (Math.min(w, h) - 26) / 2;
  ctx.strokeStyle = ACCENT_FAINT;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();

  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = ACCENT;
  ctx.beginPath();
  ctx.arc(w / 2 + r, h / 2, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = VIOLET;
  ctx.beginPath();
  ctx.arc(w / 2 - r, h / 2, 2.4, 0, Math.PI * 2);
  ctx.fill();
}

// The 4×4 tile grid of the casino game, two mines in violet.
function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const span = Math.min(w, h) - 26;
  const cell = span / 3;
  const x0 = (w - span) / 2;
  const y0 = (h - span) / 2;
  const mines = new Set([6, 13]);
  for (let i = 0; i < 16; i++) {
    const cx = x0 + (i % 4) * cell;
    const cy = y0 + Math.floor(i / 4) * cell;
    if (mines.has(i)) {
      ctx.fillStyle = VIOLET;
      ctx.beginPath();
      ctx.arc(cx, cy, 2.4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = ACCENT;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, 1.8, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

export default function CurveMotif({ kind }: { kind: Project["motif"] }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || 104;
    const h = canvas.clientHeight || 104;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (kind === "group" || kind === "pi" || kind === "grid") {
      ctx.clearRect(0, 0, w, h);
      if (kind === "group") drawGroup(ctx, w, h);
      else if (kind === "pi") drawPi(ctx, w, h);
      else drawGrid(ctx, w, h);
      return;
    }

    const lines = tracePolylines(kind);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const pts of lines)
      for (const [x, y] of pts) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    const span = Math.max(maxX - minX, maxY - minY) || 1;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const s = (Math.min(w, h) - 26) / span;
    const px = (x: number) => w / 2 + (x - cx) * s;
    const py = (y: number) => h / 2 - (y - cy) * s;

    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(148, 184, 173, 0.10)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px(0), 0); ctx.lineTo(px(0), h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, py(0)); ctx.lineTo(w, py(0)); ctx.stroke();

    ctx.strokeStyle = "rgba(99, 242, 197, 0.85)";
    ctx.lineWidth = 1.2;
    for (const pts of lines) {
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(px(x), py(y)) : ctx.lineTo(px(x), py(y))));
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(139, 124, 246, 0.95)";
    ctx.beginPath();
    ctx.arc(px(0), py(0), 2.4, 0, Math.PI * 2);
    ctx.fill();
  }, [kind]);

  return <canvas ref={ref} style={{ width: "100%", height: "100%" }} aria-hidden="true" />;
}
