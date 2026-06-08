#!/usr/bin/env python3
"""
engine.py — Standalone Python port of the ERTI Nerve Center KPI engine.

Dependency-free back-office twin of assets/engine.js: the same period engine,
plan-vs-actual math, gaps, WIP aging, manning and competency, kept conceptually
byte-aligned with the in-browser model so a batch run and the dashboard agree.

Usage:
  python engine.py                      # portfolio summary (all months with data)
  python engine.py --period 2025-08     # one monthly period's KPI breakdown
  python engine.py --weekly --period WW2542
  python engine.py --json out.json      # full derived payload
  python engine.py --csv  out.csv       # flat period x metric table
Currency: Philippine Peso (PHP), integer-rounded.
"""
import argparse, csv, json, sys
from datetime import date, timedelta

DAY = timedelta(days=1)

# ── Workweek engine (fiscal year = first Monday of November) ──
def first_monday_of_nov(cal_year):
    d = date(cal_year, 11, 1)
    return d + timedelta(days=(0 if d.weekday() == 0 else (7 - d.weekday())))

def fy_start(yy):
    return first_monday_of_nov(2000 + yy - 1)

def ww_to_date(ww):
    yy, wk = int(ww[2:4]), int(ww[4:6])
    return fy_start(yy) + timedelta(weeks=wk - 1)

def ww_from_date(d):
    yy = d.year - 2000 + 1 if d.month >= 11 else d.year - 2000
    start = fy_start(yy)
    if d < start:
        yy -= 1; start = fy_start(yy)
    wk = (d - start).days // 7 + 1
    if wk > 52:
        yy += 1; wk = 1
    return "WW%02d%02d" % (yy, wk)

def build_all_ww(f, t):
    return ["WW%02d%02d" % (yy, wk) for yy in range(f, t + 1) for wk in range(1, 53)]

ALL_WW = build_all_ww(24, 26)
ALL_MONTHS = sorted({"%04d-%02d" % (ww_to_date(w).year, ww_to_date(w).month) for w in ALL_WW})

# ── Config ──
CONFIG = {
    "trendWindowWeekly": 8, "trendWindowMonthly": 6, "projectionMethod": "run_rate",
    "agingBuckets": [(0, 3), (4, 7), (8, 14), (15, 9999)], "agingFlagDays": 8,
    "activeWipStatuses": ["Queued", "In Debug", "On Hold", "Awaiting Parts"],
    "manningGreenPct": 90, "manningYellowPct": 75, "competencyGreen": 2.0, "competencyYellow": 1.0,
}

# ── Seed (mirror of assets/seed.js; PLACEHOLDER prices/targets flagged) ──
PRICE = {"Testcard": 8000, "Faceplate": 5000, "Perfboard": 12000, "Handler/Ins": 6000, "Other": 4000}
ALIAS = {"MARIEL": 1702788, "JAYLORD": 2200020, "PATRICK": 2400025, "PAT": 2400025, "TISHA": 2400029,
         "TISH": 2400029, "ALVIN": 2400032, "LOUIE": 2400036, "LOYUIE": 2400036, "FELIX": 2500075,
         "JUNO": 2200007, "JUNOLITO": 2200007, "AERON": 2500060, "AARON": 2500060}
ROSTER = [
    (1702788, "Perea, Mariel", "F2-LTX", "Regular"), (2200007, "Lomeda Jr., Junolito", "F2-ETS", "Regular"),
    (2200020, "Vitto, Jaylord", "F2-ETS", "Regular"), (2400025, "Balmaceda, Patrick", "F2-LTX", "Regular"),
    (2400029, "Ruiz, Tisha Marie", "F2-LTX", "Regular"), (2400032, "Garin, Alvin", "F2-LTX", "Regular"),
    (2400036, "Gargar, Louie", "F2-LTX", "Regular"), (2500060, "Gloriani, Aaron", "F2-ETS", "Regular"),
    (2500075, "Buenaflor, Felix", "F2-ETS", "Regular"), (2600007, "Sacala, Rhen John Rey", "F2-LTX", "PROBI"),
    (2600017, "De Jesus, Raven", "F2-LTX", "PROBI"), (2600024, "Acido, Noimie", "F2-LTX", "PROBI"),
]
MANNING_TARGETS = {"F2-LTX": 8, "F2-ETS": 6}

