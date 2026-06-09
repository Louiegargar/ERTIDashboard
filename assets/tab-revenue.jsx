// tab-revenue.jsx — editable price book + MONTHLY team budgets + MONTHLY output targets (§8.3, revised)
const { useState: useSr } = React;
function RevenueTargets(){
  useStore(); const E=window.ENGINE,S=window.STORE,DB=S.DB;
  const [month,setMonth]=useSr(()=>E.currentPeriod('monthly'));
  const [plan,setPlan]=useSr('budget');
  const hws=DB.price_settings.map(p=>p.hw_type);
  const teams=[...new Set(DB.engineers.filter(e=>!e.resigned).map(e=>e.team))]; if(!teams.length)teams.push('F2-LTX','F2-ETS');
  const monthOpts=window.ALL_MONTHS; // planning may be future, so not clamped

  // ── price book ──
  const setPrice=(hw,val)=>{ const r=DB.price_settings.find(p=>p.hw_type===hw); r.price=Math.max(0,parseFloat(val||0)); r.placeholder=false; S.persist('price_settings',r); S.bump(); };
  const renameType=(oldT,newT)=>{ newT=(newT||'').trim(); if(!newT||newT===oldT)return;
    if(DB.price_settings.find(p=>p.hw_type===newT)){S.toast('"'+newT+'" already exists');S.bump();return;}
    const row=DB.price_settings.find(p=>p.hw_type===oldT); row.hw_type=newT; row.placeholder=false;
    DB.output_records.forEach(r=>{if(r.hw_type===oldT)r.hw_type=newT;}); DB.wip_inventory.forEach(w=>{if(w.hw_type===oldT)w.hw_type=newT;}); DB.output_targets.forEach(t=>{if(t.hw_type===oldT)t.hw_type=newT;});
    S.remove('price_settings',{hw_type:oldT}); S.persist('price_settings',row); S.saveLocal(); S.toast('Renamed → '+newT+' (Flush to sync linked records)'); S.bump(); };
  const addType=()=>{ let n='New Type',i=2; while(DB.price_settings.find(p=>p.hw_type===n))n='New Type '+(i++);
    const r={hw_type:n,price:0}; DB.price_settings.push(r); S.persist('price_settings',r); S.bump(); };
  const delType=(hw)=>{ DB.price_settings=DB.price_settings.filter(p=>p.hw_type!==hw); S.remove('price_settings',{hw_type:hw}); S.saveLocal(); S.bump(); };

  // ── team budgets (monthly) ──
  const tbGet=(team)=>DB.team_budgets.find(b=>b.team===team&&b.period_key===month)||{budget:0,forecast:0,_missing:true};
  const tbSet=(team,field,val)=>{ let r=DB.team_budgets.find(b=>b.team===team&&b.period_key===month);
    if(!r){r={team,period_key:month,budget:0,forecast:0};DB.team_budgets.push(r);} r[field]=Math.max(0,parseFloat(val||0)); delete r.placeholder;
    S.persist('team_budgets',r); S.bump(); };

  // ── output targets (monthly) ──
  const findTarget=(hw)=>DB.output_targets.find(t=>t.period_type==='monthly'&&t.period_key===month&&t.plan_type===plan&&t.hw_type===hw&&t.team==='ALL');
  const setTarget=(hw,val)=>{ let row=findTarget(hw); const n=Math.max(0,parseInt(val||0,10));
    if(!row){ row={id:plan[0]+'-'+month+'-'+hw,period_type:'monthly',period_key:month,plan_type:plan,hw_type:hw,team:'ALL',target_count:n}; DB.output_targets.push(row); } else row.target_count=n;
    S.persist('output_targets',row); S.bump(); };
  const fillRunRate=()=>{ const scope=E.periodList('monthly',6,month); const per=E.projectRunRate('monthly',scope);
    const mix={}; let tot=0; DB.output_records.forEach(r=>{const k=E.periodOf(r,'monthly'); if(scope.includes(k)){mix[r.hw_type]=(mix[r.hw_type]||0)+1;tot++;}});
    hws.forEach(hw=>{ const share=tot?(mix[hw]||0)/tot:0; setTarget(hw, Math.round(per*share)); }); S.toast('Projected filled from 6-month run-rate'); };

  const totTargets=hws.reduce((s,hw)=>{const r=findTarget(hw);return s+(r?r.target_count:0);},0);
  const totTargetRev=hws.reduce((s,hw)=>{const r=findTarget(hw);return s+((r?r.target_count:0)*E.price(hw));},0);
  const monthLbl=E.periodLabel('monthly',month);

  return (
    <div className="view-inner">
      <div className="row between wrap" style={{gap:10}}>
        <div className="row" style={{gap:10}}><span className="muted-s">Planning month</span>
          <select value={month} onChange={e=>setMonth(e.target.value)}>{monthOpts.map(m=><option key={m} value={m}>{E.periodLabel('monthly',m)}</option>)}</select></div>
        <span className="muted-s">Budgets &amp; targets are set per month · price book is global</span>
      </div>

      <Panel title="Price Book" icon={I.money} sub="₱ per hardware type — drives all revenue"
        right={<button className="btn sm" onClick={addType}><Icon d={I.plus} size={12}/> Add type</button>} pad={false}>
        <table className="dt"><thead><tr><th>Hardware Type</th><th className="num">Price (₱)</th><th></th><th></th></tr></thead>
          <tbody>{DB.price_settings.map(p=>(<tr key={p.hw_type}>
            <td><input type="text" defaultValue={p.hw_type} style={{width:180}} onBlur={e=>renameType(p.hw_type,e.target.value)}/></td>
            <td className="num"><input type="number" value={p.price} style={{width:120,textAlign:'right'}} onChange={e=>setPrice(p.hw_type,e.target.value)}/></td>
            <td>{p.placeholder&&<span className="tag gold">placeholder</span>}</td>
            <td><button className="btn sm danger" onClick={()=>delType(p.hw_type)}>✕</button></td></tr>))}
            {DB.price_settings.length===0&&<tr><td colSpan="4"><div className="empty">No hardware types — add one</div></td></tr>}</tbody></table>
      </Panel>

      <div className="grid g-2">
        <Panel title="Team Budgets" icon={I.users} sub={'monthly · '+monthLbl} pad={false}>
          <table className="dt"><thead><tr><th>Team</th><th className="num">Budget (₱)</th><th className="num">Forecast (₱)</th></tr></thead>
            <tbody>{teams.map(t=>{const b=tbGet(t);return(<tr key={t}><td>{t}{b._missing&&<span className="muted-s"> · not set</span>}</td>
              <td className="num"><input type="number" value={b.budget} style={{width:120,textAlign:'right'}} onChange={e=>tbSet(t,'budget',e.target.value)}/></td>
              <td className="num"><input type="number" value={b.forecast} style={{width:120,textAlign:'right'}} onChange={e=>tbSet(t,'forecast',e.target.value)}/></td></tr>);})}</tbody></table>
        </Panel>
        <Panel title="Output Targets" icon={I.target} sub={'monthly · '+monthLbl}
          right={<div className="row" style={{gap:8}}><Seg value={plan} options={[{k:'budget',l:'Budget'},{k:'projected',l:'Projected'}]} onChange={setPlan}/>
            {plan==='projected'&&<button className="btn sm" onClick={fillRunRate}>Fill run-rate</button>}</div>} pad={false}>
          <table className="dt"><thead><tr><th>Hardware Type</th><th className="num">Target Boards</th><th className="num">= ₱ Revenue</th></tr></thead>
            <tbody>{hws.map(hw=>{const r=findTarget(hw);const c=r?r.target_count:0;return(<tr key={hw}><td>{hw}</td>
              <td className="num"><input type="number" value={c} style={{width:90,textAlign:'right'}} onChange={e=>setTarget(hw,e.target.value)}/></td>
              <td className="num">{peso(c*E.price(hw))}</td></tr>);})}
              <tr><td style={{fontWeight:600}}>Total</td><td className="num" style={{fontWeight:600}}>{totTargets}</td>
                <td className="num" style={{fontWeight:600,color:'var(--accent)'}}>{peso(totTargetRev)}</td></tr></tbody></table>
        </Panel>
      </div>
    </div>
  );
}
window.RevenueTargets=RevenueTargets;
