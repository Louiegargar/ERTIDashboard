// ─── Cable Pricing Data Layer ───────────────────────────────
// Deterministic mock dataset (~170 SKUs) following the spec's families,
// lengths, postures, and competitive structure.

(function () {
  // Seeded RNG so data is stable between reloads
  const seed = (s) => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    }
    return () => {
      h += 0x6D2B79F5;
      let t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  const STD_LENGTHS = [0.5, 1, 2, 3, 5, 7, 10, 14, 15, 20, 25, 35, 50, 75, 100];

  // Family definitions: catalog + per-family pricing context
  // base_$/ft, fixed_cost ($), CK_position_vs_mp (rough multiplier on MP price)
  const FAMILIES = [
    { name: 'Cat5e Non-Booted',          ipn: 'PC5N',    posture: 'Value Leader', mpBase: 0.18, mpFixed: 1.10, ckVsMp: 0.91, lengths: STD_LENGTHS, colors: ['BL','BK','GY','WH','RD','YE','GR'] },
    { name: 'Cat5e Easyboot',            ipn: 'PC5EZ',   posture: 'Value Leader', mpBase: 0.20, mpFixed: 1.15, ckVsMp: 1.02, lengths: STD_LENGTHS, colors: ['BL','BK','GY','WH','RD','YE','GR'] },
    { name: 'Cat5e Half Moon Shielded',  ipn: 'PC5HMS',  posture: 'Parity',       mpBase: 0.26, mpFixed: 1.80, ckVsMp: 1.13, lengths: [1,3,5,7,10,15,25,35], colors: ['BL','BK','GY'] },
    { name: 'Cat6 Non Booted',           ipn: 'PC6N',    posture: 'Value',        mpBase: 0.20, mpFixed: 1.30, ckVsMp: 0.92, lengths: STD_LENGTHS, colors: ['BL','BK','GY','WH','RD','YE','GR'] },
    { name: 'Cat6 Easyboot',             ipn: 'PC6EZ',   posture: 'Value',        mpBase: 0.22, mpFixed: 1.45, ckVsMp: 0.95, lengths: STD_LENGTHS, colors: ['BL','BK','GY','WH','RD','YE','GR'] },
    { name: 'Cat6 Half Moon Shielded',   ipn: 'PC6HMS',  posture: 'Parity',       mpBase: 0.30, mpFixed: 2.10, ckVsMp: 0.91, lengths: [1,2,3,5,7,10,15,25,50], colors: ['BL','BK','GY'] },
    { name: 'Cat6 Slim',                 ipn: 'PC6SLM',  posture: 'Parity',       mpBase: 0.24, mpFixed: 1.55, ckVsMp: 0.87, lengths: [0.5,1,2,3,5,7,10,15], colors: ['BL','BK','WH','GY'] },
    { name: 'Cat6 Half Moon Crossover',  ipn: 'PC6HMX',  posture: 'Strategic Premium', mpBase: 0.34, mpFixed: 2.40, ckVsMp: 1.05, lengths: [3,7,15], colors: ['BL','RD'] },
    { name: 'Cat6A Easyboot Shielded',   ipn: 'PC6AEZS', posture: 'Premium',      mpBase: 0.42, mpFixed: 3.20, ckVsMp: 0.61, lengths: STD_LENGTHS, colors: ['BL','BK','GY','WH','RD'] },
    { name: 'Cat6A Easyboot Unshielded', ipn: 'PC6AEZ',  posture: 'Premium',      mpBase: 0.38, mpFixed: 2.80, ckVsMp: 0.55, lengths: STD_LENGTHS, colors: ['BL','BK','GY','WH','RD'] },
    { name: 'Cat6A Half Moon Shielded',  ipn: 'PC6AHMS', posture: 'Premium',      mpBase: 0.44, mpFixed: 3.40, ckVsMp: 0.69, lengths: [1,3,5,7,10,15,25,50,100], colors: ['BL','BK','GY','WH','RD'] },
    { name: 'Cat6A Half Moon Unshielded',ipn: 'PC6AHMU', posture: 'Premium',      mpBase: 0.40, mpFixed: 3.00, ckVsMp: 0.54, lengths: [1,3,5,7,10,15,25,50], colors: ['BL','BK','GY','WH'] },
    { name: 'Cat6A Slim',                ipn: 'PC6ASLM', posture: 'Premium',      mpBase: 0.36, mpFixed: 2.40, ckVsMp: 0.64, lengths: [1,3,5,7,10,15], colors: ['BL','BK','WH'] },
    { name: 'Cat8',                      ipn: 'PC8',     posture: 'Premium',      mpBase: 0.55, mpFixed: 4.50, ckVsMp: 1.05, lengths: [3,5,7,10,15,25], colors: ['BL','BK'] },
  ];

  const COLOR_NAMES = { BL:'Blue', BK:'Black', GY:'Gray', WH:'White', RD:'Red', YE:'Yellow', GR:'Green', PU:'Purple', OR:'Orange' };
  const COLOR_HEX = { BL:'#3b82f6', BK:'#0a0b0d', GY:'#9ca3af', WH:'#f5f5f5', RD:'#ef4444', YE:'#facc15', GR:'#22c55e', PU:'#a855f7', OR:'#fb923c' };

  const POSTURE_MULT = {
    'Value Leader': 0.92, 'Value': 0.97, 'Parity': 1.00, 'Premium': 1.04, 'Strategic Premium': 1.08,
  };
  const VELOCITY_MULT = { Bestseller: 1.03, Healthy: 1.00, 'Slow Mover': 0.97, 'Dead Stock': 0.92 };

  // ─── Build dataset ───────────────────────────────────────────
  function build() {
    const rng = seed('ck-cable-pricing-v1');
    const skus = [];

    for (const fam of FAMILIES) {
      for (const len of fam.lengths) {
        const ipnBase = `${fam.ipn}${String(len).replace('.', '')}`;

        // Competitor prices
        const mpPrice = round2(fam.mpBase * len + fam.mpFixed + (rng() - 0.5) * 0.3);
        // FS sits 25-50% above
        const fsHas = rng() > 0.20;
        const fsPrice = fsHas ? round2(mpPrice * (1.25 + rng() * 0.30)) : null;
        // CW present often, noisier
        const cwHas = rng() > 0.24;
        const cwPrice = cwHas ? round2(mpPrice * (1.0 + (rng() - 0.4) * 0.30)) : null;
        // MP sometimes missing
        const mpHas = rng() > 0.35;
        const mpFinal = mpHas ? mpPrice : null;

        // Current CK price — derived from MP-style base * family multiplier
        const currentMsrp = round2((mpPrice) * fam.ckVsMp * (1 + (rng() - 0.5) * 0.05));

        // Cost basis: 38-55% of current msrp typically
        const cost = round2(currentMsrp * (0.40 + rng() * 0.18));

        // Inventory
        let invQty = Math.floor(rng() * 600);
        if (rng() < 0.08) invQty = 0;
        if (rng() < 0.05) invQty = Math.floor(rng() * 1500);

        // Velocity
        let velocity;
        const vR = rng();
        if (invQty === 0) velocity = 'No Stock';
        else if (vR < 0.15) velocity = 'Bestseller';
        else if (vR < 0.78) velocity = 'Healthy';
        else if (vR < 0.93) velocity = 'Slow Mover';
        else velocity = 'Dead Stock';

        // Color variants (split inventory)
        const colors = fam.colors;
        const variants = colors.map((c, i) => {
          const w = i === 0 ? 0.45 : (i === 1 ? 0.25 : (0.30 / Math.max(1, colors.length - 2)));
          return {
            ipn: ipnBase + c,
            color: c,
            colorName: COLOR_NAMES[c],
            colorHex: COLOR_HEX[c],
            inventory_qty: Math.floor(invQty * w),
          };
        });

        // Notes (match-quality flags)
        let notes = '';
        if (cwHas && rng() < 0.08) notes = 'CW is 24AWG';
        else if (fsHas && rng() < 0.06) notes = 'FS custom length';
        else if (cwHas && rng() < 0.05) notes = 'CW used Halfmoon boot';

        skus.push({
          ipn_base: ipnBase,
          family: fam.name,
          family_ipn: fam.ipn,
          length_ft: len,
          awg: fam.name.startsWith('Cat6A') || fam.name === 'Cat8' ? 23 : 26,
          shielded: /Shielded|Cat8/.test(fam.name),
          current_msrp: currentMsrp,
          cost_basis: cost,
          inventory_qty: invQty,
          mp_price: mpFinal,
          fs_price: fsPrice,
          cw_price: cwPrice,
          velocity_tier: velocity,
          posture: fam.posture,
          color_variants: variants,
          color_variant_count: variants.length,
          notes: notes,
        });
      }
    }

    return skus;
  }

  function round2(x) { return Math.round(x * 100) / 100; }

  // ─── Family curve (power-law fit per family) ─────────────────
  function fitFamilyCurves(skus) {
    const byFam = {};
    skus.forEach(s => {
      if (!byFam[s.family]) byFam[s.family] = [];
      byFam[s.family].push(s);
    });
    const curves = {};
    for (const fam in byFam) {
      const rows = byFam[fam].filter(s => s.length_ft > 0 && s.current_msrp > 0);
      if (rows.length < 4) { curves[fam] = null; continue; }
      const xs = rows.map(r => Math.log(r.length_ft));
      const ys = rows.map(r => Math.log(r.current_msrp));
      const n = xs.length;
      const sx = xs.reduce((a,b) => a+b, 0);
      const sy = ys.reduce((a,b) => a+b, 0);
      const sxx = xs.reduce((a,b) => a+b*b, 0);
      const sxy = xs.reduce((a,b,i) => a+b*ys[i], 0);
      const beta = (n*sxy - sx*sy) / (n*sxx - sx*sx);
      const alpha = (sy - beta*sx) / n;
      curves[fam] = { alpha, beta, predict: (l) => Math.exp(alpha + beta * Math.log(l)) };
    }
    return curves;
  }

  // ─── Run engine on each SKU ──────────────────────────────────
  function runEngine(skus, config) {
    const cfg = config || DEFAULT_CONFIG;
    const curves = fitFamilyCurves(skus);

    return skus.map(s => {
      // Inventory gate
      if (s.inventory_qty === 0) {
        return {
          ...s,
          recommended_msrp: s.current_msrp,
          delta_pct: 0,
          action_code: 'HOLD_NO_STOCK',
          confidence: 'N/A',
          flags: ['NO_STOCK'],
          l1: null, l2: null, l2_n: 0, l3: null, l4: null,
          composite: s.current_msrp,
        };
      }

      // Override?
      if (window.__overrides && window.__overrides[s.ipn_base]) {
        const o = window.__overrides[s.ipn_base];
        return {
          ...s,
          recommended_msrp: o.value,
          delta_pct: (o.value - s.current_msrp) / s.current_msrp,
          action_code: 'MANUAL_OVERRIDE',
          confidence: 'N/A',
          flags: [],
          l1: null, l2: null, l2_n: 0, l3: null, l4: null,
          composite: o.value,
          override_by: o.by,
          override_reason: o.reason,
          override_at: o.at,
        };
      }

      // L1 Cost Floor
      const l1 = round2(s.cost_basis * (1 + cfg.min_margin_pct));

      // L2 Competitive
      const prices = [s.mp_price, s.fs_price, s.cw_price].filter(p => p != null && p > 0).sort((a,b) => a-b);
      let l2 = null, l2_n = prices.length, confidence = 'LOW';
      if (prices.length === 3) { l2 = round2((prices[0] + prices[1]) / 2); confidence = 'HIGH'; }
      else if (prices.length === 2) { l2 = round2((prices[0] + prices[1]) / 2); confidence = 'MEDIUM'; }
      else if (prices.length === 1) { l2 = round2(prices[0] * 0.98); confidence = 'LOW'; }

      // L3 Family Curve
      const curve = curves[s.family];
      const l3 = curve ? round2(curve.predict(s.length_ft)) : null;

      // L4 Velocity & Posture
      const vMult = VELOCITY_MULT[s.velocity_tier] || 1.0;
      const pMult = (cfg.postures && cfg.postures[s.family]) || POSTURE_MULT[s.posture] || 1.0;
      const l4 = round2(s.current_msrp * vMult * pMult);

      // Composite — reweight if missing layers
      const parts = [
        { v: l2, w: cfg.w_l2 },
        { v: l3, w: cfg.w_l3 },
        { v: l4, w: cfg.w_l4 },
      ].filter(p => p.v != null);
      let composite;
      if (parts.length === 0) composite = l1;
      else {
        const totalW = parts.reduce((a,p) => a + p.w, 0);
        composite = parts.reduce((a,p) => a + p.v * p.w, 0) / totalW;
      }
      const recommended = round2(Math.max(l1 || 0, composite));

      const delta = (recommended - s.current_msrp) / s.current_msrp;

      // Action code
      let action;
      if (delta > cfg.action_threshold) action = 'GAP_UP';
      else if (delta < -cfg.action_threshold) action = 'GAP_DOWN';
      else action = 'HOLD';

      // Flags
      const flags = [];
      if (l2 != null && l3 != null) {
        const div = Math.abs(l2 - l3) / l3;
        if (div > 0.30 && l2 < l3) flags.push('UNDERPRICED_VS_FAMILY');
        if (div > 0.30 && l2 > l3) flags.push('OVERPRICED_VS_FAMILY');
      }
      if (l2 == null) flags.push('NO_COMPS');
      if (s.velocity_tier === 'Dead Stock') flags.push('DEAD_STOCK');
      if (s.notes) flags.push('MATCH_QUALITY_LOW');
      if (![0.5,1,2,3,5,7,10,14,15,20,25,35,50,75,100].includes(s.length_ft)) flags.push('NONSTANDARD_LENGTH');

      // Simulated tariff event flag for Cat6A
      if (s.family.startsWith('Cat6A') && cfg.simulateEvent) flags.push('REVIEW_TARIFF_EVENT');

      return {
        ...s,
        recommended_msrp: recommended,
        composite: round2(composite),
        delta_pct: delta,
        action_code: action,
        confidence,
        flags,
        l1, l2, l2_n, l3, l4,
        velocity_mult: vMult,
        posture_mult: pMult,
      };
    });
  }

  // Mock comp-price history (quarterly back 12 months)
  function compHistory(rec) {
    const now = new Date('2026-03-24');
    const points = [];
    const rng = seed(rec.ipn_base);
    for (let q = 4; q >= 0; q--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - q * 3);
      const factor = q === 0 ? 1 : (1 - 0.04 * (q - 1) + (rng() - 0.5) * 0.05);
      const tariff = q <= 1 && rec.family.startsWith('Cat6A') ? 1.18 : 1;
      points.push({
        date: d,
        ck: round2(rec.current_msrp * factor),
        mp: rec.mp_price ? round2(rec.mp_price * factor) : null,
        fs: rec.fs_price ? round2(rec.fs_price * factor * tariff) : null,
        cw: rec.cw_price ? round2(rec.cw_price * factor * (1 + (rng() - 0.5) * 0.06)) : null,
      });
    }
    return points;
  }

  function curvePoints(rec) {
    // Build the rec.family curve from the live dataset
    const all = window.__skus || [];
    const fam = all.filter(s => s.family === rec.family);
    const rows = fam.filter(s => s.length_ft > 0 && s.current_msrp > 0);
    if (rows.length < 4) return { curve: [], points: [] };
    const xs = rows.map(r => Math.log(r.length_ft));
    const ys = rows.map(r => Math.log(r.current_msrp));
    const n = xs.length;
    const sx = xs.reduce((a,b)=>a+b,0), sy = ys.reduce((a,b)=>a+b,0);
    const sxx = xs.reduce((a,b)=>a+b*b,0), sxy = xs.reduce((a,b,i)=>a+b*ys[i],0);
    const beta = (n*sxy - sx*sy) / (n*sxx - sx*sx);
    const alpha = (sy - beta*sx) / n;
    const minL = Math.min(...rows.map(r=>r.length_ft));
    const maxL = Math.max(...rows.map(r=>r.length_ft));
    const curve = [];
    for (let i = 0; i <= 40; i++) {
      const l = minL * Math.pow(maxL/minL, i/40);
      curve.push({ len: l, price: Math.exp(alpha + beta*Math.log(l)) });
    }
    return {
      curve,
      points: rows.map(r => ({ len: r.length_ft, price: r.current_msrp, isThis: r.ipn_base === rec.ipn_base })),
    };
  }

  // ─── Default engine config ───────────────────────────────────
  const DEFAULT_CONFIG = {
    w_l2: 0.55,
    w_l3: 0.30,
    w_l4: 0.15,
    min_margin_pct: 0.30,
    action_threshold: 0.05,
    event_family_threshold: 0.05,
    event_sku_threshold: 0.15,
    velocity_mults: { ...VELOCITY_MULT },
    posture_mults: { ...POSTURE_MULT },
    postures: {},  // per-family override (empty by default)
    simulateEvent: false,
  };

  // ─── Audit log (in-memory) ───────────────────────────────────
  const AUDIT_SEED = [
    { ts: '2026-03-24 14:32', actor: 'system', type: 'engine_run', msg: 'Engine recompute v1.0 (config snapshot d4a9c1f)' },
    { ts: '2026-03-24 14:30', actor: 'system', type: 'engine_run', msg: 'Comp data refresh — 172 SKUs updated' },
    { ts: '2026-03-22 11:08', actor: 'louie', type: 'override', msg: 'Override set on PC6HMS50 → $28.00 — Strategic positioning' },
    { ts: '2026-03-10 09:15', actor: 'louie', type: 'approval', msg: 'Approved 14 Cat5e GAP_UP recommendations (avg +6.2%)' },
    { ts: '2026-02-12 16:40', actor: 'craig', type: 'override', msg: 'Override set on PC6ASLM10 → $5.99' },
    { ts: '2026-02-08 13:21', actor: 'system', type: 'engine_run', msg: 'Tariff event detected — Cat6A family locked for review' },
    { ts: '2026-01-02 11:00', actor: 'system', type: 'engine_run', msg: 'Quarterly recompute (Q1 2026)' },
  ];

  // ─── Expose ──────────────────────────────────────────────────
  const rawSkus = build();
  window.__skus = rawSkus;
  window.__overrides = {
    'PC6HMS50':  { value: 28.00, by: 'louie', reason: 'Strategic positioning', at: '2026-03-22' },
    'PC6ASLM10': { value: 5.99,  by: 'craig', reason: 'Customer commitment', at: '2026-02-12' },
    'PC6EZ7':    { value: 4.50,  by: 'louie', reason: 'Volume contract', at: '2026-01-18' },
    'PC8_5':     { value: 14.99, by: 'louie', reason: 'Strategic positioning', at: '2025-12-04' },
  };
  // make sure those override keys exist in the dataset (handle the PC8_5 anomaly)
  delete window.__overrides['PC8_5'];
  window.__overrides['PC85'] = { value: 14.99, by: 'louie', reason: 'Strategic positioning', at: '2025-12-04' };

  window.CK = {
    FAMILIES,
    COLOR_NAMES,
    COLOR_HEX,
    POSTURE_MULT,
    VELOCITY_MULT,
    DEFAULT_CONFIG,
    AUDIT_SEED,
    runEngine,
    compHistory,
    curvePoints,
    round2,
    seed,
  };
})();
