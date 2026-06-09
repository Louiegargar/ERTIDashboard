# ERTI Debug Nerve Center — Operations Dashboard

Multi-file, no-build React app implementing the *Operations Dashboard Revision &
Enhancement Framework v1.0*. Vanilla React + Babel-standalone (no bundler), Chart.js,
SheetJS, Supabase JS — all via CDN. Plus a dependency-free **Python engine twin**.
Currency: Philippine Peso (₱).

## Run it
- **Quick look:** open `ERTI_Nerve_Center_preview.html` (everything inlined; needs internet for the CDN libs on first load).
- **Real app:** serve the folder over HTTP and open `ERTI Nerve Center.html`
  (`python3 -m http.server` in this directory, then visit the file). Opening the
  multi-file version via `file://` fails because browsers block fetching the
  `assets/*.jsx` modules — use a static server or the inlined preview.
- **Batch / CI:** `python3 engine.py` (portfolio summary), `--period 2025-08`,
  `--weekly --period WW2542`, `--json out.json`, `--csv out.csv`.

## File map
```
ERTI Nerve Center.html      entry; loads CDN libs + assets in order
engine.py                   standalone KPI engine (mirrors assets/engine.js)
MIGRATION.sql               Appendix A — new/changed Supabase tables
assets/
  app.css                   design system (Appendix D tokens, teal #00d4aa)
  ww.js                     workweek engine (FY = 1st Monday of Nov, WWyyww)
  store.js                  in-memory DB + localStorage + Supabase debounced auto-push (§7.2)
  engine.js                 KPI layer: period engine, actuals, plan, gaps, WIP, manning, competency (§9)
  seed.js                   real ERTI data seeded on first run
  ui.jsx                    formatters, icons, useStore hook, KpiCard/Panel/Modal/Seg/Tile/Toast
  charts.jsx               Chart.js wrappers (Combo/Gap/Line/Aging/Manning/Radar), guarded
  kpi-modal.jsx            reusable KPI drill-down + KPI_MODAL config (§8.2)
  tab-executive.jsx        Executive Pulse — 9 clickable KPIs + anchor trends + team rollup (§8.1)
  tab-revenue.jsx          price book + team budgets + output targets entry (§8.3)
  tab-output.jsx           record-level output entry, filters, add/edit modal (§8.4)
  tab-wip.jsx              WIP inventory, aging, Complete→Output loop (§8.5)
  tab-manpower.jsx         manning capacity + editable shift calendar (§8.6)
  tab-skills.jsx           platform experience ratings + competency radar (§8.7)
  tab-people.jsx           roster CRUD, Appendix B applied (§8.8)
  tab-import.jsx           SheetJS import + entity mapping + log (§8.9)
  tab-settings.jsx         Supabase connect, migration SQL, sync + §10 params (§8.10)
  app.jsx                  shell: sidebar nav, routing, init, mount
```

## Data model
New tables `output_records`, `wip_inventory`, `output_targets` (Appendix A). One row per
board; revenue and all plan-vs-actual gaps are **derived through the price book**, never
re-entered. Offline-first: the app runs from `localStorage` (`erti_nerve_v1`) with no
connection; connecting in Settings pulls all tables and turns on debounced auto-push.

## What is real vs placeholder
**Real (from your sheets):** roster (Appendix B + Mariel Perea), 46 output records
(Sheet 5 subset, owner→engineer via alias map), 6 WIP items (real PEA/PM boards),
103 schedule entries (the 14-day window), platform ratings derived as an *experience
index* from real output volume.

**Placeholder — replace before relying on revenue/plan KPIs:**
- **Price book** (`seed.js` / Revenue tab) — flagged `placeholder`; editing clears the flag.
- **Output targets** — sample budget/projected for 4 months only.
- **Team budgets & manning targets** — placeholder figures.

## Appendix E decisions (defaults used; change in seed/Settings)
- **E1 TX Category** — treated as tester/platform family (ETS, LTX, FLEX, CTS, NI, AERO, EAGLE).
- **E2 Target granularity** — org-wide `'ALL'`; per-team supported by the schema/engine.
- **E3 Projection** — `run_rate`; others selectable in Settings.
- **E4 Gargar (2400036) team** — seeded **F2-LTX** per the new sheet; confirm vs E[]'s F2-ETS/LTX.
- **E5 qty** — allowed, default 1.
- **E6 Monthly** — calendar month of the WW Monday.
- **E7 Aging** — 0–3 / 4–7 / 8–14 / 15+ days, flag at 8.
- **E8 WIP completion** — auto-creates one `output_record` with a no-double-count guard.

## Open items to confirm
- **Mariel Perea (1702788)** appears in the output data but is **not in Appendix B**.
  Seeded as F2-LTX so attribution works — confirm her record and team.
