// ─── Tab 2: Family Heatmap ─────────────────────────────────────

function HeatmapTab({ recs, setView, setActionFilter }) {
  const [metricKey, setMetricKey] = useState('position');

  const FAMILIES = useMemo(() => [...new Set(recs.map(r => r.family))].sort(), [recs]);
  const LENGTH_BUCKETS = [
    { key: '0.5-1', label: '≤1ft',   min: 0,   max: 1.5 },
    { key: '2-5',   label: '2–5ft',  min: 1.5, max: 5.5 },
    { key: '6-10',  label: '6–10ft', min: 5.5, max: 10.5 },
    { key: '11-25', label: '11–25ft',min: 10.5, max: 25.5 },
    { key: '26-50', label: '26–50ft',min: 25.5, max: 50.5 },
    { key: '51-100',label: '51–100ft',min: 50.5, max: 200 },
  ];

  const METRICS = {
    position: {
      label: 'Position vs comp median',
      scale: divergingScale,
      legendLow: '-50% under',
      legendHigh: '+50% over',
      format: (v) => v == null ? '—' : (v >= 0 ? '+' : '') + (v * 100).toFixed(0) + '%',
      get: (rec) => {
        if (rec.l2 == null) return null;
        return (rec.current_msrp - rec.l2) / rec.l2;
      },
    },
    delta: {
      label: 'Recommended Δ%',
      scale: deltaScale,
      legendLow: 'trim',
      legendHigh: 'raise',
      format: (v) => v == null ? '—' : (v >= 0 ? '+' : '') + (v * 100).toFixed(0) + '%',
      get: (rec) => rec.delta_pct,
    },
    gm: {
      label: 'Avg GM%',
      scale: gmScale,
      legendLow: '0%',
      legendHigh: '70%',
      format: (v) => v == null ? '—' : (v * 100).toFixed(0) + '%',
      get: (rec) => rec.cost_basis > 0 ? (rec.current_msrp - rec.cost_basis) / rec.current_msrp : null,
    },
    coverage: {
      label: 'Comp coverage',
      scale: coverageScale,
      legendLow: '0',
      legendHigh: '3',
      format: (v) => v == null ? '—' : v.toFixed(1),
      get: (rec) => rec.l2_n,
    },
  };
  const metric = METRICS[metricKey];

  const cells = useMemo(() => {
    const m = {};
    for (const r of recs) {
      const bucket = LENGTH_BUCKETS.find(b => r.length_ft >= b.min && r.length_ft < b.max);
      if (!bucket) continue;
      const k = `${r.family}|${bucket.key}`;
      if (!m[k]) m[k] = [];
      m[k].push(r);
    }
    const out = {};
    for (const k in m) {
      const items = m[k];
      const vals = items.map(r => metric.get(r)).filter(v => v != null);
      if (vals.length === 0) {
        out[k] = { value: null, count: items.length, items, avgMsrp: items.reduce((a,r) => a + r.current_msrp, 0) / items.length };
      } else {
        const avg = vals.reduce((a,b) => a+b, 0) / vals.length;
        const avgMsrp = items.reduce((a,r) => a + r.current_msrp, 0) / items.length;
        out[k] = { value: avg, count: items.length, items, avgMsrp };
      }
    }
    return out;
  }, [recs, metricKey]);

  const rows = FAMILIES.map(f => ({ key: f, label: f }));

  const totalSkus = recs.length;
  const underCount = recs.filter(r => metric.get(r) != null && metric.get(r) < -0.1).length;
  const overCount  = recs.filter(r => metric.get(r) != null && metric.get(r) > 0.1).length;

  return (
    <div className="page-inner">
      <div className="page-head">
        <div>
          <h1 className="page-title">Family Heatmap</h1>
          <div className="page-sub">Family × length grid. Click any cell to drill into the Action Center filtered to that group.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Seg
            value={metricKey}
            onChange={setMetricKey}
            options={[
              { value: 'position', label: 'Position' },
              { value: 'delta',    label: 'Δ recommended' },
              { value: 'gm',       label: 'GM%' },
              { value: 'coverage', label: 'Coverage' },
            ]}
          />
        </div>
      </div>

      <div className="mini-row" style={{ marginBottom: 16 }}>
        <div className="cell"><div className="lbl">Total SKUs</div><div className="val">{totalSkus}</div></div>
        <div className="cell"><div className="lbl">Underpriced > 10%</div><div className="val" style={{ color: 'var(--err)' }}>{underCount}</div></div>
        <div className="cell"><div className="lbl">Overpriced > 10%</div><div className="val" style={{ color: 'var(--ok)' }}>{overCount}</div></div>
      </div>

      <Heatmap
        rows={rows}
        cols={LENGTH_BUCKETS}
        getCell={(rKey, cKey) => cells[`${rKey}|${cKey}`] || null}
        metric={metric}
        colorScale={metric.scale}
        onCellClick={(row, col, cell) => {
          setActionFilter({ family: [row.key], lengthBucket: col });
          setView({ tab: 'action' });
        }}
      />

      <div className="hr" />

      <div className="card" style={{ marginTop: 0 }}>
        <div className="card-head">
          <div>
            <div className="card-sub">Pricing posture</div>
            <div className="card-title">Position commentary</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12.5, color: 'var(--fg-3)', lineHeight: 1.55 }}>
              <strong style={{ color: 'var(--err)' }}>Cat6A</strong> is the standout opportunity — CK sits 30–50% below the comp band across every Cat6A length bucket. The engine recommends raising the entire row toward parity.
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12.5, color: 'var(--fg-3)', lineHeight: 1.55 }}>
              <strong style={{ color: 'var(--accent)' }}>Cat5e / Cat6</strong> is at or near parity. These rows act as the brand's value floor — small adjustments only.
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12.5, color: 'var(--fg-3)', lineHeight: 1.55 }}>
              <strong style={{ color: 'var(--info)' }}>Cat6 Slim</strong> trims slightly below MP and FS — within Parity posture. Two cells show overpricing (recommended trim) but on thin coverage.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HeatmapTab });
