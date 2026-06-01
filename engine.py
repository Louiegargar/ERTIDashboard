#!/usr/bin/env python3
"""
CK Ethernet Cable Pricing Engine — v1.0
=========================================

A standalone, dependency-free reference implementation of the pricing engine
that the dashboard (index.html) visualizes. This is the *source of truth* for
the recommendation logic; the JavaScript in `data.jsx` is a faithful port of
the math below so the live dashboard and a batch/back-office run agree.

The engine prices every SKU through four stacked layers and composites them:

    L1  Cost Floor          cost_basis x (1 + min_margin)        — hard minimum
    L2  Competitive Median  median of {MP, FS, CW} scraped comps — market anchor
    L3  Family Curve         power-law fit price(length)          — internal shape
    L4  Velocity x Posture   current x velocity_mult x posture     — strategy nudge

    recommended = max(L1, weighted_mean(L2, L3, L4))

Run it:

    python engine.py                 # print a portfolio summary to stdout
    python engine.py --json out.json # write the full SKU + recommendation set
    python engine.py --csv  out.csv  # write a flat CSV of recommendations
    python engine.py --sku PC6N10    # explain one SKU's four-layer breakdown

The JSON it emits is shaped so the dashboard's data layer could consume it
directly in place of the in-browser mock generator.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import sys
from dataclasses import dataclass, field, asdict
from typing import Optional


# ────────────────────────────────────────────────────────────────────────────
# Deterministic RNG  — FNV-1a seed + mulberry32, byte-for-byte match to data.jsx
# ────────────────────────────────────────────────────────────────────────────
MASK32 = 0xFFFFFFFF


def seeded_rng(s: str):
    """Return a 0..1 generator seeded from a string. Mirrors the JS `seed()`."""
    h = 2166136261 & MASK32
    for ch in s:
        h = (h ^ ord(ch)) & MASK32
        h = (h * 16777619) & MASK32

    state = h

    def rand() -> float:
        nonlocal state
        state = (state + 0x6D2B79F5) & MASK32
        t = state
        t = (t ^ (t >> 15)) * (t | 1) & MASK32
        t ^= (t + ((t ^ (t >> 7)) * (t | 61) & MASK32)) & MASK32
        return ((t ^ (t >> 14)) & MASK32) / 4294967296.0

    return rand


def round2(x: float) -> float:
    return round(x * 100) / 100.0


# ────────────────────────────────────────────────────────────────────────────
# Catalog definition
# ────────────────────────────────────────────────────────────────────────────
STD_LENGTHS = [0.5, 1, 2, 3, 5, 7, 10, 14, 15, 20, 25, 35, 50, 75, 100]

# name, ipn, posture, mp_base ($/ft), mp_fixed ($), ck_vs_mp, lengths, colors
FAMILIES = [
    ("Cat5e Non-Booted",           "PC5N",    "Value Leader",      0.18, 1.10, 0.91, STD_LENGTHS,                       ["BL","BK","GY","WH","RD","YE","GR"]),
    ("Cat5e Easyboot",             "PC5EZ",   "Value Leader",      0.20, 1.15, 1.02, STD_LENGTHS,                       ["BL","BK","GY","WH","RD","YE","GR"]),
    ("Cat5e Half Moon Shielded",   "PC5HMS",  "Parity",            0.26, 1.80, 1.13, [1,3,5,7,10,15,25,35],             ["BL","BK","GY"]),
    ("Cat6 Non Booted",            "PC6N",    "Value",             0.20, 1.30, 0.92, STD_LENGTHS,                       ["BL","BK","GY","WH","RD","YE","GR"]),
    ("Cat6 Easyboot",              "PC6EZ",   "Value",             0.22, 1.45, 0.95, STD_LENGTHS,                       ["BL","BK","GY","WH","RD","YE","GR"]),
    ("Cat6 Half Moon Shielded",    "PC6HMS",  "Parity",            0.30, 2.10, 0.91, [1,2,3,5,7,10,15,25,50],           ["BL","BK","GY"]),
    ("Cat6 Slim",                  "PC6SLM",  "Parity",            0.24, 1.55, 0.87, [0.5,1,2,3,5,7,10,15],             ["BL","BK","WH","GY"]),
    ("Cat6 Half Moon Crossover",   "PC6HMX",  "Strategic Premium", 0.34, 2.40, 1.05, [3,7,15],                          ["BL","RD"]),
    ("Cat6A Easyboot Shielded",    "PC6AEZS", "Premium",           0.42, 3.20, 0.61, STD_LENGTHS,                       ["BL","BK","GY","WH","RD"]),
    ("Cat6A Easyboot Unshielded",  "PC6AEZ",  "Premium",           0.38, 2.80, 0.55, STD_LENGTHS,                       ["BL","BK","GY","WH","RD"]),
    ("Cat6A Half Moon Shielded",   "PC6AHMS", "Premium",           0.44, 3.40, 0.69, [1,3,5,7,10,15,25,50,100],         ["BL","BK","GY","WH","RD"]),
    ("Cat6A Half Moon Unshielded", "PC6AHMU", "Premium",           0.40, 3.00, 0.54, [1,3,5,7,10,15,25,50],             ["BL","BK","GY","WH"]),
    ("Cat6A Slim",                 "PC6ASLM", "Premium",           0.36, 2.40, 0.64, [1,3,5,7,10,15],                   ["BL","BK","WH"]),
    ("Cat8",                       "PC8",     "Premium",           0.55, 4.50, 1.05, [3,5,7,10,15,25],                  ["BL","BK"]),
]

COLOR_NAMES = {"BL":"Blue","BK":"Black","GY":"Gray","WH":"White","RD":"Red","YE":"Yellow","GR":"Green","PU":"Purple","OR":"Orange"}

POSTURE_MULT = {
    "Value Leader": 0.92, "Value": 0.97, "Parity": 1.00,
    "Premium": 1.04, "Strategic Premium": 1.08,
}
VELOCITY_MULT = {"Bestseller": 1.03, "Healthy": 1.00, "Slow Mover": 0.97, "Dead Stock": 0.92}


# ────────────────────────────────────────────────────────────────────────────
# Engine configuration
# ────────────────────────────────────────────────────────────────────────────
@dataclass
class EngineConfig:
    w_l2: float = 0.55              # weight: competitive median
    w_l3: float = 0.30              # weight: family curve
    w_l4: float = 0.15              # weight: velocity/posture
    min_margin_pct: float = 0.30    # L1 floor margin over cost
    action_threshold: float = 0.05  # |delta| beyond this => GAP_UP / GAP_DOWN
    simulate_event: bool = False    # tariff-event lock on Cat6A
    postures: dict = field(default_factory=dict)  # per-family posture override


# ────────────────────────────────────────────────────────────────────────────
# Data records
# ────────────────────────────────────────────────────────────────────────────
@dataclass
class Variant:
    ipn: str
    color: str
    color_name: str
    inventory_qty: int


@dataclass
class Sku:
    ipn_base: str
    family: str
    family_ipn: str
    length_ft: float
    awg: int
    shielded: bool
    current_msrp: float
    cost_basis: float
    inventory_qty: int
    mp_price: Optional[float]
    fs_price: Optional[float]
    cw_price: Optional[float]
    velocity_tier: str
    posture: str
    color_variants: list = field(default_factory=list)
    notes: str = ""


@dataclass
class Recommendation:
    ipn_base: str
    family: str
    length_ft: float
    current_msrp: float
    recommended_msrp: float
    delta_pct: float
    action_code: str
    confidence: str
    flags: list
    l1: Optional[float]
    l2: Optional[float]
    l2_n: int
    l3: Optional[float]
    l4: Optional[float]
    composite: float


# ────────────────────────────────────────────────────────────────────────────
# Catalog builder  — deterministic mock that matches the dashboard dataset
# ────────────────────────────────────────────────────────────────────────────
def build_catalog() -> list[Sku]:
    rng = seeded_rng("ck-cable-pricing-v1")
    skus: list[Sku] = []

    for name, ipn, posture, mp_base, mp_fixed, ck_vs_mp, lengths, colors in FAMILIES:
        for length in lengths:
            ipn_base = f"{ipn}{str(length).replace('.', '')}"

            mp_price = round2(mp_base * length + mp_fixed + (rng() - 0.5) * 0.3)
            fs_has = rng() > 0.20
            fs_price = round2(mp_price * (1.25 + rng() * 0.30)) if fs_has else None
            cw_has = rng() > 0.24
            cw_price = round2(mp_price * (1.0 + (rng() - 0.4) * 0.30)) if cw_has else None
            mp_has = rng() > 0.35
            mp_final = mp_price if mp_has else None

            current_msrp = round2(mp_price * ck_vs_mp * (1 + (rng() - 0.5) * 0.05))
            cost = round2(current_msrp * (0.40 + rng() * 0.18))

            inv_qty = int(rng() * 600)
            if rng() < 0.08:
                inv_qty = 0
            if rng() < 0.05:
                inv_qty = int(rng() * 1500)

            v_r = rng()
            if inv_qty == 0:
                velocity = "No Stock"
            elif v_r < 0.15:
                velocity = "Bestseller"
            elif v_r < 0.78:
                velocity = "Healthy"
            elif v_r < 0.93:
                velocity = "Slow Mover"
            else:
                velocity = "Dead Stock"

            variants = []
            for i, c in enumerate(colors):
                if i == 0:
                    w = 0.45
                elif i == 1:
                    w = 0.25
                else:
                    w = 0.30 / max(1, len(colors) - 2)
                variants.append(Variant(
                    ipn=ipn_base + c, color=c,
                    color_name=COLOR_NAMES.get(c, c),
                    inventory_qty=int(inv_qty * w),
                ))

            notes = ""
            if cw_has and rng() < 0.08:
                notes = "CW is 24AWG"
            elif fs_has and rng() < 0.06:
                notes = "FS custom length"
            elif cw_has and rng() < 0.05:
                notes = "CW used Halfmoon boot"

            skus.append(Sku(
                ipn_base=ipn_base, family=name, family_ipn=ipn,
                length_ft=length,
                awg=23 if (name.startswith("Cat6A") or name == "Cat8") else 26,
                shielded=("Shielded" in name or name == "Cat8"),
                current_msrp=current_msrp, cost_basis=cost,
                inventory_qty=inv_qty,
                mp_price=mp_final, fs_price=fs_price, cw_price=cw_price,
                velocity_tier=velocity, posture=posture,
                color_variants=variants, notes=notes,
            ))

    return skus


# ────────────────────────────────────────────────────────────────────────────
# L3 — per-family power-law fit:  price = exp(alpha) * length ** beta
# ────────────────────────────────────────────────────────────────────────────
def fit_family_curves(skus: list[Sku]) -> dict:
    by_family: dict[str, list[Sku]] = {}
    for s in skus:
        by_family.setdefault(s.family, []).append(s)

    curves = {}
    for fam, rows in by_family.items():
        rows = [r for r in rows if r.length_ft > 0 and r.current_msrp > 0]
        if len(rows) < 4:
            curves[fam] = None
            continue
        xs = [math.log(r.length_ft) for r in rows]
        ys = [math.log(r.current_msrp) for r in rows]
        n = len(xs)
        sx, sy = sum(xs), sum(ys)
        sxx = sum(x * x for x in xs)
        sxy = sum(x * y for x, y in zip(xs, ys))
        beta = (n * sxy - sx * sy) / (n * sxx - sx * sx)
        alpha = (sy - beta * sx) / n
        curves[fam] = (alpha, beta)
    return curves


def curve_predict(curve, length: float) -> Optional[float]:
    if curve is None:
        return None
    alpha, beta = curve
    return math.exp(alpha + beta * math.log(length))


# ────────────────────────────────────────────────────────────────────────────
# The engine
# ────────────────────────────────────────────────────────────────────────────
def run_engine(skus: list[Sku], cfg: EngineConfig, overrides: Optional[dict] = None) -> list[Recommendation]:
    overrides = overrides or {}
    curves = fit_family_curves(skus)
    out: list[Recommendation] = []

    for s in skus:
        # Inventory gate — no stock means no markdown action
        if s.inventory_qty == 0:
            out.append(Recommendation(
                s.ipn_base, s.family, s.length_ft, s.current_msrp,
                s.current_msrp, 0.0, "HOLD_NO_STOCK", "N/A", ["NO_STOCK"],
                None, None, 0, None, None, s.current_msrp,
            ))
            continue

        # Manual override short-circuits the engine
        if s.ipn_base in overrides:
            val = overrides[s.ipn_base]["value"]
            out.append(Recommendation(
                s.ipn_base, s.family, s.length_ft, s.current_msrp,
                val, (val - s.current_msrp) / s.current_msrp,
                "MANUAL_OVERRIDE", "N/A", [], None, None, 0, None, None, val,
            ))
            continue

        # L1 — cost floor
        l1 = round2(s.cost_basis * (1 + cfg.min_margin_pct))

        # L2 — competitive median (HIGH/MED/LOW confidence by comp coverage)
        prices = sorted(p for p in (s.mp_price, s.fs_price, s.cw_price) if p and p > 0)
        l2: Optional[float] = None
        l2_n = len(prices)
        confidence = "LOW"
        if l2_n == 3:
            l2 = round2((prices[0] + prices[1]) / 2)
            confidence = "HIGH"
        elif l2_n == 2:
            l2 = round2((prices[0] + prices[1]) / 2)
            confidence = "MEDIUM"
        elif l2_n == 1:
            l2 = round2(prices[0] * 0.98)
            confidence = "LOW"

        # L3 — family curve
        l3 = curve_predict(curves.get(s.family), s.length_ft)
        l3 = round2(l3) if l3 is not None else None

        # L4 — velocity x posture
        v_mult = VELOCITY_MULT.get(s.velocity_tier, 1.0)
        p_mult = cfg.postures.get(s.family) or POSTURE_MULT.get(s.posture, 1.0)
        l4 = round2(s.current_msrp * v_mult * p_mult)

        # Composite — reweight across whichever layers are present
        parts = [(v, w) for v, w in ((l2, cfg.w_l2), (l3, cfg.w_l3), (l4, cfg.w_l4)) if v is not None]
        if not parts:
            composite = float(l1)
        else:
            total_w = sum(w for _, w in parts)
            composite = sum(v * w for v, w in parts) / total_w

        recommended = round2(max(l1 or 0.0, composite))
        delta = (recommended - s.current_msrp) / s.current_msrp

        # Action code
        if delta > cfg.action_threshold:
            action = "GAP_UP"
        elif delta < -cfg.action_threshold:
            action = "GAP_DOWN"
        else:
            action = "HOLD"

        # Flags — data-quality and review signals
        flags = []
        if l2 is not None and l3 is not None:
            div = abs(l2 - l3) / l3
            if div > 0.30 and l2 < l3:
                flags.append("UNDERPRICED_VS_FAMILY")
            if div > 0.30 and l2 > l3:
                flags.append("OVERPRICED_VS_FAMILY")
        if l2 is None:
            flags.append("NO_COMPS")
        if s.velocity_tier == "Dead Stock":
            flags.append("DEAD_STOCK")
        if s.notes:
            flags.append("MATCH_QUALITY_LOW")
        if s.length_ft not in STD_LENGTHS:
            flags.append("NONSTANDARD_LENGTH")
        if s.family.startswith("Cat6A") and cfg.simulate_event:
            flags.append("REVIEW_TARIFF_EVENT")

        out.append(Recommendation(
            s.ipn_base, s.family, s.length_ft, s.current_msrp,
            recommended, delta, action, confidence, flags,
            l1, l2, l2_n, l3, l4, round2(composite),
        ))

    return out


# ────────────────────────────────────────────────────────────────────────────
# Portfolio analytics
# ────────────────────────────────────────────────────────────────────────────
def portfolio_summary(skus: list[Sku], recs: list[Recommendation]) -> dict:
    by_sku = {s.ipn_base: s for s in skus}
    actionable = [r for r in recs if r.action_code in ("GAP_UP", "GAP_DOWN")]

    def gm(price, cost):
        return (price - cost) / price if price else 0.0

    gm_cur = [gm(s.current_msrp, s.cost_basis) for s in skus if s.current_msrp]
    gm_rec = [gm(r.recommended_msrp, by_sku[r.ipn_base].cost_basis)
              for r in recs if r.recommended_msrp]

    # Projected annual revenue impact (4 turns of current inventory)
    rev_delta = sum(
        (r.recommended_msrp - r.current_msrp) * by_sku[r.ipn_base].inventory_qty * 4
        for r in recs
    )

    return {
        "skus": len(skus),
        "actionable": len(actionable),
        "gap_up": sum(1 for r in recs if r.action_code == "GAP_UP"),
        "gap_down": sum(1 for r in recs if r.action_code == "GAP_DOWN"),
        "hold": sum(1 for r in recs if r.action_code == "HOLD"),
        "no_stock": sum(1 for r in recs if r.action_code == "HOLD_NO_STOCK"),
        "overrides": sum(1 for r in recs if r.action_code == "MANUAL_OVERRIDE"),
        "flagged": sum(1 for r in recs if r.flags),
        "avg_gm_current": round(sum(gm_cur) / len(gm_cur), 4) if gm_cur else 0,
        "avg_gm_recommended": round(sum(gm_rec) / len(gm_rec), 4) if gm_rec else 0,
        "proj_annual_rev_delta": round(rev_delta, 2),
    }


# ────────────────────────────────────────────────────────────────────────────
# Serialization
# ────────────────────────────────────────────────────────────────────────────
def to_payload(skus: list[Sku], recs: list[Recommendation], cfg: EngineConfig) -> dict:
    rec_by_sku = {r.ipn_base: r for r in recs}
    return {
        "version": "1.0",
        "generated_for": "ck-cable-pricing",
        "config": asdict(cfg),
        "summary": portfolio_summary(skus, recs),
        "skus": [
            {**asdict(s), "recommendation": asdict(rec_by_sku[s.ipn_base])}
            for s in skus
        ],
    }


def write_csv(path: str, recs: list[Recommendation]) -> None:
    cols = ["ipn_base", "family", "length_ft", "current_msrp", "recommended_msrp",
            "delta_pct", "action_code", "confidence", "l1", "l2", "l3", "l4",
            "composite", "flags"]
    with open(path, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(cols)
        for r in recs:
            row = asdict(r)
            row["flags"] = "|".join(row["flags"])
            w.writerow([row[c] for c in cols])


def explain_sku(ipn: str, skus: list[Sku], recs: list[Recommendation]) -> None:
    s = next((s for s in skus if s.ipn_base == ipn), None)
    r = next((r for r in recs if r.ipn_base == ipn), None)
    if not s or not r:
        print(f"  SKU '{ipn}' not found. Try one of: "
              f"{', '.join(x.ipn_base for x in skus[:8])} ...")
        return

    def money(v):
        return "  —  " if v is None else f"${v:>7.2f}"

    print(f"\n  {s.ipn_base}   {s.family}  ·  {s.length_ft}ft  ·  {s.awg}AWG")
    print(f"  {'─' * 56}")
    print(f"  Current MSRP        {money(s.current_msrp)}     cost {money(s.cost_basis)}")
    print(f"  Comps   MP {money(s.mp_price)}  FS {money(s.fs_price)}  CW {money(s.cw_price)}")
    print(f"  {'─' * 56}")
    print(f"  L1  Cost Floor          {money(r.l1)}")
    print(f"  L2  Competitive Median  {money(r.l2)}   ({r.confidence}, n={r.l2_n})")
    print(f"  L3  Family Curve        {money(r.l3)}")
    print(f"  L4  Velocity x Posture  {money(r.l4)}   ({s.velocity_tier} · {s.posture})")
    print(f"  {'─' * 56}")
    print(f"  ∑   Composite           {money(r.composite)}")
    print(f"  →   Recommended         {money(r.recommended_msrp)}   "
          f"Δ {r.delta_pct * 100:+.1f}%   [{r.action_code}]")
    if r.flags:
        print(f"      flags: {', '.join(r.flags)}")
    print()


# ────────────────────────────────────────────────────────────────────────────
# CLI
# ────────────────────────────────────────────────────────────────────────────
def main(argv=None) -> int:
    p = argparse.ArgumentParser(description="CK Cable Pricing Engine v1.0")
    p.add_argument("--json", metavar="PATH", help="write full SKU + recommendation payload")
    p.add_argument("--csv", metavar="PATH", help="write flat recommendation CSV")
    p.add_argument("--sku", metavar="IPN", help="explain one SKU's layer breakdown")
    p.add_argument("--simulate-event", action="store_true", help="enable Cat6A tariff-event lock")
    p.add_argument("--min-margin", type=float, default=0.30, help="L1 floor margin (default 0.30)")
    p.add_argument("--threshold", type=float, default=0.05, help="action threshold (default 0.05)")
    args = p.parse_args(argv)

    cfg = EngineConfig(
        min_margin_pct=args.min_margin,
        action_threshold=args.threshold,
        simulate_event=args.simulate_event,
    )

    # The four seed overrides the dashboard ships with
    overrides = {
        "PC6HMS50":  {"value": 28.00, "by": "louie", "reason": "Strategic positioning"},
        "PC6ASLM10": {"value": 5.99,  "by": "craig", "reason": "Customer commitment"},
        "PC6EZ7":    {"value": 4.50,  "by": "louie", "reason": "Volume contract"},
        "PC85":      {"value": 14.99, "by": "louie", "reason": "Strategic positioning"},
    }

    skus = build_catalog()
    recs = run_engine(skus, cfg, overrides)
    summary = portfolio_summary(skus, recs)

    if args.sku:
        explain_sku(args.sku, skus, recs)
        return 0

    if args.json:
        with open(args.json, "w") as f:
            json.dump(to_payload(skus, recs, cfg), f, indent=2)
        print(f"  wrote {args.json}  ({len(skus)} SKUs)")

    if args.csv:
        write_csv(args.csv, recs)
        print(f"  wrote {args.csv}  ({len(recs)} rows)")

    if not args.json and not args.csv:
        print("\n  CK CABLE PRICING ENGINE — v1.0  ·  portfolio summary")
        print(f"  {'═' * 56}")
        print(f"  SKUs                {summary['skus']:>6}")
        print(f"  Actionable          {summary['actionable']:>6}   "
              f"(↑ {summary['gap_up']}  ↓ {summary['gap_down']})")
        print(f"  Hold                {summary['hold']:>6}")
        print(f"  No stock            {summary['no_stock']:>6}")
        print(f"  Manual overrides    {summary['overrides']:>6}")
        print(f"  Flagged             {summary['flagged']:>6}")
        print(f"  {'─' * 56}")
        print(f"  Avg GM%  current    {summary['avg_gm_current'] * 100:>5.1f}%")
        print(f"  Avg GM%  recommended{summary['avg_gm_recommended'] * 100:>5.1f}%   "
              f"(+{(summary['avg_gm_recommended'] - summary['avg_gm_current']) * 100:.1f}pp)")
        print(f"  Proj annual rev Δ   ${summary['proj_annual_rev_delta']:>,.0f}")
        print(f"  {'═' * 56}")
        print("  Tip: --sku PC6N10 to explain one SKU · --json out.json to export\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())
