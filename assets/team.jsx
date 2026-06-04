// team.jsx — sortable / filterable team leaderboard (operational metrics)

const { useState: useStateT, useMemo: useMemoT } = React;

const COLS = [
  { key: 'rank', label: '#', sort: false },
  { key: 'name', label: 'Person', sort: true },
  { key: 'squad', label: 'Squad', sort: true },
  { key: 'level', label: 'Level', sort: true },
  { key: 'activity', label: 'Activity', sort: true, num: true },
  { key: 'outputs', label: 'Outputs', sort: true, num: true },
  { key: 'releasePct', label: 'Rel %', sort: true, num: true },
  { key: 'shiftLoad', label: 'Shift %', sort: true, num: true },
  { key: 'buildTypes', label: 'Builds', sort: true, num: true },
  { key: 'delta', label: 'Trend', sort: true, num: true },
  { key: 'status', label: 'Status', sort: true },
];

function Team({ data, onSelect }) {
  const { PEOPLE } = data;
  const [sortKey, setSortKey] = useStateT('outputs');
  const [asc, setAsc] = useStateT(false);
  const [squad, setSquad] = useStateT('All');
  const [q, setQ] = useStateT('');

  const rows = useMemoT(() => {
    let r = PEOPLE.filter(p => (squad === 'All' || p.squad === squad)
      && (q === '' || p.name.toLowerCase().includes(q.toLowerCase()) || p.role.toLowerCase().includes(q.toLowerCase())));
    r.sort((a, b) => {
      if (sortKey === 'name') return asc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      if (sortKey === 'squad') return asc ? a.squad.localeCompare(b.squad) : b.squad.localeCompare(a.squad);
      if (sortKey === 'status') return asc ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
      let av = a[sortKey], bv = b[sortKey];
      if (sortKey === 'level') { av = +a.level.slice(1); bv = +b.level.slice(1); }
      return asc ? av - bv : bv - av;
    });
    return r;
  }, [PEOPLE, sortKey, asc, squad, q]);

  const setSort = k => { if (k === sortKey) setAsc(!asc); else { setSortKey(k); setAsc(k === 'name' || k === 'status' ? true : false); } };
  const squads = ['All', 'ETS', 'LTX'];
  const avg = (key) => Math.round(rows.reduce((s, p) => s + p[key], 0) / (rows.length || 1));

  return (
    <div className="view-inner">
      <div className="callout" style={{ marginBottom: 4 }}>
        <strong>Ordered by attributed debug output</strong>, not a performance ranking. Activity Index blends real output volume, release rate, and shift load. Output is from a sample; <em>inf</em> marks inferred owner→roster joins.
      </div>

      <div className="row between wrap gap-12">
        <div className="filters">
          {squads.map(s => (
            <button key={s} className={'fchip' + (squad === s ? ' active' : '')} onClick={() => setSquad(s)}>
              {s === 'All' ? 'All squads' : s} {s !== 'All' && <span style={{ opacity: 0.6 }}>· {PEOPLE.filter(p => p.squad === s).length}</span>}
            </button>
          ))}
        </div>
        <div className="search-in">
          <Icon d={ICN.search} />
          <input placeholder="Search people…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>

      <div className="grid g-4">
        <div className="kpi"><span className="kpi-label">Showing</span><div className="kpi-val">{rows.length}</div><span className="muted-s">of {PEOPLE.length} people</span></div>
        <div className="kpi"><span className="kpi-label">Avg Activity</span><div className="kpi-val">{avg('activity')}</div><div className="meter"><div className="f ok" style={{ width: avg('activity') + '%' }}></div></div></div>
        <div className="kpi"><span className="kpi-label">Avg Release</span><div className="kpi-val">{avg('releasePct')}%</div><span className="muted-s">of attributed output</span></div>
        <div className="kpi"><span className="kpi-label">Avg Shift Load</span><div className="kpi-val">{avg('shiftLoad')}%</div><span className="muted-s">14-day window</span></div>
      </div>

      <div className="card fade">
        <div className="card-head">
          <h3><Icon d={ICN.trophy} /> Team Leaderboard</h3>
          <span className="sub">click a row for scorecard · click a header to sort</span>
        </div>
        <div className="card-body" style={{ padding: '6px 4px 4px', overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                {COLS.map(c => (
                  <th key={c.key} className={(c.num ? 'num ' : '') + (sortKey === c.key ? 'sorted' : '')}
                      onClick={() => c.sort && setSort(c.key)} style={{ cursor: c.sort ? 'pointer' : 'default' }}>
                    {c.label}{c.sort && <span className="ar">{sortKey === c.key ? (asc ? '↑' : '↓') : '↕'}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((p, i) => (
                <tr key={p.id} onClick={() => onSelect(p)}>
                  <td><span className={'rank' + (i === 0 && !asc && sortKey === 'outputs' ? ' top' : '')}>{i + 1}</span></td>
                  <td><PersonCell p={p} /></td>
                  <td><SquadTag s={p.squad} /></td>
                  <td><span className="tag lvl">{p.level}</span></td>
                  <td className="num"><ScoreChip s={p.activity} /></td>
                  <td className="num">{p.outputs}</td>
                  <td className="num">{p.outputs ? p.releasePct + '%' : '—'}</td>
                  <td className="num">{p.shiftLoad}%</td>
                  <td className="num">{p.buildTypes}</td>
                  <td className="num"><Delta d={p.delta} /></td>
                  <td><StatusTag s={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div className="empty">No people match your filters</div>}
        </div>
      </div>
    </div>
  );
}

window.Team = Team;
