/* COACH tab: rule-based pattern insights over 28 days + optional AI report
   (the AI call only works when the page runs inside the Claude app). */

import { ITEMS } from '../data.js';
import { dateKey, itemsFor, median, fmtHour } from '../utils.js';
import { state, saveState } from '../store.js';
import { computeStats, streakOf, catDone } from '../stats.js';

const AI_BTN_LABEL = '\u{1F9E0} GENERATE AI COACH REPORT';

function findItem(id) {
  for (const mode of Object.keys(ITEMS)) {
    const hit = ITEMS[mode].find((it) => it.id === id);
    if (hit) return hit;
  }
  return null;
}

function itemLevelSuggestions(st, sugs) {
  const arr = Object.entries(st.items)
    .filter(([, o]) => o.a >= 4)
    .sort(([, a], [, b]) => a.d / a.a - b.d / b.a);
  for (const [id, it] of arr) {
    const p = it.d / it.a;
    const key = 'sug-' + id;
    if (p < 0.4) {
      let fix = 'Consider moving it earlier in the day or shrinking it by half — a 50% version done beats a 100% version skipped.';
      if (it.cat === 'SLEEP') fix = 'The 9:45 screens-off is the keystone — set a phone alarm labeled SLEEP IS THE PLAN.';
      if (it.cat === 'READ') fix = 'Attach it physically: book sits on your lunch spot before you sit down.';
      if (id.includes('gym')) fix = 'If mornings keep losing, prep the gym bag the night before and sleep in workout clothes-adjacent readiness.';
      sugs.push({ key, cls: 'bad', html: `<b>STRUGGLING: ${it.ti}</b> — ${Math.round(p * 100)}% over 4 weeks. ${fix}` });
    } else if (p >= 0.85) {
      sugs.push({ key: key + '-win', cls: 'good', html: `<b>LOCKED IN: ${it.ti}</b> — ${Math.round(p * 100)}%. This habit is installed. Candidate for progression (e.g., +10 min or heavier load).` });
    }
  }
}

function worstWeekdaySuggestion(st, sugs) {
  let worstDw = null;
  let worstP = 1;
  for (let dw = 0; dw < 7; dw++) {
    const bd = st.byDow[dw];
    if (bd.a >= 8) {
      const p = bd.d / bd.a;
      if (p < worstP) { worstP = p; worstDw = dw; }
    }
  }
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  if (worstDw !== null && worstP < 0.55) {
    sugs.push({
      key: 'sug-dow-' + worstDw,
      cls: 'warn',
      html: `<b>${dayNames[worstDw].toUpperCase()} IS YOUR LEAK</b> — ${Math.round(worstP * 100)}% adherence. Look at what that day asks of you; one item probably needs to move to a different day.`
    });
  }
}

/* Does Monday basketball wreck Tuesday's gym? */
function ballRecoverySuggestion(sugs) {
  const done = { a: 0, d: 0 };
  const today = new Date();
  for (let k = 27; k >= 1; k--) {
    const monDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - k);
    if (monDate.getDay() !== 1) continue;
    const mon = state.days[dateKey(monDate)];
    const tueDate = new Date(monDate.getFullYear(), monDate.getMonth(), monDate.getDate() + 1);
    const tue = state.days[dateKey(tueDate)];
    if (!mon || !tue || !mon.checks['o-ball']) continue;
    done.a++;
    if (tue.checks['w-gym']) done.d++;
  }
  if (done.a >= 2) {
    const pct = Math.round((done.d / done.a) * 100);
    const good = pct >= 60;
    const msg = good
      ? "You're recovering well from ball nights — keep the 11:30 lights-out honest."
      : 'Ball night is eating Tuesday. Options: pre-pack gym bag Sunday, or officially make Tue a lighter session.';
    sugs.push({ key: 'sug-ball-tue', cls: good ? 'good' : 'warn', html: `<b>AFTER MONDAY BASKETBALL,</b> Tuesday gym completes ${pct}% (${done.a} samples). ${msg}` });
  }
}

/* Does hitting screens-off predict a better next day? */
function sleepEffectSuggestion(st, sugs) {
  const next = { slept: [], skipped: [] };
  for (let q = 0; q < st.days.length - 1; q++) {
    const rec = st.days[q].rec;
    const nxt = st.days[q + 1];
    if (!rec || nxt.pct === null) continue;
    const slept = itemsFor(rec.type, st.days[q].dow).some((it) => it.cat === 'SLEEP' && rec.checks[it.id]);
    (slept ? next.slept : next.skipped).push(nxt.pct);
  }
  if (next.slept.length >= 3 && next.skipped.length >= 3) {
    const avg = (a) => Math.round(a.reduce((x, y) => x + y, 0) / a.length);
    const avgSlept = avg(next.slept);
    const avgSkipped = avg(next.skipped);
    if (avgSlept - avgSkipped >= 10) {
      sugs.push({
        key: 'sug-sleep-next',
        cls: 'good',
        html: `<b>PROOF SLEEP WORKS:</b> after nights you hit screens-off, next-day adherence averages ${avgSlept}% vs ${avgSkipped}% when you don't. That's a +${avgSlept - avgSkipped} point edge from one habit.`
      });
    }
  }
}

