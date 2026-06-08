// engine.js — KPI calculation layer (framework §9). All figures derived; never stored.
// Reads the in-memory DB (window.STORE.DB). price(t) reads price_settings.
(function () {
  function DB() { return window.STORE.DB; }
  function CFG() { return window.STORE.DB.config; }
  function price(t) { const r = DB().price_settings.find(p => p.hw_type === t); return r ? +r.price : 0; }

  function periodOf(rec, periodType) {
    const d = rec.output_date ? new Date(rec.output_date) : window.WW.toDate(rec.workweek);
    if (periodType === 'weekly') return window.WW.fromDate(d);
    return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0');
  }
  function periodList(periodType, n, endKey) {
    if (periodType === 'weekly') {
      let i = window.ALL_WW.indexOf(endKey); if (i < 0) i = window.ALL_WW.length - 1;
      return window.ALL_WW.slice(Math.max(0, i - n + 1), i + 1);
    }
    const months = window.ALL_MONTHS;
    let j = months.indexOf(endKey); if (j < 0) j = months.length - 1;
    return months.slice(Math.max(0, j - n + 1), j + 1);
  }
  function periodLabel(periodType, key) {
    if (periodType === 'weekly') return key;
    const [y, m] = key.split('-'); return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m - 1] + ' ' + y.slice(2);
  }

  // ── Actuals ──
  function actualOutput(pt, pk, team) { return DB().output_records.filter(r =>
      periodOf(r, pt) === pk && (!team || team === 'ALL' || r.team === team)).reduce((s, r) => s + (r.qty || 1), 0); }
  function actualRevenue(pt, pk, team) { return DB().output_records.filter(r =>
      periodOf(r, pt) === pk && (!team || team === 'ALL' || r.team === team)).reduce((s, r) => s + (r.qty || 1) * price(r.hw_type), 0); }

  // ── Plan (budget / projected) ──
  function planOutput(pt, pk, plan, team) { return DB().output_targets.filter(t =>
      t.period_type === pt && t.period_key === pk && t.plan_type === plan &&
      (!team || team === 'ALL' || t.team === team || t.team === 'ALL')).reduce((s, t) => s + (+t.target_count || 0), 0); }
  function planRevenue(pt, pk, plan, team) { return DB().output_targets.filter(t =>
      t.period_type === pt && t.period_key === pk && t.plan_type === plan &&
      (!team || team === 'ALL' || t.team === team || t.team === 'ALL')).reduce((s, t) => s + (+t.target_count || 0) * price(t.hw_type), 0); }

  // ── Gaps ──
  function pct(gap, base) { return base ? (gap / base * 100).toFixed(1) + '%' : '—'; }
  function outputGap(pt, pk, plan, team) { return actualOutput(pt, pk, team) - planOutput(pt, pk, plan || 'budget', team); }
  function revenueGap(pt, pk, plan, team) { return actualRevenue(pt, pk, team) - planRevenue(pt, pk, plan || 'budget', team); }

  // ── Auto-projection (run-rate) ──
  function isElapsed(pt, key) { const today = new Date();
    const d = pt === 'weekly' ? window.WW.toDate(key) : new Date(key + '-01'); return d <= today; }
  function projectRunRate(pt, scopePeriods) {
    const done = scopePeriods.filter(p => isElapsed(pt, p));
    const a = done.reduce((s, p) => s + actualOutput(pt, p), 0);
    return done.length ? Math.round(a / done.length) : 0;
  }

  // ── WIP ──
  function wipAge(item) { const start = new Date(item.debug_start);
    const end = item.debug_end ? new Date(item.debug_end) : new Date();
    return isNaN(start) ? 0 : Math.max(0, Math.round((end - start) / 86400000)); }
  function activeWip() { const set = CFG().activeWipStatuses; return DB().wip_inventory.filter(w => set.includes(w.status)); }
  function agingBucket(age) { const b = CFG().agingBuckets; // [[0,3],[4,7],[8,14],[15,Infinity]]
    for (let i = 0; i < b.length; i++) if (age >= b[i][0] && age <= b[i][1]) return i; return b.length - 1; }

  // ── Manning ──
  function manning() { const teams = {}; DB().engineers.filter(e => !e.resigned).forEach(e => {
      teams[e.team] = teams[e.team] || { cur: 0, target: 0 }; teams[e.team].cur++; });
    (DB().manning_targets || []).forEach(m => { teams[m.team] = teams[m.team] || { cur: 0, target: 0 }; teams[m.team].target = m.target; });
    let sc = 0, st = 0; Object.values(teams).forEach(t => { sc += t.cur; st += t.target || 0; });
    return { teams, fill: st ? Math.round(sc / st * 100) : 0, cur: sc, target: st }; }

  // ── Competency ──
  function avgRating(empId) { const r = DB().platform_ratings.filter(p => p.engineer_id === empId);
    return r.length ? r.reduce((s, p) => s + (+p.rating || 0), 0) / r.length : 0; }
  function competencyIndex() { const act = DB().engineers.filter(e => !e.resigned);
    if (!act.length) return 0; const a = act.map(e => avgRating(e.id)); return a.reduce((x, y) => x + y, 0) / act.length; }

  // ── Trend series (anchor + modal) ──
  function buildSeries(pt, n, endKey, team) {
    var ek = endKey || window.STORE.state.periodKey;
    if (window.ENGINE && window.ENGINE.clampPeriod) ek = window.ENGINE.clampPeriod(pt, ek);
    var P = periodList(pt, n, ek);
    return { periods: P, labels: P.map(k => periodLabel(pt, k)),
      outActual: P.map(k => actualOutput(pt, k, team)), outProj: P.map(k => planOutput(pt, k, 'projected', team)), outBudget: P.map(k => planOutput(pt, k, 'budget', team)),
      revActual: P.map(k => actualRevenue(pt, k, team)), revProj: P.map(k => planRevenue(pt, k, 'projected', team)), revBudget: P.map(k => planRevenue(pt, k, 'budget', team)) }; }

  window.ENGINE = { price, periodOf, periodList, periodLabel, actualOutput, actualRevenue,
    planOutput, planRevenue, pct, outputGap, revenueGap, projectRunRate, wipAge, activeWip,
    agingBucket, manning, avgRating, competencyIndex, buildSeries };
  if (typeof module !== 'undefined') module.exports = window.ENGINE;
})();

