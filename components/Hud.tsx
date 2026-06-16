"use client";

import { useEffect, useRef } from "react";

interface HudDetail {
  mu2: number;
  p: number;
  scanOn: number;
  scanZ: number;
}

export default function Hud() {
  const muRef = useRef<HTMLSpanElement>(null);
  const tRef = useRef<HTMLSpanElement>(null);
  const scanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<HudDetail>).detail;
      if (muRef.current) muRef.current.textContent = d.mu2.toFixed(4);
      if (tRef.current) tRef.current.textContent = d.p.toFixed(3);
      if (scanRef.current) {
        scanRef.current.textContent =
          d.scanOn > 0.05
            ? `H ∩ X — z = ${d.scanZ >= 0 ? "+" : ""}${d.scanZ.toFixed(2)}`
            : "H ∩ X — idle";
      }
    };
    window.addEventListener("acd:hud", on);
    return () => window.removeEventListener("acd:hud", on);
  }, []);

  return (
    <div className="hud" aria-hidden="true">
      <div className="hud-tl">
        Kummer family — quartic X<sub>t</sub> ⊂ P³
        <br />
        Sing X<sub>t</sub> = 16 × A₁
      </div>
      <div className="hud-tr">
        μ² = <span className="v" ref={muRef}>1.4500</span>
        <br />
        t = <span className="v" ref={tRef}>0.000</span>
      </div>
      <div className="hud-bl">
        scroll = deformation parameter
        <br />
        <span className="v" ref={scanRef}>H ∩ X — idle</span>
      </div>
      <div className="hud-br">
        minimal resolution: K3
        <br />χ = 24
      </div>
    </div>
  );
}
