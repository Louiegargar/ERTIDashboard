// kpi-modal.jsx — reusable KPI drill-down (§8.2)
const KPI_MODAL={
  total_output:{title:'Output: Actual vs Projected vs Budget',kind:'comboOut'},
  actual_revenue:{title:'Revenue: Actual vs Projected vs Budget',kind:'comboRev'},
  projected_revenue:{title:'Projected vs Actual Revenue',kind:'lineRev',plan:'projected'},
  budget_revenue:{title:'Budget vs Actual Revenue',kind:'lineRev',plan:'budget'},
  output_gap:{title:'Output Gap vs Budget',kind:'gap',unit:'boards'},
  revenue_gap:{title:'Revenue Gap vs Budget',kind:'gap',unit:'peso'},
  manning:{title:'Manning: Current vs Target',kind:'manning'},
  total_wip:{title:'WIP by Aging Bucket',kind:'wipAging'},
  competency:{title:'Competency by Platform',kind:'competency'}
};
function KpiModal(){
  useStore(); const E=window.ENGINE,S=window.STORE,st=S.state,DB=S.DB;
  const key=st.modalKey; const cfg=key?KPI_MODAL[key]:null;
  const close=()=>{st.modalKey=null;S.bump();};
  if(!cfg) return <Modal open={false} onClose={close}/>;
  const pt=st.modalPeriodType, range=st.modalRange||(pt==='weekly'?DB.config.trendWindowWeekly:DB.config.trendWindowMonthly);
  const ser=E.buildSeries(pt,range,st.periodKey,st.teamFilter||'');
  const ranges = pt==='weekly'?[4,8,13]:[3,6,12];

  let body=null, table=null;
  if(cfg.kind==='comboOut'){ body=<Combo labels={ser.labels} actual={ser.outActual} proj={ser.outProj} budget={ser.outBudget} h={260}/>;
    table=ser.periods.map((p,i)=>[ser.labels[i],ser.outActual[i],ser.outProj[i],ser.outBudget[i],ser.outActual[i]-ser.outBudget[i]]);
    var head=['Period','Actual','Proj','Budget','Gap']; }
  else if(cfg.kind==='comboRev'){ body=<Combo labels={ser.labels} actual={ser.revActual} proj={ser.revProj} budget={ser.revBudget} money h={260}/>;
    table=ser.periods.map((p,i)=>[ser.labels[i],peso(ser.revActual[i]),peso(ser.revProj[i]),peso(ser.revBudget[i]),peso(ser.revActual[i]-ser.revBudget[i])]);
    var head=['Period','Actual','Proj','Budget','Gap']; }
  else if(cfg.kind==='lineRev'){ const plan=cfg.plan==='projected'?ser.revProj:ser.revBudget;
    body=<LineVs labels={ser.labels} actual={ser.revActual} plan={plan} planLabel={cfg.plan} money h={260}/>;
    table=ser.periods.map((p,i)=>[ser.labels[i],peso(ser.revActual[i]),peso(plan[i]),peso(ser.revActual[i]-plan[i])]);
    var head=['Period','Actual',cfg.plan,'Gap']; }
  else if(cfg.kind==='gap'){ const money=cfg.unit==='peso';
    const data=ser.periods.map((p,i)=>money?ser.revActual[i]-ser.revBudget[i]:ser.outActual[i]-ser.outBudget[i]);
    body=<GapBars labels={ser.labels} data={data} money={money} h={260}/>;
    table=ser.periods.map((p,i)=>[ser.labels[i], money?peso(data[i]):data[i]]); var head=['Period','Gap']; }
  else if(cfg.kind==='manning'){ const m=E.manning(); const teams=Object.keys(m.teams);
    body=<ManningBars teams={teams} cur={teams.map(t=>m.teams[t].cur)} target={teams.map(t=>m.teams[t].target)} h={240}/>;
    table=teams.map(t=>[t,m.teams[t].cur,m.teams[t].target||'—', (m.teams[t].target?Math.round(m.teams[t].cur/m.teams[t].target*100)+'%':'—')]); var head=['Team','Current','Target','Fill']; }
  else if(cfg.kind==='wipAging'){ const wip=E.activeWip(); const b=DB.config.agingBuckets;
    const labels=b.map(x=>x[1]>=9999?x[0]+'+ d':x[0]+'–'+x[1]+' d'); const counts=b.map(()=>0);
    wip.forEach(w=>{counts[E.agingBucket(E.wipAge(w))]++;}); body=<AgingBars labels={labels} data={counts} h={240}/>;
    table=labels.map((l,i)=>[l,counts[i]]); var head=['Aging bucket','WIP items']; }
  else if(cfg.kind==='competency'){ const plats=DB.PLAT||['Testcard','Faceplate','Perfboard','Handler/Ins'];
    const vals=plats.map(pl=>{const rs=DB.platform_ratings.filter(r=>r.platform===pl);return rs.length?+(rs.reduce((s,r)=>s+r.rating,0)/rs.length).toFixed(2):0;});
    body=<CompetencyRadar axes={plats} values={vals} h={260}/>; table=plats.map((pl,i)=>[pl,vals[i]]); var head=['Platform','Avg rating /3']; }

  return (
    <Modal open={true} title={cfg.title} big={null} onClose={close}
      footer={<button className="btn" onClick={close}>Close</button>}>
      <div className="row between wrap" style={{gap:10,marginBottom:12}}>
        <Seg value={pt} options={[{k:'weekly',l:'Weekly'},{k:'monthly',l:'Monthly'}]} onChange={v=>{st.modalPeriodType=v;st.modalRange=v==='weekly'?DB.config.trendWindowWeekly:DB.config.trendWindowMonthly;S.bump();}}/>
        <Seg value={range} options={ranges.map(r=>({k:r,l:'last '+r}))} onChange={v=>{st.modalRange=v;S.bump();}}/>
      </div>
      {body}
      <div className="tbl-wrap" style={{marginTop:12,maxHeight:220}}>
        <table className="dt"><thead><tr>{head.map((h,i)=><th key={i} className={i?'num':''}>{h}</th>)}</tr></thead>
        <tbody>{table.map((row,i)=><tr key={i}>{row.map((c,j)=><td key={j} className={j?'num':''}>{c}</td>)}</tr>)}</tbody></table>
      </div>
    </Modal>
  );
}
window.KpiModal=KpiModal; window.KPI_MODAL=KPI_MODAL;
