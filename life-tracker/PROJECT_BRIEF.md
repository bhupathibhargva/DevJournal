# BHARGAV.OS Life Tracker v5 — Project Brief

A portable, LLM-agnostic description of what this project is, why it exists, how it is built, and how to extend it. Paste this whole file into any LLM (Claude, GPT, Gemini, Llama, etc.) as context before asking it to modify, rebuild, or port the app.

---

## 1. Purpose

A **personal daily-execution system** for one person: an engineering manager (age ~34) who wants to change his health, learning, and family-presence habits by making a fixed weekly routine **trackable in one tap** and **measurable over time**.

It is deliberately *not* a generic to-do app. The routine is pre-designed (the schedule is the product); the app's job is to answer three questions:

1. **Right now:** what should I be doing, and did I do it?
2. **This week:** where am I leaking adherence?
3. **Over time:** which habits are installed, which are failing, and what single change would help most?

### Personal goals the system serves
| Goal | Target |
|---|---|
| Sleep | 5.5 h → 7 h+ per night |
| Weight | 195 lb → 175 lb |
| Whoop biological age | 41 → 34 |
| Learning | ~11.5 hrs/week (AI, investing, business) |
| Communication | Toastmasters / Spoken Craft skill growth |
| Family | Protected presence time with his young son (Vikranth) |
| Rules | No alcohol, no sugar (tapped at day end) |
| Investing | $5k deploy sessions, weekly study |

### Design philosophy (the "why" behind decisions)
- **Tap-it-done:** logging must take one tap, one-handed, on a phone.
- **The data doesn't lie:** adherence is computed from taps, never self-reported narrative.
- **One focus at a time:** the app surfaces the single weakest category rather than a dashboard of everything.
- **Learn + adapt:** a rule-based coach finds patterns (e.g. "after Monday basketball, Tuesday gym drops to 33%") and proposes exactly one change.
- **No backend, no account:** all data lives on the device; the only network call is the optional AI report.

---

## 2. The weekly routine (the domain model)

Three **day types**, chosen per day (auto-defaulted, user-overridable):

| Day type | Default days | Character |
|---|---|---|
| `office` | Mon, Wed | Commute-based. Audio learning on the commute in; family on the commute home. |
| `wfh` | Tue, Thu, Fri | No commute; steps walk replaces it; laptop closes at 5 PM. |
| `off` | Sat, Sun | Family-first; protected AI build Saturday; week preview Sunday. |

An `off` weekday (holiday/PTO) follows the **Sunday template** (`effDow` maps Mon–Fri → 0).

### Weekly rhythm (day-of-week: 0=Sun … 6=Sat)
| Day | Mode | Morning | Evening |
|---|---|---|---|
| Mon | office | 30-min home strength (light) | Basketball 8–11 PM, sleep 11:30 |
| Tue | wfh | Gym 6:30–7:30 (auto-regulate by Whoop) | Spoken Craft drills + AI build hour |
| Wed | office | Gym (lower + core) | $5k deploy + investing study hour |
| Thu | wfh (or office alt weeks) | Gym (upper) | Toastmasters + AI build hour |
| Fri | wfh | Mobility + 7 AM deep-learning hour | Basketball 8–11 PM |
| Sat | off | Boxing + cable circuit; 2 h protected AI build; investing review | Family play, early night |
| Sun | off | Mobility + long family walk | 15-min week preview, sleep 10 PM |

### Daily constants
- **Reading:** 20 min/day, calendar-blocked at 12:40 PM.
- **Email:** exactly 2 batches (12:00 and 4:00); Teams checked max 3×.
- **Sleep keystone:** screens off 9:45 PM, lights out 10:00 PM (11:30 PM after basketball).
- **Learning ledger:** commute audio ~3.0 h + lunch reading ~2.0 h + AI builds 2.0 h + Wed study 1.0 h + Fri deep hour 1.0 h + Saturday 2.75 h + Sunday 0.5 h ≈ **11.5 h/week**.

### Item schema
Every trackable block is a plain object:

