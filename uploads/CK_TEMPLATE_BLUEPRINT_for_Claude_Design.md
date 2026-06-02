# Pricing-Intelligence Dashboard — Reusable Template Blueprint
### A build spec for Claude Design (or any frontend agent) to recreate this project's architecture

This document is a self-contained blueprint. It describes the proven architecture, data model,
persistence logic, data-update flows, pop-up chart system, and UI system of the CK Pricing
Dashboard so you can generate a *new* template with the same bones for a different catalog/domain.
It is written to be adapted — swap "SKU / cable / MSRP" for your own entities.

---

## 1. Architecture & tech constraints (non-negotiable)

- **Single-page app, no build step.** Plain `.jsx` files transformed in the browser by
  **Babel Standalone**. No bundler, no npm install to run. Deploys as static files to
  Cloudflare Workers / GitHub Pages / static hosting.
- **React via global UMD** (`React`, `ReactDOM` from CDN). Hooks are destructured once
  (`const { useState, useEffect, useRef, useMemo, useCallback } = React;`) and re-exported onto
  `window` so every file can use them without imports.
- **Vendored CDNs:** React, ReactDOM, Babel Standalone, **SheetJS (`XLSX`)** for spreadsheet
  import/export, a charting lib is *not* required (charts are hand-drawn SVG — see §6).
- **One global state owner** (`App`) passes data + action callbacks down as props. No Redux.
- **Module load order matters** (set in `index.html` with cache-buster query strings, e.g.
  `?v=3.17`, bumped every release so browsers refetch):
  1. vendor (react, react-dom, babel, xlsx)
  2. `data.js(x)` — the dataset + the compute engine (`window.CK`, `window.__skus`)
  3. domain helpers (e.g. a master-key map; an import module like `salsify-import.js`)
  4. `db.jsx` — persistence layer (`window.CKdb`)
  5. `ui.jsx` — shared components, design tokens consumers, modals (`window.<Component>`)
  6. tab files (`tab-*.jsx`)
  7. `app.jsx` — the `App` root, mounts with `ReactDOM.createRoot`.

**Why this matters for a template:** keep everything inlineable and framework-light. JSX via
Babel Standalone is fine but must be inlined; never introduce a build pipeline.

---

## 2. Data model

A **catalog of base items**, each aggregating **variants**. Generalize as:

```
item = {
  id,                 // "ipn_base" — stable base key
  family,             // grouping label (used for per-family rollups & charts)
  cost_basis,         // unit cost (drives margin floor)
  current_price,      // "current_msrp" — live price (source of truth from import)
  variants: [         // "color_variants"
    { variant_id,     // "ipn" — unique per variant; the import/lookup key
      label,          // e.g. color name
      qty }           // per-variant on-hand
  ],
  // derived/enriched (computed, never hand-stored):
  qty,                // == Σ(variant.qty)  ← INVARIANT, must always hold
  inventory_value,    // qty * cost_basis
  velocity_tier, days_on_hand, inventory_health, excess_priority, catalog_health, ...
}
```

**Invariants to encode and test:** `item.qty === Σ(variant.qty)`; `inventory_value === qty *
cost_basis`; derived fields are recomputed by one shared function (see §5/§6) and never set
ad-hoc in two places.

A separate **master map** (`{ variant_id → [external_id, …attributes] }`) lets you resolve a
variant to an external system ID (e.g. `salsify_unique_id`) for search and imports.

---

## 3. Persistence layer (`window.CKdb`) — the most important part to copy correctly

### 3.1 Backend
Supabase (Postgres + PostgREST + anon key). All access via a thin `supa(method, table, opts)`
fetch wrapper that adds the anon key + `apikey` headers and (for writes) `Prefer` headers.

### 3.2 Dual-write pattern (localStorage + cloud)
Every save writes **localStorage first** (instant, offline-friendly) **then** mirrors to
Supabase when connected. Every load reads cloud → falls back to localStorage. On boot, a
`reloadFromCloud()` pulls all tables, writes them to localStorage, then the app reads from
localStorage. This gives optimistic UI + durable cross-device sync.

