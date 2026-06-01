// ─── Main App Shell ────────────────────────────────────────────

function App() {
  // ─── State ───
  const [view, setView] = useState({ tab: 'action' }); // {tab, ipnBase?}
  const [config, setConfig] = useState(CK.DEFAULT_CONFIG);
  const [simMode, setSimMode] = useState(false);
  const [overrides, setOverrides] = useState(window.__overrides);
  const [actionFilter, setActionFilter] = useState(null);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');

  // Re-run engine when config or overrides change
  const recs = useMemo(() => {
    window.__overrides = overrides;
    return CK.runEngine(window.__skus, config);
  }, [config, overrides]);

  const simulatedRecs = useMemo(() => {
    if (!simMode) return null;
    return CK.runEngine(window.__skus, config);
  }, [simMode, config]);

  // Apply approve / defer (just mark in local state)
  const [applied, setApplied] = useState(new Set());
  const [deferred, setDeferred] = useState(new Set());

  function applyAction(ipnBase, kind) {
    if (kind === 'approve') {
      // Actually update current_msrp in the underlying skus
      const sku = window.__skus.find(s => s.ipn_base === ipnBase);
      const rec = recs.find(r => r.ipn_base === ipnBase);
      if (sku && rec) {
        sku.current_msrp = rec.recommended_msrp;
        setApplied(s => new Set(s).add(ipnBase));
        // Force rerender by toggling overrides ref
        setOverrides(o => ({ ...o }));
      }
    } else if (kind === 'defer') {
      setDeferred(d => new Set(d).add(ipnBase));
    }
  }

  function removeOverride(ipn) {
    setOverrides(o => {
      const n = { ...o };
      delete n[ipn];
      return n;
    });
  }

  function setOverride(ipn, value, reason) {
    setOverrides(o => ({ ...o, [ipn]: { value, by: 'louie', reason, at: '2026-03-24' } }));
  }

  function openModal(kind, payload) {
    setModal({ kind, payload });
  }

  function promoteScenario() {
    // already updates live in sim mode — just exit sim mode
  }

  // Counts for sidebar badges
  const counts = useMemo(() => ({
    action:   recs.filter(r => ['GAP_UP', 'GAP_DOWN'].includes(r.action_code)).length,
    quality:  recs.filter(r => r.flags.length > 0).length,
    overrides: recs.filter(r => r.action_code === 'MANUAL_OVERRIDE').length,
  }), [recs]);

  const tabs = [
    { id: 'action',    label: 'Action Center',    icon: 'spark',   count: counts.action,   attention: counts.action > 0 },
    { id: 'heatmap',   label: 'Family Heatmap',   icon: 'grid' },
    { id: 'detail',    label: 'SKU Detail',       icon: 'cube' },
    { id: 'overrides', label: 'Manual Overrides', icon: 'edit',    count: counts.overrides },
    { id: 'quality',   label: 'Data Quality',     icon: 'shield',  count: counts.quality,  attention: false },
    { id: 'kpi',       label: 'KPI Summary',      icon: 'bars' },
    { id: 'config',    label: 'Configuration',    icon: 'gear' },
  ];

  return (
    <ToastProvider>
      <div className="app">
        {/* SIDEBAR */}
        <aside className="side">
          <div className="side-brand">
            <div className="brand-mark">CK</div>
            <div>
              <div className="brand-name">Cable Pricing</div>
              <div className="brand-sub">Engine v1.0</div>
            </div>
          </div>

          <div className="side-section">Workspace</div>
          <nav className="side-nav">
            {tabs.map(t => (
              <a
                key={t.id}
                className={`side-link ${view.tab === t.id ? 'active' : ''}`}
                onClick={() => setView({ tab: t.id, ipnBase: t.id === 'detail' ? view.ipnBase || recs[0]?.ipn_base : undefined })}
              >
                <Icon name={t.icon} />
                <span className="label">{t.label}</span>
                {t.count != null && t.count > 0 && <span className={`count ${t.attention ? 'attention' : ''}`}>{t.count}</span>}
              </a>
            ))}
          </nav>

          <div className="side-foot">
            <div className="user-pill">
              <div className="user-avatar">L</div>
              <div>
                <div className="user-name">Louie</div>
                <div className="user-role">pricing · admin</div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div className="main">
          <div className="topbar">
            <div className="crumbs">
              <span className="crumb">Pricing</span>
              <span className="crumb-sep">›</span>
              <span className="crumb">Cables</span>
              <span className="crumb-sep">›</span>
              <span className="crumb-now">{tabs.find(t => t.id === view.tab)?.label}</span>
              {view.tab === 'detail' && view.ipnBase && (<>
                <span className="crumb-sep">›</span>
                <span className="crumb-now mono" style={{ color: 'var(--accent)' }}>{view.ipnBase}</span>
              </>)}
            </div>

            <div className="search-box" style={{ marginLeft: 'auto' }}>
              <Icon name="search" />
              <input
                placeholder="Search IPN, family, length..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && search) {
                    const match = recs.find(r =>
                      r.ipn_base.toLowerCase().includes(search.toLowerCase()) ||
                      r.color_variants.some(v => v.ipn.toLowerCase().includes(search.toLowerCase()))
                    );
                    if (match) { setView({ tab: 'detail', ipnBase: match.ipn_base }); setSearch(''); }
                  }
                }}
              />
              <kbd>⌘K</kbd>
            </div>

            <div className="fresh-pill" title="Data freshness">
              <span className="pulse-dot" />
              <div className="fresh-grp"><span className="k">comps</span><span className="v">Mar 24</span></div>
              <span className="sep" />
              <div className="fresh-grp"><span className="k">engine</span><span className="v">14:32</span></div>
            </div>
          </div>

          <div className="page">
            {view.tab === 'action'    && <ActionCenterTab recs={recs} setView={setView} applyAction={applyAction} openModal={openModal} actionFilter={actionFilter} setActionFilter={setActionFilter} />}
            {view.tab === 'heatmap'   && <HeatmapTab recs={recs} setView={setView} setActionFilter={setActionFilter} />}
            {view.tab === 'detail'    && <SkuDetailTab recs={recs} ipnBase={view.ipnBase || recs[0].ipn_base} setView={setView} openModal={openModal} applyAction={applyAction} />}
            {view.tab === 'overrides' && <OverridesTab recs={recs} setView={setView} removeOverride={removeOverride} />}
            {view.tab === 'quality'   && <QualityTab recs={recs} setView={setView} />}
            {view.tab === 'kpi'       && <KPITab recs={recs} setView={setView} setActionFilter={setActionFilter} />}
            {view.tab === 'config'    && <ConfigTab config={config} setConfig={setConfig} recs={recs} simulatedRecs={simulatedRecs} simMode={simMode} setSimMode={setSimMode} promoteScenario={promoteScenario} />}
          </div>
        </div>

        {/* Modals */}
        {modal?.kind === 'reject'   && <RejectModal rec={modal.payload.rec} onClose={() => setModal(null)} />}
        {modal?.kind === 'override' && <OverrideModal rec={modal.payload.rec} onClose={() => setModal(null)} onSave={(v, r) => { setOverride(modal.payload.rec.ipn_base, v, r); setModal(null); }} />}
        {modal?.kind === 'bulk-approve' && <BulkApproveModal ids={modal.payload.ids} recs={recs} onClose={() => setModal(null)} onConfirm={(ids) => {
          ids.forEach(id => applyAction(id, 'approve'));
          setModal(null);
        }} />}
      </div>
    </ToastProvider>
  );
}

