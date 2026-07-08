/* TODAY tab: checklist, day-type picker, rule chips, progress, focus banner. */

import { ITEMS, CATS } from '../data.js';
import { itemsFor } from '../utils.js';
import { state, session, ensureDay, saveState } from '../store.js';
import { computeStats } from '../stats.js';

function minutesOf(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function isNowWindow(it, nowMins) {
  if (!it.s || !it.e) return false;
  const s = minutesOf(it.s);
  const e = minutesOf(it.e);
  return s <= e ? nowMins >= s && nowMins < e : nowMins >= s || nowMins < e;
}

function itemHtml(it, { done, isNow, extra }) {
  return `
    <div class="item ${it.cat}${done ? ' done' : ''}${isNow ? ' now' : ''}${extra ? ' extra' : ''}" data-id="${it.id}" role="checkbox" aria-checked="${done}" tabindex="0">
      <div class="box" aria-hidden="true"></div>
      <div class="body">
        <div class="t">${it.time}</div>
        <div class="ti">${it.ti}</div>
        <div class="no">${it.no}</div>
      </div>
      <span class="cat">${it.cat}</span>
    </div>`;
}

export function renderToday() {
  const day = ensureDay(session.todayKey, session.todayDow);

  document.querySelectorAll('.typeBtn').forEach((btn) => {
    btn.classList.toggle('sel', btn.dataset.type === day.type);
  });
  document.getElementById('rule-alcohol').classList.toggle('done', !!day.rules.alcohol);
  document.getElementById('rule-sugar').classList.toggle('done', !!day.rules.sugar);

  const scheduled = itemsFor(day.type, session.todayDow);
  const scheduledIds = new Set(scheduled.map((it) => it.id));
  const extras = (ITEMS[day.type] || []).filter((it) => !scheduledIds.has(it.id));

  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  let html = scheduled
    .map((it) => itemHtml(it, { done: !!day.checks[it.id], isNow: isNowWindow(it, nowMins), extra: false }))
    .join('');
  if (extras.length) {
    html += `<div class="label dim">REST OF THE ${day.type.toUpperCase()} PLAN — NOT SCHEDULED TODAY, TAP IF DONE</div>`;
    html += extras
      .map((it) => itemHtml(it, { done: !!day.checks[it.id], isNow: false, extra: true }))
      .join('');
  }
  document.getElementById('checklist').innerHTML = html;

  const done = scheduled.filter((it) => day.checks[it.id]).length;
  const bonus = extras.filter((it) => day.checks[it.id]).length;
  const pct = scheduled.length ? Math.round((done / scheduled.length) * 100) : 0;
  document.getElementById('pbar').style.width = pct + '%';
  document.getElementById('ptext').textContent =
    `${done} / ${scheduled.length} DONE · ${pct}%` +
    (bonus ? ` · +${bonus} BONUS` : '') +
    (day.rules.alcohol ? ' · NO-ALC ✓' : '') +
    (day.rules.sugar ? ' · NO-SUGAR ✓' : '');

  renderFocusBanner();
}

/* Weakest category over 14 days (needs >=5 samples, <70%) becomes the week's focus. */
function renderFocusBanner() {
  const st = computeStats(14);
  let worstCat = null;
  let worstPct = 1;
  for (const c of CATS) {
    const cd = st.cat[c];
    if (cd.a >= 5) {
      const p = cd.d / cd.a;
      if (p < worstPct) { worstPct = p; worstCat = c; }
    }
  }
  const el = document.getElementById('focusBanner');
  if (worstCat && worstPct < 0.7) {
    el.style.display = 'block';
    el.innerHTML = `<b>THIS WEEK'S FOCUS: ${worstCat}</b> — running at ${Math.round(worstPct * 100)}% over 14 days. One category at a time; this is the one.`;
  } else {
    el.style.display = 'none';
  }
}

function toggleItem(id) {
  const day = ensureDay(session.todayKey, session.todayDow);
  if (day.checks[id]) delete day.checks[id];
  else day.checks[id] = new Date().toISOString();
  saveState();
  renderToday();
}

function toggleRule(rule) {
  const day = ensureDay(session.todayKey, session.todayDow);
  day.rules[rule] = !day.rules[rule];
  saveState();
  renderToday();
}

function resetToday() {
  const day = ensureDay(session.todayKey, session.todayDow);
  day.checks = {};
  day.rules = {};
  saveState();
  renderToday();
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `bhargav-os-data-${session.todayKey}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function bindToday() {
  /* Delegate so the checklist can re-render freely. */
  const checklist = document.getElementById('checklist');
  checklist.addEventListener('click', (e) => {
    const item = e.target.closest('.item');
    if (item) toggleItem(item.dataset.id);
  });
  checklist.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const item = e.target.closest('.item');
    if (item) { e.preventDefault(); toggleItem(item.dataset.id); }
  });

  document.querySelectorAll('.typeBtn').forEach((btn) => {
    btn.addEventListener('click', () => {
      ensureDay(session.todayKey, session.todayDow).type = btn.dataset.type;
      saveState();
      renderToday();
    });
  });
  document.getElementById('rule-alcohol').addEventListener('click', () => toggleRule('alcohol'));
  document.getElementById('rule-sugar').addEventListener('click', () => toggleRule('sugar'));
  document.getElementById('btnReset').addEventListener('click', resetToday);
  document.getElementById('btnExport').addEventListener('click', exportData);
}
