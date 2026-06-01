// ─── Tab 3: SKU Detail ─────────────────────────────────────────

function SkuDetailTab({ recs, ipnBase, setView, openModal, applyAction }) {
  const toast = useToast();
  const rec = recs.find(r => r.ipn_base === ipnBase);

  if (!rec) {
    return (
      <div className="page-inner">
        <div className="empty">
          <h4>SKU not found</h4>
          <p>{ipnBase} is not in the current dataset.</p>
          <button className="btn btn-ghost" onClick={() => setView({ tab: 'action' })}>Back to Action Center</button>
        </div>
      </div>
    );
  }

  const history = useMemo(() => CK.compHistory(rec), [rec.ipn_base]);
  const historyChartData = history.map(h => {
    const dt = h.date;
    const q = Math.floor(dt.getMonth() / 3) + 1;
    return {
      date: dt,
      label: `Q${q} '${String(dt.getFullYear()).slice(2)}`,
      ck: h.ck, mp: h.mp, fs: h.fs, cw: h.cw,
    };
  });

  const series = [
    { key: 'mp', label: 'MP', color: 'var(--info)' },
    { key: 'fs', label: 'FS', color: '#c084fc' },
    { key: 'cw', label: 'CW', color: 'var(--ok)' },
    { key: 'ck', label: 'CK', color: 'var(--accent)', bold: true },
  ];

  // tariff event mark — q3 2025 (index 2) for Cat6A
  const events = rec.family.startsWith('Cat6A')
    ? [{ index: historyChartData.length - 2, label: 'Tariff event' }]
    : [];

  const curveData = useMemo(() => CK.curvePoints(rec), [rec.ipn_base]);

  const gm = rec.cost_basis > 0 ? (rec.recommended_msrp - rec.cost_basis) / rec.recommended_msrp : null;
  const posVsComp = rec.l2 ? (rec.recommended_msrp - rec.l2) / rec.l2 : null;

  // Mock audit trail for this SKU
  const auditTrail = [
    { ts: '2026-03-24 14:32', actor: 'system',  type: 'engine',   msg: <span>Engine recompute v1.0 → rec <b>{fmtMoney(rec.recommended_msrp)}</b> (config <span className="mono" style={{color:'var(--fg-4)'}}>d4a9c1f</span>)</span> },
    { ts: '2026-03-24 14:30', actor: 'system',  type: 'engine',   msg: <span>Comp data refreshed — {rec.l2_n} competitor{rec.l2_n !== 1 ? 's' : ''} present</span> },
    { ts: '2026-03-10 09:15', actor: 'louie',   type: 'approval', msg: <span>Approved engine rec → <b>{fmtMoney(rec.current_msrp)}</b> · reason: Q1 review</span> },
    { ts: '2026-02-08 13:21', actor: 'system',  type: 'engine',   msg: <span>{rec.family.startsWith('Cat6A') ? 'Family tariff event detected — auto-apply blocked' : 'Quarterly recompute'}</span> },
    { ts: '2026-01-02 11:00', actor: 'system',  type: 'engine',   msg: <span>Engine recompute v1.0 → rec <b>{fmtMoney(rec.current_msrp * 0.93)}</b></span> },
  ];

  return (
    <div className="page-inner">
      <div className="detail-head">
        <div>
          <button className="detail-back btn-flat" onClick={() => setView({ tab: 'action' })}>
            <Icon name="chevL" /> Back to Action Center
          </button>
          <div className="detail-title">
            <h2>{rec.family}</h2>
            <span className="ipn">{rec.ipn_base}</span>
            <span className="meta">{rec.length_ft}ft · {rec.awg}AWG · {rec.shielded ? 'Shielded' : 'Unshielded'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <button className="btn btn-ok" onClick={() => { applyAction(rec.ipn_base, 'approve'); toast.push({ title: `${rec.ipn_base} set to ${fmtMoney(rec.recommended_msrp)}` }); }}>
            <Icon name="check" /> Approve {fmtMoney(rec.recommended_msrp)}
          </button>
          <button className="btn btn-ghost" onClick={() => openModal('reject', { rec })}>Reject</button>
          <button className="btn btn-ghost" onClick={() => openModal('override', { rec })}><Icon name="edit" /> Override</button>
        </div>
      </div>

      <div className="detail-strip">
        <div className="cell">
          <div className="lbl">Current MSRP</div>
          <div className="val">{fmtMoney(rec.current_msrp)}</div>
          <div className="sub">live</div>
        </div>
        <div className="cell">
          <div className="lbl">Recommended</div>
          <div className="val" style={{ color: 'var(--accent)' }}>{fmtMoney(rec.recommended_msrp)}</div>
          <div className="sub">composite</div>
        </div>
        <div className="cell">
          <div className="lbl">Δ %</div>
          <div className="val"><Delta value={rec.delta_pct} /></div>
          <div className="sub"><ActionBadge code={rec.action_code} /></div>
        </div>
        <div className="cell">
          <div className="lbl">Confidence</div>
          <div className="val" style={{ fontSize: 14 }}><ConfBadge level={rec.confidence} /></div>
          <div className="sub">{rec.l2_n} comp{rec.l2_n !== 1 ? 's' : ''}</div>
        </div>
        <div className="cell">
          <div className="lbl">Cost basis</div>
          <div className="val">{fmtMoney(rec.cost_basis)}</div>
          <div className="sub">GM {gm != null ? (gm * 100).toFixed(1) + '%' : '—'}</div>
        </div>
        <div className="cell">
          <div className="lbl">Inventory</div>
          <div className="val">{fmtInt(rec.inventory_qty)}</div>
          <div className="sub">{rec.velocity_tier} · {rec.posture}</div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-sub">Engine</div>
              <div className="card-title">Layer breakdown</div>
            </div>
          </div>
          <div className="layer-list">
            <div className="layer-row">
              <span className="lay-key">L1</span>
              <span className="lay-name">Cost Floor <span className="sub">cost × 1.30</span></span>
              <span className="lay-val">{fmtMoney(rec.l1)}</span>
            </div>
            <div className="layer-row">
              <span className="lay-key">L2</span>
              <span className="lay-name">Competitive Median <span className="sub">{rec.confidence}, n={rec.l2_n}</span></span>
              <span className="lay-val">{fmtMoney(rec.l2)}</span>
            </div>
            <div className="layer-row">
              <span className="lay-key">L3</span>
              <span className="lay-name">Family Curve <span className="sub">@ {rec.length_ft}ft</span></span>
              <span className="lay-val">{fmtMoney(rec.l3)}</span>
            </div>
            <div className="layer-row">
              <span className="lay-key">L4</span>
              <span className="lay-name">Velocity · Posture <span className="sub">{rec.velocity_tier} · {rec.posture}</span></span>
              <span className="lay-val">{fmtMoney(rec.l4)}</span>
            </div>
            <div className="layer-row composite">
              <span className="lay-key">∑</span>
              <span className="lay-name">Composite <span className="sub">max(L1, weighted)</span></span>
              <span className="lay-val">{fmtMoney(rec.recommended_msrp)}</span>
            </div>
          </div>
          <div className="eq-line">
            0.55 · <b>{fmtMoney(rec.l2)}</b> + 0.30 · <b>{fmtMoney(rec.l3)}</b> + 0.15 · <b>{fmtMoney(rec.l4)}</b> = <b>{fmtMoney(rec.composite)}</b>
          </div>

          <div className="hr" />

          <div className="card-head">
            <div>
              <div className="card-sub">Market position</div>
              <div className="card-title">Comp position</div>
            </div>
          </div>
          <CompPositionBar rec={rec} />
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-sub">12-month history</div>
              <div className="card-title">Comp price history</div>
            </div>
            <span className="grow" />
            <div style={{ fontSize: 11, color: 'var(--fg-4)', fontFamily: 'var(--f-mono)' }}>quarterly snapshots</div>
          </div>
          <TimeSeriesChart data={historyChartData} series={series} events={events} height={250} />

          <div className="hr" />

          <div className="card-head">
            <div>
              <div className="card-sub">Length × Price</div>
              <div className="card-title">Family power-law curve</div>
            </div>
            <span className="grow" />
            <div style={{ fontSize: 11, color: 'var(--fg-4)', fontFamily: 'var(--f-mono)' }}>log-log scale</div>
          </div>
          <FamilyCurveChart curve={curveData.curve} points={curveData.points} height={210} />
        </div>
      </div>

      <div className="detail-grid">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-sub">Color equivalence rule</div>
              <div className="card-title">Variants ({rec.color_variants.length})</div>
            </div>
            <span className="grow" />
            <div style={{ fontSize: 11, color: 'var(--fg-4)', fontFamily: 'var(--f-mono)' }}>same MSRP across colors</div>
          </div>
          <div>
            {rec.color_variants.map(v => (
              <div className="variant-row" key={v.ipn}>
                <span className="swatch" style={{ background: v.colorHex }} />
                <span className="ipn">{v.ipn}</span>
                <span className="color-name">{v.colorName}</span>
                <span className="stock">{fmtInt(v.inventory_qty)} u</span>
                <span style={{ fontFamily: 'var(--f-mono)', color: 'var(--fg-3)', fontSize: 12 }}>{fmtMoney(rec.recommended_msrp)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-sub">Reverse chronological</div>
              <div className="card-title">Audit trail</div>
            </div>
            <span className="grow" />
            <button className="btn btn-flat">View full log <Icon name="chevR" /></button>
          </div>
          <div className="audit-log">
            {auditTrail.map((a, i) => (
              <div key={i} className={`audit-item ${a.type}`}>
                <span className="dot" />
                <span className="ts">{a.ts}</span>
                <span className="msg">{a.msg}</span>
                <span className="by">@{a.actor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SkuDetailTab });
