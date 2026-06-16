"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { VERT, FRAG } from "@/lib/shaders";

type Key = [p: number, v: number];

// μ²(scroll): tighten the nodes, relax toward the smooth range, return —
// the scroll bar is the parameter of the family.
const KEYS_MU: Key[] = [
  [0.0, 1.45],
  [0.22, 2.06],
  [0.5, 0.97],
  [0.78, 1.62],
  [1.0, 1.62],
];

// How far the surface recedes behind content.
const KEYS_DIM: Key[] = [
  [0.0, 0.0],
  [0.16, 0.0],
  [0.3, 0.76],
  [0.74, 0.76],
  [0.88, 0.4],
  [1.0, 0.22],
];

const sstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function keyLerp(keys: Key[], p: number): number {
  if (p <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [pa, va] = keys[i];
    const [pb, vb] = keys[i + 1];
    if (p <= pb) return va + (vb - va) * sstep(pa, pb, p);
  }
  return keys[keys.length - 1][1];
}

// Trapezoid for the hyperplane-section scan through the research block.
const scanWindow = (p: number) => sstep(0.4, 0.46, p) * (1 - sstep(0.68, 0.74, p));

export default function SurfaceCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    });
    if (!gl) return; // the .poster layer remains as the static fallback

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn("shader:", gl.getShaderInfoLog(sh));
      }
      return sh;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("link:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const U = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = U("uRes");
    const uTime = U("uTime");
    const uMu2 = U("uMu2");
    const uMouse = U("uMouse");
    const uDim = U("uDim");
    const uDissolve = U("uDissolve");
    const uScanOn = U("uScanOn");
    const uScanZ = U("uScanZ");
    const uYaw = U("uYaw");
    const uSteps = U("uSteps");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    gl.uniform1i(uSteps, coarse ? 84 : 120);

    const dprCap = coarse ? 1.5 : 2;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const target = { p: 0, mx: 0, my: 0 };
    const cur = { p: 0, mx: 0, my: 0 };

    const onMove = (e: PointerEvent) => {
      target.mx = (e.clientX / window.innerWidth) * 2 - 1;
      target.my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (s) => {
        target.p = s.progress;
      },
    });

    let raf = 0;
    let hudTick = 0;
    const t0 = performance.now();

    const renderFrame = (timeSec: number) => {
      const mu2 = keyLerp(KEYS_MU, cur.p) + Math.sin(timeSec * 0.5) * 0.012;
      const dim = keyLerp(KEYS_DIM, cur.p);
      const dissolve = sstep(0.8, 0.97, cur.p);
      const scanOn = scanWindow(cur.p);
      const scanZ = -1.3 + 2.6 * Math.min(1, Math.max(0, (cur.p - 0.43) / 0.28));

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, timeSec);
      gl.uniform1f(uMu2, mu2);
      gl.uniform2f(uMouse, cur.mx, cur.my);
      gl.uniform1f(uDim, dim);
      gl.uniform1f(uDissolve, dissolve);
      gl.uniform1f(uScanOn, scanOn);
      gl.uniform1f(uScanZ, scanZ);
      gl.uniform1f(uYaw, cur.p * 1.6);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (++hudTick % 6 === 0) {
        window.dispatchEvent(
          new CustomEvent("acd:hud", { detail: { mu2, p: cur.p, scanOn, scanZ } })
        );
      }
    };

    const loop = (now: number) => {
      cur.p += (target.p - cur.p) * 0.075;
      cur.mx += (target.mx - cur.mx) * 0.05;
      cur.my += (target.my - cur.my) * 0.05;
      renderFrame((now - t0) / 1000);
      raf = requestAnimationFrame(loop);
    };

    if (reduced) {
      // One still frame of the mid-family surface; scroll changes nothing.
      cur.p = 0;
      renderFrame(12.0);
    } else {
      raf = requestAnimationFrame(loop);
    }

    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduced) raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      st.kill();
      ro.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas ref={ref} className="stage" aria-hidden="true" />;
}