```js
{
  id:   'o-gym',          // unique; prefix o-/w-/f- = office/wfh/off
  cat:  'TRAIN',          // TRAIN | LEARN | READ | FAMILY | WORK | SLEEP
  days: [3, 4],           // dow list it applies to, or null = every day of that mode
  time: '6:30-7:30',      // display string
  ti:   'Gym - 1 hr strength',
  no:   'Wed: lower + core. Thu: upper push/pull.',
  s:    '06:15', e: '07:30'   // 24h window for the "NOW" highlight; null = all day
}
```

Items live in `ITEMS = { office: [...], wfh: [...], off: [...] }`. An item "applies" on a given day iff `days` is null or contains the effective day-of-week. Items from the chosen mode that do *not* apply today are shown as dimmed **"rest of plan / bonus"** and count as bonus when tapped (they never lower adherence).

### Persisted data model
```js
state = {
  days: {
    '2026-07-08': {
      type: 'office',                          // office | wfh | off
      checks: { 'o-gym': '2026-07-08T06:41:00.000Z' },  // id → ISO timestamp of the tap
      rules:  { alcohol: true, sugar: false }
    }
  },
  dismissed: { 'sug-o-gym': true }             // coach insights the user hid
}
```
Storage key `bos_tracker_v5`; migrates from `bos_tracker_v4`. Backends tried in order: Claude artifact storage → `localStorage` → in-memory. The Gemini key is stored separately (`bos_gemini_key`) and is **never** exported.

---

## 3. Features

**TODAY** — day-type selector, progress bar (done/total, % and bonus count), NO ALCOHOL / NO SUGAR chips, checklist with a pulsing `● NOW` marker on the current time window, a "this week's focus" banner (worst category over 14 days, shown only if < 70% with ≥ 5 samples), Reset Today, Export JSON.

**SCHEDULE** — read-only reference: full hour-by-hour plan per day type, the training-week table, and the learning ledger.

**REPORTS** — 7/30-day range; adherence %, days tracked, items done; four streaks (no alcohol, no sugar, reading, training); last-14-days strip colored green ≥ 75 / amber ≥ 50 / red < 50 / gray untracked; adherence by category; adherence by weekday (Mon-first).

**COACH** — deterministic insights over the last 28 days, each dismissible:
- *Struggling* (item < 40% with ≥ 4 samples) → category-specific fix.
- *Locked in* (≥ 85%) → progression suggestion.
- *Worst weekday* (< 55% with ≥ 8 samples).
- *Ball-night recovery:* Monday basketball → Tuesday gym completion rate.
- *Sleep effect:* next-day adherence after hitting screens-off vs. not (shown only if gap ≥ 10 points with ≥ 3 samples each).
- *Time drift:* an item whose median tap time is > 3 h from its scheduled start.
- Plus an **AI report**: sends a compact JSON summary (adherence, per-category, per-item, by-weekday, streaks) to an LLM and asks for a verdict, what's working, what's not + root cause, and **exactly one** next-week change (< 250 words, plain text, blunt tone).

**PWA** — installable on iPhone/Android, offline, standalone display.

---

## 4. Architecture

Zero build step. Static files, native ES modules, no framework, no dependencies at runtime.

```
life-tracker/
├── index.html                 # shell: header, 4 page containers, PWA/iOS meta
├── manifest.webmanifest       # standalone PWA manifest
├── sw.js                      # service worker: precache shell + stale-while-revalidate
├── css/styles.css             # liquid-glass theme (design tokens in :root)
├── icons/                     # 192, 512, 180 apple-touch
├── js/
│   ├── app.js                 # entry: tabs, clock tick, init order, SW registration
│   ├── data.js                # ITEMS, CATS, CAT_COLORS, SCHEDULE_REF (pure data)
│   ├── utils.js               # pad, dateKey, autoType, effDow, itemsFor, median, fmtHour (pure)
│   ├── store.js               # state, session, loadState/saveState (debounced 350ms), ensureDay
│   ├── stats.js               # computeStats, streakOf, catDone (date-injectable)
│   └── components/
│       ├── today.js           # renderToday + bindToday (event delegation)
│       ├── schedule.js
│       ├── reports.js
│       └── coach.js           # suggestion builders + AI provider routing
└── tests/
    ├── unit.test.mjs          # node:test, 16 tests, pure logic
    └── e2e.mjs                # Playwright-core + Chromium, 14 checks
```

