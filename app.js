// ============================================================================
//  app.js — Jasmine & Adrian's Dining Passport, as a full-screen booklet you
//  land inside and drag-turn through: cover → world (globe) → restaurants →
//  stamps → trip. Filters live on the "desk" beneath the book.
// ============================================================================
import { loadData, HOME } from "./data.js";
import { createGlobe } from "./globe.js";
import { createFlipbook } from "./flipbook.js";
import { stampCell, inkedStamp, hashCode } from "./stamps.js";
import { Sync, mergeState } from "./sync.js";

const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const nf = new Intl.NumberFormat();

let DATA = [];
let picks = {};
let visited = new Set();
let globe = null;
let book = null;
let spreads = [];
let chapterStart = {};

/* ---------- state / persistence / share ---------- */
function enc(s){ try{ return btoa(unescape(encodeURIComponent(s))); }catch(e){ return ""; } }
function dec(b){ try{ return decodeURIComponent(escape(atob(b))); }catch(e){ return ""; } }
function serialize(){
  const p = Object.entries(picks).filter(([,v])=>v&&(v.j||v.a)).map(([k,v])=>k+"~"+((v.j?2:0)+(v.a?1:0)));
  return enc(JSON.stringify({ p, v:[...visited] }));
}
function applySerialized(str){
  const raw = dec(str); if(!raw) return; let o; try{ o=JSON.parse(raw); }catch(e){ return; }
  (o.p||[]).forEach(it=>{ const i=it.lastIndexOf("~"); if(i<0)return; const n=it.slice(0,i),c=+it.slice(i+1);
    const cur=picks[n]||{j:false,a:false}; picks[n]={j:cur.j||!!(c&2),a:cur.a||!!(c&1)}; });
  (o.v||[]).forEach(c=>visited.add(c));
}
function syncHash(){ try{ history.replaceState(null,"",location.pathname+location.search+"#trip="+serialize()); }catch(e){} }
function persist(){
  try{ localStorage.setItem("rw_picks",JSON.stringify(picks)); localStorage.setItem("rw_visited",JSON.stringify([...visited])); }catch(e){}
  syncHash(); Sync.push({ picks, visited:[...visited] });
}
function hydrate(){
  try{ picks=JSON.parse(localStorage.getItem("rw_picks")||"{}")||{}; }catch(e){ picks={}; }
  try{ visited=new Set(JSON.parse(localStorage.getItem("rw_visited")||"[]")); }catch(e){ visited=new Set(); }
  const m=(location.hash||"").match(/trip=([^&]+)/); if(m) applySerialized(decodeURIComponent(m[1]));
}

/* ---------- helpers ---------- */
const uniq = a => [...new Set(a)].sort();
const pk = n => picks[n]||{j:false,a:false};
const isMatch = n => { const p=pk(n); return p.j&&p.a; };
const isPicked = n => { const p=pk(n); return p.j||p.a; };
const bookURL = d => "https://www.google.com/search?q="+encodeURIComponent(d.name+" NYC "+d.neighborhood+" restaurant week reservation");
function priceMark(p){ const n=(p||"").length; let s=""; for(let i=1;i<=4;i++) s+=`<span class="${i<=n?'':'off'}">$</span>`; return s; }
let toastT; function toast(html){ const t=$("#toast"); t.innerHTML=html; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove("show"),3400); }
function countries(){
  const m=new Map();
  DATA.forEach(d=>{ if(!m.has(d.country)) m.set(d.country,{country:d.country,flag:d.flag,region:d.region,lat:d.lat,lng:d.lng,items:[]}); m.get(d.country).items.push(d); });
  return [...m.values()];
}
function ratingHTML(d){
  if(d.rating==null) return `<span class="e-rate none">☆ —</span>`;
  return `<span class="e-rate">★ ${d.rating.toFixed(1)}${d.reviews?` <i>${nf.format(d.reviews)}</i>`:""}</span>`;
}

