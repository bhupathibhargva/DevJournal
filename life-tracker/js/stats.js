/* Adherence stats over the recorded days. All functions take an optional
   reference date so they are deterministic under test. */

import { CATS } from './data.js';
import { dateKey, itemsFor } from './utils.js';
import { state } from './store.js';

export function computeStats(rangeDays, ref = new Date()) {
  const out = { tracked: 0, appl: 0, done: 0, cat: {}, items: {}, days: [], byDow: {} };
  for (const c of CATS) out.cat[c] = { a: 0, d: 0 };
  for (let dw = 0; dw < 7; dw++) out.byDow[dw] = { a: 0, d: 0 };

  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - i);
    const key = dateKey(d);
    const dow = d.getDay();
    const rec = state.days[key];
    const entry = { key, dow, pct: null, isToday: i === 0, rec };
    if (rec) {
      const items = itemsFor(rec.type, dow);
      let dc = 0;
      for (const it of items) {
        out.appl++;
        out.cat[it.cat].a++;
        out.byDow[dow].a++;
        if (!out.items[it.id]) out.items[it.id] = { a: 0, d: 0, ti: it.ti, cat: it.cat, checkHours: [] };
        out.items[it.id].a++;
        if (rec.checks[it.id]) {
          dc++;
          out.done++;
          out.cat[it.cat].d++;
          out.items[it.id].d++;
          out.byDow[dow].d++;
          if (typeof rec.checks[it.id] === 'string') {
            const ts = new Date(rec.checks[it.id]);
            if (!isNaN(ts.getTime())) out.items[it.id].checkHours.push(ts.getHours() + ts.getMinutes() / 60);
          }
        }
      }
      out.tracked++;
      entry.pct = items.length ? Math.round((dc / items.length) * 100) : 0;
    }
    out.days.push(entry);
  }
  return out;
}

/* Consecutive days (ending today or yesterday) where testFn(rec, dow) holds.
   Today is skipped while still unlogged so an in-progress day never breaks a streak. */
export function streakOf(testFn, ref = new Date()) {
  let n = 0;
  let skipToday = true;
  for (let i = 0; i < 365; i++) {
    const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - i);
    const rec = state.days[dateKey(d)];
    const ok = rec ? testFn(rec, d.getDay()) : false;
    if (ok) {
      n++;
      skipToday = false;
    } else {
      if (i === 0 && skipToday) continue;
      break;
    }
  }
  return n;
}

export function catDone(rec, dow, cat) {
  return itemsFor(rec.type, dow).some((it) => it.cat === cat && rec.checks[it.id]);
}
