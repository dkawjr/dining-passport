// ============================================================================
//  flipbook.js — thin wrapper around StPageFlip (real soft page-bending with
//  dynamic shadows + drag physics). Pages are plain HTML; we rebuild on filter
//  changes. Clicks always interact (flip-by-click disabled); drag turns pages.
// ============================================================================

const OPTS = {
  width: 480, height: 640,          // base ratio; 'stretch' fits the container
  size: "stretch",
  minWidth: 280,  maxWidth: 1600,
  minHeight: 380, maxHeight: 1700,
  drawShadow: true,
  maxShadowOpacity: 0.5,
  showCover: true,
  usePortrait: true,
  autoSize: true,
  flippingTime: 850,
  disableFlipByClick: true,         // taps interact; drag/swipe turns
  useMouseEvents: true,
  mobileScrollSupport: true,
  swipeDistance: 30,
  clickEventForward: true
};

export function createBook(mount, { getPages, onFlip, onBuild }){
  let pf;
  const render = pages => pages.map(p =>
    `<div class="page${p.hard ? " page-hard" : ""}"${p.hard ? ' data-density="hard"' : ""}>${p.html}</div>`
  ).join("");

  function build(){
    const pages = getPages();
    mount.innerHTML = render(pages);
    pf = new St.PageFlip(mount, OPTS);
    pf.loadFromHTML(mount.querySelectorAll(".page"));
    pf.on("flip", e => onFlip && onFlip(e.data));
    if (onBuild) onBuild(pf);
    if (onFlip) { try { onFlip(pf.getCurrentPageIndex()); } catch(e){ onFlip(0); } }
  }
  build();

  return {
    flipNext(){ try{ pf.flipNext(); }catch(e){} },
    flipPrev(){ try{ pf.flipPrev(); }catch(e){} },
    goTo(i){ try{ pf.turnToPage ? pf.turnToPage(i) : pf.flip(i); }catch(e){} },
    count(){ try{ return pf.getPageCount(); }catch(e){ return 0; } },
    rebuild(){ try{ pf.destroy(); }catch(e){} build(); }
  };
}