/* ---------- filtered list ---------- */
function currentList(){
  const q=$("#q").value.trim().toLowerCase();
  const cu=$("#fCuisine").value, bo=$("#fBorough").value, pr=$("#fPrice").value, wh=$("#fWho").value, s=$("#sort").value;
  let list=DATA.filter(d=>{
    if(cu&&d.cuisine!==cu)return false; if(bo&&d.borough!==bo)return false; if(pr&&d.price!==pr)return false;
    if(wh==="match"&&!isMatch(d.name))return false; if(wh==="j"&&!pk(d.name).j)return false;
    if(wh==="a"&&!pk(d.name).a)return false; if(wh==="unpicked"&&isPicked(d.name))return false;
    if(q){ const h=(d.name+" "+d.cuisine+" "+d.neighborhood+" "+d.borough+" "+d.country+" "+(d.why||"")).toLowerCase(); if(!h.includes(q))return false; }
    return true;
  });
  list.sort((a,b)=>{
    if(s==="rating") return (b.rating||0)-(a.rating||0)||(b.reviews||0)-(a.reviews||0);
    if(s==="reviews") return (b.reviews||0)-(a.reviews||0);
    if(s==="name") return a.name.localeCompare(b.name);
    if(s==="cuisine") return a.cuisine.localeCompare(b.cuisine)||(b.rating||0)-(a.rating||0);
    return 0;
  });
  return list;
}