- **Juno → Junolito Lomeda (2200007)** and **Aeron → Aaron Gloriani (2500060)** are
  inferred owner-alias joins; both are ETS-rostered but appear on LTX/perfboard work.
- Replace all placeholder prices/targets/budgets/manning with real figures.

## Session 2 — bug fixes & new features
**Fixes**
- **Migration SQL** is now self-contained: it creates the retained tables
  (`engineers`, `price_settings`, `team_budgets`, `manning_targets`,
  `platform_ratings`, `schedule_entries`, `app_settings`) *before* the new ones,
  so the FK to `engineers(id)` resolves on a fresh project. Use `MIGRATION.sql`
  (also copyable from Settings).
- **Import** now shows a **column-mapping** step with auto-guessed matches and
  reports committed / duplicate-skipped / invalid counts via toast + log. The
  earlier silent no-op was a header-name mismatch (e.g. `Hardware ID` vs
  `hardware_id`) — mapping fixes that.

**New**
- `assets/supabase-config.js` — bake your project `url` + anon `key`; when set,
  the app auto-connects and **pulls all tables on every load** (empty cloud tables
  never overwrite the local seed).
- **Loading banner** — an instant boot splash (in `index.html`) plus an in-app
  `Banner` shown during fetch/flush; both fade out when work completes.
- **WIP → Snap** — the *Snap WIP* button captures current WIP numbers (total,
  aged, by status/tester/hardware/team) for the current workweek into
  `wip_snapshots` (upsert by `period_key`) and pushes to Supabase.
- **WIP Trend per workweek** — interactive; bars = active WIP, line = aged. Uses
  the snapped number for any week that has a snapshot, otherwise computes WIP
  active during that week from `debug_start`/`debug_end`. Click a week to inspect
  its items (and snapshot breakdown if present). *Becomes more meaningful as boards
  close and weekly snaps accumulate; with the current seed (old still-open boards)
  it reads flat.*
- **Aging Distribution** — full-size and clickable; click a bucket bar to list the
  items in it.
- **WIP donut** — switch the grouping between Focus Factory (team), Status, Tester
  (TX category), and Hardware Type; click a slice (or legend row) to list its items.
- New table `wip_snapshots` added to `MIGRATION.sql` and the sync set.

## Session 3 — offline / self-hosted + fixes
- **No more "Tracking Prevention blocked access to storage"** — all libraries
  (React, ReactDOM, Chart.js, SheetJS, Supabase, Babel) are self-hosted under
  `assets/vendor/` and loaded same-origin; the Google Fonts link was removed
  (CSS falls back to Segoe UI / system fonts). Nothing is fetched cross-site.
- The single-file **preview is precompiled** (JSX → JS at package time) so it ships
  with no in-browser Babel and shows no "precompile for production" warning. The
  multi-file app keeps Babel-standalone locally to preserve the no-build edit flow
  (that advisory warning is harmless; ignore it).
- **Larger loading banner**, text no longer overlaps.
- **Executive Pulse charts clamp to the current work week** — period options and all
  trend series (Output/Revenue Actual·Projected·Budget, Budget-vs-Actual,
  Projected-vs-Actual) stop at the current period, so no empty future weeks render.

## Session 4 — Babel removed from runtime + Revenue/Import features
**The Tracking-Prevention / Babel errors are gone for good**
- The app now loads a **precompiled bundle** (`assets/app.bundle.js`) — there is no
  in-browser Babel and no `text/babel` scripts, so the "in-browser Babel transformer"
  warning is gone. Combined with the self-hosted libs, the page makes **zero
  third-party requests**.
- The canonical entry is now **`index.html`** (most static hosts serve this by
  default). `ERTI Nerve Center.html` is an identical copy. **Replace your deployed
  file with this `index.html` and hard-refresh** — the errors you still saw were a
  stale entry pointing at `unpkg`.
- The `.jsx` files remain the editable source. After editing, regenerate the bundle:
  **`node build.js`** (uses the vendored Babel; no global install needed).

**Revenue & Targets**
- **Price Book** is fully editable: rename a hardware type (cascades to existing
  output/WIP/target records), edit its price, and add or remove types.
- **Team Budgets** are now **per month** — pick the planning month at the top; budget
  and forecast are stored per team per month (`team_budgets` PK is now
  `(team, period_key)` — re-run `MIGRATION.sql`).
- **Output Targets** are entered for the **same selected month** (Budget / Projected
  toggle, live ₱, run-rate fill).

**Import Data**
- New **Overwrite existing** toggle: off = duplicate IDs are skipped (default);
  on = duplicates update the existing record. The result line reports
  added / updated / skipped / invalid counts.
