// tab-people.jsx — roster CRUD (§8.8, Appendix B applied in seed)
const { useState: useSp } = React;
function tenure(hired,resigned){ if(!hired)return'—'; const a=new Date(hired),b=resigned?new Date(resigned):new Date();
  const mo=(b.getFullYear()-a.getFullYear())*12+(b.getMonth()-a.getMonth()); return (mo/12).toFixed(1)+' yr'; }
function blankEng(){ return {id:'',no:'',last:'',first:'',name:'',pos:'Engineer1',team:'F2-LTX',hired:new Date().toISOString().slice(0,10),resigned:null,status:'PROBI'}; }
function People(){
  useStore(); const S=window.STORE,DB=S.DB; const [edit,setEdit]=useSp(null); const [err,setErr]=useSp('');
  const rows=[...DB.engineers].sort((a,b)=>a.team.localeCompare(b.team)||a.last.localeCompare(b.last));
  const save=()=>{ const e=edit; if(!e.id||!e.last){setErr('Employee # and last name required');return;}
    e.id=+e.id; e.no=String(e.id); e.name=e.last+', '+e.first;
    if(e._orig)Object.assign(e._orig,e); else { if(DB.engineers.find(x=>x.id===e.id)){setErr('Employee # exists');return;} DB.engineers.push(e); }
    delete e._orig; S.persist('engineers',{id:e.id,no:e.no,last:e.last,first:e.first,name:e.name,pos:e.pos,team:e.team,hired:e.hired,resigned:e.resigned,status:e.status});
    setEdit(null);setErr('');S.bump(); };
  const del=(e)=>{ DB.engineers=DB.engineers.filter(x=>x!==e); S.remove('engineers',{id:e.id}); S.saveLocal();S.bump(); };
  return (
    <div className="view-inner">
      <div className="row between"><div className="muted-s">{rows.length} engineers · {rows.filter(e=>e.status==='PROBI').length} probationary</div>
        <button className="btn pri" onClick={()=>{setErr('');setEdit(blankEng());}}><Icon d={I.plus} size={13}/> Add Engineer</button></div>
      <Panel title="Roster" icon={I.users} pad={false}>
        <div className="tbl-wrap"><table className="dt">
          <thead><tr><th>Emp #</th><th>Name</th><th>Position</th><th>Team</th><th>Hired</th><th className="num">Tenure</th><th>Status</th><th></th></tr></thead>
          <tbody>{rows.map(e=>(<tr key={e.id}><td className="mono">{e.no}</td><td>{e.name}</td><td>{e.pos}</td>
            <td><span className="tag teal">{e.team}</span></td><td className="mono">{e.hired}</td><td className="num">{tenure(e.hired,e.resigned)}</td>
            <td><span className={'tag '+(e.status==='PROBI'?'gold':'green')}>{e.status}</span></td>
            <td><div className="row" style={{gap:4}}><button className="btn sm" onClick={()=>{setErr('');setEdit(Object.assign({},e,{_orig:e}));}}>Edit</button>
              <button className="btn sm danger" onClick={()=>del(e)}>✕</button></div></td></tr>))}</tbody></table></div>
      </Panel>
      {edit&&<Modal open={true} title={edit._orig?'Edit Engineer':'Add Engineer'} onClose={()=>setEdit(null)}
        footer={<><button className="btn" onClick={()=>setEdit(null)}>Cancel</button><button className="btn pri" onClick={save}>Save</button></>}>
        {err&&<div className="warn-bar" style={{marginBottom:10}}>{err}</div>}
        <div className="frow"><label>Employee # *</label><input type="number" value={edit.id} disabled={!!edit._orig} onChange={e=>setEdit({...edit,id:e.target.value})}/></div>
        <div className="frow"><label>Last name *</label><input type="text" value={edit.last} onChange={e=>setEdit({...edit,last:e.target.value})}/></div>
        <div className="frow"><label>First name</label><input type="text" value={edit.first} onChange={e=>setEdit({...edit,first:e.target.value})}/></div>
        <div className="frow"><label>Position</label><select value={edit.pos} onChange={e=>setEdit({...edit,pos:e.target.value})}>{DB.VOCAB.roles.map(r=><option key={r}>{r}</option>)}</select></div>
        <div className="frow"><label>Team</label><select value={edit.team} onChange={e=>setEdit({...edit,team:e.target.value})}>{DB.VOCAB.teams.map(t=><option key={t}>{t}</option>)}</select></div>
        <div className="frow"><label>Hired</label><input type="date" value={edit.hired} onChange={e=>setEdit({...edit,hired:e.target.value})}/></div>
        <div className="frow"><label>Status</label><select value={edit.status} onChange={e=>setEdit({...edit,status:e.target.value})}><option>Regular</option><option>PROBI</option></select></div>
      </Modal>}
    </div>
  );
}
window.People=People;
