/* End-to-end UI/functional test for the tracker.
   Usage: node tests/e2e.mjs [--shots <dir>]
   Requires playwright-core on NODE_PATH and a Chromium binary at
   PW_CHROMIUM (default /opt/pw-browsers/chromium). Serves the app dir
   itself on localhost, so run from anywhere. */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const APP_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8341;
const EXEC = process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium';
const shotsIdx = process.argv.indexOf('--shots');
const SHOTS = shotsIdx > -1 ? process.argv[shotsIdx + 1] : null;

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json' };

const server = createServer(async (req, res) => {
  const path = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  try {
    const body = await readFile(join(APP_DIR, path));
    res.writeHead(200, { 'Content-Type': MIME[extname(path)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});
await new Promise((ok) => server.listen(PORT, ok));

const browser = await chromium.launch({ executablePath: EXEC });
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') pageErrors.push(m.text()); });

let passed = 0;
async function check(name, fn) {
  try {
    await fn();
    passed++;
    console.log('  ok  ' + name);
  } catch (e) {
    console.error(' FAIL ' + name + '\n      ' + (e.message || e));
    process.exitCode = 1;
  }
}
async function shot(name) {
  if (SHOTS) await page.screenshot({ path: join(SHOTS, name + '.png'), fullPage: false });
}

await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });

await check('page loads with title and sync mode', async () => {
  assert.match(await page.title(), /Life Tracker v5/);
  await page.waitForFunction(() => document.getElementById('syncstate').textContent.includes('THIS DEVICE'));
});

await check('checklist renders scheduled items', async () => {
  assert.ok((await page.locator('#checklist .item').count()) > 3, 'expected several items');
});

await check('tapping an item marks it done and updates progress', async () => {
  const first = page.locator('#checklist .item').first();
  const id = await first.getAttribute('data-id');
  await first.click();
  await page.waitForSelector(`#checklist .item[data-id="${id}"].done`);
  assert.match(await page.locator('#ptext').textContent(), /1 \/ \d+ DONE/);
});

await check('done state persists across reload (localStorage)', async () => {
  await page.waitForTimeout(600); /* let the debounced save land */
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('#checklist .item.done').count(), 1);
});

await check('tapping again un-checks the item', async () => {
  await page.locator('#checklist .item.done').first().click();
  assert.equal(await page.locator('#checklist .item.done').count(), 0);
  await page.locator('#checklist .item').first().click(); /* leave one checked for later tabs */
});

await check('rule chips toggle', async () => {
  await page.click('#rule-alcohol');
  await page.waitForSelector('#rule-alcohol.done');
  assert.match(await page.locator('#ptext').textContent(), /NO-ALC/);
});

await check('day type switch re-renders the checklist', async () => {
  const before = await page.locator('#checklist .item').count();
  await page.click('.typeBtn[data-type="off"]');
  await page.waitForSelector('.typeBtn[data-type="off"].sel');
  const after = await page.locator('#checklist .item').count();
  assert.notEqual(before, after, 'off-day plan should differ from default plan');
  await page.click('.typeBtn[data-type="wfh"]');
});
await shot('1-today');

await check('schedule tab shows reference blocks and sub-tabs work', async () => {
  await page.click('.mtab[data-page="schedule"]');
  await page.waitForSelector('#page-schedule.active');
  assert.ok((await page.locator('#sview-office .sblock').count()) > 10);
  await page.click('.stab[data-sview="off"]');
  await page.waitForSelector('#sview-off.active');
  assert.ok((await page.locator('#sview-off .sblock').count()) > 5);
});
await shot('2-schedule');

await check('reports tab renders stats, streaks, heatmap and bars', async () => {
  await page.click('.mtab[data-page="reports"]');
  await page.waitForSelector('#page-reports.active');
  assert.equal(await page.locator('.statGrid .stat').count(), 3);
  assert.equal(await page.locator('.streakRow .streak').count(), 4);
  assert.equal(await page.locator('.grid14 .cell').count(), 14);
  assert.ok((await page.locator('.catRow').count()) >= 2);
  await page.click('.rbtn[data-range="30"]');
  await page.waitForSelector('.rbtn[data-range="30"].sel');
  assert.equal(await page.locator('.statGrid .stat').count(), 3);
});
await shot('3-reports');

await check('coach tab renders insights and dismiss works', async () => {
  await page.click('.mtab[data-page="coach"]');
  await page.waitForSelector('#page-coach.active');
  const n = await page.locator('#coachBody .insight').count();
  assert.ok(n >= 1, 'expected at least one insight');
  await page.locator('#coachBody .dismiss').first().click();
  const after = await page.locator('#coachBody .insight').count();
  assert.ok(after < n || (await page.locator('#restoreAll').count()) === 1);
});
await shot('4-coach');

await check('no JavaScript errors surfaced during the run', async () => {
  assert.deepEqual(pageErrors, []);
});

await browser.close();
server.close();
console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`);