/* ---------- page faces ---------- */
function endpaperFace(){
  return `<div class="pp-face endpaper"><div class="ep-in">
    <div class="ep-crest">🌐</div>
    <div class="ep-belongs">This passport belongs to</div>
    <div class="ep-names">Jasmine <span>&amp;</span> Adrian</div>
    <div class="ep-line"></div>
    <div class="ep-foot">NYC Restaurant Week · Summer MMXXVI</div>
    <div class="ep-hint">drag the page →</div>
  </div></div>`;
}
function idFace(){
  return `<div class="pp-face id-page">
    <div class="id-head">Passport · Passeport · Pasaporte</div>
    <div class="id-grid">
      <div class="id-photo">🗽</div>
      <div class="id-fields">
        <div><span>Bearers</span><b>Jasmine &amp; Adrian</b></div>
        <div><span>Type</span><b>P — Prix-Fixe</b></div>
        <div><span>Authority</span><b>NYC Tourism</b></div>
        <div><span>Valid</span><b>20 JUL — 16 AUG 2026</b></div>
      </div>
    </div>
    <div class="id-mrz">P&lt;NYCJASMINE&lt;&lt;ADRIAN&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br>RW2026NYC&lt;&lt;&lt;0620&lt;&lt;&lt;0816&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;02</div>
    <div class="id-note">Turn the page to spin the globe →</div>
  </div>`;
}
function worldLeftFace(){
  const cs=countries();
  const picked=DATA.filter(d=>isPicked(d.name)).length;
  const matches=DATA.filter(d=>isMatch(d.name)).length;
  const rated=DATA.filter(d=>d.rating!=null); const avg=rated.length?(rated.reduce((s,d)=>s+d.rating,0)/rated.length):0;
  return `<div class="pp-face world-left"><div class="wl-in">
    <div class="wl-kick">Your world this Restaurant Week</div>
    <div class="wl-title">Dine around<br>the globe</div>
    <div class="wl-stats">
      <div><b>${DATA.length}</b><span>tables</span></div>
      <div><b>${cs.length}</b><span>countries</span></div>
      <div><b>${matches}</b><span>matches</span></div>
      <div><b>${[...visited].length}</b><span>stamped</span></div>
      <div><b>${avg?avg.toFixed(1):"—"}</b><span>avg ★</span></div>
      <div><b>${picked}</b><span>picked</span></div>
    </div>
    <div class="wl-note">Heart the places you each love — mutual picks become ★ Matches. Collect a stamp for every country you visit.</div>
  </div></div>`;
}
function worldGlobeFace(){
  return `<div class="pp-face globe-page"><canvas id="bookGlobe"></canvas><div class="gp-cap">drag to spin · tap a glowing pin</div></div>`;
}
function entryHTML(d){
  const p=pk(d.name);
  return `<div class="entry ${isMatch(d.name)?'matched':''}">
    <div class="e-top"><span class="e-flag">${d.flag}</span><h4>${d.name}</h4>${isMatch(d.name)?'<span class="e-star">★</span>':''}</div>
    <div class="e-meta">${d.cuisine} · ${d.neighborhood} · ${d.borough}</div>
    <div class="e-mid">${ratingHTML(d)}<span class="e-price">${priceMark(d.price)}</span>
      <a class="e-book no-drag" href="${bookURL(d)}" target="_blank" rel="noopener">Book ↗</a></div>
    <div class="e-hearts">
      <button class="heart j ${p.j?'on':''}" data-heart="j" data-name="${encodeURIComponent(d.name)}">♥ Jasmine</button>
      <button class="heart a ${p.a?'on':''}" data-heart="a" data-name="${encodeURIComponent(d.name)}">♥ Adrian</button>
    </div>
  </div>`;
}
function eatFace(entries, isFirst, total){
  const head = isFirst ? `<div class="eat-head"><span>Restaurants</span><i>${total} tables · sorted by rating</i></div>` : "";
  const body = entries.length ? entries.map(entryHTML).join("") : `<div class="eat-empty">No tables on this page.</div>`;
  return `<div class="pp-face eat-page">${head}<div class="eat-list">${body}</div></div>`;
}
function stampFace(group){
  const cells = group.map(c=>stampCell(c, visited.has(c.country))).join("");
  const fill = 6-group.length; let pad=""; for(let i=0;i<fill;i++) pad+=`<div class="stamp-cell filler"></div>`;
  return `<div class="pp-face stamp-page"><div class="page-wm">NYC</div><div class="stamp-grid">${cells}${pad}</div></div>`;
}
function tripLeftFace(){
  const picked=DATA.filter(d=>isPicked(d.name));
  const matched=picked.filter(d=>isMatch(d.name)).sort((a,b)=>(b.rating||0)-(a.rating||0));
  if(!picked.length) return `<div class="pp-face trip-page"><div class="trip-empty"><b>No tables picked yet</b><br>Flip back to the restaurants and heart a few you each love.</div></div>`;
  const rows = matched.length ? matched.map(d=>tripRow(d,'★')).join("") : `<div class="eat-empty">No mutual matches yet — heart the same spot as each other.</div>`;
  return `<div class="pp-face trip-page"><div class="trip-h">★ Matched — book these</div><div class="trip-list">${rows}</div></div>`;
}
function tripRightFace(){
  const picked=DATA.filter(d=>isPicked(d.name));
  const jOnly=picked.filter(d=>pk(d.name).j&&!pk(d.name).a).sort((a,b)=>(b.rating||0)-(a.rating||0));
  const aOnly=picked.filter(d=>pk(d.name).a&&!pk(d.name).j).sort((a,b)=>(b.rating||0)-(a.rating||0));
  const est=picked.reduce((s,d)=>s+(d.price==="$$"?45:60),0);
  const cN=new Set(picked.map(d=>d.country)).size;
  const sec=(title,arr)=> arr.length?`<div class="trip-h sm">${title} (${arr.length})</div><div class="trip-list">${arr.map(d=>tripRow(d)).join("")}</div>`:"";
  return `<div class="pp-face trip-page">
    ${sec("Jasmine's picks",jOnly)}${sec("Adrian's picks",aOnly)}
    <div class="trip-budget"><div><b>$${est}</b><span>est. food</span></div><div><b>${picked.length}</b><span>tables</span></div><div><b>${cN}</b><span>countries</span></div></div>
    <div class="trip-fine">Food only, one seat each — tax, drinks &amp; tip extra.</div>
  </div>`;
}
function tripRow(d, star){
  const p=pk(d.name);
  return `<a class="trow no-drag" href="${bookURL(d)}" target="_blank" rel="noopener">
    <span class="e-flag">${d.flag}</span><span class="tr-name">${d.name}</span>
    <span class="tr-who">${p.j?'<i class="j">J</i>':''}${p.a?'<i class="a">A</i>':''}</span>
    <span class="tr-rate">${d.rating?('★'+d.rating.toFixed(1)):'—'}</span></a>`;
}

