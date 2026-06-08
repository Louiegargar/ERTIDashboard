// tab-revenue.jsx — price book + team budgets + output targets entry (§8.3)
const { useState: useSr } = React;
function RevenueTargets(){
  useStore(); const E=window.ENGINE,S=window.STORE,DB=S.DB;
  const [ptype,setPtype]=useSr('monthly');
  const [pkey,setPkey]=useSr(()=>{ const ks=[...new Set(DB.output_targets.filter(t=>t.period_type==='monthly').map(t=>t.period_key))].sort(); return ks[ks.length-1]||'2025-08'; });
  const [plan,setPlan]=useSr('budget');
  const hws=DB.price_settings.map(p=>p.hw_type);

  const periodOpts=()=>{ const s=new Set([pkey]); window.ALL_MONTHS.forEach(m=>s.add(m)); if(ptype==='weekly'){s.clear();window.ALL_WW.forEach(w=>s.add(w));} return [...s].sort(); };
  const findTarget=(hw)=>DB.output_targets.find(t=>t.period_type===ptype&&t.period_key===pkey&&t.plan_type===plan&&t.hw_type===hw&&t.team==='ALL');
  const setTarget=(hw,val)=>{ let row=findTarget(hw); const n=Math.max(0,parseInt(val||0,10));
    if(!row){ row={id:plan[0]+'-'+pkey+'-'+hw,period_type:ptype,period_key:pkey,plan_type:plan,hw_type:hw,team:'ALL',target_count:n}; DB.output_targets.push(row); }
    else row.target_count=n; S.persist('output_targets',row); S.bump(); };
  const setPrice=(hw,val)=>{ const row=DB.price_settings.find(p=>p.hw_type===hw); row.price=Math.max(0,parseFloat(val||0)); row.placeholder=false; S.persist('price_settings',row); S.bump(); };
  const setBudget=(team,field,val)=>{ const row=DB.team_budgets.find(b=>b.team===team); row[field]=Math.max(0,parseFloat(val||0)); S.persist('team_budgets',row); S.bump(); };
  const fillRunRate=()=>{ const scope=E.periodList(ptype, ptype==='weekly'?13:6, pkey); const per=E.projectRunRate(ptype,scope);
    // distribute across hw_types proportional to recent actual mix
    const mix={}; let tot=0; DB.output_records.forEach(r=>{const k=E.periodOf(r,ptype); if(scope.includes(k)){mix[r.hw_type]=(mix[r.hw_type]||0)+1;tot++;}});
    hws.forEach(hw=>{ const share=tot?(mix[hw]||0)/tot:0; setTarget(hw, Math.round(per*share)); }); };

  const totBudget=hws.reduce((s,hw)=>{const r=findTarget(hw);return s+((r?r.target_count:0)*E.price(hw));},0);
  return (
    <div className="view-inner">
      <div className="grid g-2">
        <Panel title="Price Book" icon={I.money} sub="₱ per hardware type — drives all revenue" pad={false}>
          <table className="dt"><thead><tr><th>Hardware Type</th><th className="num">Price (₱)</th><th></th></tr></thead>
            <tbody>{DB.price_settings.map(p=>(<tr key={p.hw_type}><td>{p.hw_type}</td>
              <td className="num"><input type="number" value={p.price} style={{width:110,textAlign:'right'}} onChange={e=>setPrice(p.hw_type,e.target.value)}/></td>
              <td>{p.placeholder&&<span className="tag gold">placeholder</span>}</td></tr>))}</tbody></table>
        </Panel>
        <Panel title="Team Budgets" icon={I.users} sub="high-level ₱ view" pad={false}>
          <table className="dt"><thead><tr><th>Team</th><th className="num">Budget (₱)</th><th className="num">Forecast (₱)</th></tr></thead>
            <tbody>{DB.team_budgets.map(b=>(<tr key={b.team}><td>{b.team}</td>
              <td className="num"><input type="number" value={b.budget} style={{width:120,textAlign:'right'}} onChange={e=>setBudget(b.team,'budget',e.target.value)}/></td>
              <td className="num"><input type="number" value={b.forecast} style={{width:120,textAlign:'right'}} onChange={e=>setBudget(b.team,'forecast',e.target.value)}/></td></tr>))}</tbody></table>
        </Panel>
      </div>

      <Panel title="Output Targets" icon={I.target} sub="plan boards by period & hardware type"
        right={<button className="btn sm" onClick={fillRunRate}>Fill from run-rate</button>}>
        <div className="row wrap" style={{gap:10,marginBottom:12}}>
          <Seg value={ptype} options={[{k:'weekly',l:'Weekly'},{k:'monthly',l:'Monthly'}]} onChange={v=>{setPtype(v);const o=(v==='weekly'?window.ALL_WW:window.ALL_MONTHS);setPkey(o[o.length-1]);}}/>
          <select value={pkey} onChange={e=>setPkey(e.target.value)}>{periodOpts().map(k=><option key={k} value={k}>{E.periodLabel(ptype,k)}</option>)}</select>
          <Seg value={plan} options={[{k:'budget',l:'Budget'},{k:'projected',l:'Projected'}]} onChange={setPlan}/>
        </div>
        <table className="dt"><thead><tr><th>Hardware Type</th><th className="num">Target Boards</th><th className="num">= ₱ Revenue</th></tr></thead>
          <tbody>{hws.map(hw=>{const r=findTarget(hw);const c=r?r.target_count:0;return(<tr key={hw}><td>{hw}</td>
            <td className="num"><input type="number" value={c} style={{width:90,textAlign:'right'}} onChange={e=>setTarget(hw,e.target.value)}/></td>
            <td className="num">{peso(c*E.price(hw))}</td></tr>);})}
            <tr><td style={{fontWeight:600}}>Total</td><td className="num" style={{fontWeight:600}}>{hws.reduce((s,hw)=>{const r=findTarget(hw);return s+(r?r.target_count:0);},0)}</td>
            <td className="num" style={{fontWeight:600,color:'var(--accent)'}}>{peso(totBudget)}</td></tr></tbody></table>
      </Panel>
    </div>
  );
}
window.RevenueTargets=RevenueTargets;
