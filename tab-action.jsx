// ─── Tab 1: Action Center ──────────────────────────────────────

function ActionCenterTab({ recs, setView, applyAction, openModal }) {
  const toast = useToast();

  const [filterAction, setFilterAction] = useState([]);
  const [filterFamily, setFilterFamily] = useState([]);
  const [filterConf, setFilterConf] = useState([]);
  const [filterFlags, setFilterFlags] = useState(false);
  const [minDelta, setMinDelta] = useState(0);
  const [expanded, setExpanded] = useState(new Set());
  const [selected, setSelected] = useState(new Set());
  const [sortKey, setSortKey] = useState('absDelta');
  const [sortDir, setSortDir] = useState('desc');
  const [search, setSearch] = useState('');

  // Default to only actionable rows
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    let rows = recs;
    if (!showAll) {
      rows = rows.filter(r => ['GAP_UP', 'GAP_DOWN', 'REVIEW_TARIFF_EVENT', 'REVIEW_MARKET_SHIFT', 'REVIEW_PRICE_SHOCK'].includes(r.action_code));
    }
    if (filterAction.length) rows = rows.filter(r => filterAction.includes(r.action_code));
    if (filterFamily.length) rows = rows.filter(r => filterFamily.includes(r.family));
    if (filterConf.length) rows = rows.filter(r => filterConf.includes(r.confidence));
    if (filterFlags) rows = rows.filter(r => r.flags.length > 0);
    if (minDelta > 0) rows = rows.filter(r => Math.abs(r.delta_pct) * 100 >= minDelta);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(r => r.ipn_base.toLowerCase().includes(q) || r.family.toLowerCase().includes(q));
    }
    return rows;
  }, [recs, showAll, filterAction, filterFamily, filterConf, filterFlags, minDelta, search]);

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      let av, bv;
      switch (sortKey) {
        case 'ipn':      av = a.ipn_base; bv = b.ipn_base; break;
        case 'family':   av = a.family; bv = b.family; break;
        case 'length':   av = a.length_ft; bv = b.length_ft; break;
        case 'current':  av = a.current_msrp; bv = b.current_msrp; break;
        case 'rec':      av = a.recommended_msrp; bv = b.recommended_msrp; break;
        case 'delta':    av = a.delta_pct; bv = b.delta_pct; break;
        case 'absDelta': av = Math.abs(a.delta_pct); bv = Math.abs(b.delta_pct); break;
        default: av = a.ipn_base; bv = b.ipn_base;
      }
      if (typeof av === 'string') return av.localeCompare(bv) * dir;
      return ((av || 0) - (bv || 0)) * dir;
    });
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key) {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }
  function arrow(key) { return sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : null; }

  function toggleExpand(id) {
    setExpanded(e => {
      const n = new Set(e);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  function toggleSelect(id) {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  function selectAll() {
    if (selected.size === sorted.length) setSelected(new Set());
    else setSelected(new Set(sorted.map(r => r.ipn_base)));
  }

  function approveRow(rec) {
    applyAction(rec.ipn_base, 'approve');
    toast.push({ title: `${rec.ipn_base} set to ${fmtMoney(rec.recommended_msrp)}`, msg: `Applied across ${rec.color_variant_count} color variants` });
  }
  function deferRow(rec) {
    applyAction(rec.ipn_base, 'defer');
    toast.push({ title: `${rec.ipn_base} deferred`, msg: 'Hidden until next refresh cycle' });
  }

  function bulkApprove() {
    const ids = [...selected];
    openModal('bulk-approve', { ids });
  }

  const familyOptions = useMemo(() => [...new Set(recs.map(r => r.family))].map(f => ({ value: f, label: f, count: recs.filter(r => r.family === f).length })), [recs]);
  const actionOptions = ['GAP_UP', 'GAP_DOWN', 'HOLD', 'HOLD_NO_STOCK', 'MANUAL_OVERRIDE'].map(a => ({ value: a, label: a }));
  const confOptions = ['HIGH', 'MEDIUM', 'LOW', 'N/A'].map(c => ({ value: c, label: c }));

  const allSelected = selected.size > 0 && selected.size === sorted.length;

  return (
    <div className="page-inner">
      <div className="page-head">
        <div>
          <h1 className="page-title">Action Center</h1>
          <div className="page-sub">Engine recommendations sorted by impact. Approve safe changes inline, expand rows for the four-layer breakdown.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost"><Icon name="download" /> Export xlsx</button>
        </div>
      </div>

      <div className="filter-bar">
        <span className="label-mono">View</span>
        <Seg
          value={showAll ? 'all' : 'actions'}
          onChange={(v) => setShowAll(v === 'all')}
          options={[{ value: 'actions', label: 'Actions only' }, { value: 'all', label: 'All SKUs' }]}
        />
        <span className="sep" />
        <span className="label-mono">Filter</span>
        <Select label="Action" multi value={filterAction} onChange={setFilterAction} options={actionOptions} />
        <Select label="Family" multi value={filterFamily} onChange={setFilterFamily} options={familyOptions} />
        <Select label="Conf" multi value={filterConf} onChange={setFilterConf} options={confOptions} />
        <Select label="|Δ%| >" value={minDelta || ''} onChange={(v) => setMinDelta(v || 0)} options={[{value: 5, label: '5%'}, {value:10, label:'10%'}, {value:20, label:'20%'}]} />
        <button className={`select-btn ${filterFlags ? 'has-val' : ''}`} onClick={() => setFilterFlags(!filterFlags)}>
          <Cb on={filterFlags} onChange={setFilterFlags} />
          <span>Has flags</span>
        </button>
        <span className="grow" />
        <span className="summary">
          Showing <strong>{sorted.length}</strong> of <strong>{recs.length}</strong>
          {selected.size > 0 && <> · Selected <strong style={{ color: 'var(--accent)' }}>{selected.size}</strong></>}
        </span>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th className="tbl-checkbox"><Cb on={allSelected} onChange={selectAll} /></th>
              <th style={{ width: 30 }}></th>
              <th className="sortable" onClick={() => toggleSort('ipn')}>IPN <span className="sort-arrow">{arrow('ipn')}</span></th>
              <th className="sortable" onClick={() => toggleSort('family')}>Family <span className="sort-arrow">{arrow('family')}</span></th>
              <th className="numeric sortable" onClick={() => toggleSort('length')}>Len <span className="sort-arrow">{arrow('length')}</span></th>
              <th className="numeric sortable" onClick={() => toggleSort('current')}>Current <span className="sort-arrow">{arrow('current')}</span></th>
              <th className="numeric sortable" onClick={() => toggleSort('rec')}>Recommended <span className="sort-arrow">{arrow('rec')}</span></th>
              <th className="numeric sortable" onClick={() => toggleSort('absDelta')}>Δ% <span className="sort-arrow">{arrow('absDelta')}</span></th>
              <th>Conf</th>
              <th>Action</th>
              <th>Flags</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => [
                <tr
                  key={r.ipn_base}
                  className={`${selected.has(r.ipn_base) ? 'selected' : ''} ${expanded.has(r.ipn_base) ? 'expanded' : ''}`}
                  onClick={() => toggleExpand(r.ipn_base)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="tbl-checkbox" onClick={(e) => { e.stopPropagation(); }}>
                    <Cb on={selected.has(r.ipn_base)} onChange={() => toggleSelect(r.ipn_base)} />
                  </td>
                  <td onClick={(e) => { e.stopPropagation(); toggleExpand(r.ipn_base); }}>
                    <span className={`row-expand-btn ${expanded.has(r.ipn_base) ? 'open' : ''}`}><Icon name="chevR" /></span>
                  </td>
                  <td>
                    <span className="ipn">{r.ipn_base}</span>
                  </td>
                  <td><span className="family">{r.family}</span></td>
                  <td className="numeric">{r.length_ft}ft</td>
                  <td className="numeric" style={{ color: 'var(--fg-3)' }}>{fmtMoney(r.current_msrp)}</td>
                  <td className="numeric"><strong style={{ color: 'var(--fg)' }}>{fmtMoney(r.recommended_msrp)}</strong></td>
                  <td className="numeric"><Delta value={r.delta_pct} /></td>
                  <td><ConfBadge level={r.confidence} /></td>
                  <td><ActionBadge code={r.action_code} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {r.flags.slice(0, 3).map(f => <FlagChip key={f} flag={f} />)}
                      {r.flags.length > 3 && <span className="flag-chip flag-gray">+{r.flags.length - 3}</span>}
                    </div>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button className="btn btn-flat btn-icon" onClick={() => setView({ tab: 'detail', ipnBase: r.ipn_base })} title="Open SKU detail">
                      <Icon name="external" />
                    </button>
                  </td>
                </tr>,

                expanded.has(r.ipn_base) && (
                  <tr className="expansion" key={r.ipn_base + '-exp'}>
                    <td colSpan={12} style={{ padding: 0 }}>
                      <ExpansionPane rec={r} setView={setView} approveRow={approveRow} deferRow={deferRow} openModal={openModal} />
                    </td>
                  </tr>
                )
            ])}
            {sorted.length === 0 && (
              <tr><td colSpan={12}>
                <div className="empty">
                  <div className="ic">∅</div>
                  <h4>No rows match these filters</h4>
                  <p>Adjust filters or switch to "All SKUs" to widen the view.</p>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected.size > 0 && (
        <div className="selection-bar">
          <span className="count">{selected.size} selected</span>
          <span style={{ color: 'var(--fg-3)', fontSize: 12.5 }}>· avg Δ {fmtPct(sorted.filter(r => selected.has(r.ipn_base)).reduce((a, r) => a + r.delta_pct, 0) / selected.size, 1)}</span>
          <span className="grow" />
          <button className="btn btn-flat" onClick={() => setSelected(new Set())}>Cancel</button>
          <button className="btn btn-ghost"><Icon name="kbd" /> Defer</button>
          <button className="btn btn-ghost">Reject</button>
          <button className="btn btn-primary" onClick={bulkApprove}><Icon name="check" /> Approve selected</button>
        </div>
      )}
    </div>
  );
}

// ─── Expansion pane (layer breakdown + comps) ───────────────────
function ExpansionPane({ rec, setView, approveRow, deferRow, openModal }) {
  const curveData = useMemo(() => CK.curvePoints(rec), [rec]);
  const compsAvailable = [
    { key: 'mp', label: 'Monoprice',     domain: 'monoprice.com',     cls: 'mp', val: rec.mp_price, scraped: 'Mar 22' },
    { key: 'fs', label: 'FS.com',        domain: 'fs.com',            cls: 'fs', val: rec.fs_price, scraped: 'Mar 22' },
    { key: 'cw', label: 'Cable Wholesale', domain: 'cablewholesale.com', cls: 'cw', val: rec.cw_price, scraped: 'Mar 24' },
  ].filter(c => c.val != null);

  return (
    <div className="expansion-inner">
      <div className="exp-col">
        <h5>Layer breakdown <span className="grow" /></h5>
        <div className="layer-list">
          <div className="layer-row">
            <span className="lay-key">L1</span>
            <span className="lay-name">Cost Floor <span className="sub">×{(1.30).toFixed(2)} margin</span></span>
            <span className="lay-val">{fmtMoney(rec.l1)}</span>
          </div>
          <div className="layer-row">
            <span className="lay-key">L2</span>
            <span className="lay-name">Competitive Median <span className="sub">{rec.confidence}, n={rec.l2_n}</span></span>
            <span className="lay-val">{fmtMoney(rec.l2)}</span>
          </div>
          <div className="layer-row">
            <span className="lay-key">L3</span>
            <span className="lay-name">Family Curve <span className="sub">predicted @ {rec.length_ft}ft</span></span>
            <span className="lay-val">{fmtMoney(rec.l3)}</span>
          </div>
          <div className="layer-row">
            <span className="lay-key">L4</span>
            <span className="lay-name">Velocity · Posture <span className="sub">{rec.velocity_tier} · {rec.posture}</span></span>
            <span className="lay-val">{fmtMoney(rec.l4)}</span>
          </div>
          <div className="layer-row composite">
            <span className="lay-key">∑</span>
            <span className="lay-name">Composite <span className="sub">max(L1, weighted L2/L3/L4)</span></span>
            <span className="lay-val">{fmtMoney(rec.recommended_msrp)}</span>
          </div>
        </div>
        <div className="eq-line">
          0.55 · <b>{fmtMoney(rec.l2)}</b> + 0.30 · <b>{fmtMoney(rec.l3)}</b> + 0.15 · <b>{fmtMoney(rec.l4)}</b> = <b>{fmtMoney(rec.composite)}</b>
        </div>

        <h5 style={{ marginTop: 20 }}>Family power-law curve <span className="grow" /></h5>
        <FamilyCurveChart curve={curveData.curve} points={curveData.points} height={180} />
      </div>

      <div className="exp-col">
        <h5>Competitor comps <span className="grow" /> <span style={{ color: 'var(--fg-4)', fontFamily: 'var(--f-mono)', fontSize: 10.5 }}>scraped Mar 22–24</span></h5>
        {compsAvailable.length === 0 ? (
          <div className="empty" style={{ padding: 24 }}>
            <h4>No competitor coverage</h4>
            <p>L2 skipped. Composite reweights to L3 + L4.</p>
          </div>
        ) : (
          <div>
            {compsAvailable.map(c => (
              <div className="comp-row" key={c.key}>
                <span className={`comp-mark ${c.cls}`}>{c.label.slice(0, 2).toUpperCase()}</span>
                <span className="comp-name">{c.label} <span className="scraped">{c.domain}</span></span>
                <span className="comp-price">{fmtMoney(c.val)}</span>
                <a className="comp-link" href="#" onClick={(e) => e.preventDefault()} title={`Open ${c.domain}`}>
                  <Icon name="external" />
                </a>
              </div>
            ))}
          </div>
        )}

        <h5 style={{ marginTop: 20 }}>Comp position <span className="grow" /></h5>
        <CompPositionBar rec={rec} />

        <div className="exp-action-row">
          <button className="btn btn-ok" onClick={() => approveRow(rec)}><Icon name="check" /> Approve {fmtMoney(rec.recommended_msrp)}</button>
          <button className="btn btn-ghost" onClick={() => openModal('reject', { rec })}>Reject</button>
          <button className="btn btn-ghost" onClick={() => deferRow(rec)}>Defer</button>
          <button className="btn btn-ghost" onClick={() => openModal('override', { rec })}><Icon name="edit" /> Override</button>
          <span style={{ flex: 1 }} />
          <button className="btn btn-flat" onClick={() => setView({ tab: 'detail', ipnBase: rec.ipn_base })}>SKU Detail <Icon name="chevR" /></button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ActionCenterTab });
