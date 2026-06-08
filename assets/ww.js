// ww.js — Workweek (fiscal) engine. Fiscal year begins the FIRST MONDAY of November.
// Label format: WWyyww (yy = fiscal-year 2-digit, ww = week 01..52).
// NOTE: This is a compatible reimplementation of the existing WW engine; if the
// original source is available, swap this module in verbatim (same public API).
(function () {
  const DAY = 86400000;
  function firstMondayOfNov(calYear) {
    const d = new Date(Date.UTC(calYear, 10, 1));           // Nov 1
    const dow = d.getUTCDay();                               // 0 Sun..6 Sat
    const add = (dow === 1) ? 0 : ((8 - dow) % 7);          // days to Monday
    return new Date(Date.UTC(calYear, 10, 1 + add));
  }
  // Fiscal year yy (e.g. 26) starts first Monday of Nov of calendar (2000+yy-1)
  function fyStart(yy) { return firstMondayOfNov(2000 + yy - 1); }

  function fromDate(input) {
    const d = new Date(input); const t = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
    // find fiscal year whose start <= t
    let yy = d.getMonth() >= 10 ? (d.getFullYear() - 2000 + 1) : (d.getFullYear() - 2000);
    let start = fyStart(yy).getTime();
    if (t < start) { yy -= 1; start = fyStart(yy).getTime(); }
    let wk = Math.floor((t - start) / (7 * DAY)) + 1;
    if (wk > 52) { yy += 1; wk = 1; }                        // roll into next FY
    return 'WW' + String(yy).padStart(2, '0') + String(wk).padStart(2, '0');
  }
  function parse(ww) { const m = /^WW(\d{2})(\d{2})$/.exec(ww); return m ? { yy: +m[1], wk: +m[2] } : null; }
  function toDate(ww) { const p = parse(ww); if (!p) return new Date(NaN);
    return new Date(fyStart(p.yy).getTime() + (p.wk - 1) * 7 * DAY); }
  function monthKey(ww) { const d = toDate(ww); return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0'); }

  // Build a continuous WW list spanning fiscal years [fromYY..toYY]
  function buildAll(fromYY, toYY) { const out = [];
    for (let yy = fromYY; yy <= toYY; yy++) for (let wk = 1; wk <= 52; wk++)
      out.push('WW' + String(yy).padStart(2, '0') + String(wk).padStart(2, '0'));
    return out; }

  const ALL_WW = buildAll(24, 26);                          // FY24..FY26 (covers seed range)
  const ALL_MONTHS = [...new Set(ALL_WW.map(monthKey))].sort();

  window.WW = { fromDate, toDate, parse, monthKey, fyStart, firstMondayOfNov };
  window.ALL_WW = ALL_WW;
  window.ALL_MONTHS = ALL_MONTHS;
  if (typeof module !== 'undefined') module.exports = { WW: window.WW, ALL_WW, ALL_MONTHS };
})();
