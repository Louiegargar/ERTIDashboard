// growth.jsx — experience matrix, tenure pipeline, output distribution (real data)

const { useState: useStateG } = React;

const HEAT_COLORS = ['#1f2328', '#5a4a18', '#8a6300', '#c79100', '#ffb800'];
const EXP_LABELS = ['None', '1', '2–3', '4–5', '6+']; // output-volume bands

function Growth({ data, onSelect }) {
  const { PEOPLE, SKILLS } = data; // SKILLS = build-type axes
  const [tip, setTip] = useStateG(null);

  // tenure / status pipeline
  const buckets = [
    { key: 'Probationary', label: 'Probationary', cls: 'later', test: p => p.status === 'Probationary' },
    { key: '<1 yr', label: '< 1 yr', cls: 'soon', test: p => p.status !== 'Probationary' && p.tenure < 1 },
    { key: '1–2 yr', label: '1–2 yr', cls: 'soon', test: p => p.tenure >= 1 && p.tenure < 2 },
    { key: '2 yr+', label: '2 yr+', cls: 'now', test: p => p.tenure >= 2 },
  ];
  const pipeline = buckets.map(b => ({ ...b, people: PEOPLE.filter(b.test) }));

  // output distribution
  const bins = [
    { label: '0', lo: 0, hi: 0 }, { label: '1–2', lo: 1, hi: 2 }, { label: '3–5', lo: 3, hi: 5 },
    { label: '6–8', lo: 6, hi: 8 }, { label: '9+', lo: 9, hi: 999 },
  ];
  const dist = bins.map(b => ({ ...b, n: PEOPLE.filter(p => p.outputs >= b.lo && p.outputs <= b.hi).length }));
  const maxBin = Math.max(...dist.map(d => d.n));

  // team build-type volume + avg experience level
  const buildVol = SKILLS.map((_, si) => PEOPLE.reduce((s, p) => s + (p.buildMix[SKILLS[si]] || 0), 0));
  const maxVol = Math.max(...buildVol, 1);
  const skillAvg = SKILLS.map((_, si) => +(PEOPLE.reduce((s, p) => s + p.skills[si], 0) / PEOPLE.length).toFixed(1));
  const prob = PEOPLE.filter(p => p.status === 'Probationary').length;
  const sortedHeat = [...PEOPLE].sort((a, b) => b.outputs - a.outputs);
  const shortSkills = ['Test\ncard', 'Face\nplate', 'Perf\nboard', 'Handler\n/Insert', 'Other'];

  return (
    <div className="view-inner">
      <div className="callout" style={{ marginBottom: 4 }}>
        <strong>Experience by build type</strong> = volume of attributed debug output per hardware type (real, from the Sheet 5 sample). Tenure/status are from the roster. This view carries no skills-proficiency or promotion-readiness assessment — the source has none.
      </div>

      {/* summary */}
      <div className="grid g-4">
        <div className="kpi"><span className="kpi-label"><Icon d={ICN.user} size={14} /> Headcount</span><div className="kpi-val">{PEOPLE.length}</div><span className="muted-s">{prob} probationary</span></div>
        <div className="kpi"><span className="kpi-label"><Icon d={ICN.layers} size={14} /> Build types covered</span><div className="kpi-val">{SKILLS.filter((_, i) => buildVol[i] > 0).length}</div><span className="muted-s">of {SKILLS.length}</span></div>
        <div className="kpi"><span className="kpi-label"><Icon d={ICN.spark} size={14} /> Avg shift load</span><div className="kpi-val">{Math.round(PEOPLE.reduce((s, p) => s + p.shiftLoad, 0) / PEOPLE.length)}%</div><div className="meter"><div className="f" style={{ width: Math.round(PEOPLE.reduce((s, p) => s + p.shiftLoad, 0) / PEOPLE.length) + '%' }}></div></div></div>
        <div className="kpi"><span className="kpi-label"><Icon d={ICN.star} size={14} /> Coverage gaps</span><div className="kpi-val">{skillAvg.filter(s => s < 1).length}</div><span className="muted-s">build types thinly staffed</span></div>
      </div>

      {/* experience heatmap */}
      <div className="card fade">
        <div className="card-head">
          <h3><Icon d={ICN.layers} /> Build-Type Experience Matrix</h3>
          <div className="legend">
            {EXP_LABELS.map((l, i) => <span key={i}><span className="sw" style={{ background: HEAT_COLORS[i] }}></span>{l}</span>)}
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
                           onMouseEnter={e => setTip({ x: e.clientX, y: e.clientY, t: SKILLS[si], v: (p.buildMix[SKILLS[si]] || 0) + ' outputs', who: p.name })}
                           onMouseMove={e => setTip(t => t && { ...t, x: e.clientX, y: e.clientY })}
                           onMouseLeave={() => setTip(null)}>
                        {p.buildMix[SKILLS[si]] || ''}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* pipeline + distribution */}
      <div className="grid g-2-1">
        <div className="card fade">
          <div className="card-head"><h3><Icon d={ICN.growth} /> Tenure & Status</h3><span className="sub">{PEOPLE.length} people · 4 bands</span></div>
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
                          <span className="muted-s" style={{ fontSize: 9.5 }}>{p.level} · {p.role}</span>
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
          <div className="card-head"><h3><Icon d={ICN.star} /> Output Distribution</h3></div>
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
              <span className="muted-s" style={{ marginBottom: 6 }}>Team build-type volume</span>
              {SKILLS.map((sk, i) => (
                <div className="bar-row" key={i} style={{ gridTemplateColumns: '128px 1fr 30px', padding: '5px 0' }}>
                  <span className="bl" style={{ fontSize: 11.5 }}>{sk}</span>
                  <div className="bar-track"><div className="bf" style={{ width: (buildVol[i] / maxVol) * 100 + '%' }}></div></div>
                  <span className="bv">{buildVol[i]}</span>
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
