// ============================================================================
//  app.js — Jasmine & Adrian's Dining Passport (main controller)
// ============================================================================
import { loadData, HOME, REGION_ORDER } from "./data.js";
import { createGlobe } from "./globe.js";
import { Sync, mergeState } from "./sync.js";

const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

let DATA = [];
let picks = {};                 // name -> {j, a}
let visited = new Set();        // country names
let globe = null;

/* ---------- persistence + URL state ------------------------------------- */
function enc(str){ try{ return btoa(unescape(encodeURIComponent(str))); }catch(e){ return ""; } }
function dec(b){ try{ return decodeURIComponent(escape(atob(b))); }catch(e){ return ""; } }
function serialize(){
  const p = Object.entries(picks).filter(([,v]) => v && (v.j||v.a)).map(([k,v]) => k+"~"+((v.j?2:0)+(v.a?1:0)));
  return enc(JSON.stringify({ p, v:[...visited] }));
}
function applySerialized(str){
  const raw = dec(str); if(!raw) return;
  let o; try{ o = JSON.parse(raw); }catch(e){ return; }
  (o.p||[]).forEach(item => {
    const i = item.lastIndexOf("~"); if(i<0) return;
    const name = item.slice(0,i), code = +item.slice(i+1);
    const cur = picks[name] || {j:false,a:false};
    picks[name] = { j:cur.j||!!(code&2), a:cur.a||!!(code&1) };
  });
  (o.v||[]).forEach(c => visited.add(c));
}
function syncHash(){ try{ history.replaceState(null,"", location.pathname + location.search + "#trip=" + serialize()); }catch(e){} }
function persist(){
  try{
    localStorage.setItem("rw_picks", JSON.stringify(picks));
    localStorage.setItem("rw_visited", JSON.stringify([...visited]));
  }catch(e){}
  syncHash();
  Sync.push({ picks, visited:[...visited] });
}
function hydrateLocal(){
  try{ picks = JSON.parse(localStorage.getItem("rw_picks")||"{}") || {}; }catch(e){ picks = {}; }
  try{ visited = new Set(JSON.parse(localStorage.getItem("rw_visited")||"[]")); }catch(e){ visited = new Set(); }
  const m = (location.hash||"").match(/trip=([^&]+)/);
  if(m) applySerialized(decodeURIComponent(m[1]));
}

/* ---------- helpers ------------------------------------------------------ */
const uniq = a => [...new Set(a)].sort();
const pk   = n => picks[n] || {j:false,a:false};
const isMatch  = n => { const p = pk(n); return p.j && p.a; };
const isPicked = n => { const p = pk(n); return p.j || p.a; };
const nf = new Intl.NumberFormat();
const bookURL = d => "https://www.google.com/search?q="+encodeURIComponent(d.name+" NYC "+d.neighborhood+" restaurant week reservation");
function priceMark(p){ const n=(p||"").length; let s=""; for(let i=1;i<=4;i++) s+=`<span class="${i<=n?'':'off'}">$</span>`; return s; }
let toastT;
function toast(html){ const t=$("#toast"); t.innerHTML=html; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove("show"),3600); }

function countries(){
  const map = new Map();
  DATA.forEach(d => { if(!map.has(d.country)) map.set(d.country,{country:d.country,flag:d.flag,region:d.region,lat:d.lat,lng:d.lng,items:[]}); map.get(d.country).items.push(d); });
  return [...map.values()];
}

