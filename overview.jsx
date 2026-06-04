// overview.jsx — operational KPI overview (real ERTI data)

function StatCard({ label, value, sub, series, meter }) {
  return (
    <div className="kpi fade">
      <div className="kpi-top">
        <span className="kpi-label">{label}</span>
        {series && <Sparkline data={series} w={62} h={22} fill />}
      </div>
      <div className="kpi-val">{value}</div>
      {sub && <div className="kpi-row"><span className="muted-s">{sub}</span></div>}
      {meter != null && <div className="meter"><div className="f ok" style={{ width: Math.min(100, meter) + '%' }}></div></div>}
    </div>
  );
}

function OpStat({ label, value, color }) {
  return (
    <div className="lrow" style={{ padding: '12px 0' }}>
      <div className="col" style={{ gap: 3, flex: 1 }}>
        <span className="muted-s" style={{ textTransform: 'none' }}>{label}</span>
        <span style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em', color: color || 'var(--fg-1)' }}>{value}</span>
      </div>
    </div>
  );
}

function Overview({ data, range, onSelect, goTeam, goGrowth }) {
  const { PEOPLE, ACTIVITY, UPCOMING, OPS, MONTHS, OUTPUTS_SERIES, JOIN } = data;
  const ets = PEOPLE.filter(p => p.squad === 'ETS').length;
  const ltx = PEOPLE.length - ets;
  const prob = PEOPLE.filter(p => p.status === 'Probationary').length;
  const avgAct = Math.round(PEOPLE.reduce((s, p) => s + p.activity, 0) / PEOPLE.length);
  const releasePct = Math.round(OPS.releasedOutputs / OPS.outputsTotal * 100);
  const hwRelPct = Math.round(OPS.released / OPS.activeHW * 100);

  const byOut = [...PEOPLE].sort((a, b) => b.outputs - a.outputs);
  const top = byOut.slice(0, 5);
  const movers = [...PEOPLE].filter(p => p.outputs > 0).sort((a, b) => b.delta - a.delta).slice(0, 4);
  const ramp = PEOPLE.filter(p => p.status === 'Probationary' || p.outputs === 0)
    .sort((a, b) => a.outputs - b.outputs);

  return (
    <div className="view-inner">
      {/* integration caveat */}
      <div className="callout" style={{ marginBottom: 4 }}>
        <strong>Operational view.</strong> Metrics are real ERTI data — debug-output attribution (Sheet 5 → roster), shift load (Sheet 4), hardware rollup (Sheets 1–2). Output figures are from a {JOIN.totalRows}-row sample ({JOIN.attributedRows} matched, {JOIN.partner} partner/historical). <em>Juno→Junolito</em> and <em>Aeron→Aaron</em> are inferred joins. No performance, skills, or attrition data is inferred about individuals.
      </div>

      {/* KPI row */}
      <div className="grid g-4">
        <StatCard label="Debug Outputs / mo" value={OUTPUTS_SERIES[OUTPUTS_SERIES.length - 1]} sub="May · 6-mo trend" series={OUTPUTS_SERIES} />
        <StatCard label="Output Release Rate" value={releasePct + '%'} sub={OPS.releasedOutputs + ' / ' + OPS.outputsTotal + ' outputs'} meter={releasePct} />
        <StatCard label="Active HW Released" value={OPS.released} sub={hwRelPct + '% of ' + OPS.activeHW + ' active'} meter={hwRelPct} />
        <StatCard label="In Debug" value={OPS.inDebug} sub={OPS.qual + ' qual · ' + OPS.corr + ' correlation'} />
      </div>

      {/* main trend + ops health */}
      <div className="grid g-2-1">
        <div className="card fade">
          <div className="card-head">
            <h3><Icon d={ICN.pulse} /> Monthly Debug Output</h3>
            <span className="sub">outputs / month · 6-mo (Sheet 5)</span>
          </div>
          <div className="card-body">
            <AreaTrend data={OUTPUTS_SERIES} labels={MONTHS} fmt={v => v} h={188} />
          </div>
        </div>
        <div className="card fade">
          <div className="card-head"><h3><Icon d={ICN.gauge} /> Hardware Disposition</h3></div>
          <div className="card-body" style={{ paddingTop: 4, paddingBottom: 4 }}>
            <OpStat label="Released" value={OPS.released} color="var(--ok)" />
            <OpStat label="In debug (ERTI + partner)" value={OPS.inDebug} color="var(--accent)" />
            <OpStat label="Under qualification" value={OPS.qual} />
            <OpStat label="Scrap / RTV" value={(OPS.scrap + OPS.rtv)} color="var(--err)" />
          </div>
        </div>
      </div>

      {/* team band */}
      <div className="grid g-4">
        <div className="kpi">
          <span className="kpi-label"><Icon d={ICN.user} size={14} /> Headcount</span>
          <div className="kpi-val">{PEOPLE.length}</div>
          <span className="muted-s">{ets} ETS · {ltx} LTX</span>
        </div>
        <div className="kpi">
          <span className="kpi-label"><Icon d={ICN.star} size={14} /> Avg Activity Index</span>
          <div className="kpi-val">{avgAct}</div>
          <div className="meter"><div className="f ok" style={{ width: avgAct + '%' }}></div></div>
        </div>
        <div className="kpi">
          <span className="kpi-label"><Icon d={ICN.flag} size={14} /> Probationary</span>
          <div className="kpi-val">{prob}</div>
          <span className="muted-s">2026 hires, ramping</span>
        </div>
        <div className="kpi">
          <span className="kpi-label"><Icon d={ICN.growth} size={14} /> Attributed Outputs</span>
          <div className="kpi-val">{JOIN.attributedRows}</div>
          <span className="muted-s">of {JOIN.totalRows} sample rows</span>
        </div>
      </div>

      {/* leaderboard + ramp */}
      <div className="grid g-2-1">
        <div className="card fade">
          <div className="card-head">
            <h3><Icon d={ICN.trophy} /> Most Attributed Output</h3>
            <button className="back-btn" onClick={goTeam} style={{ border: 'none' }}>Full leaderboard <Icon d={ICN.arrowR} size={12} /></button>
          </div>
          <div className="card-body" style={{ paddingTop: 6, paddingBottom: 6 }}>
            {top.map((p, i) => (
              <div className="lrow" key={p.id} onClick={() => onSelect(p)} style={{ cursor: 'pointer' }}>
                <span className={'rank' + (i === 0 ? ' top' : '')}>{i + 1}</span>
                <Avatar p={p} />
                <div className="col" style={{ flex: 1 }}>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{p.name}</span>
                  <span className="rl" style={{ fontSize: 11, color: 'var(--fg-4)' }}>{p.role} · {p.topType}</span>
                </div>
                <SquadTag s={p.squad} />
                <Sparkline data={p.hist} w={58} h={22} color="var(--ok)" />
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 15, fontWeight: 500, minWidth: 26, textAlign: 'right' }}>{p.outputs}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card fade">
          <div className="card-head"><h3><Icon d={ICN.flag} /> Ramping / Low Sample</h3></div>
          <div className="card-body" style={{ paddingTop: 6, paddingBottom: 6 }}>
            {ramp.map(p => (
              <div className="lrow" key={p.id} onClick={() => onSelect(p)} style={{ cursor: 'pointer' }}>
                <Avatar p={p} />
                <div className="col" style={{ flex: 1 }}>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{p.name}</span>
                  <StatusTag s={p.status} />
                </div>
                <span className="muted-s">{p.outputs} out</span>
              </div>
            ))}
            {ramp.length === 0 && <div className="empty">None</div>}
          </div>
        </div>
      </div>

      {/* movers + activity + upcoming */}
      <div className="grid g-3">
        <div className="card fade">
          <div className="card-head"><h3><Icon d={ICN.growth} /> Output Movers</h3><span className="sub">cumulative</span></div>
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
                <span className={'tag ' + (a.cls === 'ok' ? 'ltx' : a.cls === 'warn' ? '' : 'ets')}>{a.tag}</span>
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
                <span className={'tag ' + (u.type === 'review' ? 'ltx' : 'ets')}>{u.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.Overview = Overview;
