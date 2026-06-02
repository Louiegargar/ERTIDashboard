// overview.jsx — primary KPI overview

function KpiCard({ k, range }) {
  const s = k.series;
  const cur = s[s.length - 1];
  const back = range === 'quarter' ? s[s.length - 4] : range === 'week' ? s[s.length - 2] : s[s.length - 2];
  const lowerBetter = false;
  const deltaPct = back ? +(((cur - back) / back) * 100).toFixed(1) : 0;
  const pctOfTarget = Math.round((cur / k.target) * 100);
  const mc = meterCls(cur, k.target, lowerBetter);
  const sublabel = range === 'quarter' ? 'vs Q start' : range === 'week' ? 'vs last wk' : 'vs last mo';
  return (
    <div className="kpi fade">
      <div className="kpi-top">
        <span className="kpi-label">{k.label}</span>
        <Sparkline data={s} w={62} h={22} fill />
      </div>
      <div className="kpi-val">{k.fmt(cur)}</div>
      <div className="kpi-row">
        <Delta d={deltaPct} suffix="%" />
        <span className="muted-s">{sublabel}</span>
      </div>
      <div className="col" style={{ gap: 5 }}>
        <div className="meter"><div className={'f ' + mc} style={{ width: Math.min(100, pctOfTarget) + '%' }}></div></div>
        <div className="row between">
          <span className="kpi-target">{pctOfTarget}% of target</span>
          <span className="kpi-target">{k.fmt(k.target)}</span>
        </div>
      </div>
    </div>
  );
}

function SecStat({ s }) {
  const goodUp = s.good === 'up';
  const isGood = goodUp ? s.delta > 0 : s.delta < 0;
  return (
    <div className="lrow" style={{ padding: '12px 0' }}>
      <div className="col" style={{ gap: 3, flex: 1 }}>
        <span className="muted-s" style={{ textTransform: 'none' }}>{s.label}</span>
        <span style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em' }}>{s.value}</span>
      </div>
      <Sparkline data={s.spark} w={70} h={26} color={isGood ? 'var(--ok)' : 'var(--err)'} />
      <span className={'delta ' + (isGood ? 'up' : 'down')} style={{ minWidth: 52, justifyContent: 'center' }}>
        {s.delta > 0 ? '+' : ''}{s.delta}{typeof s.delta === 'number' && Math.abs(s.delta) < 10 && s.label.includes('Rate') ? 'pp' : ''}
      </span>
    </div>
  );
}

