// ─── Tab 5: Data Quality ───────────────────────────────────────

function QualityTab({ recs, setView }) {
  const [open, setOpen] = useState(() => new Set(['NO_COMPS', 'UNDERPRICED_VS_FAMILY', 'REVIEW_TARIFF_EVENT']));

  // Group recs by flag
  const groups = useMemo(() => {
    const g = {};
    for (const r of recs) {
      for (const f of r.flags) {
        if (!g[f]) g[f] = [];
        g[f].push(r);
      }
    }
    return g;
  }, [recs]);

  const FLAG_ORDER = [
    'REVIEW_TARIFF_EVENT', 'REVIEW_MARKET_SHIFT', 'REVIEW_PRICE_SHOCK',
    'NO_COMPS', 'DATA_GAP_COST',
    'UNDERPRICED_VS_FAMILY', 'OVERPRICED_VS_FAMILY', 'MONOTONICITY_VIOLATION',
    'MATCH_QUALITY_LOW', 'NONSTANDARD_LENGTH', 'FAMILY_DATA_THIN',
    'DEAD_STOCK', 'NO_STOCK',
  ];

  const flagList = FLAG_ORDER.filter(f => groups[f] && groups[f].length > 0);
  const totalFlags = recs.reduce((a, r) => a + r.flags.length, 0);
  const flaggedSkus = recs.filter(r => r.flags.length > 0).length;

  function toggle(f) {
    setOpen(o => {
      const n = new Set(o);
      n.has(f) ? n.delete(f) : n.add(f);
      return n;
    });
  }

  return (
    <div className="page-inner">
      <div className="page-head">
        <div>
          <h1 className="page-title">Data Quality</h1>
          <div className="page-sub">Flagged rows grouped by issue type. Triage with the data team; resolutions feed back into the next engine run.</div>
        </div>
      </div>

      <div className="mini-row" style={{ marginBottom: 16 }}>
        <div className="cell"><div className="lbl">Flagged SKUs</div><div className="val">{flaggedSkus}</div></div>
        <div className="cell"><div className="lbl">Total flags</div><div className="val">{totalFlags}</div></div>
        <div className="cell"><div className="lbl">Issue types</div><div className="val">{flagList.length}</div></div>
      </div>

      {flagList.map(flag => {
        const meta = FLAG_META[flag];
        const sev = meta.cls === 'flag-red' ? 'sev-red' : meta.cls === 'flag-amber' ? 'sev-amber' : '';
        const isOpen = open.has(flag);
        return (
          <div className="flag-group" key={flag}>
            <div className={`flag-group-head ${sev}`} onClick={() => toggle(flag)}>
              <span className={`chev ${isOpen ? 'open' : ''}`}><Icon name="chevR" width={11} height={11} /></span>
              <FlagChip flag={flag} />
              <div className="title">{flag.replace(/_/g, ' ').toLowerCase().replace(/^./, c => c.toUpperCase())}</div>
              <div className="descr">{meta.desc}</div>
              <div className="count">{groups[flag].length}</div>
            </div>
            {isOpen && (
              <div className="flag-group-body">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>IPN</th>
                      <th>Family</th>
                      <th className="numeric">Len</th>
                      <th className="numeric">Current</th>
                      <th className="numeric">Recommended</th>
                      <th>Context</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups[flag].slice(0, 20).map(r => (
                      <tr key={r.ipn_base}>
                        <td><span className="ipn">{r.ipn_base}</span></td>
                        <td><span className="family">{r.family}</span></td>
                        <td className="numeric">{r.length_ft}ft</td>
                        <td className="numeric">{fmtMoney(r.current_msrp)}</td>
                        <td className="numeric">{fmtMoney(r.recommended_msrp)}</td>
                        <td style={{ fontSize: 12, color: 'var(--fg-3)' }}>
                          {flag === 'MATCH_QUALITY_LOW' && r.notes}
                          {flag === 'UNDERPRICED_VS_FAMILY' && <span>L2 {fmtMoney(r.l2)} vs L3 {fmtMoney(r.l3)} · gap {r.l3 ? fmtPct((r.l2 - r.l3)/r.l3, 0) : '—'}</span>}
                          {flag === 'OVERPRICED_VS_FAMILY' && <span>L2 {fmtMoney(r.l2)} vs L3 {fmtMoney(r.l3)}</span>}
                          {flag === 'NO_COMPS' && <span>0 of 3 competitors present</span>}
                          {flag === 'DEAD_STOCK' && <span>{fmtInt(r.inventory_qty)} units · 90+ days no sales</span>}
                          {flag === 'NONSTANDARD_LENGTH' && <span>length {r.length_ft}ft not in standard set</span>}
                          {flag === 'REVIEW_TARIFF_EVENT' && <span>family-level event detected</span>}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-flat" onClick={() => setView({ tab: 'detail', ipnBase: r.ipn_base })}>Detail <Icon name="chevR" /></button>
                        </td>
                      </tr>
                    ))}
                    {groups[flag].length > 20 && (
                      <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--fg-4)', fontFamily: 'var(--f-mono)', fontSize: 11 }}>+ {groups[flag].length - 20} more rows</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { QualityTab });