/* ---------- BROWSE ------------------------------------------------------- */
function fillSelect(el, items, allLabel){ el.innerHTML = `<option value="">${allLabel}</option>`+items.map(i=>`<option value="${i}">${i}</option>`).join(""); }
function currentList(){
  const q=$("#q").value.trim().toLowerCase();
  const cu=$("#fCuisine").value, bo=$("#fBorough").value, pr=$("#fPrice").value, wh=$("#fWho").value;
  let list = DATA.filter(d=>{
    if(cu && d.cuisine!==cu) return false;
    if(bo && d.borough!==bo) return false;
    if(pr && d.price!==pr) return false;
    if(wh==="match" && !isMatch(d.name)) return false;
    if(wh==="j" && !pk(d.name).j) return false;
    if(wh==="a" && !pk(d.name).a) return false;
    if(wh==="unpicked" && isPicked(d.name)) return false;
    if(q){ const hay=(d.name+" "+d.cuisine+" "+d.neighborhood+" "+d.borough+" "+d.country+" "+(d.why||"")).toLowerCase(); if(!hay.includes(q)) return false; }
    return true;
  });
  const s=$("#sort").value;
  list.sort((a,b)=>{
    if(s==="rating")  return (b.rating||0)-(a.rating||0) || (b.reviews||0)-(a.reviews||0);
    if(s==="reviews") return (b.reviews||0)-(a.reviews||0);
    if(s==="name")    return a.name.localeCompare(b.name);
    if(s==="cuisine") return a.cuisine.localeCompare(b.cuisine) || (b.rating||0)-(a.rating||0);
    return 0;
  });
  return list;
}
function ratingHTML(d){
  if(d.rating==null) return `<span class="rating none">☆ No rating yet</span>`;
  return `<span class="rating">★ ${d.rating.toFixed(1)} <span class="rev">${d.reviews?('· '+nf.format(d.reviews)):''}</span></span>`;
}
function cardHTML(d){
  const p = pk(d.name);
  return `<article class="card ${isMatch(d.name)?'matched':''}">
    <div class="ribbon">★ Matched</div>
    <div class="toprow"><h3>${d.name}</h3><span class="flag" title="${d.country}">${d.flag}</span></div>
    <div class="meta"><span>${d.cuisine}</span><span class="dot">${d.neighborhood}</span><span class="dot">${d.borough}</span></div>
    <p class="why">${d.why||""}</p>
    <div class="foot">${ratingHTML(d)}${d.yelp?`<span class="yelp">Yelp ${d.yelp.toFixed(1)}</span>`:''}<span class="price">${priceMark(d.price)}</span>
      <a class="booklink" href="${bookURL(d)}" target="_blank" rel="noopener">Book ↗</a></div>
    <div class="hearts">
      <button class="heart j ${p.j?'on':''}" data-heart="j" data-name="${encodeURIComponent(d.name)}"><span class="h">♥</span> Jasmine</button>
      <button class="heart a ${p.a?'on':''}" data-heart="a" data-name="${encodeURIComponent(d.name)}"><span class="h">♥</span> Adrian</button>
    </div></article>`;
}
function renderBrowse(){
  const list = currentList();
  $("#grid").innerHTML = list.map(cardHTML).join("") || `<p style="color:var(--ink-soft)">No tables match those filters — try clearing one.</p>`;
  $("#count").textContent = `${list.length} of ${DATA.length} tables`;
}

/* ---------- PASSPORT ----------------------------------------------------- */
function renderPassport(){
  const cs = countries();
  const total = cs.length, done = cs.filter(c=>visited.has(c.country)).length;
  const pct = total ? Math.round(done/total*100) : 0;
  $("#progFill").style.width = pct+"%";
  $("#progLabel").textContent = `${done} of ${total} countries stamped`;
  $("#progPct").textContent = pct+"%";
  const byR = {}; cs.forEach(c => (byR[c.region]=byR[c.region]||[]).push(c));
  const regions = Object.keys(byR).sort((a,b)=>{ const ia=REGION_ORDER.indexOf(a),ib=REGION_ORDER.indexOf(b); return (ia<0?9:ia)-(ib<0?9:ib); });
  $("#stampRegions").innerHTML = regions.map(r=>{
    const stamps = byR[r].sort((a,b)=>a.country.localeCompare(b.country)).map(c=>{
      const best = c.items.slice().sort((x,y)=>(y.rating||0)-(x.rating||0))[0];
      const on = visited.has(c.country);
      return `<button class="stamp ${on?'visited':''}" data-country="${encodeURIComponent(c.country)}">
        <span class="mk">Visited</span><div class="flag">${c.flag}</div><div class="cty">${c.country}</div>
        <div class="cz">${c.items.length} spot${c.items.length>1?'s':''} · top ${best&&best.rating?('★'+best.rating.toFixed(1)):'—'}</div></button>`;
    }).join("");
    return `<div class="region-h">${r}</div><div class="stamps">${stamps}</div>`;
  }).join("");
}