function Overview({ data, range, onSelect, goTeam, goGrowth }) {
  const { TEAM_KPIS, SECONDARY, MONTHS, PEOPLE, ACTIVITY, UPCOMING } = data;
  const kpis = ['throughput', 'fpy', 'utilization', 'goals'].map(k => TEAM_KPIS[k]);
  const sorted = [...PEOPLE].sort((a, b) => b.composite - a.composite);
  const top = sorted.slice(0, 5);
  const movers = [...PEOPLE].sort((a, b) => b.delta - a.delta).slice(0, 4);
  const atRisk = PEOPLE.filter(p => p.risk !== 'low').sort((a, b) => (a.risk === 'high' ? -1 : 1));
  const avgScore = Math.round(PEOPLE.reduce((s, p) => s + p.composite, 0) / PEOPLE.length);

  // main trend = throughput
  const main = TEAM_KPIS.throughput;

  return (
    <div className="view-inner">
      {/* KPI row */}
      <div className="grid g-4">
        {kpis.map((k, i) => <KpiCard key={i} k={k} range={range} />)}
      </div>

      {/* main trend + secondary */}
      <div className="grid g-2-1">
        <div className="card fade">
          <div className="card-head">
            <h3><Icon d={ICN.pulse} /> Test Throughput</h3>
            <span className="sub">runs / month · 6-mo</span>
          </div>
          <div className="card-body">
            <AreaTrend data={main.series} labels={MONTHS} target={main.target} fmt={main.fmt} h={188} />
          </div>
        </div>
        <div className="card fade">
          <div className="card-head"><h3><Icon d={ICN.gauge} /> Operational Health</h3></div>
          <div className="card-body" style={{ paddingTop: 4, paddingBottom: 4 }}>
            {Object.values(SECONDARY).map((s, i) => <SecStat key={i} s={s} />)}
          </div>
        </div>
      </div>

      {/* team health band */}
      <div className="grid g-4">
        <div className="kpi">
          <span className="kpi-label"><Icon d={ICN.user} size={14} /> Headcount</span>
          <div className="kpi-val">{PEOPLE.length}</div>
          <span className="muted-s">{PEOPLE.filter(p => p.squad === 'ETS').length} ETS · {PEOPLE.filter(p => p.squad === 'LTX').length} LTX</span>
        </div>
        <div className="kpi">
          <span className="kpi-label"><Icon d={ICN.star} size={14} /> Avg Performance</span>
          <div className="kpi-val">{avgScore}</div>
          <div className="meter"><div className="f ok" style={{ width: avgScore + '%' }}></div></div>
        </div>
        <div className="kpi">
          <span className="kpi-label"><Icon d={ICN.flag} size={14} /> Flight Risk</span>
          <div className="kpi-val">{atRisk.length}</div>
          <span className="muted-s">{PEOPLE.filter(p => p.risk === 'high').length} high · {PEOPLE.filter(p => p.risk === 'med').length} watch</span>
        </div>
        <div className="kpi">
          <span className="kpi-label"><Icon d={ICN.growth} size={14} /> Promo-Ready</span>
          <div className="kpi-val">{PEOPLE.filter(p => p.readiness === 'Ready now').length}</div>
          <span className="muted-s">{PEOPLE.filter(p => p.readiness.includes('6')).length} within 12 mo</span>
        </div>
      </div>

      {/* leaderboard + risk */}
      <div className="grid g-2-1">
        <div className="card fade">
          <div className="card-head">
            <h3><Icon d={ICN.trophy} /> Top Performers</h3>
            <button className="back-btn" onClick={goTeam} style={{ border: 'none' }}>Full leaderboard <Icon d={ICN.arrowR} size={12} /></button>
          </div>
          <div className="card-body" style={{ paddingTop: 6, paddingBottom: 6 }}>
            {top.map((p, i) => (
              <div className="lrow" key={p.id} onClick={() => onSelect(p)} style={{ cursor: 'pointer' }}>
                <span className={'rank' + (i === 0 ? ' top' : '')}>{i + 1}</span>
                <Avatar p={p} />
                <div className="col" style={{ flex: 1 }}>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{p.name}</span>
                  <span className="rl" style={{ fontSize: 11, color: 'var(--fg-4)' }}>{p.role}</span>
                </div>
                <SquadTag s={p.squad} />
                <Sparkline data={p.hist} w={58} h={22} color="var(--ok)" />
                <ScoreChip s={p.composite} />
              </div>
            ))}
          </div>
        </div>
        <div className="card fade">
          <div className="card-head"><h3><Icon d={ICN.flag} /> Needs Attention</h3></div>
          <div className="card-body" style={{ paddingTop: 6, paddingBottom: 6 }}>
            {atRisk.map(p => (
              <div className="lrow" key={p.id} onClick={() => onSelect(p)} style={{ cursor: 'pointer' }}>
                <Avatar p={p} />
                <div className="col" style={{ flex: 1 }}>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{p.name}</span>
                  <RiskDot r={p.risk} />
                </div>
                <Delta d={p.delta} />
              </div>
            ))}
            {atRisk.length === 0 && <div className="empty">No risks flagged</div>}
          </div>
        </div>
      </div>

      {/* movers + activity + upcoming */}
      <div className="grid g-3">
        <div className="card fade">
          <div className="card-head"><h3><Icon d={ICN.growth} /> Biggest Movers</h3><span className="sub">{range}</span></div>
          <div className="card-body" style={{ paddingTop: 6, paddingBottom: 6 }}>
            {movers.map(p => (
              <div className="lrow" key={p.id} onClick={() => onSelect(p)} style={{ cursor: 'pointer' }}>
                <Avatar p={p} sm />
                <span style={{ fontWeight: 500, fontSize: 12.5, flex: 1 }}>{p.name}</span>
                <Sparkline data={p.hist} w={50} h={20} color="var(--accent)" />
                <Delta d={p.delta} />
              </div>
            ))}
          </div>
        </div>
        <div className="card fade">
          <div className="card-head"><h3><Icon d={ICN.pulse} /> Recent Activity</h3></div>
          <div className="card-body" style={{ paddingTop: 8, paddingBottom: 8 }}>
            {ACTIVITY.slice(0, 6).map((a, i) => (
              <div className="act" key={i}>
                <span className="ts">{a.ts}</span>
                <span className={'tag ' + (a.cls === 'ok' ? 'ltx' : a.cls === 'warn' ? '' : 'ets')} style={a.cls === 'warn' ? { color: 'var(--warn)', borderColor: 'rgba(255,184,0,0.3)', background: 'var(--accent-soft)' } : {}}>{a.tag}</span>
                <span><span className="who">{a.who}</span> <span className="msg">{a.msg}</span></span>
              </div>
            ))}
          </div>
        </div>
        <div className="card fade">
          <div className="card-head"><h3><Icon d={ICN.cal} /> Upcoming</h3></div>
          <div className="card-body" style={{ paddingTop: 8, paddingBottom: 8 }}>
            {UPCOMING.map((u, i) => (
              <div className="lrow" key={i} style={{ padding: '10px 0' }}>
                <div className="col" style={{ flex: 1, gap: 3 }}>
                  <span style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>{u.what}</span>
                  <span className="muted-s">{u.when}</span>
                </div>
                <span className={'tag ' + (u.type === 'risk' ? '' : u.type === 'promo' ? 'ltx' : 'ets')}
                      style={u.type === 'risk' ? { color: 'var(--err)', borderColor: 'rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.08)' } : {}}>{u.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.Overview = Overview;
