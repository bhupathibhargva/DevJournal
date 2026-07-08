/* App state + persistence. Prefers Claude artifact storage, falls back to
   localStorage, then in-memory only. Migrates v4 data on first load. */

import { autoType } from './utils.js';

const KEY = 'bos_tracker_v5';
const OLD_KEY = 'bos_tracker_v4';
const SAVE_DEBOUNCE_MS = 350;

export const state = { days: {}, dismissed: {} };

/* Mutable session context: today's key/dow and the active sync mode label. */
export const session = { todayKey: '', todayDow: 0, syncMode: 'SESSION ONLY' };

let saveTimer = null;

function hasArtifactStorage() {
  try {
    return typeof window.storage !== 'undefined' && typeof window.storage.get === 'function';
  } catch (e) {
    return false;
  }
}

function hasLocal() {
  try {
    const k = '__t';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch (e) {
    return false;
  }
}

function adoptRaw(raw) {
  if (!raw) return false;
  try {
    const p = JSON.parse(raw);
    if (p && p.days) {
      state.days = p.days;
      state.dismissed = p.dismissed || {};
      return true;
    }
  } catch (e) { /* corrupt payload: start fresh */ }
  return false;
}

export function loadState(cb) {
  if (hasArtifactStorage()) {
    session.syncMode = 'CLOUD (CLAUDE)';
    window.storage.get(KEY, false)
      .then((res) => {
        if (adoptRaw(res && res.value)) return cb();
        return window.storage.get(OLD_KEY, false)
          .then((old) => { if (adoptRaw(old && old.value)) saveState(); cb(); })
          .catch(() => cb());
      })
      .catch(() => {
        window.storage.get(OLD_KEY, false)
          .then((old) => { if (adoptRaw(old && old.value)) saveState(); cb(); })
          .catch(() => cb());
      });
  } else if (hasLocal()) {
    session.syncMode = 'THIS DEVICE';
    try {
      if (!adoptRaw(window.localStorage.getItem(KEY))) {
        if (adoptRaw(window.localStorage.getItem(OLD_KEY))) saveState();
      }
    } catch (e) { /* private mode etc. */ }
    cb();
  } else {
    session.syncMode = 'SESSION ONLY';
    cb();
  }
}

export function saveState() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const payload = JSON.stringify(state);
    if (hasArtifactStorage()) {
      window.storage.set(KEY, payload, false).catch((e) => console.error('save fail', e));
    } else if (hasLocal()) {
      try { window.localStorage.setItem(KEY, payload); } catch (e) { /* quota */ }
    }
  }, SAVE_DEBOUNCE_MS);
}

export function ensureDay(key, dow) {
  if (!state.days[key]) state.days[key] = { type: autoType(dow), checks: {}, rules: {} };
  return state.days[key];
}
