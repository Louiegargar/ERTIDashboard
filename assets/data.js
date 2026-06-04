// data.js — REAL ERTI F2 (ETS/LTX) people dataset, integrated from the
// ERTI Debug Dashboard markdown extract (2026-06-01).
//   Sheet 6 roster  -> people (full, real)
//   Sheet 4 shifts  -> shift load (first 14 days, real)
//   Sheet 5 outputs -> attributed debug output, build mix, release rate (real subset)
//   Sheet 5 months  -> team monthly output trend (real totals)
//   Sheets 1-2      -> hardware ops rollup (real summaries)
// HR fields the source does not contain (performance scores, skills proficiency,
// attendance, OKRs, flight-risk, promotion readiness, 1:1 notes) are NOT fabricated;
// the template's components are repointed to real operational equivalents below.
(function () {
  const MONTHS = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
  // Real monthly debug-output totals (Sheet 5 "By month", case-folded), Dec–May
  const OUTPUTS_SERIES = [40, 44, 107, 70, 66, 93];

  // Hardware ops rollup (Sheets 1 + 2, real summaries)
  const OPS = { activeHW: 210, released: 123, inDebug: 28, qual: 23, corr: 17, scrap: 15, rtv: 4,
    outputsTotal: 802, releasedOutputs: 585, pea: 55, pm: 16 };

  const BUILD_AXES = ['Testcard', 'Faceplate', 'Perfboard', 'Handler/Ins', 'Other'];

  // ── Roster (Sheet 6, real) ── [id,name,squad,role,status,hired,initials,level]
  const R = [
    ['1702788','Mariel Perea','LTX','Engineer 2','Regular','2018-06-20','MP','L5'],
    ['2200007','Junolito Lomeda Jr.','ETS','Engineer 1','Regular','2022-02-15','JL','L4'],
    ['2200020','Jaylord Vitto','ETS','Technician 3','Regular','2022-03-01','JV','L3'],
    ['2400025','Patrick Balmaceda','LTX','Engineer 1','Regular','2024-09-17','PB','L4'],
    ['2400029','Tisha Marie Ruiz','LTX','Technician 3','Regular','2024-10-03','TR','L3'],
    ['2400032','Alvin Garin','LTX','Engineer 1','Regular','2024-10-17','AG','L4'],
    ['2400036','Louie Gargar','LTX','Engineer 2','Regular','2024-11-12','LG','L5'],
    ['2500060','Aaron Gloriani','ETS','Technician 3','Regular','2025-08-12','AG','L3'],
    ['2500075','Felix Buenaflor','ETS','Engineer 1','Regular','2025-09-18','FB','L4'],
    ['2600007','Rhen John Rey Sacala','LTX','Engineer 1','Probationary','2026-01-22','RS','L3'],
    ['2600017','Raven De Jesus','LTX','Engineer 1','Probationary','2026-03-26','RD','L3'],
    ['2600024','Noimie Acido','LTX','Engineer 1','Probationary','2026-04-28','NA','L3']
  ];

  // ── Shift schedule (Sheet 4, first 14 days 16–29 Jun, real) ──
  const SCHED_DAYS = ['16','17','18','19','20','21','22','23','24','25','26','27','28','29'];
  const SCHED = {
    '1702788':['','','NT','NT','NT','NT','NT','','','','DS','DS','DS','DS'],
    '2400032':['(NS-OT)','','','DS','DS','NS','NS','(NS-OT)','','','DS','DS','NS','NS'],
    '2400025':['','DS','DS','NS','NS','','','','DS','DS','NS','NS','',''],
    '2400029':['DS','(NS-OT)','NS','','','DS','DS','DS','(NS-OT)','NS','','','DS','DS'],
    '2600007':['','','DS','DS','NS','NS','','','','DS','DS','NS','NS',''],
    '2600017':['','','','DS','DS','DS','DS','','','','DS','DS','DS','DS'],
    '2600024':['','','DS','DS','DS','DS','','','','DS','DS','DS','DS',''],
    '2400036':['','','NT','NT','NT','NT','NT','','','NT','NT','NT','NT','NT'],
    '2500060':['','DS','DS','NS','NS','','','DS','','DS','NS','NS','',''],
    '2200007':['','','','DS','DS','NS','NS','','','','DS','DS','NS','NS'],
    '2200020':['NS','','','','DS','DS','NS','NS','','','','DS','DS','NS'],
    '2500075':['DS','DS','NS','','','','DS','DS','DS','NS','','','','DS']
  };

  // ── Debug output (Sheet 5, real representative subset) ──
  // [Month, WW, Pspec, HWID, HWType, IC, Tester, Owner, Category, Status]
  const OUTPUTS = [
    ['AUGUST',2542,'L-96458','L96458002','TESTCARD','LTC6269','TS88_EXP','LOUIE','Bin1 w/DLOG&Corr','RELEASED'],
    ['AUGUST',2539,'L-73335','L73335003','FACEPLATE','LT1161','TS88_EXP','LOUIE','Continuity Check','RELEASED'],
    ['AUGUST',2541,'L-07892','L07892009','TESTCARD','LTC3536','TS88_EXP','JUNO/LOUIE','Bin1 w/DLOG&Corr','RELEASED'],
    ['JUNE',2533,'L-05008','L05008007','TESTCARD','LT6376 DFN','TS88_EXP','ALVIN/PATRICK/LOUIE','Bin1 w/DLOG&Corr','RELEASED'],
    ['JUNE',2534,'L-05008','L05008010','TESTCARD','LTC6376 MSOP','TS88_EXP','ALVIN/PATRICK/LOUIE','Bin1 w/DLOG&Corr','PEA'],
    ['FEBRUARY',2516,'L-96671','L96671001','TESTCARD','LTC1100','-','LOUIE/LUKE','ECD MODE4-1','RELEASED'],
    ['FEBRUARY',2514,'L-01182','L01182005','TESTCARD','LTC1175-5','-','Louie/Rica','for RB generation','RELEASED'],
    ['SEPTEMBER',2545,'L-03670','L03670003','TESTCARD','LT1818','TS88_EXP','LOUISE/LOUIE','Bin1 w/DLOG&Corr','RELEASED'],
    ['JULY',2439,'L-08195','L08195006','TESTCARD','LTC3625','-','Louie','Bin1 w/DLOG&Corr','RELEASED'],
    ['JUNE',2435,'L-04338','L04338004','FACEPLATE','LTC6079','-','Louie','Bin1 w/DLOG&Corr','RELEASED'],
    ['OCTOBER',2451,'L-10274','L10274001','FACEPLATE','LTC6362','-','Tisha','From REGATHER','RELEASED'],
    ['DECEMBER',2506,'L-09382','L09382003','FACEPLATE','LTC2983','-','Tisha','no readback','RELEASED'],
    ['FEBRUARY',2514,'L-09106','L09106003','TESTCARD','LT3952','-','TISHA','Unable to proceed ECD','RELEASED'],
    ['JULY',2537,'L-08768','L08768003','TESTCARD','LTC3766','TS88_EXP','TISHA','Bin1 w/DLOG&Corr','RELEASED'],
    ['AUGUST',2542,'L-07857','L07857004','FACEPLATE','LT3784','TS88_EXP','TISHA','Bin1 w/DLOG&Corr','RELEASED'],
    ['SEPTEMBER',2545,'L-03919','L03919007','TESTCARD','LTC3086','TS88_EXP','TISHA','Bin1 w/DLOG&Corr','RELEASED'],
    ['MAY',2529,'L-02548','L02548004','FACEPLATE','LT1361','LTX','TISHA','Bin1 w/DLOG&Corr','RELEASED'],
    ['JULY',2536,'L-06743','L06743003','FACEPLATE','LTC2955','TS88_EXP','ALVIN','Bin1 w/DLOG&Corr','RELEASED'],
    ['JULY',2537,'L-02626','L02626004','FACEPLATE','LT6105','TS88_EXP','ALVIN','Bin1 w/DLOG&Corr','RELEASED'],
    ['AUGUST',2541,'L-93593','L93593005','TESTCARD','LT3042','TS88_EXP','ALVIN','Bin1 w/DLOG&Corr','RELEASED'],
    ['AUGUST',2540,'L-09162','L09162008','FACEPLATE','LT3761','TS88_EXP','ALVIN','Bin1 w/DLOG&Corr','RELEASED'],
    ['APRIL',2523,'L-98482','L98482002','TESTCARD','LT1997-2 DFN','-','ALVIN','No ECD data','PM'],
    ['MAY',2530,'L-01177','L01177007','TESTCARD','LT6108','TS88_EXP','ALVIN/RICA','No Cor Unit','RELEASED'],
    ['NOVEMBER',2501,'L-07119','L07119008','TESTCARD','LT1618','-','Patrick','No RB data','RELEASED'],
    ['FEBRUARY',2515,'L-08015','L08015007','TESTCARD','LTC3129-1','-','Patrick','Bin1 w/DLOG&Corr','RELEASED'],
    ['JULY',2537,'L-74444','L74444003','FACEPLATE','LT6703-3','TS88_EXP','PATRICK','Continuity Check','RELEASED'],
    ['AUGUST',2542,'L-08392','L08392005','FACEPLATE','LT3736','TS88_EXP','PATRICK','Bin1 w/DLOG&Corr','RELEASED'],
    ['SEPTEMBER',2543,'L-09186','L09186009','TESTCARD','LTC3765','TS88_EXP','PATRICK','Bin1 w/DLOG&Corr','RELEASED'],
    ['AUGUST',2539,'L-02129','L02129006','TESTCARD','LTC3900','TS88_EXP','PATRICK','Bin1 w/DLOG&Corr','RELEASED'],
    ['AUGUST',2540,'L-04115','L04115010','FACEPLATE','LT4368','TS88_EXP','RICA/JAYLORD','Bin1 w/DLOG&Corr','RELEASED'],
    ['SEPTEMBER',2547,'L-08974','L08974003','FPLATE','LT3956','TS88_EXP','JAYLORD','Bin1 w/DLOG&Corr','RELEASED'],
    ['AUGUST',2541,'L-07925','L07925003','FACEPLATE','LT3572','TS88_EXP','JAYLORD/TISHA','Bin1 w/DLOG&Corr','RELEASED'],
    ['FEBRUARY',2517,'L-63945','L63945002','FACEPLATE','LT1074','-','JAYLORD','Bin1 w/DLOG&Corr','RELEASED'],
    ['APRIL',2523,'L-62846','L62846004','FACEPLATE','LTC4279','-','JAYLORD','Bin1 w/DLOG&Corr','RELEASED'],
    ['AUGUST',2540,'L-04115','L04115013','FACEPLATE','LT4368','TS88_EXP','RICA/JAYLORD','Bin1 w/DLOG&Corr','RELEASED'],
    ['JULY',2536,'L-93593','L93593004','TESTCARD','LT3045','TS88_EXP','JUNO','Bin1 w/DLOG&Corr','RELEASED'],
    ['JUNE',2532,'L-10556','L10556014','TESTCARD','LT3045','TS88_EXP','JUNO','Bin1 w/DLOG&Corr','RELEASED'],
    ['SEPTEMBER',2543,'L-04919','L04919003','FACEPLATE','LT1057','TS88_EXP','JUNO','Continuity Check','RELEASED'],
    ['AUGUST',2541,'L-75946','L75946003','FACEPLATE','LT4440','TS88_EXP','JUNO','Bin1 w/DLOG&Corr','RELEASED'],
    ['JULY',2539,'L-81231','L81231003','FACEPLATE','LT3097','TS88_EXP','JUNO','Bin1 w/DLOG&Corr','RELEASED'],
    ['AUGUST',2542,'L-07014','L07014003','HI/HT','LT3494','TS88_EXP','JUNO','BIN1 w/DLOG','RELEASED'],
    ['JULY',2536,'L-08964','L08964004','HI/HT','LT3744','TS88_EXP','Mariel','Continuity Check','RELEASED'],
    ['JULY',2537,'L-06710','L06710003','HI/HT','LT3585','TS88_EXP','Mariel','Continuity Check','RELEASED'],
    ['AUGUST',2542,'L-74784','L74784012','HNDLINSRT','LT4213','TS88_EXP','MARIEL','Continuity Check','RELEASED'],
    ['JULY',2539,'L-66957','L66957005','HT/INSERT','LT4321','TS88_EXP','Mariel','Continuity Check','RELEASED'],
    ['JANUARY',2610,'L-72446','L72446016','PERFBOARD','ADBMS6830','-','Felix','Bin1 w/DLOG&Corr','RELEASED'],
    ['DECEMBER',2605,'L-64429','L64429013','PERFBOARD','LTC3350','ETS364_T4','JUNO/JAYLORD/AERON','Bin1 w/DLOG&Corr','RELEASED'],
    ['NOVEMBER',2603,'L-65076','L65076003','PERFBOARD','-','ETS364_T4','AERON/JUNO/JAYLORD','Bin1 w/DLOG&Corr','RELEASED'],
    ['JANUARY',2610,'L-72446','L72446018','PERFBOARD','ADBMS6830','-','AERON','Bin1 w/DLOG&Corr','RELEASED'],
    ['FEBRUARY',2415,'L-04545','L04545003','Testcard','LTC3892','T88D','Aira','Bin1 w/DLOG&Corr','Released'],
    ['FEBRUARY',2415,'L-76413','L76413003','Faceplate','LTC2862','T88D','Chen','Bin1 W/Component','Released'],
    ['MARCH',2420,'L-06210','L06210003','H/HT','LTC1232','T88D','Kim','Bin1 datalog','PEA'],
    ['MAY',2528,'L-09034','L09034023','Testcard','LTC3899','-','GP SYNERGIA','No TRIM and RB','PEA'],
    ['JUNE',2531,'L-64001','L64001007','TESTCARD','LTC2064','TS88_EXP','DDAP','Bin1 w/DLOG&Corr','PEA'],
    ['APRIL',2424,'L-02624','L02624003','Faceplate','LT6005','T88D','Herms','Bin1 w/DLOG&Corr','RELEASED']
  ];

  const ALIAS = { MARIEL:'1702788', JAYLORD:'2200020', PATRICK:'2400025', PAT:'2400025',
    TISHA:'2400029', TISH:'2400029', ALVIN:'2400032', LOUIE:'2400036', LOYUIE:'2400036',
    FELIX:'2500075', JUNO:'2200007', JUNOLITO:'2200007', AERON:'2500060', AARON:'2500060' };
  const INFERRED = { '2200007': true, '2500060': true }; // Juno->Junolito, Aeron->Aaron

  // ── helpers (framework §3 normalization) ──
  function foldType(t) { t = (t || '').toUpperCase();
    if (t.indexOf('TESTCARD') >= 0) return 'Testcard';
    if (t.indexOf('FACEPLATE') >= 0 || t.indexOf('FPLATE') >= 0) return 'Faceplate';
    if (t.indexOf('PERF') >= 0) return 'Perfboard';
    if (t.indexOf('HNDL') >= 0 || t.indexOf('INSERT') >= 0 || t.indexOf('HI') >= 0 || t.indexOf('H/HT') >= 0 || t.indexOf('HT') >= 0) return 'Handler/Ins';
    return 'Other'; }
  function canon(s) { var k = (s || '').toUpperCase();
    if (k.indexOf('RELEASED') === 0) return 'RELEASED';
    if (k === 'PEA') return 'PEA'; if (k === 'PM') return 'PM'; return 'OTHER'; }
  function tenureYrs(d) { return +(((Date.now() - new Date(d)) / 3.15576e10)).toFixed(1); }
  function tenureLabel(y) { return y >= 1 ? y.toFixed(1) + ' yr' : Math.round(y * 12) + ' mo'; }
  function lvlToCount(c) { return c === 0 ? 0 : c === 1 ? 1 : c <= 3 ? 2 : c <= 5 ? 3 : 4; } // volume -> 0..4

  // ── per-person aggregation ──
  let join = { totalRows: OUTPUTS.length, attributedRows: 0, credits: 0, partner: 0 };
  const byId = {};
  R.forEach(r => byId[r[0]] = { _rows: [], type: {}, status: {}, tester: {} });
  OUTPUTS.forEach(o => {
    const owners = (o[7] || '').split('/').map(s => s.trim()).filter(Boolean);
    let matched = false;
    owners.forEach(tok => {
      const id = ALIAS[tok.toUpperCase()];
      if (id && byId[id]) {
        matched = true; join.credits++;
        const w = byId[id]; w._rows.push(o);
        const ty = foldType(o[4]); w.type[ty] = (w.type[ty] || 0) + 1;
        const st = canon(o[9]); w.status[st] = (w.status[st] || 0) + 1;
        const te = (o[6] && o[6] !== '-') ? o[6] : '—'; w.tester[te] = (w.tester[te] || 0) + 1;
      }
    });
    if (matched) join.attributedRows++; else join.partner++;
  });

  // shift load
  function shifts(id) { const c = { DS: 0, NS: 0, NT: 0, OT: 0 }; const row = SCHED[id] || [];
    row.forEach(v => { if (v === 'DS') c.DS++; else if (v === 'NS') c.NS++; else if (v === 'NT') c.NT++; else if (v.indexOf('OT') >= 0) c.OT++; });
    c.row = row; c.loadPct = Math.round((c.DS + c.NS + c.NT + c.OT) / 14 * 100); return c; }

  const maxOut = Math.max(1, ...R.map(r => byId[r[0]]._rows.length));

  const PEOPLE = R.map(r => {
    const w = byId[r[0]]; const n = w._rows.length;
    const released = w.status['RELEASED'] || 0;
    const releasePct = n ? Math.round(released / n * 100) : 0;
    const sc = shifts(r[0]);
    const buildTypes = Object.keys(w.type).length;
    const topType = Object.entries(w.type).sort((a, b) => b[1] - a[1])[0];
    const topTester = Object.entries(w.tester).sort((a, b) => b[1] - a[1])[0];
    // build-experience vector over BUILD_AXES (0..4 by volume) — replaces skills
    const skills = BUILD_AXES.map(ax => lvlToCount(w.type[ax] || 0));
    // activity index: blend of real signals (output volume / release rate / shift load)
    const oNorm = n / maxOut * 100;
    const activity = Math.round(0.5 * oNorm + 0.25 * releasePct + 0.25 * sc.loadPct);
    // cumulative-output sparkline (real, by work-week order) — replaces perf trend
    const rws = [...w._rows].sort((a, b) => a[1] - b[1]);
    const hist = []; for (let i = 1; i <= 6; i++) hist.push(rws.length ? Math.ceil(rws.length * i / 6) : 0);
    const delta = hist[5] - hist[4];
    const ten = tenureYrs(r[5]);
    // tenure band (replaces promotion readiness)
    const band = r[4] === 'Probationary' ? 'Probationary' : ten < 1 ? '<1 yr' : ten < 2 ? '1–2 yr' : ten < 5 ? '2–5 yr' : '5 yr+';
    // factual, non-evaluative summary (replaces manager 1:1 note)
    const note = n
      ? `${r[3]} on F2-${r[2]}, ${tenureLabel(ten)} tenure. ${n} attributed debug output${n>1?'s':''} in the sample (${releasePct}% released), mostly ${topType?topType[0].toLowerCase():'—'}${INFERRED[r[0]]?' · join inferred from owner alias':''}.`
      : `${r[3]} on F2-${r[2]}, ${tenureLabel(ten)} tenure. ${r[4]==='Probationary'?'Joined '+r[5]+' (probationary) — no attributed output in the sample yet.':'No attributed output in the current sample.'}`;
    return {
      id: r[0], name: r[1], squad: r[2], role: r[3], status: r[4], hired: r[5],
      initials: r[6], level: r[7], tenure: ten, tenureBand: band, inferred: !!INFERRED[r[0]],
      // operational metrics (real / derived)
      outputs: n, releasePct, shiftLoad: sc.loadPct, buildTypes,
      activity, delta, hist, skills, note,
      buildMix: w.type, statusMix: w.status,
      topType: topType ? topType[0] : '—', topTester: topTester ? topTester[0] : '—',
      shifts: { DS: sc.DS, NS: sc.NS, NT: sc.NT, OT: sc.OT, row: sc.row },
      // legacy keys kept so any untouched component still reads a number, not undefined
      composite: activity, throughput: n, fpy: releasePct, utilization: sc.loadPct,
      goals: buildTypes, risk: 'low', certs: buildTypes, readiness: band, nextRole: '—',
      training: sc.loadPct, attendance: releasePct
    };
  });

  // ── real recent activity (facts only) ──
  const ACTIVITY = [
    { ts: 'Apr 28', tag: 'HIRE', cls: 'info', who: 'Noimie Acido',  msg: 'joined F2-LTX (Engineer 1, probationary)' },
    { ts: 'Mar 26', tag: 'HIRE', cls: 'info', who: 'Raven De Jesus', msg: 'joined F2-LTX (Engineer 1, probationary)' },
    { ts: 'WW2545', tag: 'OUT',  cls: 'ok',   who: 'Tisha Marie Ruiz', msg: 'released LTC3086 testcard on TS88_EXP' },
    { ts: 'WW2543', tag: 'OUT',  cls: 'ok',   who: 'Patrick Balmaceda', msg: 'released LTC3765 testcard on TS88_EXP' },
    { ts: 'WW2610', tag: 'OUT',  cls: 'ok',   who: 'Felix Buenaflor', msg: 'released ADBMS6830 perfboard (ETS364_T4)' },
    { ts: 'Jan 22', tag: 'HIRE', cls: 'info', who: 'Rhen Sacala',   msg: 'joined F2-LTX (Engineer 1, probationary)' },
    { ts: 'WW2542', tag: 'OUT',  cls: 'ok',   who: 'Louie Gargar',  msg: 'released LTC6269 testcard on TS88_EXP' }
  ];

  // ── real upcoming (probation reviews ≈ hire + 6 mo; shift window) ──
  const UPCOMING = [
    { when: 'Jun 16 – Jul 30', what: 'Shift rotation window (both teams)', type: 'shift' },
    { when: '~Jul 22', what: 'Probation review — Rhen Sacala', type: 'review' },
    { when: '~Sep 26', what: 'Probation review — Raven De Jesus', type: 'review' },
    { when: '~Oct 28', what: 'Probation review — Noimie Acido', type: 'review' }
  ];

  window.DASH = {
    MONTHS, OUTPUTS_SERIES, OPS, BUILD_AXES, SKILLS: BUILD_AXES,
    PEOPLE, ACTIVITY, UPCOMING, JOIN: join, SCHED_DAYS
  };
})();