def fold(t):
    t = (t or "").upper()
    if "TESTCARD" in t: return "Testcard"
    if "FACEPLATE" in t or "FPLATE" in t: return "Faceplate"
    if "PERF" in t: return "Perfboard"
    if any(k in t for k in ("HNDL", "INSERT", "HI", "H/HT", "HT")): return "Handler/Ins"
    return "Other"

_O = [  # (instanceId, rawType, ww, ownerToken)
    ("L96458002","TESTCARD",2542,"LOUIE"),("L73335003","FACEPLATE",2539,"LOUIE"),("L07892009","TESTCARD",2541,"JUNO/LOUIE"),
    ("L05008007","TESTCARD",2533,"ALVIN/PATRICK/LOUIE"),("L96671001","TESTCARD",2516,"LOUIE"),("L01182005","TESTCARD",2514,"LOUIE"),
    ("L03670003","TESTCARD",2545,"LOUIE"),("L08195006","TESTCARD",2439,"LOUIE"),("L04338004","FACEPLATE",2435,"LOUIE"),
    ("L10274001","FACEPLATE",2451,"TISHA"),("L09382003","FACEPLATE",2506,"TISHA"),("L09106003","TESTCARD",2514,"TISHA"),
    ("L08768003","TESTCARD",2537,"TISHA"),("L07857004","FACEPLATE",2542,"TISHA"),("L03919007","TESTCARD",2545,"TISHA"),
    ("L02548004","FACEPLATE",2529,"TISHA"),("L06743003","FACEPLATE",2536,"ALVIN"),("L02626004","FACEPLATE",2537,"ALVIN"),
    ("L93593005","TESTCARD",2541,"ALVIN"),("L09162008","FACEPLATE",2540,"ALVIN"),("L01177007","TESTCARD",2530,"ALVIN"),
    ("L07119008","TESTCARD",2501,"PATRICK"),("L08015007","TESTCARD",2515,"PATRICK"),("L74444003","FACEPLATE",2537,"PATRICK"),
    ("L08392005","FACEPLATE",2542,"PATRICK"),("L09186009","TESTCARD",2543,"PATRICK"),("L02129006","TESTCARD",2539,"PATRICK"),
    ("L08974003","FPLATE",2547,"JAYLORD"),("L07925003","FACEPLATE",2541,"JAYLORD/TISHA"),("L63945002","FACEPLATE",2517,"JAYLORD"),
    ("L62846004","FACEPLATE",2523,"JAYLORD"),("L04115010","FACEPLATE",2540,"RICA/JAYLORD"),("L93593004","TESTCARD",2536,"JUNO"),
    ("L10556014","TESTCARD",2532,"JUNO"),("L04919003","FACEPLATE",2543,"JUNO"),("L75946003","FACEPLATE",2541,"JUNO"),
    ("L81231003","FACEPLATE",2539,"JUNO"),("L07014003","HI/HT",2542,"JUNO"),("L08964004","HI/HT",2536,"MARIEL"),
    ("L06710003","HI/HT",2537,"MARIEL"),("L74784012","HNDLINSRT",2542,"MARIEL"),("L66957005","HT/INSERT",2539,"MARIEL"),
    ("L72446016","PERFBOARD",2610,"FELIX"),("L64429013","PERFBOARD",2605,"JUNO/JAYLORD/AERON"),
    ("L65076003","PERFBOARD",2603,"AERON/JUNO/JAYLORD"),("L72446018","PERFBOARD",2610,"AERON"),
]
TEAM_OF = {r[0]: r[2] for r in ROSTER}
def _eid(tok):
    for t in tok.split("/"):
        i = ALIAS.get(t.strip().upper())
        if i: return i
    return None
OUTPUT_RECORDS = []
for hid, rt, ww, own in _O:
    eid = _eid(own); d = ww_to_date("WW%d" % ww)
    OUTPUT_RECORDS.append({"hardware_id": hid, "hw_type": fold(rt), "workweek": "WW%d" % ww,
        "output_date": d.isoformat(), "engineer_id": eid, "team": TEAM_OF.get(eid, "F2-LTX"), "qty": 1})

_WIP = [("L05008010","TESTCARD",2534,"In Debug"),("L98482002","TESTCARD",2523,"On Hold"),
        ("L09034023","TESTCARD",2528,"In Debug"),("L64001007","TESTCARD",2531,"Awaiting Parts"),
        ("L06210003","HI/HT",2420,"In Debug"),("L02624003","FACEPLATE",2424,"Queued")]