/* ---------- OUR TRIP ----------------------------------------------------- */
const estFor = d => d.price==="$$" ? 45 : 60;
function tripRow(d, cls){
  const p = pk(d.name);
  const who = `<div class="who">${p.j?'<span class="wtag j">J</span>':''}${p.a?'<span class="wtag a">A</span>':''}</div>`;
  return `<div class="trow ${cls}"><span class="flag">${d.flag}</span>
    <div class="tinfo"><b>${d.name}</b><span>${d.cuisine} · ${d.neighborhood} · ${d.borough}</span></div>
    ${who}<span class="trate">${d.rating?('★ '+d.rating.toFixed(1)):'—'}</span>
    <a class="booklink" href="${bookURL(d)}" target="_blank" rel="noopener">Book ↗</a></div>`;
}
function renderTrip(){
  const body = $("#tripBody");
  const picked = DATA.filter(d=>isPicked(d.name));
  if(!picked.length){ body.innerHTML = `<div class="empty"><div class="big">No tables picked yet</div>Head to Browse and start hearting places you each love. Mutual picks land here as ★ Matches — your easy "let's book it" list.</div>`; return; }
  const sortR = (a,b)=>(b.rating||0)-(a.rating||0);
  const matched = picked.filter(d=>isMatch(d.name)).sort(sortR);
  const jOnly = picked.filter(d=>pk(d.name).j && !pk(d.name).a).sort(sortR);
  const aOnly = picked.filter(d=>pk(d.name).a && !pk(d.name).j).sort(sortR);
  const est = picked.reduce((s,d)=>s+estFor(d),0);
  const cN = new Set(picked.map(d=>d.country)).size;
  let html = "";
  if(matched.length) html += `<div class="trip-sec"><h3>★ <span class="b">Matched — you both want these</span> <span style="color:var(--gold-2)">(${matched.length})</span></h3><div class="trip-list">${matched.map(d=>tripRow(d,'match')).join("")}</div></div>`;
  if(jOnly.length)   html += `<div class="trip-sec"><h3><span class="b">Jasmine's picks</span> (${jOnly.length})</h3><div class="trip-list">${jOnly.map(d=>tripRow(d,'')).join("")}</div></div>`;
  if(aOnly.length)   html += `<div class="trip-sec"><h3><span class="b">Adrian's picks</span> (${aOnly.length})</h3><div class="trip-list">${aOnly.map(d=>tripRow(d,'')).join("")}</div></div>`;
  html += `<div class="budget"><span><span class="bb">$${est}</span> <span class="bl">est. food total</span></span>
    <span><span class="bb">${picked.length}</span> <span class="bl">tables</span></span>
    <span><span class="bb">${matched.length}</span> <span class="bl">matches</span></span>
    <span><span class="bb">${cN}</span> <span class="bl">countries</span></span>
    <small>Food only, one seat each — prix-fixe is $30–$60 per person; tax, drinks &amp; tip are extra.</small></div>`;
  body.innerHTML = html;
}

/* ---------- STATS + PILLS ------------------------------------------------ */
function renderStats(){
  const cs = countries();
  const picked = DATA.filter(d=>isPicked(d.name)).length;
  const matches = DATA.filter(d=>isMatch(d.name)).length;
  const rated = DATA.filter(d=>d.rating!=null);
  const avg = rated.length ? (rated.reduce((s,d)=>s+d.rating,0)/rated.length) : 0;
  $("#statRail").innerHTML = `
    <div class="rstat cob"><div class="n">${DATA.length}</div><div class="l">Tables</div></div>
    <div class="rstat gold"><div class="n">${cs.length}</div><div class="l">Countries</div></div>
    <div class="rstat red"><div class="n">${matches}</div><div class="l">Your matches</div></div>
    <div class="rstat"><div class="n">${[...visited].length}</div><div class="l">Stamped</div></div>
    <div class="rstat"><div class="n">${avg?avg.toFixed(1):'—'}</div><div class="l">Avg ★ rating</div></div>`;
  $("#pillBrowse").textContent = DATA.length;
  $("#pillPass").textContent = `${[...visited].length}/${cs.length}`;
  $("#pillTrip").textContent = picked;
}
function renderAll(){ renderStats(); renderBrowse(); if(!$("#view-passport").hidden) renderPassport(); if(!$("#view-trip").hidden) renderTrip(); }

