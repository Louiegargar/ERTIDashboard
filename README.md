# CK Ethernet Cable Pricing — Dashboard

A high-density, interactive pricing dashboard for Cleerline/CK's ethernet cable
catalog (~170 SKUs across 14 families). Built on the **MetaPartCrawler** design
system (dark, amber-accent, monospace-numerics).

The recommendation engine prices every SKU through four stacked layers and
composites them:

| Layer | Name | What it does |
|-------|------|--------------|
| **L1** | Cost Floor | `cost × (1 + min_margin)` — a hard minimum |
| **L2** | Competitive Median | median of scraped MP / FS / CW comps — market anchor |
| **L3** | Family Curve | power-law fit `price(length)` — internal price shape |
| **L4** | Velocity × Posture | strategy nudge by sell-through and family stance |

`recommended = max(L1, weighted_mean(L2, L3, L4))`

---

## File map

The build is deliberately split so each concern stays editable in isolation.

| File | Role |
|------|------|
| `index.html` | Entry point — loads React, Babel, then every module below |
| `app.css` | All styling — design-system tokens + component styles |
| `data.jsx` | **Data + engine layer** — catalog generator, four-layer engine, curve fit, audit log (`window.CK`) |
| `ui.jsx` | Shared primitives — icons, formatters, badges, `Select`, `Seg`, `Modal`, toasts |
| `charts.jsx` | Pure-SVG interactive charts — time series, family curve, scatter, donut, bar, sparkline, heatmap |
| `tab-action.jsx` | **Action Center** — sortable/filterable recommendation table with expandable layer breakdowns + bulk approve |
| `tab-heatmap.jsx` | **Family × Length heatmap** with switchable metrics |
| `tab-detail.jsx` | **SKU Detail** — comp history, curve position, color variants, audit trail |
| `tab-overrides.jsx` | **Manual Overrides** register |
| `tab-quality.jsx` | **Data Quality** — flag groups by severity |
| `tab-kpi.jsx` | **KPI Summary** — portfolio rollups and distributions |
| `tab-config.jsx` | **Configuration** — live engine weights/thresholds with a simulate-and-promote scenario mode |
| `app.jsx` | App shell — sidebar nav, topbar, routing, modals |
| `engine.py` | **Standalone Python port of the engine** — the back-office source of truth |

### Why a Python file?

The same four-layer math that powers the live dashboard is implemented as a
dependency-free Python module (`engine.py`) so it can run in a batch/back-office
context — regenerating the catalog, scoring every SKU, and exporting JSON or CSV
that the dashboard could consume directly.

```bash
python engine.py                 # portfolio summary to stdout
python engine.py --sku PC6N10    # explain one SKU's L1–L4 breakdown
python engine.py --json out.json # full SKU + recommendation payload
python engine.py --csv  out.csv  # flat recommendation table
python engine.py --simulate-event --min-margin 0.35   # tweak engine config
```

The deterministic RNG, family definitions, posture/velocity multipliers, and
composite logic are kept byte-aligned with `data.jsx` so a batch run and the
in-browser model agree.

---

## Interaction highlights

- **Inline approve / defer / reject / override** on every recommendation row
- **Bulk approve** with a portfolio-impact preview (avg MSRP, GM%, projected revenue, confidence breakdown)
- **Live engine config** — drag the layer weights and thresholds, simulate the result against the current book, then promote the scenario
- **Expandable rows** revealing the four-layer math, competitor comps, and the family power-law curve with this SKU highlighted
- **Cross-tab navigation** — heatmap cells and KPI segments deep-link into filtered views and SKU detail