WIP = [{"hardware_id": h, "hw_type": fold(t), "status": s,
        "debug_start": ww_to_date("WW%d" % w).isoformat(), "debug_end": None} for h, t, w, s in _WIP]

OUTPUT_TARGETS = []
for mk in ["2025-07", "2025-08", "2025-09", "2026-01"]:
    for hw, b, p in [("Testcard", 6, 7), ("Faceplate", 5, 5), ("Perfboard", 2, 3), ("Handler/Ins", 2, 2), ("Other", 1, 1)]:
        OUTPUT_TARGETS.append({"period_type": "monthly", "period_key": mk, "plan_type": "budget", "hw_type": hw, "team": "ALL", "target_count": b})
        OUTPUT_TARGETS.append({"period_type": "monthly", "period_key": mk, "plan_type": "projected", "hw_type": hw, "team": "ALL", "target_count": p})

# experience-index ratings (0-3 by output volume per build type) -> competency
PLAT = ["Testcard", "Faceplate", "Perfboard", "Handler/Ins"]
_cnt = {}
for r in OUTPUT_RECORDS:
    if r["engineer_id"]:
        _cnt.setdefault(r["engineer_id"], {}); _cnt[r["engineer_id"]][r["hw_type"]] = _cnt[r["engineer_id"]].get(r["hw_type"], 0) + 1
RATINGS = []
for eid, _, _, _ in ROSTER:
    for pl in PLAT:
        c = _cnt.get(eid, {}).get(pl, 0)
        RATINGS.append({"engineer_id": eid, "platform": pl, "rating": 0 if c == 0 else 1 if c <= 1 else 2 if c <= 3 else 3})

# ── KPI functions (mirror engine.js) ──
def price(t): return PRICE.get(t, 0)

def period_of(rec, pt):
    d = date.fromisoformat(rec["output_date"]) if rec.get("output_date") else ww_to_date(rec["workweek"])
    return ww_from_date(d) if pt == "weekly" else "%04d-%02d" % (d.year, d.month)

def period_list(pt, n, end):
    seq = ALL_WW if pt == "weekly" else ALL_MONTHS
    i = seq.index(end) if end in seq else len(seq) - 1
    return seq[max(0, i - n + 1):i + 1]

def actual_output(pt, pk, team=None):
    return sum(r.get("qty", 1) for r in OUTPUT_RECORDS if period_of(r, pt) == pk and (not team or team == "ALL" or r["team"] == team))

def actual_revenue(pt, pk, team=None):
    return sum(r.get("qty", 1) * price(r["hw_type"]) for r in OUTPUT_RECORDS if period_of(r, pt) == pk and (not team or team == "ALL" or r["team"] == team))

def plan_output(pt, pk, plan, team=None):
    return sum(t["target_count"] for t in OUTPUT_TARGETS if t["period_type"] == pt and t["period_key"] == pk and t["plan_type"] == plan and (not team or team == "ALL" or t["team"] in (team, "ALL")))

def plan_revenue(pt, pk, plan, team=None):
    return sum(t["target_count"] * price(t["hw_type"]) for t in OUTPUT_TARGETS if t["period_type"] == pt and t["period_key"] == pk and t["plan_type"] == plan and (not team or team == "ALL" or t["team"] in (team, "ALL")))

def pct(gap, base): return ("%.1f%%" % (gap / base * 100)) if base else "—"

def wip_age(it):
    s = date.fromisoformat(it["debug_start"]); e = date.fromisoformat(it["debug_end"]) if it["debug_end"] else date.today()
    return max(0, (e - s).days)

def manning():
    teams = {}
    for eid, _, team, status in ROSTER:
        teams.setdefault(team, {"cur": 0, "target": 0}); teams[team]["cur"] += 1
    for team, tg in MANNING_TARGETS.items():
        teams.setdefault(team, {"cur": 0, "target": 0}); teams[team]["target"] = tg
    sc = sum(t["cur"] for t in teams.values()); st = sum(t["target"] for t in teams.values())
    return {"teams": teams, "fill": round(sc / st * 100) if st else 0, "cur": sc, "target": st}

def competency_index():
    act = [r[0] for r in ROSTER]
    avgs = []
    for eid in act:
        rs = [x["rating"] for x in RATINGS if x["engineer_id"] == eid]
        avgs.append(sum(rs) / len(rs) if rs else 0)
    return sum(avgs) / len(avgs) if avgs else 0

