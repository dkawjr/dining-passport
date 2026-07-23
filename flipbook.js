// ============================================================================
//  flipbook.js — a drag-to-turn book engine with realistic page-curl shading.
//  Pages follow your finger; on release they snap forward/back. A moving sheen
//  darkens the lifting page and a soft cast-shadow falls on the page beneath.
//  Content is rendered on demand (render(i) -> {left,right,mount?}) so pages
//  can hold anything: a live globe, filtered restaurant lists, stamps, a trip.
// ============================================================================

const clamp = (v,a,b)=> Math.max(a, Math.min(b, v));
function onceEnd(el, prop, cb){
  const h = e => { if (e.propertyName !== prop) return; el.removeEventListener("transitionend", h); cb(); };
  el.addEventListener("transitionend", h);
}

export function createFlipbook(mount, { count, render, onChange }){
  mount.innerHTML = `
    <div class="pf" role="group" aria-label="Passport pages">
      <div class="pf-page pf-left"></div>
      <div class="pf-page pf-right"></div>
      <div class="pf-cast pf-cast-r"></div>
      <div class="pf-cast pf-cast-l"></div>
      <div class="pf-flip">
        <div class="pf-face front"><div class="pf-content"></div><div class="sheen"></div></div>
        <div class="pf-face back"><div class="pf-content"></div><div class="sheen"></div></div>
      </div>
      <button class="pf-nav prev" aria-label="Previous page">‹</button>
      <button class="pf-nav next" aria-label="Next page">›</button>
      <div class="pf-corner" aria-hidden="true"></div>
    </div>`;

  const pf     = mount.querySelector(".pf");
  const leftEl = pf.querySelector(".pf-left");
  const rightEl= pf.querySelector(".pf-right");
  const flip   = pf.querySelector(".pf-flip");
  const front  = flip.querySelector(".front .pf-content");
  const back   = flip.querySelector(".back .pf-content");

  let index = 0, animating = false, drag = null;

  function paint(i){
    const s = render(i);
    leftEl.innerHTML = s.left; rightEl.innerHTML = s.right;
    flip.classList.remove("on","side-r","side-l");
    pf.classList.remove("anim");
    pf.style.setProperty("--p", 0);
    if (s.mount) s.mount(leftEl, rightEl, i);
    updateNav();
    if (onChange) onChange(i, s.chapter);
  }
  function updateNav(){
    pf.classList.toggle("at-start", index<=0);
    pf.classList.toggle("at-end", index>=count-1);
  }

  // set up the turning sheet for a gesture in `dir` (+1 next, -1 prev)
  function arm(dir){
    const from = render(index);
    const to   = render(index + dir);
    if (dir > 0){
      leftEl.innerHTML = from.left; if (from.mount) from.mount(leftEl, rightEl, index); // keep left; ensure statics
      rightEl.innerHTML = to.right; if (to.mount) to.mount(leftEl, rightEl, index+dir);  // reveal next-right beneath
      front.innerHTML = from.right; back.innerHTML = to.left;
      flip.classList.add("on","side-r");
    } else {
      rightEl.innerHTML = from.right;
      leftEl.innerHTML = to.left; if (to.mount) to.mount(leftEl, rightEl, index-1);
      front.innerHTML = from.left; back.innerHTML = to.right;
      flip.classList.add("on","side-l");
    }
    setP(0);
  }
  function setP(p){ pf.style.setProperty("--p", p); }   // inherited by flip, sheens, casts

  function animateTo(target, dir, after){
    animating = true;
    pf.classList.add("anim");
    requestAnimationFrame(()=> setP(target));
    onceEnd(pf, "--p", ()=>{
      pf.classList.remove("anim");
      if (target > 0.5) index += dir;
      paint(index);
      animating = false;
      if (after) after();
    });
  }
  function go(dir){
    if (animating) return;
    if (dir>0 && index>=count-1) return;
    if (dir<0 && index<=0) return;
    arm(dir);
    requestAnimationFrame(()=> animateTo(1, dir));
  }

  pf.querySelector(".pf-nav.next").addEventListener("click", ()=>go(1));
  pf.querySelector(".pf-nav.prev").addEventListener("click", ()=>go(-1));

  // ---- drag to turn ------------------------------------------------------
  const INTERACTIVE = "a,button,input,select,textarea,.stamp-cell,.heart,.entry,.chip,.no-drag";
  pf.addEventListener("pointerdown", e=>{
    if (animating) return;
    if (e.target.closest(INTERACTIVE)) return;         // let controls work
    const r = pf.getBoundingClientRect();
    const half = r.left + r.width/2;
    const grabRight = e.clientX > half;
    const dir = grabRight ? 1 : -1;
    if (dir>0 && index>=count-1) return;
    if (dir<0 && index<=0) return;
    drag = { dir, startX:e.clientX, w:r.width/2, armed:false, id:e.pointerId };
  });
  pf.addEventListener("pointermove", e=>{
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const moved = drag.dir>0 ? -dx : dx;             // pull toward spine
    if (!drag.armed){
      if (moved < 6) return;                          // small threshold -> becomes a drag
      drag.armed = true; arm(drag.dir);
      try{ pf.setPointerCapture(drag.id); }catch(_){}
    }
    setP(clamp(moved / drag.w, 0, 1));
    e.preventDefault();
  }, { passive:false });
  function endDrag(e){
    if (!drag) return;
    const d = drag; drag = null;
    if (!d.armed) return;
    const dx = e.clientX - d.startX;
    const moved = d.dir>0 ? -dx : dx;
    const p = clamp(moved / d.w, 0, 1);
    animateTo(p > 0.5 ? 1 : 0, d.dir);
  }
  pf.addEventListener("pointerup", endDrag);
  pf.addEventListener("pointercancel", endDrag);

  // keyboard
  function onKey(e){
    if (pf.offsetParent === null) return;
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft")  go(-1);
  }
  document.addEventListener("keydown", onKey);

  paint(0);

  return {
    el: pf,
    index: ()=>index,
    next: ()=>go(1),
    prev: ()=>go(-1),
    goTo(i){ i = clamp(i, 0, count-1); if (i===index || animating) { index=i; paint(i); return; } index=i; paint(i); },
    refresh(){ paint(index); },                       // repaint current (after data change)
    rebuild(newCount){ count = newCount; index = clamp(index, 0, count-1); paint(index); },
    destroy(){ document.removeEventListener("keydown", onKey); }
  };
}
