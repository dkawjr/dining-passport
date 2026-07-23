// ============================================================================
//  config.js — OPTIONAL live-sync setup.
//
//  The app works fully without this (local + share-link). To turn on real
//  live sync between two phones, create a free Firebase Realtime Database and
//  paste its config below. Full walkthrough in README.md → "Turn on live sync".
//
//  Leave the YOUR_… placeholders as-is to keep sync in local/share-link mode.
// ============================================================================
window.FIREBASE_CONFIG = {
  apiKey:      "YOUR_API_KEY",
  authDomain:  "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId:   "YOUR_PROJECT",
  appId:       "YOUR_APP_ID"
};
