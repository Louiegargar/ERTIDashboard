// ─── Shared UI primitives ──────────────────────────────────────
const { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext, Fragment } = React;

// ─── Icons ─────────────────────────────────────────────────────
const ICONS = {
  search: <path d="M11 11l3 3M5 8a6 6 0 1112 0 6 6 0 01-12 0z" />,
  chevR: <path d="M5 3l6 5-6 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
  chevD: <path d="M3 5l5 6 5-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
  chevL: <path d="M11 3L5 8l6 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
  check: <path d="M3 8l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
  close: <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />,
  external: <path d="M6 3h7v7M13 3L6 10M11 8v5H3V5h5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />,
  arrowUp: <path d="M8 12V4M4 8l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
  arrowDown: <path d="M8 4v8M4 8l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
  download: <path d="M8 2v9M4 8l4 3 4-3M2 13h12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
  refresh: <path d="M13 4v4h-4M3 12v-4h4M3 8a5 5 0 019-3M13 8a5 5 0 01-9 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
  filter: <path d="M2 3h12l-5 6v4l-2 1V9L2 3z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />,
  flag: <path d="M3 13V3l8 2-2 3 2 3-8 2z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />,
  layers: <path d="M8 2l6 3-6 3-6-3 6-3zM2 8l6 3 6-3M2 11l6 3 6-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />,
  bars:   <path d="M3 13v-4M7 13V5M11 13v-7M13 13V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />,
  grid:   <path d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z" fill="none" stroke="currentColor" strokeWidth="1.3" />,
  list:   <path d="M5 4h9M5 8h9M5 12h9M2 4h.5M2 8h.5M2 12h.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />,
  cube:   <path d="M8 2l6 3v6l-6 3-6-3V5l6-3zM2 5l6 3 6-3M8 8v7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />,
  shield: <path d="M8 2l5 2v4c0 3-2 5-5 6-3-1-5-3-5-6V4l5-2z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />,
  warn:   <path d="M8 2L1 14h14L8 2zM8 6v4M8 12v.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />,
  spark:  <path d="M2 11l3-3 2 2 4-5 3 2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
  gear:   <path d="M8 5.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.5 3.5L4.5 4.5M11.5 11.5L12.5 12.5M3.5 12.5L4.5 11.5M11.5 4.5L12.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />,
  edit:   <path d="M11 2l3 3-8 8H3v-3l8-8z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />,
  kbd:    <path d="M2 4h12v8H2zM4 7h.5M6 7h.5M8 7h.5M10 7h.5M12 7h.5M4 10h8" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />,
};
function Icon({ name, ...rest }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" {...rest}>
      {ICONS[name]}
    </svg>
  );
}

