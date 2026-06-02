// growth.jsx — team growth, skills matrix, promotion pipeline

const { useState: useStateG } = React;

const HEAT_COLORS = ['#1f2328', '#5a4a18', '#8a6300', '#c79100', '#ffb800'];
const PROF_LABELS = ['None', 'Learning', 'Proficient', 'Advanced', 'Expert'];

function Growth({ data, onSelect }) {
  const { PEOPLE, SKILLS } = data;
  const [tip, setTip] = useStateG(null);

  // Short skill labels for column heads
  const shortSkills = ['Test\nAuto', 'HW\nDebug', 'Data\nAnalysis', 'Rel.\nMethods', 'Lab\nSafety', 'Report', 'Tooling\n/Script', 'Mentor'];

  // promotion pipeline buckets
  const buckets = [
    { key: 'Ready now', label: 'Ready now', cls: 'now' },
    { key: '6–12 mo', label: '6–12 months', cls: 'soon' },
    { key: '12–18 mo', label: '12–18 months', cls: 'soon' },
    { key: 'Not yet', label: 'Building', cls: 'later' },
  ];
  const pipeline = buckets.map(b => ({ ...b, people: PEOPLE.filter(p => p.readiness === b.key) }));

  // score distribution
  const bins = [
    { label: '<75', lo: 0, hi: 74 },
    { label: '75–79', lo: 75, hi: 79 },
    { label: '80–84', lo: 80, hi: 84 },
    { label: '85–89', lo: 85, hi: 89 },
    { label: '90+', lo: 90, hi: 100 },
  ];
  const dist = bins.map(b => ({ ...b, n: PEOPLE.filter(p => p.composite >= b.lo && p.composite <= b.hi).length }));
  const maxBin = Math.max(...dist.map(d => d.n));

  // skill team averages
  const skillAvg = SKILLS.map((_, si) => +(PEOPLE.reduce((s, p) => s + p.skills[si], 0) / PEOPLE.length).toFixed(1));
  const totalCerts = PEOPLE.reduce((s, p) => s + p.certs, 0);
  const sortedHeat = [...PEOPLE].sort((a, b) => b.composite - a.composite);

  return (
    <div className="view-inner">
      {/* summary */}
      <div className="grid g-4">
        <div className="kpi"><span className="kpi-label"><Icon d={ICN.growth} size={14} /> Promo-ready now</span><div className="kpi-val">{pipeline[0].people.length}</div><span className="muted-s">awaiting calibration</span></div>
        <div className="kpi"><span className="kpi-label"><Icon d={ICN.cert} size={14} /> Total certs</span><div className="kpi-val">{totalCerts}</div><span className="muted-s">{(totalCerts / PEOPLE.length).toFixed(1)} per person</span></div>
        <div className="kpi"><span className="kpi-label"><Icon d={ICN.spark} size={14} /> Avg training</span><div className="kpi-val">{Math.round(PEOPLE.reduce((s, p) => s + p.training, 0) / PEOPLE.length)}%</div><div className="meter"><div className="f" style={{ width: Math.round(PEOPLE.reduce((s, p) => s + p.training, 0) / PEOPLE.length) + '%' }}></div></div></div>
        <div className="kpi"><span className="kpi-label"><Icon d={ICN.star} size={14} /> Skill gaps</span><div className="kpi-val">{skillAvg.filter(s => s < 2.5).length}</div><span className="muted-s">areas below proficient</span></div>
      </div>

      {/* skills heatmap */}
      <div className="card fade">
        <div className="card-head">
          <h3><Icon d={ICN.layers} /> Skills Matrix</h3>
          <div className="legend">
            {PROF_LABELS.map((l, i) => <span key={i}><span className="sw" style={{ background: HEAT_COLORS[i] }}></span>{l}</span>)}
          </div>
        </div>
        <div className="card-body" style={{ overflowX: 'auto' }}>
          <table className="heat">
            <thead>
              <tr>
                <th className="rowh">Person</th>
                {shortSkills.map((s, i) => <th key={i}>{s.split('\n').map((l, j) => <div key={j}>{l}</div>)}</th>)}
              </tr>
            </thead>
            <tbody>
              {sortedHeat.map(p => (
                <tr key={p.id}>
                  <td className="rowh">
                    <div className="name-cell" onClick={() => onSelect(p)} style={{ cursor: 'pointer' }}>
                      <Avatar p={p} sm /><span>{p.name}</span>
                    </div>
                  </td>
                  {p.skills.map((v, si) => (
                    <td key={si}>
                      <div className="cell" style={{ background: HEAT_COLORS[v] }}
                           onMouseEnter={e => setTip({ x: e.clientX, y: e.clientY, t: SKILLS[si], v: PROF_LABELS[v], who: p.name })}
                           onMouseMove={e => setTip(t => t && { ...t, x: e.clientX, y: e.clientY })}
                           onMouseLeave={() => setTip(null)}>
                        {v > 0 ? v : ''}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="rowh"><span className="muted-s" style={{ paddingLeft: 35 }}>Team avg</span></td>
                {skillAvg.map((a, i) => (
                  <td key={i}><div className="cell" style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--fg-3)', fontWeight: 500 }}>{a}</div></td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* pipeline + distribution */}
      <div className="grid g-2-1">
        <div className="card fade">
          <div className="card-head"><h3><Icon d={ICN.growth} /> Promotion Pipeline</h3><span className="sub">{PEOPLE.length} people · 4 stages</span></div>
          <div className="card-body">
            <div className="grid g-4" style={{ gap: 12 }}>
              {pipeline.map(b => (
                <div key={b.key} className="col" style={{ gap: 10 }}>
                  <div className="row between">
                    <span className={'ready ' + b.cls}>{b.label}</span>
                    <span className="muted-s">{b.people.length}</span>
                  </div>
                  <div className="col" style={{ gap: 6 }}>
                    {b.people.map(p => (
                      <div key={p.id} onClick={() => onSelect(p)}
                           style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 'var(--r-2)', border: '1px solid var(--line)', background: 'var(--bg)', cursor: 'pointer' }}>
                        <Avatar p={p} sm />
                        <div className="col" style={{ minWidth: 0, flex: 1 }}>
                          <span style={{ fontSize: 11.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                          <span className="muted-s" style={{ fontSize: 9.5 }}>{p.level} → {p.nextRole}</span>
                        </div>
                      </div>
                    ))}
                    {b.people.length === 0 && <div className="muted-s" style={{ padding: '8px 0', textAlign: 'center' }}>—</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card fade">
          <div className="card-head"><h3><Icon d={ICN.star} /> Score Distribution</h3></div>
          <div className="card-body col" style={{ gap: 18 }}>
            <div className="dist">
              {dist.map((d, i) => (
                <div className="col-b" key={i}>
                  <span className="n">{d.n}</span>
                  <div className={'bar' + (i >= 3 ? ' hl' : '')} style={{ height: maxBin ? `${(d.n / maxBin) * 100}%` : '3px' }}></div>
                  <span className="lb">{d.label}</span>
                </div>
              ))}
            </div>
            <div className="col" style={{ gap: 0 }}>
              <span className="muted-s" style={{ marginBottom: 6 }}>Team skill strengths</span>
              {SKILLS.map((sk, i) => (
                <div className="bar-row" key={i} style={{ gridTemplateColumns: '128px 1fr 30px', padding: '5px 0' }}>
                  <span className="bl" style={{ fontSize: 11.5 }}>{sk}</span>
                  <div className="bar-track"><div className="bf" style={{ width: (skillAvg[i] / 4) * 100 + '%' }}></div></div>
                  <span className="bv">{skillAvg[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {tip && (
        <div className={'tt show'} style={{ left: tip.x + 12, top: tip.y + 12 }}>
          <div className="tt-t">{tip.who}</div>
          {tip.t} · <strong style={{ color: 'var(--accent)' }}>{tip.v}</strong>
        </div>
      )}
    </div>
  );
}

window.Growth = Growth;
