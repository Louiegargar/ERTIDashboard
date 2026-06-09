// AUTO-GENERATED from assets/*.jsx by build.js — do not edit directly.

/* === ui.jsx === */
// ui.jsx — shared primitives, formatters, store hook
const {
  useState: useS,
  useEffect: useE,
  useRef: useR
} = React;
function peso(v) {
  if (v == null || isNaN(v)) return '—';
  return '₱' + Math.round(v).toLocaleString('en-PH');
}
function fmtInt(v) {
  if (v == null || isNaN(v)) return '—';
  return Math.round(v).toLocaleString();
}
function clsFor(good) {
  return good ? 'green' : 'red';
}
const I = {
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  money: ['M12 1v22', 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'],
  box: ['M21 8l-9-5-9 5 9 5 9-5z', 'M3 8v8l9 5 9-5V8', 'M12 13v8'],
  layers: ['M12 3 2 8l10 5 10-5z', 'M2 13l10 5 10-5', 'M2 18l10 5 10-5'],
  cal: ['M3 5h18v16H3z', 'M3 9h18', 'M8 3v4', 'M16 3v4'],
  star: 'M12 3l2.6 5.6 6 .6-4.5 4 1.3 6L12 16.8 6.6 19.2l1.3-6-4.5-4 6-.6z',
  users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  upload: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12'],
  gear: ['M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H1a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 2.6 7a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 7 2.6h.1A1.6 1.6 0 0 0 9 1.1V1a2 2 0 1 1 4 0v.1A1.6 1.6 0 0 0 15 2.6a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V7a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z'],
  pulse: 'M3 12h4l2-7 4 14 2-7h6',
  target: ['M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0', 'M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0', 'M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0'],
  clock: ['M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0', 'M12 7v5l3 2'],
  plus: 'M12 5v14M5 12h14'
};
function Icon({
  d,
  size,
  sw
}) {
  const a = Array.isArray(d) ? d : [d];
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: size || 16,
    height: size || 16,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: sw || 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, a.map((p, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: p
  })));
}

// re-render hook: subscribe to STORE version
function useStore() {
  const [, set] = useS(0);
  useE(() => window.STORE.subscribe(v => set(v)), []);
  return window.STORE;
}
function commit() {
  window.STORE.saveLocal();
  window.STORE.bump();
}
function SyncDot() {
  const s = window.STORE.getSync();
  const lbl = {
    synced: 'synced',
    saving: 'saving…',
    error: 'sync error',
    idle: window.STORE.hasSb() ? 'connected' : 'local only'
  }[s] || s;
  return /*#__PURE__*/React.createElement("span", {
    className: "row",
    style: {
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: 'dot ' + s
  }), /*#__PURE__*/React.createElement("span", {
    className: "muted-s"
  }, lbl));
}
function Panel({
  title,
  sub,
  icon,
  right,
  children,
  pad
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pt"
  }, /*#__PURE__*/React.createElement("h3", null, icon && /*#__PURE__*/React.createElement(Icon, {
    d: icon
  }), title, sub && /*#__PURE__*/React.createElement("span", {
    className: "sub",
    style: {
      marginLeft: 8
    }
  }, sub)), right), /*#__PURE__*/React.createElement("div", {
    className: "pb",
    style: pad === false ? {
      padding: 0
    } : null
  }, children));
}
function KpiCard({
  label,
  value,
  sub,
  cls,
  icon,
  onClick
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: 'kpi-card ' + (cls || ''),
    onClick: onClick
  }, /*#__PURE__*/React.createElement("div", {
    className: "kpi-label"
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    d: icon,
    size: 13
  }), label), /*#__PURE__*/React.createElement("div", {
    className: "kpi-val"
  }, value), sub && /*#__PURE__*/React.createElement("div", {
    className: "kpi-sub"
  }, sub));
}
function Tile({
  label,
  value,
  accent
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "tile"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tv",
    style: accent ? {
      color: accent
    } : null
  }, value), /*#__PURE__*/React.createElement("div", {
    className: "tl"
  }, label));
}
function Seg({
  value,
  options,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "seg"
  }, options.map(o => {
    const v = o.k || o,
      l = o.l || o;
    return /*#__PURE__*/React.createElement("button", {
      key: v,
      className: value === v ? 'active' : '',
      onClick: () => onChange(v)
    }, l);
  }));
}
function Modal({
  open,
  title,
  big,
  onClose,
  children,
  footer
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: 'modal-overlay' + (open ? ' open' : ''),
    onClick: e => {
      if (e.target.classList.contains('modal-overlay')) onClose();
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mh"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, title), big != null && /*#__PURE__*/React.createElement("div", {
    className: "big"
  }, big)), /*#__PURE__*/React.createElement("button", {
    className: "x",
    onClick: onClose
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    className: "mb"
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    className: "mf"
  }, footer)));
}
function Toast() {
  const m = window.STORE.getToast();
  if (!m) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "toast"
  }, m);
}
Object.assign(window, {
  peso,
  fmtInt,
  clsFor,
  Icon,
  I,
  useStore,
  commit,
  SyncDot,
  Panel,
  KpiCard,
  Tile,
  Seg,
  Modal,
  Toast
});

// loading banner (in-app waits) — instant boot splash lives in index.html
function Banner() {
  useStore();
  const b = window.STORE.getBanner();
  return /*#__PURE__*/React.createElement("div", {
    className: 'banner' + (b.show ? '' : ' hide')
  }, /*#__PURE__*/React.createElement("div", {
    className: "splash-mark"
  }, /*#__PURE__*/React.createElement(Icon, {
    d: I.pulse,
    size: 44
  })), /*#__PURE__*/React.createElement("div", {
    className: "splash-text"
  }, /*#__PURE__*/React.createElement("div", {
    className: "splash-title"
  }, b.text || 'ERTI Nerve Center'), /*#__PURE__*/React.createElement("div", {
    className: "splash-sub"
  }, "F2 \xB7 ETS / LTX Debug Operations")), /*#__PURE__*/React.createElement("div", {
    className: "splash-bar"
  }, /*#__PURE__*/React.createElement("i", null)));
}
window.Banner = Banner;

/* === charts.jsx === */
// charts.jsx — Chart.js wrappers (destroy/recreate; guarded when Chart absent)
const {
  useRef: useRc,
  useEffect: useEc
} = React;
const TEAL = '#00d4aa',
  BLUE = '#4a9eff',
  GOLD = '#f0c040',
  GREEN = '#2ed573',
  RED = '#ff4757',
  GRID = 'rgba(255,255,255,0.06)',
  FG = '#aeb6c2';
const HAS_CHART = () => typeof window !== 'undefined' && typeof window.Chart !== 'undefined';
function useChart(factory, deps) {
  const ref = useRc(null);
  const inst = useRc(null);
  useEc(() => {
    if (!HAS_CHART() || !ref.current) return;
    const cfg = factory();
    if (!cfg) return;
    inst.current = new window.Chart(ref.current.getContext('2d'), cfg);
    return () => {
      if (inst.current) {
        inst.current.destroy();
        inst.current = null;
      }
    };
  }, deps);
  return ref;
}
function baseOpts(yFmt) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: FG,
          font: {
            size: 11
          },
          boxWidth: 12
        }
      },
      tooltip: {
        callbacks: yFmt ? {
          label: c => c.dataset.label + ': ' + yFmt(c.parsed.y)
        } : {}
      }
    },
    scales: {
      x: {
        grid: {
          color: GRID
        },
        ticks: {
          color: FG,
          font: {
            size: 10
          }
        }
      },
      y: {
        grid: {
          color: GRID
        },
        ticks: {
          color: FG,
          font: {
            size: 10
          },
          callback: v => yFmt ? yFmt(v) : v
        },
        beginAtZero: true
      }
    }
  };
}
const pesoK = v => v >= 1000 ? '₱' + v / 1000 + 'k' : '₱' + v;
function NoChart({
  h
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "empty",
    style: {
      height: h || 200,
      display: 'grid',
      placeItems: 'center'
    }
  }, "Chart.js not loaded (offline)");
}

// combo: actual bars + projected(dashed) + budget(solid) lines
function Combo({
  labels,
  actual,
  proj,
  budget,
  money,
  h
}) {
  const ref = useChart(() => ({
    type: 'bar',
    data: {
      labels,
      datasets: [{
        type: 'bar',
        label: 'Actual',
        data: actual,
        backgroundColor: TEAL,
        borderRadius: 3,
        order: 3
      }, {
        type: 'line',
        label: 'Projected',
        data: proj,
        borderColor: BLUE,
        borderDash: [5, 4],
        pointRadius: 2,
        tension: .3,
        order: 1
      }, {
        type: 'line',
        label: 'Budget',
        data: budget,
        borderColor: GOLD,
        pointRadius: 2,
        tension: .3,
        order: 2
      }]
    },
    options: baseOpts(money ? pesoK : null)
  }), [JSON.stringify([labels, actual, proj, budget])]);
  if (!HAS_CHART()) return /*#__PURE__*/React.createElement(NoChart, {
    h: h
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: h || 220
    }
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: ref
  }));
}

// gap bars +/- coloured
function GapBars({
  labels,
  data,
  money,
  h
}) {
  const ref = useChart(() => ({
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Gap',
        data,
        backgroundColor: data.map(v => v >= 0 ? GREEN : RED),
        borderRadius: 3
      }]
    },
    options: baseOpts(money ? pesoK : null)
  }), [JSON.stringify([labels, data])]);
  if (!HAS_CHART()) return /*#__PURE__*/React.createElement(NoChart, {
    h: h
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: h || 220
    }
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: ref
  }));
}

// single line vs actual
function LineVs({
  labels,
  actual,
  plan,
  planLabel,
  money,
  h
}) {
  const ref = useChart(() => ({
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Actual',
        data: actual,
        borderColor: TEAL,
        backgroundColor: 'rgba(0,212,170,.12)',
        fill: true,
        tension: .3,
        pointRadius: 2
      }, {
        label: planLabel || 'Plan',
        data: plan,
        borderColor: GOLD,
        borderDash: [5, 4],
        tension: .3,
        pointRadius: 2
      }]
    },
    options: baseOpts(money ? pesoK : null)
  }), [JSON.stringify([labels, actual, plan])]);
  if (!HAS_CHART()) return /*#__PURE__*/React.createElement(NoChart, {
    h: h
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: h || 220
    }
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: ref
  }));
}

// stacked WIP aging buckets (single stacked column or grouped)
function AgingBars({
  labels,
  data,
  h
}) {
  const ref = useChart(() => ({
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'WIP items',
        data,
        backgroundColor: [GREEN, GOLD, '#ff9f43', RED],
        borderRadius: 3
      }]
    },
    options: baseOpts(null)
  }), [JSON.stringify([labels, data])]);
  if (!HAS_CHART()) return /*#__PURE__*/React.createElement(NoChart, {
    h: h
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: h || 200
    }
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: ref
  }));
}

// manning current vs target by team
function ManningBars({
  teams,
  cur,
  target,
  h
}) {
  const ref = useChart(() => ({
    type: 'bar',
    data: {
      labels: teams,
      datasets: [{
        label: 'Current',
        data: cur,
        backgroundColor: TEAL,
        borderRadius: 3
      }, {
        label: 'Target',
        data: target,
        backgroundColor: 'rgba(255,255,255,.14)',
        borderRadius: 3
      }]
    },
    options: baseOpts(null)
  }), [JSON.stringify([teams, cur, target])]);
  if (!HAS_CHART()) return /*#__PURE__*/React.createElement(NoChart, {
    h: h
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: h || 200
    }
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: ref
  }));
}

// competency radar by platform
function CompetencyRadar({
  axes,
  values,
  h
}) {
  const ref = useChart(() => ({
    type: 'radar',
    data: {
      labels: axes,
      datasets: [{
        label: 'Avg rating',
        data: values,
        borderColor: TEAL,
        backgroundColor: 'rgba(0,212,170,.18)',
        pointBackgroundColor: TEAL
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: FG
          }
        }
      },
      scales: {
        r: {
          min: 0,
          max: 3,
          grid: {
            color: GRID
          },
          angleLines: {
            color: GRID
          },
          pointLabels: {
            color: FG,
            font: {
              size: 10
            }
          },
          ticks: {
            display: false
          }
        }
      }
    }
  }), [JSON.stringify([axes, values])]);
  if (!HAS_CHART()) return /*#__PURE__*/React.createElement(NoChart, {
    h: h
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: h || 220
    }
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: ref
  }));
}
Object.assign(window, {
  Combo,
  GapBars,
  LineVs,
  AgingBars,
  ManningBars,
  CompetencyRadar
});

// ── interactive variants (appended) ──
const PALETTE = [TEAL, BLUE, GOLD, GREEN, RED, '#a55eea', '#ff9f43', '#26d0ce', '#5f27cd', '#10ac84'];

// clickable bar chart (used for aging) — onPick(index)
function ClickBars({
  labels,
  data,
  colors,
  onPick,
  h
}) {
  const ref = useChart(() => ({
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'WIP items',
        data,
        backgroundColor: colors || labels.map((_, i) => PALETTE[i % PALETTE.length]),
        borderRadius: 4
      }]
    },
    options: Object.assign(baseOpts(null), {
      onClick: (e, els) => {
        if (els.length && onPick) onPick(els[0].index);
      },
      onHover: (e, els) => {
        e.native.target.style.cursor = els.length ? 'pointer' : 'default';
      },
      plugins: {
        legend: {
          display: false
        }
      }
    })
  }), [JSON.stringify([labels, data])]);
  if (!HAS_CHART()) return /*#__PURE__*/React.createElement(NoChart, {
    h: h
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: h || 300
    }
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: ref
  }));
}