/* ---------- MODAL -------------------------------------------------------- */
function openCountry(country){
  const items = DATA.filter(d=>d.country===country).sort((a,b)=>(b.rating||0)-(a.rating||0));
  if(!items.length) return;
  const flag = items[0].flag, on = visited.has(country);
  const dlg = $("#detail"); dlg.hidden = false;
  dlg.innerHTML = `<div class="scrim"></div><div class="sheet">
    <div class="sheet-head"><div><span class="flag" style="font-size:34px">${flag}</span>
      <h3 style="font-family:var(--serif);font-size:25px;margin:6px 0 0;font-weight:600">${country}</h3>
      <p style="font-family:var(--mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-soft);margin:4px 0 0">${items.length} restaurant${items.length>1?'s':''} this Restaurant Week</p></div>
      <button class="icon-btn" id="closeDetail" aria-label="Close">✕</button></div>
    <button class="flowcta ${on?'':'gold'}" id="toggleVisit" style="width:100%;justify-content:center;margin:16px 0">${on?'✓ Stamped — tap to remove':'Stamp this country as visited'}</button>
    <div class="sheet-list">${items.map(d=>`<a class="sheet-item" href="${bookURL(d)}" target="_blank" rel="noopener">
      <div><b>${d.name}</b><span>${d.neighborhood} · ${d.borough} · ${d.price}</span></div>
      <span class="trate">${d.rating?('★ '+d.rating.toFixed(1)):'—'}</span></a>`).join("")}</div></div>`;
  document.body.style.overflow = "hidden";
  $("#closeDetail").onclick = closeDetail;
  dlg.querySelector(".scrim").onclick = closeDetail;
  $("#toggleVisit").onclick = () => {
    if(visited.has(country)) visited.delete(country); else visited.add(country);
    persist(); renderPassport(); renderStats(); closeDetail();
  };
}
function closeDetail(){ $("#detail").hidden = true; document.body.style.overflow = ""; }

/* ---------- VIEW SWITCH -------------------------------------------------- */
function switchView(v){
  $$(".tab").forEach(t => t.setAttribute("aria-selected", t.getAttribute("data-view")===v));
  ["browse","passport","trip"].forEach(x => $("#view-"+x).hidden = (x!==v));
  if(v==="passport") renderPassport();
  if(v==="trip") renderTrip();
  const y = $("nav.tabs").getBoundingClientRect().top + scrollY - 0;
  if(scrollY > y) scrollTo({ top:y, behavior:"smooth" });
}

