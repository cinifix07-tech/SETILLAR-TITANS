  import { useMemo, useState } from 'react'
import './App.css'

const craft = [
  { id: 'pioneer', name: 'Pioneer CubeSat', type: '6U • compact explorer', mass: 8, power: 42, cost: 18, capacity: 24, description: 'A nimble platform for focused, low-power observations.', icon: '◇' },
  { id: 'pathfinder', name: 'Pathfinder Bus', type: 'Small satellite • balanced', mass: 18, power: 95, cost: 32, capacity: 42, description: 'Room for capable instruments and dependable downlink.', icon: '◈' },
  { id: 'horizon', name: 'Horizon Surveyor', type: 'Earth science • extended', mass: 32, power: 150, cost: 48, capacity: 60, description: 'A larger platform for ambitious, high-resolution science.', icon: '⬡' },
]
const instruments = [
  { id: 'camera', name: 'Multispectral imager', tag: 'LAND & WATER', mass: 5, power: 38, cost: 16, value: 32, desc: 'Maps vegetation, coastlines and surface change in several color bands.' },
  { id: 'thermal', name: 'Thermal mapper', tag: 'HEAT SIGNATURES', mass: 7, power: 52, cost: 21, value: 29, desc: 'Measures surface temperature patterns to study heat and fires.' },
  { id: 'radar', name: 'Cloud radar', tag: 'ALL-WEATHER', mass: 12, power: 88, cost: 30, value: 38, desc: 'Uses radar pulses to observe through clouds, with higher power demand.' },
]
const rockets = [
  { id: 'swift', name: 'Swift rideshare', mass: 24, cost: 20, comm: 55, desc: 'Lean launch budget • limited payload margin' },
  { id: 'atlas', name: 'Atlas small launch', mass: 45, cost: 34, comm: 90, desc: 'Balanced capacity • dependable data link' },
  { id: 'titan', name: 'Titan dedicated', mass: 70, cost: 52, comm: 125, desc: 'Generous capacity • premium cost' },
]
const steps = ['Objective', 'Spacecraft', 'Instruments', 'Launch', 'Orbit & duration', 'Review']
const money = (n) => `$${n}M`

function calculate(config) {
  const vehicle = rockets.find((x) => x.id === config.rocket)
  const bus = craft.find((x) => x.id === config.craft)
  const selected = instruments.filter((x) => config.instruments.includes(x.id))
  const mass = bus.mass + selected.reduce((s, x) => s + x.mass, 0)
  const power = 24 + selected.reduce((s, x) => s + x.power, 0)
  const budget = bus.cost + vehicle.cost + selected.reduce((s, x) => s + x.cost, 0) + 8
  const data = 18 + selected.reduce((s, x) => s + x.value, 0)
  const limits = { mass: vehicle.mass, power: bus.power, budget: 100, data: vehicle.comm }
  return { vehicle, bus, selected, mass, power, budget, data, limits, margins: { mass: limits.mass - mass, power: limits.power - power, budget: limits.budget - budget, data: limits.data - data } }
}