**Layering rule:** `data` → `utils` → `store` → `stats` → `components` → `app`. Pure logic never touches the DOM; components own all DOM work; only `store` touches storage.

**Component contract:** each tab exports `renderX()` (idempotent, rebuilds its innerHTML from state) and `bindX()` (attaches listeners once, using event delegation so re-rendering is safe).

**Determinism for testing:** `computeStats(rangeDays, ref = new Date())` and `streakOf(fn, ref)` accept an injectable reference date.

**Streak rule:** counts consecutive days ending today or yesterday; an *unlogged today* is skipped rather than breaking the streak.

### AI provider routing
```
if localStorage['bos_gemini_key'] exists → POST Gemini generateContent
    https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
    header: x-goog-api-key: <key>
    body:   { contents: [{ parts: [{ text: prompt }] }] }
    read:   candidates[0].content.parts[].text
else → keyless Anthropic call (works only when hosted inside Claude's artifact runtime)
else → message telling the user to paste a Gemini key
```
To add another provider (OpenAI, Anthropic with key, Ollama, etc.), add a `callX(key, prompt)` returning a Promise<string> beside `callGemini` and extend the routing + the AI SETTINGS UI. Note: calling a provider's API directly from a static site exposes the user's own key to their own browser only — acceptable for single-user, but never ship a shared key in the repo.

---

## 5. Visual design: "Apple liquid glass"

- **Surface:** deep navy `#0a0d1a` base, two blurred radial "orbs" (blue/indigo top-left, purple/green bottom-right) fixed behind everything.
- **Glass recipe:** `background: rgba(255,255,255,0.055)`, `backdrop-filter: blur(22px) saturate(160%)`, 1px `rgba(255,255,255,0.07)` border, `inset 0 1px 0 rgba(255,255,255,0.12)` top highlight, radii 12/16/22 px.
- **Motion:** spring curve `cubic-bezier(0.32,0.72,0,1)`; page fade-up 350 ms; `:active` scale 0.97–0.985; honors `prefers-reduced-motion`.
- **Type:** system stack (`-apple-system, SF Pro, Segoe UI, Roboto`), tabular numerals for times/percentages, tracked uppercase micro-labels.
- **Navigation:** glass segmented control (pill within a rounded track).
- **Category colors** (bars/rails — validated for the dark surface: OKLCH L 0.48–0.67, chroma ≥ 0.1, adjacent-pair CVD ΔE ≥ 12, contrast ≥ 3:1):
  `TRAIN #16a34a · LEARN #3b82f6 · READ #d97706 · FAMILY #a855f7 · WORK #ea580c · SLEEP #6366f1`.
  Lighter tints are used for *small text accents* (chips, labels). Status colors (adherence): ok `#32d74b`, warn `#ffd60a`, bad `#ff6961`.
- **Accessibility:** checklist items are `role="checkbox"` with `aria-checked`, keyboard-operable (Enter/Space); status is never color-only (numbers shown on heatmap cells).
- **iOS:** `viewport-fit=cover`, `env(safe-area-inset-*)` padding, `apple-mobile-web-app-*` meta, `black-translucent` status bar.

---

## 6. Testing & quality gates

| Layer | Tool | Command | Scope |
|---|---|---|---|
| Unit | `node:test` | `node --test tests/unit.test.mjs` | date keys, auto day type, holiday→Sunday mapping, `itemsFor`, stats counting, streak skip/break, median, hour formatting, item-id uniqueness + category/color coverage |
| E2E | Playwright-core + Chromium | `node tests/e2e.mjs [--shots dir]` (needs `playwright-core` resolvable and a Chromium binary at `PW_CHROMIUM`) | load, toggle + progress, persistence across reload, un-check, rule chips, day-type switch, schedule sub-tabs, reports structure, coach dismiss, manifest + service worker, Gemini key save/clear, **stubbed Gemini request** (asserts header + rendered text), zero console errors |

