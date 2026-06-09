// tab-import.jsx — Excel/CSV import with column mapping, overwrite, feedback (§8.9)
const { useState: useSi, useRef: useRi } = React;
const ENT_FIELDS={
  output_records:{label:'Output Records',req:['hardware_id'],fields:['hardware_id','hw_type','activity_category','workweek','output_date','engineer_id','team','qty']},
  wip_inventory:{label:'WIP Inventory',req:['hardware_id'],fields:['hardware_id','hw_type','tx_category','status','debug_start','debug_end','engineer_id','team','notes']},
  output_targets:{label:'Output Targets',req:['period_key','hw_type'],fields:['period_type','period_key','plan_type','hw_type','team','target_count']},
  engineers:{label:'Roster',req:['id'],fields:['id','last','first','pos','team','hired','status']}
};
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
function autoMap(fields,cols){ const m={}; fields.forEach(f=>{ const nf=norm(f);
  let hit=cols.find(c=>norm(c)===nf)||cols.find(c=>norm(c).includes(nf)||nf.includes(norm(c))); m[f]=hit||''; }); return m; }

function ImportTab(){
  useStore(); const S=window.STORE,DB=S.DB; const [entity,setEntity]=useSi('output_records');
  const [log,setLog]=useSi([]); const [preview,setPreview]=useSi(null); const [map,setMap]=useSi({}); const [overwrite,setOverwrite]=useSi(false); const fileRef=useRi(null);
  const spec=ENT_FIELDS[entity];
  const addLog=(m,ok)=>setLog(l=>[{m,ok,t:new Date().toLocaleTimeString()},...l].slice(0,40));

  const onFile=(f)=>{ if(!f)return; if(typeof XLSX==='undefined'){addLog('SheetJS not loaded — cannot parse',false);S.toast('SheetJS not loaded');return;}
    const rd=new FileReader(); rd.onload=ev=>{ try{ const wb=XLSX.read(ev.target.result,{type:'array'});
      const ws=wb.Sheets[wb.SheetNames[0]]; const rows=XLSX.utils.sheet_to_json(ws,{defval:''});
      const cols=Object.keys(rows[0]||{}); setPreview({cols,rows,sheet:wb.SheetNames[0],file:f.name}); setMap(autoMap(spec.fields,cols));
      addLog('Read '+rows.length+' rows from "'+wb.SheetNames[0]+'" ('+f.name+')',true);
    }catch(e){addLog('Parse error: '+e.message,false);} }; rd.readAsArrayBuffer(f); };
  const reMap=(ent)=>{ setEntity(ent); if(preview)setMap(autoMap(ENT_FIELDS[ent].fields,preview.cols)); };

  const commit=()=>{ if(!preview){S.toast('Nothing to import');return;}
    const missingReq=spec.req.filter(r=>!map[r]);
    if(missingReq.length){ addLog('Map required column(s): '+missingReq.join(', '),false); S.toast('Map required: '+missingReq.join(', ')); return; }
    const g=(row,f)=>{ const c=map[f]; return c?row[c]:''; };
    let added=0,updated=0,skipDup=0,skipBad=0;
    const handle=(arr,keyName,keyVal,rec)=>{ const ex=arr.find(x=>x[keyName]===keyVal);
      if(ex){ if(overwrite){ Object.assign(ex,rec); S.persist(arr===DB.output_records?'output_records':arr===DB.wip_inventory?'wip_inventory':'engineers',ex); updated++; } else skipDup++; return; }
      arr.push(rec); S.persist(arr===DB.output_records?'output_records':arr===DB.wip_inventory?'wip_inventory':'engineers',rec); added++; };
    preview.rows.forEach(r=>{ try{
      if(entity==='output_records'){ const hid=String(g(r,'hardware_id')||'').trim(); if(!hid){skipBad++;return;}
        const rec={id:hid,hardware_id:hid,hw_type:g(r,'hw_type')||'Other',activity_category:g(r,'activity_category')||DB.config.defaultActivityCategory,
          workweek:g(r,'workweek')||'',output_date:g(r,'output_date')||'',engineer_id:g(r,'engineer_id')?+g(r,'engineer_id'):null,team:g(r,'team')||'',qty:+g(r,'qty')||1};
        if(!rec.output_date&&rec.workweek){try{rec.output_date=window.WW.toDate(rec.workweek).toISOString().slice(0,10);}catch(e){}}
        handle(DB.output_records,'hardware_id',hid,rec); }
      else if(entity==='wip_inventory'){ const hid=String(g(r,'hardware_id')||'').trim(); if(!hid){skipBad++;return;}
        const rec={id:hid,hardware_id:hid,hw_type:g(r,'hw_type')||'Other',tx_category:g(r,'tx_category')||'',status:g(r,'status')||'Queued',
          debug_start:g(r,'debug_start')||'',debug_end:g(r,'debug_end')||null,engineer_id:g(r,'engineer_id')?+g(r,'engineer_id'):null,team:g(r,'team')||'',notes:g(r,'notes')||''};
        handle(DB.wip_inventory,'hardware_id',hid,rec); }
      else if(entity==='output_targets'){ const pk=String(g(r,'period_key')||'').trim(),hw=g(r,'hw_type'); if(!pk||!hw){skipBad++;return;}
        const ptype=g(r,'period_type')||'monthly',plan=g(r,'plan_type')||'budget',team=g(r,'team')||'ALL';
        const ex=DB.output_targets.find(t=>t.period_type===ptype&&t.period_key===pk&&t.plan_type===plan&&t.hw_type===hw&&t.team===team);
        const rec={id:plan+'-'+pk+'-'+hw+'-'+team,period_type:ptype,period_key:pk,plan_type:plan,hw_type:hw,team,target_count:+g(r,'target_count')||0};
        if(ex){ if(overwrite){Object.assign(ex,rec);S.persist('output_targets',ex);updated++;} else skipDup++; } else {DB.output_targets.push(rec);S.persist('output_targets',rec);added++;} }
      else if(entity==='engineers'){ const id=+g(r,'id'); if(!id){skipBad++;return;}
        const rec={id,no:String(id),last:g(r,'last')||'',first:g(r,'first')||'',name:(g(r,'last')||'')+', '+(g(r,'first')||''),pos:g(r,'pos')||'Engineer1',team:g(r,'team')||'',hired:g(r,'hired')||'',resigned:null,status:g(r,'status')||'Regular'};
        handle(DB.engineers,'id',id,rec); }
    }catch(e){skipBad++;} });
    const msg='Committed '+added+(updated?(' · '+updated+' updated'):'')+(skipDup?(' · '+skipDup+' dup skipped'):'')+(skipBad?(' · '+skipBad+' invalid'):'')+' ('+spec.label+')';
    addLog(msg, added+updated>0); S.toast(msg); setPreview(null); S.saveLocal(); S.bump(); };

  return (
    <div className="view-inner">
      <Panel title="Import Data" icon={I.upload} sub="Excel / CSV via SheetJS">
        <div className="row wrap" style={{gap:10,marginBottom:12}}>
          <label className="muted-s">Map sheet to:</label>
          <select value={entity} onChange={e=>reMap(e.target.value)}>{Object.entries(ENT_FIELDS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select>
          <button className="btn" onClick={()=>fileRef.current.click()}>Choose file…</button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{display:'none'}} onChange={e=>{onFile(e.target.files[0]);e.target.value='';}}/>
          <label className="row" style={{gap:6,cursor:'pointer'}}><input type="checkbox" checked={overwrite} onChange={e=>setOverwrite(e.target.checked)}/><span className="muted-s">Overwrite existing</span></label>
          {preview&&<button className="btn pri" onClick={commit}>Commit {preview.rows.length} rows</button>}
        </div>
        {!preview&&<div className="callout">Pick the target entity, choose a file, then confirm the <b>column mapping</b>. Headers are matched automatically; adjust any that didn't. With <b>Overwrite existing</b> off, duplicate IDs are skipped; on, they update the existing record.</div>}
        {preview&&<>
          <div className="panel inset" style={{padding:12,marginBottom:12}}>
            <div className="muted-s" style={{marginBottom:8}}>Column mapping — <b>{preview.file}</b> · sheet "{preview.sheet}" · {preview.rows.length} rows · {overwrite?'overwrite ON':'skip duplicates'}</div>
            <div className="grid g-3">{spec.fields.map(f=>(<div key={f} className="frow" style={{gridTemplateColumns:'1fr',gap:4,padding:0}}>
              <label>{f}{spec.req.includes(f)&&<span style={{color:'var(--accent-red)'}}> *</span>}</label>
              <select value={map[f]||''} onChange={e=>setMap({...map,[f]:e.target.value})}>
                <option value="">— none —</option>{preview.cols.map(c=><option key={c} value={c}>{c}</option>)}</select></div>))}</div>
          </div>
          <div className="tbl-wrap" style={{maxHeight:260}}><table className="dt">
            <thead><tr>{preview.cols.map(c=><th key={c}>{c}</th>)}</tr></thead>
            <tbody>{preview.rows.slice(0,20).map((r,i)=><tr key={i}>{preview.cols.map(c=><td key={c}>{String(r[c])}</td>)}</tr>)}</tbody></table></div>
        </>}
      </Panel>
      <Panel title="Import Log" icon={I.layers} pad={false}>
        {log.length===0?<div className="empty">No imports yet</div>:
          <table className="dt"><tbody>{log.map((l,i)=><tr key={i}><td className="mono muted-s" style={{width:90}}>{l.t}</td>
            <td><span className={'tag '+(l.ok?'green':'red')}>{l.ok?'ok':'note'}</span></td><td>{l.m}</td></tr>)}</tbody></table>}
      </Panel>
    </div>
  );
}
window.ImportTab=ImportTab;