// customizable donut — onPick(label)
function Donut({
  labels,
  data,
  onPick,
  h
}) {
  const colors = labels.map((_, i) => PALETTE[i % PALETTE.length]);
  const ref = useChart(() => ({
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: '#1e2228',
        borderWidth: 2,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      onClick: (e, els) => {
        if (els.length && onPick) onPick(labels[els[0].index]);
      },
      onHover: (e, els) => {
        e.native.target.style.cursor = els.length ? 'pointer' : 'default';
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: c => c.label + ': ' + c.parsed + ' (' + Math.round(c.parsed / data.reduce((a, b) => a + b, 0) * 100 || 0) + '%)'
          }
        }
      }
    }
  }), [JSON.stringify([labels, data])]);
  if (!HAS_CHART()) return /*#__PURE__*/React.createElement(NoChart, {
    h: h
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "donut-wrap",
    style: {
      height: h || 280
    }
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: ref
  }));
}

// interactive WIP trend per workweek (bars=total, line=aged) — onPick(index)
function WipTrend({
  labels,
  total,
  aged,
  onPick,
  h
}) {
  const ref = useChart(() => ({
    type: 'bar',
    data: {
      labels,
      datasets: [{
        type: 'bar',
        label: 'Active WIP',
        data: total,
        backgroundColor: '#a55eea',
        borderRadius: 3,
        order: 2
      }, {
        type: 'line',
        label: 'Aged (≥flag)',
        data: aged,
        borderColor: RED,
        backgroundColor: 'rgba(255,71,87,.12)',
        fill: true,
        tension: .3,
        pointRadius: 3,
        order: 1
      }]
    },
    options: Object.assign(baseOpts(null), {
      onClick: (e, els) => {
        if (els.length && onPick) onPick(els[0].index);
      },
      onHover: (e, els) => {
        e.native.target.style.cursor = els.length ? 'pointer' : 'default';
      }
    })
  }), [JSON.stringify([labels, total, aged])]);
  if (!HAS_CHART()) return /*#__PURE__*/React.createElement(NoChart, {
    h: h
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: h || 260
    }
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: ref
  }));
}
Object.assign(window, {
  ClickBars,
  Donut,
  WipTrend,
  PALETTE
});

/* === kpi-modal.jsx === */
// kpi-modal.jsx — reusable KPI drill-down (§8.2)
const KPI_MODAL = {
  total_output: {
    title: 'Output: Actual vs Projected vs Budget',
    kind: 'comboOut'
  },
  actual_revenue: {
    title: 'Revenue: Actual vs Projected vs Budget',
    kind: 'comboRev'
  },
  projected_revenue: {
    title: 'Projected vs Actual Revenue',
    kind: 'lineRev',
    plan: 'projected'
  },
  budget_revenue: {
    title: 'Budget vs Actual Revenue',
    kind: 'lineRev',
    plan: 'budget'
  },
  output_gap: {
    title: 'Output Gap vs Budget',
    kind: 'gap',
    unit: 'boards'
  },
  revenue_gap: {
    title: 'Revenue Gap vs Budget',
    kind: 'gap',
    unit: 'peso'
  },
  manning: {
    title: 'Manning: Current vs Target',
    kind: 'manning'
  },
  total_wip: {
    title: 'WIP by Aging Bucket',
    kind: 'wipAging'
  },
  competency: {
    title: 'Competency by Platform',
    kind: 'competency'
  }
};
function KpiModal() {
  useStore();
  const E = window.ENGINE,
    S = window.STORE,
    st = S.state,
    DB = S.DB;
  const key = st.modalKey;
  const cfg = key ? KPI_MODAL[key] : null;
  const close = () => {
    st.modalKey = null;
    S.bump();
  };
  if (!cfg) return /*#__PURE__*/React.createElement(Modal, {
    open: false,
    onClose: close
  });
  const pt = st.modalPeriodType,
    range = st.modalRange || (pt === 'weekly' ? DB.config.trendWindowWeekly : DB.config.trendWindowMonthly);
  const ser = E.buildSeries(pt, range, st.periodKey, st.teamFilter || '');
  const ranges = pt === 'weekly' ? [4, 8, 13] : [3, 6, 12];
  let body = null,
    table = null;
  if (cfg.kind === 'comboOut') {
    body = /*#__PURE__*/React.createElement(Combo, {
      labels: ser.labels,
      actual: ser.outActual,
      proj: ser.outProj,
      budget: ser.outBudget,
      h: 260
    });
    table = ser.periods.map((p, i) => [ser.labels[i], ser.outActual[i], ser.outProj[i], ser.outBudget[i], ser.outActual[i] - ser.outBudget[i]]);
    var head = ['Period', 'Actual', 'Proj', 'Budget', 'Gap'];
  } else if (cfg.kind === 'comboRev') {
    body = /*#__PURE__*/React.createElement(Combo, {
      labels: ser.labels,
      actual: ser.revActual,
      proj: ser.revProj,
      budget: ser.revBudget,
      money: true,
      h: 260
    });
    table = ser.periods.map((p, i) => [ser.labels[i], peso(ser.revActual[i]), peso(ser.revProj[i]), peso(ser.revBudget[i]), peso(ser.revActual[i] - ser.revBudget[i])]);
    var head = ['Period', 'Actual', 'Proj', 'Budget', 'Gap'];
  } else if (cfg.kind === 'lineRev') {
    const plan = cfg.plan === 'projected' ? ser.revProj : ser.revBudget;
    body = /*#__PURE__*/React.createElement(LineVs, {
      labels: ser.labels,
      actual: ser.revActual,
      plan: plan,
      planLabel: cfg.plan,
      money: true,
      h: 260
    });
    table = ser.periods.map((p, i) => [ser.labels[i], peso(ser.revActual[i]), peso(plan[i]), peso(ser.revActual[i] - plan[i])]);
    var head = ['Period', 'Actual', cfg.plan, 'Gap'];
  } else if (cfg.kind === 'gap') {
    const money = cfg.unit === 'peso';
    const data = ser.periods.map((p, i) => money ? ser.revActual[i] - ser.revBudget[i] : ser.outActual[i] - ser.outBudget[i]);
    body = /*#__PURE__*/React.createElement(GapBars, {
      labels: ser.labels,
      data: data,
      money: money,
      h: 260
    });
    table = ser.periods.map((p, i) => [ser.labels[i], money ? peso(data[i]) : data[i]]);
    var head = ['Period', 'Gap'];
  } else if (cfg.kind === 'manning') {
    const m = E.manning();
    const teams = Object.keys(m.teams);
    body = /*#__PURE__*/React.createElement(ManningBars, {
      teams: teams,
      cur: teams.map(t => m.teams[t].cur),
      target: teams.map(t => m.teams[t].target),
      h: 240
    });
    table = teams.map(t => [t, m.teams[t].cur, m.teams[t].target || '—', m.teams[t].target ? Math.round(m.teams[t].cur / m.teams[t].target * 100) + '%' : '—']);
    var head = ['Team', 'Current', 'Target', 'Fill'];
  } else if (cfg.kind === 'wipAging') {
    const wip = E.activeWip();
    const b = DB.config.agingBuckets;
    const labels = b.map(x => x[1] >= 9999 ? x[0] + '+ d' : x[0] + '–' + x[1] + ' d');
    const counts = b.map(() => 0);
    wip.forEach(w => {
      counts[E.agingBucket(E.wipAge(w))]++;
    });
    body = /*#__PURE__*/React.createElement(AgingBars, {
      labels: labels,
      data: counts,
      h: 240
    });
    table = labels.map((l, i) => [l, counts[i]]);
    var head = ['Aging bucket', 'WIP items'];
  } else if (cfg.kind === 'competency') {
    const plats = DB.PLAT || ['Testcard', 'Faceplate', 'Perfboard', 'Handler/Ins'];
    const vals = plats.map(pl => {
      const rs = DB.platform_ratings.filter(r => r.platform === pl);
      return rs.length ? +(rs.reduce((s, r) => s + r.rating, 0) / rs.length).toFixed(2) : 0;
    });
    body = /*#__PURE__*/React.createElement(CompetencyRadar, {
      axes: plats,
      values: vals,
      h: 260
    });
    table = plats.map((pl, i) => [pl, vals[i]]);
    var head = ['Platform', 'Avg rating /3'];
  }
  return /*#__PURE__*/React.createElement(Modal, {
    open: true,
    title: cfg.title,
    big: null,
    onClose: close,
    footer: /*#__PURE__*/React.createElement("button", {
      className: "btn",
      onClick: close
    }, "Close")
  }, /*#__PURE__*/React.createElement("div", {
    className: "row between wrap",
    style: {
      gap: 10,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Seg, {
    value: pt,
    options: [{
      k: 'weekly',
      l: 'Weekly'
    }, {
      k: 'monthly',
      l: 'Monthly'
    }],
    onChange: v => {
      st.modalPeriodType = v;
      st.modalRange = v === 'weekly' ? DB.config.trendWindowWeekly : DB.config.trendWindowMonthly;
      S.bump();
    }
  }), /*#__PURE__*/React.createElement(Seg, {
    value: range,
    options: ranges.map(r => ({
      k: r,
      l: 'last ' + r
    })),
    onChange: v => {
      st.modalRange = v;
      S.bump();
    }
  })), body, /*#__PURE__*/React.createElement("div", {
    className: "tbl-wrap",
    style: {
      marginTop: 12,
      maxHeight: 220
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "dt"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, head.map((h, i) => /*#__PURE__*/React.createElement("th", {
    key: i,
    className: i ? 'num' : ''
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, table.map((row, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, row.map((c, j) => /*#__PURE__*/React.createElement("td", {
    key: j,
    className: j ? 'num' : ''
  }, c))))))));
}
window.KpiModal = KpiModal;
window.KPI_MODAL = KPI_MODAL;

/* === tab-executive.jsx === */
// tab-executive.jsx — Executive Pulse (KPI grid + period selector + anchor trends + team rollup)
function periodsWithData(pt) {
  const E = window.ENGINE,
    DB = window.STORE.DB;
  const keys = new Set();
  DB.output_records.forEach(r => keys.add(E.periodOf(r, pt)));
  DB.output_targets.filter(t => t.period_type === pt).forEach(t => keys.add(t.period_key));
  return [...keys].sort();
}
function setPeriod(patch) {
  Object.assign(window.STORE.state, patch);
  window.STORE.bump();
}
function Executive() {
  useStore();
  const E = window.ENGINE,
    S = window.STORE,
    st = S.state,
    DB = S.DB;
  const pt = st.periodType,
    pk = st.periodKey,
    team = st.teamFilter || '';
  const cfg = DB.config;
  const ao = E.actualOutput(pt, pk, team),
    ar = E.actualRevenue(pt, pk, team);
  const bo = E.planOutput(pt, pk, 'budget', team),
    br = E.planRevenue(pt, pk, 'budget', team);
  const po = E.planOutput(pt, pk, 'projected', team),
    pr = E.planRevenue(pt, pk, 'projected', team);
  const og = ao - bo,
    rg = ar - br;
  const man = E.manning();
  const manCls = man.fill >= cfg.manningGreenPct ? 'green' : man.fill >= cfg.manningYellowPct ? 'yellow' : 'red';
  const wip = E.activeWip();
  const aged = wip.filter(w => E.wipAge(w) >= cfg.agingFlagDays).length;
  const ci = E.competencyIndex();
  const ciPct = Math.round(ci / 3 * 100);
  const ciCls = ci >= cfg.competencyGreen ? 'green' : ci >= cfg.competencyYellow ? 'yellow' : 'red';
  const n = pt === 'weekly' ? cfg.trendWindowWeekly : cfg.trendWindowMonthly;
  const ser = E.buildSeries(pt, n, pk, team);
  const teams = [...new Set(DB.engineers.filter(e => !e.resigned).map(e => e.team))];
  const opts = periodsWithData(pt).filter(k => E.clampPeriod(pt, k) === k);
  if (opts.length && !opts.includes(pk)) setPeriod({
    periodKey: opts[opts.length - 1]
  });
  const card = (key, label, value, sub, cls, icon) => /*#__PURE__*/React.createElement(KpiCard, {
    key: key,
    label: label,
    value: value,
    sub: sub,
    cls: cls,
    icon: icon,
    onClick: () => {
      Object.assign(st, {
        modalKey: key,
        modalPeriodType: pt,
        modalRange: n
      });
      S.bump();
    }
  });
  const priced = DB.price_settings.some(p => p.placeholder);
  return /*#__PURE__*/React.createElement("div", {
    className: "view-inner"
  }, priced && /*#__PURE__*/React.createElement("div", {
    className: "warn-bar"
  }, "Price book uses ", /*#__PURE__*/React.createElement("b", null, "placeholder"), " peso values \u2014 set real prices on ", /*#__PURE__*/React.createElement("b", null, "Revenue & Targets"), "; all revenue figures re-flow automatically."), /*#__PURE__*/React.createElement("div", {
    className: "row between wrap",
    style: {
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Seg, {
    value: pt,
    options: [{
      k: 'weekly',
      l: 'Weekly'
    }, {
      k: 'monthly',
      l: 'Monthly'
    }],
    onChange: v => {
      const o = periodsWithData(v);
      setPeriod({
        periodType: v,
        periodKey: o[o.length - 1] || ''
      });
    }
  }), /*#__PURE__*/React.createElement("select", {
    value: pk,
    onChange: e => setPeriod({
      periodKey: e.target.value
    })
  }, opts.map(k => /*#__PURE__*/React.createElement("option", {
    key: k,
    value: k
  }, E.periodLabel(pt, k))))), /*#__PURE__*/React.createElement("select", {
    value: team,
    onChange: e => setPeriod({
      teamFilter: e.target.value
    })
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "All teams"), teams.map(t => /*#__PURE__*/React.createElement("option", {
    key: t,
    value: t
  }, t)))), /*#__PURE__*/React.createElement("div", {
    className: "kpi-grid"
  }, card('total_output', 'Total Output', fmtInt(ao), 'vs budget ' + bo + ' · proj ' + po, 'teal', I.box), card('actual_revenue', 'Actual Revenue', peso(ar), '= output × price book', ar >= br ? 'green' : 'red', I.money), card('projected_revenue', 'Projected Revenue', peso(pr), 'from projected targets', 'blue', I.pulse), card('budget_revenue', 'Budget Revenue', peso(br), 'from budget targets', 'yellow', I.money), card('output_gap', 'Output Gap vs Budget', (og >= 0 ? '+' : '') + og, E.pct(og, bo) + ' of budget', og >= 0 ? 'green' : 'red', I.target), card('revenue_gap', 'Revenue Gap vs Budget', peso(rg), E.pct(rg, br) + ' of budget', rg >= 0 ? 'green' : 'red', I.target), card('manning', 'Manning Capacity', man.fill + '%', 'HC ' + man.cur + ' / ' + man.target, manCls, I.users), card('total_wip', 'Total WIP', fmtInt(wip.length), aged + ' aging > ' + cfg.agingFlagDays + 'd', aged ? 'yellow' : 'blue', I.box), card('competency', 'Competency Index', ci.toFixed(2) + ' /3', ciPct + '% · ' + DB.engineers.filter(e => !e.resigned).length + ' eng', ciCls, I.star)), /*#__PURE__*/React.createElement("div", {
    className: "grid g-2"
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Output Trend",
    icon: I.box,
    sub: "Actual / Projected / Budget"
  }, /*#__PURE__*/React.createElement(Combo, {
    labels: ser.labels,
    actual: ser.outActual,
    proj: ser.outProj,
    budget: ser.outBudget,
    h: 230
  })), /*#__PURE__*/React.createElement(Panel, {
    title: "Revenue Trend",
    icon: I.money,
    sub: "\u20B1 Actual / Projected / Budget"
  }, /*#__PURE__*/React.createElement(Combo, {
    labels: ser.labels,
    actual: ser.revActual,
    proj: ser.revProj,
    budget: ser.revBudget,
    money: true,
    h: 230
  }))), /*#__PURE__*/React.createElement(Panel, {
    title: "Team Summary",
    icon: I.users,
    sub: E.periodLabel(pt, pk),
    pad: false
  }, /*#__PURE__*/React.createElement("table", {
    className: "dt"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Team"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "HC"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "Output"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "Revenue"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "Gap vs Budget"))), /*#__PURE__*/React.createElement("tbody", null, teams.map(tm => {
    const o = E.actualOutput(pt, pk, tm),
      r = E.actualRevenue(pt, pk, tm),
      g = E.revenueGap(pt, pk, 'budget', tm);
    const hc = DB.engineers.filter(e => !e.resigned && e.team === tm).length;
    return /*#__PURE__*/React.createElement("tr", {
      key: tm
    }, /*#__PURE__*/React.createElement("td", null, tm), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, hc), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, o), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, peso(r)), /*#__PURE__*/React.createElement("td", {
      className: "num",
      style: {
        color: g >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'
      }
    }, peso(g)));
  })))), /*#__PURE__*/React.createElement(KpiModal, null));
}
window.Executive = Executive;

