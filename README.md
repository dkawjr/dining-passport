# 🛂 Jasmine & Adrian's Dining Passport

A production, deployable web app for planning **NYC Restaurant Week Summer 2026** (Jul 20 – Aug 16) as a couple:

- a live **3D globe** (Three.js) with a gold flight-arc from New York to every cuisine's home country;
- **browse / filter** by cuisine, borough, price ($30 / $45 / $60 tiers) and **sort by real ratings**;
- a couple **match mechanic** — you each ♥ places; mutual picks surface as ★ **Matches**;
- a **passport** stamp wall — collect a stamp for every country you dine your way through;
- **Our Trip** shortlist with a budget tally;
- **live cross-device sync** (optional) + a **share link** that carries your whole plan.

Night theme by default; a **Day** (bright) theme toggle lives top-right.

---

## Run it locally

ES modules need a server (not `file://`):

```bash
cd dining-passport
python3 -m http.server 8777
# open http://localhost:8777
```

## Deploy it (≈2 minutes, free)

**Netlify Drop** — the fastest path, no account math:
1. Go to <https://app.netlify.com/drop>
2. Drag the whole `dining-passport` folder onto the page.
3. You get a public URL like `https://your-name.netlify.app` — send it to Jasmine. Done.

Any static host works too (Vercel, Cloudflare Pages, GitHub Pages, S3). It's just static files.

---

## Turn on live sync (optional)

Without setup, the app persists locally and the **"Copy link to send"** button carries your full plan in the URL — text it and you're in sync. To make it update **live on both phones at once**, add a free Firebase Realtime Database:

1. Create a project at <https://console.firebase.google.com> → **Add project**.
2. **Build → Realtime Database → Create database** → start in **test mode** (fine for two people; locks to read/write).
3. **Project settings → General → Your apps → Web app (`</>`)** → register → copy the `firebaseConfig` values.
4. Paste them into **`config.js`** (replace the `YOUR_…` placeholders — make sure `databaseURL` is filled).
5. Redeploy. The tab bar badge flips to **● Live**.

Both of you open the same link — it includes `?room=jazz-adrian` — and every heart & stamp syncs in real time. Change the room code in the URL to start a fresh shared plan.

> Test mode leaves the database open to anyone with the URL. For just the two of you that's fine short-term; delete the database after Restaurant Week, or add a simple auth rule if you want it locked down.

---

## Grow to all ~600 restaurants

The app ships **seeded with 71 hand-verified participating restaurants** (real Google/Yelp ratings where confirmable; blank = unverified, never faked). To expand toward the full field:

1. Create a **`restaurants.json`** next to `index.html` — an array of objects shaped like:

```json
[
  {
    "name": "Example Osteria",
    "cuisine": "Italian",
    "neighborhood": "West Village",
    "borough": "Manhattan",
    "rating": 4.5,
    "reviews": 812,
    "yelp": null,
    "price": "$$$",
    "why": "One punchy line about the standout dish or vibe."
  }
]
```

2. Reload. The app **merges by name**: a matching name enriches the seed row, a new name is added. Unknown cuisines fall back gracefully; `cuisine` drives the country/flag/globe pin automatically (see `CMAP` in `data.js` — add a mapping for any new cuisine string).

`rating`/`reviews`/`yelp` may be `null`. `price` is one of `"$$"`, `"$$$"`, `"$$$$"`.

---

## Files

| file | what it is |
|------|------------|
| `index.html` | page shell + Three.js importmap |
| `styles.css` | night + day themes, all components |
| `data.js` | the 71-restaurant seed, cuisine→country map, `restaurants.json` loader |
| `globe.js` | the WebGL globe (Three.js + OrbitControls) |
| `app.js` | browse / passport / trip logic, match mechanic, state |
| `sync.js` | Firebase live sync + share-link fallback |
| `config.js` | optional Firebase keys (placeholders by default) |

## Notes & honesty

- Ratings are **point-in-time** Google/Yelp figures and drift daily — always re-confirm the actual RW menu and book through [nyctourism.com/rw](https://www.nyctourism.com/restaurant-week/).
- The **Bronx** is absent on purpose: its two rumored 2026 participants couldn't be verified without guessing.
- The 71 seed skews toward Manhattan (Forbes picks + the FiDi/Downtown and Upper East Side alliance lists) with a Brooklyn / Queens / Staten Island sampler. `restaurants.json` is how you round it out to all ~600.
