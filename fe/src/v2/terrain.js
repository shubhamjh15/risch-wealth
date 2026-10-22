// The compounding landscape on the v2 home page, in plain three.js.
//
// A field of ridgelines where depth is time: the front row is today, the
// horizon is year 25. Each row's height follows the compounding curve
// (1 + r)^t, and ridged noise gives it the texture of a mountain range, so
// the range literally rises the way capital compounds. Rows ahead of the
// current year lie flat and faint; scrolling reveals them one by one.
//
// A black surface under the lines hides the ridges behind it, which gives
// the clean "hidden line" look. Loaded lazily (dynamic import) so three.js
// never sits in the critical path.
import * as THREE from 'three';

const YEARS = 25;
export const MAX_RATE = 0.12; // the highest rate on offer; heights are scaled to it

// Small deterministic value noise, so the range looks the same every visit.
function hash(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise(x, y) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function ridged(x, y) {
  let amp = 0.5;
  let f = 1;
  let sum = 0;
  for (let i = 0; i < 5; i++) {
    let n = 1 - Math.abs(noise(x * f, y * f) * 2 - 1);
    n *= n;
    sum += n * amp;
    f *= 2.03;
    amp *= 0.5;
  }
  return sum;
}

const vertex = /* glsl */ `
  uniform float uYear;
  uniform float uRate;
  uniform float uMaxMult;
  uniform float uAmp;
  attribute float aH;
  attribute float aT;
  varying float vReveal;
  varying float vDepth;
  varying float vT;
  varying float vH;
  void main() {
    float reveal = clamp((uYear - aT) / 0.06, 0.0, 1.0);
    reveal = reveal * reveal * (3.0 - 2.0 * reveal);
    float env = (pow(1.0 + uRate, aT * ${YEARS.toFixed(1)}) - 1.0) / (uMaxMult - 1.0);
    float h = (0.04 + env) * (0.22 + 0.78 * aH);
    vec3 p = position;
    p.y = h * uAmp * reveal + aH * 0.05;
    vReveal = reveal;
    vT = aT;
    vH = h;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const lineFragment = /* glsl */ `
  uniform float uYear;
  uniform vec3 uColor;
  uniform vec3 uAccent;
  varying float vReveal;
  varying float vDepth;
  varying float vT;
  varying float vH;
  void main() {
    float fog = 1.0 - smoothstep(9.0, 24.0, vDepth);
    float front = 1.0 - smoothstep(0.0, 0.014, abs(uYear - vT));
    float a = mix(0.06, 0.5 + vH * 0.5, vReveal) + front * 0.7;
    // the current year burns in the accent; high ridges warm toward it
    float warm = clamp(front * 1.3 + smoothstep(0.3, 0.95, vH) * 0.9 * vReveal, 0.0, 1.0);
    gl_FragColor = vec4(mix(uColor, uAccent, warm), a * fog);
  }
`;

const surfaceFragment = /* glsl */ `
  uniform vec3 uBg;
  void main() { gl_FragColor = vec4(uBg, 1.0); }
`;

export function createTerrain(canvas, { small = false, bg: bgColor = '#0C0B0A', line = '#F4F0E9', accent = '#E36A1A' } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  const bg = new THREE.Color(bgColor);
  renderer.setClearColor(bg, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);

  // Grid: columns across (x), rows into the distance (z = time).
  const COLS = small ? 120 : 220;
  const ROWS = small ? 64 : 110;
  const X0 = -12;
  const X1 = 12;
  const Z0 = 5; // today
  const Z1 = -10; // year 25
  const count = COLS * ROWS;
  const pos = new Float32Array(count * 3);
  const aH = new Float32Array(count);
  const aT = new Float32Array(count);
  let maxH = 0;
  for (let r = 0; r < ROWS; r++) {
    const t = r / (ROWS - 1);
    const z = Z0 + (Z1 - Z0) * t;
    for (let c = 0; c < COLS; c++) {
      const x = X0 + (X1 - X0) * (c / (COLS - 1));
      const i = r * COLS + c;
      // A massif slightly right of centre, falling away to the sides.
      const massif = Math.exp(-((x - 1.5) ** 2) / 22);
      const h = ridged(x * 0.26 + 3.1, z * 0.3 + 7.7) * (0.35 + 0.65 * massif);
      pos[i * 3] = x;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = z;
      aH[i] = h;
      aT[i] = t;
      if (h > maxH) maxH = h;
    }
  }
  for (let i = 0; i < count; i++) aH[i] = Math.pow(aH[i] / maxH, 1.25);

  const posAttr = new THREE.BufferAttribute(pos, 3);
  const hAttr = new THREE.BufferAttribute(aH, 1);
  const tAttr = new THREE.BufferAttribute(aT, 1);

  const lineIdx = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 1; c++) lineIdx.push(r * COLS + c, r * COLS + c + 1);
  }
  const triIdx = [];
  for (let r = 0; r < ROWS - 1; r++) {
    for (let c = 0; c < COLS - 1; c++) {
      const a = r * COLS + c;
      const b = a + 1;
      const d = a + COLS;
      const e = d + 1;
      triIdx.push(a, d, b, b, d, e);
    }
  }

  const uniforms = {
    uYear: { value: 0 },
    uRate: { value: 0.1 },
    uMaxMult: { value: Math.pow(1 + MAX_RATE, YEARS) },
    uAmp: { value: 3.4 },
    uColor: { value: new THREE.Color(line) },
    uAccent: { value: new THREE.Color(accent) },
    uBg: { value: bg },
  };

  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', posAttr);
  lineGeo.setAttribute('aH', hAttr);
  lineGeo.setAttribute('aT', tAttr);
  lineGeo.setIndex(lineIdx);
  const lines = new THREE.LineSegments(lineGeo, new THREE.ShaderMaterial({
    uniforms, vertexShader: vertex, fragmentShader: lineFragment, transparent: true, depthWrite: false,
  }));
  lines.frustumCulled = false;

  const surfGeo = new THREE.BufferGeometry();
  surfGeo.setAttribute('position', posAttr);
  surfGeo.setAttribute('aH', hAttr);
  surfGeo.setAttribute('aT', tAttr);
  surfGeo.setIndex(triIdx);
  const surface = new THREE.Mesh(surfGeo, new THREE.ShaderMaterial({
    uniforms, vertexShader: vertex, fragmentShader: surfaceFragment,
    polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
  }));
  surface.frustumCulled = false;
  surface.renderOrder = 0;
  lines.renderOrder = 1;
  scene.add(surface, lines);

  // Camera rig: eases toward its target so scroll and pointer feel weighted.
  const pointer = { x: 0, y: 0 };
  const look = new THREE.Vector3(0, 0.9, -3);
  let progress = 0;
  let width = 1;
  let height = 1;

  function resize() {
    width = canvas.clientWidth || 1;
    height = canvas.clientHeight || 1;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Keep the whole range in frame on tall (mobile) screens.
    camera.fov = camera.aspect < 1 ? 52 : 38;
    camera.updateProjectionMatrix();
  }

  let raf = 0;
  let running = false;
  const cam = new THREE.Vector3(0, 3.4, 10.5);
  function frame() {
    raf = requestAnimationFrame(frame);
    const tx = pointer.x * 1.4;
    const ty = 3.2 + progress * 1.2 - pointer.y * 0.5;
    const tz = 10.8 - progress * 2.6;
    cam.x += (tx - cam.x) * 0.04;
    cam.y += (ty - cam.y) * 0.04;
    cam.z += (tz - cam.z) * 0.04;
    camera.position.copy(cam);
    camera.lookAt(look);
    renderer.render(scene, camera);
  }

  resize();
  renderer.render(scene, camera);

  return {
    // 0..1 through the 25 years
    setProgress(p) {
      progress = p;
      uniforms.uYear.value = p * 1.04;
    },
    setRate(r) { uniforms.uRate.value = r; },
    get rate() { return uniforms.uRate.value; },
    setPointer(x, y) { pointer.x = x; pointer.y = y; },
    resize,
    start() {
      if (running) return;
      running = true;
      frame();
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    dispose() {
      cancelAnimationFrame(raf);
      lineGeo.dispose();
      surfGeo.dispose();
      lines.material.dispose();
      surface.material.dispose();
      renderer.dispose();
    },
  };
}