/* === tab-revenue.jsx === */
// tab-revenue.jsx — editable price book + MONTHLY team budgets + MONTHLY output targets (§8.3, revised)
const {
  useState: useSr
} = React;
function RevenueTargets() {
  useStore();
  const E = window.ENGINE,
    S = window.STORE,
    DB = S.DB;
  const [month, setMonth] = useSr(() => E.currentPeriod('monthly'));
  const [plan, setPlan] = useSr('budget');
  const hws = DB.price_settings.map(p => p.hw_type);
  const teams = [...new Set(DB.engineers.filter(e => !e.resigned).map(e => e.team))];
  if (!teams.length) teams.push('F2-LTX', 'F2-ETS');
  const monthOpts = window.ALL_MONTHS; // planning may be future, so not clamped

  // ── price book ──
  const setPrice = (hw, val) => {
    const r = DB.price_settings.find(p => p.hw_type === hw);
    r.price = Math.max(0, parseFloat(val || 0));
    r.placeholder = false;
    S.persist('price_settings', r);
    S.bump();
  };
  const renameType = (oldT, newT) => {
    newT = (newT || '').trim();
    if (!newT || newT === oldT) return;
    if (DB.price_settings.find(p => p.hw_type === newT)) {
      S.toast('"' + newT + '" already exists');
      S.bump();
      return;
    }
    const row = DB.price_settings.find(p => p.hw_type === oldT);
    row.hw_type = newT;
    row.placeholder = false;
    DB.output_records.forEach(r => {
      if (r.hw_type === oldT) r.hw_type = newT;
    });
    DB.wip_inventory.forEach(w => {
      if (w.hw_type === oldT) w.hw_type = newT;
    });
    DB.output_targets.forEach(t => {
      if (t.hw_type === oldT) t.hw_type = newT;
    });
    S.remove('price_settings', {
      hw_type: oldT
    });
    S.persist('price_settings', row);
    S.saveLocal();
    S.toast('Renamed → ' + newT + ' (Flush to sync linked records)');
    S.bump();
  };
  const addType = () => {
    let n = 'New Type',
      i = 2;
    while (DB.price_settings.find(p => p.hw_type === n)) n = 'New Type ' + i++;
    const r = {
      hw_type: n,
      price: 0
    };
    DB.price_settings.push(r);
    S.persist('price_settings', r);
    S.bump();
  };
  const delType = hw => {
    DB.price_settings = DB.price_settings.filter(p => p.hw_type !== hw);
    S.remove('price_settings', {
      hw_type: hw
    });
    S.saveLocal();
    S.bump();
  };

  // ── team budgets (monthly) ──
  const tbGet = team => DB.team_budgets.find(b => b.team === team && b.period_key === month) || {
    budget: 0,
    forecast: 0,
    _missing: true
  };
  const tbSet = (team, field, val) => {
    let r = DB.team_budgets.find(b => b.team === team && b.period_key === month);
    if (!r) {
      r = {
        team,
        period_key: month,
        budget: 0,
        forecast: 0
      };
      DB.team_budgets.push(r);
    }
    r[field] = Math.max(0, parseFloat(val || 0));
    delete r.placeholder;
    S.persist('team_budgets', r);
    S.bump();
  };

  // ── output targets (monthly) ──
  const findTarget = hw => DB.output_targets.find(t => t.period_type === 'monthly' && t.period_key === month && t.plan_type === plan && t.hw_type === hw && t.team === 'ALL');
  const setTarget = (hw, val) => {
    let row = findTarget(hw);
    const n = Math.max(0, parseInt(val || 0, 10));
    if (!row) {
      row = {
        id: plan[0] + '-' + month + '-' + hw,
        period_type: 'monthly',
        period_key: month,
        plan_type: plan,
        hw_type: hw,
        team: 'ALL',
        target_count: n
      };
      DB.output_targets.push(row);
    } else row.target_count = n;
    S.persist('output_targets', row);
    S.bump();
  };
  const fillRunRate = () => {
    const scope = E.periodList('monthly', 6, month);
    const per = E.projectRunRate('monthly', scope);
    const mix = {};
    let tot = 0;
    DB.output_records.forEach(r => {
      const k = E.periodOf(r, 'monthly');
      if (scope.includes(k)) {
        mix[r.hw_type] = (mix[r.hw_type] || 0) + 1;
        tot++;
      }
    });
    hws.forEach(hw => {
      const share = tot ? (mix[hw] || 0) / tot : 0;
      setTarget(hw, Math.round(per * share));
    });
    S.toast('Projected filled from 6-month run-rate');
  };
  const totTargets = hws.reduce((s, hw) => {
    const r = findTarget(hw);
    return s + (r ? r.target_count : 0);
  }, 0);
  const totTargetRev = hws.reduce((s, hw) => {
    const r = findTarget(hw);
    return s + (r ? r.target_count : 0) * E.price(hw);
  }, 0);
  const monthLbl = E.periodLabel('monthly', month);
  return /*#__PURE__*/React.createElement("div", {
    className: "view-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row between wrap",
    style: {
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "muted-s"
  }, "Planning month"), /*#__PURE__*/React.createElement("select", {
    value: month,
    onChange: e => setMonth(e.target.value)
  }, monthOpts.map(m => /*#__PURE__*/React.createElement("option", {
    key: m,
    value: m
  }, E.periodLabel('monthly', m))))), /*#__PURE__*/React.createElement("span", {
    className: "muted-s"
  }, "Budgets & targets are set per month \xB7 price book is global")), /*#__PURE__*/React.createElement(Panel, {
    title: "Price Book",
    icon: I.money,
    sub: "\u20B1 per hardware type \u2014 drives all revenue",
    right: /*#__PURE__*/React.createElement("button", {
      className: "btn sm",
      onClick: addType
    }, /*#__PURE__*/React.createElement(Icon, {
      d: I.plus,
      size: 12
    }), " Add type"),
    pad: false
  }, /*#__PURE__*/React.createElement("table", {
    className: "dt"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Hardware Type"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "Price (\u20B1)"), /*#__PURE__*/React.createElement("th", null), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, DB.price_settings.map(p => /*#__PURE__*/React.createElement("tr", {
    key: p.hw_type
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("input", {
    type: "text",
    defaultValue: p.hw_type,
    style: {
      width: 180
    },
    onBlur: e => renameType(p.hw_type, e.target.value)
  })), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: p.price,
    style: {
      width: 120,
      textAlign: 'right'
    },
    onChange: e => setPrice(p.hw_type, e.target.value)
  })), /*#__PURE__*/React.createElement("td", null, p.placeholder && /*#__PURE__*/React.createElement("span", {
    className: "tag gold"
  }, "placeholder")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("button", {
    className: "btn sm danger",
    onClick: () => delType(p.hw_type)
  }, "\u2715")))), DB.price_settings.length === 0 && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: "4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "empty"
  }, "No hardware types \u2014 add one")))))), /*#__PURE__*/React.createElement("div", {
    className: "grid g-2"
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Team Budgets",
    icon: I.users,
    sub: 'monthly · ' + monthLbl,
    pad: false
  }, /*#__PURE__*/React.createElement("table", {
    className: "dt"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Team"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "Budget (\u20B1)"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "Forecast (\u20B1)"))), /*#__PURE__*/React.createElement("tbody", null, teams.map(t => {
    const b = tbGet(t);
    return /*#__PURE__*/React.createElement("tr", {
      key: t
    }, /*#__PURE__*/React.createElement("td", null, t, b._missing && /*#__PURE__*/React.createElement("span", {
      className: "muted-s"
    }, " \xB7 not set")), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, /*#__PURE__*/React.createElement("input", {
      type: "number",
      value: b.budget,
      style: {
        width: 120,
        textAlign: 'right'
      },
      onChange: e => tbSet(t, 'budget', e.target.value)
    })), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, /*#__PURE__*/React.createElement("input", {
      type: "number",
      value: b.forecast,
      style: {
        width: 120,
        textAlign: 'right'
      },
      onChange: e => tbSet(t, 'forecast', e.target.value)
    })));
  })))), /*#__PURE__*/React.createElement(Panel, {
    title: "Output Targets",
    icon: I.target,
    sub: 'monthly · ' + monthLbl,
    right: /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Seg, {
      value: plan,
      options: [{
        k: 'budget',
        l: 'Budget'
      }, {
        k: 'projected',
        l: 'Projected'
      }],
      onChange: setPlan
    }), plan === 'projected' && /*#__PURE__*/React.createElement("button", {
      className: "btn sm",
      onClick: fillRunRate
    }, "Fill run-rate")),
    pad: false
  }, /*#__PURE__*/React.createElement("table", {
    className: "dt"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Hardware Type"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "Target Boards"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "= \u20B1 Revenue"))), /*#__PURE__*/React.createElement("tbody", null, hws.map(hw => {
    const r = findTarget(hw);
    const c = r ? r.target_count : 0;
    return /*#__PURE__*/React.createElement("tr", {
      key: hw
    }, /*#__PURE__*/React.createElement("td", null, hw), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, /*#__PURE__*/React.createElement("input", {
      type: "number",
      value: c,
      style: {
        width: 90,
        textAlign: 'right'
      },
      onChange: e => setTarget(hw, e.target.value)
    })), /*#__PURE__*/React.createElement("td", {
      className: "num"
    }, peso(c * E.price(hw))));
  }), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: {
      fontWeight: 600
    }
  }, "Total"), /*#__PURE__*/React.createElement("td", {
    className: "num",
    style: {
      fontWeight: 600
    }
  }, totTargets), /*#__PURE__*/React.createElement("td", {
    className: "num",
    style: {
      fontWeight: 600,
      color: 'var(--accent)'
    }
  }, peso(totTargetRev))))))));
}
window.RevenueTargets = RevenueTargets;

