// tab-settings.jsx — Supabase connect + migration SQL + sync + config params (§8.10, §10)
const { useState: useSs } = React;
const MIGRATION_SQL=`-- ERTI Debug Nerve Center — Supabase migration (self-contained, runs on a fresh project)
-- Creates retained tables first so foreign keys resolve, then the new tables.

CREATE TABLE IF NOT EXISTS engineers (
  id int PRIMARY KEY, no text, last text, first text, name text,
  pos text, team text, hired date, resigned date, status text);

CREATE TABLE IF NOT EXISTS price_settings (
  hw_type text PRIMARY KEY, price numeric DEFAULT 0, placeholder boolean DEFAULT false);

CREATE TABLE IF NOT EXISTS team_budgets (
  team text PRIMARY KEY, budget numeric DEFAULT 0, forecast numeric DEFAULT 0);

CREATE TABLE IF NOT EXISTS manning_targets (
  team text PRIMARY KEY, target int DEFAULT 0);

CREATE TABLE IF NOT EXISTS platform_ratings (
  engineer_id int, platform text, rating int DEFAULT 0,
  PRIMARY KEY (engineer_id, platform));

CREATE TABLE IF NOT EXISTS schedule_entries (
  engineer_id int, schedule_date date, code text,
  PRIMARY KEY (engineer_id, schedule_date));

CREATE TABLE IF NOT EXISTS app_settings (
  id int PRIMARY KEY DEFAULT 1, data jsonb);

-- ── new / changed tables ──
CREATE TABLE IF NOT EXISTS output_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hardware_id text UNIQUE NOT NULL, hw_type text, activity_category text,
  workweek text, output_date date, engineer_id int REFERENCES engineers(id),
  team text, wip_id uuid, qty int DEFAULT 1,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());

CREATE TABLE IF NOT EXISTS wip_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hardware_id text UNIQUE NOT NULL, hw_type text, tx_category text,
  status text DEFAULT 'Queued', debug_start date, debug_end date,
  engineer_id int REFERENCES engineers(id), team text, notes text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());

CREATE TABLE IF NOT EXISTS output_targets (
  id serial PRIMARY KEY, period_type text, period_key text, plan_type text,
  hw_type text, team text DEFAULT 'ALL', target_count int DEFAULT 0,
  UNIQUE (period_type, period_key, plan_type, hw_type, team));

-- WIP snapshots (point-in-time WIP numbers per workweek; one row per WW, upserted)
CREATE TABLE IF NOT EXISTS wip_snapshots (
  period_key   text PRIMARY KEY,        -- WWyyww
  snapped_at   timestamptz DEFAULT now(),
  total_active int DEFAULT 0,
  aged         int DEFAULT 0,
  by_status    jsonb, by_tester jsonb, by_hwtype jsonb, by_team jsonb);

-- NOTE: id columns above are text/int (not gen_random_uuid) for engineers because the
-- app keys engineers by the real employee number. The app uses anon-key upserts;
-- enable RLS + an anon policy per table if your project enforces RLS.`;
function Settings(){
  useStore(); const S=window.STORE,DB=S.DB,cfg=DB.config;
  const [url,setUrl]=useSs(DB.app_settings.supabaseUrl||''); const [key,setKey]=useSs(DB.app_settings.supabaseKey||'');
  const [copied,setCopied]=useSs(false);
  const setC=(k,v)=>{cfg[k]=v;S.saveLocal();S.bump();};
  const connect=()=>{ const ok=S.connect(url,key); if(ok)S.fetchAll(); };
  const copy=()=>{ try{navigator.clipboard.writeText(MIGRATION_SQL);setCopied(true);setTimeout(()=>setCopied(false),1500);}catch(e){} };
  return (
    <div className="view-inner">
      <div className="grid g-2">
        <Panel title="Supabase Connection" icon={I.gear}>
          <div className="frow"><label>Project URL</label><input type="text" value={url} placeholder="https://xxxx.supabase.co" onChange={e=>setUrl(e.target.value)}/></div>
          <div className="frow"><label>anon key</label><input type="text" value={key} placeholder="eyJ…" onChange={e=>setKey(e.target.value)}/></div>
          <div className="row between" style={{marginTop:10}}><SyncDot/><div className="row" style={{gap:8}}>
            <button className="btn pri" onClick={connect}>Connect &amp; Pull</button>
            <button className="btn" onClick={()=>S.flushAll()}>Flush all →</button></div></div>
          <div className="callout" style={{marginTop:10}}>Offline-first: the dashboard runs entirely from <b>localStorage</b> without a connection. Connect to sync; every edit auto-pushes (debounced). Credentials can also be <b>baked</b> into <code>assets/supabase-config.js</code> so the app auto-connects and pulls on every load.</div>
        </Panel>
        <Panel title="Sync" icon={I.pulse}>
          <div className="frow"><label>Auto-push</label><Seg value={cfg.autoPush?'on':'off'} options={[{k:'on',l:'On'},{k:'off',l:'Off'}]} onChange={v=>setC('autoPush',v==='on')}/></div>
          <div className="frow"><label>Debounce (ms)</label><input type="number" value={cfg.syncDebounceMs} style={{width:100}} onChange={e=>setC('syncDebounceMs',Math.max(100,Math.min(2000,+e.target.value)))}/></div>
          <div className="frow"><label>Projection</label><select value={cfg.projectionMethod} onChange={e=>setC('projectionMethod',e.target.value)}>{['run_rate','last_period','trailing_4_avg','manual'].map(m=><option key={m}>{m}</option>)}</select></div>
        </Panel>
      </div>
      <Panel title="KPI / WIP Parameters" icon={I.target}>
        <div className="grid g-3">
          <div className="frow" style={{gridTemplateColumns:'1fr'}}><label>Trend window — weekly ({cfg.trendWindowWeekly})</label><input type="range" min="4" max="13" value={cfg.trendWindowWeekly} onChange={e=>setC('trendWindowWeekly',+e.target.value)}/></div>
          <div className="frow" style={{gridTemplateColumns:'1fr'}}><label>Trend window — monthly ({cfg.trendWindowMonthly})</label><input type="range" min="3" max="12" value={cfg.trendWindowMonthly} onChange={e=>setC('trendWindowMonthly',+e.target.value)}/></div>
          <div className="frow" style={{gridTemplateColumns:'1fr'}}><label>WIP aging flag (≥ {cfg.agingFlagDays} d)</label><input type="range" min="1" max="30" value={cfg.agingFlagDays} onChange={e=>setC('agingFlagDays',+e.target.value)}/></div>
          <div className="frow" style={{gridTemplateColumns:'1fr'}}><label>Manning green % ({cfg.manningGreenPct})</label><input type="range" min="0" max="100" value={cfg.manningGreenPct} onChange={e=>setC('manningGreenPct',+e.target.value)}/></div>
          <div className="frow" style={{gridTemplateColumns:'1fr'}}><label>Manning yellow % ({cfg.manningYellowPct})</label><input type="range" min="0" max="100" value={cfg.manningYellowPct} onChange={e=>setC('manningYellowPct',+e.target.value)}/></div>
          <div className="frow" style={{gridTemplateColumns:'1fr'}}><label>Competency green (≥ {cfg.competencyGreen})</label><input type="range" min="0" max="3" step="0.1" value={cfg.competencyGreen} onChange={e=>setC('competencyGreen',+e.target.value)}/></div>
        </div>
        <div style={{marginTop:10}}><label className="muted-s">Active WIP statuses (count as WIP):</label>
          <div className="filters" style={{marginTop:6}}>{DB.VOCAB.wipStatus.map(s=>{const on=cfg.activeWipStatuses.includes(s);
            return <button key={s} className={'fchip'+(on?' active':'')} onClick={()=>{cfg.activeWipStatuses=on?cfg.activeWipStatuses.filter(x=>x!==s):[...cfg.activeWipStatuses,s];S.saveLocal();S.bump();}}>{s}</button>;})}</div></div>
      </Panel>
      <Panel title="Migration SQL" icon={I.layers} sub="paste into Supabase SQL editor" right={<button className="btn sm" onClick={copy}>{copied?'Copied ✓':'Copy'}</button>}>
        <pre className="inset" style={{padding:12,overflow:'auto',fontSize:11,fontFamily:'var(--f-mono)',color:'var(--fg-2)',margin:0,whiteSpace:'pre'}}>{MIGRATION_SQL}</pre>
      </Panel>
    </div>
  );
}
window.Settings=Settings;