Rules for anyone changing the code: keep pure logic in `utils/stats` and cover it with a unit test; keep `e2e.mjs` green; the E2E fails on **any** console error (including a 404), so add every new asset.

---

## 7. Deployment

- Hosted on **GitHub Pages** from the `master` branch (Jekyll site; the app is a subfolder, so ES modules and relative URLs must stay relative — no leading slashes).
- URL: `https://bhupathibhargva.github.io/DevJournal/life-tracker/`
- Publish flow: develop on a feature branch → run both test suites → merge to `master` → Pages builds in under a minute.
- **Service worker cache:** bump `CACHE` in `sw.js` whenever the shell file list or filenames change; add new files to `SHELL`.
- **iPhone install:** open in **Safari** → Share → *Add to Home Screen* → Add. Data is per-device (localStorage), so always log from the installed app; use *Export Data* for backup.

---

## 8. Known limitations

- Data does not sync across devices (no backend). Export JSON is the only backup.
- Safari can evict localStorage for sites unused ~7 days *in the browser*; the installed home-screen app is exempt — another reason to always use the installed app.
- The Gemini key sits in plain localStorage (single-user threat model).
- Time-drift insight only works for items tapped in real time.
- `SCHEDULE_REF` and the training/learning tables are maintained by hand and can drift from `ITEMS`.

---

## 9. Backlog (UI ideas, ranked)

1. Bottom glass tab bar (thumb reach) — biggest remaining "native app" win.
2. "Up Next" hero card with countdown and tap-to-complete.
3. Confirm/undo for *Reset Today* (currently destructive with no confirmation).
4. Group checklist by Morning / Day / Evening; dim past-due items.
5. Activity-ring progress in the header.
6. "Day closed" celebration at 100%.
7. Condensing large-title header on scroll.
8. ≥ 44 pt touch targets (dismiss ✕, type buttons); 10 px minimum text; `rem` units.
9. Swipe between tabs.
10. Weekday-column 14-day grid; tap a day for a detail sheet; 7-day sparkline.
11. Collapse "rest of plan" extras behind a disclosure.
12. Optional sync (iCloud/Drive file, or a tiny backend) and a Gemini/other-provider picker.

---

## 10. Starter prompt for another LLM

Paste everything above, then append one of these:

**Extend the existing app**
> You are a senior front-end engineer. Using the brief above, implement backlog item(s) `<N>` in the existing vanilla-ES-module codebase. Constraints: no frameworks or build step, keep the layering (`data → utils → store → stats → components → app`), keep logic pure and unit-tested, keep the liquid-glass tokens, keep the Playwright suite green (zero console errors), bump the service-worker cache version, and keep all URLs relative so it works under a GitHub Pages subpath. Return full replacement files for anything you change, plus the new tests.

**Rebuild from scratch (different stack)**
> Rebuild this app in `<SwiftUI | React Native | Flutter | Next.js>` using the brief above as the product spec. Preserve the item schema, day-type/`effDow` rules, adherence math (bonus items never reduce adherence), streak rule (unlogged today is skipped), coach heuristics and thresholds, and the data model. Propose a storage layer and a migration path from the JSON export.

**Make a different person's version**
> Keep the architecture and coach logic. Replace `ITEMS`, `SCHEDULE_REF`, the goals table, and the AI prompt's persona with the following routine: `<describe routine>`. List every file you changed and every assumption you made.

**Swap the AI provider**
> Add `callOpenAI(key, prompt)` (or `<provider>`) beside `callGemini` in `js/components/coach.js`, add a provider dropdown to AI SETTINGS, store the choice in localStorage, and extend the E2E test with a stubbed request asserting the auth header and rendered text.