/* === tab-output.jsx === */
// tab-output.jsx — record-level output entry (§8.4)
const {
  useState: useSo
} = React;
function engName(id) {
  const e = window.STORE.DB.engineers.find(x => x.id === id);
  return e ? e.name : '—';
}
function blankRec() {
  const DB = window.STORE.DB;
  return {
    hardware_id: '',
    hw_type: DB.price_settings[0] && DB.price_settings[0].hw_type,
    activity_category: DB.config.defaultActivityCategory,
    workweek: window.WW.fromDate(new Date()),
    output_date: new Date().toISOString().slice(0, 10),
    engineer_id: null,
    team: '',
    qty: 1
  };
}
function OutputTab() {
  useStore();
  const E = window.ENGINE,
    S = window.STORE,
    DB = S.DB;
  const [fTeam, setFTeam] = useSo('');
  const [fType, setFType] = useSo('');
  const [q, setQ] = useSo('');
  const [edit, setEdit] = useSo(null); // record being edited or new
  const [err, setErr] = useSo('');
  const teams = [...new Set(DB.engineers.map(e => e.team))];
  const rows = DB.output_records.filter(r => (!fTeam || r.team === fTeam) && (!fType || r.hw_type === fType) && (!q || r.hardware_id.toLowerCase().includes(q.toLowerCase()))).sort((a, b) => (b.output_date || '').localeCompare(a.output_date || ''));
  const totRev = rows.reduce((s, r) => s + (r.qty || 1) * E.price(r.hw_type), 0);
  const mix = {};
  rows.forEach(r => mix[r.activity_category] = (mix[r.activity_category] || 0) + 1);
  const save = () => {
    const r = edit;
    if (!r.hardware_id) {
      setErr('Hardware ID required');
      return;
    }
    const dup = DB.output_records.find(x => x.hardware_id === r.hardware_id && x !== r._orig);
    if (dup && (!r._orig || dup.hardware_id !== r._orig.hardware_id)) {
      setErr('Hardware ID must be unique');
      return;
    }
    if (r.engineer_id) {
      const e = DB.engineers.find(x => x.id === +r.engineer_id);
      if (e) r.team = e.team;
    }
    r.workweek = r.workweek || window.WW.fromDate(new Date(r.output_date));
    const rec = {
      id: r.hardware_id,
      hardware_id: r.hardware_id,
      hw_type: r.hw_type,
      activity_category: r.activity_category,
      workweek: r.workweek,
      output_date: r.output_date,
      engineer_id: r.engineer_id ? +r.engineer_id : null,
      team: r.team,
      qty: +r.qty || 1
    };
    if (r._orig) {
      Object.assign(r._orig, rec);
    } else {
      DB.output_records.push(rec);
    }
    S.persist('output_records', rec);
    setEdit(null);
    setErr('');
    S.bump();
  };
  const del = r => {
    DB.output_records = DB.output_records.filter(x => x !== r);
    S.remove('output_records', {
      hardware_id: r.hardware_id
    });
    S.saveLocal();
    S.bump();
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "view-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row between wrap",
    style: {
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "filters"
  }, /*#__PURE__*/React.createElement("select", {
    value: fTeam,
    onChange: e => setFTeam(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "All teams"), teams.map(t => /*#__PURE__*/React.createElement("option", {
    key: t
  }, t))), /*#__PURE__*/React.createElement("select", {
    value: fType,
    onChange: e => setFType(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "All types"), DB.price_settings.map(p => /*#__PURE__*/React.createElement("option", {
    key: p.hw_type
  }, p.hw_type))), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Search hardware ID\u2026",
    value: q,
    onChange: e => setQ(e.target.value),
    style: {
      width: 180
    }
  })), /*#__PURE__*/React.createElement("button", {
    className: "btn pri",
    onClick: () => {
      setErr('');
      setEdit(blankRec());
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    d: I.plus,
    size: 13
  }), " Add Output")), /*#__PURE__*/React.createElement("div", {
    className: "grid g-3"
  }, /*#__PURE__*/React.createElement(Tile, {
    label: "Output Records",
    value: fmtInt(rows.length),
    accent: "var(--accent-teal)"
  }), /*#__PURE__*/React.createElement(Tile, {
    label: "Total Revenue",
    value: peso(totRev),
    accent: "var(--accent-green)"
  }), /*#__PURE__*/React.createElement("div", {
    className: "tile"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tl",
    style: {
      marginBottom: 6
    }
  }, "Activity Mix"), /*#__PURE__*/React.createElement("div", {
    className: "row wrap",
    style: {
      gap: 6
    }
  }, Object.keys(mix).length ? Object.entries(mix).map(([k, v]) => /*#__PURE__*/React.createElement("span", {
    key: k,
    className: "tag"
  }, k, " ", v)) : /*#__PURE__*/React.createElement("span", {
    className: "muted-s"
  }, "\u2014")))), /*#__PURE__*/React.createElement(Panel, {
    title: "Output Records",
    icon: I.box,
    sub: rows.length + ' shown',
    pad: false
  }, /*#__PURE__*/React.createElement("div", {
    className: "tbl-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "dt"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "WW"), /*#__PURE__*/React.createElement("th", null, "Hardware ID"), /*#__PURE__*/React.createElement("th", null, "Type"), /*#__PURE__*/React.createElement("th", null, "Activity"), /*#__PURE__*/React.createElement("th", null, "Date"), /*#__PURE__*/React.createElement("th", null, "Engineer"), /*#__PURE__*/React.createElement("th", null, "Team"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "\u20B1"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, r.workweek), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, r.hardware_id), /*#__PURE__*/React.createElement("td", null, r.hw_type), /*#__PURE__*/React.createElement("td", null, r.activity_category), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, r.output_date), /*#__PURE__*/React.createElement("td", null, r._owners || engName(r.engineer_id)), /*#__PURE__*/React.createElement("td", null, r.team), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, peso((r.qty || 1) * E.price(r.hw_type))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn sm",
    onClick: () => {
      setErr('');
      setEdit(Object.assign({}, r, {
        _orig: r
      }));
    }
  }, "Edit"), /*#__PURE__*/React.createElement("button", {
    className: "btn sm danger",
    onClick: () => del(r)
  }, "\u2715"))))))), rows.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "empty"
  }, "No output records match the filters"))), edit && /*#__PURE__*/React.createElement(Modal, {
    open: true,
    title: edit._orig ? 'Edit Output' : 'Add Output',
    onClose: () => setEdit(null),
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "btn",
      onClick: () => setEdit(null)
    }, "Cancel"), /*#__PURE__*/React.createElement("button", {
      className: "btn pri",
      onClick: save
    }, "Save"))
  }, err && /*#__PURE__*/React.createElement("div", {
    className: "warn-bar",
    style: {
      marginBottom: 10
    }
  }, err), /*#__PURE__*/React.createElement("div", {
    className: "frow"
  }, /*#__PURE__*/React.createElement("label", null, "Hardware ID *"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: edit.hardware_id,
    onChange: e => setEdit({
      ...edit,
      hardware_id: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "frow"
  }, /*#__PURE__*/React.createElement("label", null, "Hardware Type *"), /*#__PURE__*/React.createElement("select", {
    value: edit.hw_type,
    onChange: e => setEdit({
      ...edit,
      hw_type: e.target.value
    })
  }, DB.price_settings.map(p => /*#__PURE__*/React.createElement("option", {
    key: p.hw_type
  }, p.hw_type)))), /*#__PURE__*/React.createElement("div", {
    className: "frow"
  }, /*#__PURE__*/React.createElement("label", null, "Activity *"), /*#__PURE__*/React.createElement("select", {
    value: edit.activity_category,
    onChange: e => setEdit({
      ...edit,
      activity_category: e.target.value
    })
  }, DB.VOCAB.activityCategory.map(a => /*#__PURE__*/React.createElement("option", {
    key: a
  }, a)))), /*#__PURE__*/React.createElement("div", {
    className: "frow"
  }, /*#__PURE__*/React.createElement("label", null, "Output Date"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: edit.output_date,
    onChange: e => setEdit({
      ...edit,
      output_date: e.target.value,
      workweek: window.WW.fromDate(new Date(e.target.value))
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "frow"
  }, /*#__PURE__*/React.createElement("label", null, "Workweek"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: edit.workweek,
    onChange: e => setEdit({
      ...edit,
      workweek: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "frow"
  }, /*#__PURE__*/React.createElement("label", null, "Engineer"), /*#__PURE__*/React.createElement("select", {
    value: edit.engineer_id || '',
    onChange: e => setEdit({
      ...edit,
      engineer_id: e.target.value
    })
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u2014"), DB.engineers.map(en => /*#__PURE__*/React.createElement("option", {
    key: en.id,
    value: en.id
  }, en.name)))), /*#__PURE__*/React.createElement("div", {
    className: "frow"
  }, /*#__PURE__*/React.createElement("label", null, "Qty"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: edit.qty,
    style: {
      width: 80
    },
    onChange: e => setEdit({
      ...edit,
      qty: e.target.value
    })
  }))));
}
window.OutputTab = OutputTab;