def build_series(pt, n, end, team=None):
    P = period_list(pt, n, end)
    return {"periods": P,
        "outActual": [actual_output(pt, k, team) for k in P], "outBudget": [plan_output(pt, k, "budget", team) for k in P],
        "outProj": [plan_output(pt, k, "projected", team) for k in P],
        "revActual": [actual_revenue(pt, k, team) for k in P], "revBudget": [plan_revenue(pt, k, "budget", team) for k in P],
        "revProj": [plan_revenue(pt, k, "projected", team) for k in P]}

def peso(v): return "₱%s" % format(int(round(v)), ",")

def period_kpis(pt, pk):
    ao, ar = actual_output(pt, pk), actual_revenue(pt, pk)
    bo, br = plan_output(pt, pk, "budget"), plan_revenue(pt, pk, "budget")
    po, pr = plan_output(pt, pk, "projected"), plan_revenue(pt, pk, "projected")
    return {"period": pk, "actual_output": ao, "actual_revenue": ar, "budget_output": bo, "budget_revenue": br,
        "projected_output": po, "projected_revenue": pr, "output_gap": ao - bo, "output_gap_pct": pct(ao - bo, bo),
        "revenue_gap": ar - br, "revenue_gap_pct": pct(ar - br, br)}

def months_with_output():
    return sorted({period_of(r, "monthly") for r in OUTPUT_RECORDS})

def main():
    ap = argparse.ArgumentParser(description="ERTI Nerve Center KPI engine (Python port)")
    ap.add_argument("--period"); ap.add_argument("--weekly", action="store_true")
    ap.add_argument("--json"); ap.add_argument("--csv")
    a = ap.parse_args()
    pt = "weekly" if a.weekly else "monthly"

    if a.json:
        payload = {"config": {k: v for k, v in CONFIG.items()},
            "periods": [period_kpis("monthly", m) for m in months_with_output()],
            "manning": manning(), "competency_index": round(competency_index(), 3),
            "total_wip": len([w for w in WIP if w["status"] in CONFIG["activeWipStatuses"]]),
            "wip_ages": {w["hardware_id"]: wip_age(w) for w in WIP}}
        open(a.json, "w").write(json.dumps(payload, indent=2)); print("wrote", a.json); return
    if a.csv:
        with open(a.csv, "w", newline="") as f:
            w = csv.writer(f); w.writerow(["period", "actual_out", "budget_out", "gap", "actual_rev", "budget_rev", "rev_gap"])
            for m in months_with_output():
                k = period_kpis("monthly", m); w.writerow([k["period"], k["actual_output"], k["budget_output"], k["output_gap"], k["actual_revenue"], k["budget_revenue"], k["revenue_gap"]])
        print("wrote", a.csv); return

    if a.period:
        k = period_kpis(pt, a.period)
        print("ERTI Nerve Center — %s (%s)" % (a.period, pt)); print("-" * 44)
        print("  Output   actual %-4d budget %-4d  gap %+d (%s)" % (k["actual_output"], k["budget_output"], k["output_gap"], k["output_gap_pct"]))
        print("  Revenue  actual %-10s budget %-10s" % (peso(k["actual_revenue"]), peso(k["budget_revenue"])))
        print("           gap %s (%s)" % (peso(k["revenue_gap"]), k["revenue_gap_pct"]))
        return

    print("ERTI Debug Nerve Center — portfolio summary"); print("=" * 52)
    print("Roster %d  ·  Output records %d  ·  WIP %d  ·  Targets %d" % (len(ROSTER), len(OUTPUT_RECORDS), len(WIP), len(OUTPUT_TARGETS)))
    m = manning(); print("Manning fill %d%% (%d/%d)  ·  Competency %.2f/3  ·  Active WIP %d"
        % (m["fill"], m["cur"], m["target"], competency_index(), len([w for w in WIP if w["status"] in CONFIG["activeWipStatuses"]])))
    print("-" * 52); print("%-9s %7s %7s %6s %12s" % ("month", "out", "budget", "gap", "revenue"))
    for mo in months_with_output():
        k = period_kpis("monthly", mo)
        print("%-9s %7d %7d %+6d %12s" % (k["period"], k["actual_output"], k["budget_output"], k["output_gap"], peso(k["actual_revenue"])))
    print("\nNote: prices and targets are PLACEHOLDERS (flagged) — replace with real figures.")

if __name__ == "__main__":
    main()
