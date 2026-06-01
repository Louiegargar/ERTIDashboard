// ─── Tab 4: Manual Overrides ───────────────────────────────────

function OverridesTab({ recs, setView, removeOverride }) {
  const toast = useToast();
  const overridden = recs.filter(r => r.action_code === 'MANUAL_OVERRIDE');

  // For each override row, recompute what the engine WOULD recommend now
  // (we already have recommended_msrp from override; we need pseudo-engine-rec for comparison).
  // We'll mock the engine value as the L4-style estimate or simply the comp median + 5%.
  const enriched = overridden.map(r => {
    // Get engine rec by stripping the override (simple mock: composite from L2 if present, else current * 0.96)
    const skus = window.__skus;
    const orig = skus.find(s => s.ipn_base === r.ipn_base);
    const engineRec = orig ? Math.round((orig.current_msrp * 0.96 + (Math.random() * 0.4 - 0.2)) * 100) / 100 : r.current_msrp;
    return { ...r, engineRec, diff: (r.recommended_msrp - engineRec) / engineRec };
  });

  function removeRow(rec) {
    removeOverride(rec.ipn_base);
    toast.push({ title: `${rec.ipn_base} re-enabled`, msg: `Reverted to engine recommendation` });
  }

  return (
    <div className="page-inner">
      <div className="page-head">
        <div>
          <h1 className="page-title">Manual Overrides ({overridden.length})</h1>
          <div className="page-sub">SKUs with engine-authoritative overrides active. Sorted by drift from current engine rec.</div>
        </div>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>IPN</th>
              <th>Family</th>
              <th className="numeric">Override $</th>
              <th className="numeric">Engine rec</th>
              <th className="numeric">Drift</th>
              <th>Set by</th>
              <th>Set on</th>
              <th>Reason</th>
              <th style={{ width: 160 }}></th>
            </tr>
          </thead>
          <tbody>
            {enriched.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff)).map(r => (
              <tr key={r.ipn_base}>
                <td><span className="ipn">{r.ipn_base}</span></td>
                <td><span className="family">{r.family}</span></td>
                <td className="numeric"><strong style={{ color: 'var(--fg)' }}>{fmtMoney(r.recommended_msrp)}</strong></td>
                <td className="numeric" style={{ color: 'var(--fg-3)' }}>{fmtMoney(r.engineRec)}</td>
                <td className="numeric"><Delta value={r.diff} /></td>
                <td className="mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>@{r.override_by}</td>
                <td className="mono" style={{ fontSize: 12, color: 'var(--fg-3)' }}>{r.override_at}</td>
                <td style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>{r.override_reason}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-flat" onClick={() => setView({ tab: 'detail', ipnBase: r.ipn_base })}>Detail</button>
                  <button className="btn btn-danger btn-sm" style={{ marginLeft: 6 }} onClick={() => removeRow(r)}><Icon name="refresh" /> Re-enable</button>
                </td>
              </tr>
            ))}
            {enriched.length === 0 && (
              <tr><td colSpan={9}><div className="empty"><h4>No active overrides</h4><p>Every SKU is currently engine-authoritative.</p></div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

Object.assign(window, { OverridesTab });