/* ---------- EVENTS ------------------------------------------------------- */
function wireEvents(){
  $("#q").addEventListener("input", renderBrowse);
  ["fCuisine","fBorough","fPrice","fWho","sort"].forEach(id => $("#"+id).addEventListener("change", renderBrowse));

  document.addEventListener("click", e => {
    const ht = e.target.closest("[data-heart]");
    if(ht){
      const who = ht.getAttribute("data-heart"), nm = decodeURIComponent(ht.getAttribute("data-name"));
      const cur = pk(nm), next = { ...cur }; next[who] = !cur[who];
      if(!next.j && !next.a) delete picks[nm]; else picks[nm] = next;
      persist(); renderBrowse(); renderStats(); if(!$("#view-trip").hidden) renderTrip();
      if(next.j && next.a) toast(`✦ It's a <b>Match</b> — ${nm} is on your list`);
      return;
    }
    const st = e.target.closest("[data-country]");
    if(st){ openCountry(decodeURIComponent(st.getAttribute("data-country"))); return; }
    const tab = e.target.closest(".tab");
    if(tab){ switchView(tab.getAttribute("data-view")); }
  });
  document.addEventListener("keydown", e => { if(e.key==="Escape") closeDetail(); });

  $("#shareBtn").addEventListener("click", async () => {
    syncHash();
    const url = location.origin + location.pathname + "?room=" + encodeURIComponent(Sync.room) + "#trip=" + serialize();
    try{ await navigator.clipboard.writeText(url); toast(Sync.mode==="live" ? "💌 Link copied — you're synced live" : "💌 Link copied — text it to stay in sync"); }
    catch(e){
      const ta=document.createElement("textarea"); ta.value=url; document.body.appendChild(ta); ta.select();
      try{ document.execCommand("copy"); toast("💌 Link copied — text it to stay in sync"); }catch(_){ toast("Copy this page's URL to share"); }
      ta.remove();
    }
  });
  $("#surpriseBtn").addEventListener("click", () => {
    const pool = DATA.filter(d=>d.rating && d.rating>=4.5);
    if(!pool.length) return;
    const p = pool[Math.floor((Date.now()/97) % pool.length)];
    toast(`✦ Tonight: <b>${p.name}</b> — ${p.cuisine}, ${p.neighborhood} (★${p.rating.toFixed(1)})`);
    if(globe) globe.focus(p.country);
  });
  $$("[data-jump='browse']").forEach(b => b.addEventListener("click", () => switchView("browse")));
  $("#jumpMatches").addEventListener("click", () => {
    switchView("browse"); $("#fWho").value="match"; renderBrowse();
    if(!DATA.some(d=>isMatch(d.name))) toast("No matches yet — heart the same spot as each other ♥");
  });

  // theme
  const savedTheme = (()=>{ try{ return localStorage.getItem("rw_theme"); }catch(e){ return null; } })();
  if(savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);
  $("#themeBtn").addEventListener("click", () => {
    const now = document.documentElement.getAttribute("data-theme")==="day" ? "night" : "day";
    if(now==="night") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme","day");
    try{ localStorage.setItem("rw_theme", now); }catch(e){}
    $("#themeBtn").innerHTML = now==="day" ? "☾ Night" : "☀ Day";
  });
  $("#themeBtn").innerHTML = document.documentElement.getAttribute("data-theme")==="day" ? "☀ Day" : "☾ Night";
}

/* ---------- SYNC WIRING -------------------------------------------------- */
function onRemote(remote){
  const merged = mergeState({ picks, visited:[...visited] }, remote);
  picks = merged.picks; visited = new Set(merged.visited);
  try{ localStorage.setItem("rw_picks", JSON.stringify(picks)); localStorage.setItem("rw_visited", JSON.stringify([...visited])); }catch(e){}
  syncHash(); renderAll();
}
function onStatus(mode, room){
  const b = $("#syncBadge");
  b.className = "sync-badge" + (mode==="live" ? " live" : "");
  b.innerHTML = `<span class="dot"></span>${mode==="live" ? "Live · "+room : "Share-link mode"}`;
}

/* ---------- BOOT --------------------------------------------------------- */
async function boot(){
  hydrateLocal();
  DATA = await loadData();

  fillSelect($("#fCuisine"), uniq(DATA.map(d=>d.cuisine)), "All cuisines");
  fillSelect($("#fBorough"), uniq(DATA.map(d=>d.borough)), "All boroughs");
  fillSelect($("#fPrice"), ["$$","$$$","$$$$"], "Any price");

  renderStats(); renderBrowse(); wireEvents(); syncHash();

  // globe
  try{
    const cs = countries().map(c => ({ country:c.country, lat:c.lat, lng:c.lng, count:c.items.length }));
    globe = createGlobe($("#globe"), { home:HOME, countries:cs, reduced, onPick:c => { switchView("browse"); openCountry(c); } });
  }catch(e){ console.warn("Globe failed to start:", e); $(".globe-hint").textContent = ""; }

  // live sync (optional)
  await Sync.init({ onRemote, onStatus });
  if(Sync.mode==="live") Sync.push({ picks, visited:[...visited] });
}
boot();
