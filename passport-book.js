// ============================================================================
//  passport-book.js — a real, page-turning passport booklet with inked visa
//  stamps. CSS 3D leaves flip around the spine; each stamp is a generated SVG
//  (curved country text, double ring, distress filter, random ink + rotation).
//  Tap a ghost slot to slam a stamp on; tap an inked stamp to open its tables.
// ============================================================================

const INKS   = ["#B23A2E", "#294B87", "#2E6B4F", "#5B3A78", "#8A6D22", "#9C3E63"];
const MONTHS  = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

function hash(s){ let h = 2166136261; for (let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h); }
function entryDate(seed){
  // a plausible date inside the RW window: 20 Jul → 16 Aug 2026
  const d = new Date(2026, 6, 20 + (seed % 28));
  return `${String(d.getDate()).padStart(2,"0")} ${MONTHS[d.getMonth()]} 2026`;
}

function inkedStamp(country, flag, seed){
  const uid = "s"+seed;
  const ink = INKS[seed % INKS.length];
  const rot = (seed % 25) - 12;
  const name = country.toUpperCase();
  return `<svg class="stamp-svg" viewBox="0 0 160 160" style="--rot:${rot}deg" aria-label="${country} stamp">
    <defs>
      <path id="top${uid}" d="M 30,84 A 52,52 0 0 1 130,84"></path>
      <path id="bot${uid}" d="M 32,80 A 48,48 0 0 0 128,80"></path>
      <filter id="ruf${uid}" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="${seed%97}" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4"/>
      </filter>
    </defs>
    <g filter="url(#ruf${uid})" opacity="0.9" fill="none" stroke="${ink}" stroke-width="2.6">
      <circle cx="80" cy="80" r="58"/><circle cx="80" cy="80" r="49" stroke-width="1.1"/>
    </g>
    <g filter="url(#ruf${uid})" opacity="0.92" fill="${ink}">
      <text class="st-arc" font-size="12"><textPath href="#top${uid}" xlink:href="#top${uid}" startOffset="50%">${name}</textPath></text>
      <text class="st-arc" font-size="8.4"><textPath href="#bot${uid}" xlink:href="#bot${uid}" startOffset="50%">NYC RESTAURANT WEEK</textPath></text>
      <text x="80" y="70" text-anchor="middle" font-size="11" letter-spacing="1" class="st-mono">✦ ENTRY ✦</text>
      <text x="80" y="99" text-anchor="middle" font-size="10.5" class="st-mono">${entryDate(seed)}</text>
      <line x1="46" y1="80" x2="63" y2="80" stroke="${ink}" stroke-width="1"/>
      <line x1="97" y1="80" x2="114" y2="80" stroke="${ink}" stroke-width="1"/>
    </g>
    <text x="80" y="83" text-anchor="middle" font-size="30" class="st-flag">${flag}</text>
  </svg>`;
}

function ghostStamp(country, flag){
  return `<svg class="stamp-svg ghost" viewBox="0 0 160 160" aria-label="${country} not stamped">
    <g fill="none" stroke="var(--pp-ghost)" stroke-width="1.6" stroke-dasharray="5 5" opacity="0.85">
      <circle cx="80" cy="80" r="55"/>
    </g>
    <text x="80" y="70" text-anchor="middle" font-size="26" class="st-flag" opacity="0.5">${flag}</text>
    <text x="80" y="95" text-anchor="middle" font-size="10" class="st-mono" fill="var(--pp-ghost)">${country.toUpperCase()}</text>
    <text x="80" y="110" text-anchor="middle" font-size="7.5" class="st-mono" fill="var(--pp-ghost)" letter-spacing="1.5">TAP TO STAMP</text>
  </svg>`;
}

function stampCell(c, visited){
  const seed = hash(c.country);
  return `<div class="stamp-cell ${visited?'inked':'empty'}" role="button" tabindex="0" data-country="${encodeURIComponent(c.country)}" data-seed="${seed}" data-flag="${c.flag}">
    ${visited ? inkedStamp(c.country, c.flag, seed) : ghostStamp(c.country, c.flag)}
  </div>`;
}