/* === tab-wip.jsx === */
// tab-wip.jsx — WIP inventory + snapshot + interactive trend/aging/donut (§8.5 + enhancements)
const {
  useState: useSw
} = React;
function blankWip() {
  const DB = window.STORE.DB;
  return {
    hardware_id: '',
    hw_type: DB.price_settings[0].hw_type,
    tx_category: DB.VOCAB.txCategory[0],
    status: 'Queued',
    debug_start: new Date().toISOString().slice(0, 10),
    debug_end: null,
    engineer_id: null,
    team: 'F2-LTX',
    notes: ''
  };
}
function ageColor(age, cfg) {
  const b = cfg.agingBuckets;
  const i = b.findIndex(x => age >= x[0] && age <= x[1]);
  return ['var(--accent-green)', 'var(--accent-gold)', '#ff9f43', 'var(--accent-red)'][i < 0 ? 3 : i];
}
const DONUT_DIMS = [{
  k: 'team',
  l: 'Focus Factory'
}, {
  k: 'status',
  l: 'Status'
}, {
  k: 'tx_category',
  l: 'Tester'
}, {
  k: 'hw_type',
  l: 'Hardware Type'
}];
function ItemsTable({
  items
}) {
  const E = window.ENGINE,
    cfg = window.STORE.DB.config;
  if (!items.length) return /*#__PURE__*/React.createElement("div", {
    className: "empty"
  }, "No items");
  return /*#__PURE__*/React.createElement("div", {
    className: "tbl-wrap",
    style: {
      maxHeight: 340
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "dt"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Hardware ID"), /*#__PURE__*/React.createElement("th", null, "Type"), /*#__PURE__*/React.createElement("th", null, "TX"), /*#__PURE__*/React.createElement("th", null, "Status"), /*#__PURE__*/React.createElement("th", null, "Start"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "Age"), /*#__PURE__*/React.createElement("th", null, "Team"))), /*#__PURE__*/React.createElement("tbody", null, items.map((w, i) => {
    const age = E.wipAge(w);
    return /*#__PURE__*/React.createElement("tr", {
      key: i
    }, /*#__PURE__*/React.createElement("td", {
      className: "mono"
    }, w.hardware_id), /*#__PURE__*/React.createElement("td", null, w.hw_type), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
      className: "tag"
    }, w.tx_category)), /*#__PURE__*/React.createElement("td", null, w.status), /*#__PURE__*/React.createElement("td", {
      className: "mono"
    }, w.debug_start || '—'), /*#__PURE__*/React.createElement("td", {
      className: "num",
      style: {
        color: ageColor(age, cfg),
        fontWeight: 600
      }
    }, age), /*#__PURE__*/React.createElement("td", {
      className: "muted-s"
    }, w.team));
  }))));
}
function WipTab() {
  useStore();
  const E = window.ENGINE,
    S = window.STORE,
    DB = S.DB,
    cfg = DB.config;
  const [edit, setEdit] = useSw(null);
  const [err, setErr] = useSw('');
  const [fStatus, setFStatus] = useSw('active');
  const [dim, setDim] = useSw('team');
  const [items, setItems] = useSw(null); // items modal {title, items, extra}
  const all = DB.wip_inventory;
  const active = E.activeWip();
  const snaps = DB.wip_snapshots || (DB.wip_snapshots = []);
  const shown = fStatus === 'active' ? active : fStatus === 'all' ? all : all.filter(w => w.status === fStatus);
  const ages = active.map(E.wipAge);
  const avg = ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;
  const oldest = ages.length ? Math.max(...ages) : 0;
  const overFlag = active.filter(w => E.wipAge(w) >= cfg.agingFlagDays).length;

  // aging buckets
  const buckets = cfg.agingBuckets.map(() => 0);
  active.forEach(w => buckets[E.agingBucket(E.wipAge(w))]++);
  const bucketLabels = cfg.agingBuckets.map(x => x[1] >= 9999 ? x[0] + '+ d' : x[0] + '–' + x[1] + ' d');
  const bucketColors = ['var(--accent-green)', 'var(--accent-gold)', '#ff9f43', 'var(--accent-red)'];
  // donut by dimension
  const groups = {};
  active.forEach(w => {
    const k = w[dim] || '—';
    groups[k] = (groups[k] || 0) + 1;
  });
  const dLabels = Object.keys(groups),
    dData = dLabels.map(l => groups[l]);
  // trend
  const tr = E.wipTrend(cfg.trendWindowWeekly);
  const save = () => {
    const w = edit;
    if (!w.hardware_id) {
      setErr('Hardware ID required');
      return;
    }
    const dup = DB.wip_inventory.find(x => x.hardware_id === w.hardware_id && x !== w._orig);
    if (dup) {
      setErr('Hardware ID must be unique');
      return;
    }
    if (w.debug_end && w.debug_start && w.debug_end < w.debug_start) {
      setErr('Debug end must be ≥ start');
      return;
    }
    if (w.engineer_id) {
      const e = DB.engineers.find(x => x.id === +w.engineer_id);
      if (e) w.team = e.team;
    }
    const rec = {
      id: w.hardware_id,
      hardware_id: w.hardware_id,
      hw_type: w.hw_type,
      tx_category: w.tx_category,
      status: w.status,
      debug_start: w.debug_start,
      debug_end: w.debug_end || null,
      engineer_id: w.engineer_id ? +w.engineer_id : null,
      team: w.team,
      notes: w.notes || ''
    };
    if (w._orig) Object.assign(w._orig, rec);else DB.wip_inventory.push(rec);
    S.persist('wip_inventory', rec);
    setEdit(null);
    setErr('');
    S.bump();
  };
  const del = w => {
    DB.wip_inventory = DB.wip_inventory.filter(x => x !== w);
    S.remove('wip_inventory', {
      hardware_id: w.hardware_id
    });
    S.saveLocal();
    S.bump();
  };
  const complete = w => {
    w.status = 'Completed';
    if (!w.debug_end) w.debug_end = new Date().toISOString().slice(0, 10);
    S.persist('wip_inventory', w);
    if (!DB.output_records.find(r => r.hardware_id === w.hardware_id)) {
      const rec = {
        id: w.hardware_id,
        hardware_id: w.hardware_id,
        hw_type: w.hw_type,
        activity_category: cfg.defaultActivityCategory,
        workweek: window.WW.fromDate(new Date()),
        output_date: new Date().toISOString().slice(0, 10),
        engineer_id: w.engineer_id || null,
        team: w.team,
        qty: 1,
        wip_id: w.id
      };
      DB.output_records.push(rec);
      S.persist('output_records', rec);
      S.toast('Logged output for ' + w.hardware_id);
    }
    S.bump();
  };
  const snap = () => {
    const row = E.snapshotNow();
    const ex = snaps.findIndex(s => s.period_key === row.period_key);
    if (ex >= 0) snaps[ex] = row;else snaps.push(row);
    S.persist('wip_snapshots', row);
    S.toast('Snapped ' + row.period_key + ' · ' + row.total_active + ' active WIP');
    S.bump();
  };
  const pickBucket = i => {
    const its = active.filter(w => E.agingBucket(E.wipAge(w)) === i);
    setItems({
      title: 'Aging bucket · ' + bucketLabels[i],
      items: its
    });
  };
  const pickSlice = label => {
    const its = active.filter(w => (w[dim] || '—') === label);
    const dimL = DONUT_DIMS.find(d => d.k === dim).l;
    setItems({
      title: dimL + ' · ' + label,
      items: its
    });
  };
  const pickWeek = i => {
    const ww = tr.periods[i];
    const its = E.wipActiveDuringWW(ww);
    const sn = snaps.find(s => s.period_key === ww);
    setItems({
      title: 'WIP active during ' + ww + (sn ? ' (snapped)' : ' (computed)'),
      items: its,
      snap: sn
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "view-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row between wrap",
    style: {
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "filters"
  }, /*#__PURE__*/React.createElement("button", {
    className: 'fchip' + (fStatus === 'active' ? ' active' : ''),
    onClick: () => setFStatus('active')
  }, "Active \xB7 ", active.length), /*#__PURE__*/React.createElement("button", {
    className: 'fchip' + (fStatus === 'all' ? ' active' : ''),
    onClick: () => setFStatus('all')
  }, "All \xB7 ", all.length), DB.VOCAB.wipStatus.map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    className: 'fchip' + (fStatus === s ? ' active' : ''),
    onClick: () => setFStatus(s)
  }, s))), /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: snap
  }, /*#__PURE__*/React.createElement(Icon, {
    d: I.clock,
    size: 13
  }), " Snap WIP \xB7 ", E.currentWW()), /*#__PURE__*/React.createElement("button", {
    className: "btn pri",
    onClick: () => {
      setErr('');
      setEdit(blankWip());
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    d: I.plus,
    size: 13
  }), " Add WIP"))), /*#__PURE__*/React.createElement("div", {
    className: "grid g-4"
  }, /*#__PURE__*/React.createElement(Tile, {
    label: "Active WIP",
    value: active.length,
    accent: "var(--accent-purple)"
  }), /*#__PURE__*/React.createElement(Tile, {
    label: "Avg Age (days)",
    value: avg
  }), /*#__PURE__*/React.createElement(Tile, {
    label: "Oldest (days)",
    value: oldest,
    accent: oldest >= cfg.agingFlagDays ? 'var(--accent-red)' : null
  }), /*#__PURE__*/React.createElement(Tile, {
    label: 'Over ' + cfg.agingFlagDays + 'd',
    value: overFlag,
    accent: overFlag ? 'var(--accent-gold)' : null
  })), /*#__PURE__*/React.createElement(Panel, {
    title: "WIP Trend per Workweek",
    icon: I.pulse,
    sub: 'snapped where available · ' + tr.hasSnap.filter(Boolean).length + '/' + tr.periods.length + ' weeks snapped',
    right: /*#__PURE__*/React.createElement("span", {
      className: "muted-s"
    }, "click a week to inspect")
  }, /*#__PURE__*/React.createElement(WipTrend, {
    labels: tr.labels,
    total: tr.totals,
    aged: tr.aged,
    onPick: pickWeek,
    h: 260
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid g-2"
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Aging Distribution",
    icon: I.clock,
    sub: "active WIP \xB7 click a bar"
  }, /*#__PURE__*/React.createElement(ClickBars, {
    labels: bucketLabels,
    data: buckets,
    colors: bucketColors,
    onPick: pickBucket,
    h: 300
  })), /*#__PURE__*/React.createElement(Panel, {
    title: "WIP Breakdown",
    icon: I.layers,
    right: /*#__PURE__*/React.createElement(Seg, {
      value: dim,
      options: DONUT_DIMS,
      onChange: setDim
    })
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      gap: 16,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 55%',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(Donut, {
    labels: dLabels,
    data: dData,
    onPick: pickSlice,
    h: 260
  })), /*#__PURE__*/React.createElement("div", {
    className: "dim-legend",
    style: {
      flex: '1 1 40%'
    }
  }, dLabels.map((l, i) => /*#__PURE__*/React.createElement("div", {
    key: l,
    className: "li",
    onClick: () => pickSlice(l)
  }, /*#__PURE__*/React.createElement("span", {
    className: "sw",
    style: {
      background: window.PALETTE[i % window.PALETTE.length]
    }
  }), l, /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, dData[i]))), dLabels.length === 0 && /*#__PURE__*/React.createElement("span", {
    className: "muted-s"
  }, "No active WIP"))))), /*#__PURE__*/React.createElement(Panel, {
    title: "WIP Inventory",
    icon: I.box,
    sub: shown.length + ' shown',
    pad: false
  }, /*#__PURE__*/React.createElement("div", {
    className: "tbl-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "dt"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Hardware ID"), /*#__PURE__*/React.createElement("th", null, "Type"), /*#__PURE__*/React.createElement("th", null, "TX"), /*#__PURE__*/React.createElement("th", null, "Status"), /*#__PURE__*/React.createElement("th", null, "Start"), /*#__PURE__*/React.createElement("th", null, "End"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "Age"), /*#__PURE__*/React.createElement("th", null, "Eng/Team"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, shown.map((w, i) => {
    const age = E.wipAge(w);
    return /*#__PURE__*/React.createElement("tr", {
      key: i
    }, /*#__PURE__*/React.createElement("td", {
      className: "mono"
    }, w.hardware_id), /*#__PURE__*/React.createElement("td", null, w.hw_type), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
      className: "tag"
    }, w.tx_category)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
      className: 'tag ' + (w.status === 'Completed' ? 'green' : w.status === 'Scrapped' ? 'red' : w.status === 'In Debug' ? 'teal' : 'gold')
    }, w.status)), /*#__PURE__*/React.createElement("td", {
      className: "mono"
    }, w.debug_start || '—'), /*#__PURE__*/React.createElement("td", {
      className: "mono"
    }, w.debug_end || '—'), /*#__PURE__*/React.createElement("td", {
      className: "num",
      style: {
        color: ageColor(age, cfg),
        fontWeight: 600
      }
    }, age), /*#__PURE__*/React.createElement("td", {
      className: "muted-s"
    }, w.team), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn sm",
      onClick: () => {
        setErr('');
        setEdit(Object.assign({}, w, {
          _orig: w
        }));
      }
    }, "Edit"), w.status !== 'Completed' && w.status !== 'Scrapped' && /*#__PURE__*/React.createElement("button", {
      className: "btn sm pri",
      onClick: () => complete(w)
    }, "Complete"), /*#__PURE__*/React.createElement("button", {
      className: "btn sm danger",
      onClick: () => del(w)
    }, "\u2715"))));
  }))), shown.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "empty"
  }, "No WIP items"))), edit && /*#__PURE__*/React.createElement(Modal, {
    open: true,
    title: edit._orig ? 'Edit WIP' : 'Add WIP',
    onClose: () => setEdit(null),
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "btn",
      onClick: () => setEdit(null)
    }, "Cancel"), /*#__PURE__*/React.createElement("button", {
      className: "btn pri",
      onClick: save
    }, "Save"))
  }, err && /*#__PURE__*/React.createElement("div", {
    className: "warn-bar",
    style: {
      marginBottom: 10
    }
  }, err), /*#__PURE__*/React.createElement("div", {
    className: "frow"
  }, /*#__PURE__*/React.createElement("label", null, "Hardware ID *"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: edit.hardware_id,
    onChange: e => setEdit({
      ...edit,
      hardware_id: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "frow"
  }, /*#__PURE__*/React.createElement("label", null, "Hardware Type *"), /*#__PURE__*/React.createElement("select", {
    value: edit.hw_type,
    onChange: e => setEdit({
      ...edit,
      hw_type: e.target.value
    })
  }, DB.price_settings.map(p => /*#__PURE__*/React.createElement("option", {
    key: p.hw_type
  }, p.hw_type)))), /*#__PURE__*/React.createElement("div", {
    className: "frow"
  }, /*#__PURE__*/React.createElement("label", null, "TX Category *"), /*#__PURE__*/React.createElement("select", {
    value: edit.tx_category,
    onChange: e => setEdit({
      ...edit,
      tx_category: e.target.value
    })
  }, DB.VOCAB.txCategory.map(t => /*#__PURE__*/React.createElement("option", {
    key: t
  }, t)))), /*#__PURE__*/React.createElement("div", {
    className: "frow"
  }, /*#__PURE__*/React.createElement("label", null, "Status"), /*#__PURE__*/React.createElement("select", {
    value: edit.status,
    onChange: e => setEdit({
      ...edit,
      status: e.target.value
    })
  }, DB.VOCAB.wipStatus.map(s => /*#__PURE__*/React.createElement("option", {
    key: s
  }, s)))), /*#__PURE__*/React.createElement("div", {
    className: "frow"
  }, /*#__PURE__*/React.createElement("label", null, "Debug Start"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: edit.debug_start || '',
    onChange: e => setEdit({
      ...edit,
      debug_start: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "frow"
  }, /*#__PURE__*/React.createElement("label", null, "Debug End"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: edit.debug_end || '',
    onChange: e => setEdit({
      ...edit,
      debug_end: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "frow"
  }, /*#__PURE__*/React.createElement("label", null, "Engineer"), /*#__PURE__*/React.createElement("select", {
    value: edit.engineer_id || '',
    onChange: e => setEdit({
      ...edit,
      engineer_id: e.target.value
    })
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u2014"), DB.engineers.map(en => /*#__PURE__*/React.createElement("option", {
    key: en.id,
    value: en.id
  }, en.name)))), /*#__PURE__*/React.createElement("div", {
    className: "frow"
  }, /*#__PURE__*/React.createElement("label", null, "Notes"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: edit.notes || '',
    onChange: e => setEdit({
      ...edit,
      notes: e.target.value
    })
  }))), items && /*#__PURE__*/React.createElement(Modal, {
    open: true,
    title: items.title,
    onClose: () => setItems(null),
    footer: /*#__PURE__*/React.createElement("button", {
      className: "btn",
      onClick: () => setItems(null)
    }, "Close")
  }, items.snap && /*#__PURE__*/React.createElement("div", {
    className: "row wrap",
    style: {
      gap: 6,
      marginBottom: 10
    }
  }, Object.entries(items.snap.by_status || {}).map(([k, v]) => /*#__PURE__*/React.createElement("span", {
    key: k,
    className: "tag teal"
  }, k, ": ", v))), /*#__PURE__*/React.createElement(ItemsTable, {
    items: items.items
  })));
}
window.WipTab = WipTab;

