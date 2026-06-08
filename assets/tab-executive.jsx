// tab-executive.jsx — Executive Pulse (KPI grid + period selector + anchor trends + team rollup)
function periodsWithData(pt){
  const E=window.ENGINE, DB=window.STORE.DB;
  const keys=new Set();
  DB.output_records.forEach(r=>keys.add(E.periodOf(r,pt)));
  DB.output_targets.filter(t=>t.period_type===pt).forEach(t=>keys.add(t.period_key));
  return [...keys].sort();
}
function setPeriod(patch){ Object.assign(window.STORE.state,patch); window.STORE.bump(); }

function Executive(){
  useStore(); const E=window.ENGINE, S=window.STORE, st=S.state, DB=S.DB;
  const pt=st.periodType, pk=st.periodKey, team=st.teamFilter||'';
  const cfg=DB.config;

  const ao=E.actualOutput(pt,pk,team), ar=E.actualRevenue(pt,pk,team);
  const bo=E.planOutput(pt,pk,'budget',team), br=E.planRevenue(pt,pk,'budget',team);
  const po=E.planOutput(pt,pk,'projected',team), pr=E.planRevenue(pt,pk,'projected',team);
  const og=ao-bo, rg=ar-br;
  const man=E.manning(); const manCls=man.fill>=cfg.manningGreenPct?'green':man.fill>=cfg.manningYellowPct?'yellow':'red';
  const wip=E.activeWip(); const aged=wip.filter(w=>E.wipAge(w)>=cfg.agingFlagDays).length;
  const ci=E.competencyIndex(); const ciPct=Math.round(ci/3*100);
  const ciCls=ci>=cfg.competencyGreen?'green':ci>=cfg.competencyYellow?'yellow':'red';

  const n=pt==='weekly'?cfg.trendWindowWeekly:cfg.trendWindowMonthly;
  const ser=E.buildSeries(pt,n,pk,team);
  const teams=[...new Set(DB.engineers.filter(e=>!e.resigned).map(e=>e.team))];
  const opts=periodsWithData(pt).filter(k=>E.clampPeriod(pt,k)===k); if(opts.length && !opts.includes(pk)) setPeriod({periodKey:opts[opts.length-1]});

  const card=(key,label,value,sub,cls,icon)=>(<KpiCard key={key} label={label} value={value} sub={sub} cls={cls} icon={icon} onClick={()=>{Object.assign(st,{modalKey:key,modalPeriodType:pt,modalRange:n});S.bump();}}/>);

  const priced=DB.price_settings.some(p=>p.placeholder);
  return (
    <div className="view-inner">
      {priced && <div className="warn-bar">Price book uses <b>placeholder</b> peso values — set real prices on <b>Revenue &amp; Targets</b>; all revenue figures re-flow automatically.</div>}
      {/* period selector */}
      <div className="row between wrap" style={{gap:12}}>
        <div className="row" style={{gap:10}}>
          <Seg value={pt} options={[{k:'weekly',l:'Weekly'},{k:'monthly',l:'Monthly'}]} onChange={v=>{const o=periodsWithData(v);setPeriod({periodType:v,periodKey:o[o.length-1]||''});}}/>
          <select value={pk} onChange={e=>setPeriod({periodKey:e.target.value})}>
            {opts.map(k=><option key={k} value={k}>{E.periodLabel(pt,k)}</option>)}
          </select>
        </div>
        <select value={team} onChange={e=>setPeriod({teamFilter:e.target.value})}>
          <option value="">All teams</option>{teams.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* KPI grid */}
      <div className="kpi-grid">
        {card('total_output','Total Output',fmtInt(ao),'vs budget '+bo+' · proj '+po,'teal',I.box)}
        {card('actual_revenue','Actual Revenue',peso(ar),'= output × price book',ar>=br?'green':'red',I.money)}
        {card('projected_revenue','Projected Revenue',peso(pr),'from projected targets','blue',I.pulse)}
        {card('budget_revenue','Budget Revenue',peso(br),'from budget targets','yellow',I.money)}
        {card('output_gap','Output Gap vs Budget',(og>=0?'+':'')+og,E.pct(og,bo)+' of budget',og>=0?'green':'red',I.target)}
        {card('revenue_gap','Revenue Gap vs Budget',peso(rg),E.pct(rg,br)+' of budget',rg>=0?'green':'red',I.target)}
        {card('manning','Manning Capacity',man.fill+'%','HC '+man.cur+' / '+man.target,manCls,I.users)}
        {card('total_wip','Total WIP',fmtInt(wip.length),aged+' aging > '+cfg.agingFlagDays+'d',aged?'yellow':'blue',I.box)}
        {card('competency','Competency Index',ci.toFixed(2)+' /3',ciPct+'% · '+DB.engineers.filter(e=>!e.resigned).length+' eng',ciCls,I.star)}
      </div>

      {/* anchor trends */}
      <div className="grid g-2">
        <Panel title="Output Trend" icon={I.box} sub="Actual / Projected / Budget">
          <Combo labels={ser.labels} actual={ser.outActual} proj={ser.outProj} budget={ser.outBudget} h={230}/>
        </Panel>
        <Panel title="Revenue Trend" icon={I.money} sub="₱ Actual / Projected / Budget">
          <Combo labels={ser.labels} actual={ser.revActual} proj={ser.revProj} budget={ser.revBudget} money h={230}/>
        </Panel>
      </div>

      {/* team rollup */}
      <Panel title="Team Summary" icon={I.users} sub={E.periodLabel(pt,pk)} pad={false}>
        <table className="dt">
          <thead><tr><th>Team</th><th className="num">HC</th><th className="num">Output</th><th className="num">Revenue</th><th className="num">Gap vs Budget</th></tr></thead>
          <tbody>{teams.map(tm=>{const o=E.actualOutput(pt,pk,tm),r=E.actualRevenue(pt,pk,tm),g=E.revenueGap(pt,pk,'budget',tm);
            const hc=DB.engineers.filter(e=>!e.resigned&&e.team===tm).length;
            return <tr key={tm}><td>{tm}</td><td className="num">{hc}</td><td className="num">{o}</td><td className="num">{peso(r)}</td>
              <td className="num" style={{color:g>=0?'var(--accent-green)':'var(--accent-red)'}}>{peso(g)}</td></tr>;})}
          </tbody>
        </table>
      </Panel>

      <KpiModal/>
    </div>
  );
}
window.Executive=Executive;
