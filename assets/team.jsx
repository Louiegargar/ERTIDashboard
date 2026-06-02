// team.jsx — sortable / filterable team leaderboard

const { useState: useStateT, useMemo: useMemoT } = React;

const COLS = [
  { key: 'rank', label: '#', sort: false },
  { key: 'name', label: 'Person', sort: true, num: false },
  { key: 'squad', label: 'Squad', sort: true, num: false },
  { key: 'level', label: 'Level', sort: true, num: false },
  { key: 'composite', label: 'Score', sort: true, num: true },
  { key: 'throughput', label: 'Runs', sort: true, num: true },
  { key: 'fpy', label: 'FPY', sort: true, num: true },
  { key: 'utilization', label: 'Util', sort: true, num: true },
  { key: 'goals', label: 'OKR', sort: true, num: true },
  { key: 'delta', label: 'Trend', sort: true, num: true },
  { key: 'risk', label: 'Risk', sort: true, num: false },
];

function Team({ data, onSelect }) {
  const { PEOPLE } = data;
  const [sortKey, setSortKey] = useStateT('composite');
  const [asc, setAsc] = useStateT(false);
  const [squad, setSquad] = useStateT('All');
  const [q, setQ] = useStateT('');

  const riskRank = { high: 3, med: 2, low: 1 };

  const rows = useMemoT(() => {
    let r = PEOPLE.filter(p => (squad === 'All' || p.squad === squad)
      && (q === '' || p.name.toLowerCase().includes(q.toLowerCase()) || p.role.toLowerCase().includes(q.toLowerCase())));
    r.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (sortKey === 'name') { av = a.name; bv = b.name; return asc ? av.localeCompare(bv) : bv.localeCompare(av); }
      if (sortKey === 'squad') { return asc ? a.squad.localeCompare(b.squad) : b.squad.localeCompare(a.squad); }
      if (sortKey === 'level') { av = +a.level.slice(1); bv = +b.level.slice(1); }
      if (sortKey === 'risk') { av = riskRank[a.risk]; bv = riskRank[b.risk]; }
      return asc ? av - bv : bv - av;
    });
    return r;
  }, [PEOPLE, sortKey, asc, squad, q]);

  const setSort = k => {
    if (k === sortKey) setAsc(!asc);
    else { setSortKey(k); setAsc(k === 'name' || k === 'risk' ? true : false); }
  };

  const squads = ['All', 'ETS', 'LTX'];
  const avg = (key) => Math.round(rows.reduce((s, p) => s + p[key], 0) / (rows.length || 1));

  return (
    <div className="view-inner">
      {/* controls */}
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

      {/* summary band */}
      <div className="grid g-4">
        <div className="kpi"><span className="kpi-label">Showing</span><div className="kpi-val">{rows.length}</div><span className="muted-s">of {PEOPLE.length} people</span></div>
        <div className="kpi"><span className="kpi-label">Avg Score</span><div className="kpi-val">{avg('composite')}</div><div className="meter"><div className="f ok" style={{ width: avg('composite') + '%' }}></div></div></div>
        <div className="kpi"><span className="kpi-label">Avg FPY</span><div className="kpi-val">{avg('fpy')}%</div><span className="muted-s">first-pass yield</span></div>
        <div className="kpi"><span className="kpi-label">Avg OKR</span><div className="kpi-val">{avg('goals')}%</div><span className="muted-s">completion</span></div>
      </div>

      {/* table */}
      <div className="card fade">
        <div className="card-head">
          <h3><Icon d={ICN.trophy} /> Team Leaderboard</h3>
          <span className="sub">click a row to open scorecard · click a header to sort</span>
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
                  <td><span className={'rank' + (i === 0 && !asc && sortKey === 'composite' ? ' top' : '')}>{i + 1}</span></td>
                  <td><PersonCell p={p} /></td>
                  <td><SquadTag s={p.squad} /></td>
                  <td><span className="tag lvl">{p.level}</span></td>
                  <td className="num"><ScoreChip s={p.composite} /></td>
                  <td className="num">{p.throughput}</td>
                  <td className="num">{p.fpy}%</td>
                  <td className="num">{p.utilization}%</td>
                  <td className="num">{p.goals}%</td>
                  <td className="num"><Delta d={p.delta} /></td>
                  <td><RiskDot r={p.risk} /></td>
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
