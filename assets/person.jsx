// person.jsx — individual scorecard (operational; real ERTI data)

function Person({ data, person, onBack, onSelect }) {
  const { PEOPLE, SKILLS } = data; // SKILLS = build-type axes
  const p = person;
  const avg = k => Math.round(PEOPLE.reduce((s, x) => s + x[k], 0) / PEOPLE.length);

  const metrics = [
    { label: 'Attributed Outputs', val: p.outputs, max: Math.max(...PEOPLE.map(x => x.outputs), 1), suffix: '', tavg: avg('outputs') },
    { label: 'Release Rate', val: p.releasePct, max: 100, suffix: '%', tavg: avg('releasePct') },
    { label: 'Shift Load', val: p.shiftLoad, max: 100, suffix: '%', tavg: avg('shiftLoad') },
    { label: 'Build Types', val: p.buildTypes, max: 5, suffix: '', tavg: avg('buildTypes') },
  ];

  const radarAxes = ['TC', 'FP', 'PB', 'HI', 'Oth'];
  const peers = PEOPLE.filter(x => x.squad === p.squad && x.id !== p.id).sort((a, b) => b.outputs - a.outputs).slice(0, 4);
  const rankAll = [...PEOPLE].sort((a, b) => b.outputs - a.outputs).findIndex(x => x.id === p.id) + 1;

  return (
    <div className="view-inner">
      <button className="back-btn" onClick={onBack}><Icon d={ICN.arrowL} size={13} /> Back to team</button>

      {/* hero */}
      <div className="card fade">
        <div className="card-body">
          <div className="person-hero">
            <Avatar p={p} lg />
            <div className="meta">
              <span className="nm">{p.name}</span>
              <span className="rl">{p.role} · F2-{p.squad} · {p.tenure} yrs tenure</span>
              <div className="tags">
                <SquadTag s={p.squad} />
                <span className="tag lvl">{p.level}</span>
                <StatusTag s={p.status} />
                {p.inferred && <span className="tag" style={{ fontSize: 9 }}>inferred join</span>}
              </div>
            </div>
            <div className="bigscore">
              <div className="row gap-8" style={{ justifyContent: 'flex-end', alignItems: 'baseline' }}>
                <span className="v">{p.activity}</span>
                <Delta d={p.delta} />
              </div>
              <div className="l">activity index · #{rankAll} of {PEOPLE.length} by output</div>
            </div>
          </div>
        </div>
      </div>

      {/* trend + build radar */}
      <div className="grid g-2-1">
        <div className="card fade">
          <div className="card-head"><h3><Icon d={ICN.pulse} /> Cumulative Output</h3><span className="sub">by work-week · sample</span></div>
          <div className="card-body">
            <AreaTrend data={p.hist} labels={['', '', '', '', '', 'now']} fmt={v => v} color="var(--accent)" h={180} />
          </div>
        </div>
        <div className="card fade">
          <div className="card-head"><h3><Icon d={ICN.spark} /> Build-Type Experience</h3></div>
          <div className="card-body" style={{ display: 'grid', placeItems: 'center', paddingBottom: 8 }}>
            <Radar axes={radarAxes} values={p.skills} max={4} size={220} />
          </div>
        </div>
      </div>

      {/* metric breakdown + experience */}
      <div className="grid g-2">
        <div className="card fade">
          <div className="card-head"><h3><Icon d={ICN.target} /> Output Metrics</h3><span className="sub">vs team avg</span></div>
          <div className="card-body">
            {metrics.map((m, i) => {
              const pct = Math.min(100, (m.val / m.max) * 100);
              const apct = Math.min(100, (m.tavg / m.max) * 100);
              const above = m.val >= m.tavg;
              return (
                <div className="col" key={i} style={{ gap: 6, padding: '9px 0', borderBottom: i < metrics.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <div className="row between">
                    <span style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>{m.label}</span>
                    <span className="row gap-8" style={{ alignItems: 'baseline' }}>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, fontWeight: 500 }}>{m.val}{m.suffix}</span>
                      <span className="muted-s" style={{ color: above ? 'var(--ok)' : 'var(--warn)' }}>{above ? '▲' : '▼'} {m.tavg}{m.suffix} avg</span>
                    </span>
                  </div>
                  <div className="bar-track" style={{ position: 'relative' }}>
                    <div className="bf" style={{ width: pct + '%', background: above ? 'var(--accent)' : 'var(--warn)' }}></div>
                    <div style={{ position: 'absolute', top: -2, bottom: -2, left: apct + '%', width: 2, background: 'var(--fg-2)', opacity: 0.55 }} title="team avg"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card fade">
          <div className="card-head"><h3><Icon d={ICN.growth} /> Experience & Tenure</h3></div>
          <div className="card-body col" style={{ gap: 16 }}>
            <div className="grid g-2" style={{ gap: 12 }}>
              <div className="kpi" style={{ padding: 14 }}>
                <span className="kpi-label">Tenure Band</span>
                <div className="row between" style={{ marginTop: 2 }}>
                  <span className={'ready ' + (p.status === 'Probationary' ? 'later' : p.tenure >= 2 ? 'now' : 'soon')}>{p.tenureBand}</span>
                </div>
                <span className="muted-s" style={{ textTransform: 'none' }}>hired {p.hired}</span>
              </div>
              <div className="kpi" style={{ padding: 14, alignItems: 'center', flexDirection: 'row', gap: 14 }}>
                <Ring value={p.shiftLoad} label={p.shiftLoad + '%'} sub="shift load" size={72} />
                <div className="col" style={{ gap: 2 }}>
                  <span style={{ fontSize: 18, fontWeight: 500 }}>{p.shifts.DS + p.shifts.NS}</span>
                  <span className="muted-s" style={{ textTransform: 'none' }}>shifts / 14d</span>
                </div>
              </div>
            </div>

            <div className="col" style={{ gap: 2 }}>
              <span className="muted-s" style={{ marginBottom: 4 }}>Build-type experience (output volume)</span>
              {SKILLS.map((sk, i) => (
                <div className="bar-row" key={i} style={{ gridTemplateColumns: '128px 1fr 64px', padding: '5px 0' }}>
                  <span className="bl" style={{ fontSize: 12 }}>{sk}</span>
                  <div className="pips">
                    {[0, 1, 2, 3].map(n => <span key={n} className={'pip' + (n < p.skills[i] ? ' on' : '')}></span>)}
                  </div>
                  <span className="bv">{(p.buildMix[sk] || 0) + ' out'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* summary + peers */}
      <div className="grid g-2-1">
        <div className="card fade">
          <div className="card-head"><h3><Icon d={ICN.user} /> Activity Summary</h3></div>
          <div className="card-body">
            <div className="callout"><strong>{p.name.split(' ')[0]}</strong> — {p.note} Top platform: {p.topTester}. Shifts (14d): {p.shifts.DS} day · {p.shifts.NS} night · {p.shifts.NT} NT.</div>
          </div>
        </div>
        <div className="card fade">
          <div className="card-head"><h3><Icon d={ICN.layers} /> {p.squad} Peers</h3></div>
          <div className="card-body" style={{ paddingTop: 6, paddingBottom: 6 }}>
            {peers.map(x => (
              <div className="lrow" key={x.id} onClick={() => onSelect(x)} style={{ cursor: 'pointer' }}>
                <Avatar p={x} sm />
                <span style={{ flex: 1, fontSize: 12.5, fontWeight: 500 }}>{x.name}</span>
                <span className="muted-s">{x.outputs} out</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.Person = Person;
