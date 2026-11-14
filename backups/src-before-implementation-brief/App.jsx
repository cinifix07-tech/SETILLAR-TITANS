import { useMemo, useState } from 'react'
import './styles/App.css'
import './styles/Dashboard.css'
import missionData from './data/missions.json' with { type: 'json' }
import simulationRules from './data/simulationRules.json' with { type: 'json' }
import EducationalGuide from './components/EducationalGuide.jsx'
import GameExplorer from './components/GameExplorer.jsx'
import MissionBuilder from './components/MissionBuilder.jsx'
import MissionDashboard from './components/MissionDashboard.jsx'
import MissionDebrief from './components/MissionDebrief.jsx'
import MissionSimulation from './components/MissionSimulation.jsx'
import { calculateMissionResources } from './engine/resourceCalculator.js'
import { simulateMission } from './engine/missionSimulator.js'
import { validateMission } from './engine/validationEngine.js'

function App() {
  const [view, setView] = useState('overview')
  const [step, setStep] = useState(0)
  const [config, setConfig] = useState(() => structuredClone(missionData.defaultConfig))
  const [result, setResult] = useState(null)
  const [running, setRunning] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [events, setEvents] = useState([])

  const calculation = useMemo(() => calculateMissionResources(config), [config])
  const validation = useMemo(() => validateMission(config, calculation), [config, calculation])
  const readiness = Math.max(0, Math.min(100, Math.round(Math.min(...Object.entries(calculation.margins).map(([key, margin]) => margin / calculation.limits[key])) * 100)))

  const patchConfig = (key, value) => {
    setConfig((current) => ({ ...current, [key]: value }))
    setResult(null)
    const labels = { objective: 'Mission objective updated', craft: 'Spacecraft configuration changed', instruments: 'Instrument payload updated', rocket: 'Launch vehicle selected', orbit: 'Target orbit changed', duration: 'Mission duration adjusted' }
    const details = {
      instruments: `${value.length} instrument${value.length === 1 ? '' : 's'} selected`,
      duration: `${value} months planned`,
      craft: value,
      rocket: value,
      objective: missionData.objectives[value],
      orbit: value.toUpperCase(),
    }
    setEvents((current) => [{ id: Date.now(), title: labels[key], detail: details[key] ?? '', time: 'JUST NOW' }, ...current].slice(0, 4))
  }

  const toggleInstrument = (id) => {
    const next = config.instruments.includes(id)
      ? config.instruments.filter((instrumentId) => instrumentId !== id)
      : [...config.instruments, id]
    patchConfig('instruments', next)
  }

  const launch = () => {
    if (running) return
    setRunning(true)
    setView('simulation')
    window.setTimeout(() => {
      const simulation = simulateMission(config, calculation)
      setResult(simulation)
      setEvents([
        { id: Date.now(), title: 'Simulation complete', detail: `${simulation.outcome} • score ${simulation.quality}/100`, time: 'LATEST' },
        { id: Date.now() + 1, title: 'Data link assessment', detail: `${calculation.data} modeled data points / ${calculation.limits.data} capacity`, time: 'FLIGHT EVENT' },
        { id: Date.now() + 2, title: 'Instrument campaign', detail: `${calculation.selected.length} instrument${calculation.selected.length === 1 ? '' : 's'} checked against power budget`, time: 'FLIGHT EVENT' },
      ])
      setRunning(false)
      setView('debrief')
    }, simulationRules.delayMilliseconds)
  }

  const openBuilder = (nextStep = 0) => {
    setStep(nextStep)
    setView('mission')
    setMenuOpen(false)
  }
  const openSimulation = () => {
    setMenuOpen(false)
    if (result) setView('simulation')
    else if (validation.valid) launch()
    else openBuilder(5)
  }
  const applyOrbit = (orbitId) => {
    patchConfig('orbit', orbitId)
    setStep(4)
    setView('mission')
    setMenuOpen(false)
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: '⌂', action: () => setView('overview') },
    { id: 'explorer', label: 'Game Explorer', icon: '◎', action: () => { setView('explorer'); setMenuOpen(false) } },
    { id: 'mission', label: 'Build Mission', icon: '⊕', action: () => openBuilder(0) },
    { id: 'resources', label: 'Resources', icon: '▥', action: () => openBuilder(2) },
    { id: 'simulation', label: 'Simulation', icon: '▷', action: openSimulation },
    { id: 'debrief', label: 'Debrief', icon: '▤', action: () => result && setView('debrief'), disabled: !result },
  ]
  const activeNav = view === 'mission' ? (step === 2 ? 'resources' : 'mission') : view

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#overview" onClick={(event) => { event.preventDefault(); setView('overview') }}><span className="brand-mark">✳</span><span>SETILLAR <b>TITANS</b><small>MISSION SYSTEMS · V5</small></span></a>
      <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-expanded={menuOpen}>☰</button>
      <nav className={`primary-nav ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">{navItems.map((item) => <button key={item.id} className={`nav-link ${activeNav === item.id ? 'active' : ''}`} onClick={item.action} disabled={item.disabled}><span>{item.icon}</span>{item.label}{item.id === 'debrief' && result && <i className="nav-new-dot"/>}</button>)}</nav>
      <div className="profile-area"><span className="systems-pill"><i/> SYSTEMS NOMINAL</span><button className="profile-button" onClick={() => { setProfileOpen(!profileOpen); setMenuOpen(false) }} aria-label="Explorer profile and settings" aria-expanded={profileOpen}><span className="profile-avatar">EX</span><span className="profile-copy"><b>Explorer</b><small>GUEST PILOT</small></span><span className="profile-chevron">⌄</span></button>{profileOpen && <div className="profile-menu"><b>EXPLORER MODE</b><span>Progress stays in this browser session.</span><button onClick={() => { setView('learn'); setProfileOpen(false) }}>SIMULATION ASSUMPTIONS <i>↗</i></button></div>}</div>
    </header>
    <main className="main-area">
      {view === 'overview' && <MissionDashboard calc={calculation} config={config} result={result} events={events} readiness={readiness} valid={validation.valid} running={running} onBuild={() => openBuilder(0)} onResources={() => openBuilder(2)} onLaunch={launch} onDebrief={() => result && setView('debrief')}/>}
      {view === 'explorer' && <GameExplorer selectedOrbit={config.orbit} onUseOrbit={applyOrbit}/>}
      {(view === 'mission' || view === 'resources') && <MissionBuilder view={view} step={step} setStep={setStep} config={config} calc={calculation} valid={validation.valid} running={running} patchConfig={patchConfig} toggleInstrument={toggleInstrument} launch={launch} onOverview={() => setView('overview')}/>}
      {view === 'simulation' && <MissionSimulation calc={calculation} running={running} result={result} onBack={() => openBuilder(5)}/>}
      {view === 'debrief' && <MissionDebrief result={result} onRetry={() => { setConfig(structuredClone(missionData.defaultConfig)); setStep(0); setResult(null); setEvents([]); setView('mission') }} onEdit={() => openBuilder(0)}/>}
      {view === 'learn' && <EducationalGuide onStart={() => openBuilder(0)}/>}
    </main>
  </div>
}

export default App
