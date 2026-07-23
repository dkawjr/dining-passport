// ============================================================================
//  sync.js — genuine cross-device sync between Jasmine & Adrian.
//
//  Uses Firebase Realtime Database when configured (see config.js). Both of you
//  open the same link (?room=jazz-adrian) and every heart / stamp updates live
//  on the other's screen. If Firebase isn't configured, the app still works:
//  it persists locally and the "Copy link" button carries full state in the URL.
// ============================================================================

const STATE = { picks:{}, visited:[] };

export const Sync = {
  mode:"local",          // "live" once Firebase connects, else "local"
  room:"jazz-adrian",
  _db:null, _ref:null, _onRemote:null, _muteUntil:0,

  async init({ onRemote, onStatus }){
    this._onRemote = onRemote;
    const params = new URLSearchParams(location.search);
    this.room = (params.get("room") || "jazz-adrian").replace(/[^a-z0-9_-]/gi, "").slice(0, 40) || "jazz-adrian";

    const cfg = window.FIREBASE_CONFIG;
    const configured = cfg && cfg.databaseURL && !/YOUR_/.test(JSON.stringify(cfg));
    if (!configured){ onStatus && onStatus(this.mode, this.room); return; }

    try {
      const [{ initializeApp }, dbmod] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js")
      ]);
      const app = initializeApp(cfg);
      this._db = dbmod.getDatabase(app);
      this._ref = dbmod.ref(this._db, "rooms/" + this.room);
      this._set = dbmod.set;
      dbmod.onValue(this._ref, snap => {
        const val = snap.val();
        if (!val || Date.now() < this._muteUntil) return;
        this._onRemote && this._onRemote(val);
      });
      this.mode = "live";
      onStatus && onStatus(this.mode, this.room);
    } catch(e){
      console.warn("Live sync unavailable, staying local:", e);
      onStatus && onStatus(this.mode, this.room);
    }
  },

  // push local state up (throttled-ish via mute window so echoes don't loop)
  push(state){
    if (this.mode !== "live" || !this._ref) return;
    this._muteUntil = Date.now() + 400;
    try { this._set(this._ref, { picks:state.picks, visited:state.visited, ts:Date.now() }); } catch(e){}
  }
};

// merge helper: union of picks (OR the his/hers flags) and visited countries
export function mergeState(base, incoming){
  const out = { picks:{ ...base.picks }, visited:new Set(base.visited) };
  if (incoming.picks) for (const [k, v] of Object.entries(incoming.picks)){
    const cur = out.picks[k] || { j:false, a:false };
    out.picks[k] = { j:cur.j || !!v.j, a:cur.a || !!v.a };
    if (!out.picks[k].j && !out.picks[k].a) delete out.picks[k];
  }
  if (incoming.visited) incoming.visited.forEach(c => out.visited.add(c));
  return { picks:out.picks, visited:[...out.visited] };
}