/* Items habitually logged >3h from their scheduled slot. */
function timeDriftSuggestions(st, sugs) {
  for (const [id, o] of Object.entries(st.items)) {
    if (o.checkHours.length < 3) continue;
    const src = findItem(id);
    if (!src || !src.s) continue;
    const [h, m] = src.s.split(':').map(Number);
    const sched = h + m / 60;
    const med = median(o.checkHours);
    if (med !== null && Math.abs(med - sched) > 3) {
      sugs.push({
        key: 'sug-drift-' + id,
        cls: 'neutral',
        html: `<b>TIME DRIFT: ${o.ti}</b> — scheduled ${fmtHour(sched)} but typically logged around ${fmtHour(med)}. If you're logging in real time, the block may live at the wrong hour — consider moving it.`
      });
    }
  }
}

export function buildSuggestions() {
  const st = computeStats(28);
  const sugs = [];
  if (st.tracked < 3) {
    return [{ key: 'boot', cls: 'neutral', html: '<b>COLLECTING DATA.</b> The coach needs ~1 week of check-ins before patterns emerge. Keep tapping — every check teaches it something.' }];
  }
  itemLevelSuggestions(st, sugs);
  worstWeekdaySuggestion(st, sugs);
  ballRecoverySuggestion(sugs);
  sleepEffectSuggestion(st, sugs);
  timeDriftSuggestions(st, sugs);
  if (!sugs.length) {
    sugs.push({ key: 'allgood', cls: 'good', html: '<b>NO FLAGS.</b> Everything with enough data is above thresholds. The system is working — do not touch it.' });
  }
  return sugs;
}

export function renderCoach() {
  const sugs = buildSuggestions();
  let html = '<div class="label b">COACH — PATTERNS FROM YOUR LAST 28 DAYS</div>';
  let shown = 0;
  for (const s of sugs) {
    if (state.dismissed[s.key]) continue;
    shown++;
    html += `<div class="insight ${s.cls}">${s.html}<button class="dismiss" data-key="${s.key}" aria-label="Dismiss">&#10005;</button></div>`;
  }
  if (!shown) {
    html += '<div class="empty">ALL INSIGHTS DISMISSED — <span id="restoreAll" class="linkish">RESTORE</span></div>';
  }
  const body = document.getElementById('coachBody');
  body.innerHTML = html;

  body.querySelectorAll('.dismiss').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.dismissed[btn.dataset.key] = true;
      saveState();
      renderCoach();
    });
  });
  const restore = document.getElementById('restoreAll');
  if (restore) {
    restore.addEventListener('click', () => {
      state.dismissed = {};
      saveState();
      renderCoach();
    });
  }
}

function buildAiSummary() {
  const st = computeStats(28);
  const summary = {
    adherencePct: st.appl ? Math.round((st.done / st.appl) * 100) : 0,
    daysTracked: st.tracked,
    categories: {},
    items: {},
    byDow: st.byDow,
    streaks: {
      noAlcohol: streakOf((r) => !!r.rules.alcohol),
      noSugar: streakOf((r) => !!r.rules.sugar),
      reading: streakOf((r, dw) => catDone(r, dw, 'READ')),
      training: streakOf((r, dw) => catDone(r, dw, 'TRAIN'))
    }
  };
  for (const [c, v] of Object.entries(st.cat)) {
    if (v.a) summary.categories[c] = Math.round((v.d / v.a) * 100) + '% of ' + v.a;
  }
  for (const o of Object.values(st.items)) {
    if (o.a >= 2) summary.items[o.ti] = Math.round((o.d / o.a) * 100) + '% of ' + o.a;
  }
  return summary;
}

function aiCoach() {
  const btn = document.getElementById('btnAI');
  const out = document.getElementById('aiOut');
  btn.disabled = true;
  btn.textContent = 'THINKING…';
  out.style.display = 'block';
  out.textContent = 'Analyzing your last 28 days…';

  const prompt =
    'You are a blunt, encouraging-but-demanding performance coach reviewing 28 days of habit-tracking data for a 34-year-old engineering manager. ' +
    'His goals: sleep 5.5h to 7h+, weight 195 to 175 lbs, Whoop biological age 41 to 34, 11.5 hrs/week learning (AI, investing, business), Toastmasters skill growth, family presence. ' +
    'His schedule: office Mon/Wed/alt-Thu, WFH Tue/Fri, basketball Mon+Fri nights, gym Tue-Thu mornings.\n\n' +
    'DATA: ' + JSON.stringify(buildAiSummary()) + '\n\n' +
    'Write a short coach report: (1) one-line verdict, (2) 2-3 things working - be specific with numbers, ' +
    '(3) 2-3 things not working and the single most likely root cause for each, ' +
    '(4) exactly ONE change to make next week - the highest-leverage one. ' +
    'Plain text, no markdown, under 250 words, direct tone, no flattery.';

  fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] })
  })
    .then((r) => r.json())
    .then((data) => {
      const txt = (data && data.content || [])
        .filter((c) => c.type === 'text')
        .map((c) => c.text)
        .join('');
      out.textContent = txt || 'No response — try again.';
    })
    .catch(() => {
      out.textContent = 'AI coach requires running inside the Claude app (this feature calls Claude itself). The pattern insights above work everywhere.';
    })
    .finally(() => {
      btn.disabled = false;
      btn.textContent = AI_BTN_LABEL;
    });
}

export function bindCoach() {
  document.getElementById('btnAI').addEventListener('click', aiCoach);
}
