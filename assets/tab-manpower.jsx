// tab-manpower.jsx — manning capacity + shift calendar (§8.6)
const { useState: useSm } = React;
function Manpower(){
  useStore(); const E=window.ENGINE,S=window.STORE,DB=S.DB,cfg=DB.config;
  const man=E.manning(); const teams=Object.keys(man.teams);
  // 14-day window from schedule_entries
  const dates=[...new Set(DB.schedule_entries.map(s=>s.schedule_date))].sort();
  const engs=DB.engineers.filter(e=>!e.resigned);
  const codeOf=(id,d)=>{const s=DB.schedule_entries.find(x=>x.engineer_id===id&&x.schedule_date===d);return s?s.code:'';};
  const setCode=(id,d,code)=>{ let s=DB.schedule_entries.find(x=>x.engineer_id===id&&x.schedule_date===d);
    if(code===''){ if(s){DB.schedule_entries=DB.schedule_entries.filter(x=>x!==s);S.remove('schedule_entries',{engineer_id:id,schedule_date:d});} }
    else { if(!s){s={engineer_id:id,schedule_date:d,code};DB.schedule_entries.push(s);} else s.code=code; S.persist('schedule_entries',s); }
    S.saveLocal();S.bump(); };
  const shiftColor={DS:'var(--accent-gold)',NS:'var(--accent-blue)',NT:'var(--accent-purple)',VL:'var(--fg-4)',RD:'var(--fg-4)'};
  const setTarget=(team,val)=>{ let m=DB.manning_targets.find(x=>x.team===team); if(!m){m={team,target:0};DB.manning_targets.push(m);} m.target=Math.max(0,parseInt(val||0,10)); S.saveLocal();S.bump(); };

  return (
    <div className="view-inner">
      <div className="grid g-4">
        <Tile label="Overall Fill" value={man.fill+'%'} accent={man.fill>=cfg.manningGreenPct?'var(--accent-green)':man.fill>=cfg.manningYellowPct?'var(--accent-gold)':'var(--accent-red)'}/>
        <Tile label="Headcount" value={man.cur}/>
        <Tile label="Target HC" value={man.target}/>
        <Tile label="Teams" value={teams.length}/>
      </div>
      <div className="grid g-2-1">
        <Panel title="Capacity by Team" icon={I.users} sub="current vs target HC">
          <ManningBars teams={teams} cur={teams.map(t=>man.teams[t].cur)} target={teams.map(t=>man.teams[t].target)} h={240}/>
        </Panel>
        <Panel title="Targets" icon={I.target} pad={false}>
          <table className="dt"><thead><tr><th>Team</th><th className="num">HC</th><th className="num">Target</th></tr></thead>
            <tbody>{teams.map(t=>(<tr key={t}><td>{t}</td><td className="num">{man.teams[t].cur}</td>
              <td className="num"><input type="number" value={man.teams[t].target||0} style={{width:64,textAlign:'right'}} onChange={e=>setTarget(t,e.target.value)}/></td></tr>))}</tbody></table>
        </Panel>
      </div>
      <Panel title="Shift Schedule" icon={I.cal} sub={dates.length+'-day window'} pad={false}>
        <div className="tbl-wrap"><table className="dt">
          <thead><tr><th style={{position:'sticky',left:0,background:'var(--panel)',zIndex:2}}>Engineer</th>{dates.map(d=><th key={d} className="num">{d.slice(5)}</th>)}</tr></thead>
          <tbody>{engs.map(e=>(<tr key={e.id}><td style={{position:'sticky',left:0,background:'var(--panel)'}}>{e.name}</td>
            {dates.map(d=>{const c=codeOf(e.id,d);return <td key={d} className="num" style={{padding:2}}>
              <select value={c} onChange={ev=>setCode(e.id,d,ev.target.value)} style={{width:54,padding:'3px',color:shiftColor[c]||'var(--fg-3)',fontWeight:c?600:400}}>
                <option value=""></option>{DB.VOCAB.shiftCodes.map(s=><option key={s} value={s}>{s}</option>)}</select></td>;})}</tr>))}
          </tbody></table></div>
      </Panel>
    </div>
  );
}
window.Manpower=Manpower;
