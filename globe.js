// ============================================================================
//  globe.js — a bespoke, hand-built WebGL globe (Three.js, no plugins beyond
//  OrbitControls). Dot-matrix earth, a home beacon over NYC, glowing country
//  pins sized by how many restaurants you can dine there, and gold flight-arcs
//  from New York to every cuisine's home country.
// ============================================================================
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const R = 1.6;                       // globe radius
const DEG = Math.PI / 180;

// lat/lng -> vec3 on a sphere of radius r
function toVec(lat, lng, r = R){
  const phi = (90 - lat) * DEG;
  const theta = (lng + 180) * DEG;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
}

// soft radial sprite texture for glowing points
function glowTexture(inner = "rgba(255,255,255,1)", outer = "rgba(255,255,255,0)"){
  const s = 128, c = document.createElement("canvas");
  c.width = c.height = s;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
  grd.addColorStop(0, inner);
  grd.addColorStop(0.25, inner);
  grd.addColorStop(1, outer);
  g.fillStyle = grd; g.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createGlobe(canvas, { home, countries, onPick, reduced }){
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true, powerPreference:"high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 1.1, 5.2);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.rotateSpeed = 0.5;
  controls.autoRotate = !reduced;
  controls.autoRotateSpeed = 0.42;

  const world = new THREE.Group();
  world.rotation.z = 0.28;            // gentle axial tilt
  scene.add(world);

  // ---- lighting ----------------------------------------------------------
  scene.add(new THREE.AmbientLight(0x9fb4e6, 0.75));
  const key = new THREE.DirectionalLight(0xfff2d6, 1.6);
  key.position.set(-3, 2, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0x6f9cff, 1.1);
  rim.position.set(4, -1, -3); scene.add(rim);

  // ---- ocean sphere ------------------------------------------------------
  const ocean = new THREE.Mesh(
    new THREE.SphereGeometry(R, 64, 64),
    new THREE.MeshStandardMaterial({ color:0x18325f, roughness:0.55, metalness:0.4, emissive:0x0c2350, emissiveIntensity:0.7 })
  );
  world.add(ocean);

  // ---- graticule (lat/long grid to define the sphere) --------------------
  const grat = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.SphereGeometry(R * 1.004, 36, 24)),
    new THREE.LineBasicMaterial({ color:0x3b64b0, transparent:true, opacity:0.28, blending:THREE.AdditiveBlending, depthWrite:false })
  );
  world.add(grat);

  // ---- atmosphere (fresnel rim glow) ------------------------------------
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.18, 64, 64),
    new THREE.ShaderMaterial({
      transparent:true, side:THREE.BackSide, blending:THREE.AdditiveBlending, depthWrite:false,
      uniforms:{ c:{ value:new THREE.Color(0x5b8cff) } },
      vertexShader:`varying float i;
        void main(){ vec3 n=normalize(normalMatrix*normal); vec3 v=normalize(-(modelViewMatrix*vec4(position,1.0)).xyz);
        i=pow(1.0-abs(dot(n,v)),1.9); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader:`varying float i; uniform vec3 c;
        void main(){ gl_FragColor=vec4(c, i*1.35); }`
    })
  );
  world.add(atmo);

  // ---- land as a dot matrix ---------------------------------------------
  // Cheap "continents" impression: a fibonacci-sphere of tiny dots, denser
  // look than wireframe and reads as a night-earth without external textures.
  const N = 1400;
  const dotGeo = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3);
  for (let k = 0; k < N; k++){
    const y = 1 - (k / (N - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = k * Math.PI * (3 - Math.sqrt(5));
    const v = new THREE.Vector3(Math.cos(th) * rad, y, Math.sin(th) * rad).multiplyScalar(R * 1.002);
    pos[k*3] = v.x; pos[k*3+1] = v.y; pos[k*3+2] = v.z;
  }
  dotGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  world.add(new THREE.Points(dotGeo, new THREE.PointsMaterial({
    color:0x8fb4ff, size:0.03, sizeAttenuation:true, transparent:true, opacity:0.9,
    map:glowTexture("rgba(160,190,255,0.95)","rgba(160,190,255,0)"), depthWrite:false, blending:THREE.AdditiveBlending
  })));

  const goldTex = glowTexture("rgba(255,214,120,1)","rgba(255,214,120,0)");
  const redTex  = glowTexture("rgba(255,120,96,1)","rgba(255,120,96,0)");

  // ---- home beacon (NYC) -------------------------------------------------
  const homePos = toVec(home.lat, home.lng, R * 1.01);
  const homeSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map:redTex, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending }));
  homeSprite.position.copy(homePos); homeSprite.scale.setScalar(0.32); world.add(homeSprite);

  // ---- country pins + arcs ----------------------------------------------
  const pins = [];
  const maxCount = Math.max(...countries.map(c => c.count), 1);
  const arcMat = new THREE.LineBasicMaterial({ color:0xE7B24C, transparent:true, opacity:0.5, blending:THREE.AdditiveBlending, depthWrite:false });

  for (const c of countries){
    if (c.country === "United States") continue;   // home country — no arc to self
    const p = toVec(c.lat, c.lng, R * 1.01);

    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map:goldTex, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending }));
    sprite.position.copy(p);
    const base = 0.11 + 0.13 * (c.count / maxCount);
    sprite.scale.setScalar(base);
    sprite.userData = { country:c.country, base };
    world.add(sprite);
    pins.push(sprite);

    // great-circle-ish arc: quadratic bezier bowed outward from the surface
    const mid = homePos.clone().add(p).multiplyScalar(0.5);
    const lift = 1 + 0.45 * (homePos.distanceTo(p) / (2 * R));
    mid.setLength(R * lift);
    const curve = new THREE.QuadraticBezierCurve3(homePos, mid, p);
    const arc = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(50)), arcMat);
    world.add(arc);
  }

  // starfield behind the globe
  const starGeo = new THREE.BufferGeometry();
  const sp = new Float32Array(700 * 3);
  for (let i = 0; i < 700; i++){
    const v = new THREE.Vector3().randomDirection().multiplyScalar(30 + Math.random() * 30);
    sp[i*3]=v.x; sp[i*3+1]=v.y; sp[i*3+2]=v.z;
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color:0x9db4ff, size:0.08, transparent:true, opacity:0.7 })));

  // ---- picking -----------------------------------------------------------
  const ray = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let downAt = null;
  renderer.domElement.addEventListener("pointerdown", e => downAt = { x:e.clientX, y:e.clientY });
  renderer.domElement.addEventListener("pointerup", e => {
    if (!downAt) return;
    const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
    downAt = null;
    if (moved > 6) return;                       // was a drag, not a click
    const r = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(mouse, camera);
    const hit = ray.intersectObjects(pins)[0];
    if (hit && onPick) onPick(hit.object.userData.country);
  });
  renderer.domElement.addEventListener("pointermove", e => {
    const r = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(mouse, camera);
    renderer.domElement.style.cursor = ray.intersectObjects(pins)[0] ? "pointer" : "grab";
  });

  // ---- resize + loop -----------------------------------------------------
  function resize(){
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    if (reduced) renderOnce();   // reduced-motion has no rAF loop — redraw on resize
  }
  const ro = new ResizeObserver(resize); ro.observe(canvas); resize();

  let raf = 0;
  function renderOnce(){ controls.update(); renderer.render(scene, camera); }
  function frame(t){
    raf = requestAnimationFrame(frame);
    homeSprite.scale.setScalar(0.30 + Math.sin(t * 0.004) * 0.05);   // pulse
    for (const s of pins) s.scale.setScalar(s.userData.base * (1 + Math.sin(t * 0.003 + s.position.x) * 0.08));
    controls.update();
    renderer.render(scene, camera);
  }
  if (reduced){
    // Respect reduced-motion: draw a still frame, re-render only on interaction.
    renderOnce();
    controls.addEventListener("change", renderOnce);
  } else {
    raf = requestAnimationFrame(frame);
  }

  return {
    focus(country){                                 // spin a country to the front
      const c = countries.find(x => x.country === country);
      if (!c) return;
      controls.autoRotate = false;
      const target = toVec(c.lat, c.lng, R);
      const az = Math.atan2(target.x, target.z);
      // nudge world so the pin faces camera; simple + robust
      world.rotation.y = -az - 0.4;
      clearTimeout(this._t);
      this._t = setTimeout(() => { if (!reduced) controls.autoRotate = true; }, 4000);
    },
    setAutoRotate(v){ controls.autoRotate = v && !reduced; },
    destroy(){ cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); }
  };
}