/* === tab-manpower.jsx === */
// tab-manpower.jsx — manning capacity + shift calendar (§8.6)
const {
  useState: useSm
} = React;
function Manpower() {
  useStore();
  const E = window.ENGINE,
    S = window.STORE,
    DB = S.DB,
    cfg = DB.config;
  const man = E.manning();
  const teams = Object.keys(man.teams);
  // 14-day window from schedule_entries
  const dates = [...new Set(DB.schedule_entries.map(s => s.schedule_date))].sort();
  const engs = DB.engineers.filter(e => !e.resigned);
  const codeOf = (id, d) => {
    const s = DB.schedule_entries.find(x => x.engineer_id === id && x.schedule_date === d);
    return s ? s.code : '';
  };
  const setCode = (id, d, code) => {
    let s = DB.schedule_entries.find(x => x.engineer_id === id && x.schedule_date === d);
    if (code === '') {
      if (s) {
        DB.schedule_entries = DB.schedule_entries.filter(x => x !== s);
        S.remove('schedule_entries', {
          engineer_id: id,
          schedule_date: d
        });
      }
    } else {
      if (!s) {
        s = {
          engineer_id: id,
          schedule_date: d,
          code
        };
        DB.schedule_entries.push(s);
      } else s.code = code;
      S.persist('schedule_entries', s);
    }
    S.saveLocal();
    S.bump();
  };
  const shiftColor = {
    DS: 'var(--accent-gold)',
    NS: 'var(--accent-blue)',
    NT: 'var(--accent-purple)',
    VL: 'var(--fg-4)',
    RD: 'var(--fg-4)'
  };
  const setTarget = (team, val) => {
    let m = DB.manning_targets.find(x => x.team === team);
    if (!m) {
      m = {
        team,
        target: 0
      };
      DB.manning_targets.push(m);
    }
    m.target = Math.max(0, parseInt(val || 0, 10));
    S.saveLocal();
    S.bump();
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "view-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid g-4"
  }, /*#__PURE__*/React.createElement(Tile, {
    label: "Overall Fill",
    value: man.fill + '%',
    accent: man.fill >= cfg.manningGreenPct ? 'var(--accent-green)' : man.fill >= cfg.manningYellowPct ? 'var(--accent-gold)' : 'var(--accent-red)'
  }), /*#__PURE__*/React.createElement(Tile, {
    label: "Headcount",
    value: man.cur
  }), /*#__PURE__*/React.createElement(Tile, {
    label: "Target HC",
    value: man.target
  }), /*#__PURE__*/React.createElement(Tile, {
    label: "Teams",
    value: teams.length
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid g-2-1"
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Capacity by Team",
    icon: I.users,
    sub: "current vs target HC"
  }, /*#__PURE__*/React.createElement(ManningBars, {
    teams: teams,
    cur: teams.map(t => man.teams[t].cur),
    target: teams.map(t => man.teams[t].target),
    h: 240
  })), /*#__PURE__*/React.createElement(Panel, {
    title: "Targets",
    icon: I.target,
    pad: false
  }, /*#__PURE__*/React.createElement("table", {
    className: "dt"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Team"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "HC"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "Target"))), /*#__PURE__*/React.createElement("tbody", null, teams.map(t => /*#__PURE__*/React.createElement("tr", {
    key: t
  }, /*#__PURE__*/React.createElement("td", null, t), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, man.teams[t].cur), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: man.teams[t].target || 0,
    style: {
      width: 64,
      textAlign: 'right'
    },
    onChange: e => setTarget(t, e.target.value)
  })))))))), /*#__PURE__*/React.createElement(Panel, {
    title: "Shift Schedule",
    icon: I.cal,
    sub: dates.length + '-day window',
    pad: false
  }, /*#__PURE__*/React.createElement("div", {
    className: "tbl-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "dt"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      position: 'sticky',
      left: 0,
      background: 'var(--panel)',
      zIndex: 2
    }
  }, "Engineer"), dates.map(d => /*#__PURE__*/React.createElement("th", {
    key: d,
    className: "num"
  }, d.slice(5))))), /*#__PURE__*/React.createElement("tbody", null, engs.map(e => /*#__PURE__*/React.createElement("tr", {
    key: e.id
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      position: 'sticky',
      left: 0,
      background: 'var(--panel)'
    }
  }, e.name), dates.map(d => {
    const c = codeOf(e.id, d);
    return /*#__PURE__*/React.createElement("td", {
      key: d,
      className: "num",
      style: {
        padding: 2
      }
    }, /*#__PURE__*/React.createElement("select", {
      value: c,
      onChange: ev => setCode(e.id, d, ev.target.value),
      style: {
        width: 54,
        padding: '3px',
        color: shiftColor[c] || 'var(--fg-3)',
        fontWeight: c ? 600 : 400
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }), DB.VOCAB.shiftCodes.map(s => /*#__PURE__*/React.createElement("option", {
      key: s,
      value: s
    }, s))));
  }))))))));
}
window.Manpower = Manpower;

/* === tab-skills.jsx === */
// tab-skills.jsx — platform experience ratings + competency (§8.7)
function Skills() {
  useStore();
  const E = window.ENGINE,
    S = window.STORE,
    DB = S.DB,
    cfg = DB.config;
  const plats = DB.PLAT || ['Testcard', 'Faceplate', 'Perfboard', 'Handler/Ins'];
  const engs = DB.engineers.filter(e => !e.resigned);
  const ratingOf = (id, pl) => {
    const r = DB.platform_ratings.find(x => x.engineer_id === id && x.platform === pl);
    return r ? r.rating : 0;
  };
  const setRating = (id, pl, v) => {
    let r = DB.platform_ratings.find(x => x.engineer_id === id && x.platform === pl);
    const n = Math.max(0, Math.min(3, parseInt(v || 0, 10)));
    if (!r) {
      r = {
        engineer_id: id,
        platform: pl,
        rating: n
      };
      DB.platform_ratings.push(r);
    } else r.rating = n;
    S.persist('platform_ratings', r);
    S.bump();
  };
  const ci = E.competencyIndex();
  const platAvg = plats.map(pl => {
    const rs = DB.platform_ratings.filter(r => r.platform === pl);
    return rs.length ? +(rs.reduce((s, r) => s + r.rating, 0) / rs.length).toFixed(2) : 0;
  });
  const ciCls = ci >= cfg.competencyGreen ? 'var(--accent-green)' : ci >= cfg.competencyYellow ? 'var(--accent-gold)' : 'var(--accent-red)';
  return /*#__PURE__*/React.createElement("div", {
    className: "view-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "callout"
  }, "Ratings are a ", /*#__PURE__*/React.createElement("b", null, "platform experience index"), " (0\u20133) seeded from real output volume per build type \u2014 not an HR skills assessment. Edit freely; competency derives from the mean."), /*#__PURE__*/React.createElement("div", {
    className: "grid g-3"
  }, /*#__PURE__*/React.createElement(Tile, {
    label: "Competency Index",
    value: ci.toFixed(2) + ' /3',
    accent: ciCls
  }), /*#__PURE__*/React.createElement(Tile, {
    label: "% of Max",
    value: Math.round(ci / 3 * 100) + '%'
  }), /*#__PURE__*/React.createElement(Tile, {
    label: "Active Engineers",
    value: engs.length
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid g-2-1"
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Platform Ratings",
    icon: I.layers,
    sub: "0\u20133 scale",
    pad: false
  }, /*#__PURE__*/React.createElement("div", {
    className: "tbl-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "dt"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      position: 'sticky',
      left: 0,
      background: 'var(--panel)'
    }
  }, "Engineer"), plats.map(p => /*#__PURE__*/React.createElement("th", {
    key: p,
    className: "num"
  }, p)), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "Avg"))), /*#__PURE__*/React.createElement("tbody", null, engs.map(e => {
    const avg = E.avgRating(e.id);
    return /*#__PURE__*/React.createElement("tr", {
      key: e.id
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        position: 'sticky',
        left: 0,
        background: 'var(--panel)'
      }
    }, e.name), plats.map(pl => /*#__PURE__*/React.createElement("td", {
      key: pl,
      className: "num",
      style: {
        padding: 2
      }
    }, /*#__PURE__*/React.createElement("select", {
      value: ratingOf(e.id, pl),
      onChange: ev => setRating(e.id, pl, ev.target.value),
      style: {
        width: 48,
        padding: 3
      }
    }, [0, 1, 2, 3].map(n => /*#__PURE__*/React.createElement("option", {
      key: n
    }, n))))), /*#__PURE__*/React.createElement("td", {
      className: "num",
      style: {
        fontWeight: 600
      }
    }, avg.toFixed(2)));
  }))))), /*#__PURE__*/React.createElement(Panel, {
    title: "Competency Radar",
    icon: I.star,
    sub: "avg by platform"
  }, /*#__PURE__*/React.createElement(CompetencyRadar, {
    axes: plats,
    values: platAvg,
    h: 250
  }))));
}
window.Skills = Skills;

