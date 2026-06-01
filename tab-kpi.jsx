// ─── Tab 6: KPI Summary ────────────────────────────────────────

function KPITab({ recs, setView, setActionFilter }) {
  const [chartKind, setChartKind] = useState('bar');
  const [chartMetric, setChartMetric] = useState('action');
  const [scatterX, setScatterX] = useState('cost_basis');
  const [scatterY, setScatterY] = useState('delta_pct');
  const [colorBy, setColorBy] = useState('action');

  // Portfolio KPIs — before/after where meaningful
  const totalCurrent = recs.reduce((a, r) => a + r.current_msrp, 0);
  const totalRec = recs.reduce((a, r) => a + r.recommended_msrp, 0);
  const avgCurrent = totalCurrent / recs.length;
  const avgRec = totalRec / recs.length;

  const gmCurrent = recs.filter(r => r.cost_basis > 0).reduce((a, r) => a + (r.current_msrp - r.cost_basis) / r.current_msrp, 0) / recs.filter(r => r.cost_basis > 0).length;
  const gmRec = recs.filter(r => r.cost_basis > 0).reduce((a, r) => a + (r.recommended_msrp - r.cost_basis) / r.recommended_msrp, 0) / recs.filter(r => r.cost_basis > 0).length;

  // Mocked annual revenue: current_msrp × inventory_qty × 4 turns
  const revCurrent = recs.reduce((a, r) => a + r.current_msrp * r.inventory_qty * 4, 0);
  const revRec     = recs.reduce((a, r) => a + r.recommended_msrp * r.inventory_qty * 4, 0);

  const counts = {
    total: recs.length,
    actions: recs.filter(r => ['GAP_UP', 'GAP_DOWN'].includes(r.action_code)).length,
    overrides: recs.filter(r => r.action_code === 'MANUAL_OVERRIDE').length,
    high: recs.filter(r => r.confidence === 'HIGH').length,
    medium: recs.filter(r => r.confidence === 'MEDIUM').length,
    low: recs.filter(r => r.confidence === 'LOW').length,
    no_stock: recs.filter(r => r.action_code === 'HOLD_NO_STOCK').length,
  };

  // Action distribution
  const actionDist = [
    { label: 'GAP UP',     value: recs.filter(r => r.action_code === 'GAP_UP').length,           color: 'var(--up)' },
    { label: 'GAP DOWN',   value: recs.filter(r => r.action_code === 'GAP_DOWN').length,         color: 'var(--down)' },
    { label: 'HOLD',       value: recs.filter(r => r.action_code === 'HOLD').length,             color: 'var(--hold)' },
    { label: 'REVIEW',     value: recs.filter(r => /^REVIEW/.test(r.action_code)).length,        color: 'var(--review)' },
    { label: 'NO STOCK',   value: recs.filter(r => r.action_code === 'HOLD_NO_STOCK').length,    color: 'var(--fg-4)' },
    { label: 'OVERRIDE',   value: recs.filter(r => r.action_code === 'MANUAL_OVERRIDE').length,  color: 'var(--accent)' },
  ];
  const totalActions = actionDist.reduce((a, d) => a + d.value, 0);

  // Family-level summary
  const familyDist = useMemo(() => {
    const m = {};
    for (const r of recs) {
      if (!m[r.family]) m[r.family] = { label: r.family, count: 0, current: 0, rec: 0, pos: [], actions: 0 };
      m[r.family].count++;
      m[r.family].current += r.current_msrp;
      m[r.family].rec += r.recommended_msrp;
      if (r.l2 != null) m[r.family].pos.push((r.current_msrp - r.l2) / r.l2);
      if (['GAP_UP', 'GAP_DOWN'].includes(r.action_code)) m[r.family].actions++;
    }
    return Object.values(m).map(g => ({
      label: g.label,
      count: g.count,
      avgCurrent: g.current / g.count,
      avgRec: g.rec / g.count,
      avgPos: g.pos.length ? g.pos.reduce((a,b)=>a+b,0) / g.pos.length : null,
      actions: g.actions,
    })).sort((a, b) => b.actions - a.actions);
  }, [recs]);

  // Charts: dynamic data for the customizable chart
  const chartData = useMemo(() => {
    if (chartMetric === 'action') {
      return actionDist.filter(d => d.value > 0).map(d => ({ label: d.label, value: d.value, color: d.color }));
    } else if (chartMetric === 'family_count') {
      return familyDist.map(f => ({ label: f.label.replace(/Half Moon/, 'HM').replace(/Shielded/, 'Sh.').replace(/Unshielded/, 'Unsh.'), value: f.count }));
    } else if (chartMetric === 'family_actions') {
      return familyDist.filter(f => f.actions > 0).map(f => ({ label: f.label.replace(/Half Moon/, 'HM').replace(/Shielded/, 'Sh.').replace(/Unshielded/, 'Unsh.'), value: f.actions }));
    } else if (chartMetric === 'confidence') {
      return [
        { label: 'HIGH', value: counts.high, color: 'var(--ok)' },
        { label: 'MEDIUM', value: counts.medium, color: 'var(--accent)' },
        { label: 'LOW', value: counts.low, color: 'var(--err)' },
      ];
    }
    return [];
  }, [chartMetric, recs]);

  const scatterColor = (d) => {
    if (colorBy === 'action') {
      return d.action_code === 'GAP_UP' ? 'var(--up)'
           : d.action_code === 'GAP_DOWN' ? 'var(--down)'
           : d.action_code === 'HOLD' ? 'var(--hold)'
           : 'var(--fg-4)';
    } else if (colorBy === 'confidence') {
      return d.confidence === 'HIGH' ? 'var(--ok)' : d.confidence === 'MEDIUM' ? 'var(--accent)' : 'var(--err)';
    }
    return 'var(--accent)';
  };

  const scatterAxes = {
    cost_basis: { label: 'Cost basis ($)', isPct: false },
    current_msrp: { label: 'Current MSRP ($)', isPct: false },
    recommended_msrp: { label: 'Recommended MSRP ($)', isPct: false },
    delta_pct: { label: 'Δ % from current', isPct: true },
    length_ft: { label: 'Length (ft)', isPct: false },
    inventory_qty: { label: 'Inventory units', isPct: false },
  };

  return (
    <div className="page-inner">
      <div className="page-head">
        <div>
          <h1 className="page-title">KPI Summary</h1>
          <div className="page-sub">Portfolio-level reporting. Customize charts below to explore the impact of accepting the engine's recommendations.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost"><Icon name="download" /> Export xlsx</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-label">Avg MSRP · current → rec</div>
          <div className="kpi-row">
            <div className="kpi-num">{fmtMoney(avgCurrent)}</div>
            <div className="kpi-rec"><span className="arrow">→</span> <b>{fmtMoney(avgRec)}</b></div>
          </div>
          <div className="kpi-foot"><Delta value={(avgRec - avgCurrent) / avgCurrent} /></div>
          <div className="kpi-spark"><Sparkline data={[avgCurrent * 0.92, avgCurrent * 0.94, avgCurrent * 0.96, avgCurrent, avgRec]} width={70} height={26} /></div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Avg GM% · current → rec</div>
          <div className="kpi-row">
            <div className="kpi-num">{(gmCurrent * 100).toFixed(1)}%</div>
            <div className="kpi-rec"><span className="arrow">→</span> <b>{(gmRec * 100).toFixed(1)}%</b></div>
          </div>
          <div className="kpi-foot"><Delta value={gmRec - gmCurrent} decimals={1} />pp gross margin</div>
          <div className="kpi-spark"><Sparkline data={[gmCurrent * 0.94, gmCurrent * 0.97, gmCurrent * 0.99, gmCurrent, gmRec]} width={70} height={26} color="var(--ok)" /></div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Total annual rev (proj.)</div>
          <div className="kpi-row">
            <div className="kpi-num">${(revCurrent / 1e6).toFixed(2)}M</div>
            <div className="kpi-rec"><span className="arrow">→</span> <b>${(revRec / 1e6).toFixed(2)}M</b></div>
          </div>
          <div className="kpi-foot"><Delta value={(revRec - revCurrent) / revCurrent} /></div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Actions pending</div>
          <div className="kpi-row">
            <div className="kpi-num">{counts.actions}</div>
            <div className="kpi-rec" style={{ alignSelf: 'baseline' }}>of {counts.total} SKUs</div>
          </div>
          <div className="kpi-foot">{counts.high} HIGH · {counts.medium} MED · {counts.low} LOW conf</div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-sub">Distribution</div>
              <div className="card-title">Action breakdown</div>
            </div>
            <span className="grow" />
          </div>
          <div className="stacked-bar">
            {actionDist.filter(d => d.value > 0).map((d, i) => (
              <div
                key={i}
                style={{ flex: d.value, background: d.color }}
                title={`${d.label} · ${d.value}`}
                onClick={() => {
                  if (d.label === 'GAP UP') setActionFilter({ action: ['GAP_UP'] });
                  else if (d.label === 'GAP DOWN') setActionFilter({ action: ['GAP_DOWN'] });
                  setView({ tab: 'action' });
                }}
              >
                {d.value > totalActions * 0.05 ? d.value : ''}
              </div>
            ))}
          </div>
          <div className="stacked-legend">
            {actionDist.filter(d => d.value > 0).map((d, i) => (
              <div className="item" key={i}>
                <span className="sw" style={{ background: d.color }} />
                <span>{d.label}</span>
                <span style={{ color: 'var(--fg)' }}>{d.value}</span>
              </div>
            ))}
          </div>

          <div className="hr" />

          <div className="card-head">
            <div>
              <div className="card-sub">Customizable</div>
              <div className="card-title">Portfolio chart</div>
            </div>
            <span className="grow" />
            <Seg
              value={chartKind}
              onChange={setChartKind}
              options={[
                { value: 'bar', label: 'Bars' },
                { value: 'donut', label: 'Donut' },
                { value: 'hbar', label: 'Horiz.' },
              ]}
            />
          </div>
          <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="label-mono" style={{ fontFamily: 'var(--f-mono)', fontSize: 10.5, color: 'var(--fg-4)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Metric</span>
            <Select
              label="Metric"
              value={chartMetric}
              onChange={setChartMetric}
              options={[
                { value: 'action', label: 'By action code' },
                { value: 'confidence', label: 'By confidence' },
                { value: 'family_count', label: 'SKU count by family' },
                { value: 'family_actions', label: 'Pending actions by family' },
              ]}
            />
          </div>
          {chartKind === 'donut' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 24, alignItems: 'center' }}>
              <DonutChart data={chartData.map((d, i) => ({ ...d, color: d.color || ['#ffb800','#60a5fa','#4ade80','#f87171','#c084fc','#fb923c'][i % 6] }))} size={160} thickness={26} />
              <div>
                {chartData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: d.color || ['#ffb800','#60a5fa','#4ade80','#f87171','#c084fc','#fb923c'][i % 6] }} />
                    <span style={{ flex: 1, fontSize: 12.5, color: 'var(--fg-2)' }}>{d.label}</span>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--fg)' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <BarChart data={chartData} horizontal={chartKind === 'hbar'} height={chartKind === 'hbar' ? Math.max(140, chartData.length * 24) : 200} />
          )}
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-sub">Cross-section</div>
              <div className="card-title">SKU scatter plot</div>
            </div>
            <span className="grow" />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
            <span className="label-mono" style={{ fontFamily: 'var(--f-mono)', fontSize: 10.5, color: 'var(--fg-4)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>X</span>
            <Select label="X" value={scatterX} onChange={setScatterX} options={Object.keys(scatterAxes).map(k => ({ value: k, label: scatterAxes[k].label }))} />
            <span className="label-mono" style={{ fontFamily: 'var(--f-mono)', fontSize: 10.5, color: 'var(--fg-4)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Y</span>
            <Select label="Y" value={scatterY} onChange={setScatterY} options={Object.keys(scatterAxes).map(k => ({ value: k, label: scatterAxes[k].label }))} />
            <span className="label-mono" style={{ fontFamily: 'var(--f-mono)', fontSize: 10.5, color: 'var(--fg-4)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Color</span>
            <Select label="By" value={colorBy} onChange={setColorBy} options={[{ value: 'action', label: 'Action' }, { value: 'confidence', label: 'Confidence' }, { value: 'none', label: 'None' }]} />
          </div>
          <ScatterChart
            data={recs}
            xKey={scatterX}
            yKey={scatterY}
            xLabel={scatterAxes[scatterX].label}
            yLabel={scatterAxes[scatterY].label}
            height={300}
            colorBy={scatterColor}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-sub">Sortable</div>
            <div className="card-title">Family-level summary</div>
          </div>
          <span className="grow" />
          <button className="btn btn-flat"><Icon name="download" /> Export</button>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Family</th>
              <th className="numeric">SKUs</th>
              <th className="numeric">Avg current</th>
              <th className="numeric">Avg recommended</th>
              <th className="numeric">Δ%</th>
              <th className="numeric">Avg position vs comp</th>
              <th className="numeric">Actions pending</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {familyDist.map(f => (
              <tr key={f.label}>
                <td><span className="family" style={{ color: 'var(--fg)', fontWeight: 500 }}>{f.label}</span></td>
                <td className="numeric">{f.count}</td>
                <td className="numeric">{fmtMoney(f.avgCurrent)}</td>
                <td className="numeric"><b style={{ color: 'var(--accent)' }}>{fmtMoney(f.avgRec)}</b></td>
                <td className="numeric"><Delta value={(f.avgRec - f.avgCurrent) / f.avgCurrent} /></td>
                <td className="numeric"><Delta value={f.avgPos} /></td>
                <td className="numeric"><strong style={{ color: f.actions > 0 ? 'var(--accent)' : 'var(--fg-3)' }}>{f.actions}</strong></td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-flat" onClick={() => { setActionFilter({ family: [f.label] }); setView({ tab: 'action' }); }}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

Object.assign(window, { KPITab });
