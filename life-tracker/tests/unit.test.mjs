/* Unit tests for the tracker's pure logic. Run with: node --test life-tracker/tests/ */

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { pad, dateKey, autoType, effDow, itemsFor, median, fmtHour } from '../js/utils.js';
import { state, ensureDay } from '../js/store.js';
import { computeStats, streakOf, catDone } from '../js/stats.js';
import { ITEMS, CATS, CAT_COLORS } from '../js/data.js';

/* Fixed reference: Wednesday 2026-07-08. */
const REF = new Date(2026, 6, 8);

function daysAgo(n) {
  return new Date(REF.getFullYear(), REF.getMonth(), REF.getDate() - n);
}

beforeEach(() => {
  state.days = {};
  state.dismissed = {};
});

test('pad zero-pads single digits', () => {
  assert.equal(pad(5), '05');
  assert.equal(pad(12), '12');
  assert.equal(pad(0), '00');
});

test('dateKey formats YYYY-MM-DD', () => {
  assert.equal(dateKey(new Date(2026, 0, 3)), '2026-01-03');
  assert.equal(dateKey(new Date(2026, 11, 25)), '2026-12-25');
});

test('autoType: weekends off, Mon/Wed office, Tue/Thu/Fri wfh', () => {
  assert.equal(autoType(0), 'off');
  assert.equal(autoType(6), 'off');
  assert.equal(autoType(1), 'office');
  assert.equal(autoType(3), 'office');
  assert.equal(autoType(2), 'wfh');
  assert.equal(autoType(4), 'wfh');
  assert.equal(autoType(5), 'wfh');
});

test('effDow maps off weekdays to the Sunday template', () => {
  assert.equal(effDow('off', 3), 0);
  assert.equal(effDow('off', 0), 0);
  assert.equal(effDow('off', 6), 6);
  assert.equal(effDow('office', 3), 3);
  assert.equal(effDow('wfh', 5), 5);
});

test('itemsFor: office Monday includes ball + home strength, not gym', () => {
  const ids = itemsFor('office', 1).map((it) => it.id);
  assert.ok(ids.includes('o-strength'));
  assert.ok(ids.includes('o-ball'));
  assert.ok(ids.includes('o-sleepball'));
  assert.ok(!ids.includes('o-gym'));
  assert.ok(!ids.includes('o-sleep'));
});

test('itemsFor: daily items (days:null) appear every day of that mode', () => {
  for (let dow = 1; dow <= 5; dow++) {
    const ids = itemsFor('office', dow).map((it) => it.id);
    assert.ok(ids.includes('o-audio'), `o-audio missing on dow ${dow}`);
    assert.ok(ids.includes('o-read'), `o-read missing on dow ${dow}`);
  }
});

test('itemsFor: an off Wednesday (holiday) uses the Sunday plan', () => {
  const ids = itemsFor('off', 3).map((it) => it.id);
  assert.ok(ids.includes('f-recov'), 'Sunday recovery item expected');
  assert.ok(ids.includes('f-preview'), 'Sunday week preview expected');
  assert.ok(!ids.includes('f-box'), 'Saturday boxing must not appear');
});

test('ensureDay creates a record with the auto day type', () => {
  const rec = ensureDay('2026-07-08', 3);
  assert.equal(rec.type, 'office');
  assert.deepEqual(rec.checks, {});
  assert.deepEqual(rec.rules, {});
  rec.type = 'wfh';
  assert.equal(ensureDay('2026-07-08', 3).type, 'wfh', 'existing record must not be overwritten');
});

test('computeStats counts applicable and done items per category', () => {
  const tue = daysAgo(1); /* Tuesday -> wfh by default */
  const rec = ensureDay(dateKey(tue), tue.getDay());
  const items = itemsFor('wfh', tue.getDay());
  rec.checks['w-gym'] = new Date(2026, 6, 7, 6, 45).toISOString();
  rec.checks['w-read'] = new Date(2026, 6, 7, 12, 50).toISOString();

  const st = computeStats(7, REF);
  assert.equal(st.tracked, 1);
  assert.equal(st.appl, items.length);
  assert.equal(st.done, 2);
  assert.equal(st.cat.TRAIN.d, 1);
  assert.equal(st.cat.READ.d, 1);
  assert.equal(st.cat.LEARN.d, 0);
  assert.equal(st.items['w-gym'].checkHours.length, 1);
  assert.equal(Math.round(st.items['w-gym'].checkHours[0] * 100) / 100, 6.75);

  const tueEntry = st.days.find((d) => d.key === dateKey(tue));
  assert.equal(tueEntry.pct, Math.round((2 / items.length) * 100));
});

test('computeStats leaves untracked days at pct null', () => {
  const st = computeStats(7, REF);
  assert.equal(st.tracked, 0);
  assert.ok(st.days.every((d) => d.pct === null));
  assert.equal(st.days.length, 7);
  assert.equal(st.days[6].isToday, true);
});

test('streakOf counts consecutive rule days and skips an unlogged today', () => {
  for (let i = 1; i <= 3; i++) {
    const d = daysAgo(i);
    ensureDay(dateKey(d), d.getDay()).rules.alcohol = true;
  }
  /* today exists but the rule is not yet tapped */
  ensureDay(dateKey(REF), REF.getDay());
  assert.equal(streakOf((r) => !!r.rules.alcohol, REF), 3);

  state.days[dateKey(REF)].rules.alcohol = true;
  assert.equal(streakOf((r) => !!r.rules.alcohol, REF), 4);
});

test('streakOf breaks on a missed day', () => {
  const d1 = daysAgo(1);
  const d3 = daysAgo(3);
  ensureDay(dateKey(d1), d1.getDay()).rules.sugar = true;
  ensureDay(dateKey(d3), d3.getDay()).rules.sugar = true;
  assert.equal(streakOf((r) => !!r.rules.sugar, REF), 1);
});

test('catDone detects a completed item of the category', () => {
  const rec = ensureDay(dateKey(REF), REF.getDay()); /* office Wednesday */
  assert.equal(catDone(rec, 3, 'TRAIN'), false);
  rec.checks['o-gym'] = true;
  assert.equal(catDone(rec, 3, 'TRAIN'), true);
  assert.equal(catDone(rec, 3, 'READ'), false);
});

test('median handles odd, even and empty inputs', () => {
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([4, 1, 2, 3]), 2.5);
  assert.equal(median([]), null);
});

test('fmtHour renders 12-hour clock', () => {
  assert.equal(fmtHour(6.75), '6:45 AM');
  assert.equal(fmtHour(0), '12:00 AM');
  assert.equal(fmtHour(12.5), '12:30 PM');
  assert.equal(fmtHour(21.75), '9:45 PM');
});

test('every item id is unique and every category is known and colored', () => {
  const seen = new Set();
  for (const mode of Object.keys(ITEMS)) {
    for (const it of ITEMS[mode]) {
      assert.ok(!seen.has(it.id), `duplicate id ${it.id}`);
      seen.add(it.id);
      assert.ok(CATS.includes(it.cat), `unknown category ${it.cat}`);
      assert.ok(CAT_COLORS[it.cat], `no color for ${it.cat}`);
    }
  }
});
