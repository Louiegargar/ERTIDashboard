// icons.jsx — inline SVG icon set (stroke-based, matches design system line weight)
const Icon = ({ d, fill, size, sw }) => (
  <svg viewBox="0 0 24 24" width={size || 16} height={size || 16} fill={fill ? 'currentColor' : 'none'}
       stroke="currentColor" strokeWidth={sw || 1.7} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICN = {
  grid:     'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  trophy:   ['M6 4h12v3a6 6 0 0 1-12 0z', 'M6 5H3v1a3 3 0 0 0 3 3', 'M18 5h3v1a3 3 0 0 1-3 3', 'M9 19h6', 'M12 13v6'],
  user:     ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M4 21a8 8 0 0 1 16 0'],
  growth:   ['M3 17l6-6 4 4 7-7', 'M17 8h4v4'],
  pulse:    'M3 12h4l2-7 4 14 2-7h6',
  target:   ['M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0', 'M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0', 'M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0'],
  gauge:    ['M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', 'M13.4 10.6 19 5', 'M4 20a9 9 0 1 1 16 0'],
  check:    'M5 12l4 4L19 7',
  bell:     ['M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9', 'M13.7 21a2 2 0 0 1-3.4 0'],
  search:   ['M11 11m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0', 'M21 21l-4-4'],
  cal:      ['M3 5h18v16H3z', 'M3 9h18', 'M8 3v4', 'M16 3v4'],
  arrowU:   'M12 19V5M5 12l7-7 7 7',
  arrowD:   'M12 5v14M5 12l7 7 7-7',
  arrowR:   'M5 12h14M13 6l6 6-6 6',
  arrowL:   'M19 12H5M11 18l-6-6 6-6',
  layers:   ['M12 3 2 8l10 5 10-5z', 'M2 13l10 5 10-5', 'M2 18l10 5 10-5'],
  bolt:     'M13 2 4 14h7l-1 8 9-12h-7z',
  clock:    ['M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0', 'M12 7v5l3 2'],
  shield:   ['M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z', 'M9 12l2 2 4-4'],
  spark:    ['M12 3v3', 'M12 18v3', 'M3 12h3', 'M18 12h3', 'M5.6 5.6l2.1 2.1', 'M16.3 16.3l2.1 2.1', 'M18.4 5.6l-2.1 2.1', 'M7.7 16.3l-2.1 2.1'],
  flag:     ['M5 21V4', 'M5 4h12l-2 4 2 4H5'],
  heart:    'M12 21C5 16 3 12 3 8.5 3 6 5 4 7.5 4c1.7 0 3 .9 4.5 2.5C13.5 4.9 14.8 4 16.5 4 19 4 21 6 21 8.5 21 12 19 16 12 21z',
  star:     'M12 3l2.6 5.6 6 .6-4.5 4 1.3 6L12 16.8 6.6 19.2l1.3-6-4.5-4 6-.6z',
  dots:     ['M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0', 'M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0', 'M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0'],
  cert:     ['M12 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10z', 'M9 13l-2 7 5-3 5 3-2-7'],
  sliders:  ['M4 21v-7', 'M4 10V3', 'M12 21v-9', 'M12 8V3', 'M20 21v-5', 'M20 12V3', 'M1 14h6', 'M9 8h6', 'M17 16h6'],
  filter:   'M3 4h18l-7 8v6l-4 2v-8z',
  logout:   ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
};

window.Icon = Icon;
window.ICN = ICN;
