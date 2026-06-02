// data.js — sample dataset for ERTI F2 · ETS/LTX people-management dashboard
// Engineering Reliability & Test Integration, Floor 2 — Engineering Test Services / LTX platform
(function () {
  // ── Team-level KPI history (last 6 months, current = May) ──
  const MONTHS = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];

  const TEAM_KPIS = {
    throughput:   { label: 'Test Throughput',   unit: 'runs',  series: [1840, 1910, 2030, 1980, 2210, 2374], target: 2200, fmt: v => v.toLocaleString() },
    fpy:          { label: 'First-Pass Yield',  unit: '%',     series: [91.2, 90.4, 92.1, 93.0, 93.4, 94.6], target: 93.0, fmt: v => v.toFixed(1) + '%' },
    utilization:  { label: 'Bench Utilization', unit: '%',     series: [78, 81, 80, 83, 86, 88], target: 85, fmt: v => v + '%' },
    goals:        { label: 'OKR Completion',    unit: '%',     series: [62, 64, 68, 71, 74, 79], target: 80, fmt: v => v + '%' },
  };

  // Defect escape (lower better) + cycle time, shown as secondary
  const SECONDARY = {
    escape:    { label: 'Defect Escape Rate', value: '0.8%', delta: -0.3, good: 'down', spark: [1.4,1.3,1.2,1.1,1.0,0.8] },
    cycle:     { label: 'Avg Cycle Time',     value: '4.2h', delta: -0.6, good: 'down', spark: [5.4,5.1,4.9,4.7,4.5,4.2] },
    coverage:  { label: 'Automation Coverage',value: '67%',  delta: +5,   good: 'up',   spark: [55,58,60,61,63,67] },
    backlog:   { label: 'Open Test Backlog',  value: '23',   delta: -8,   good: 'down', spark: [44,40,38,34,31,23] },
  };

  // ── Skills taxonomy ──
  const SKILLS = ['Test Automation', 'HW Debug', 'Data Analysis', 'Reliability Methods', 'Lab Safety', 'Reporting', 'Tooling / Scripting', 'Mentoring'];

  // proficiency: 0 none · 1 learning · 2 proficient · 3 advanced · 4 expert
  function spark(base, vol) {
    const out = [];
    let v = base - vol * 2;
    for (let i = 0; i < 6; i++) { v += (Math.sin(i * 1.3 + base) * vol) + vol * 0.6; out.push(Math.round(Math.max(40, Math.min(99, v)))); }
    return out;
  }

  // ── Roster ──
  const PEOPLE = [
    { id: 'p01', name: 'Marcus Reyes',     role: 'Test Lead',              level: 'L5', squad: 'ETS', tenure: 6.4, initials: 'MR',
      throughput: 188, fpy: 96.2, utilization: 82, goals: 92, training: 100, attendance: 98, composite: 94, delta: +2, risk: 'low',
      skills: [4,4,3,4,3,4,3,4], certs: 5, readiness: 'Ready now', nextRole: 'Test Manager',
      hist: [88,89,90,91,92,94], note: 'Owns LTX bring-up. Strong delegation; ready for manager track.' },
    { id: 'p02', name: 'Priya Nair',       role: 'Sr Reliability Engineer',level: 'L5', squad: 'LTX', tenure: 5.1, initials: 'PN',
      throughput: 142, fpy: 97.8, utilization: 79, goals: 88, training: 95, attendance: 99, composite: 92, delta: +1, risk: 'low',
      skills: [3,3,4,4,3,4,2,3], certs: 6, readiness: 'Ready now', nextRole: 'Staff Engineer',
      hist: [86,87,88,90,91,92], note: 'Deepest reliability expertise on floor. Publishing internal FA playbook.' },
    { id: 'p03', name: 'Elena Vasquez',    role: 'Sr Test Engineer',       level: 'L4', squad: 'ETS', tenure: 4.3, initials: 'EV',
      throughput: 201, fpy: 94.1, utilization: 90, goals: 84, training: 90, attendance: 96, composite: 89, delta: +4, risk: 'low',
      skills: [4,3,3,3,3,3,4,2], certs: 4, readiness: '6–12 mo', nextRole: 'Test Lead',
      hist: [80,82,83,85,86,89], note: 'Highest throughput on ETS. Coaching her on stakeholder comms for L5.' },
    { id: 'p04', name: 'Hannah Kim',       role: 'Automation Engineer',    level: 'L4', squad: 'LTX', tenure: 3.8, initials: 'HK',
      throughput: 176, fpy: 95.0, utilization: 85, goals: 86, training: 88, attendance: 97, composite: 88, delta: +5, risk: 'low',
      skills: [4,2,4,2,3,3,4,2], certs: 3, readiness: '6–12 mo', nextRole: 'Sr Automation Eng',
      hist: [78,80,82,84,85,88], note: 'Drove automation coverage 55→67%. Fast-rising; watch for poaching.' },
    { id: 'p05', name: 'Daniel Okafor',    role: 'Sr Test Engineer',       level: 'L4', squad: 'ETS', tenure: 4.9, initials: 'DO',
      throughput: 169, fpy: 93.4, utilization: 84, goals: 80, training: 92, attendance: 94, composite: 86, delta: +1, risk: 'med',
      skills: [3,4,3,3,4,3,3,3], certs: 4, readiness: '6–12 mo', nextRole: 'Test Lead',
      hist: [84,85,85,86,85,86], note: 'Plateaued slightly. Flagged interest in moving to design-side; retention 1:1 scheduled.' },
    { id: 'p06', name: 'Aisha Bello',      role: 'Reliability Engineer',   level: 'L4', squad: 'LTX', tenure: 3.2, initials: 'AB',
      throughput: 151, fpy: 95.6, utilization: 81, goals: 82, training: 86, attendance: 98, composite: 85, delta: +3, risk: 'low',
      skills: [2,3,4,4,3,3,2,2], certs: 3, readiness: '6–12 mo', nextRole: 'Sr Reliability Eng',
      hist: [79,80,81,83,83,85], note: 'Strong FA discipline. Pairing with Priya on accelerated-life testing.' },
    { id: 'p07', name: 'Kenji Tanaka',     role: 'Test Engineer',          level: 'L3', squad: 'ETS', tenure: 2.6, initials: 'KT',
      throughput: 183, fpy: 92.8, utilization: 88, goals: 78, training: 84, attendance: 95, composite: 83, delta: +6, risk: 'low',
      skills: [3,3,2,2,3,2,3,1], certs: 2, readiness: '12–18 mo', nextRole: 'Sr Test Engineer',
      hist: [74,76,78,80,81,83], note: 'Biggest mover this quarter. Took on LTX regression suite ownership.' },
    { id: 'p08', name: 'Sofia Marchetti',  role: 'Test Engineer',          level: 'L3', squad: 'LTX', tenure: 2.9, initials: 'SM',
      throughput: 158, fpy: 93.9, utilization: 80, goals: 76, training: 82, attendance: 97, composite: 82, delta: +2, risk: 'low',
      skills: [2,3,3,2,3,3,2,1], certs: 2, readiness: '12–18 mo', nextRole: 'Sr Test Engineer',
      hist: [76,77,78,80,81,82], note: 'Reliable, detail-oriented. Building data-analysis depth via internal course.' },
    { id: 'p09', name: 'Grace Adeyemi',    role: 'Test Engineer',          level: 'L3', squad: 'ETS', tenure: 2.3, initials: 'GA',
      throughput: 162, fpy: 91.7, utilization: 83, goals: 74, training: 80, attendance: 93, composite: 80, delta: +3, risk: 'low',
      skills: [2,2,3,2,3,2,2,1], certs: 1, readiness: '12–18 mo', nextRole: 'Sr Test Engineer',
      hist: [72,74,76,77,78,80], note: 'Solid trajectory. Encourage cert completion to unblock L4 path.' },
    { id: 'p10', name: 'Raj Patel',        role: 'Test Engineer',          level: 'L3', squad: 'LTX', tenure: 3.1, initials: 'RP',
      throughput: 147, fpy: 90.9, utilization: 76, goals: 68, training: 72, attendance: 90, composite: 76, delta: -2, risk: 'high',
      skills: [2,2,2,2,2,2,2,1], certs: 1, readiness: 'Not yet', nextRole: 'Sr Test Engineer',
      hist: [80,79,78,77,77,76], note: 'Declining engagement + low attendance. Active flight risk — manager 1:1 this week.' },
    { id: 'p11', name: 'Yuki Sato',        role: 'Reliability Engineer',   level: 'L3', squad: 'LTX', tenure: 1.9, initials: 'YS',
      throughput: 138, fpy: 92.4, utilization: 78, goals: 70, training: 78, attendance: 96, composite: 78, delta: +4, risk: 'low',
      skills: [1,2,3,3,3,2,2,1], certs: 2, readiness: '12–18 mo', nextRole: 'Sr Reliability Eng',
      hist: [70,72,73,75,76,78], note: 'Quick learner in reliability methods. Good mentee for Aisha.' },
    { id: 'p11b', name: 'Liam Walsh',      role: 'Lab Technician',         level: 'L2', squad: 'ETS', tenure: 1.4, initials: 'LW',
      throughput: 134, fpy: 89.8, utilization: 87, goals: 66, training: 70, attendance: 92, composite: 74, delta: +2, risk: 'med',
      skills: [1,2,1,1,4,2,1,0], certs: 1, readiness: 'Not yet', nextRole: 'Test Engineer',
      hist: [69,70,71,72,73,74], note: 'Excellent lab discipline. Needs scripting fundamentals to step up to L3.' },
    { id: 'p12', name: 'Tomas Novak',      role: 'Lab Technician',         level: 'L2', squad: 'LTX', tenure: 1.1, initials: 'TN',
      throughput: 128, fpy: 90.3, utilization: 85, goals: 64, training: 68, attendance: 94, composite: 72, delta: +3, risk: 'low',
      skills: [1,2,1,1,4,1,1,0], certs: 0, readiness: 'Not yet', nextRole: 'Test Engineer',
      hist: [66,68,69,70,71,72], note: 'Dependable bench tech. On structured ramp plan; tracking well.' },
    { id: 'p13', name: 'Noah Bergman',     role: 'Jr Test Engineer',       level: 'L2', squad: 'ETS', tenure: 0.6, initials: 'NB',
      throughput: 119, fpy: 88.5, utilization: 74, goals: 58, training: 60, attendance: 95, composite: 68, delta: +7, risk: 'low',
      skills: [1,1,2,1,2,1,2,0], certs: 0, readiness: 'Not yet', nextRole: 'Test Engineer',
      hist: [54,58,61,63,65,68], note: 'New grad, onboarding ahead of plan. Fastest ramp we have seen on F2.' },
  ];

  // ── Recent activity feed ──
  const ACTIVITY = [
    { ts: 'May 28', tag: 'GOAL',  cls: 'ok',   who: 'Kenji Tanaka',  msg: 'completed Q2 OKR — LTX regression suite migration' },
    { ts: 'May 27', tag: 'RISK',  cls: 'warn', who: 'Raj Patel',     msg: 'flagged high flight-risk — engagement + attendance dip' },
    { ts: 'May 26', tag: 'CERT',  cls: 'info', who: 'Aisha Bello',   msg: 'earned Accelerated Life Testing certification' },
    { ts: 'May 24', tag: '1:1',   cls: 'info', who: 'Daniel Okafor', msg: 'retention 1:1 logged — exploring design-side interest' },
    { ts: 'May 22', tag: 'PROMO', cls: 'ok',   who: 'Elena Vasquez', msg: 'nominated for L5 Test Lead — calibration pending' },
    { ts: 'May 21', tag: 'KUDOS', cls: 'ok',   who: 'Hannah Kim',    msg: 'recognized — automation coverage milestone 67%' },
    { ts: 'May 19', tag: 'GOAL',  cls: 'ok',   who: 'Noah Bergman',  msg: 'cleared onboarding checkpoint 2 ahead of schedule' },
  ];

  // ── Upcoming people-ops items ──
  const UPCOMING = [
    { when: 'This week', what: 'Retention 1:1 — Raj Patel',        type: 'risk' },
    { when: 'This week', what: 'L5 calibration — Elena Vasquez',   type: 'promo' },
    { when: 'Jun 3',     what: 'Quarterly review cycle opens',     type: 'review' },
    { when: 'Jun 9',     what: 'Cert deadline — Grace Adeyemi',    type: 'cert' },
    { when: 'Jun 12',    what: 'Ramp checkpoint — Tomas Novak',    type: 'ramp' },
  ];

  window.DASH = { MONTHS, TEAM_KPIS, SECONDARY, SKILLS, PEOPLE, ACTIVITY, UPCOMING };
})();
