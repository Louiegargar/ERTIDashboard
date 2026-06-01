// ─── Chart library — pure SVG, interactive ─────────────────────

// ─── Sparkline ─────────────────────────────────────────────────
function Sparkline({ data, width = 60, height = 22, color = 'var(--accent)', fill = true }) {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const span = (max - min) || 1;
  const dx = width / (data.length - 1);
  const pts = data.map((v, i) => [i * dx, height - ((v - min) / span) * (height - 2) - 1]);
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const dArea = `${d} L ${width} ${height} L 0 ${height} Z`;
  return (
    <svg className="spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {fill && <path d={dArea} className="area" fill={color} />}
      <path d={d} stroke={color} fill="none" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="1.8" fill={color} />
    </svg>
  );
}

// ─── Time series (comp price history) ──────────────────────────
function TimeSeriesChart({ data, series, height = 240, events = [] }) {
  // data: [{ date, [seriesKey]: value }]
  // series: [{ key, label, color }]
  const padL = 40, padR = 60, padT = 14, padB = 28;
  const containerRef = useRef(null);
  const [w, setW] = useState(600);
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      for (const e of entries) setW(Math.max(280, e.contentRect.width));
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const innerW = w - padL - padR;
  const innerH = height - padT - padB;

  const allVals = data.flatMap(d => series.map(s => d[s.key])).filter(v => v != null);
  if (allVals.length === 0) return <div ref={containerRef} className="empty"><h4>No data</h4></div>;

  const yMin = Math.min(...allVals) * 0.9;
  const yMax = Math.max(...allVals) * 1.05;
  const ySpan = yMax - yMin;

  const xs = data.map((_, i) => i);
  const xScale = (i) => padL + (i / Math.max(1, data.length - 1)) * innerW;
  const yScale = (v) => padT + (1 - (v - yMin) / ySpan) * innerH;

  // y-axis ticks (4)
  const yTicks = [];
  for (let i = 0; i <= 4; i++) {
    const v = yMin + (ySpan * i / 4);
    yTicks.push({ v, y: yScale(v) });
  }

  const [hover, setHover] = useState(null);
  function onMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const i = Math.round(((x - padL) / innerW) * (data.length - 1));
    if (i >= 0 && i < data.length) setHover(i);
  }

  return (
    <div ref={containerRef} style={{ width: '100%', position: 'relative' }}>
      <svg className="chart-svg" width={w} height={height} viewBox={`0 0 ${w} ${height}`} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        {/* grid + y-axis */}
        <g className="chart-grid">
          {yTicks.map((t, i) => (
            <line key={i} x1={padL} x2={w - padR} y1={t.y} y2={t.y} />
          ))}
        </g>
        <g className="chart-axis">
          {yTicks.map((t, i) => (
            <text key={i} x={padL - 6} y={t.y + 3} textAnchor="end">${t.v.toFixed(t.v < 10 ? 2 : 1)}</text>
          ))}
          {data.map((d, i) => (
            <text key={i} x={xScale(i)} y={height - padB + 14} textAnchor="middle">
              {d.label}
            </text>
          ))}
        </g>

        {/* events */}
        {events.map((ev, i) => {
          const x = xScale(ev.index);
          return (
            <g key={i}>
              <line className="chart-event-line" x1={x} x2={x} y1={padT} y2={height - padB} />
              <text className="chart-event-label" x={x + 5} y={padT + 10}>{ev.label}</text>
            </g>
          );
        })}

        {/* series */}
        {series.map(s => {
          const pts = data.map((d, i) => ({ x: xScale(i), y: d[s.key] != null ? yScale(d[s.key]) : null, v: d[s.key] }))
                          .filter(p => p.y != null);
          if (pts.length === 0) return null;
          const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
          return (
            <g key={s.key}>
              <path d={path} className="chart-line" stroke={s.color} strokeWidth={s.bold ? 2 : 1.5} strokeDasharray={s.dashed ? '3 3' : '0'} />
              {pts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={hover === i ? 4 : 2.5} fill={s.color} className="chart-dot" />
              ))}
              {/* end label */}
              <text className="chart-label-end" x={pts[pts.length-1].x + 6} y={pts[pts.length-1].y + 3} fill={s.color}>
                {s.label}
              </text>
            </g>
          );
        })}

        {/* hover guide */}
        {hover != null && (
          <g>
            <line x1={xScale(hover)} x2={xScale(hover)} y1={padT} y2={height - padB} stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="2 3" />
          </g>
        )}
      </svg>
      {hover != null && (
        <div style={{
          position: 'absolute',
          top: 8,
          left: xScale(hover) + (xScale(hover) > w/2 ? -180 : 10),
          background: '#0a0b0d',
          border: '1px solid var(--line-strong)',
          padding: '8px 10px',
          borderRadius: 'var(--r-2)',
          fontFamily: 'var(--f-mono)',
          fontSize: 11.5,
          minWidth: 160,
          zIndex: 5,
          pointerEvents: 'none',
        }}>
          <div style={{ color: 'var(--accent)', marginBottom: 4 }}>{data[hover].label}</div>
          {series.map(s => data[hover][s.key] != null && (
            <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ color: s.color }}>{s.label}</span>
              <span>${data[hover][s.key].toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Family power-law curve chart ──────────────────────────────
function FamilyCurveChart({ curve, points, height = 220, logY = true }) {
  const padL = 44, padR = 16, padT = 12, padB = 28;
  const containerRef = useRef(null);
  const [w, setW] = useState(420);
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      for (const e of entries) setW(Math.max(280, e.contentRect.width));
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  if (!curve || curve.length === 0) {
    return <div ref={containerRef} className="empty"><h4>Insufficient family data</h4><p>Need 4+ SKUs in family to fit curve.</p></div>;
  }

  const innerW = w - padL - padR;
  const innerH = height - padT - padB;

  const xs = curve.map(c => c.len);
  const ys = curve.map(c => c.price).concat(points.map(p => p.price));
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.min(...ys) * 0.85, yMax = Math.max(...ys) * 1.05;

  // log scale for x (cables span 0.5 → 100)
  const xScale = (l) => padL + (Math.log(l/xMin) / Math.log(xMax/xMin)) * innerW;
  const yScale = logY
    ? (v) => padT + (1 - Math.log(v/yMin) / Math.log(yMax/yMin)) * innerH
    : (v) => padT + (1 - (v - yMin) / (yMax - yMin)) * innerH;

  const path = curve.map((c, i) => `${i === 0 ? 'M' : 'L'} ${xScale(c.len).toFixed(1)} ${yScale(c.price).toFixed(1)}`).join(' ');

  const xTicks = [1, 5, 10, 25, 50, 100].filter(t => t >= xMin && t <= xMax);
  const yTickCount = 4;
  const yTicks = [];
  for (let i = 0; i <= yTickCount; i++) {
    const r = i / yTickCount;
    const v = logY ? yMin * Math.pow(yMax/yMin, r) : yMin + (yMax - yMin) * r;
    yTicks.push({ v, y: yScale(v) });
  }

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <svg className="chart-svg" width={w} height={height} viewBox={`0 0 ${w} ${height}`}>
        <g className="chart-grid">
          {yTicks.map((t, i) => <line key={i} x1={padL} x2={w - padR} y1={t.y} y2={t.y} />)}
        </g>
        <g className="chart-axis">
          {yTicks.map((t, i) => <text key={i} x={padL - 6} y={t.y + 3} textAnchor="end">${t.v.toFixed(t.v < 10 ? 2 : 1)}</text>)}
          {xTicks.map((t, i) => <text key={i} x={xScale(t)} y={height - padB + 14} textAnchor="middle">{t}ft</text>)}
        </g>
        {/* curve */}
        <path d={path} className="chart-line" stroke="var(--accent)" strokeOpacity="0.7" />
        {/* points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={xScale(p.len)}
            cy={yScale(p.price)}
            r={p.isThis ? 6 : 3}
            fill={p.isThis ? 'var(--accent)' : 'var(--fg-3)'}
            stroke={p.isThis ? 'var(--bg-1)' : 'transparent'}
            strokeWidth="2"
          />
        ))}
        {points.filter(p => p.isThis).map((p, i) => (
          <text key={i} x={xScale(p.len) + 9} y={yScale(p.price) + 3}
                fontFamily="var(--f-mono)" fontSize="10" fill="var(--accent)">
            ${p.price.toFixed(2)} · {p.len}ft
          </text>
        ))}
      </svg>
    </div>
  );
}

// ─── Comp position bar ──────────────────────────────────────────
function CompPositionBar({ rec }) {
  const items = [
    { key: 'mp', label: 'MP', cls: 'mp', val: rec.mp_price },
    { key: 'fs', label: 'FS', cls: 'fs', val: rec.fs_price },
    { key: 'cw', label: 'CW', cls: 'cw', val: rec.cw_price },
    { key: 'ck_cur', label: 'CK', cls: 'ck', val: rec.current_msrp, alt: 'now' },
    { key: 'ck_rec', label: 'REC', cls: 'ck', val: rec.recommended_msrp, alt: 'new' },
  ].filter(it => it.val != null);

  const max = Math.max(...items.map(i => i.val)) * 1.15;

  return (
    <div className="cp-axis">
      {items.map(it => (
        <div className="cp-row" key={it.key}>
          <span className={`comp-mark ${it.cls}`} title={it.label}>{it.label}</span>
          <div className="cp-bar-area">
            <div className="cp-bar-fill" style={{
              width: ((it.val / max) * 100) + '%',
              background: it.cls === 'mp' ? 'var(--info)'
                       : it.cls === 'fs' ? '#c084fc'
                       : it.cls === 'cw' ? 'var(--ok)'
                       : it.alt === 'new' ? 'var(--accent)' : 'rgba(255,184,0,0.4)',
            }} />
          </div>
          <span className="cp-price">${it.val.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Bar chart (vertical / horizontal) ──────────────────────────
function BarChart({ data, height = 200, valueKey = 'value', labelKey = 'label', color = 'var(--accent)', horizontal = false, onBarClick }) {
  const padL = horizontal ? 110 : 30;
  const padR = 16;
  const padT = 10;
  const padB = horizontal ? 26 : 36;
  const containerRef = useRef(null);
  const [w, setW] = useState(420);
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      for (const e of entries) setW(Math.max(280, e.contentRect.width));
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);
  const innerW = w - padL - padR;
  const innerH = height - padT - padB;
  const max = Math.max(...data.map(d => d[valueKey])) || 1;

  if (horizontal) {
    const barH = innerH / data.length;
    return (
      <div ref={containerRef} style={{ width: '100%' }}>
        <svg className="chart-svg" width={w} height={height}>
          {data.map((d, i) => {
            const wPx = (d[valueKey] / max) * innerW;
            const y = padT + i * barH + barH * 0.15;
            const h = barH * 0.7;
            return (
              <g key={i} style={{ cursor: onBarClick ? 'pointer' : 'default' }} onClick={() => onBarClick && onBarClick(d)}>
                <text x={padL - 8} y={y + h/2 + 4} textAnchor="end" fontFamily="var(--f-mono)" fontSize="11" fill="var(--fg-3)">{d[labelKey]}</text>
                <rect x={padL} y={y} width={wPx} height={h} fill={d.color || color} rx="2" />
                <text x={padL + wPx + 6} y={y + h/2 + 4} fontFamily="var(--f-mono)" fontSize="11" fill="var(--fg)">{d[valueKey]}</text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  } else {
    const barW = innerW / data.length;
    return (
      <div ref={containerRef} style={{ width: '100%' }}>
        <svg className="chart-svg" width={w} height={height}>
          {data.map((d, i) => {
            const h = (d[valueKey] / max) * innerH;
            const x = padL + i * barW + barW * 0.18;
            const y = padT + innerH - h;
            const bw = barW * 0.64;
            return (
              <g key={i} style={{ cursor: onBarClick ? 'pointer' : 'default' }} onClick={() => onBarClick && onBarClick(d)}>
                <rect x={x} y={y} width={bw} height={h} fill={d.color || color} rx="2" />
                <text x={x + bw/2} y={y - 4} textAnchor="middle" fontFamily="var(--f-mono)" fontSize="10" fill="var(--fg-2)">{d[valueKey]}</text>
                <text x={x + bw/2} y={height - padB + 14} textAnchor="middle" fontFamily="var(--f-mono)" fontSize="10" fill="var(--fg-4)">{d[labelKey]}</text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }
}

// ─── Donut chart ───────────────────────────────────────────────
function DonutChart({ data, size = 140, thickness = 22, valueKey = 'value', labelKey = 'label' }) {
  const total = data.reduce((s, d) => s + d[valueKey], 0);
  if (total === 0) return null;
  const cx = size / 2, cy = size / 2;
  const r = (size - thickness) / 2;
  let acc = 0;
  const arcs = data.map(d => {
    const start = (acc / total) * Math.PI * 2 - Math.PI / 2;
    acc += d[valueKey];
    const end = (acc / total) * Math.PI * 2 - Math.PI / 2;
    const large = end - start > Math.PI ? 1 : 0;
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end);
    return {
      d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`,
      color: d.color, value: d[valueKey], label: d[labelKey],
    };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {arcs.map((a, i) => (
        <path key={i} d={a.d} stroke={a.color} strokeWidth={thickness} fill="none" strokeLinecap="butt" />
      ))}
      <text x={cx} y={cy + 2} textAnchor="middle" fontFamily="var(--f-mono)" fontSize="18" fontWeight="500" fill="var(--fg)">
        {total}
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontFamily="var(--f-mono)" fontSize="9" fill="var(--fg-4)" letterSpacing="0.06em">
        TOTAL
      </text>
    </svg>
  );
}

// ─── Scatter chart (cost vs MSRP, GM% vs delta, etc.) ───────────
function ScatterChart({ data, xKey, yKey, xLabel, yLabel, height = 260, colorBy }) {
  const padL = 48, padR = 16, padT = 14, padB = 32;
  const containerRef = useRef(null);
  const [w, setW] = useState(420);
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      for (const e of entries) setW(Math.max(280, e.contentRect.width));
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const innerW = w - padL - padR;
  const innerH = height - padT - padB;

  const xs = data.map(d => d[xKey]).filter(v => v != null);
  const ys = data.map(d => d[yKey]).filter(v => v != null);
  if (xs.length === 0) return <div ref={containerRef} className="empty"><h4>No data</h4></div>;

  const xMin = 0; const xMax = Math.max(...xs) * 1.1;
  const yMin = Math.min(0, Math.min(...ys)) * 1.1; const yMax = Math.max(...ys) * 1.1;
  const xSpan = xMax - xMin, ySpan = yMax - yMin || 1;

  const xScale = (v) => padL + ((v - xMin) / xSpan) * innerW;
  const yScale = (v) => padT + (1 - (v - yMin) / ySpan) * innerH;

  const xTicks = 5, yTicks = 4;
  const xTickVals = []; for (let i = 0; i <= xTicks; i++) xTickVals.push(xMin + (xSpan * i / xTicks));
  const yTickVals = []; for (let i = 0; i <= yTicks; i++) yTickVals.push(yMin + (ySpan * i / yTicks));

  const [hover, setHover] = useState(null);

  return (
    <div ref={containerRef} style={{ width: '100%', position: 'relative' }}>
      <svg className="chart-svg" width={w} height={height}>
        <g className="chart-grid">
          {yTickVals.map((v, i) => <line key={i} x1={padL} x2={w - padR} y1={yScale(v)} y2={yScale(v)} />)}
          {xTickVals.map((v, i) => <line key={i} x1={xScale(v)} x2={xScale(v)} y1={padT} y2={padT + innerH} />)}
        </g>
        <g className="chart-axis">
          {yTickVals.map((v, i) => <text key={i} x={padL - 6} y={yScale(v) + 3} textAnchor="end">{yKey.includes('pct') || yKey.includes('delta') ? (v*100).toFixed(0)+'%' : v.toFixed(0)}</text>)}
          {xTickVals.map((v, i) => <text key={i} x={xScale(v)} y={height - padB + 14} textAnchor="middle">{xKey.includes('pct') ? (v*100).toFixed(0)+'%' : '$' + v.toFixed(0)}</text>)}
          <text x={padL + innerW/2} y={height - 6} textAnchor="middle" fill="var(--fg-3)" fontSize="11">{xLabel}</text>
          <text x={12} y={padT + innerH/2} textAnchor="middle" fill="var(--fg-3)" fontSize="11" transform={`rotate(-90 12 ${padT + innerH/2})`}>{yLabel}</text>
        </g>
        {/* Zero line for y when crossing 0 */}
        {yMin < 0 && yMax > 0 && (
          <line x1={padL} x2={w - padR} y1={yScale(0)} y2={yScale(0)} stroke="var(--line-strong)" strokeDasharray="3 3" />
        )}
        {data.map((d, i) => {
          if (d[xKey] == null || d[yKey] == null) return null;
          const color = colorBy ? colorBy(d) : 'var(--accent)';
          return (
            <circle
              key={i}
              cx={xScale(d[xKey])}
              cy={yScale(d[yKey])}
              r={hover === i ? 5 : 3}
              fill={color}
              opacity={hover != null && hover !== i ? 0.3 : 0.8}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: 'pointer', transition: 'r 0.1s, opacity 0.15s' }}
            />
          );
        })}
      </svg>
      {hover != null && (
        <div className="tooltip" style={{
          left: xScale(data[hover][xKey]) + (xScale(data[hover][xKey]) > w/2 ? -10 : 10),
          top: yScale(data[hover][yKey]) + 12,
          transform: xScale(data[hover][xKey]) > w/2 ? 'translateX(-100%)' : '',
          position: 'absolute',
        }}>
          <div className="tt-title">{data[hover].ipn_base}</div>
          <div className="tt-row"><span className="k">{xLabel}</span><span className="v">{xKey.includes('pct') ? fmtPct(data[hover][xKey], 1, false) : fmtMoney(data[hover][xKey])}</span></div>
          <div className="tt-row"><span className="k">{yLabel}</span><span className="v">{yKey.includes('pct') ? fmtPct(data[hover][yKey], 1, false) : fmtMoney(data[hover][yKey])}</span></div>
        </div>
      )}
    </div>
  );
}

// ─── Heatmap (Family × Length) ──────────────────────────────────
function Heatmap({ rows, cols, getCell, metric, colorScale, onCellClick }) {
  // getCell(rowKey, colKey) returns { value, count, items } or null
  const [hover, setHover] = useState(null); // {r, c, x, y}

  function cellColor(v) {
    if (v == null) return 'transparent';
    return colorScale(v);
  }

  return (
    <div>
      <div className="heatmap-wrap">
        <div className="heatmap" style={{
          display: 'grid',
          gridTemplateColumns: `200px repeat(${cols.length}, minmax(70px, 1fr))`,
        }}>
          <div className="hm-corner" />
          {cols.map((c) => (
            <div key={c.key} className="hm-col-head">{c.label}</div>
          ))}
          {rows.map((r) => [
              <div className="hm-row-head" key={r.key + '-head'}>{r.label}</div>,
              ...cols.map((c) => {
                const cell = getCell(r.key, c.key);
                if (!cell) {
                  return <div key={r.key + '-' + c.key} className="hm-cell empty">—</div>;
                }
                return (
                  <div
                    key={r.key + '-' + c.key}
                    className="hm-cell"
                    style={{ background: cellColor(cell.value) }}
                    onClick={() => onCellClick && onCellClick(r, c, cell)}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHover({ r, c, cell, x: rect.left + rect.width/2, y: rect.top });
                    }}
                    onMouseLeave={() => setHover(null)}
                  >
                    <span className="ct">{cell.count}</span>
                    {metric.format(cell.value)}
                  </div>
                );
              })
          ])}
        </div>
        <div className="hm-legend">
          <span className="tick">{metric.legendLow}</span>
          <div className="hm-legend-bar">
            {[-0.5, -0.3, -0.15, -0.05, 0.05, 0.15, 0.3, 0.5].map((v, i) => (
              <div key={i} style={{ background: colorScale(v) }} />
            ))}
          </div>
          <span className="tick">{metric.legendHigh}</span>
          <span style={{ marginLeft: 'auto', color: 'var(--fg-4)' }}>Empty cells: no SKUs</span>
        </div>
      </div>
      {hover && (
        <div className="tooltip" style={{ left: hover.x, top: hover.y - 8, transform: 'translate(-50%, -100%)' }}>
          <div className="tt-title">{hover.r.label} · {hover.c.label}</div>
          <div className="tt-row"><span className="k">SKUs</span><span className="v">{hover.cell.count}</span></div>
          <div className="tt-row"><span className="k">{metric.label}</span><span className="v">{metric.format(hover.cell.value)}</span></div>
          {hover.cell.avgMsrp != null && <div className="tt-row"><span className="k">Avg MSRP</span><span className="v">${hover.cell.avgMsrp.toFixed(2)}</span></div>}
        </div>
      )}
    </div>
  );
}

