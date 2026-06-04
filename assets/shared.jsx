// shared.jsx — small shared components + helpers (operational integration)

function scoreCls(s) { return s >= 80 ? 's-hi' : s >= 60 ? 's-mid' : 's-lo'; }
function deltaCls(d) { return d > 0 ? 'up' : d < 0 ? 'down' : 'flat'; }
function fmtDelta(d) { return (d > 0 ? '+' : '') + d; }

function Avatar({ p, size }) {
  const cls = 'av' + (size === 'lg' ? ' lg' : size === 'sm' ? ' sm' : '') + (p.activity >= 85 ? ' gold' : '');
  return <div className={cls}>{p.initials}</div>;
}

function SquadTag({ s }) {
  return <span className={'tag ' + (s === 'ETS' ? 'ets' : 'ltx')}>{s}</span>;
}

// Employment-status tag (replaces fabricated flight-risk dot)
function StatusTag({ s }) {
  const prob = s === 'Probationary';
  return <span className="risk-dot" style={prob
    ? { color: 'var(--warn)', background: 'var(--accent-soft)' }
    : { color: 'var(--ok)', background: 'rgba(74,222,128,0.10)' }}>{prob ? 'Probationary' : 'Regular'}</span>;
}

function ScoreChip({ s }) {
  return <span className={'score ' + scoreCls(s)}>{s}</span>;
}

function Delta({ d, suffix }) {
  const c = deltaCls(d);
  return (
    <span className={'delta ' + c}>
      <Icon d={d >= 0 ? ICN.arrowU : ICN.arrowD} size={11} />
      {Math.abs(d)}{suffix || ''}
    </span>
  );
}

function PersonCell({ p, onClick }) {
  return (
    <div className="cell-person" onClick={onClick}>
      <Avatar p={p} sm />
      <div className="col">
        <span className="nm">{p.name}{p.inferred && <span className="tag" style={{ marginLeft: 6, fontSize: 8.5, opacity: 0.8 }}>inf</span>}</span>
        <span className="rl">{p.role}</span>
      </div>
    </div>
  );
}

// horizontal build-type mix bar (real output mix)
const BUILD_COLORS = { 'Testcard': '#60a5fa', 'Faceplate': '#ffb800', 'Perfboard': '#39d3c3', 'Handler/Ins': '#a78bfa', 'Other': '#6b7280' };
function BuildMixBar({ mix, h }) {
  const entries = Object.entries(mix || {});
  const tot = entries.reduce((s, e) => s + e[1], 0) || 1;
  return (
    <div style={{ display: 'flex', height: h || 12, border: '1px solid var(--line)', borderRadius: 3, overflow: 'hidden' }}>
      {entries.length === 0 && <div style={{ flex: 1, background: 'var(--bg)' }}></div>}
      {entries.map(([k, v], i) => <div key={i} title={k + ': ' + v} style={{ width: (v / tot * 100) + '%', background: BUILD_COLORS[k] || '#6b7280' }}></div>)}
    </div>
  );
}

function meterCls(val, target, lowerBetter) {
  const ratio = lowerBetter ? target / val : val / target;
  return ratio >= 1 ? 'ok' : ratio >= 0.9 ? 'warn' : 'err';
}

Object.assign(window, { scoreCls, deltaCls, fmtDelta, Avatar, SquadTag, StatusTag, ScoreChip, Delta, PersonCell, BuildMixBar, BUILD_COLORS, meterCls });
