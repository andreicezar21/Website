// Fullscreen-triangle ray-marcher for the Kummer quartic family
//
//   X_μ : (x² + y² + z² − μ²)² − λ · p₀p₁p₂p₃ = 0,   λ = (3μ² − 1)/(3 − μ²)
//
// where p₀…p₃ are the four tetrahedral tropes. For μ² ∈ (1/3, 3) the surface
// carries 16 real nodes (A₁ singularities) — the maximum for a quartic.
// μ² is driven by scroll; nodes are detected in-shader as |∇f| → 0.

export const VERT = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;

export const FRAG = `#version 300 es
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform float uMu2;
uniform vec2  uMouse;
uniform float uDim;
uniform float uDissolve;
uniform float uScanOn;
uniform float uScanZ;
uniform float uYaw;
uniform int   uSteps;

out vec4 outColor;

const float SQ2 = 1.41421356237;
const float BOUND_R = 2.6;

float fKummer(vec3 q) {
  float m  = uMu2;
  float lam = (3.0 * m - 1.0) / (3.0 - m);
  float p0 = 1.0 - q.z - SQ2 * q.x;
  float p1 = 1.0 - q.z + SQ2 * q.x;
  float p2 = 1.0 + q.z + SQ2 * q.y;
  float p3 = 1.0 + q.z - SQ2 * q.y;
  float a  = dot(q, q) - m;
  return a * a - lam * p0 * p1 * p2 * p3;
}

vec3 gradK(vec3 p) {
  const float e = 0.0012;
  vec2 k = vec2(1.0, -1.0);
  return (k.xyy * fKummer(p + k.xyy * e) +
          k.yyx * fKummer(p + k.yyx * e) +
          k.yxy * fKummer(p + k.yxy * e) +
          k.xxx * fKummer(p + k.xxx * e)) / (4.0 * e);
}

vec2 sphereHit(vec3 ro, vec3 rd, float r) {
  float b = dot(ro, rd);
  float c = dot(ro, ro) - r * r;
  float h = b * b - c;
  if (h < 0.0) return vec2(-1.0);
  h = sqrt(h);
  return vec2(-b - h, -b + h);
}

void march(vec3 ro, vec3 rd, out float tHit, out float halo, out float occ) {
  tHit = -1.0; halo = 0.0; occ = 0.0;
  vec2 bs = sphereHit(ro, rd, BOUND_R);
  if (bs.y < 0.0) return;
  float t0 = max(bs.x, 0.0);
  float t1 = bs.y;
  float dt = (t1 - t0) / float(uSteps);
  float fp = fKummer(ro + rd * t0);
  for (int i = 1; i <= 256; i++) {
    if (i > uSteps) break;
    float t = t0 + dt * float(i);
    vec3 q = ro + rd * t;
    float f = fKummer(q);
    halo += exp(-abs(f) * 5.0) * dt;
    if (sign(f) != sign(fp)) {
      float ta = t - dt, tb = t;
      for (int j = 0; j < 10; j++) {
        float tm = 0.5 * (ta + tb);
        float fm = fKummer(ro + rd * tm);
        if (sign(fm) == sign(fp)) ta = tm; else tb = tm;
      }
      tHit = 0.5 * (ta + tb);
      occ = float(i) / float(uSteps);
      return;
    }
    fp = f;
  }
}

mat3 lookAt(vec3 ro, vec3 ta) {
  vec3 fw = normalize(ta - ro);
  vec3 ri = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(ri, fw);
  return mat3(ri, up, fw);
}

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

void main() {
  vec2 uv = (2.0 * gl_FragCoord.xy - uRes) / uRes.y;

  float yaw   = uTime * 0.07 + uMouse.x * 0.45 + uYaw;
  float pitch = 0.34 + uMouse.y * 0.20;
  float rad   = 4.35;
  vec3 ro = vec3(rad * cos(pitch) * sin(yaw), rad * sin(pitch), rad * cos(pitch) * cos(yaw));
  mat3 cam = lookAt(ro, vec3(0.0));
  vec3 rd = cam * normalize(vec3(uv, 2.05));

  float tHit, halo, occ;
  march(ro, rd, tHit, halo, occ);

  vec3 accent = vec3(0.388, 0.949, 0.773);
  vec3 hot    = vec3(0.365, 1.000, 0.690); // brighter highlight green
  vec3 blue   = vec3(0.306, 0.659, 1.000); // electric blue
  vec3 violet = vec3(0.545, 0.486, 0.965);
  vec3 warm   = vec3(1.000, 0.760, 0.330); // warm gold — the contrasting highlight

  vec3 col = vec3(0.0);
  float alpha = 0.0;
  float aura = clamp(halo * 0.5, 0.0, 1.0);

  if (tHit > 0.0) {
    vec3 q = ro + rd * tHit;
    vec3 g = gradK(q);
    float gm = length(g);
    vec3 n = g / max(gm, 1e-5);
    if (dot(n, rd) > 0.0) n = -n;

    vec3 ld = normalize(vec3(0.5, 0.85, 0.3));
    float dif = clamp(dot(n, ld), 0.0, 1.0);
    float fre = pow(1.0 - clamp(dot(n, -rd), 0.0, 1.0), 3.0);
    vec3 hv = normalize(ld - rd);
    float spe = pow(clamp(dot(n, hv), 0.0, 1.0), 64.0);

    float nodeF = smoothstep(3.2, 0.25, gm);
    float pulse = 0.85 + 0.15 * sin(uTime * 1.4 + q.x * 3.0 + q.y * 2.0);

    // cool base fill: blue picks up the shadowed faces, green the lit ones
    vec3 c = vec3(0.040, 0.058, 0.085) * (0.35 + 0.65 * dif);
    c += blue * (1.0 - dif) * 0.07;
    // rim light: blue→green fresnel with a hot-green crest on the silhouette
    c += mix(blue, accent, 0.55) * fre * 0.55;
    c += hot * pow(fre, 1.6) * 0.30;
    c += vec3(0.85, 1.0, 0.95) * spe * 0.7;
    // tight gold glint — a warm highlight that pops against the cool body
    float glint = pow(clamp(dot(n, hv), 0.0, 1.0), 200.0);
    c += warm * glint * 0.9;
    // a thin warm rim only on the very edge, contrasting the green-blue fresnel
    c += warm * pow(fre, 5.0) * 0.22;
    c += violet * nodeF * pulse * 1.15;

    float band = exp(-pow((q.z - uScanZ) * 16.0, 2.0));
    c += hot * band * uScanOn * 1.0;

    c *= 1.0 - occ * 0.55;

    // nodes flare brightest — violet core, green-blue halo
    vec3 emissive = violet * nodeF * pulse * 1.7
                  + hot * nodeF * 0.55
                  + blue * nodeF * 0.30;
    col = mix(c, emissive, uDissolve);
    alpha = mix(1.0, nodeF * (0.8 + 0.2 * pulse), uDissolve);
  }

  col += mix(accent, blue, 0.35) * aura * (0.14 + 0.30 * uDissolve);
  alpha = max(alpha, aura * (0.40 + 0.3 * uDissolve));

  col *= 1.0 - uDim * 0.82;
  alpha *= 1.0 - uDim * 0.55;

  float gr = (hash21(gl_FragCoord.xy + fract(uTime) * 17.0) - 0.5) * 0.05;
  col += gr * alpha;

  outColor = vec4(col, alpha);
}
`;
