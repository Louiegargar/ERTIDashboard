// shared.jsx — small shared components + helpers

function scoreCls(s) { return s >= 85 ? 's-hi' : s >= 75 ? 's-mid' : 's-lo'; }
function deltaCls(d) { return d > 0 ? 'up' : d < 0 ? 'down' : 'flat'; }
function fmtDelta(d) { return (d > 0 ? '+' : '') + d; }

function Avatar({ p, size }) {
  const cls = 'av' + (size === 'lg' ? ' lg' : size === 'sm' ? ' sm' : '') + (p.composite >= 90 ? ' gold' : '');
  return <div className={cls}>{p.initials}</div>;
}

function SquadTag({ s }) {
  return <span className={'tag ' + (s === 'ETS' ? 'ets' : 'ltx')}>{s}</span>;
}

function RiskDot({ r }) {
  const label = { low: 'Low', med: 'Watch', high: 'High' }[r];
  return <span className={'risk-dot ' + r}>{label}</span>;
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

// Person mini-cell for tables/lists
function PersonCell({ p, onClick }) {
  return (
    <div className="cell-person" onClick={onClick}>
      <Avatar p={p} sm />
      <div className="col">
        <span className="nm">{p.name}</span>
        <span className="rl">{p.role}</span>
      </div>
    </div>
  );
}

// Target-meter helper: returns fill class based on pct of target
function meterCls(val, target, lowerBetter) {
  const ratio = lowerBetter ? target / val : val / target;
  return ratio >= 1 ? 'ok' : ratio >= 0.9 ? 'warn' : 'err';
}

Object.assign(window, { scoreCls, deltaCls, fmtDelta, Avatar, SquadTag, RiskDot, ScoreChip, Delta, PersonCell, meterCls });
