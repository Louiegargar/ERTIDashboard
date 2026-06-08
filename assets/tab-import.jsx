// tab-import.jsx — Excel/CSV import with entity mapping (§8.9)
const { useState: useSi, useRef: useRi } = React;
function ImportTab(){
  useStore(); const S=window.STORE,DB=S.DB; const [entity,setEntity]=useSi('output_records');
  const [log,setLog]=useSi([]); const [preview,setPreview]=useSi(null); const fileRef=useRi(null);
  const ENT={ output_records:'Output Records', wip_inventory:'WIP Inventory', output_targets:'Output Targets', engineers:'Roster' };
  const addLog=(m,ok)=>setLog(l=>[{m,ok,t:new Date().toLocaleTimeString()},...l].slice(0,40));
  const onFile=(f)=>{ if(!f)return; if(typeof XLSX==='undefined'){addLog('SheetJS not loaded',false);return;}
    const rd=new FileReader(); rd.onload=ev=>{ try{ const wb=XLSX.read(ev.target.result,{type:'array'});
      const ws=wb.Sheets[wb.SheetNames[0]]; const rows=XLSX.utils.sheet_to_json(ws,{defval:''});
      setPreview({cols:Object.keys(rows[0]||{}),rows}); addLog('Read '+rows.length+' rows from '+f.name+' · sheet "'+wb.SheetNames[0]+'"',true);
    }catch(e){addLog('Parse error: '+e.message,false);} }; rd.readAsArrayBuffer(f); };
  const commit=()=>{ if(!preview)return; let n=0;
    preview.rows.forEach(r=>{ try{
      if(entity==='output_records'){ const rec={id:r.hardware_id,hardware_id:String(r.hardware_id||''),hw_type:r.hw_type,activity_category:r.activity_category||DB.config.defaultActivityCategory,workweek:r.workweek||'',output_date:r.output_date||'',engineer_id:r.engineer_id?+r.engineer_id:null,team:r.team||'',qty:+r.qty||1};
        if(rec.hardware_id&&!DB.output_records.find(x=>x.hardware_id===rec.hardware_id)){DB.output_records.push(rec);S.persist('output_records',rec);n++;} }
      else if(entity==='wip_inventory'){ const rec={id:r.hardware_id,hardware_id:String(r.hardware_id||''),hw_type:r.hw_type,tx_category:r.tx_category||'',status:r.status||'Queued',debug_start:r.debug_start||'',debug_end:r.debug_end||null,engineer_id:r.engineer_id?+r.engineer_id:null,team:r.team||'',notes:r.notes||''};
        if(rec.hardware_id&&!DB.wip_inventory.find(x=>x.hardware_id===rec.hardware_id)){DB.wip_inventory.push(rec);S.persist('wip_inventory',rec);n++;} }
      else if(entity==='output_targets'){ const rec={id:r.plan_type+'-'+r.period_key+'-'+r.hw_type,period_type:r.period_type||'monthly',period_key:String(r.period_key||''),plan_type:r.plan_type||'budget',hw_type:r.hw_type,team:r.team||'ALL',target_count:+r.target_count||0};
        DB.output_targets.push(rec);S.persist('output_targets',rec);n++; }
      else if(entity==='engineers'){ const rec={id:+r.id||+r.no,no:String(r.no||r.id),last:r.last||'',first:r.first||'',name:(r.last||'')+', '+(r.first||''),pos:r.pos||'Engineer1',team:r.team||'',hired:r.hired||'',resigned:r.resigned||null,status:r.status||'Regular'};
        if(rec.id&&!DB.engineers.find(x=>x.id===rec.id)){DB.engineers.push(rec);S.persist('engineers',rec);n++;} }
    }catch(e){} });
    addLog('Committed '+n+' new '+ENT[entity]+' rows',true); setPreview(null); S.saveLocal(); S.bump(); };
  return (
    <div className="view-inner">
      <Panel title="Import Data" icon={I.upload} sub="Excel / CSV via SheetJS">
        <div className="row wrap" style={{gap:10,marginBottom:12}}>
          <label className="muted-s">Map sheet to:</label>
          <select value={entity} onChange={e=>setEntity(e.target.value)}>{Object.entries(ENT).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>
          <button className="btn" onClick={()=>fileRef.current.click()}>Choose file…</button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{display:'none'}} onChange={e=>onFile(e.target.files[0])}/>
          {preview&&<button className="btn pri" onClick={commit}>Commit {preview.rows.length} rows</button>}
        </div>
        <div className="callout">Columns are matched by header name to <b>{ENT[entity]}</b> fields. Duplicate <b>hardware_id</b> rows are skipped. Review the preview before committing.</div>
        {preview&&<div className="tbl-wrap" style={{marginTop:12,maxHeight:280}}><table className="dt">
          <thead><tr>{preview.cols.map(c=><th key={c}>{c}</th>)}</tr></thead>
          <tbody>{preview.rows.slice(0,30).map((r,i)=><tr key={i}>{preview.cols.map(c=><td key={c}>{String(r[c])}</td>)}</tr>)}</tbody></table></div>}
      </Panel>
      <Panel title="Import Log" icon={I.layers} pad={false}>
        {log.length===0?<div className="empty">No imports yet</div>:
          <table className="dt"><tbody>{log.map((l,i)=><tr key={i}><td className="mono muted-s" style={{width:90}}>{l.t}</td>
            <td><span className={'tag '+(l.ok?'green':'red')}>{l.ok?'ok':'err'}</span></td><td>{l.m}</td></tr>)}</tbody></table>}
      </Panel>
    </div>
  );
}
window.ImportTab=ImportTab;
