// app.jsx — shell: sidebar nav, topbar, routing, init, cloud bootstrap
const { useState: useSa, useEffect: useEa } = React;
const TABS=[
  {k:'executive',l:'Executive Pulse',icon:I.pulse,C:'Executive',crumb:'Overview'},
  {k:'revenue',l:'Revenue & Targets',icon:I.money,C:'RevenueTargets',crumb:'Planning'},
  {k:'output',l:'Output & Productivity',icon:I.box,C:'OutputTab',crumb:'Operations'},
  {k:'wip',l:'WIP Inventory',icon:I.layers,C:'WipTab',crumb:'Operations'},
  {k:'manpower',l:'Manpower & Schedule',icon:I.users,C:'Manpower',crumb:'Capacity'},
  {k:'skills',l:'Skills & Competency',icon:I.star,C:'Skills',crumb:'Capacity'},
  {k:'people',l:'People & Attrition',icon:I.users,C:'People',crumb:'Capacity'},
  {k:'import',l:'Import Data',icon:I.upload,C:'ImportTab',crumb:'Data'},
  {k:'settings',l:'Settings',icon:I.gear,C:'Settings',crumb:'System'}
];
function App(){
  useStore(); const S=window.STORE,st=S.state,DB=S.DB,E=window.ENGINE;
  const [tab,setTab]=useSa(st.tab);
  useEa(()=>{ if(!st.periodKey){ const ms=[...new Set(DB.output_records.map(r=>E.periodOf(r,'monthly')))].sort();
      st.periodKey=ms[ms.length-1]||window.ALL_MONTHS[window.ALL_MONTHS.length-1]; } },[]);
  const go=(k)=>{st.tab=k;setTab(k);S.bump();};
  const cur=TABS.find(t=>t.k===tab)||TABS[0]; const View=window[cur.C];
  const agingWip=E.activeWip().filter(w=>E.wipAge(w)>=DB.config.agingFlagDays).length;
  const probi=DB.engineers.filter(e=>e.status==='PROBI'&&!e.resigned).length;
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="side-head"><div className="side-brand"><div className="side-mark"><Icon d={I.pulse} size={18}/></div>
          <div><span className="t">ERTI Nerve Center</span><span className="s">F2 · ETS / LTX Debug Ops</span></div></div></div>
        <nav className="side-nav"><div className="side-sect">Operations</div>
          {TABS.map(t=>(<button key={t.k} className={'nav-item'+(t.k===tab?' active':'')} onClick={()=>go(t.k)}>
            <Icon d={t.icon} size={16}/>{t.l}
            {t.k==='wip'&&agingWip>0&&<span className="badge">{agingWip}</span>}
            {t.k==='people'&&probi>0&&<span className="badge">{probi}</span>}</button>))}
        </nav>
        <div className="side-foot"><SyncDot/></div>
      </aside>
      <main className="main">
        <div className="topbar"><div><div className="crumb">{cur.crumb}</div><h1>{cur.l}</h1></div>
          <div className="topbar-r"><span className="muted-s">{E.periodLabel(st.periodType,st.periodKey)}</span></div></div>
        <div className="view">{View?<View/>:<div className="empty">Coming soon</div>}</div>
      </main>
      <Banner/><Toast/>
    </div>
  );
}
window.App=App;

// ── boot: mount, remove splash, auto-sync from baked config ──
(function(){
  function hideSplash(){ const s=document.getElementById('boot-splash'); if(s){ s.classList.add('hide'); setTimeout(()=>{ if(s.parentNode)s.parentNode.removeChild(s); }, 650); } }
  function boot(){ const el=document.getElementById('root'); if(!el)return;
    ReactDOM.createRoot(el).render(React.createElement(App));
    const cfg=window.ERTI_SUPABASE;
    if(cfg && cfg.url && cfg.key && window.supabase){
      window.STORE.setBusy(true,'Syncing ERTI Nerve Center');
      window.STORE.connect(cfg.url,cfg.key);
      window.STORE.fetchAll().then(()=>{ window.STORE.setBusy(false); hideSplash(); })
        .catch(()=>{ window.STORE.setBusy(false); hideSplash(); });
    } else { setTimeout(hideSplash, 350); }
  }
  if(document.readyState!=='loading')boot(); else document.addEventListener('DOMContentLoaded',boot);
})();
