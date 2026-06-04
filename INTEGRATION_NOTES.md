# ERTI People Dashboard — Data Integration Notes

Real ERTI F2 (ETS/LTX) data was integrated into the existing template. The design
system (`ds.css`, `dash.css`, `charts.jsx`, `icons.jsx`) is **unchanged**. Only the
data layer and the four views were repointed.

## Files changed
- `data.js` — replaced synthetic dataset with the real engine (roster, schedule,
  output attribution, hardware rollup). Computes all per-person metrics from source.
- `shared.jsx` — `RiskDot` → `StatusTag` (Regular/Probationary); added `BuildMixBar`.
- `overview.jsx`, `team.jsx`, `person.jsx`, `growth.jsx` — repointed to real metrics.
- `app.jsx` — "Growth Tracker" → "Experience Matrix"; sidebar badge → probationary count.
- Unchanged: `charts.jsx`, `icons.jsx`, `tweaks-panel.jsx`, `ds.css`, `dash.css`, HTML.

## Field mapping (template → real ERTI)
| Template field        | Real meaning                                              |
|-----------------------|-----------------------------------------------------------|
| throughput            | Attributed debug outputs (Sheet 5 → roster join)          |
| fpy                   | Release rate — % of attributed outputs RELEASED           |
| utilization           | Shift load — (DS+NS+NT+OT)/14 (Sheet 4)                    |
| composite / score     | Activity Index = 0.5·output + 0.25·release + 0.25·shift    |
| skills[8] radar/heat  | Build-type experience (Testcard/Faceplate/Perfboard/HI/Other) |
| readiness / pipeline  | Tenure & employment-status bands                          |
| risk / "flight risk"  | Probationary / ramping / low-sample (non-evaluative)      |
| manager 1:1 note      | Factual activity summary (no judgments)                   |
| team KPI hero         | Monthly debug-output trend Dec–May [40,44,107,70,66,93]    |

## Integrity decisions
- **No fabricated HR data.** The source has no performance scores, skills proficiency,
  attendance, OKRs, attrition/flight-risk, promotion readiness, or 1:1 notes. None were
  invented for these real, named colleagues. Components were repointed instead.
- **Sample-based output.** Output figures come from a 55-row representative slice of
  Sheet 5 (49 matched to roster, 59 owner-credits, 6 partner/historical). Wire the full
  802-row sheet for true totals (framework §8).
- **Inferred joins flagged.** Juno→Junolito Lomeda and Aeron→Aaron Gloriani are inferred
  from owner aliases and tagged `inf`/"inferred join" in the UI. Confirm Juno = Junolito
  before relying on it — he is ETS-rostered but appears on LTX testcard work in Sheet 5.