### 3.3 Connection state machine
`connState ∈ { local, connecting, cloud, error }`. On boot, `init()`:
1. Resolve credentials from (a) a baked `supabase-config.js`, else (b) localStorage (entered in
   a Settings UI), else (c) a share-URL hash (`#supa=…&key=…`).
2. **Probe** with a cheap `GET …limit=1`. Success → `cloud`; else `local`.
3. If `cloud`, `reloadFromCloud()` then re-hydrate React state.

**Baked config gotcha (cross-device):** ship `config.js` with the URL set and the anon key
filled in *once*, or fresh devices default to `local` and never sync. Surface a visible
"Local — not syncing" warning when not `cloud`.

### 3.4 Tables (one per concern) + the "every mutation hits its table + audit_log" rule
| Concern | Table | Write pattern |
|---|---|---|
| Cost edits | `cost_basis_edits` (PK item id) | upsert |
| Price overrides | `msrp_overrides` (PK item id) | upsert |
| Applied-recommendation history | `applied_recommendations` | append |
| **Audit log (every state change)** | `audit_log` | append |
| Engine config (single row) | `engine_config` (CHECK id=1) | upsert |
| Competitor price history | `comp_price_history` | append |
| KPI snapshots (powers charts) | `kpi_snapshots` | append, rate-limited |
| Bulk inventory snapshot | `inventory_updates` (PK variant id) | full-replace on import; upsert on single edit |

Principle: **a price/cost/data mutation writes its domain table *and* an `audit_log` row.**
Audit it even when the domain write is a no-op, so the trail is complete.

### 3.5 RLS — the silent-failure trap (document loudly)
Enable Row Level Security on every table **and** create an anon policy per table. If RLS is on
but the policy is missing, the anon key still *connects* (a `SELECT` returns an empty list, which
looks like success) but **every write is silently rejected and every read returns nothing** —
data appears to save (local cache) yet never persists or syncs. Symptom: "works on my machine,
gone on another PC."

Write the policy SQL **non-destructively and idempotently** so it can be re-run to repair, and
so Supabase's SQL editor doesn't flag it as "destructive":
```sql
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public'
                 AND tablename='my_table' AND policyname='anon all') THEN
    CREATE POLICY "anon all" ON my_table FOR ALL TO anon USING (true) WITH CHECK (true);
  END IF;
END $$;
```
Avoid `DROP POLICY` (triggers the destructive-operation prompt) and avoid `FOREACH … IN ARRAY`
loops (errored in the Supabase editor). Use explicit per-table `IF NOT EXISTS` blocks.

### 3.6 Shape normalization on load
DB columns (`override_msrp`, `set_by`, `set_at`) differ from the in-app shape (`value`, `by`,
`at`). Normalize at the load boundary so the engine/UI see one canonical shape; otherwise
reloaded records resolve to `undefined` and silently stop applying. Make the consumer tolerant
of both shapes as defense-in-depth.

---

## 4. Data-update flows (what each action does)

Each user action mutates the in-memory `window.__skus`, bumps a `version` counter to force an
engine re-run (`recs = useMemo(() => CK.runEngine(skus, config), [config, overrides, version])`),
persists, and audits. Concretely:

- **Cost edit** → set `item.cost_basis`; `saveCostBasis` (upsert) + `audit_log`.
- **Manual price override** → `msrp_overrides` upsert + `audit_log`; engine flips the item to
  `MANUAL_OVERRIDE` and uses the override value.
- **Apply recommendation** → persist as an override (so it survives reload, shows in the
  Overrides view, flows to the All-Items list) + append `applied_recommendations` history. Do
  **not** mutate `current_price` — keep it as the "before" so the before→after delta stays
  meaningful; the override is authoritative everywhere.
- **Bulk import (spreadsheet)** → see §4.1.
- **Manual inventory edit** → redistribute the new total across variants (proportional; even
  split if all zero), recompute derived fields, persist via the inventory table (NOT the price
  table), + `audit_log`.

