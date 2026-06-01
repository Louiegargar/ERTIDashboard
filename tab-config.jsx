// ─── Tab 7: Configuration & What-if Simulator ──────────────────

function ConfigTab({ config, setConfig, recs, simulatedRecs, simMode, setSimMode, promoteScenario }) {
  const toast = useToast();
  const [localCfg, setLocalCfg] = useState(config);

  useEffect(() => { setLocalCfg(config); }, [config]);

  function update(field, value) {
    const c = { ...localCfg, [field]: value };
    setLocalCfg(c);
    if (simMode) setConfig(c);
  }
  function updatePosture(family, value) {
    const c = { ...localCfg, postures: { ...localCfg.postures, [family]: value } };
    setLocalCfg(c);
    if (simMode) setConfig(c);
  }

  // weights must sum near 1.0 — display warning otherwise
  const wSum = localCfg.w_l2 + localCfg.w_l3 + localCfg.w_l4;
  const wOk = Math.abs(wSum - 1.0) < 0.01;

  const POSTURES = ['Value Leader', 'Value', 'Parity', 'Premium', 'Strategic Premium'];

  // Family list
  const FAMS = useMemo(() => [...new Set(recs.map(r => r.family))], [recs]);

  // Simulated impact preview
  const simImpact = useMemo(() => {
    if (!simMode || !simulatedRecs) return null;
    const cur = recs.reduce((a, r) => a + r.current_msrp, 0) / recs.length;
    const rec = simulatedRecs.reduce((a, r) => a + r.recommended_msrp, 0) / simulatedRecs.length;
    const gapUp   = simulatedRecs.filter(r => r.action_code === 'GAP_UP').length;
    const gapDown = simulatedRecs.filter(r => r.action_code === 'GAP_DOWN').length;
    return { cur, rec, gapUp, gapDown };
  }, [simMode, simulatedRecs, recs]);

  function applyChanges() {
    setConfig(localCfg);
    toast.push({ title: 'Config saved', msg: 'Engine will recompute recommendations on next run' });
  }

  function exitSim() {
    setSimMode(false);
    setLocalCfg(config);
    toast.push({ title: 'Simulation discarded' });
  }

  return (
    <div className="page-inner">
      <div className="page-head">
        <div>
          <h1 className="page-title">Engine configuration</h1>
          <div className="page-sub">Tune the 4-layer composite weights, cost floor, action thresholds, and per-family posture multipliers.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Seg
            value={simMode ? 'sim' : 'active'}
            onChange={(v) => setSimMode(v === 'sim')}
            options={[
              { value: 'active', label: 'Active config' },
              { value: 'sim',    label: 'What-if simulator' },
            ]}
          />
        </div>
      </div>

      {simMode && (
        <div className="sim-banner">
          <div className="ic">SIM</div>
          <div className="txt">
            <b>What-if mode</b> — changes apply live across all tabs but are not saved to the engine. Promote to active to commit.
          </div>
          {simImpact && (
            <div style={{ display: 'flex', gap: 16, marginRight: 8, fontFamily: 'var(--f-mono)', fontSize: 11.5 }}>
              <div>Avg MSRP <b style={{ color: 'var(--fg)' }}>{fmtMoney(simImpact.cur)} → {fmtMoney(simImpact.rec)}</b></div>
              <div>↑{simImpact.gapUp}</div>
              <div>↓{simImpact.gapDown}</div>
            </div>
          )}
          <button className="btn btn-flat" onClick={exitSim}>Discard</button>
          <button className="btn btn-primary" onClick={() => { promoteScenario(); setSimMode(false); toast.push({ title: 'Scenario promoted to active config' }); }}>
            <Icon name="check" /> Promote to active
          </button>
        </div>
      )}

      <div className="config-grid">
        <div className="cfg-group">
          <h4>Layer weights <span className="sub">must sum to 1.00 · current: {wSum.toFixed(2)} {wOk ? '✓' : '⚠'}</span></h4>
          <SliderRow label="L2 Competitive" sub="0.40 – 0.70" value={localCfg.w_l2} min={0.40} max={0.70} step={0.01} onChange={v => update('w_l2', v)} />
          <SliderRow label="L3 Family Curve" sub="0.20 – 0.40" value={localCfg.w_l3} min={0.20} max={0.40} step={0.01} onChange={v => update('w_l3', v)} />
          <SliderRow label="L4 Velocity · Posture" sub="0.05 – 0.25" value={localCfg.w_l4} min={0.05} max={0.25} step={0.01} onChange={v => update('w_l4', v)} />
        </div>

        <div className="cfg-group">
          <h4>Cost floor & action thresholds</h4>
          <SliderRow label="Min margin %" sub="25 – 40%" value={localCfg.min_margin_pct} min={0.25} max={0.40} step={0.01} format={v => (v*100).toFixed(0) + '%'} onChange={v => update('min_margin_pct', v)} />
          <SliderRow label="HOLD band ±" sub="3 – 8%" value={localCfg.action_threshold} min={0.03} max={0.08} step={0.005} format={v => (v*100).toFixed(1) + '%'} onChange={v => update('action_threshold', v)} />
        </div>

        <div className="cfg-group">
          <h4>Velocity multipliers <span className="sub">applied to current MSRP in L4</span></h4>
          <SliderRow label="Bestseller bump" value={localCfg.velocity_mults.Bestseller} min={1.00} max={1.05} step={0.005} format={v => '×' + v.toFixed(3)} onChange={v => update('velocity_mults', { ...localCfg.velocity_mults, Bestseller: v })} />
          <SliderRow label="Slow mover trim" value={localCfg.velocity_mults['Slow Mover']} min={0.93} max={1.00} step={0.005} format={v => '×' + v.toFixed(3)} onChange={v => update('velocity_mults', { ...localCfg.velocity_mults, 'Slow Mover': v })} />
          <SliderRow label="Dead stock trim" value={localCfg.velocity_mults['Dead Stock']} min={0.85} max={0.95} step={0.005} format={v => '×' + v.toFixed(3)} onChange={v => update('velocity_mults', { ...localCfg.velocity_mults, 'Dead Stock': v })} />
        </div>

        <div className="cfg-group">
          <h4>Event detection thresholds</h4>
          <SliderRow label="Family review trigger" sub="comp median move over 30d" value={localCfg.event_family_threshold} min={0.03} max={0.10} step={0.005} format={v => (v*100).toFixed(1) + '%'} onChange={v => update('event_family_threshold', v)} />
          <SliderRow label="SKU shock trigger" sub="single-SKU L2 move" value={localCfg.event_sku_threshold} min={0.10} max={0.25} step={0.01} format={v => (v*100).toFixed(0) + '%'} onChange={v => update('event_sku_threshold', v)} />
          <div className="slider-row">
            <div className="row">
              <span className="label">Simulate tariff event</span>
              <Cb on={localCfg.simulateEvent} onChange={v => update('simulateEvent', v)} />
            </div>
            <div className="range-row">
              <span>Flags all Cat6A SKUs with REVIEW_TARIFF_EVENT and blocks auto-apply.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="cfg-group" style={{ marginTop: 16 }}>
        <h4>Per-family posture multipliers</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {FAMS.map(f => {
            const cur = localCfg.postures[f] || CK.POSTURE_MULT[recs.find(r => r.family === f).posture] || 1.0;
            const curName = POSTURES.find(p => Math.abs(CK.POSTURE_MULT[p] - cur) < 0.001) || 'Custom';
            return (
              <div key={f} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12, alignItems: 'center', padding: '6px 10px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 'var(--r-2)' }}>
                <div style={{ fontSize: 12.5 }}>{f}</div>
                <select
                  value={curName}
                  onChange={(e) => updatePosture(f, CK.POSTURE_MULT[e.target.value])}
                  style={{
                    background: 'var(--bg-1)', border: '1px solid var(--line)',
                    color: 'var(--fg)', padding: '5px 8px', borderRadius: 'var(--r-1)',
                    fontSize: 12, fontFamily: 'var(--f-mono)',
                  }}
                >
                  {POSTURES.map(p => <option key={p} value={p}>{p} (×{CK.POSTURE_MULT[p].toFixed(2)})</option>)}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {!simMode && (
        <div style={{ display: 'flex', gap: 8, marginTop: 18, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={() => setLocalCfg(config)}>Discard changes</button>
          <button className="btn btn-primary" onClick={applyChanges} disabled={!wOk}>
            <Icon name="check" /> Save as active
          </button>
        </div>
      )}
    </div>
  );
}

function SliderRow({ label, sub, value, min, max, step, format, onChange }) {
  const fmt = format || (v => v.toFixed(2));
  return (
    <div className="slider-row">
      <div className="row">
        <span className="label">{label}{sub && <span className="sub">{sub}</span>}</span>
        <span className="val">{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} />
      <div className="range-row">
        <span>{fmt(min)}</span>
        <span>{fmt(max)}</span>
      </div>
    </div>
  );
}

Object.assign(window, { ConfigTab });
