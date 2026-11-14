import { useEffect, useMemo, useRef, useState } from 'react'
import './styles/App.css'
import './styles/Dashboard.css'
import './styles/Game.css'
import missionData from './data/missions.json' with { type: 'json' }
import { calculateGameResources, destinations, simulateGameMission, validateGameMission } from './engine/gameEngine.js'
import { getOrbit } from './engine/resourceCalculator.js'
import { MissionGame } from './components/MissionGame.jsx'

const SAVE_KEY = 'setillar-titans-game-v5'
const freshConfig = () => ({ ...structuredClone(missionData.defaultConfig), name: 'Lunar Scout 001', destination: 'moon', objective: 'Polar ice survey', craft: 'pioneer', rocket: 'titan', propulsion: 'chemical', powerSource: 'solar', communications: 'deep', shielding: 'basic', fuel: 40, instruments: ['camera','thermal'], orbit: 'sso', reducedMotion: false })
function loadSave() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVE_KEY) ?? 'null')
    if (!parsed || typeof parsed !== 'object') return null
    const defaults = freshConfig()
    const rawConfig = parsed.config && typeof parsed.config === 'object' ? parsed.config : {}
    const config = { ...defaults, ...rawConfig, instruments: Array.isArray(rawConfig.instruments) ? rawConfig.instruments.filter((id) => typeof id === 'string') : defaults.instruments }
    if (!destinations.some((item) => item.id === config.destination)) config.destination = defaults.destination
    if (!['leo', 'sso', 'meo', 'geo'].includes(config.orbit)) config.orbit = defaults.orbit
    const savedSimulation = parsed.simulation && typeof parsed.simulation === 'object' ? parsed.simulation : {}
    const simulation = { seconds: Math.max(0, Math.min(60, Number(savedSimulation.seconds) || 0)), speed: [1,2,4].includes(savedSimulation.speed) ? savedSimulation.speed : 1, choice: ['safe','continue'].includes(savedSimulation.choice) ? savedSimulation.choice : null, finished: Boolean(savedSimulation.finished) }
    const result = parsed.result && typeof parsed.result.outcome === 'string' && typeof parsed.result.score === 'number' && parsed.result.resources && parsed.result.config ? parsed.result : null
    return { config, result, history: Array.isArray(parsed.history) ? parsed.history.filter((item) => item && typeof item.id === 'number') : [], discoveries: Array.isArray(parsed.discoveries) ? parsed.discoveries.filter((id) => destinations.some((item) => item.id === id)) : [], simulation, view: ['overview','explore','builder','simulation','debrief','orbit','academy','settings'].includes(parsed.view) ? parsed.view : 'overview' }
  } catch { return null }
}
function App() {
  const [saved] = useState(loadSave)
  const [view, setView] = useState(saved?.view ?? 'overview')
  const [config, setConfig] = useState(() => ({ ...freshConfig(), ...(saved?.config ?? {}) }))
  const [result, setResult] = useState(saved?.result ?? null)
  const [history, setHistory] = useState(saved?.history ?? [])
  const [discoveries, setDiscoveries] = useState(saved?.discoveries ?? [])
  const [simulation, setSimulation] = useState(saved?.simulation ?? { seconds: 0, speed: 1, choice: null, finished: false })
  const [orbitNotice, setOrbitNotice] = useState('')
  const completionRecorded = useRef(false)
  const calc = useMemo(() => calculateGameResources(config), [config])
  const validation = useMemo(() => validateGameMission(config, calc), [config, calc])

  useEffect(() => {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ config, result, history, discoveries, simulation, view: view === 'simulation' ? 'simulation' : view })) } catch { /* Private browsing or quota restrictions leave the session usable. */ }
  }, [config, result, history, discoveries, simulation, view])
  useEffect(() => {
    if (!orbitNotice) return undefined
    const timeout = window.setTimeout(() => setOrbitNotice(''), 4200)
    return () => window.clearTimeout(timeout)
  }, [orbitNotice])
  const patchConfig = (key, value) => {
    setConfig((current) => ({ ...current, [key]: value }))
    setResult(null)
  }
  const launch = () => {
    if (!validation.valid) { setView('builder'); return }
    completionRecorded.current = false
    setSimulation({ seconds: 0, speed: 1, choice: null, finished: false })
    setResult(null)
    setView('simulation')
  }
  const finishSimulation = (eventChoice) => {
    if (completionRecorded.current) return
    completionRecorded.current = true
    const final = simulateGameMission(config, calc, { eventChoice })
    setResult(final)
    setHistory((current) => [{ id: Date.now(), name: config.name, outcome: final.outcome, score: final.score, destination: calc.destination.name }, ...current].slice(0, 20))
    if (final.outcome === 'SUCCESS') setDiscoveries((current) => current.includes(config.destination) ? current : [...current, config.destination])
  }
  const newMission = (resetAll = false) => {
    if (resetAll) {
      setConfig(freshConfig()); setResult(null); setHistory([]); setDiscoveries([]); setSimulation({ seconds: 0, speed: 1, choice: null, finished: false }); setView('overview')
    } else {
      completionRecorded.current = false
      setSimulation({ seconds: 0, speed: 1, choice: null, finished: false }); setResult(null); setView('simulation')
    }
  }
  const freshMission = () => { setConfig(freshConfig()); setResult(null); setSimulation({ seconds: 0, speed: 1, choice: null, finished: false }); setView('explore') }
  const applyOrbit = (id) => { patchConfig('orbit', id); setView('builder'); setOrbitNotice(`${getOrbit(id).name} applied to your shared mission configuration. Other settings were kept.`) }
  return <MissionGame view={view} setView={setView} config={config} patchConfig={patchConfig} calc={calc} validation={validation} result={result} onNewMission={newMission} onFreshMission={freshMission} onLaunch={launch} onComplete={finishSimulation} onDebrief={() => setView('debrief')} onOrbit={applyOrbit} simulation={simulation} onSimulationChange={setSimulation} history={history} discoveries={discoveries} orbitNotice={orbitNotice}/>
}
export default App