// ─── Modals ───────────────────────────────────────────────────
function RejectModal({ rec, onClose }) {
  const toast = useToast();
  const [reason, setReason] = useState('bad_comp');
  const [notes, setNotes] = useState('');
  return (
    <Modal
      title="Reject engine recommendation"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { toast.push({ title: `${rec.ipn_base} rejected`, msg: 'Will reappear next refresh if delta still > threshold' }); onClose(); }}>
            Reject
          </button>
        </>
      }
    >
      <div className="modal-row"><span className="k">SKU</span><span className="v">{rec.ipn_base}</span></div>
      <div className="modal-row"><span className="k">Current → recommended</span><span className="v">{fmtMoney(rec.current_msrp)} → {fmtMoney(rec.recommended_msrp)}</span></div>
      <div className="spacer-16" />
      <div className="field">
        <label>Reason</label>
        <div className="radio-grp">
          {[
            { v: 'bad_comp', l: 'Bad competitor match data' },
            { v: 'strategic', l: 'Strategic disagreement' },
            { v: 'leadership', l: 'Await leadership decision' },
            { v: 'other', l: 'Other (specify)' },
          ].map(o => (
            <label key={o.v}>
              <input type="radio" name="reason" checked={reason === o.v} onChange={() => setReason(o.v)} />
              {o.l}
            </label>
          ))}
        </div>
      </div>
      <div className="field">
        <label>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional context — visible in audit log" />
      </div>
    </Modal>
  );
}