/* ---------- build spreads ---------- */
function chunk(a,n){ const o=[]; for(let i=0;i<a.length;i+=n) o.push(a.slice(i,i+n)); return o; }
function buildSpreads(){
  const S=[];
  S.push({ chapter:"intro", left:endpaperFace, right:idFace });
  S.push({ chapter:"world", left:worldLeftFace, right:worldGlobeFace });

  const list=currentList();
  let pages=chunk(list,3); if(!pages.length) pages=[[]]; if(pages.length%2) pages.push([]);
  for(let i=0;i<pages.length;i+=2){
    const l=pages[i], r=pages[i+1]||[], first=(i===0);
    S.push({ chapter:"eat", left:()=>eatFace(l,first,list.length), right:()=>eatFace(r,false) });
  }

  const cs=countries().sort((a,b)=>(a.region+a.country).localeCompare(b.region+b.country));
  let sp=chunk(cs,6); if(sp.length%2) sp.push([]);
  for(let i=0;i<sp.length;i+=2){
    const l=sp[i], r=sp[i+1]||[];
    S.push({ chapter:"stamps", left:()=>stampFace(l), right:()=>stampFace(r) });
  }

  S.push({ chapter:"trip", left:tripLeftFace, right:tripRightFace });
  return S;
}
function computeChapters(){
  chapterStart={};
  spreads.forEach((s,i)=>{ if(!(s.chapter in chapterStart)) chapterStart[s.chapter]=i; });
}

/* ---------- globe lifecycle ---------- */
function makeGlobe(cv){
  const cs=countries().map(c=>({country:c.country,lat:c.lat,lng:c.lng,count:c.items.length}));
  try{ return createGlobe(cv,{ home:HOME, countries:cs, reduced, onPick:c=>openCountry(c) }); }
  catch(e){ console.warn("globe failed",e); return null; }
}

/* ---------- flipbook wiring ---------- */
function renderSpread(i){ const s=spreads[i]; return { left:s.left(), right:s.right(), chapter:s.chapter, mount:s.mount }; }
function onChange(i, chapter){
  $$(".chapter-btn").forEach(b=>b.classList.toggle("on", b.dataset.chapter===chapter));
  const pi=$("#pageind"); if(pi) pi.textContent=`${i+1} / ${spreads.length}`;
  $(".desk")?.classList.toggle("eat-active", chapter==="eat");
  if(chapter==="world"){ const cv=$("#bookGlobe"); if(cv){ if(globe) globe.destroy(); globe=makeGlobe(cv); } }
  else if(globe){ globe.destroy(); globe=null; }
}

/* ---------- modal ---------- */
function openCountry(country){
  const items=DATA.filter(d=>d.country===country).sort((a,b)=>(b.rating||0)-(a.rating||0));
  if(!items.length) return;
  const flag=items[0].flag, on=visited.has(country);
  const dlg=$("#detail"); dlg.hidden=false;
  dlg.innerHTML=`<div class="scrim"></div><div class="sheet">
    <div class="sheet-head"><div><span class="flag" style="font-size:34px">${flag}</span>
      <h3 style="font-family:var(--serif);font-size:25px;margin:6px 0 0;font-weight:600">${country}</h3>
      <p style="font-family:var(--mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-soft);margin:4px 0 0">${items.length} restaurant${items.length>1?'s':''} this Restaurant Week</p></div>
      <button class="icon-btn" id="closeDetail" aria-label="Close">✕</button></div>
    <button class="flowcta ${on?'':'gold'}" id="toggleVisit" style="width:100%;justify-content:center;margin:16px 0">${on?'✓ Stamped — tap to remove':'Stamp this country as visited'}</button>
    <div class="sheet-list">${items.map(d=>`<a class="sheet-item" href="${bookURL(d)}" target="_blank" rel="noopener">
      <div><b>${d.name}</b><span>${d.neighborhood} · ${d.borough} · ${d.price}</span></div>
      <span class="tr-rate">${d.rating?('★ '+d.rating.toFixed(1)):'—'}</span></a>`).join("")}</div></div>`;
  document.body.style.overflow="hidden";
  $("#closeDetail").onclick=closeDetail; dlg.querySelector(".scrim").onclick=closeDetail;
  $("#toggleVisit").onclick=()=>{ if(visited.has(country)) visited.delete(country); else visited.add(country); persist(); book.refresh(); closeDetail(); };
}
function closeDetail(){ $("#detail").hidden=true; document.body.style.overflow=""; }