/* === tab-people.jsx === */
// tab-people.jsx — roster CRUD (§8.8, Appendix B applied in seed)
const {
  useState: useSp
} = React;
function tenure(hired, resigned) {
  if (!hired) return '—';
  const a = new Date(hired),
    b = resigned ? new Date(resigned) : new Date();
  const mo = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  return (mo / 12).toFixed(1) + ' yr';
}
function blankEng() {
  return {
    id: '',
    no: '',
    last: '',
    first: '',
    name: '',
    pos: 'Engineer1',
    team: 'F2-LTX',
    hired: new Date().toISOString().slice(0, 10),
    resigned: null,
    status: 'PROBI'
  };
}
function People() {
  useStore();
  const S = window.STORE,
    DB = S.DB;
  const [edit, setEdit] = useSp(null);
  const [err, setErr] = useSp('');
  const rows = [...DB.engineers].sort((a, b) => a.team.localeCompare(b.team) || a.last.localeCompare(b.last));
  const save = () => {
    const e = edit;
    if (!e.id || !e.last) {
      setErr('Employee # and last name required');
      return;
    }
    e.id = +e.id;
    e.no = String(e.id);
    e.name = e.last + ', ' + e.first;
    if (e._orig) Object.assign(e._orig, e);else {
      if (DB.engineers.find(x => x.id === e.id)) {
        setErr('Employee # exists');
        return;
      }
      DB.engineers.push(e);
    }
    delete e._orig;
    S.persist('engineers', {
      id: e.id,
      no: e.no,
      last: e.last,
      first: e.first,
      name: e.name,
      pos: e.pos,
      team: e.team,
      hired: e.hired,
      resigned: e.resigned,
      status: e.status
    });
    setEdit(null);
    setErr('');
    S.bump();
  };
  const del = e => {
    DB.engineers = DB.engineers.filter(x => x !== e);
    S.remove('engineers', {
      id: e.id
    });
    S.saveLocal();
    S.bump();
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "view-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row between"
  }, /*#__PURE__*/React.createElement("div", {
    className: "muted-s"
  }, rows.length, " engineers \xB7 ", rows.filter(e => e.status === 'PROBI').length, " probationary"), /*#__PURE__*/React.createElement("button", {
    className: "btn pri",
    onClick: () => {
      setErr('');
      setEdit(blankEng());
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    d: I.plus,
    size: 13
  }), " Add Engineer")), /*#__PURE__*/React.createElement(Panel, {
    title: "Roster",
    icon: I.users,
    pad: false
  }, /*#__PURE__*/React.createElement("div", {
    className: "tbl-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "dt"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Emp #"), /*#__PURE__*/React.createElement("th", null, "Name"), /*#__PURE__*/React.createElement("th", null, "Position"), /*#__PURE__*/React.createElement("th", null, "Team"), /*#__PURE__*/React.createElement("th", null, "Hired"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "Tenure"), /*#__PURE__*/React.createElement("th", null, "Status"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, rows.map(e => /*#__PURE__*/React.createElement("tr", {
    key: e.id
  }, /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, e.no), /*#__PURE__*/React.createElement("td", null, e.name), /*#__PURE__*/React.createElement("td", null, e.pos), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "tag teal"
  }, e.team)), /*#__PURE__*/React.createElement("td", {
    className: "mono"
  }, e.hired), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, tenure(e.hired, e.resigned)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: 'tag ' + (e.status === 'PROBI' ? 'gold' : 'green')
  }, e.status)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn sm",
    onClick: () => {
      setErr('');
      setEdit(Object.assign({}, e, {
        _orig: e
      }));
    }
  }, "Edit"), /*#__PURE__*/React.createElement("button", {
    className: "btn sm danger",
    onClick: () => del(e)
  }, "\u2715"))))))))), edit && /*#__PURE__*/React.createElement(Modal, {
    open: true,
    title: edit._orig ? 'Edit Engineer' : 'Add Engineer',
    onClose: () => setEdit(null),
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "btn",
      onClick: () => setEdit(null)
    }, "Cancel"), /*#__PURE__*/React.createElement("button", {
      className: "btn pri",
      onClick: save
    }, "Save"))
  }, err && /*#__PURE__*/React.createElement("div", {
    className: "warn-bar",
    style: {
      marginBottom: 10
    }
  }, err), /*#__PURE__*/React.createElement("div", {
    className: "frow"
  }, /*#__PURE__*/React.createElement("label", null, "Employee # *"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: edit.id,
    disabled: !!edit._orig,
    onChange: e => setEdit({
      ...edit,
      id: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "frow"
  }, /*#__PURE__*/React.createElement("label", null, "Last name *"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: edit.last,
    onChange: e => setEdit({
      ...edit,
      last: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "frow"
  }, /*#__PURE__*/React.createElement("label", null, "First name"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: edit.first,
    onChange: e => setEdit({
      ...edit,
      first: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "frow"
  }, /*#__PURE__*/React.createElement("label", null, "Position"), /*#__PURE__*/React.createElement("select", {
    value: edit.pos,
    onChange: e => setEdit({
      ...edit,
      pos: e.target.value
    })
  }, DB.VOCAB.roles.map(r => /*#__PURE__*/React.createElement("option", {
    key: r
  }, r)))), /*#__PURE__*/React.createElement("div", {
    className: "frow"
  }, /*#__PURE__*/React.createElement("label", null, "Team"), /*#__PURE__*/React.createElement("select", {
    value: edit.team,
    onChange: e => setEdit({
      ...edit,
      team: e.target.value
    })
  }, DB.VOCAB.teams.map(t => /*#__PURE__*/React.createElement("option", {
    key: t
  }, t)))), /*#__PURE__*/React.createElement("div", {
    className: "frow"
  }, /*#__PURE__*/React.createElement("label", null, "Hired"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: edit.hired,
    onChange: e => setEdit({
      ...edit,
      hired: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "frow"
  }, /*#__PURE__*/React.createElement("label", null, "Status"), /*#__PURE__*/React.createElement("select", {
    value: edit.status,
    onChange: e => setEdit({
      ...edit,
      status: e.target.value
    })
  }, /*#__PURE__*/React.createElement("option", null, "Regular"), /*#__PURE__*/React.createElement("option", null, "PROBI")))));
}
window.People = People;

/* === tab-import.jsx === */
// tab-import.jsx — Excel/CSV import with column mapping, overwrite, feedback (§8.9)
const {
  useState: useSi,
  useRef: useRi
} = React;
const ENT_FIELDS = {
  output_records: {
    label: 'Output Records',
    req: ['hardware_id'],
    fields: ['hardware_id', 'hw_type', 'activity_category', 'workweek', 'output_date', 'engineer_id', 'team', 'qty']
  },
  wip_inventory: {
    label: 'WIP Inventory',
    req: ['hardware_id'],
    fields: ['hardware_id', 'hw_type', 'tx_category', 'status', 'debug_start', 'debug_end', 'engineer_id', 'team', 'notes']
  },
  output_targets: {
    label: 'Output Targets',
    req: ['period_key', 'hw_type'],
    fields: ['period_type', 'period_key', 'plan_type', 'hw_type', 'team', 'target_count']
  },
  engineers: {
    label: 'Roster',
    req: ['id'],
    fields: ['id', 'last', 'first', 'pos', 'team', 'hired', 'status']
  }
};
const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
function autoMap(fields, cols) {
  const m = {};
  fields.forEach(f => {
    const nf = norm(f);
    let hit = cols.find(c => norm(c) === nf) || cols.find(c => norm(c).includes(nf) || nf.includes(norm(c)));
    m[f] = hit || '';
  });
  return m;
}
function ImportTab() {
  useStore();
  const S = window.STORE,
    DB = S.DB;
  const [entity, setEntity] = useSi('output_records');
  const [log, setLog] = useSi([]);
  const [preview, setPreview] = useSi(null);
  const [map, setMap] = useSi({});
  const [overwrite, setOverwrite] = useSi(false);
  const fileRef = useRi(null);
  const spec = ENT_FIELDS[entity];
  const addLog = (m, ok) => setLog(l => [{
    m,
    ok,
    t: new Date().toLocaleTimeString()
  }, ...l].slice(0, 40));
  const onFile = f => {
    if (!f) return;
    if (typeof XLSX === 'undefined') {
      addLog('SheetJS not loaded — cannot parse', false);
      S.toast('SheetJS not loaded');
      return;
    }
    const rd = new FileReader();
    rd.onload = ev => {
      try {
        const wb = XLSX.read(ev.target.result, {
          type: 'array'
        });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, {
          defval: ''
        });
        const cols = Object.keys(rows[0] || {});
        setPreview({
          cols,
          rows,
          sheet: wb.SheetNames[0],
          file: f.name
        });
        setMap(autoMap(spec.fields, cols));
        addLog('Read ' + rows.length + ' rows from "' + wb.SheetNames[0] + '" (' + f.name + ')', true);
      } catch (e) {
        addLog('Parse error: ' + e.message, false);
      }
    };
    rd.readAsArrayBuffer(f);
  };
  const reMap = ent => {
    setEntity(ent);
    if (preview) setMap(autoMap(ENT_FIELDS[ent].fields, preview.cols));
  };
  const commit = () => {
    if (!preview) {
      S.toast('Nothing to import');
      return;
    }
    const missingReq = spec.req.filter(r => !map[r]);
    if (missingReq.length) {
      addLog('Map required column(s): ' + missingReq.join(', '), false);
      S.toast('Map required: ' + missingReq.join(', '));
      return;
    }
    const g = (row, f) => {
      const c = map[f];
      return c ? row[c] : '';
    };
    let added = 0,
      updated = 0,
      skipDup = 0,
      skipBad = 0;
    const handle = (arr, keyName, keyVal, rec) => {
      const ex = arr.find(x => x[keyName] === keyVal);
      if (ex) {
        if (overwrite) {
          Object.assign(ex, rec);
          S.persist(arr === DB.output_records ? 'output_records' : arr === DB.wip_inventory ? 'wip_inventory' : 'engineers', ex);
          updated++;
        } else skipDup++;
        return;
      }
      arr.push(rec);
      S.persist(arr === DB.output_records ? 'output_records' : arr === DB.wip_inventory ? 'wip_inventory' : 'engineers', rec);
      added++;
    };
    preview.rows.forEach(r => {
      try {
        if (entity === 'output_records') {
          const hid = String(g(r, 'hardware_id') || '').trim();
          if (!hid) {
            skipBad++;
            return;
          }
          const rec = {
            id: hid,
            hardware_id: hid,
            hw_type: g(r, 'hw_type') || 'Other',
            activity_category: g(r, 'activity_category') || DB.config.defaultActivityCategory,
            workweek: g(r, 'workweek') || '',
            output_date: g(r, 'output_date') || '',
            engineer_id: g(r, 'engineer_id') ? +g(r, 'engineer_id') : null,
            team: g(r, 'team') || '',
            qty: +g(r, 'qty') || 1
          };
          if (!rec.output_date && rec.workweek) {
            try {
              rec.output_date = window.WW.toDate(rec.workweek).toISOString().slice(0, 10);
            } catch (e) {}
          }
          handle(DB.output_records, 'hardware_id', hid, rec);
        } else if (entity === 'wip_inventory') {
          const hid = String(g(r, 'hardware_id') || '').trim();
          if (!hid) {
            skipBad++;
            return;
          }
          const rec = {
            id: hid,
            hardware_id: hid,
            hw_type: g(r, 'hw_type') || 'Other',
            tx_category: g(r, 'tx_category') || '',
            status: g(r, 'status') || 'Queued',
            debug_start: g(r, 'debug_start') || '',
            debug_end: g(r, 'debug_end') || null,
            engineer_id: g(r, 'engineer_id') ? +g(r, 'engineer_id') : null,
            team: g(r, 'team') || '',
            notes: g(r, 'notes') || ''
          };
          handle(DB.wip_inventory, 'hardware_id', hid, rec);
        } else if (entity === 'output_targets') {
          const pk = String(g(r, 'period_key') || '').trim(),
            hw = g(r, 'hw_type');
          if (!pk || !hw) {
            skipBad++;
            return;
          }
          const ptype = g(r, 'period_type') || 'monthly',
            plan = g(r, 'plan_type') || 'budget',
            team = g(r, 'team') || 'ALL';
          const ex = DB.output_targets.find(t => t.period_type === ptype && t.period_key === pk && t.plan_type === plan && t.hw_type === hw && t.team === team);
          const rec = {
            id: plan + '-' + pk + '-' + hw + '-' + team,
            period_type: ptype,
            period_key: pk,
            plan_type: plan,
            hw_type: hw,
            team,
            target_count: +g(r, 'target_count') || 0
          };
          if (ex) {
            if (overwrite) {
              Object.assign(ex, rec);
              S.persist('output_targets', ex);
              updated++;
            } else skipDup++;
          } else {
            DB.output_targets.push(rec);
            S.persist('output_targets', rec);
            added++;
          }
        } else if (entity === 'engineers') {
          const id = +g(r, 'id');
          if (!id) {
            skipBad++;
            return;
          }
          const rec = {
            id,
            no: String(id),
            last: g(r, 'last') || '',
            first: g(r, 'first') || '',
            name: (g(r, 'last') || '') + ', ' + (g(r, 'first') || ''),
            pos: g(r, 'pos') || 'Engineer1',
            team: g(r, 'team') || '',
            hired: g(r, 'hired') || '',
            resigned: null,
            status: g(r, 'status') || 'Regular'
          };
          handle(DB.engineers, 'id', id, rec);
        }
      } catch (e) {
        skipBad++;
      }
    });
    const msg = 'Committed ' + added + (updated ? ' · ' + updated + ' updated' : '') + (skipDup ? ' · ' + skipDup + ' dup skipped' : '') + (skipBad ? ' · ' + skipBad + ' invalid' : '') + ' (' + spec.label + ')';
    addLog(msg, added + updated > 0);
    S.toast(msg);
    setPreview(null);
    S.saveLocal();
    S.bump();
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "view-inner"
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Import Data",
    icon: I.upload,
    sub: "Excel / CSV via SheetJS"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row wrap",
    style: {
      gap: 10,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "muted-s"
  }, "Map sheet to:"), /*#__PURE__*/React.createElement("select", {
    value: entity,
    onChange: e => reMap(e.target.value)
  }, Object.entries(ENT_FIELDS).map(([k, v]) => /*#__PURE__*/React.createElement("option", {
    key: k,
    value: k
  }, v.label))), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => fileRef.current.click()
  }, "Choose file\u2026"), /*#__PURE__*/React.createElement("input", {
    ref: fileRef,
    type: "file",
    accept: ".xlsx,.xls,.csv",
    style: {
      display: 'none'
    },
    onChange: e => {
      onFile(e.target.files[0]);
      e.target.value = '';
    }
  }), /*#__PURE__*/React.createElement("label", {
    className: "row",
    style: {
      gap: 6,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: overwrite,
    onChange: e => setOverwrite(e.target.checked)
  }), /*#__PURE__*/React.createElement("span", {
    className: "muted-s"
  }, "Overwrite existing")), preview && /*#__PURE__*/React.createElement("button", {
    className: "btn pri",
    onClick: commit
  }, "Commit ", preview.rows.length, " rows")), !preview && /*#__PURE__*/React.createElement("div", {
    className: "callout"
  }, "Pick the target entity, choose a file, then confirm the ", /*#__PURE__*/React.createElement("b", null, "column mapping"), ". Headers are matched automatically; adjust any that didn't. With ", /*#__PURE__*/React.createElement("b", null, "Overwrite existing"), " off, duplicate IDs are skipped; on, they update the existing record."), preview && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "panel inset",
    style: {
      padding: 12,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "muted-s",
    style: {
      marginBottom: 8
    }
  }, "Column mapping \u2014 ", /*#__PURE__*/React.createElement("b", null, preview.file), " \xB7 sheet \"", preview.sheet, "\" \xB7 ", preview.rows.length, " rows \xB7 ", overwrite ? 'overwrite ON' : 'skip duplicates'), /*#__PURE__*/React.createElement("div", {
    className: "grid g-3"
  }, spec.fields.map(f => /*#__PURE__*/React.createElement("div", {
    key: f,
    className: "frow",
    style: {
      gridTemplateColumns: '1fr',
      gap: 4,
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("label", null, f, spec.req.includes(f) && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent-red)'
    }
  }, " *")), /*#__PURE__*/React.createElement("select", {
    value: map[f] || '',
    onChange: e => setMap({
      ...map,
      [f]: e.target.value
    })
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u2014 none \u2014"), preview.cols.map(c => /*#__PURE__*/React.createElement("option", {
    key: c,
    value: c
  }, c))))))), /*#__PURE__*/React.createElement("div", {
    className: "tbl-wrap",
    style: {
      maxHeight: 260
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "dt"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, preview.cols.map(c => /*#__PURE__*/React.createElement("th", {
    key: c
  }, c)))), /*#__PURE__*/React.createElement("tbody", null, preview.rows.slice(0, 20).map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, preview.cols.map(c => /*#__PURE__*/React.createElement("td", {
    key: c
  }, String(r[c])))))))))), /*#__PURE__*/React.createElement(Panel, {
    title: "Import Log",
    icon: I.layers,
    pad: false
  }, log.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "empty"
  }, "No imports yet") : /*#__PURE__*/React.createElement("table", {
    className: "dt"
  }, /*#__PURE__*/React.createElement("tbody", null, log.map((l, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    className: "mono muted-s",
    style: {
      width: 90
    }
  }, l.t), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: 'tag ' + (l.ok ? 'green' : 'red')
  }, l.ok ? 'ok' : 'note')), /*#__PURE__*/React.createElement("td", null, l.m)))))));
}
window.ImportTab = ImportTab;

