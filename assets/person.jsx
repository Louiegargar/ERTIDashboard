// person.jsx — individual scorecard deep-dive

function metricColor(v, avg, lowerBetter) {
  const good = lowerBetter ? v < avg : v > avg;
  return good ? 'var(--ok)' : v === avg ? 'var(--fg-3)' : 'var(--warn)';
}

function Person({ data, person, onBack, onSelect }) {
  const { PEOPLE, SKILLS } = data;
  const p = person;
  const avg = k => Math.round(PEOPLE.reduce((s, x) => s + x[k], 0) / PEOPLE.length);

  const metrics = [
    { label: 'Test Throughput', key: 'throughput', val: p.throughput, max: 220, suffix: ' runs', tavg: avg('throughput') },
    { label: 'First-Pass Yield', key: 'fpy', val: p.fpy, max: 100, suffix: '%', tavg: avg('fpy') },
    { label: 'Bench Utilization', key: 'utilization', val: p.utilization, max: 100, suffix: '%', tavg: avg('utilization') },
    { label: 'OKR Completion', key: 'goals', val: p.goals, max: 100, suffix: '%', tavg: avg('goals') },
    { label: 'Training Progress', key: 'training', val: p.training, max: 100, suffix: '%', tavg: avg('training') },
    { label: 'Attendance', key: 'attendance', val: p.attendance, max: 100, suffix: '%', tavg: avg('attendance') },
  ];

  const skillAxes = ['Auto', 'Debug', 'Data', 'Rel', 'Safety', 'Report', 'Tooling', 'Mentor'];
  const readyCls = p.readiness === 'Ready now' ? 'now' : p.readiness.includes('6') ? 'soon' : 'later';

  // peers in same squad for context
  const peers = PEOPLE.filter(x => x.squad === p.squad && x.id !== p.id).sort((a, b) => b.composite - a.composite).slice(0, 4);
  const rankAll = [...PEOPLE].sort((a, b) => b.composite - a.composite).findIndex(x => x.id === p.id) + 1;

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
              <span className="rl">{p.role} · {p.tenure} yrs tenure</span>
              <div className="tags">
                <SquadTag s={p.squad} />
                <span className="tag lvl">{p.level}</span>
                <RiskDot r={p.risk} />
              </div>
            </div>
            <div className="bigscore">
              <div className="row gap-8" style={{ justifyContent: 'flex-end', alignItems: 'baseline' }}>
                <span className="v">{p.composite}</span>
                <Delta d={p.delta} />
              </div>
              <div className="l">composite · rank #{rankAll} of {PEOPLE.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* trend + radar */}
      <div className="grid g-2-1">
        <div className="card fade">
          <div className="card-head"><h3><Icon d={ICN.pulse} /> Performance Trend</h3><span className="sub">composite · 6-mo</span></div>
          <div className="card-body">
            <AreaTrend data={p.hist} labels={data.MONTHS} fmt={v => v} color="var(--accent)" h={180} />
          </div>
        </div>
        <div className="card fade">
          <div className="card-head"><h3><Icon d={ICN.spark} /> Skill Profile</h3></div>
          <div className="card-body" style={{ display: 'grid', placeItems: 'center', paddingBottom: 8 }}>
            <Radar axes={skillAxes} values={p.skills} max={4} size={220} />
          </div>
        </div>
      </div>

      {/* metric breakdown */}
      <div className="grid g-2">
        <div className="card fade">
          <div className="card-head"><h3><Icon d={ICN.target} /> KPI Breakdown</h3><span className="sub">vs team avg</span></div>
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

        {/* growth panel */}
        <div className="card fade">
          <div className="card-head"><h3><Icon d={ICN.growth} /> Growth & Development</h3></div>
          <div className="card-body col" style={{ gap: 16 }}>
            <div className="grid g-2" style={{ gap: 12 }}>
              <div className="kpi" style={{ padding: 14 }}>
                <span className="kpi-label">Promotion Readiness</span>
                <div className="row between" style={{ marginTop: 2 }}>
                  <span className={'ready ' + readyCls}>{p.readiness}</span>
                </div>
                <span className="muted-s" style={{ textTransform: 'none' }}>→ {p.nextRole}</span>
              </div>
              <div className="kpi" style={{ padding: 14, alignItems: 'center', flexDirection: 'row', gap: 14 }}>
                <Ring value={p.training} label={p.training + '%'} sub="training" size={72} />
                <div className="col" style={{ gap: 2 }}>
                  <span style={{ fontSize: 18, fontWeight: 500 }}>{p.certs}</span>
                  <span className="muted-s" style={{ textTransform: 'none' }}>certifications</span>
                </div>
              </div>
            </div>

            {/* skill bars detail */}
            <div className="col" style={{ gap: 2 }}>
              <span className="muted-s" style={{ marginBottom: 4 }}>Skill proficiency</span>
              {SKILLS.map((sk, i) => (
                <div className="bar-row" key={i} style={{ gridTemplateColumns: '128px 1fr 64px', padding: '5px 0' }}>
                  <span className="bl" style={{ fontSize: 12 }}>{sk}</span>
                  <div className="pips">
                    {[0, 1, 2, 3].map(n => <span key={n} className={'pip' + (n < p.skills[i] ? ' on' : '')}></span>)}
                  </div>
                  <span className="bv">{['—', 'Learning', 'Proficient', 'Advanced', 'Expert'][p.skills[i]]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* manager note + peers */}
      <div className="grid g-2-1">
        <div className="card fade">
          <div className="card-head"><h3><Icon d={ICN.user} /> Manager Note · Latest 1:1</h3></div>
          <div className="card-body">
            <div className="callout"><strong>{p.name.split(' ')[0]}</strong> — {p.note}</div>
          </div>
        </div>
        <div className="card fade">
          <div className="card-head"><h3><Icon d={ICN.layers} /> {p.squad} Peers</h3></div>
          <div className="card-body" style={{ paddingTop: 6, paddingBottom: 6 }}>
            {peers.map(x => (
              <div className="lrow" key={x.id} onClick={() => onSelect(x)} style={{ cursor: 'pointer' }}>
                <Avatar p={x} sm />
                <span style={{ flex: 1, fontSize: 12.5, fontWeight: 500 }}>{x.name}</span>
                <ScoreChip s={x.composite} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.Person = Person;
