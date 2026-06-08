// ui.jsx — shared primitives, formatters, store hook
const { useState: useS, useEffect: useE, useRef: useR } = React;

function peso(v){ if(v==null||isNaN(v)) return '—'; return '₱'+Math.round(v).toLocaleString('en-PH'); }
function fmtInt(v){ if(v==null||isNaN(v)) return '—'; return Math.round(v).toLocaleString(); }
function clsFor(good){ return good?'green':'red'; }

const I = {
  grid:'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  money:['M12 1v22','M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'],
  box:['M21 8l-9-5-9 5 9 5 9-5z','M3 8v8l9 5 9-5V8','M12 13v8'],
  layers:['M12 3 2 8l10 5 10-5z','M2 13l10 5 10-5','M2 18l10 5 10-5'],
  cal:['M3 5h18v16H3z','M3 9h18','M8 3v4','M16 3v4'],
  star:'M12 3l2.6 5.6 6 .6-4.5 4 1.3 6L12 16.8 6.6 19.2l1.3-6-4.5-4 6-.6z',
  users:['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2','M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8','M22 21v-2a4 4 0 0 0-3-3.87','M16 3.13a4 4 0 0 1 0 7.75'],
  upload:['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  gear:['M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z','M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H1a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 2.6 7a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 7 2.6h.1A1.6 1.6 0 0 0 9 1.1V1a2 2 0 1 1 4 0v.1A1.6 1.6 0 0 0 15 2.6a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V7a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z'],
  pulse:'M3 12h4l2-7 4 14 2-7h6', target:['M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0','M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0','M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0'],
  clock:['M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0','M12 7v5l3 2'], plus:'M12 5v14M5 12h14',
};
function Icon({d,size,sw}){ const a=Array.isArray(d)?d:[d];
  return <svg viewBox="0 0 24 24" width={size||16} height={size||16} fill="none" stroke="currentColor" strokeWidth={sw||1.7} strokeLinecap="round" strokeLinejoin="round">{a.map((p,i)=><path key={i} d={p}/>)}</svg>; }

// re-render hook: subscribe to STORE version
function useStore(){ const [,set]=useS(0); useE(()=>window.STORE.subscribe(v=>set(v)),[]); return window.STORE; }
function commit(){ window.STORE.saveLocal(); window.STORE.bump(); }

function SyncDot(){ const s=window.STORE.getSync(); const lbl={synced:'synced',saving:'saving…',error:'sync error',idle:window.STORE.hasSb()?'connected':'local only'}[s]||s;
  return <span className="row" style={{gap:6}}><span className={'dot '+s}></span><span className="muted-s">{lbl}</span></span>; }

function Panel({title,sub,icon,right,children,pad}){ return (
  <div className="panel"><div className="pt"><h3>{icon&&<Icon d={icon}/>}{title}{sub&&<span className="sub" style={{marginLeft:8}}>{sub}</span>}</h3>{right}</div>
  <div className="pb" style={pad===false?{padding:0}:null}>{children}</div></div>); }

function KpiCard({label,value,sub,cls,icon,onClick}){ return (
  <div className={'kpi-card '+(cls||'')} onClick={onClick}>
    <div className="kpi-label">{icon&&<Icon d={icon} size={13}/>}{label}</div>
    <div className="kpi-val">{value}</div>{sub&&<div className="kpi-sub">{sub}</div>}
  </div>); }

function Tile({label,value,accent}){ return <div className="tile"><div className="tv" style={accent?{color:accent}:null}>{value}</div><div className="tl">{label}</div></div>; }

function Seg({value,options,onChange}){ return <div className="seg">{options.map(o=>{const v=o.k||o,l=o.l||o;
  return <button key={v} className={value===v?'active':''} onClick={()=>onChange(v)}>{l}</button>;})}</div>; }

function Modal({open,title,big,onClose,children,footer}){ return (
  <div className={'modal-overlay'+(open?' open':'')} onClick={e=>{if(e.target.classList.contains('modal-overlay'))onClose();}}>
    <div className="modal"><div className="mh"><div><h3>{title}</h3>{big!=null&&<div className="big">{big}</div>}</div><button className="x" onClick={onClose}>×</button></div>
    <div className="mb">{children}</div>{footer&&<div className="mf">{footer}</div>}</div></div>); }

function Toast(){ const m=window.STORE.getToast(); if(!m) return null; return <div className="toast">{m}</div>; }

Object.assign(window,{peso,fmtInt,clsFor,Icon,I,useStore,commit,SyncDot,Panel,KpiCard,Tile,Seg,Modal,Toast});

// loading banner (in-app waits) — instant boot splash lives in index.html
function Banner(){ useStore(); const b=window.STORE.getBanner();
  return (<div className={'banner'+(b.show?'':' hide')}>
    <div className="splash-mark"><Icon d={I.pulse} size={30}/></div>
    <div style={{textAlign:'center'}}><div className="splash-title">{b.text||'ERTI Nerve Center'}</div>
      <div className="splash-sub">F2 · ETS / LTX Debug Ops</div></div>
    <div className="splash-bar"><i></i></div></div>); }
window.Banner=Banner;