/* === tab-settings.jsx === */
// tab-settings.jsx — Supabase connect + migration SQL + sync + config params (§8.10, §10)
const {
  useState: useSs
} = React;
const MIGRATION_SQL = `-- ERTI Debug Nerve Center — Supabase migration (self-contained, runs on a fresh project)
-- Creates retained tables first so foreign keys resolve, then the new tables.

CREATE TABLE IF NOT EXISTS engineers (
  id int PRIMARY KEY, no text, last text, first text, name text,
  pos text, team text, hired date, resigned date, status text);

CREATE TABLE IF NOT EXISTS price_settings (
  hw_type text PRIMARY KEY, price numeric DEFAULT 0, placeholder boolean DEFAULT false);

CREATE TABLE IF NOT EXISTS team_budgets (
  team text, period_key text, budget numeric DEFAULT 0, forecast numeric DEFAULT 0,
  PRIMARY KEY (team, period_key));

CREATE TABLE IF NOT EXISTS manning_targets (
  team text PRIMARY KEY, target int DEFAULT 0);

CREATE TABLE IF NOT EXISTS platform_ratings (
  engineer_id int, platform text, rating int DEFAULT 0,
  PRIMARY KEY (engineer_id, platform));

CREATE TABLE IF NOT EXISTS schedule_entries (
  engineer_id int, schedule_date date, code text,
  PRIMARY KEY (engineer_id, schedule_date));

CREATE TABLE IF NOT EXISTS app_settings (
  id int PRIMARY KEY DEFAULT 1, data jsonb);

-- ── new / changed tables ──
CREATE TABLE IF NOT EXISTS output_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hardware_id text UNIQUE NOT NULL, hw_type text, activity_category text,
  workweek text, output_date date, engineer_id int REFERENCES engineers(id),
  team text, wip_id uuid, qty int DEFAULT 1,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());

CREATE TABLE IF NOT EXISTS wip_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hardware_id text UNIQUE NOT NULL, hw_type text, tx_category text,
  status text DEFAULT 'Queued', debug_start date, debug_end date,
  engineer_id int REFERENCES engineers(id), team text, notes text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());

CREATE TABLE IF NOT EXISTS output_targets (
  id serial PRIMARY KEY, period_type text, period_key text, plan_type text,
  hw_type text, team text DEFAULT 'ALL', target_count int DEFAULT 0,
  UNIQUE (period_type, period_key, plan_type, hw_type, team));

-- WIP snapshots (point-in-time WIP numbers per workweek; one row per WW, upserted)
CREATE TABLE IF NOT EXISTS wip_snapshots (
  period_key   text PRIMARY KEY,        -- WWyyww
  snapped_at   timestamptz DEFAULT now(),
  total_active int DEFAULT 0,
  aged         int DEFAULT 0,
  by_status    jsonb, by_tester jsonb, by_hwtype jsonb, by_team jsonb);

-- NOTE: id columns above are text/int (not gen_random_uuid) for engineers because the
-- app keys engineers by the real employee number. The app uses anon-key upserts;
-- enable RLS + an anon policy per table if your project enforces RLS.`;
function Settings() {
  useStore();
  const S = window.STORE,
    DB = S.DB,
    cfg = DB.config;
  const [url, setUrl] = useSs(DB.app_settings.supabaseUrl || '');
  const [key, setKey] = useSs(DB.app_settings.supabaseKey || '');
  const [copied, setCopied] = useSs(false);
  const setC = (k, v) => {
    cfg[k] = v;
    S.saveLocal();
    S.bump();
  };
  const connect = () => {
    const ok = S.connect(url, key);
    if (ok) S.fetchAll();
  };
  const copy = () => {
    try {
      navigator.clipboard.writeText(MIGRATION_SQL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {}
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "view-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid g-2"
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Supabase Connection",
    icon: I.gear
  }, /*#__PURE__*/React.createElement("div", {
    className: "frow"
  }, /*#__PURE__*/React.createElement("label", null, "Project URL"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: url,
    placeholder: "https://xxxx.supabase.co",
    onChange: e => setUrl(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "frow"
  }, /*#__PURE__*/React.createElement("label", null, "anon key"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: key,
    placeholder: "eyJ\u2026",
    onChange: e => setKey(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "row between",
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement(SyncDot, null), /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn pri",
    onClick: connect
  }, "Connect & Pull"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => S.flushAll()
  }, "Flush all \u2192"))), /*#__PURE__*/React.createElement("div", {
    className: "callout",
    style: {
      marginTop: 10
    }
  }, "Offline-first: the dashboard runs entirely from ", /*#__PURE__*/React.createElement("b", null, "localStorage"), " without a connection. Connect to sync; every edit auto-pushes (debounced). Credentials can also be ", /*#__PURE__*/React.createElement("b", null, "baked"), " into ", /*#__PURE__*/React.createElement("code", null, "assets/supabase-config.js"), " so the app auto-connects and pulls on every load.")), /*#__PURE__*/React.createElement(Panel, {
    title: "Sync",
    icon: I.pulse
  }, /*#__PURE__*/React.createElement("div", {
    className: "frow"
  }, /*#__PURE__*/React.createElement("label", null, "Auto-push"), /*#__PURE__*/React.createElement(Seg, {
    value: cfg.autoPush ? 'on' : 'off',
    options: [{
      k: 'on',
      l: 'On'
    }, {
      k: 'off',
      l: 'Off'
    }],
    onChange: v => setC('autoPush', v === 'on')
  })), /*#__PURE__*/React.createElement("div", {
    className: "frow"
  }, /*#__PURE__*/React.createElement("label", null, "Debounce (ms)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: cfg.syncDebounceMs,
    style: {
      width: 100
    },
    onChange: e => setC('syncDebounceMs', Math.max(100, Math.min(2000, +e.target.value)))
  })), /*#__PURE__*/React.createElement("div", {
    className: "frow"
  }, /*#__PURE__*/React.createElement("label", null, "Projection"), /*#__PURE__*/React.createElement("select", {
    value: cfg.projectionMethod,
    onChange: e => setC('projectionMethod', e.target.value)
  }, ['run_rate', 'last_period', 'trailing_4_avg', 'manual'].map(m => /*#__PURE__*/React.createElement("option", {
    key: m
  }, m)))))), /*#__PURE__*/React.createElement(Panel, {
    title: "KPI / WIP Parameters",
    icon: I.target
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid g-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "frow",
    style: {
      gridTemplateColumns: '1fr'
    }
  }, /*#__PURE__*/React.createElement("label", null, "Trend window \u2014 weekly (", cfg.trendWindowWeekly, ")"), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "4",
    max: "13",
    value: cfg.trendWindowWeekly,
    onChange: e => setC('trendWindowWeekly', +e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "frow",
    style: {
      gridTemplateColumns: '1fr'
    }
  }, /*#__PURE__*/React.createElement("label", null, "Trend window \u2014 monthly (", cfg.trendWindowMonthly, ")"), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "3",
    max: "12",
    value: cfg.trendWindowMonthly,
    onChange: e => setC('trendWindowMonthly', +e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "frow",
    style: {
      gridTemplateColumns: '1fr'
    }
  }, /*#__PURE__*/React.createElement("label", null, "WIP aging flag (\u2265 ", cfg.agingFlagDays, " d)"), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "1",
    max: "30",
    value: cfg.agingFlagDays,
    onChange: e => setC('agingFlagDays', +e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "frow",
    style: {
      gridTemplateColumns: '1fr'
    }
  }, /*#__PURE__*/React.createElement("label", null, "Manning green % (", cfg.manningGreenPct, ")"), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "0",
    max: "100",
    value: cfg.manningGreenPct,
    onChange: e => setC('manningGreenPct', +e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "frow",
    style: {
      gridTemplateColumns: '1fr'
    }
  }, /*#__PURE__*/React.createElement("label", null, "Manning yellow % (", cfg.manningYellowPct, ")"), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "0",
    max: "100",
    value: cfg.manningYellowPct,
    onChange: e => setC('manningYellowPct', +e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "frow",
    style: {
      gridTemplateColumns: '1fr'
    }
  }, /*#__PURE__*/React.createElement("label", null, "Competency green (\u2265 ", cfg.competencyGreen, ")"), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "0",
    max: "3",
    step: "0.1",
    value: cfg.competencyGreen,
    onChange: e => setC('competencyGreen', +e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "muted-s"
  }, "Active WIP statuses (count as WIP):"), /*#__PURE__*/React.createElement("div", {
    className: "filters",
    style: {
      marginTop: 6
    }
  }, DB.VOCAB.wipStatus.map(s => {
    const on = cfg.activeWipStatuses.includes(s);
    return /*#__PURE__*/React.createElement("button", {
      key: s,
      className: 'fchip' + (on ? ' active' : ''),
      onClick: () => {
        cfg.activeWipStatuses = on ? cfg.activeWipStatuses.filter(x => x !== s) : [...cfg.activeWipStatuses, s];
        S.saveLocal();
        S.bump();
      }
    }, s);
  })))), /*#__PURE__*/React.createElement(Panel, {
    title: "Migration SQL",
    icon: I.layers,
    sub: "paste into Supabase SQL editor",
    right: /*#__PURE__*/React.createElement("button", {
      className: "btn sm",
      onClick: copy
    }, copied ? 'Copied ✓' : 'Copy')
  }, /*#__PURE__*/React.createElement("pre", {
    className: "inset",
    style: {
      padding: 12,
      overflow: 'auto',
      fontSize: 11,
      fontFamily: 'var(--f-mono)',
      color: 'var(--fg-2)',
      margin: 0,
      whiteSpace: 'pre'
    }
  }, MIGRATION_SQL)));
}
window.Settings = Settings;

/* === app.jsx === */
// app.jsx — shell: sidebar nav, topbar, routing, init, cloud bootstrap
const {
  useState: useSa,
  useEffect: useEa
} = React;
const TABS = [{
  k: 'executive',
  l: 'Executive Pulse',
  icon: I.pulse,
  C: 'Executive',
  crumb: 'Overview'
}, {
  k: 'revenue',
  l: 'Revenue & Targets',
  icon: I.money,
  C: 'RevenueTargets',
  crumb: 'Planning'
}, {
  k: 'output',
  l: 'Output & Productivity',
  icon: I.box,
  C: 'OutputTab',
  crumb: 'Operations'
}, {
  k: 'wip',
  l: 'WIP Inventory',
  icon: I.layers,
  C: 'WipTab',
  crumb: 'Operations'
}, {
  k: 'manpower',
  l: 'Manpower & Schedule',
  icon: I.users,
  C: 'Manpower',
  crumb: 'Capacity'
}, {
  k: 'skills',
  l: 'Skills & Competency',
  icon: I.star,
  C: 'Skills',
  crumb: 'Capacity'
}, {
  k: 'people',
  l: 'People & Attrition',
  icon: I.users,
  C: 'People',
  crumb: 'Capacity'
}, {
  k: 'import',
  l: 'Import Data',
  icon: I.upload,
  C: 'ImportTab',
  crumb: 'Data'
}, {
  k: 'settings',
  l: 'Settings',
  icon: I.gear,
  C: 'Settings',
  crumb: 'System'
}];
function App() {
  useStore();
  const S = window.STORE,
    st = S.state,
    DB = S.DB,
    E = window.ENGINE;
  const [tab, setTab] = useSa(st.tab);
  useEa(() => {
    if (!st.periodKey) {
      const ms = [...new Set(DB.output_records.map(r => E.periodOf(r, 'monthly')))].sort();
      st.periodKey = ms[ms.length - 1] || window.ALL_MONTHS[window.ALL_MONTHS.length - 1];
    }
  }, []);
  const go = k => {
    st.tab = k;
    setTab(k);
    S.bump();
  };
  const cur = TABS.find(t => t.k === tab) || TABS[0];
  const View = window[cur.C];
  const agingWip = E.activeWip().filter(w => E.wipAge(w) >= DB.config.agingFlagDays).length;
  const probi = DB.engineers.filter(e => e.status === 'PROBI' && !e.resigned).length;
  return /*#__PURE__*/React.createElement("div", {
    className: "app"
  }, /*#__PURE__*/React.createElement("aside", {
    className: "sidebar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "side-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "side-brand"
  }, /*#__PURE__*/React.createElement("div", {
    className: "side-mark"
  }, /*#__PURE__*/React.createElement(Icon, {
    d: I.pulse,
    size: 18
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "t"
  }, "ERTI Nerve Center"), /*#__PURE__*/React.createElement("span", {
    className: "s"
  }, "F2 \xB7 ETS / LTX Debug Ops")))), /*#__PURE__*/React.createElement("nav", {
    className: "side-nav"
  }, /*#__PURE__*/React.createElement("div", {
    className: "side-sect"
  }, "Operations"), TABS.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.k,
    className: 'nav-item' + (t.k === tab ? ' active' : ''),
    onClick: () => go(t.k)
  }, /*#__PURE__*/React.createElement(Icon, {
    d: t.icon,
    size: 16
  }), t.l, t.k === 'wip' && agingWip > 0 && /*#__PURE__*/React.createElement("span", {
    className: "badge"
  }, agingWip), t.k === 'people' && probi > 0 && /*#__PURE__*/React.createElement("span", {
    className: "badge"
  }, probi)))), /*#__PURE__*/React.createElement("div", {
    className: "side-foot"
  }, /*#__PURE__*/React.createElement(SyncDot, null))), /*#__PURE__*/React.createElement("main", {
    className: "main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "topbar"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "crumb"
  }, cur.crumb), /*#__PURE__*/React.createElement("h1", null, cur.l)), /*#__PURE__*/React.createElement("div", {
    className: "topbar-r"
  }, /*#__PURE__*/React.createElement("span", {
    className: "muted-s"
  }, E.periodLabel(st.periodType, st.periodKey)))), /*#__PURE__*/React.createElement("div", {
    className: "view"
  }, View ? /*#__PURE__*/React.createElement(View, null) : /*#__PURE__*/React.createElement("div", {
    className: "empty"
  }, "Coming soon"))), /*#__PURE__*/React.createElement(Banner, null), /*#__PURE__*/React.createElement(Toast, null));
}
window.App = App;

// ── boot: mount, remove splash, auto-sync from baked config ──
(function () {
  function hideSplash() {
    const s = document.getElementById('boot-splash');
    if (s) {
      s.classList.add('hide');
      setTimeout(() => {
        if (s.parentNode) s.parentNode.removeChild(s);
      }, 650);
    }
  }
  function boot() {
    const el = document.getElementById('root');
    if (!el) return;
    ReactDOM.createRoot(el).render(React.createElement(App));
    const cfg = window.ERTI_SUPABASE;
    if (cfg && cfg.url && cfg.key && window.supabase) {
      window.STORE.setBusy(true, 'Syncing ERTI Nerve Center');
      window.STORE.connect(cfg.url, cfg.key);
      window.STORE.fetchAll().then(() => {
        window.STORE.setBusy(false);
        hideSplash();
      }).catch(() => {
        window.STORE.setBusy(false);
        hideSplash();
      });
    } else {
      setTimeout(hideSplash, 350);
    }
  }
  if (document.readyState !== 'loading') boot();else document.addEventListener('DOMContentLoaded', boot);
})();
