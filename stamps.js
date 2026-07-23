// ============================================================================
//  stamps.js — generated SVG visa stamps (inked + ghost). Shared art module.
// ============================================================================
const INKS   = ["#B23A2E", "#294B87", "#2E6B4F", "#5B3A78", "#8A6D22", "#9C3E63"];
const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

export function hashCode(s){ let h = 2166136261; for (let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h); }
function entryDate(seed){ const d = new Date(2026, 6, 20 + (seed % 28)); return `${String(d.getDate()).padStart(2,"0")} ${MONTHS[d.getMonth()]} 2026`; }

export function inkedStamp(country, flag, seed){
  const uid = "s"+seed;
  const ink = INKS[seed % INKS.length];
  const rot = (seed % 25) - 12;
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
      <text class="st-arc" font-size="12"><textPath href="#top${uid}" xlink:href="#top${uid}" startOffset="50%">${country.toUpperCase()}</textPath></text>
      <text class="st-arc" font-size="8.4"><textPath href="#bot${uid}" xlink:href="#bot${uid}" startOffset="50%">NYC RESTAURANT WEEK</textPath></text>
      <text x="80" y="70" text-anchor="middle" font-size="11" letter-spacing="1" class="st-mono">✦ ENTRY ✦</text>
      <text x="80" y="99" text-anchor="middle" font-size="10.5" class="st-mono">${entryDate(seed)}</text>
      <line x1="46" y1="80" x2="63" y2="80" stroke="${ink}" stroke-width="1"/>
      <line x1="97" y1="80" x2="114" y2="80" stroke="${ink}" stroke-width="1"/>
    </g>
    <text x="80" y="83" text-anchor="middle" font-size="30" class="st-flag">${flag}</text>
  </svg>`;
}

export function ghostStamp(country, flag){
  return `<svg class="stamp-svg" viewBox="0 0 160 160" aria-label="${country} not stamped">
    <g fill="none" stroke="var(--pp-ghost)" stroke-width="1.6" stroke-dasharray="5 5" opacity="0.85"><circle cx="80" cy="80" r="55"/></g>
    <text x="80" y="70" text-anchor="middle" font-size="26" class="st-flag" opacity="0.5">${flag}</text>
    <text x="80" y="95" text-anchor="middle" font-size="10" class="st-mono" fill="var(--pp-ghost)">${country.toUpperCase()}</text>
    <text x="80" y="110" text-anchor="middle" font-size="7.5" class="st-mono" fill="var(--pp-ghost)" letter-spacing="1.5">TAP TO STAMP</text>
  </svg>`;
}

export function stampCell(c, visited){
  const seed = hashCode(c.country);
  return `<div class="stamp-cell ${visited?'inked':'empty'}" role="button" tabindex="0" data-country="${encodeURIComponent(c.country)}" data-seed="${seed}" data-flag="${c.flag}">
    ${visited ? inkedStamp(c.country, c.flag, seed) : ghostStamp(c.country, c.flag)}
  </div>`;
}
