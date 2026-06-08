// tab-wip.jsx — WIP inventory + aging + complete→output loop (§8.5)
const { useState: useSw } = React;
function blankWip(){ const DB=window.STORE.DB; return { hardware_id:'', hw_type:DB.price_settings[0].hw_type, tx_category:DB.VOCAB.txCategory[0], status:'Queued', debug_start:new Date().toISOString().slice(0,10), debug_end:null, engineer_id:null, team:'F2-LTX', notes:'' }; }
function ageColor(age,cfg){ const b=cfg.agingBuckets; const i=b.findIndex(x=>age>=x[0]&&age<=x[1]);
  return ['var(--accent-green)','var(--accent-gold)','#ff9f43','var(--accent-red)'][i<0?3:i]; }

function WipTab(){
  useStore(); const E=window.ENGINE,S=window.STORE,DB=S.DB,cfg=DB.config;
  const [edit,setEdit]=useSw(null); const [err,setErr]=useSw(''); const [fStatus,setFStatus]=useSw('active');
  const all=DB.wip_inventory; const active=E.activeWip();
  const shown=fStatus==='active'?active:fStatus==='all'?all:all.filter(w=>w.status===fStatus);
  const ages=active.map(E.wipAge); const avg=ages.length?Math.round(ages.reduce((a,b)=>a+b,0)/ages.length):0;
  const oldest=ages.length?Math.max(...ages):0; const overFlag=active.filter(w=>E.wipAge(w)>=cfg.agingFlagDays).length;
  const buckets=cfg.agingBuckets.map(()=>0); active.forEach(w=>buckets[E.agingBucket(E.wipAge(w))]++);
  const bucketLabels=cfg.agingBuckets.map(x=>x[1]>=9999?x[0]+'+ d':x[0]+'–'+x[1]+' d');

  const save=()=>{ const w=edit; if(!w.hardware_id){setErr('Hardware ID required');return;}
    const dup=DB.wip_inventory.find(x=>x.hardware_id===w.hardware_id && x!==w._orig); if(dup){setErr('Hardware ID must be unique');return;}
    if(w.debug_end&&w.debug_start&&w.debug_end<w.debug_start){setErr('Debug end must be ≥ start');return;}
    if(w.engineer_id){const e=DB.engineers.find(x=>x.id===+w.engineer_id);if(e)w.team=e.team;}
    const rec={id:w.hardware_id,hardware_id:w.hardware_id,hw_type:w.hw_type,tx_category:w.tx_category,status:w.status,debug_start:w.debug_start,debug_end:w.debug_end||null,engineer_id:w.engineer_id?+w.engineer_id:null,team:w.team,notes:w.notes||''};
    if(w._orig)Object.assign(w._orig,rec); else DB.wip_inventory.push(rec);
    S.persist('wip_inventory',rec); setEdit(null);setErr('');S.bump(); };
  const del=(w)=>{ DB.wip_inventory=DB.wip_inventory.filter(x=>x!==w); S.remove('wip_inventory',{hardware_id:w.hardware_id}); S.saveLocal(); S.bump(); };
  const complete=(w)=>{ w.status='Completed'; if(!w.debug_end)w.debug_end=new Date().toISOString().slice(0,10);
    S.persist('wip_inventory',w);
    if(!DB.output_records.find(r=>r.hardware_id===w.hardware_id)){ // no double-count guard
      const rec={id:w.hardware_id,hardware_id:w.hardware_id,hw_type:w.hw_type,activity_category:cfg.defaultActivityCategory,
        workweek:window.WW.fromDate(new Date()),output_date:new Date().toISOString().slice(0,10),engineer_id:w.engineer_id||null,team:w.team,qty:1,wip_id:w.id};
      DB.output_records.push(rec); S.persist('output_records',rec); S.toast('Logged output for '+w.hardware_id); }
    S.bump(); };

  return (
    <div className="view-inner">
      <div className="row between wrap" style={{gap:10}}>
        <div className="filters">
          <button className={'fchip'+(fStatus==='active'?' active':'')} onClick={()=>setFStatus('active')}>Active · {active.length}</button>
          <button className={'fchip'+(fStatus==='all'?' active':'')} onClick={()=>setFStatus('all')}>All · {all.length}</button>
          {DB.VOCAB.wipStatus.map(s=><button key={s} className={'fchip'+(fStatus===s?' active':'')} onClick={()=>setFStatus(s)}>{s}</button>)}
        </div>
        <button className="btn pri" onClick={()=>{setErr('');setEdit(blankWip());}}><Icon d={I.plus} size={13}/> Add WIP</button>
      </div>

      <div className="grid g-4">
        <Tile label="Active WIP" value={active.length} accent="var(--accent-blue)"/>
        <Tile label="Avg Age (days)" value={avg}/>
        <Tile label="Oldest (days)" value={oldest} accent={oldest>=cfg.agingFlagDays?'var(--accent-red)':null}/>
        <Tile label={'Over '+cfg.agingFlagDays+'d'} value={overFlag} accent={overFlag?'var(--accent-gold)':null}/>
      </div>

      <div className="grid g-2-1">
        <Panel title="WIP Inventory" icon={I.box} sub={shown.length+' shown'} pad={false}>
          <div className="tbl-wrap"><table className="dt">
            <thead><tr><th>Hardware ID</th><th>Type</th><th>TX</th><th>Status</th><th>Start</th><th>End</th><th className="num">Age</th><th>Eng/Team</th><th></th></tr></thead>
            <tbody>{shown.map((w,i)=>{const age=E.wipAge(w);return(<tr key={i}>
              <td className="mono">{w.hardware_id}</td><td>{w.hw_type}</td><td><span className="tag">{w.tx_category}</span></td>
              <td><span className={'tag '+(w.status==='Completed'?'green':w.status==='Scrapped'?'red':w.status==='In Debug'?'teal':'gold')}>{w.status}</span></td>
              <td className="mono">{w.debug_start||'—'}</td><td className="mono">{w.debug_end||'—'}</td>
              <td className="num" style={{color:ageColor(age,cfg),fontWeight:600}}>{age}</td>
              <td className="muted-s">{w.team}</td>
              <td><div className="row" style={{gap:4}}>
                <button className="btn sm" onClick={()=>{setErr('');setEdit(Object.assign({},w,{_orig:w}));}}>Edit</button>
                {w.status!=='Completed'&&w.status!=='Scrapped'&&<button className="btn sm pri" onClick={()=>complete(w)}>Complete</button>}
                <button className="btn sm danger" onClick={()=>del(w)}>✕</button></div></td></tr>);})}
            </tbody></table>
            {shown.length===0&&<div className="empty">No WIP items</div>}
          </div>
        </Panel>
        <Panel title="Aging Distribution" icon={I.clock} sub="active WIP">
          <AgingBars labels={bucketLabels} data={buckets} h={220}/>
        </Panel>
      </div>

      {edit&&<Modal open={true} title={edit._orig?'Edit WIP':'Add WIP'} onClose={()=>setEdit(null)}
        footer={<><button className="btn" onClick={()=>setEdit(null)}>Cancel</button><button className="btn pri" onClick={save}>Save</button></>}>
        {err&&<div className="warn-bar" style={{marginBottom:10}}>{err}</div>}
        <div className="frow"><label>Hardware ID *</label><input type="text" value={edit.hardware_id} onChange={e=>setEdit({...edit,hardware_id:e.target.value})}/></div>
        <div className="frow"><label>Hardware Type *</label><select value={edit.hw_type} onChange={e=>setEdit({...edit,hw_type:e.target.value})}>{DB.price_settings.map(p=><option key={p.hw_type}>{p.hw_type}</option>)}</select></div>
        <div className="frow"><label>TX Category *</label><select value={edit.tx_category} onChange={e=>setEdit({...edit,tx_category:e.target.value})}>{DB.VOCAB.txCategory.map(t=><option key={t}>{t}</option>)}</select></div>
        <div className="frow"><label>Status</label><select value={edit.status} onChange={e=>setEdit({...edit,status:e.target.value})}>{DB.VOCAB.wipStatus.map(s=><option key={s}>{s}</option>)}</select></div>
        <div className="frow"><label>Debug Start</label><input type="date" value={edit.debug_start||''} onChange={e=>setEdit({...edit,debug_start:e.target.value})}/></div>
        <div className="frow"><label>Debug End</label><input type="date" value={edit.debug_end||''} onChange={e=>setEdit({...edit,debug_end:e.target.value})}/></div>
        <div className="frow"><label>Engineer</label><select value={edit.engineer_id||''} onChange={e=>setEdit({...edit,engineer_id:e.target.value})}><option value="">—</option>{DB.engineers.map(en=><option key={en.id} value={en.id}>{en.name}</option>)}</select></div>
        <div className="frow"><label>Notes</label><input type="text" value={edit.notes||''} onChange={e=>setEdit({...edit,notes:e.target.value})}/></div>
      </Modal>}
    </div>
  );
}
window.WipTab=WipTab;
