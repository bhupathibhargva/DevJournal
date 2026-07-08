/* REPORTS tab: adherence stats, streaks, 14-day strip, category and weekday bars. */

import { CATS, CAT_COLORS } from '../data.js';
import { computeStats, streakOf, catDone } from '../stats.js';

let reportRange = 7;

function statusColor(pct) {
  return pct >= 75 ? 'var(--ok)' : pct >= 50 ? 'var(--warn)' : 'var(--bad)';
}

function barRow(name, nameColor, pct, fillColor) {
  return `
    <div class="catRow">
      <div class="cname" style="color:${nameColor}">${name}</div>
      <div class="cbarBg"><div class="cbarFill" style="width:${pct}%;background:${fillColor}"></div></div>
      <div class="cpct">${pct}%</div>
    </div>`;
}

export function renderReports() {
  const st = computeStats(reportRange);
  const el = document.getElementById('reportBody');
  if (!st.tracked) {
    el.innerHTML = '<div class="empty">NO DATA YET — START ON THE TODAY TAB</div>';
    return;
  }

  const overall = st.appl ? Math.round((st.done / st.appl) * 100) : 0;
  let html = `
    <div class="statGrid">
      <div class="stat"><div class="v" style="color:${statusColor(overall)}">${overall}%</div><div class="l">ADHERENCE</div></div>
      <div class="stat"><div class="v">${st.tracked}</div><div class="l">DAYS TRACKED</div></div>
      <div class="stat"><div class="v">${st.done}/${st.appl}</div><div class="l">ITEMS DONE</div></div>
    </div>`;

  const streaks = [
    ['NO ALCOHOL', streakOf((r) => !!r.rules.alcohol)],
    ['NO SUGAR', streakOf((r) => !!r.rules.sugar)],
    ['READING', streakOf((r, dw) => catDone(r, dw, 'READ'))],
    ['TRAINING', streakOf((r, dw) => catDone(r, dw, 'TRAIN'))]
  ];
  html += '<div class="label a">STREAKS</div><div class="streakRow">'
    + streaks.map(([l, v]) => `<div class="streak"><div class="v">${v}</div><div class="l">${l}</div></div>`).join('')
    + '</div>';

  html += '<div class="label b">LAST 14 DAYS</div><div class="grid14">';
  const dayInitials = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  for (const day of computeStats(14).days) {
    let cls = 'untracked';
    let txt = '·';
    if (day.pct !== null) {
      txt = String(day.pct);
      cls = day.pct >= 75 ? 'ok' : day.pct >= 50 ? 'warn' : 'bad';
    }
    html += `<div class="cell ${cls}"><div class="d">${dayInitials[day.dow]}</div><div class="p">${txt}</div></div>`;
  }
  html += '</div><div class="ptext">GREEN &ge;75 &middot; AMBER &ge;50 &middot; RED &lt;50 &middot; GRAY UNTRACKED</div>';

  html += '<div class="label g">BY CATEGORY</div>';
  for (const c of CATS) {
    const cd = st.cat[c];
    if (!cd.a) continue;
    html += barRow(c, 'var(--txt)', Math.round((cd.d / cd.a) * 100), CAT_COLORS[c]);
  }

  html += '<div class="label p">BY DAY OF WEEK</div>';
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  for (let i = 1; i <= 7; i++) {
    const idx = i % 7; /* start the week on Monday */
    const bd = st.byDow[idx];
    if (!bd.a) continue;
    const pct = Math.round((bd.d / bd.a) * 100);
    html += barRow(dayNames[idx], 'var(--txt)', pct, statusColor(pct));
  }

  el.innerHTML = html;
}

export function bindReports() {
  const buttons = document.querySelectorAll('.rbtn');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      reportRange = Number(btn.dataset.range);
      buttons.forEach((b) => b.classList.toggle('sel', b === btn));
      renderReports();
    });
  });
}
