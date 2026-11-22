// 插畫重繪（s=art）：教具用 3D 插畫上色，人物換成 kid-art.js 的手繪插畫貼圖，箭頭與地墊用 SVG 手繪。
// play-illustrations.html 在 s=art 時呼叫 setupArt() 取代人偶與箭頭，場景擺好後再呼叫 build()。
import { kidSVG } from "./kid-art.js";

const KID_ART = {
  0xff8a65: { shirt: "#ff8a65", pants: "#3f51b5", hair: "#4e342e" },
  0xffca28: { shirt: "#ffca28", pants: "#26a69a", hair: "#212121", style: 1 },
  0x66bb6a: { shirt: "#66bb6a", pants: "#8d6e63", hair: "#6d4c41", stripe: "#ffffff" },
  0x4fc3f7: { shirt: "#4fc3f7", pants: "#ef6c00", hair: "#3e2723", style: 2 },
  0xf48fb1: { shirt: "#f48fb1", pants: "#5e35b1", hair: "#212121", style: 1 },
  0xba68c8: { shirt: "#ba68c8", pants: "#455a64", hair: "#4e342e" },
};
const POSE = { stand: "front", arms: "arms", reach: "reach", throw: "throw", sit: "sit", crawl: "crawl" };
const HEIGHT = { front: 78, arms: 78, reach: 78, throw: 78, side: 78, sit: 66, crawl: 30, adult: 112 };

export function setupArt({ THREE, scene, cam, ctl, renderer }) {
  const kids = [], arrows = [];
  const kid = ({ x = 0, y = 0, z = 0, face = 0, color = 0xff8a65, pose = "stand", s = 1 }) =>
    kids.push({ x, y, z, face, s, ap: color === 0x37474f ? "adult" : (POSE[pose] || "front"), opt: KID_ART[color] || KID_ART[0xff8a65] });
  const arrow = (pts, opt = {}) => arrows.push({ pts, opt });

  async function build() {
    const rc = renderer.domElement.getBoundingClientRect(), W = rc.width, H = rc.height;
    cam.updateMatrixWorld(); cam.updateProjectionMatrix();
    const proj = (x, y, z) => { const v = new THREE.Vector3(x, y, z).project(cam); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H]; };
    // 教具：插畫上色（三階明暗＋同色系深色外框）
    const grad = new THREE.DataTexture(new Uint8Array([140, 205, 255]), 3, 1, THREE.RedFormat);
    grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
    const meshes = []; scene.traverse(m => { if (m.isMesh && m.material.type !== "ShadowMaterial") meshes.push(m); });
    for (const m of meshes) {
      const col = m.material.color.clone(), op = m.material.opacity;
      m.material = new THREE.MeshToonMaterial({ color: col, gradientMap: grad, transparent: op < 1, opacity: op });
      const hm = new THREE.MeshBasicMaterial({ color: col.clone().multiplyScalar(.42), side: THREE.BackSide });
      const sc = m.getWorldScale(new THREE.Vector3()).x || 1;
      hm.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>\ntransformed += normalize(normal) * ${(0.75 / sc).toFixed(2)};`); };
      m.add(new THREE.Mesh(m.geometry, hm));
    }
    // 人物：手繪插畫貼圖（Sprite，會被教具正確遮擋）
    await Promise.all(kids.map(async k => {
      const a = proj(k.x, k.y, k.z), b = proj(k.x + Math.sin(k.face) * 10, k.y, k.z + Math.cos(k.face) * 10);
      const art = kidSVG(k.ap, { ...k.opt, flip: b[0] < a[0] });
      const img = new Image(); img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(art.svg); await img.decode();
      const c = document.createElement("canvas"); c.width = art.w * 4; c.height = art.h * 4; c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, alphaTest: .05 }));
      const h = HEIGHT[k.ap] * (k.ap === "adult" ? 1 : k.s); sp.scale.set(h * art.w / art.h, h, 1); sp.center.set(art.ax, art.ay); sp.position.set(k.x, k.y, k.z); scene.add(sp);
      if (k.y < 1) { const sh = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshBasicMaterial({ color: 0x8a5a3a, transparent: true, opacity: .18, depthWrite: false }));
        const r = k.ap === "crawl" ? 22 : 14 * k.s; sh.rotation.x = -Math.PI / 2; sh.scale.set(r * 1.4, r, 1); sh.position.set(k.x, .5, k.z); scene.add(sh); }
    }));
    // 地墊（背景）與箭頭（前景）
    const ns = "http://www.w3.org/2000/svg";
    const layer = z => { const s = document.createElementNS(ns, "svg"); s.setAttribute("width", W); s.setAttribute("height", H); s.style.cssText = `position:fixed;left:0;top:0;z-index:${z};pointer-events:none`; document.body.append(s); return s; };
    const smooth = pts => { let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
      for (let k = 0; k < pts.length - 1; k++) { const p0 = pts[Math.max(0, k - 1)], p1 = pts[k], p2 = pts[k + 1], p3 = pts[Math.min(pts.length - 1, k + 2)];
        d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`; } return d; };
    const t = ctl.target, ring = [];
    for (let k = 0; k <= 64; k++) { const an = k / 64 * Math.PI * 2, r = 128 + 8 * Math.sin(an * 3) + 5 * Math.cos(an * 5); ring.push(proj(t.x + r * Math.cos(an), 0, t.z + r * .85 * Math.sin(an))); }
    const star = (x, y, r) => `<path d="M${x},${y - r * 2} l${r * .5},${r * 1.5} l${r * 1.5},${r * .5} l${-r * 1.5},${r * .5} l${-r * .5},${r * 1.5} l${-r * .5},${-r * 1.5} l${-r * 1.5},${-r * .5} l${r * 1.5},${-r * .5} Z" fill="#ffc23d" opacity=".75"/>`;
    layer(-1).innerHTML = `<defs><radialGradient id="mg" cx="50%" cy="40%" r="65%"><stop offset="0" stop-color="#fff0dc"/><stop offset="1" stop-color="#ffdcb8"/></radialGradient>
      <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="7"/></filter></defs>
      <path d="${smooth(ring)}Z" fill="url(#mg)" filter="url(#rough)"/>
      <path d="${smooth(ring)}Z" fill="none" stroke="#f1b783" stroke-width="3" stroke-dasharray="1 11" stroke-linecap="round" filter="url(#rough)"/>
      ${star(W * .1, H * .2, 7)}${star(W * .9, H * .18, 5)}${star(W * .92, H * .78, 6)}${star(W * .06, H * .8, 4)}`;
    layer(5).innerHTML = `<defs><marker id="ah" viewBox="0 0 12 12" refX="7" refY="6" markerWidth="4.4" markerHeight="4.4" orient="auto-start-reverse"><path d="M1,1.5 L11,6 L1,10.5 Q3.5,6 1,1.5 Z" fill="#ff5a3c" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/></marker>
      <filter id="hand"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="1" seed="9"/><feDisplacementMap in="SourceGraphic" scale="3"/></filter></defs>`
      + arrows.map(({ pts, opt }) => { const d = smooth(pts.map(p => proj(...p))), dash = opt.dashed ? 'stroke-dasharray="1 16"' : "";
        return `<g filter="url(#hand)"><path d="${d}" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round" ${dash}/>
          <path d="${d}" fill="none" stroke="#ff5a3c" stroke-width="6.5" stroke-linecap="round" ${dash} ${opt.dashed ? 'opacity=".85"' : ""} marker-end="url(#ah)" ${opt.both ? 'marker-start="url(#ah)"' : ""}/></g>`; }).join("");
  }
  return { kid, arrow, build };
}
