// tab-skills.jsx — platform experience ratings + competency (§8.7)
function Skills(){
  useStore(); const E=window.ENGINE,S=window.STORE,DB=S.DB,cfg=DB.config;
  const plats=DB.PLAT||['Testcard','Faceplate','Perfboard','Handler/Ins'];
  const engs=DB.engineers.filter(e=>!e.resigned);
  const ratingOf=(id,pl)=>{const r=DB.platform_ratings.find(x=>x.engineer_id===id&&x.platform===pl);return r?r.rating:0;};
  const setRating=(id,pl,v)=>{ let r=DB.platform_ratings.find(x=>x.engineer_id===id&&x.platform===pl);
    const n=Math.max(0,Math.min(3,parseInt(v||0,10))); if(!r){r={engineer_id:id,platform:pl,rating:n};DB.platform_ratings.push(r);} else r.rating=n;
    S.persist('platform_ratings',r);S.bump(); };
  const ci=E.competencyIndex();
  const platAvg=plats.map(pl=>{const rs=DB.platform_ratings.filter(r=>r.platform===pl);return rs.length?+(rs.reduce((s,r)=>s+r.rating,0)/rs.length).toFixed(2):0;});
  const ciCls=ci>=cfg.competencyGreen?'var(--accent-green)':ci>=cfg.competencyYellow?'var(--accent-gold)':'var(--accent-red)';
  return (
    <div className="view-inner">
      <div className="callout">Ratings are a <b>platform experience index</b> (0–3) seeded from real output volume per build type — not an HR skills assessment. Edit freely; competency derives from the mean.</div>
      <div className="grid g-3">
        <Tile label="Competency Index" value={ci.toFixed(2)+' /3'} accent={ciCls}/>
        <Tile label="% of Max" value={Math.round(ci/3*100)+'%'}/>
        <Tile label="Active Engineers" value={engs.length}/>
      </div>
      <div className="grid g-2-1">
        <Panel title="Platform Ratings" icon={I.layers} sub="0–3 scale" pad={false}>
          <div className="tbl-wrap"><table className="dt">
            <thead><tr><th style={{position:'sticky',left:0,background:'var(--panel)'}}>Engineer</th>{plats.map(p=><th key={p} className="num">{p}</th>)}<th className="num">Avg</th></tr></thead>
            <tbody>{engs.map(e=>{const avg=E.avgRating(e.id);return(<tr key={e.id}><td style={{position:'sticky',left:0,background:'var(--panel)'}}>{e.name}</td>
              {plats.map(pl=><td key={pl} className="num" style={{padding:2}}><select value={ratingOf(e.id,pl)} onChange={ev=>setRating(e.id,pl,ev.target.value)} style={{width:48,padding:3}}>{[0,1,2,3].map(n=><option key={n}>{n}</option>)}</select></td>)}
              <td className="num" style={{fontWeight:600}}>{avg.toFixed(2)}</td></tr>);})}</tbody></table></div>
        </Panel>
        <Panel title="Competency Radar" icon={I.star} sub="avg by platform">
          <CompetencyRadar axes={plats} values={platAvg} h={250}/>
        </Panel>
      </div>
    </div>
  );
}
window.Skills=Skills;
