// 聰明搖滾圈 3D 模型（共用模組）。尺寸為照片估計值，之後用原廠圖檔驗證。
// 用法：const v = await mountRocker(el, {bg:"#f6f6f6"}); v.setMode("ladder");
import * as THREE from "three"; // 頁面需加 importmap（見 item.html）
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

export const ROCKER_MODES = {
  ladder: "雙拱＋橫桿", bridge: "單片拱橋", rocker: "倒放搖椅", s: "S 型平放", posts: "平放＋立柱", parts: "全部零件",
};

export function mountRocker(el, opt = {}) {
  const d = {R:35, r:18, T:8, L:50, W:7};
  const C = {blue:0x2347c9, purple:0xb7a3ea, teal:0x6fd6c4};
  const P = Math.PI, deg = x => x*P/180;
  const HOLE_A = [deg(18),deg(54),deg(90),deg(126),deg(162)], HALF_I = 2, SOCK = 2;
  const halfR = () => d.W*.7, rm = () => (d.R+d.r)/2, sd = () => d.T/5*SOCK;

  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:!!opt.transparent, preserveDrawingBuffer:!!opt.transparent});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  el.style.position = el.style.position || "relative";
  el.prepend(renderer.domElement);
  Object.assign(renderer.domElement.style, {display:"block", width:"100%", height:"100%", touchAction:"pan-y"});
  const scene = new THREE.Scene();
  if (!opt.transparent) scene.background = new THREE.Color(opt.bg || "#f4f5f7");
  const cam = new THREE.PerspectiveCamera(36, 1, 1, 2000);
  const ctl = new OrbitControls(cam, renderer.domElement);
  ctl.target.set(0, 16, 0); ctl.enableDamping = true; ctl.autoRotate = opt.autoRotate !== false; ctl.autoRotateSpeed = 1.1;
  ctl.maxPolarAngle = P*.49; ctl.enablePan = false; ctl.minDistance = 60; ctl.maxDistance = 400;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8bcc8, 1.1));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(60, 140, 80); sun.castShadow = true;
  Object.assign(sun.shadow.camera, {left:-120, right:120, top:120, bottom:-120}); sun.shadow.mapSize.set(2048, 2048); scene.add(sun);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), new THREE.ShadowMaterial({opacity:.16}));
  floor.rotation.x = -P/2; floor.receiveShadow = true; scene.add(floor);

  const mesh = (g, c) => { const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({color:c, roughness:.85})); m.castShadow = m.receiveShadow = true; return m; };
  const hexPts = w => { const a = w/2/Math.cos(P/6), p = []; for (let i=0;i<6;i++){const t=P/2+i*P/3; p.push([a*Math.cos(t), a*Math.sin(t)]);} return p; };
  const halfPts = () => { const r = halfR(), p = []; for (let i=0;i<=24;i++){const t=i/24*P; p.push([r*Math.cos(t), r*Math.sin(t)-r*.42]);} return p; };
  const place = (pts, cx, cy, rot) => { const c=Math.cos(rot), s=Math.sin(rot); return pts.map(([u,v]) => [cx+u*c-v*s, cy+u*s+v*c]); };
  const toPath = (p, pts) => { pts.forEach(([x,y],i) => i ? p.lineTo(x,y) : p.moveTo(x,y)); p.closePath(); return p; };
  function archShape(holes) {
    const s = new THREE.Shape(); s.absarc(0,0,d.R,0,P,false); s.lineTo(-d.r,0); s.absarc(0,0,d.r,P,0,true); s.lineTo(d.R,0);
    if (holes) HOLE_A.forEach((a,i) => s.holes.push(toPath(new THREE.Path(), place(i===HALF_I?halfPts():hexPts(d.W), rm()*Math.cos(a), rm()*Math.sin(a), a-P/2))));
    return s;
  }
  function arch(main, alt) {
    const g = new THREE.Group(), n = 5, lt = d.T/n, solid = archShape(false), holed = archShape(true);
    for (let i=0;i<n;i++){ const m = mesh(new THREE.ExtrudeGeometry(i>=n-SOCK?holed:solid, {depth:lt, bevelEnabled:false, curveSegments:48}), i%2?alt:main); m.position.z = -d.T/2+i*lt; g.add(m); }
    return g;
  }
  function pillar(half, a, b) {
    const shape = toPath(new THREE.Shape(), half ? halfPts() : hexPts(d.W)), g = new THREE.Group(), n = Math.round(d.L/2.5), h = d.L/n;
    for (let i=0;i<n;i++){ const m = mesh(new THREE.ExtrudeGeometry(shape, {depth:h, bevelEnabled:false, curveSegments:24}), i%2?b:a); m.position.z = -d.L/2+i*h; g.add(m); }
    return g;
  }
  const PK = ["p1","p2","p3","p4","p5"], parts = {};
  const wrap = o => { const p = new THREE.Group(); p.add(o); scene.add(p); return p; };
  parts.a1 = wrap(arch(C.blue, C.purple)); parts.a2 = wrap(arch(C.purple, C.blue));
  PK.forEach((k,i) => parts[k] = wrap(i===HALF_I ? pillar(true, C.teal, C.purple) : pillar(false, C.blue, C.purple)));

  const q = (x,y,z) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x,y,z)), qz = a => q(0,0,a), mul = (A,B) => A.clone().multiply(B);
  const hp = a => [rm()*Math.cos(a), rm()*Math.sin(a)];
  const HIDE = {pos:[0,-40,0], q:q(0,0,0), s:.001};
  const fill = o => { for (const k of ["a1","a2",...PK]) if (!o[k]) o[k] = HIDE; return o; };
  const gapZ = () => d.L/2-sd()+d.T/2;
  const M = {
    bridge:{cam:[70,55,90], get:()=>fill({a1:{pos:[0,0,0],q:q(0,0,0)}})},
    ladder:{cam:[95,70,110], get(){const z=gapZ(),o={a1:{pos:[0,0,-z],q:q(0,0,0)},a2:{pos:[0,0,z],q:q(0,P,0)}};PK.forEach((k,i)=>{const a=HOLE_A[i],[x,y]=hp(a);o[k]={pos:[x,y,0],q:qz(a-P/2)}});return fill(o)}},
    rocker:{cam:[95,75,110], get(){const z=gapZ(),o={a1:{pos:[0,d.R,-z],q:q(0,0,P)},a2:{pos:[0,d.R,z],q:q(P,0,0)}};PK.forEach((k,i)=>{const a=HOLE_A[i],[x,y]=hp(a);o[k]={pos:[-x,d.R-y,0],q:qz(a+P/2)}});return fill(o)}},
    s:{cam:[40,120,110], get(){const t=d.T/2,sh=rm();return fill({a1:{pos:[-sh,t,0],q:q(-P/2,0,0)},a2:{pos:[sh,t,0],q:q(-P/2,0,P)}})}},
    posts:{cam:[90,95,120], get(){const t=d.T/2,sh=rm(),qa1=q(-P/2,0,0),qa2=q(-P/2,0,P),o={a1:{pos:[-sh,t,0],q:qa1},a2:{pos:[sh,t,0],q:qa2}},y=d.T-sd()+d.L/2;
      const put=(k,i,b)=>{const a=HOLE_A[i],[x,yy]=hp(a);o[k]=b?{pos:[sh-x,y,yy],q:mul(qa2,qz(a-P/2))}:{pos:[x-sh,y,-yy],q:mul(qa1,qz(a-P/2))}};
      put("p1",0,false);put("p2",4,false);put("p4",1,true);put("p5",3,true);return fill(o)}},
    parts:{cam:[105,115,140], get(){const t=d.T/2,o={a1:{pos:[-d.R-6,t,-d.R/2],q:q(-P/2,0,0)},a2:{pos:[d.R+6,t,-d.R/2],q:q(-P/2,0,0)}};
      PK.forEach((k,i)=>{const h=i===HALF_I;o[k]={pos:[0,h?halfR()*.42:d.W/2,10+i*(d.W+5)],q:mul(q(0,P/2,0),qz(h?0:P/6))}});return o}},
  };

  let tween = null, camTo = null, mode = null;
  const ease = t => t<.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
  const narrow = () => cam.aspect < 1.1 ? 1.6 : 1;
  function setMode(m, instant) {
    if (!M[m]) return; mode = m; const target = M[m].get(), from = {}, to = {};
    for (const k in parts){ const o = parts[k]; from[k] = {p:o.position.clone(), q:o.quaternion.clone(), s:o.scale.x}; }
    for (const k in target){ const t = target[k]; to[k] = {p:new THREE.Vector3(...t.pos), q:t.q, s:t.s ?? 1}; }
    const c = new THREE.Vector3(...M[m].cam).multiplyScalar(narrow()*(opt.zoom||1));
    if (instant){ for (const k in to){ const o = parts[k]; o.position.copy(to[k].p); o.quaternion.copy(to[k].q); o.scale.setScalar(to[k].s); } cam.position.copy(c); tween = null; camTo = null; }
    else { tween = {from, to, t0:performance.now()}; camTo = c; }
    opt.onMode && opt.onMode(m);
  }
  function resize(){ const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); cam.aspect = w/h; cam.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(el); resize();
  renderer.domElement.addEventListener("pointerdown", () => { camTo = null; ctl.autoRotate = false; });

  // 觸控裝置：先鎖住，點一下才可旋轉，避免捲動頁面時被 3D 搶走手指
  if (matchMedia("(pointer:coarse)").matches && !opt.transparent) {
    ctl.enabled = false;
    const cover = document.createElement("button");
    cover.className = "r3d-cover"; cover.textContent = "👆 點一下，開始旋轉";
    Object.assign(cover.style, {position:"absolute", inset:"0", width:"100%", background:"rgba(255,255,255,0)", border:"0", display:"flex", alignItems:"flex-end", justifyContent:"center", paddingBottom:"14px", font:"inherit", fontSize:"14px", color:"#333", cursor:"pointer"});
    cover.onclick = () => { ctl.enabled = true; renderer.domElement.style.touchAction = "none"; cover.remove(); };
    el.append(cover);
  }

  setMode(opt.mode || "ladder", true);
  renderer.setAnimationLoop(now => {
    if (tween){ const t = Math.min(1, (now-tween.t0)/900), e = ease(t);
      for (const k in tween.to){ const o = parts[k], f = tween.from[k], g = tween.to[k]; o.position.lerpVectors(f.p, g.p, e); o.quaternion.slerpQuaternions(f.q, g.q, e); o.scale.setScalar(f.s+(g.s-f.s)*e); }
      if (t >= 1) tween = null; }
    if (camTo){ cam.position.lerp(camTo, .06); if (cam.position.distanceTo(camTo) < .5) camTo = null; }
    ctl.update(); renderer.render(scene, cam);
  });
  return { setMode, get mode(){ return mode; }, renderer, scene, cam, ctl, THREE, dims:d, holes:HOLE_A };
}