// ─── Diverging color scale ──────────────────────────────────────
function divergingScale(v) {
  // v in roughly -0.5 to +0.5 (pos_vs_comp_median)
  // negative (underpriced) = red, positive (overpriced) = green, 0 = neutral
  const clamped = Math.max(-0.5, Math.min(0.5, v));
  const t = clamped / 0.5; // -1 to 1
  if (t < 0) {
    // red gradient (-1 → 0)
    const intensity = -t;
    const a = 0.10 + intensity * 0.55;
    return `rgba(248, 113, 113, ${a.toFixed(2)})`;
  } else {
    const intensity = t;
    const a = 0.10 + intensity * 0.55;
    return `rgba(74, 222, 128, ${a.toFixed(2)})`;
  }
}

function deltaScale(v) {
  // Recommendation delta — same shape, but the meaning is "should change" not "is mispriced"
  const clamped = Math.max(-0.3, Math.min(0.3, v));
  const t = clamped / 0.3;
  if (t < 0) return `rgba(96, 165, 250, ${(0.10 + (-t) * 0.55).toFixed(2)})`; // blue = should trim
  return `rgba(248, 113, 113, ${(0.10 + t * 0.55).toFixed(2)})`; // red = should raise
}

function gmScale(v) {
  // GM% — higher better, blue scale
  const clamped = Math.max(0, Math.min(0.7, v));
  const t = clamped / 0.7;
  return `rgba(74, 222, 128, ${(0.05 + t * 0.55).toFixed(2)})`;
}

function coverageScale(v) {
  const clamped = Math.max(0, Math.min(3, v));
  const t = clamped / 3;
  return `rgba(255, 184, 0, ${(0.05 + t * 0.50).toFixed(2)})`;
}

// ─── Expose ─────────────────────────────────────────────────────
Object.assign(window, {
  Sparkline,
  TimeSeriesChart,
  FamilyCurveChart,
  CompPositionBar,
  BarChart,
  DonutChart,
  ScatterChart,
  Heatmap,
  divergingScale,
  deltaScale,
  gmScale,
  coverageScale,
});