### 4.1 Intelligent spreadsheet import (column auto-detection)
A standalone module parses an `.xlsx` with SheetJS and locates columns **by header name, not
position**, so the file layout can vary:
1. Normalize headers (`lowercase`, strip non-alphanumeric).
2. For each target field, try an ordered alias list — **exact match first, then "contains."**
3. Require a key column + the critical metric; everything else is optional.
4. Build per-variant records, then **aggregate up to base items** (sum quantities, qty-weighted
   cost, min "days since…", representative category from the largest-qty variant).
5. Recompute derived fields with the **same** function used everywhere (DRY), re-run engine.
6. Persist (full-replace the snapshot table) and re-apply on boot via the same apply function —
   so import-time and load-time use one code path.

Show a preview modal: "N rows → M items / K variants," and a per-field checklist of which source
header mapped to each field (✓ found / ✗ missing-required).

---

## 5. The compute engine (`CK.runEngine`)

Pure function `skus, config → recs[]`. For each item:
- If an **override** exists → return it verbatim (`MANUAL_OVERRIDE`), recommended = override.
- If out of stock → hold at current.
- Else compute candidate prices from several **layers** (cost-plus floor; competitor-median;
  family-curve; current×velocity×posture multipliers), take a **weighted composite**, then
  `recommended = round(max(floor, composite))` so it can never go below cost-plus.
- Classify action by Δ vs current (`GAP_UP`/`GAP_DOWN`/`HOLD`) and attach **non-blocking
  data-quality flags** (e.g. `NO_COMPS`, `DEAD_STOCK`, `GM_ABOVE_80PCT`, `NONSTANDARD_LENGTH`).

**Guardrail philosophy:** floors are hard (never below cost×(1+min_margin)); ceilings are *flags*,
not hard caps (a hard 3× cap would wrongly crush legitimately high-markup low-cost items). Surface
anomalies; don't block. Round in tiers by price range.

---

## 6. Pop-up chart system (the trend modal) — copy these patterns

### 6.1 Render through a portal (critical)
Modals use `position: fixed; inset: 0` overlays. **If any ancestor has a `transform`** (e.g. a
page-enter `animation` whose keyframes translate, with `fill-mode: both`), `position: fixed`
anchors to that ancestor instead of the viewport — the modal renders far down the page, and a
big `backdrop-filter: blur` over the oversized overlay can freeze the tab. **Fix:** render every
overlay modal via `ReactDOM.createPortal(ui, document.body)` so it always anchors to the viewport.

### 6.2 Time-series generator with user-controlled x-axis
The chart x-axis is **configurable: per day / week / month**, plus **how many** periods, always
**counting backward from today (latest period is the last point).** Implementation:
- `periodLabels(granularity, count)` builds labels backward from `new Date()`:
  day → `setDate(-i)`, week → `setDate(-i*7)`, month → `setMonth(-i)`; format day/week as
  "MMM D", month as "MMM YYYY".