/* ---------- events ---------- */
function wire(){
  document.addEventListener("click", e=>{
    const ht=e.target.closest("[data-heart]");
    if(ht){ const who=ht.getAttribute("data-heart"), nm=decodeURIComponent(ht.getAttribute("data-name"));
      const cur=pk(nm), next={...cur}; next[who]=!cur[who]; if(!next.j&&!next.a) delete picks[nm]; else picks[nm]=next;
      persist(); book.refresh(); if(next.j&&next.a) toast(`✦ It's a <b>Match</b> — ${nm} is on your list`); return; }
    const st=e.target.closest(".stamp-cell");
    if(st && !st.classList.contains("filler")){
      const country=decodeURIComponent(st.getAttribute("data-country")||"");
      if(st.classList.contains("inked")){ openCountry(country); return; }
      if(!visited.has(country)){ visited.add(country); persist();
        st.classList.remove("empty"); st.classList.add("inked","slam");
        st.innerHTML=inkedStamp(country, st.getAttribute("data-flag"), +st.getAttribute("data-seed"));
        setTimeout(()=>st.classList.remove("slam"),500); }
      return; }
    const cb=e.target.closest(".chapter-btn");
    if(cb){ const c=cb.dataset.chapter; if(c in chapterStart) book.goTo(chapterStart[c]); return; }
  });
  document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeDetail(); });

  const rebuildEat=()=>{ spreads=buildSpreads(); computeChapters(); book.rebuild(spreads.length); book.goTo(chapterStart.eat); };
  $("#q").addEventListener("input", rebuildEat);
  ["fCuisine","fBorough","fPrice","fWho","sort"].forEach(id=>$("#"+id).addEventListener("change", rebuildEat));

  $("#shareBtn").addEventListener("click", async ()=>{
    syncHash();
    const url=location.origin+location.pathname+"?room="+encodeURIComponent(Sync.room)+"#trip="+serialize();
    try{ await navigator.clipboard.writeText(url); toast(Sync.mode==="live"?"💌 Link copied — you're synced live":"💌 Link copied — text it to stay in sync"); }
    catch(e){ const ta=document.createElement("textarea"); ta.value=url; document.body.appendChild(ta); ta.select(); try{ document.execCommand("copy"); toast("💌 Link copied"); }catch(_){ toast("Copy this page's URL to share"); } ta.remove(); }
  });

  const savedTheme=(()=>{ try{ return localStorage.getItem("rw_theme"); }catch(e){ return null; } })();
  if(savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);
  const setThemeLabel=()=>{ $("#themeBtn").innerHTML=document.documentElement.getAttribute("data-theme")==="day"?"☀ Day":"☾ Night"; };
  $("#themeBtn").addEventListener("click", ()=>{
    const now=document.documentElement.getAttribute("data-theme")==="day"?"night":"day";
    if(now==="night") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme","day");
    try{ localStorage.setItem("rw_theme",now); }catch(e){} setThemeLabel();
  });
  setThemeLabel();
}

/* ---------- sync ---------- */
function onRemote(remote){
  const merged=mergeState({ picks, visited:[...visited] }, remote);
  picks=merged.picks; visited=new Set(merged.visited);
  try{ localStorage.setItem("rw_picks",JSON.stringify(picks)); localStorage.setItem("rw_visited",JSON.stringify([...visited])); }catch(e){}
  syncHash(); if(book) book.refresh();
}
function onStatus(mode, room){ const b=$("#syncBadge"); if(!b) return; b.className="sync-badge"+(mode==="live"?" live":""); b.innerHTML=`<span class="dot"></span>${mode==="live"?"Live · "+room:"Share-link"}`; }

/* ---------- boot ---------- */
async function boot(){
  hydrate();
  DATA=await loadData();
  function fill(el,items,all){ el.innerHTML=`<option value="">${all}</option>`+items.map(i=>`<option value="${i}">${i}</option>`).join(""); }
  fill($("#fCuisine"),uniq(DATA.map(d=>d.cuisine)),"All cuisines");
  fill($("#fBorough"),uniq(DATA.map(d=>d.borough)),"All boroughs");
  fill($("#fPrice"),["$$","$$$","$$$$"],"Any price");

  spreads=buildSpreads(); computeChapters();
  book=createFlipbook($("#book"), { count:spreads.length, render:renderSpread, onChange });
  wire(); syncHash();

  const ch=new URLSearchParams(location.search).get("chapter");
  if(ch && ch in chapterStart) book.goTo(chapterStart[ch]);

  await Sync.init({ onRemote, onStatus });
  if(Sync.mode==="live") Sync.push({ picks, visited:[...visited] });
}
boot();