// ── WIP-over-time + snapshot helpers (appended) ──
(function () { const E = window.ENGINE;
  function overlapWW(item, ww) { const ws = window.WW.toDate(ww).getTime(); const we = ws + 7 * 86400000;
    const s = new Date(item.debug_start).getTime(); const e = item.debug_end ? new Date(item.debug_end).getTime() : Date.now();
    return !isNaN(s) && s <= we && e >= ws; }
  E.currentWW = function () { return window.WW.fromDate(new Date()); };
  E.currentPeriod = function (pt) { var d = new Date();
    return pt === 'weekly' ? window.WW.fromDate(d) : (d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0')); };
  E.clampPeriod = function (pt, key) { if (!key) return key; var cur = E.currentPeriod(pt);
    if (pt === 'weekly') { var a = window.ALL_WW.indexOf(key), b = window.ALL_WW.indexOf(cur); if (a < 0 || b < 0) return key; return a > b ? cur : key; }
    return key > cur ? cur : key; };
  E.wipActiveDuringWW = function (ww) { return window.STORE.DB.wip_inventory.filter(w => overlapWW(w, ww)); };
  E.wipTrend = function (n, endWW) { const all = window.ALL_WW; const end = endWW || E.currentWW();
    let i = all.indexOf(end); if (i < 0) i = all.length - 1; const periods = all.slice(Math.max(0, i - n + 1), i + 1);
    const snaps = window.STORE.DB.wip_snapshots || []; const cfg = window.STORE.DB.config;
    const totals = [], aged = [], hasSnap = [];
    periods.forEach(ww => { const snap = snaps.find(s => s.period_key === ww);
      if (snap) { totals.push(snap.total_active); aged.push(snap.aged || 0); hasSnap.push(true); }
      else { const items = E.wipActiveDuringWW(ww); totals.push(items.length); hasSnap.push(false);
        const we = window.WW.toDate(ww).getTime() + 7 * 86400000;
        aged.push(items.filter(w => (we - new Date(w.debug_start).getTime()) / 86400000 >= cfg.agingFlagDays).length); } });
    return { periods, labels: periods, totals, aged, hasSnap }; };
  E.snapshotNow = function () { const active = E.activeWip(); const cfg = window.STORE.DB.config;
    const by = f => { const o = {}; active.forEach(w => { const k = f(w) || '—'; o[k] = (o[k] || 0) + 1; }); return o; };
    return { id: E.currentWW(), period_key: E.currentWW(), snapped_at: new Date().toISOString(),
      total_active: active.length, aged: active.filter(w => E.wipAge(w) >= cfg.agingFlagDays).length,
      by_status: by(w => w.status), by_tester: by(w => w.tx_category), by_hwtype: by(w => w.hw_type), by_team: by(w => w.team) }; };
})();
