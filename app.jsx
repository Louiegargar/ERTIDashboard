// app.jsx — shell, navigation, time-range, tweaks

const { useState: useStateA, useEffect: useEffectA } = React;

const NAV = [
  { id: 'overview', label: 'KPI Overview', icon: ICN.grid },
  { id: 'team', label: 'Team Leaderboard', icon: ICN.trophy },
  { id: 'growth', label: 'Experience Matrix', icon: ICN.growth },
];

const TITLES = {
  overview: { crumb: 'PEOPLE OPS / DASHBOARD', title: 'KPI Overview' },
  team: { crumb: 'PEOPLE OPS / TEAM', title: 'Team Leaderboard' },
  growth: { crumb: 'PEOPLE OPS / EXPERIENCE', title: 'Experience & Tenure' },
  person: { crumb: 'PEOPLE OPS / SCORECARD', title: 'Individual Scorecard' },
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#ffb800",
  "density": "regular",
  "fontScale": 15
}/*EDITMODE-END*/;

function App() {
  const data = window.DASH;
  const [view, setView] = useStateA('overview');
  const [person, setPerson] = useStateA(null);
  const [range, setRange] = useStateA('month');
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // apply tweaks to :root
  useEffectA(() => {
    const r = document.documentElement;
    r.style.setProperty('--accent', t.accent);
    const soft = t.accent + '1a';
    r.style.setProperty('--accent-soft', soft);
    document.body.style.fontSize = t.fontScale + 'px';
    const pad = t.density === 'compact' ? '16px' : t.density === 'comfy' ? '32px' : '24px';
    document.querySelectorAll('.view').forEach(v => { v.style.padding = pad; });
  }, [t]);

  const atRiskCount = data.PEOPLE.filter(p => p.status === 'Probationary').length;

  const openPerson = (p) => { setPerson(p); setView('person'); document.querySelector('.view').scrollTop = 0; };
  const nav = (id) => { setView(id); setPerson(null); const v = document.querySelector('.view'); if (v) v.scrollTop = 0; };

  const head = TITLES[view];
  const ranges = [{ k: 'week', l: 'Week' }, { k: 'month', l: 'Month' }, { k: 'quarter', l: 'Quarter' }];

  return (
    <div className="app">
      {/* sidebar */}
      <aside className="sidebar">
        <div className="side-head">
          <div className="side-brand">
            <div className="side-mark"><Icon d={ICN.bolt} fill /></div>
            <div className="side-brand-txt">
              <span className="t">ERTI · Floor 2</span>
              <span className="s">ETS / LTX</span>
            </div>
          </div>
        </div>
        <nav className="side-nav">
          <div className="side-sect">Monitor</div>
          {NAV.map(n => (
            <button key={n.id} className={'nav-item' + (view === n.id ? ' active' : '')} onClick={() => nav(n.id)}>
              <Icon d={n.icon} />
              <span>{n.label}</span>
              {n.id === 'team' && atRiskCount > 0 && <span className="badge">{atRiskCount}</span>}
            </button>
          ))}
          <div className="side-sect">Roster</div>
          {[...data.PEOPLE].sort((a, b) => b.outputs - a.outputs).slice(0, 6).map(p => (
            <button key={p.id} className={'nav-item' + (person && person.id === p.id ? ' active' : '')} onClick={() => openPerson(p)}>
              <Avatar p={p} sm />
              <span style={{ fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
            </button>
          ))}
        </nav>
        <div className="side-foot">
          <div className="side-user">
            <div className="av">JD</div>
            <div className="col">
              <span className="nm">J. Donnelly</span>
              <span className="rl">Engineering Manager</span>
            </div>
          </div>
        </div>
      </aside>

      {/* main */}
      <div className="main">
        <header className="topbar">
          <div className="topbar-l">
            <span className="crumb">{head.crumb}</span>
            <h1>{view === 'person' && person ? person.name : head.title}</h1>
          </div>
          <div className="topbar-r">
            {view !== 'person' && (
              <div className="seg">
                {ranges.map(r => (
                  <button key={r.k} className={range === r.k ? 'active' : ''} onClick={() => setRange(r.k)}>{r.l}</button>
                ))}
              </div>
            )}
            <button className="icon-btn"><Icon d={ICN.search} /></button>
            <button className="icon-btn"><Icon d={ICN.bell} /><span className="dot"></span></button>
          </div>
        </header>

        <main className="view">
          {view === 'overview' && <Overview data={data} range={range} onSelect={openPerson} goTeam={() => nav('team')} goGrowth={() => nav('growth')} />}
          {view === 'team' && <Team data={data} onSelect={openPerson} />}
          {view === 'growth' && <Growth data={data} onSelect={openPerson} />}
          {view === 'person' && person && <Person data={data} person={person} onBack={() => nav('team')} onSelect={openPerson} />}
        </main>
      </div>

      <TweaksPanel>
        <TweakSection label="Brand" />
        <TweakColor label="Accent" value={t.accent}
          options={['#ffb800', '#4ade80', '#60a5fa', '#f87171', '#a78bfa']}
          onChange={v => setTweak('accent', v)} />
        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={t.density} options={['compact', 'regular', 'comfy']}
          onChange={v => setTweak('density', v)} />
        <TweakSlider label="Base font" value={t.fontScale} min={13} max={17} step={1} unit="px"
          onChange={v => setTweak('fontScale', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
