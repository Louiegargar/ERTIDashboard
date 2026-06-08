// charts.jsx — Chart.js wrappers (destroy/recreate; guarded when Chart absent)
const { useRef: useRc, useEffect: useEc } = React;
const TEAL='#00d4aa', BLUE='#4a9eff', GOLD='#f0c040', GREEN='#2ed573', RED='#ff4757', GRID='rgba(255,255,255,0.06)', FG='#aeb6c2';
const HAS_CHART = ()=> typeof window!=='undefined' && typeof window.Chart!=='undefined';

function useChart(factory, deps){ const ref=useRc(null); const inst=useRc(null);
  useEc(()=>{ if(!HAS_CHART()||!ref.current) return; const cfg=factory(); if(!cfg) return;
    inst.current=new window.Chart(ref.current.getContext('2d'),cfg);
    return ()=>{ if(inst.current){inst.current.destroy();inst.current=null;} }; }, deps); return ref; }

function baseOpts(yFmt){ return { responsive:true, maintainAspectRatio:false,
  plugins:{ legend:{ labels:{ color:FG, font:{size:11}, boxWidth:12 } },
    tooltip:{ callbacks: yFmt?{ label:c=>c.dataset.label+': '+yFmt(c.parsed.y) }:{} } },
  scales:{ x:{ grid:{color:GRID}, ticks:{color:FG,font:{size:10}} },
           y:{ grid:{color:GRID}, ticks:{color:FG,font:{size:10},callback:v=>yFmt?yFmt(v):v}, beginAtZero:true } } }; }
const pesoK=v=> v>=1000? '₱'+(v/1000)+'k':'₱'+v;

function NoChart({h}){ return <div className="empty" style={{height:h||200,display:'grid',placeItems:'center'}}>Chart.js not loaded (offline)</div>; }

// combo: actual bars + projected(dashed) + budget(solid) lines
function Combo({labels,actual,proj,budget,money,h}){
  const ref=useChart(()=>({ type:'bar', data:{ labels, datasets:[
    { type:'bar', label:'Actual', data:actual, backgroundColor:TEAL, borderRadius:3, order:3 },
    { type:'line', label:'Projected', data:proj, borderColor:BLUE, borderDash:[5,4], pointRadius:2, tension:.3, order:1 },
    { type:'line', label:'Budget', data:budget, borderColor:GOLD, pointRadius:2, tension:.3, order:2 } ]},
    options:baseOpts(money?pesoK:null) }), [JSON.stringify([labels,actual,proj,budget])]);
  if(!HAS_CHART()) return <NoChart h={h}/>;
  return <div style={{height:h||220}}><canvas ref={ref}></canvas></div>; }

// gap bars +/- coloured
function GapBars({labels,data,money,h}){
  const ref=useChart(()=>({ type:'bar', data:{ labels, datasets:[{ label:'Gap', data,
    backgroundColor:data.map(v=>v>=0?GREEN:RED), borderRadius:3 }]}, options:baseOpts(money?pesoK:null) }),
    [JSON.stringify([labels,data])]);
  if(!HAS_CHART()) return <NoChart h={h}/>;
  return <div style={{height:h||220}}><canvas ref={ref}></canvas></div>; }

// single line vs actual
function LineVs({labels,actual,plan,planLabel,money,h}){
  const ref=useChart(()=>({ type:'line', data:{ labels, datasets:[
    { label:'Actual', data:actual, borderColor:TEAL, backgroundColor:'rgba(0,212,170,.12)', fill:true, tension:.3, pointRadius:2 },
    { label:planLabel||'Plan', data:plan, borderColor:GOLD, borderDash:[5,4], tension:.3, pointRadius:2 } ]},
    options:baseOpts(money?pesoK:null) }), [JSON.stringify([labels,actual,plan])]);
  if(!HAS_CHART()) return <NoChart h={h}/>;
  return <div style={{height:h||220}}><canvas ref={ref}></canvas></div>; }

// stacked WIP aging buckets (single stacked column or grouped)
function AgingBars({labels,data,h}){
  const ref=useChart(()=>({ type:'bar', data:{ labels, datasets:[{ label:'WIP items', data,
    backgroundColor:[GREEN,GOLD,'#ff9f43',RED], borderRadius:3 }]},
    options:baseOpts(null) }), [JSON.stringify([labels,data])]);
  if(!HAS_CHART()) return <NoChart h={h}/>;
  return <div style={{height:h||200}}><canvas ref={ref}></canvas></div>; }

// manning current vs target by team
function ManningBars({teams,cur,target,h}){
  const ref=useChart(()=>({ type:'bar', data:{ labels:teams, datasets:[
    { label:'Current', data:cur, backgroundColor:TEAL, borderRadius:3 },
    { label:'Target', data:target, backgroundColor:'rgba(255,255,255,.14)', borderRadius:3 } ]},
    options:baseOpts(null) }), [JSON.stringify([teams,cur,target])]);
  if(!HAS_CHART()) return <NoChart h={h}/>;
  return <div style={{height:h||200}}><canvas ref={ref}></canvas></div>; }

// competency radar by platform
function CompetencyRadar({axes,values,h}){
  const ref=useChart(()=>({ type:'radar', data:{ labels:axes, datasets:[{ label:'Avg rating', data:values,
    borderColor:TEAL, backgroundColor:'rgba(0,212,170,.18)', pointBackgroundColor:TEAL }]},
    options:{ responsive:true,maintainAspectRatio:false, plugins:{legend:{labels:{color:FG}}},
      scales:{ r:{ min:0,max:3, grid:{color:GRID}, angleLines:{color:GRID}, pointLabels:{color:FG,font:{size:10}}, ticks:{display:false} } } } }),
    [JSON.stringify([axes,values])]);
  if(!HAS_CHART()) return <NoChart h={h}/>;
  return <div style={{height:h||220}}><canvas ref={ref}></canvas></div>; }

Object.assign(window,{Combo,GapBars,LineVs,AgingBars,ManningBars,CompetencyRadar});