function App() {
  const [view, setView] = useState('mission')
  const [step, setStep] = useState(0)
  const [config, setConfig] = useState({ objective: 'coast', craft: 'pathfinder', instruments: ['camera'], rocket: 'atlas', orbit: 'sun', duration: 12 })
  const [result, setResult] = useState(null)
  const [running, setRunning] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const calc = useMemo(() => calculate(config), [config])
  const valid = calc.margins.mass >= 0 && calc.margins.power >= 0 && calc.margins.budget >= 0 && calc.margins.data >= 0 && calc.selected.length > 0
  const patchConfig = (key, value) => { setConfig((old) => ({ ...old, [key]: value })); setResult(null) }
  const toggleInstrument = (id) => patchConfig('instruments', config.instruments.includes(id) ? config.instruments.filter((x) => x !== id) : [...config.instruments, id])
  const launch = () => {
    setRunning(true); setResult(null)
    window.setTimeout(() => {
      const constraints = calc.margins
      const critical = constraints.mass < 0 || constraints.power < 0 || constraints.budget < 0 || !calc.selected.length
      const issues = Object.entries(constraints).filter(([, value]) => value < 0).map(([key]) => key)
      const quality = Math.max(0, Math.min(100, Math.round((calc.selected.reduce((s, x) => s + x.value, 0) + 22 + Math.min(calc.margins.power, 40) / 2 + (config.duration >= 12 ? 8 : 2)))))
      const outcome = critical ? 'MISSION FAILURE' : (quality >= 75 && calc.margins.data >= 10 ? 'SUCCESS' : 'PARTIAL SUCCESS')
      setResult({ outcome, quality, issues, config: { ...config }, calc })
      setRunning(false); setView('debrief')
    }, 1750)
  }
  const nav = (next) => { setView(next); setMobileMenu(false) }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? 'open' : ''}`}>
      <a className="brand" href="#home" onClick={(e) => { e.preventDefault(); nav('mission') }}><span className="brand-mark">✳</span><span>SETILLAR <b>TITANS</b><small>MISSION CONTROL · V5</small></span></a>
      <div className="side-label">FLIGHT DECK</div>
      <button className={`nav-item ${view === 'mission' ? 'active' : ''}`} onClick={() => nav('mission')}><span>⌘</span> Mission builder <i>01</i></button>
      <button className={`nav-item ${view === 'debrief' ? 'active' : ''}`} onClick={() => result && nav('debrief')} disabled={!result}><span>◷</span> Mission debrief <i>{result ? 'NEW' : '—'}</i></button>
      <button className={`nav-item ${view === 'learn' ? 'active' : ''}`} onClick={() => nav('learn')}><span>⌁</span> How to play</button>
      <div className="sidebar-spacer" />
      <div className="mission-mini"><div className="mini-top"><span className="live-dot"/> ACTIVE SCENARIO</div><strong>Earth observation</strong><span>MISSION 001 <b>·</b> LEO / SUN-SYNC</span><div className="mini-progress"><i style={{ width: result ? '100%' : `${Math.round((step + 1) / 6 * 100)}%` }} /></div><small>{result ? 'Mission complete' : `Configuration ${step + 1} of 6`}</small></div>
      <div className="sidebar-foot"><span className="avatar">EX</span><span>EXPLORER<span className="muted"> · GUEST PILOT</span></span><span className="status-ok">●</span></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle navigation">☰</button><div className="breadcrumb">FLIGHT DECK <span>/</span> <b>{view === 'mission' ? 'MISSION BUILDER' : view === 'debrief' ? 'MISSION DEBRIEF' : 'FIELD GUIDE'}</b></div><div className="top-right"><span className="network"><i/> SYSTEMS NOMINAL</span><span className="top-divider"/><span className="mission-id">ST–001</span><span className="top-avatar">EX</span></div></header>
      {view === 'mission' && <div className="content">
        <section className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line"/> YOUR FLIGHT PLAN <span className="eyebrow-muted">/ MISSION 001</span></div><h1>Build your <em>mission.</em></h1><p>Design an Earth-observing satellite. Every choice changes what you can discover.</p></div><div className="heading-meta"><span className="mission-pill"><i/> SIMULATION READY</span><div>EDUCATIONAL SCENARIO <b>·</b> v5.0</div></div></section>
        <section className="stepper" aria-label="Mission configuration steps">{steps.map((name, i) => <button key={name} className={`step ${step === i ? 'current' : ''} ${step > i ? 'done' : ''}`} onClick={() => setStep(i)}><span className="step-num">{step > i ? '✓' : `0${i + 1}`}</span><span>{name}</span></button>)}</section>
        <div className="workspace">
          <section className="builder-panel">
            <div className="panel-head"><div><span className="section-index">STEP 0{step + 1} / 06</span><h2>{['Choose your objective','Choose your spacecraft','Select your instruments','Choose your launch','Set your orbit & duration','Review your flight plan'][step]}</h2><p>{['What question should your satellite help answer?','Your spacecraft bus carries and powers the instruments.','Each instrument reveals something different about Earth.','Your launch choice sets the payload and data-link limits.','Set the mission environment and time available to collect data.','Check your configuration and resource margins before launch.'][step]}</p></div><span className="help-mark" title="Game values are educational assumptions">?</span></div>
            {step === 0 && <div className="objective-grid">{[{ id: 'coast', icon: '⌁', title: 'Changing coastlines', desc: 'Track erosion, floods and coastal change over time.', stat: 'LAND & WATER' }, { id: 'crops', icon: '✳', title: 'Crop health', desc: 'Observe vegetation patterns and seasonal growth.', stat: 'VEGETATION' }, { id: 'fires', icon: '◉', title: 'Heat & wildfires', desc: 'Locate unusual heat signatures across the surface.', stat: 'THERMAL' }].map((x) => <button key={x.id} className={`objective-card ${config.objective === x.id ? 'selected' : ''}`} onClick={() => patchConfig('objective', x.id)}><span className="obj-icon">{x.icon}</span><span className="select-check">{config.objective === x.id ? '✓' : ''}</span><strong>{x.title}</strong><span className="obj-desc">{x.desc}</span><span className="obj-stat">{x.stat} <b>↗</b></span></button>)}</div>}
            {step === 1 && <div className="choice-list">{craft.map((x) => <button key={x.id} className={`choice-row ${config.craft === x.id ? 'selected' : ''}`} onClick={() => patchConfig('craft', x.id)}><span className="choice-icon">{x.icon}</span><span className="choice-copy"><strong>{x.name}</strong><small>{x.type} — {x.description}</small></span><span className="choice-spec">{x.mass} kg <small>DRY MASS</small></span><span className="choice-spec">{x.power} W <small>POWER</small></span><span className={`radio ${config.craft === x.id ? 'checked' : ''}`}/></button>)}</div>}
            {step === 2 && <div className="instrument-grid">{instruments.map((x) => <button key={x.id} className={`instrument-card ${config.instruments.includes(x.id) ? 'selected' : ''}`} onClick={() => toggleInstrument(x.id)}><div className="instrument-top"><span className="instrument-icon">{x.id === 'camera' ? '▧' : x.id === 'thermal' ? '◉' : '⌁'}</span><span className={`checkbox ${config.instruments.includes(x.id) ? 'checked' : ''}`}>{config.instruments.includes(x.id) ? '✓' : ''}</span></div><span className="instrument-tag">{x.tag}</span><strong>{x.name}</strong><p>{x.desc}</p><div className="instrument-spec"><span>{x.mass} kg <small>MASS</small></span><span>{x.power} W <small>DEMAND</small></span><span>{money(x.cost)} <small>COST</small></span></div></button>)}</div>}
            {step === 3 && <div className="choice-list">{rockets.map((x) => <button key={x.id} className={`choice-row rocket-row ${config.rocket === x.id ? 'selected' : ''}`} onClick={() => patchConfig('rocket', x.id)}><span className="choice-icon">↗</span><span className="choice-copy"><strong>{x.name}</strong><small>{x.desc}</small></span><span className="choice-spec">{x.mass} kg <small>PAYLOAD LIMIT</small></span><span className="choice-spec">{x.comm} <small>DATA CAPACITY</small></span><span className="radio" style={config.rocket === x.id ? { background: 'var(--cyan)', borderColor: 'var(--cyan)' } : {}}>{config.rocket === x.id ? '✓' : ''}</span></button>)}</div>}
            {step === 4 && <div className="parameters"><div className="parameter-block"><span className="instrument-tag">TARGET ORBIT</span><h3>Where will it observe?</h3><div className="orbit-options">{[{ id: 'sun', title: 'Sun-synchronous', text: 'Consistent daylight for comparing images.' }, { id: 'low', title: 'Low Earth orbit', text: 'Closer passes, varied local lighting.' }].map((x) => <button key={x.id} className={`orbit-option ${config.orbit === x.id ? 'selected' : ''}`} onClick={() => patchConfig('orbit', x.id)}><span className={`radio ${config.orbit === x.id ? 'checked' : ''}`}/><b>{x.title}</b><small>{x.text}</small></button>)}</div></div><div className="parameter-block duration-block"><div><span className="instrument-tag">MISSION DURATION</span><h3>{config.duration} months</h3><p>Longer missions allow more observations but need reliable systems.</p></div><input aria-label="Mission duration in months" type="range" min="6" max="24" step="3" value={config.duration} onChange={(e) => patchConfig('duration', Number(e.target.value))}/><div className="range-labels"><span>6 MONTHS</span><span>24 MONTHS</span></div></div></div>}
            {step === 5 && <div className="review"><div className="review-row"><span>MISSION OBJECTIVE</span><strong>{({ coast: 'Changing coastlines', crops: 'Crop health', fires: 'Heat & wildfires' })[config.objective]}</strong><button onClick={() => setStep(0)}>EDIT</button></div><div className="review-row"><span>SPACECRAFT</span><strong>{calc.bus.name}</strong><button onClick={() => setStep(1)}>EDIT</button></div><div className="review-row"><span>INSTRUMENTS</span><strong>{calc.selected.length ? calc.selected.map((x) => x.name).join(' · ') : 'None selected'}</strong><button onClick={() => setStep(2)}>EDIT</button></div><div className="review-row"><span>LAUNCH / ORBIT</span><strong>{calc.vehicle.name} · {config.orbit === 'sun' ? 'Sun-synchronous' : 'Low Earth orbit'}</strong><button onClick={() => setStep(3)}>EDIT</button></div><div className="review-row"><span>MISSION DURATION</span><strong>{config.duration} months</strong><button onClick={() => setStep(4)}>EDIT</button></div><div className={`review-readiness ${valid ? '' : 'warning'}`}><span>{valid ? '✓' : '!'}</span><div><strong>{valid ? 'Flight plan is within modeled limits' : 'Review the constraints before launch'}</strong><small>{valid ? 'All required selections are made and resources fit the game scenario.' : 'Resolve each warning in the resource panel to improve mission readiness.'}</small></div></div></div>}
            <div className="builder-foot"><span><span className="lock-icon">⌑</span> YOUR FLIGHT PLAN SAVES AUTOMATICALLY</span><div>{step > 0 && <button className="btn-secondary" onClick={() => setStep(step - 1)}>← BACK</button>}{step < 5 ? <button className="btn-primary" onClick={() => setStep(step + 1)}>CONTINUE <span>→</span></button> : <button className="btn-primary launch-btn" onClick={launch} disabled={running}>{running ? <><span className="spinner"/> INITIALIZING…</> : <> <span>↗</span> LAUNCH SIMULATION</>}</button>}</div></div>
          </section>
          <aside className="resources-panel"><div className="resource-header"><div><span className="section-index">LIVE TELEMETRY</span><h2>Mission resources</h2></div><span className="live-tag"><i/> LIVE</span></div><p className="resource-intro">Updates as you shape your spacecraft.</p>
            <Resource label="MASS" used={calc.mass} limit={calc.limits.mass} unit="kg" icon="◇" margin={calc.margins.mass}/>
            <Resource label="POWER" used={calc.power} limit={calc.limits.power} unit="W" icon="ϟ" margin={calc.margins.power}/>
            <Resource label="BUDGET" used={calc.budget} limit={calc.limits.budget} unit="M" prefix="$" icon="$" margin={calc.margins.budget}/>
            <Resource label="DATA LINK" used={calc.data} limit={calc.limits.data} unit="pts" icon="⌁" margin={calc.margins.data}/>
            <div className="resource-divider"/><div className="mission-readiness"><div className="readiness-orb">{valid ? '✓' : '!'}</div><div><strong>{valid ? 'Within limits' : 'Needs attention'}</strong><span>{valid ? 'Configuration is launchable' : 'One or more limits exceeded'}</span></div><span className={valid ? 'ready-pill' : 'alert-pill'}>{valid ? 'READY' : 'CHECK'}</span></div>
            {!valid && <div className="constraint-list">{calc.margins.mass < 0 && <span>Mass exceeds launch capacity by {Math.abs(calc.margins.mass)} kg</span>}{calc.margins.power < 0 && <span>Power demand exceeds generation by {Math.abs(calc.margins.power)} W</span>}{calc.margins.budget < 0 && <span>Budget exceeds $100M by ${Math.abs(calc.margins.budget)}M</span>}{calc.margins.data < 0 && <span>Data needs exceed link capacity</span>}{!calc.selected.length && <span>Select at least one instrument</span>}</div>}
            <div className="assumption-note"><span>ⓘ</span><p><b>Learning simulation</b><br/>All resource values are game-design assumptions. Real mission requirements vary by design.</p></div>
          </aside>
        </div>
        <footer className="content-footer"><span>SETILLAR TITANS <b>·</b> AN EDUCATIONAL MISSION DESIGN GAME</span><span>SIMPLIFIED MODEL <b>·</b> NOT FOR FLIGHT DESIGN</span></footer>
      </div>}
      {view === 'debrief' && <Debrief result={result} onRetry={() => { setConfig({ objective: 'coast', craft: 'pathfinder', instruments: ['camera'], rocket: 'atlas', orbit: 'sun', duration: 12 }); setStep(0); setResult(null); setView('mission') }} onEdit={() => nav('mission')}/>}
      {view === 'learn' && <Learn onStart={() => { setStep(0); nav('mission') }}/ >}
    </main>
  </div>
}

function Resource({ label, used, limit, unit, icon, margin, prefix = '' }) {
  const percent = Math.min(100, Math.round(used / limit * 100))
  const danger = margin < 0
  const warning = !danger && percent >= 85
  return <div className="resource"><div className="resource-top"><div className="resource-name"><span>{icon}</span>{label}</div><span className={`resource-state ${danger ? 'bad' : warning ? 'warn' : ''}`}>{danger ? 'OVER LIMIT' : warning ? 'NEAR LIMIT' : 'ON TRACK'}</span></div><div className="resource-numbers"><strong>{prefix}{used}<small> {unit}</small></strong><span>OF {prefix}{limit}{unit}</span></div><div className="meter"><i className={danger ? 'bad' : warning ? 'warn' : ''} style={{ width: `${percent}%` }}/></div><div className="resource-bottom"><span>{danger ? `Exceeds by ${prefix}${Math.abs(margin)} ${unit}` : `${prefix}${margin} ${unit} remaining`}</span><span>{percent}%</span></div></div>
}

function Debrief({ result, onRetry, onEdit }) {
  if (!result) return <div className="content"><div className="empty-state"><h2>No mission data yet</h2><button className="btn-primary" onClick={onEdit}>BUILD A MISSION →</button></div></div>
  const success = result.outcome === 'SUCCESS'
  const partial = result.outcome === 'PARTIAL SUCCESS'
  const c = result.calc
  return <div className="content debrief-content"><section className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line"/> FLIGHT REVIEW <span className="eyebrow-muted">/ MISSION 001</span></div><h1>Mission <em>debrief.</em></h1><p>Here’s what your decisions made possible—and what you learned.</p></div><div className="heading-meta"><span className="mission-pill"><i/> SIMULATION COMPLETE</span><div>DETERMINISTIC SCENARIO <b>·</b> RUN 001</div></div></section>
    <section className={`outcome-banner ${success ? 'success' : partial ? 'partial' : 'failed'}`}><div className="outcome-icon">{success ? '✓' : partial ? '◐' : '!'}</div><div><span className="section-index">MISSION ASSESSMENT</span><h2>{result.outcome}</h2><p>{success ? 'Your satellite collected and returned useful observations within all modeled constraints.' : partial ? 'Your satellite completed some science goals, but a performance target limited the final result.' : `A critical modeled constraint prevented reliable mission operations${result.issues.length ? ` (${result.issues.join(', ')}).` : '.'}`}</p></div><div className="score-ring" style={{ '--score': `${result.quality}%` }}><div><b>{result.quality}</b><small>GAME SCORE</small></div></div></section>
    <div className="debrief-grid"><section className="panel-card"><div className="debrief-panel-head"><div><span className="section-index">01 / FLIGHT PLAN</span><h3>What you designed</h3></div><button className="text-button" onClick={onEdit}>EDIT PLAN ↗</button></div><div className="debrief-facts"><div><span>SPACECRAFT</span><b>{c.bus.name}</b></div><div><span>INSTRUMENTS</span><b>{c.selected.map((x) => x.name).join(', ') || 'None selected'}</b></div><div><span>LAUNCH VEHICLE</span><b>{c.vehicle.name}</b></div><div><span>MISSION LENGTH</span><b>{result.config.duration} months</b></div></div></section>
      <section className="panel-card"><div className="debrief-panel-head"><div><span className="section-index">02 / RESOURCE REVIEW</span><h3>Engineering trade-offs</h3></div></div><div className="review-bars">{[['Mass', c.mass, c.limits.mass, 'kg'], ['Power', c.power, c.limits.power, 'W'], ['Budget', c.budget, c.limits.budget, 'M'], ['Data link', c.data, c.limits.data, 'pts']].map(([name, used, limit, unit]) => <div className="review-bar" key={name}><div><span>{name}</span><b>{used} / {limit} {unit}</b></div><div className="meter"><i className={used > limit ? 'bad' : ''} style={{ width: `${Math.min(100, used / limit * 100)}%` }}/></div></div>)}</div></section>
      <section className="panel-card full-card"><div className="debrief-panel-head"><div><span className="section-index">03 / WHAT HAPPENED</span><h3>Mission timeline</h3></div><span className="deterministic-tag">RULE-BASED SIMULATION</span></div><div className="timeline">{[{ t: 'Launch & deployment', text: 'Payload mass checked against the selected launch vehicle capacity.', ok: c.margins.mass >= 0 }, { t: 'Power-up & instrument checkout', text: `Spacecraft bus provides ${c.bus.power} W; systems and instruments request ${c.power} W.`, ok: c.margins.power >= 0 }, { t: 'Observation campaign', text: `${c.selected.length} instrument${c.selected.length === 1 ? '' : 's'} configured for ${result.config.duration} months of data collection.`, ok: c.selected.length > 0 && c.margins.power >= 0 }, { t: 'Downlink & science return', text: `Modeled data need is ${c.data} points against link capacity of ${c.limits.data}.`, ok: c.margins.data >= 0 }].map((x) => <div className="timeline-item" key={x.t}><span className={`timeline-dot ${x.ok ? '' : 'miss'}`}>{x.ok ? '✓' : '!'}</span><div><b>{x.t}</b><span>{x.text}</span></div><small>{x.ok ? 'COMPLETE' : 'CONSTRAINED'}</small></div>)}</div></section>
      <section className="learning-callout full-card"><span className="bulb">✳</span><div><span className="section-index">ENGINEERING TAKEAWAY</span><h3>{success ? 'A balanced design leaves room to operate.' : 'Trade-offs connect every subsystem.'}</h3><p>{success ? 'Your design kept mass, power, budget and data needs inside their modeled limits. In real missions, engineers also account for uncertainty, redundancy, environment and many more constraints.' : 'Adding a capable instrument also adds mass, power demand, cost and data. Try a different spacecraft or launch vehicle, or remove an instrument to regain margin.'}</p></div></section></div>
    <div className="debrief-actions"><button className="btn-secondary" onClick={onEdit}>← EDIT FLIGHT PLAN</button><button className="btn-primary" onClick={onRetry}>↻ TRY AGAIN</button></div>
    <footer className="content-footer"><span>SETILLAR TITANS <b>·</b> AN EDUCATIONAL MISSION DESIGN GAME</span><span>SIMPLIFIED MODEL <b>·</b> NOT FOR FLIGHT DESIGN</span></footer></div>
}

function Learn({ onStart }) {
  return <div className="content"><section className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line"/> FIELD GUIDE <span className="eyebrow-muted">/ FIRST FLIGHT</span></div><h1>Space, <em>made simple.</em></h1><p>A quick guide to the choices behind an Earth-observation mission.</p></div></section><div className="learn-grid">{[{ n: '01', title: 'Mission objective', text: 'Start with a question. What should a satellite help us observe: crops, coastlines or heat? Your objective guides which instruments make sense.' }, { n: '02', title: 'Spacecraft & mass', text: 'The spacecraft is the platform that carries your instruments. Mass is how much matter the whole payload has. A launch vehicle has a mass limit.' }, { n: '03', title: 'Electrical power', text: 'Instruments need electricity to work. The spacecraft generates a limited amount of power, so choose a combination that fits.' }, { n: '04', title: 'Budget', text: 'Every spacecraft, instrument and launch option uses part of the mission budget. You will need to balance science capability and cost.' }, { n: '05', title: 'Orbit & communications', text: 'Orbit is the path around Earth. It affects where and when a satellite can observe. A communication link brings collected data back to Earth.' }, { n: '06', title: 'Simulation & score', text: 'The simulator checks your design against simplified game rules. The score is for learning and is not a real mission-performance rating.' }].map((x) => <article className="learn-card" key={x.n}><span>{x.n} / FIELD NOTE</span><h3>{x.title}</h3><p>{x.text}</p></article>)}</div><section className="references"><div><span className="section-index">SCIENTIFIC CONTEXT</span><h2>Curiosity, grounded in real science.</h2><p>This game simplifies mission-design trade-offs for learning. Numbers are balancing assumptions created for this game, not NASA specifications or predictions. Learn more from NASA’s public resources.</p><div className="reference-links"><a href="https://science.nasa.gov/earth/" target="_blank" rel="noreferrer">NASA Earth Science ↗</a><a href="https://www.nasa.gov/reference/systems-engineering-handbook/" target="_blank" rel="noreferrer">NASA Systems Engineering Handbook ↗</a></div></div><button className="btn-primary" onClick={onStart}>START A MISSION →</button></section><footer className="content-footer"><span>SETILLAR TITANS <b>·</b> AN EDUCATIONAL MISSION DESIGN GAME</span><span>SIMPLIFIED MODEL <b>·</b> NOT FOR FLIGHT DESIGN</span></footer></div>
}

export default App
