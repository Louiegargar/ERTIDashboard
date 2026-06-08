// tab-output.jsx — record-level output entry (§8.4)
const { useState: useSo } = React;
function engName(id){ const e=window.STORE.DB.engineers.find(x=>x.id===id); return e?e.name:'—'; }
function blankRec(){ const DB=window.STORE.DB; return { hardware_id:'', hw_type:DB.price_settings[0]&&DB.price_settings[0].hw_type, activity_category:DB.config.defaultActivityCategory, workweek:window.WW.fromDate(new Date()), output_date:new Date().toISOString().slice(0,10), engineer_id:null, team:'', qty:1 }; }

function OutputTab(){
  useStore(); const E=window.ENGINE,S=window.STORE,DB=S.DB;
  const [fTeam,setFTeam]=useSo(''); const [fType,setFType]=useSo(''); const [q,setQ]=useSo('');
  const [edit,setEdit]=useSo(null); // record being edited or new
  const [err,setErr]=useSo('');

  const teams=[...new Set(DB.engineers.map(e=>e.team))];
  const rows=DB.output_records.filter(r=>(!fTeam||r.team===fTeam)&&(!fType||r.hw_type===fType)&&(!q||r.hardware_id.toLowerCase().includes(q.toLowerCase())))
    .sort((a,b)=>(b.output_date||'').localeCompare(a.output_date||''));
  const totRev=rows.reduce((s,r)=>s+(r.qty||1)*E.price(r.hw_type),0);
  const mix={}; rows.forEach(r=>mix[r.activity_category]=(mix[r.activity_category]||0)+1);

  const save=()=>{ const r=edit; if(!r.hardware_id){setErr('Hardware ID required');return;}
    const dup=DB.output_records.find(x=>x.hardware_id===r.hardware_id && x!==r._orig);
    if(dup && (!r._orig||dup.hardware_id!==r._orig.hardware_id)){setErr('Hardware ID must be unique');return;}
    if(r.engineer_id){const e=DB.engineers.find(x=>x.id===+r.engineer_id);if(e)r.team=e.team;}
    r.workweek=r.workweek||window.WW.fromDate(new Date(r.output_date));
    const rec={id:r.hardware_id,hardware_id:r.hardware_id,hw_type:r.hw_type,activity_category:r.activity_category,workweek:r.workweek,output_date:r.output_date,engineer_id:r.engineer_id?+r.engineer_id:null,team:r.team,qty:+r.qty||1};
    if(r._orig){ Object.assign(r._orig,rec); } else { DB.output_records.push(rec); }
    S.persist('output_records',rec); setEdit(null); setErr(''); S.bump(); };
  const del=(r)=>{ DB.output_records=DB.output_records.filter(x=>x!==r); S.remove('output_records',{hardware_id:r.hardware_id}); S.saveLocal(); S.bump(); };

  return (
    <div className="view-inner">
      <div className="row between wrap" style={{gap:10}}>
        <div className="filters">
          <select value={fTeam} onChange={e=>setFTeam(e.target.value)}><option value="">All teams</option>{teams.map(t=><option key={t}>{t}</option>)}</select>
          <select value={fType} onChange={e=>setFType(e.target.value)}><option value="">All types</option>{DB.price_settings.map(p=><option key={p.hw_type}>{p.hw_type}</option>)}</select>
          <input type="text" placeholder="Search hardware ID…" value={q} onChange={e=>setQ(e.target.value)} style={{width:180}}/>
        </div>
        <button className="btn pri" onClick={()=>{setErr('');setEdit(blankRec());}}><Icon d={I.plus} size={13}/> Add Output</button>
      </div>

      <div className="grid g-3">
        <Tile label="Output Records" value={fmtInt(rows.length)} accent="var(--accent-teal)"/>
        <Tile label="Total Revenue" value={peso(totRev)} accent="var(--accent-green)"/>
        <div className="tile"><div className="tl" style={{marginBottom:6}}>Activity Mix</div>
          <div className="row wrap" style={{gap:6}}>{Object.keys(mix).length?Object.entries(mix).map(([k,v])=><span key={k} className="tag">{k} {v}</span>):<span className="muted-s">—</span>}</div></div>
      </div>

      <Panel title="Output Records" icon={I.box} sub={rows.length+' shown'} pad={false}>
        <div className="tbl-wrap"><table className="dt">
          <thead><tr><th>WW</th><th>Hardware ID</th><th>Type</th><th>Activity</th><th>Date</th><th>Engineer</th><th>Team</th><th className="num">₱</th><th></th></tr></thead>
          <tbody>{rows.map((r,i)=>(<tr key={i}>
            <td className="mono">{r.workweek}</td><td className="mono">{r.hardware_id}</td><td>{r.hw_type}</td><td>{r.activity_category}</td>
            <td className="mono">{r.output_date}</td><td>{r._owners||engName(r.engineer_id)}</td><td>{r.team}</td><td className="num">{peso((r.qty||1)*E.price(r.hw_type))}</td>
            <td><div className="row" style={{gap:4}}><button className="btn sm" onClick={()=>{setErr('');setEdit(Object.assign({},r,{_orig:r}));}}>Edit</button>
              <button className="btn sm danger" onClick={()=>del(r)}>✕</button></div></td></tr>))}
          </tbody></table>
          {rows.length===0&&<div className="empty">No output records match the filters</div>}
        </div>
      </Panel>

      {edit&&<Modal open={true} title={edit._orig?'Edit Output':'Add Output'} onClose={()=>setEdit(null)}
        footer={<><button className="btn" onClick={()=>setEdit(null)}>Cancel</button><button className="btn pri" onClick={save}>Save</button></>}>
        {err&&<div className="warn-bar" style={{marginBottom:10}}>{err}</div>}
        <div className="frow"><label>Hardware ID *</label><input type="text" value={edit.hardware_id} onChange={e=>setEdit({...edit,hardware_id:e.target.value})}/></div>
        <div className="frow"><label>Hardware Type *</label><select value={edit.hw_type} onChange={e=>setEdit({...edit,hw_type:e.target.value})}>{DB.price_settings.map(p=><option key={p.hw_type}>{p.hw_type}</option>)}</select></div>
        <div className="frow"><label>Activity *</label><select value={edit.activity_category} onChange={e=>setEdit({...edit,activity_category:e.target.value})}>{DB.VOCAB.activityCategory.map(a=><option key={a}>{a}</option>)}</select></div>
        <div className="frow"><label>Output Date</label><input type="date" value={edit.output_date} onChange={e=>setEdit({...edit,output_date:e.target.value,workweek:window.WW.fromDate(new Date(e.target.value))})}/></div>
        <div className="frow"><label>Workweek</label><input type="text" value={edit.workweek} onChange={e=>setEdit({...edit,workweek:e.target.value})}/></div>
        <div className="frow"><label>Engineer</label><select value={edit.engineer_id||''} onChange={e=>setEdit({...edit,engineer_id:e.target.value})}><option value="">—</option>{DB.engineers.map(en=><option key={en.id} value={en.id}>{en.name}</option>)}</select></div>
        <div className="frow"><label>Qty</label><input type="number" value={edit.qty} style={{width:80}} onChange={e=>setEdit({...edit,qty:e.target.value})}/></div>
      </Modal>}
    </div>
  );
}
window.OutputTab=OutputTab;
