/* SCHEDULE tab: read-only reference blocks + mode sub-tabs. */

import { SCHEDULE_REF } from '../data.js';

export function renderSchedule() {
  for (const mode of Object.keys(SCHEDULE_REF)) {
    document.getElementById('sview-' + mode).innerHTML = SCHEDULE_REF[mode]
      .map(([time, title, note]) => `
        <div class="sblock">
          <div class="time">${time}</div>
          <div class="b"><div class="ti">${title}</div><div class="no">${note}</div></div>
        </div>`)
      .join('');
  }
}

export function bindSchedule() {
  const tabs = document.querySelectorAll('.stab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.toggle('sel', t === tab));
      document.querySelectorAll('.sview').forEach((v) => {
        v.classList.toggle('active', v.id === 'sview-' + tab.dataset.sview);
      });
    });
  });
}
