/* Entry point: wires tabs, clock, and the four page components together. */

import { session, loadState } from './store.js';
import { dateKey } from './utils.js';
import { renderToday, bindToday } from './components/today.js';
import { renderSchedule, bindSchedule } from './components/schedule.js';
import { renderReports, bindReports } from './components/reports.js';
import { renderCoach, bindCoach } from './components/coach.js';

const CLOCK_TICK_MS = 30000;

function tick() {
  const now = new Date();
  document.getElementById('clock').textContent =
    now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase() +
    ' · ' +
    now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const key = dateKey(now);
  if (key !== session.todayKey) {
    session.todayKey = key;
    session.todayDow = now.getDay();
    renderToday();
  }
}

function bindMainTabs() {
  const tabs = document.querySelectorAll('.mtab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const page = tab.dataset.page;
      tabs.forEach((t) => t.classList.toggle('active', t === tab));
      document.querySelectorAll('.page').forEach((p) => {
        p.classList.toggle('active', p.id === 'page-' + page);
      });
      if (page === 'reports') renderReports();
      if (page === 'coach') renderCoach();
    });
  });
}

function init() {
  const now = new Date();
  session.todayKey = dateKey(now);
  session.todayDow = now.getDay();

  renderSchedule();
  bindMainTabs();
  bindToday();
  bindSchedule();
  bindReports();
  bindCoach();

  loadState(() => {
    document.getElementById('syncstate').textContent = 'SYNC: ' + session.syncMode;
    renderToday();
    tick();
  });

  setInterval(tick, CLOCK_TICK_MS);
}

document.addEventListener('DOMContentLoaded', init);