- `buildTrends(granularity, count)` synthesizes each series of length `count` from the item's
  **current value** (anchored: `series[last] = currentValue`) using a **seeded RNG** (stable per
  metric/family so colors/curves don't jump between renders). When real snapshots accumulate in
  `kpi_snapshots`, prefer them; otherwise synthesize.
- The modal holds `granularity` + `count` state; a segmented control (Day/Week/Month) and a
  −/+ stepper with per-granularity bounds (e.g. day 7–90 default 30; week 4–52 default 12; month
  3–24 default 12). Switching granularity resets count to that granularity's default.
- Re-derive the series with `useMemo(() => buildTrends(g, c), [buildTrends, g, c])`.

### 6.3 Hand-drawn SVG line chart
No chart lib. Fixed `viewBox` (e.g. `1000×420`), padding, `xScale(i)`/`yScale(v)` from data
bounds (+10% pad), Y/X tick arrays, one `<polyline>` per series, a dashed "portfolio average"
line, a stable color palette indexed by family, and a hover index that shows values. A left
sidebar switches the **metric** (grouped: Profitability / Stocking / Pricing) and filters which
families are drawn (All / Top N / None + per-family toggles with live values).

---

## 7. UI system & design tokens

- **CSS variables** for everything (no hardcoded colors): `--bg`, `--bg-1/2`, `--fg`, `--fg-2/3/4`,
  `--line`, `--accent`, `--accent-soft`, `--ok`, `--warn`, `--err`. Light/Dark/Auto themes swap
  the variable values; never hardcode.
- **Monospace** (`--f-mono`) for all numbers, prices, %, qty, dates, IDs; `tabular-nums`.
- **Price/marker semantics:** red = above competitor, green = below, amber = within threshold.
- **Tables:** 32–36px dense rows, sticky header, sticky first column on horizontal scroll, sort
  on header click; no transitions on rows (perf at 500+ rows). Every section has loading / empty
  / error states.
- **Every tab follows:** filter bar → KPI summary cards (with background sparklines) → chart →
  detail table. Filters apply immediately (no Apply button), shown as removable pills.
- **Toasts** via a context (`useToast().push({title, msg})`) for action feedback.
- **Markers/gauges:** anchor the dot to the bar; put the label *outside* the bar with a connector;
  don't rely on magic offsets. For colored pills, ensure text contrasts (outline pill, or set an
  explicit readable text color — never `color: inherit` on `background: currentColor`).

---

## 8. Hard-won lessons to bake into the template

1. **RLS without a policy = silent write rejection** that still looks "connected." (§3.5)
2. **`position: fixed` breaks under a transformed ancestor** → portal modals to `<body>`. (§6.1)
3. **Bake the anon key** or fresh devices silently run local-only. (§3.3)
4. **Normalize DB↔app shape on load**, or reloaded records stop applying. (§3.6)
5. **`base.qty === Σ(variant.qty)`** — maintain on every inventory mutation; redistribute, don't
   set base alone.
6. **Detect spreadsheet columns by header name**, exact-then-contains; never hardcode positions.
7. **Idempotent, non-destructive SQL** (`IF NOT EXISTS`, no `DROP`, no `FOREACH`) so schema/policy
   re-runs repair without warnings.
8. **One shared derive/recompute function** used by import, manual edits, and boot — never
   duplicate the math.
9. **Cache-bust every static asset** (`?v=x.y`) on release so browsers don't serve stale files.
10. **Anchored, seeded synthetic series** so charts look stable across re-renders and the latest
    period is always truthful.

---

## 9. Build brief for Claude Design

> Build a single-page, no-build React (Babel-Standalone) dashboard template for
> **pricing & inventory intelligence** over a catalog of items-with-variants. Include:
> a left nav with tabs (KPI Summary, Inventory, Action Center, All Items, Detail, Manual
> Overrides, Data Quality, Configuration); CSS-variable theming (light/dark/auto) with monospace
> numerics and red/green/amber price semantics; KPI cards with background sparklines; dense
> sortable tables with sticky headers; a Supabase persistence layer (dual-write localStorage +
> cloud, connection state machine, per-concern tables + audit_log, idempotent non-destructive
> RLS SQL shown in a Configuration tab); a pure compute engine producing recommendations with a
> hard cost-plus floor and non-blocking quality flags; spreadsheet import with header-name column
> auto-detection + a preview modal; and **trend pop-up charts rendered via a body portal**, drawn
> as hand-made SVG, with a metric switcher, family filter, and an **x-axis control for
> day/week/month granularity and a configurable period count that always counts backward from
> today.** Follow the data model, persistence rules, and lessons in this blueprint.

Use this project's `app.css` tokens, `db.jsx` (persistence), `ui.jsx` (`TrendAnalysisModal`,
`ExportModal`, `Toast`, `Icon`), and `tab-kpi.jsx` (`buildTrends`) as concrete reference
implementations.