// ---- page content builders ------------------------------------------------
function coverFace(){
  return `<div class="pp-face cover">
    <div class="cover-frame">
      <div class="cover-crest">🌐</div>
      <div class="cover-top">United Tastes of</div>
      <div class="cover-title">NEW YORK</div>
      <div class="cover-sub">Dining Passport</div>
      <div class="cover-rule"></div>
      <div class="cover-foot">Restaurant Week · MMXXVI</div>
    </div>
  </div>`;
}
function identityFace(total){
  return `<div class="pp-face id-page">
    <div class="id-head">Passport · Passeport · Pasaporte</div>
    <div class="id-grid">
      <div class="id-photo">🗽</div>
      <div class="id-fields">
        <div><span>Bearers</span><b>Jasmine &amp; Adrian</b></div>
        <div><span>Type</span><b>P — Prix-Fixe</b></div>
        <div><span>Authority</span><b>NYC Tourism</b></div>
        <div><span>Valid</span><b>20 JUL — 16 AUG 2026</b></div>
        <div><span>Countries</span><b>${total} to collect</b></div>
      </div>
    </div>
    <div class="id-mrz">P&lt;NYCJASMINE&lt;&lt;ADRIAN&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br>RW2026NYC&lt;&lt;&lt;0620&lt;&lt;&lt;0816&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;02</div>
    <div class="id-note">Collect a stamp for every country you dine your way through. Turn the page →</div>
  </div>`;
}
function stampFace(group, visited, pageNo){
  return `<div class="pp-face stamp-page">
    <div class="page-wm">NYC</div>
    <div class="stamp-grid">${group.map(c=>stampCell(c, visited(c))).join("")}</div>
    <div class="page-no">${pageNo}</div>
  </div>`;
}
function endFace(){
  return `<div class="pp-face end-page"><div class="end-inner">
    <div class="end-crest">✧</div><div class="end-title">Bon appétit</div>
    <div class="end-sub">Safe travels &amp; delicious returns</div>
  </div></div>`;
}

export function buildBook(container, { countries, isVisited, onStamp, onOpen, startPage=0, onPage }){
  // order countries by region then name for nice grouping
  const ordered = countries.slice().sort((a,b)=> (a.region+a.country).localeCompare(b.region+b.country));
  const groups = [];
  for (let i=0;i<ordered.length;i+=6) groups.push(ordered.slice(i,i+6));

  // linear list of page-faces
  const faces = [ coverFace(), identityFace(countries.length) ];
  groups.forEach((g,i)=> faces.push(stampFace(g, isVisited, i+1)));
  if (faces.length % 2 === 0) faces.push(endFace()); else { faces.push(endFace()); faces.push(`<div class="pp-face blank"></div>`); }
  // pair faces into leaves (front,back)
  const leaves = [];
  for (let i=0;i<faces.length;i+=2) leaves.push([faces[i], faces[i+1] || `<div class="pp-face blank"></div>`]);

  const total = leaves.length;
  let current = Math.max(0, Math.min(startPage, total));

  container.innerHTML = `
    <div class="book" role="group" aria-label="Dining passport booklet">
      <div class="book-shadow"></div>
      <div class="book-stack">
        ${leaves.map((lf,i)=>`
          <div class="leaf" data-i="${i}">
            <div class="leaf-face front">${lf[0]}</div>
            <div class="leaf-face back">${lf[1]}</div>
          </div>`).join("")}
      </div>
      <button class="turn prev" aria-label="Previous page">‹</button>
      <button class="turn next" aria-label="Next page">›</button>
      <div class="book-hint">Tap the page edges to turn · tap a slot to stamp</div>
    </div>`;

  const book = container.querySelector(".book");
  const leafEls = [...container.querySelectorAll(".leaf")];

  function layout(){
    leafEls.forEach((el,i)=>{
      const flipped = i < current;
      el.classList.toggle("flipped", flipped);
      el.style.zIndex = flipped ? i : (total - i);
    });
    book.classList.toggle("at-start", current===0);
    book.classList.toggle("at-end", current===total);
    if (onPage) onPage(current);
  }
  function go(n){ current = Math.max(0, Math.min(n, total)); layout(); }
  layout();

  container.querySelector(".turn.next").addEventListener("click", ()=>go(current+1));
  container.querySelector(".turn.prev").addEventListener("click", ()=>go(current-1));

  container.addEventListener("click", e=>{
    const cell = e.target.closest(".stamp-cell");
    if (cell){
      const country = decodeURIComponent(cell.getAttribute("data-country"));
      if (cell.classList.contains("inked")){ onOpen && onOpen(country); return; }
      const now = onStamp && onStamp(country);            // toggle in app state
      if (now){
        const seed = +cell.getAttribute("data-seed");
        cell.classList.remove("empty"); cell.classList.add("inked","slam");
        cell.innerHTML = inkedStamp(country, cell.getAttribute("data-flag"), seed);
        setTimeout(()=>cell.classList.remove("slam"), 500);
      }
      return;
    }
    // click left/right dead space to turn pages
    const b = book.getBoundingClientRect();
    if (e.target.closest(".pp-face")) return;             // ignore clicks on content
    if (e.clientX > b.left + b.width/2) go(current+1); else go(current-1);
  });

  document.addEventListener("keydown", onKey);
  function onKey(e){
    if (container.offsetParent === null) return;          // not visible
    if (e.key==="ArrowRight") go(current+1);
    if (e.key==="ArrowLeft") go(current-1);
  }

  return {
    el: book,
    page: ()=>current,
    destroy(){ document.removeEventListener("keydown", onKey); }
  };
}