// ─── Formatters ────────────────────────────────────────────────
const fmtMoney = (v, decimals = 2) => {
  if (v == null || isNaN(v)) return '—';
  return '$' + Number(v).toFixed(decimals);
};
const fmtPct = (v, decimals = 1, signed = true) => {
  if (v == null || isNaN(v)) return '—';
  const sign = signed && v > 0 ? '+' : '';
  return sign + (v * 100).toFixed(decimals) + '%';
};
const fmtInt = (v) => v == null ? '—' : v.toLocaleString();
const fmtDate = (d) => {
  if (!d) return '—';
  const dt = typeof d === 'string' ? new Date(d) : d;
  const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${m[dt.getMonth()]} ${dt.getDate()}`;
};

// ─── Badges ────────────────────────────────────────────────────
function ActionBadge({ code }) {
  const cls = {
    'GAP_UP':            'badge badge-up',
    'GAP_DOWN':          'badge badge-down',
    'HOLD':              'badge badge-hold',
    'HOLD_NO_STOCK':     'badge badge-nostock',
    'MANUAL_OVERRIDE':   'badge badge-manual',
    'REVIEW_TARIFF_EVENT':'badge badge-review',
    'REVIEW_MARKET_SHIFT':'badge badge-review',
    'REVIEW_PRICE_SHOCK':'badge badge-review',
  }[code] || 'badge badge-manual';
  const label = {
    'GAP_UP': 'Gap up',
    'GAP_DOWN': 'Gap down',
    'HOLD': 'Hold',
    'HOLD_NO_STOCK': 'No stock',
    'MANUAL_OVERRIDE': 'Override',
    'REVIEW_TARIFF_EVENT': 'Review',
    'REVIEW_MARKET_SHIFT': 'Review',
    'REVIEW_PRICE_SHOCK': 'Review',
  }[code] || code;
  return <span className={cls}>{label}</span>;
}

function ConfBadge({ level }) {
  const lvl = (level || 'na').toLowerCase();
  const on = { high: 3, medium: 2, low: 1, na: 0 }[lvl] || 0;
  return (
    <span className={`conf conf-${lvl}`}>
      <span className="conf-dots">
        {[1,2,3].map(i => <span key={i} className={`conf-dot ${i <= on ? 'on' : ''}`} />)}
      </span>
      <span className="lbl">{lvl === 'na' ? 'N/A' : level.toUpperCase()}</span>
    </span>
  );
}

function Delta({ value, decimals = 1 }) {
  if (value == null) return <span className="delta delta-flat">—</span>;
  const pct = value * 100;
  const cls = pct > 0.5 ? 'delta-up' : pct < -0.5 ? 'delta-down' : 'delta-flat';
  const arrow = pct > 0.5 ? '▲' : pct < -0.5 ? '▼' : '◆';
  const sign = pct > 0 ? '+' : '';
  return <span className={`delta ${cls}`}><span className="arrow">{arrow}</span> {sign}{pct.toFixed(decimals)}%</span>;
}

// ─── Flag chip ─────────────────────────────────────────────────
const FLAG_META = {
  UNDERPRICED_VS_FAMILY: { cls: 'flag-amber', short: 'UNDER',  desc: 'L2 < L3 by >30%: possible upside opportunity' },
  OVERPRICED_VS_FAMILY:  { cls: 'flag-amber', short: 'OVER',   desc: 'L2 > L3 by >30%: possible bad comp data' },
  NONSTANDARD_LENGTH:    { cls: 'flag-gray',  short: 'NONSTD', desc: 'Length not in family standard set' },
  FAMILY_DATA_THIN:      { cls: 'flag-gray',  short: 'THIN',   desc: 'Fewer than 4 SKUs in family to fit curve' },
  NO_COMPS:              { cls: 'flag-red',   short: 'NO COMP',desc: 'Zero competitor coverage' },
  MONOTONICITY_VIOLATION:{ cls: 'flag-amber', short: 'MONO',   desc: 'Longer cable priced cheaper than shorter' },
  MATCH_QUALITY_LOW:     { cls: 'flag-amber', short: 'MATCH',  desc: 'Comp notes indicate imperfect match' },
  DATA_GAP_COST:         { cls: 'flag-red',   short: 'COST',   desc: 'Cost basis missing' },
  DEAD_STOCK:            { cls: 'flag-gray',  short: 'DEAD',   desc: 'Zero sales in 90+ days, inventory > 0' },
  REVIEW_TARIFF_EVENT:   { cls: 'flag-red',   short: 'TARIFF', desc: 'Comp median moved >5% in 30 days' },
  REVIEW_PRICE_SHOCK:    { cls: 'flag-red',   short: 'SHOCK',  desc: 'Single SKU L2 moved >15%' },
  REVIEW_MARKET_SHIFT:   { cls: 'flag-red',   short: 'MARKET', desc: 'Family-level event detected' },
  NO_STOCK:              { cls: 'flag-gray',  short: 'NOSTOCK',desc: 'Inventory = 0 — markdowns blocked' },
};
function FlagChip({ flag }) {
  const m = FLAG_META[flag] || { cls: 'flag-gray', short: flag, desc: flag };
  return <span className={`flag-chip ${m.cls}`} title={m.desc}>{m.short}</span>;
}

// ─── Cb (checkbox) ─────────────────────────────────────────────
function Cb({ on, onChange }) {
  return (
    <span className={`cb ${on ? 'on' : ''}`} onClick={(e) => { e.stopPropagation(); onChange && onChange(!on); }} role="checkbox" aria-checked={on} />
  );
}

// ─── Select dropdown ────────────────────────────────────────────
function Select({ value, onChange, options, label, multi = false, width }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  let displayVal = '';
  let hasVal = false;
  if (multi) {
    const arr = Array.isArray(value) ? value : [];
    hasVal = arr.length > 0;
    displayVal = arr.length === 0 ? label : (arr.length === 1 ? `${label}: ${arr[0]}` : `${label}: ${arr.length}`);
  } else {
    hasVal = value != null && value !== '';
    displayVal = hasVal ? `${label}: ${value}` : label;
  }

  function clear(e) { e.stopPropagation(); onChange(multi ? [] : ''); }

  return (
    <span className="select" ref={ref} style={width ? { width } : null}>
      <button className={`select-btn ${hasVal ? 'has-val' : ''}`} onClick={() => setOpen(!open)}>
        <span>{displayVal}</span>
        {hasVal ? (
          <span className="clear" onClick={clear}><Icon name="close" width={8} height={8} /></span>
        ) : (
          <span className="caret"><Icon name="chevD" width={8} height={8} /></span>
        )}
      </button>
      {open && (
        <div className="select-menu">
          {options.map((o, i) => {
            const optVal = typeof o === 'object' ? o.value : o;
            const optLbl = typeof o === 'object' ? o.label : o;
            const optCount = typeof o === 'object' ? o.count : null;
            const sel = multi ? value.includes(optVal) : value === optVal;
            return (
              <div
                key={i}
                className={`select-opt ${sel ? 'sel' : ''}`}
                onClick={() => {
                  if (multi) {
                    const arr = value.includes(optVal) ? value.filter(v => v !== optVal) : [...value, optVal];
                    onChange(arr);
                  } else {
                    onChange(optVal);
                    setOpen(false);
                  }
                }}
              >
                <Icon name="check" className={`check ${sel ? '' : 'hidden'}`} width={12} height={12} />
                <span>{optLbl}</span>
                {optCount != null && <span className="count">{optCount}</span>}
              </div>
            );
          })}
        </div>
      )}
    </span>
  );
}

// ─── Segmented ─────────────────────────────────────────────────
function Seg({ value, onChange, options }) {
  return (
    <div className="seg">
      {options.map((o) => {
        const v = typeof o === 'object' ? o.value : o;
        const l = typeof o === 'object' ? o.label : o;
        return (
          <button key={v} className={value === v ? 'on' : ''} onClick={() => onChange(v)}>
            {l}
          </button>
        );
      })}
    </div>
  );
}

// ─── Tooltip hook ──────────────────────────────────────────────
function useTooltip() {
  const [tip, setTip] = useState(null);
  const showTip = useCallback((content, e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTip({ content, x: r.left + r.width / 2, y: r.top - 8 });
  }, []);
  const hideTip = useCallback(() => setTip(null), []);
  const ttEl = tip ? (
    <div className="tooltip" style={{ left: tip.x, top: tip.y, transform: 'translate(-50%, -100%)' }}>{tip.content}</div>
  ) : null;
  return { showTip, hideTip, ttEl };
}

// ─── Toast context ─────────────────────────────────────────────
const ToastCtx = createContext({ push: () => {} });
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, { id, ...t }]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), t.duration || 3500);
  }, []);
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="toast-region">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.kind || ''}`}>
            <div className="t-title">{t.title}</div>
            {t.msg && <div className="t-msg">{t.msg}</div>}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
function useToast() { return useContext(ToastCtx); }

// ─── Modal ─────────────────────────────────────────────────────
function Modal({ title, onClose, children, footer, width }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={width ? { maxWidth: width } : null} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="btn btn-flat btn-icon" onClick={onClose}><Icon name="close" width={12} height={12} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

// ─── Expose ────────────────────────────────────────────────────
Object.assign(window, {
  // hooks / utils
  useState, useEffect, useRef, useMemo, useCallback, useContext, Fragment,
  // helpers
  Icon, ICONS,
  fmtMoney, fmtPct, fmtInt, fmtDate,
  ActionBadge, ConfBadge, Delta, FlagChip, FLAG_META,
  Cb, Select, Seg,
  useTooltip, ToastProvider, useToast,
  Modal,
});
