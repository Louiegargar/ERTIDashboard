// seed.js — populate DB from real ERTI data on first run (no localStorage yet).
// Roster: framework Appendix B (+ Mariel Perea 1702788, who appears in output data — see README open item).
// Output/WIP: real Sheet 5 subset. Prices/targets/manning are PLACEHOLDERS to replace (flagged).
(function () {
  const S = window.STORE, DB = S.DB, WW = window.WW;
  if (S.loadLocal()) { S.bump(); return; }            // already have data

  // ── Roster (Appendix B + Mariel) ── [id,last,first,pos,team,hired,status]
  const R = [
    [1702788, 'Perea', 'Mariel', 'Engineer2', 'F2-LTX', '2018-06-20', 'Regular'],
    [2200007, 'Lomeda Jr.', 'Junolito Soliman', 'Engineer1', 'F2-ETS', '2022-02-15', 'Regular'],
    [2200020, 'Vitto', 'Jaylord Pineda', 'Technician3', 'F2-ETS', '2022-03-01', 'Regular'],
    [2400025, 'Balmaceda', 'Patrick', 'Engineer1', 'F2-LTX', '2024-09-17', 'Regular'],
    [2400029, 'Ruiz', 'Tisha Marie', 'Technician3', 'F2-LTX', '2024-10-03', 'Regular'],
    [2400032, 'Garin', 'Alvin', 'Engineer1', 'F2-LTX', '2024-10-17', 'Regular'],
    [2400036, 'Gargar', 'Louie', 'Engineer2', 'F2-LTX', '2024-11-12', 'Regular'],   // E4: F2-LTX pending confirm
    [2500060, 'Gloriani', 'Aaron Mathew Panganiban', 'Technician3', 'F2-ETS', '2025-08-12', 'Regular'],
    [2500075, 'Buenaflor', 'Felix Timothy Pano', 'Engineer1', 'F2-ETS', '2025-09-18', 'Regular'],
    [2600007, 'Sacala', 'Rhen John Rey', 'Engineer1', 'F2-LTX', '2026-01-22', 'PROBI'],
    [2600017, 'De Jesus', 'Raven Espedido', 'Engineer1', 'F2-LTX', '2026-03-26', 'PROBI'],
    [2600024, 'Acido', 'Noimie Vidallon', 'Engineer1', 'F2-LTX', '2026-04-28', 'PROBI']
  ];
  DB.engineers = R.map(r => ({ id: r[0], no: String(r[0]), last: r[1], first: r[2],
    name: r[1] + ', ' + r[2], pos: r[3], team: r[4], hired: r[5], resigned: null, status: r[6] }));
  const byTeam = {}; DB.engineers.forEach(e => byTeam[e.id] = e.team);

  // ── Price book (PLACEHOLDER ₱ — replace on Revenue tab) ──
  DB.price_settings = [
    { hw_type: 'Testcard', price: 8000, placeholder: true },
    { hw_type: 'Faceplate', price: 5000, placeholder: true },
    { hw_type: 'Perfboard', price: 12000, placeholder: true },
    { hw_type: 'Handler/Ins', price: 6000, placeholder: true },
    { hw_type: 'Other', price: 4000, placeholder: true }
  ];
  function fold(t) { t = (t || '').toUpperCase();
    if (t.indexOf('TESTCARD') >= 0) return 'Testcard';
    if (t.indexOf('FACEPLATE') >= 0 || t.indexOf('FPLATE') >= 0) return 'Faceplate';
    if (t.indexOf('PERF') >= 0) return 'Perfboard';
    if (t.indexOf('HNDL') >= 0 || t.indexOf('INSERT') >= 0 || t.indexOf('HI') >= 0 || t.indexOf('H/HT') >= 0 || t.indexOf('HT') >= 0) return 'Handler/Ins';
    return 'Other'; }
  const ALIAS = { MARIEL: 1702788, JAYLORD: 2200020, PATRICK: 2400025, PAT: 2400025, TISHA: 2400029, TISH: 2400029,
    ALVIN: 2400032, LOUIE: 2400036, LOYUIE: 2400036, FELIX: 2500075, JUNO: 2200007, JUNOLITO: 2200007, AERON: 2500060, AARON: 2500060 };

  // ── Output records (real Sheet 5 subset) ── [instanceId, rawType, ww, owner, status]
  const O = [
    ['L96458002','TESTCARD',2542,'LOUIE','RELEASED'],['L73335003','FACEPLATE',2539,'LOUIE','RELEASED'],
    ['L07892009','TESTCARD',2541,'JUNO/LOUIE','RELEASED'],['L05008007','TESTCARD',2533,'ALVIN/PATRICK/LOUIE','RELEASED'],
    ['L96671001','TESTCARD',2516,'LOUIE','RELEASED'],['L01182005','TESTCARD',2514,'LOUIE','RELEASED'],
    ['L03670003','TESTCARD',2545,'LOUIE','RELEASED'],['L08195006','TESTCARD',2439,'LOUIE','RELEASED'],
    ['L04338004','FACEPLATE',2435,'LOUIE','RELEASED'],['L10274001','FACEPLATE',2451,'TISHA','RELEASED'],
    ['L09382003','FACEPLATE',2506,'TISHA','RELEASED'],['L09106003','TESTCARD',2514,'TISHA','RELEASED'],
    ['L08768003','TESTCARD',2537,'TISHA','RELEASED'],['L07857004','FACEPLATE',2542,'TISHA','RELEASED'],
    ['L03919007','TESTCARD',2545,'TISHA','RELEASED'],['L02548004','FACEPLATE',2529,'TISHA','RELEASED'],
    ['L06743003','FACEPLATE',2536,'ALVIN','RELEASED'],['L02626004','FACEPLATE',2537,'ALVIN','RELEASED'],
    ['L93593005','TESTCARD',2541,'ALVIN','RELEASED'],['L09162008','FACEPLATE',2540,'ALVIN','RELEASED'],
    ['L01177007','TESTCARD',2530,'ALVIN','RELEASED'],['L07119008','TESTCARD',2501,'PATRICK','RELEASED'],
    ['L08015007','TESTCARD',2515,'PATRICK','RELEASED'],['L74444003','FACEPLATE',2537,'PATRICK','RELEASED'],
    ['L08392005','FACEPLATE',2542,'PATRICK','RELEASED'],['L09186009','TESTCARD',2543,'PATRICK','RELEASED'],
    ['L02129006','TESTCARD',2539,'PATRICK','RELEASED'],['L08974003','FPLATE',2547,'JAYLORD','RELEASED'],
    ['L07925003','FACEPLATE',2541,'JAYLORD/TISHA','RELEASED'],['L63945002','FACEPLATE',2517,'JAYLORD','RELEASED'],
    ['L62846004','FACEPLATE',2523,'JAYLORD','RELEASED'],['L04115010','FACEPLATE',2540,'RICA/JAYLORD','RELEASED'],
    ['L93593004','TESTCARD',2536,'JUNO','RELEASED'],['L10556014','TESTCARD',2532,'JUNO','RELEASED'],
    ['L04919003','FACEPLATE',2543,'JUNO','RELEASED'],['L75946003','FACEPLATE',2541,'JUNO','RELEASED'],
    ['L81231003','FACEPLATE',2539,'JUNO','RELEASED'],['L07014003','HI/HT',2542,'JUNO','RELEASED'],
    ['L08964004','HI/HT',2536,'MARIEL','RELEASED'],['L06710003','HI/HT',2537,'MARIEL','RELEASED'],
    ['L74784012','HNDLINSRT',2542,'MARIEL','RELEASED'],['L66957005','HT/INSERT',2539,'MARIEL','RELEASED'],
    ['L72446016','PERFBOARD',2610,'FELIX','RELEASED'],['L64429013','PERFBOARD',2605,'JUNO/JAYLORD/AERON','RELEASED'],
    ['L65076003','PERFBOARD',2603,'AERON/JUNO/JAYLORD','RELEASED'],['L72446018','PERFBOARD',2610,'AERON','RELEASED']
  ];
  DB.output_records = O.map(o => { const owners = o[3].split('/').map(s => s.trim());
    const idTok = owners.map(t => ALIAS[t.toUpperCase()]).find(Boolean) || null;
    const ww = 'WW' + o[2]; const d = WW.toDate(ww);
    return { id: o[0], hardware_id: o[0], hw_type: fold(o[1]), activity_category: 'New Debug',
      workweek: ww, output_date: d.toISOString().slice(0, 10), engineer_id: idTok,
      team: idTok ? byTeam[idTok] : 'F2-LTX', qty: 1, _owners: o[3] }; });

  // ── WIP inventory (real boards still in debug: PEA/PM from Sheet 5) ──
  const W = [
    ['L05008010','TESTCARD',2534,'LTX','In Debug','ALVIN/PATRICK/LOUIE'],
    ['L98482002','TESTCARD',2523,'LTX','On Hold','ALVIN'],
    ['L09034023','TESTCARD',2528,'LTX','In Debug',''],
    ['L64001007','TESTCARD',2531,'LTX','Awaiting Parts',''],
    ['L06210003','HI/HT',2420,'ETS','In Debug',''],
    ['L02624003','FACEPLATE',2424,'ETS','Queued','']
  ];
  DB.wip_inventory = W.map(w => { const owners = w[5].split('/').map(s => s.trim());
    const idTok = owners.map(t => ALIAS[t.toUpperCase()]).find(Boolean) || null;
    const start = WW.toDate('WW' + w[2]);
    return { id: w[0], hardware_id: w[0], hw_type: fold(w[1]), tx_category: w[3], status: w[4],
      debug_start: start.toISOString().slice(0, 10), debug_end: null, engineer_id: idTok,
      team: idTok ? byTeam[idTok] : (w[3] === 'ETS' ? 'F2-ETS' : 'F2-LTX'), notes: '' }; });

  // ── Output targets (SAMPLE budget + projected) ──
  const months = ['2025-07', '2025-08', '2025-09', '2026-01'];
  const tgtBudget = { Testcard: 6, Faceplate: 5, Perfboard: 2, 'Handler/Ins': 2, Other: 1 };
  const tgtProj = { Testcard: 7, Faceplate: 5, Perfboard: 3, 'Handler/Ins': 2, Other: 1 };
  DB.output_targets = [];
  months.forEach(mk => { Object.keys(tgtBudget).forEach(hw => {
    DB.output_targets.push({ id: 'b-' + mk + '-' + hw, period_type: 'monthly', period_key: mk, plan_type: 'budget', hw_type: hw, team: 'ALL', target_count: tgtBudget[hw] });
    DB.output_targets.push({ id: 'p-' + mk + '-' + hw, period_type: 'monthly', period_key: mk, plan_type: 'projected', hw_type: hw, team: 'ALL', target_count: tgtProj[hw] });
  }); });

  // ── Team budgets (PLACEHOLDER ₱) ──
  DB.team_budgets = [{ team: 'F2-LTX', budget: 400000, forecast: 380000 }, { team: 'F2-ETS', budget: 300000, forecast: 320000 }];
  // ── Manning targets (PLACEHOLDER) ──
  DB.manning_targets = [{ team: 'F2-LTX', target: 8 }, { team: 'F2-ETS', target: 6 }];

  // ── Platform ratings: experience index (0-3) derived from real output volume per tester family ──
  const PLAT = ['Testcard', 'Faceplate', 'Perfboard', 'Handler/Ins'];
  const counts = {}; DB.output_records.forEach(r => { if (!r.engineer_id) return;
    counts[r.engineer_id] = counts[r.engineer_id] || {}; counts[r.engineer_id][r.hw_type] = (counts[r.engineer_id][r.hw_type] || 0) + 1; });
  DB.platform_ratings = []; DB.engineers.forEach(e => { PLAT.forEach(pl => {
    const c = (counts[e.id] && counts[e.id][pl]) || 0; const rating = c === 0 ? 0 : c <= 1 ? 1 : c <= 3 ? 2 : 3;
    DB.platform_ratings.push({ engineer_id: e.id, platform: pl, rating }); }); });
  DB.PLAT = PLAT;

  // ── Schedule (14-day window 16–29 Jun 2026, real) ──
  const SCHED = { 1702788:['','','NT','NT','NT','NT','NT','','','','DS','DS','DS','DS'],
    2400032:['NS','','','DS','DS','NS','NS','NS','','','DS','DS','NS','NS'], 2400025:['','DS','DS','NS','NS','','','','DS','DS','NS','NS','',''],
    2400029:['DS','NS','NS','','','DS','DS','DS','NS','NS','','','DS','DS'], 2600007:['','','DS','DS','NS','NS','','','','DS','DS','NS','NS',''],
    2600017:['','','','DS','DS','DS','DS','','','','DS','DS','DS','DS'], 2600024:['','','DS','DS','DS','DS','','','','DS','DS','DS','DS',''],
    2400036:['','','NT','NT','NT','NT','NT','','','NT','NT','NT','NT','NT'], 2500060:['','DS','DS','NS','NS','','','DS','','DS','NS','NS','',''],
    2200007:['','','','DS','DS','NS','NS','','','','DS','DS','NS','NS'], 2200020:['NS','','','','DS','DS','NS','NS','','','','DS','DS','NS'],
    2500075:['DS','DS','NS','','','','DS','DS','DS','NS','','','','DS'] };
  DB.schedule_entries = [];
  Object.keys(SCHED).forEach(id => SCHED[id].forEach((code, i) => { if (!code) return;
    const day = String(16 + i).padStart(2, '0'); const date = '2026-06-' + (16 + i > 30 ? String(16 + i - 30).padStart(2, '0') : day);
    DB.schedule_entries.push({ engineer_id: +id, schedule_date: '2026-06-' + day, code: code }); }));

  S.saveLocal(); S.bump();
})();
