// charts.jsx — reusable SVG chart primitives
const { useState: useStateC } = React;

// ── Sparkline (tiny inline trend) ──
function Sparkline({ data, w = 80, h = 24, color = 'var(--accent)', fill = false }) {
  const min = Math.min(...data), max = Math.max(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - min) / rng) * (h - 4) - 2]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${d} L${w} ${h} L0 ${h} Z`;
  return (
    <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
      {fill && <path d={area} fill={color} opacity="0.1" />}
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2" fill={color} />
    </svg>
  );
}

// ── Area trend with target line + hover tooltips ──
function AreaTrend({ data, labels, target, fmt, color = 'var(--accent)', h = 180 }) {
  const [hi, setHi] = useStateC(null);
  const w = 560, padL = 4, padR = 4, padT = 14, padB = 24;
  const iw = w - padL - padR, ih = h - padT - padB;
  const all = target != null ? [...data, target] : data;
  let min = Math.min(...all), max = Math.max(...all);
  const span = (max - min) || 1; min -= span * 0.12; max += span * 0.12;
  const rng = max - min || 1;
  const x = i => padL + (i / (data.length - 1)) * iw;
  const y = v => padT + ih - ((v - min) / rng) * ih;
  const line = data.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const area = `${line} L${x(data.length - 1)} ${padT + ih} L${padL} ${padT + ih} Z`;
  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: 'block', overflow: 'visible' }}
           onMouseLeave={() => setHi(null)}>
        <defs>
          <linearGradient id="at-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* gridlines */}
        {[0, 0.5, 1].map(t => (
          <line key={t} x1={padL} x2={w - padR} y1={padT + ih * t} y2={padT + ih * t}
                stroke="var(--line)" strokeWidth="1" strokeDasharray={t === 1 ? '0' : '3 4'} opacity={t === 1 ? 1 : 0.6} />
        ))}
        {/* target */}
        {target != null && (
          <g>
            <line x1={padL} x2={w - padR} y1={y(target)} y2={y(target)} stroke="var(--accent)" strokeWidth="1" strokeDasharray="4 3" opacity="0.55" />
            <text x={w - padR} y={y(target) - 5} textAnchor="end" fontFamily="var(--f-mono)" fontSize="9.5" fill="var(--accent)" opacity="0.8">target {fmt ? fmt(target) : target}</text>
          </g>
        )}
        <path d={area} fill="url(#at-grad)" />
        <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((v, i) => (
          <g key={i}>
            {hi === i && <line x1={x(i)} x2={x(i)} y1={padT} y2={padT + ih} stroke="var(--line-strong)" strokeWidth="1" />}
            <circle cx={x(i)} cy={y(v)} r={hi === i ? 4 : 2.5} fill={hi === i ? color : 'var(--bg-1)'} stroke={color} strokeWidth="1.6" />
            <text x={x(i)} y={h - 7} textAnchor="middle" fontFamily="var(--f-mono)" fontSize="9.5" fill="var(--fg-4)">{labels[i]}</text>
            <rect x={x(i) - iw / data.length / 2} y={padT} width={iw / data.length} height={ih} fill="transparent"
                  onMouseEnter={() => setHi(i)} style={{ cursor: 'crosshair' }} />
          </g>
        ))}
      </svg>
      {hi != null && (
        <div style={{ position: 'absolute', left: `${(x(hi) / w) * 100}%`, top: -2, transform: 'translateX(-50%)',
          background: 'var(--bg-3)', border: '1px solid var(--line-strong)', borderRadius: 'var(--r-2)',
          padding: '5px 9px', fontSize: 12, pointerEvents: 'none', whiteSpace: 'nowrap', boxShadow: 'var(--shadow-2)' }}>
          <span style={{ fontFamily: 'var(--f-mono)', color: 'var(--fg-4)', fontSize: 10 }}>{labels[hi]} · </span>
          <span style={{ fontFamily: 'var(--f-mono)', color: 'var(--fg)', fontWeight: 500 }}>{fmt ? fmt(data[hi]) : data[hi]}</span>
        </div>
      )}
    </div>
  );
}

// ── Radar (skills) ──
function Radar({ axes, values, max = 4, size = 240, color = 'var(--accent)' }) {
  const c = size / 2, r = size / 2 - 38, n = axes.length;
  const ang = i => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i, v) => [c + Math.cos(ang(i)) * r * (v / max), c + Math.sin(ang(i)) * r * (v / max)];
  const poly = values.map((v, i) => pt(i, v).join(',')).join(' ');
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ overflow: 'visible' }}>
      {[1, 2, 3, 4].map(ring => (
        <polygon key={ring} points={axes.map((_, i) => pt(i, ring).join(',')).join(' ')}
                 fill="none" stroke="var(--line)" strokeWidth="1" opacity={0.7} />
      ))}
      {axes.map((_, i) => {
        const [ex, ey] = pt(i, max);
        return <line key={i} x1={c} y1={c} x2={ex} y2={ey} stroke="var(--line)" strokeWidth="1" opacity={0.6} />;
      })}
      <polygon points={poly} fill={color} fillOpacity="0.16" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      {values.map((v, i) => { const [px, py] = pt(i, v); return <circle key={i} cx={px} cy={py} r="3" fill={color} />; })}
      {axes.map((ax, i) => {
        const [lx, ly] = pt(i, max + 0.62);
        const anchor = Math.abs(lx - c) < 8 ? 'middle' : lx > c ? 'start' : 'end';
        return <text key={i} x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle"
                     fontFamily="var(--f-mono)" fontSize="9.5" fill="var(--fg-3)">{ax}</text>;
      })}
    </svg>
  );
}

// ── Ring gauge (single value vs 100) ──
function Ring({ value, max = 100, size = 92, label, color = 'var(--accent)', sub }) {
  const sw = 7, r = (size - sw) / 2, c = size / 2, circ = 2 * Math.PI * r;
  const off = circ * (1 - Math.min(value, max) / max);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--bg-3)" strokeWidth={sw} />
        <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={off} style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: size > 80 ? 20 : 16, fontWeight: 500, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{label != null ? label : value}</div>
          {sub && <div style={{ fontFamily: 'var(--f-mono)', fontSize: 8.5, color: 'var(--fg-4)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Sparkline, AreaTrend, Radar, Ring });
