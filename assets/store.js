// store.js — in-memory model + localStorage mirror + Supabase debounced auto-push (§7.2)
(function () {
  const LS_KEY = 'erti_nerve_v1';
  const VOCAB = {
    wipStatus: ['Queued', 'In Debug', 'On Hold', 'Awaiting Parts', 'Completed', 'Scrapped'],
    activityCategory: ['New Debug', 'Re-debug/Rework', 'Verification', 'Failure Analysis', 'Calibration', 'ECN/Mod'],
    txCategory: ['ETS', 'LTX', 'FLEX', 'CTS', 'NI', 'AERO', 'EAGLE'],
    shiftCodes: ['DS', 'NS', 'VL', 'RD', 'NT'],
    planType: ['budget', 'projected'],
    roles: ['Engineer1', 'Engineer2', 'Technician3'],
    teams: ['F1-LEGACY', 'F1-PC', 'F2-LTX', 'F2-ETS', 'F2-ETS/LTX', 'F3-FT', 'F3-PC']
  };
  const DEFAULT_CONFIG = {
    currency: 'PHP', trendWindowWeekly: 8, trendWindowMonthly: 6, projectionMethod: 'run_rate',
    agingBuckets: [[0, 3], [4, 7], [8, 14], [15, 9999]], agingFlagDays: 8,
    activeWipStatuses: ['Queued', 'In Debug', 'On Hold', 'Awaiting Parts'],
    manningGreenPct: 90, manningYellowPct: 75, competencyGreen: 2.0, competencyYellow: 1.0,
    syncDebounceMs: 400, autoPush: true, defaultActivityCategory: 'New Debug'
  };
  const DB = {
    engineers: [], price_settings: [], output_records: [], wip_inventory: [], output_targets: [],
    team_budgets: [], platform_ratings: [], schedule_entries: [], manning_targets: [],
    app_settings: { supabaseUrl: '', supabaseKey: '' }, config: JSON.parse(JSON.stringify(DEFAULT_CONFIG)), VOCAB
  };
  const state = { tab: 'executive', periodType: 'monthly', periodKey: '', modalKey: null,
    modalPeriodType: 'monthly', modalRange: 6, modalTeam: '', teamFilter: '' };

  let sb = null, sync = 'idle', version = 0; const listeners = new Set(); const _timers = {};

  function bump() { version++; listeners.forEach(fn => fn(version)); }
  function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
  function setSync(s) { sync = s; listeners.forEach(fn => fn(version)); }
  function getSync() { return sync; }

  function saveLocal() { try { localStorage.setItem(LS_KEY, JSON.stringify({
      config: DB.config, app_settings: DB.app_settings,
      output_records: DB.output_records, wip_inventory: DB.wip_inventory, output_targets: DB.output_targets,
      price_settings: DB.price_settings, team_budgets: DB.team_budgets, engineers: DB.engineers,
      platform_ratings: DB.platform_ratings, schedule_entries: DB.schedule_entries, manning_targets: DB.manning_targets
    })); } catch (e) {} }
  function loadLocal() { try { const raw = localStorage.getItem(LS_KEY); if (!raw) return false;
      const o = JSON.parse(raw); Object.keys(o).forEach(k => { if (k === 'config') Object.assign(DB.config, o.config); else DB[k] = o[k]; });
      return (DB.output_records && DB.output_records.length) || (DB.engineers && DB.engineers.length); } catch (e) { return false; } }

  // Debounced upsert (§7.2). conflictCols matches the table UNIQUE constraints.
  const CONFLICT = { output_records: 'hardware_id', wip_inventory: 'hardware_id',
    output_targets: 'period_type,period_key,plan_type,hw_type,team', price_settings: 'hw_type',
    platform_ratings: 'engineer_id,platform', schedule_entries: 'engineer_id,schedule_date', engineers: 'id', team_budgets: 'team' };
  function persist(table, row) {
    saveLocal();
    if (!sb || !DB.config.autoPush) return;
    const key = table + ':' + (row.id || row.hardware_id || JSON.stringify(row).slice(0, 40));
    clearTimeout(_timers[key]); setSync('saving');
    _timers[key] = setTimeout(() => {
      const cc = CONFLICT[table];
      sb.from(table).upsert(row, cc ? { onConflict: cc } : undefined)
        .then(r => { setSync(r.error ? 'error' : 'synced'); if (r.error) toast('Sync error: ' + r.error.message); });
    }, DB.config.syncDebounceMs);
  }
  function remove(table, match) { saveLocal(); if (!sb) return; setSync('saving');
    let q = sb.from(table).delete(); Object.keys(match).forEach(k => q = q.eq(k, match[k]));
    q.then(r => setSync(r.error ? 'error' : 'synced')); }

  function connect(url, key) {
    DB.app_settings.supabaseUrl = url; DB.app_settings.supabaseKey = key; saveLocal();
    if (!url || !key || !window.supabase) return false;
    try { sb = window.supabase.createClient(url, key); setSync('synced'); return true; } catch (e) { setSync('error'); return false; }
  }
  const TABLES = ['engineers', 'price_settings', 'output_records', 'wip_inventory', 'output_targets', 'team_budgets', 'platform_ratings', 'schedule_entries', 'manning_targets'];
  async function fetchAll() { if (!sb) return; setSync('saving');
    for (const t of TABLES) { try { const { data, error } = await sb.from(t).select('*'); if (!error && data) DB[t] = data; } catch (e) {} }
    setSync('synced'); saveLocal(); bump(); }
  async function flushAll() { if (!sb) return; setSync('saving');
    for (const t of TABLES) { const rows = DB[t]; if (!rows || !rows.length) continue;
      try { await sb.from(t).upsert(rows, CONFLICT[t] ? { onConflict: CONFLICT[t] } : undefined); } catch (e) {} }
    setSync('synced'); }

  let _toast = null; function toast(msg) { if (typeof document === 'undefined') return; _toast = msg;
    listeners.forEach(fn => fn(version)); clearTimeout(window._tT); window._tT = setTimeout(() => { _toast = null; listeners.forEach(fn => fn(version)); }, 3200); }
  function getToast() { return _toast; }

  window.STORE = { DB, state, version: () => version, bump, subscribe, setSync, getSync,
    saveLocal, loadLocal, persist, remove, connect, fetchAll, flushAll, toast, getToast,
    VOCAB, hasSb: () => !!sb };
  if (typeof module !== 'undefined') module.exports = window.STORE;
})();
