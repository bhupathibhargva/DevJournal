/* Pure date/plan helpers shared by the UI and the stats engine. */

import { ITEMS } from './data.js';

export function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

export function dateKey(d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

/* Default day type when nothing was chosen: weekends off, Mon/Wed office, rest WFH. */
export function autoType(dow) {
  if (dow === 0 || dow === 6) return 'off';
  if (dow === 1 || dow === 3) return 'office';
  return 'wfh';
}

/* An "off" weekday (holiday, PTO) follows the Sunday template. */
export function effDow(type, dow) {
  if (type === 'off' && dow >= 1 && dow <= 5) return 0;
  return dow;
}

export function itemsFor(type, dow) {
  const ed = effDow(type, dow);
  return (ITEMS[type] || []).filter((it) => !it.days || it.days.includes(ed));
}

export function median(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function fmtHour(h) {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  const ap = hh >= 12 ? 'PM' : 'AM';
  let h12 = hh % 12;
  if (h12 === 0) h12 = 12;
  return h12 + ':' + pad(mm) + ' ' + ap;
}