function OverrideModal({ rec, onClose, onSave }) {
  const [value, setValue] = useState(rec.recommended_msrp.toFixed(2));
  const [reason, setReason] = useState('strategic');
  const [notes, setNotes] = useState('');
  const v = parseFloat(value) || 0;
  const belowFloor = rec.l1 != null && v < rec.l1;

  return (
    <Modal
      title="Override engine recommendation"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={v <= 0} onClick={() => onSave(v, ({
            strategic: 'Strategic positioning', bad_data: 'Bad competitor match data',
            customer: 'Customer/distributor commitment', other: notes || 'Other'
          })[reason])}>
            Save override
          </button>
        </>
      }
    >
      <div className="modal-row"><span className="k">Current MSRP</span><span className="v">{fmtMoney(rec.current_msrp)}</span></div>
      <div className="modal-row"><span className="k">Engine recommends</span><span className="v">{fmtMoney(rec.recommended_msrp)}</span></div>
      <div className="modal-row"><span className="k">Cost floor (L1)</span><span className="v">{fmtMoney(rec.l1)}</span></div>
      <div className="spacer-16" />
      <div className="field">
        <label>Override value</label>
        <input type="number" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} />
        {belowFloor && <div style={{ color: 'var(--err)', fontSize: 12, fontFamily: 'var(--f-mono)', marginTop: 4 }}>⚠ Below cost floor — will be flagged</div>}
      </div>
      <div className="field">
        <label>Reason (required)</label>
        <div className="radio-grp">
          {[
            { v: 'strategic', l: 'Strategic positioning decision' },
            { v: 'bad_data', l: 'Bad competitor match data' },
            { v: 'customer', l: 'Customer/distributor commitment' },
            { v: 'other', l: 'Other (specify)' },
          ].map(o => (
            <label key={o.v}>
              <input type="radio" name="reason" checked={reason === o.v} onChange={() => setReason(o.v)} />
              {o.l}
            </label>
          ))}
        </div>
      </div>
      <div className="field">
        <label>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional — visible in audit log" />
      </div>
    </Modal>
  );
}

function BulkApproveModal({ ids, recs, onClose, onConfirm }) {
  const selected = recs.filter(r => ids.includes(r.ipn_base));
  const curAvg = selected.reduce((a, r) => a + r.current_msrp, 0) / selected.length;
  const recAvg = selected.reduce((a, r) => a + r.recommended_msrp, 0) / selected.length;
  const gmCur = selected.reduce((a, r) => a + (r.current_msrp - r.cost_basis) / r.current_msrp, 0) / selected.length;
  const gmRec = selected.reduce((a, r) => a + (r.recommended_msrp - r.cost_basis) / r.recommended_msrp, 0) / selected.length;
  const revDelta = selected.reduce((a, r) => a + (r.recommended_msrp - r.current_msrp) * r.inventory_qty * 4, 0);
  const lowCount = selected.filter(r => r.confidence === 'LOW').length;

  return (
    <Modal
      title={`Apply ${ids.length} price changes`}
      onClose={onClose}
      width={520}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onConfirm(ids)} disabled={lowCount > 0}>
            <Icon name="check" /> Approve all {ids.length}
          </button>
        </>
      }
    >
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10.5, color: 'var(--fg-4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Portfolio impact</div>
      <div className="modal-row"><span className="k">Avg MSRP</span><span className="v">{fmtMoney(curAvg)} → <b style={{ color: 'var(--accent)' }}>{fmtMoney(recAvg)}</b> <span style={{ color: 'var(--up)' }}>(+{((recAvg - curAvg) / curAvg * 100).toFixed(1)}%)</span></span></div>
      <div className="modal-row"><span className="k">Avg GM%</span><span className="v">{(gmCur * 100).toFixed(1)}% → <b style={{ color: 'var(--ok)' }}>{(gmRec * 100).toFixed(1)}%</b> <span style={{ color: 'var(--ok)' }}>(+{((gmRec - gmCur) * 100).toFixed(1)}pp)</span></span></div>
      <div className="modal-row"><span className="k">Annual rev impact (proj)</span><span className="v ok">+${(revDelta / 1000).toFixed(0)}K</span></div>
      <div className="spacer-12" />
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10.5, color: 'var(--fg-4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Confidence breakdown</div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 10, fontSize: 13 }}>
        <span><b style={{ color: 'var(--ok)' }}>{selected.filter(r => r.confidence === 'HIGH').length}</b> HIGH</span>
        <span><b style={{ color: 'var(--accent)' }}>{selected.filter(r => r.confidence === 'MEDIUM').length}</b> MEDIUM</span>
        <span><b style={{ color: 'var(--err)' }}>{lowCount}</b> LOW</span>
      </div>
      {lowCount > 0 && (
        <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', padding: 10, borderRadius: 'var(--r-2)', fontSize: 12.5, color: 'var(--fg-2)' }}>
          ⚠ {lowCount} LOW-confidence row{lowCount !== 1 ? 's' : ''} in selection. Approve individually or filter them out.
        </div>
      )}
    </Modal>
  );
}

// ─── Mount ────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
