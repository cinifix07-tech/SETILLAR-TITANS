import { useEffect, useState } from 'react'
import { getDestination } from '../engine/gameEngine.js'
import MissionFlightScene from './MissionFlightScene.jsx'
import SimulationWarning from './SimulationWarning.jsx'
import '../styles/OrbitalDebrisChallenge.css'

const Button = ({ children, className = '', ...props }) => <button className={`game-button ${className}`} {...props}>{children}</button>
const PageTitle = ({ title, children }) => <div className="game-title"><div className="game-eyebrow">FLIGHT OPERATIONS / LIVE SIMULATION</div><h1>{title}</h1><p>{children}</p></div>

export function MissionAssetStatus({ result }) {
  const r = result.resources
  const config = result.config
  const deployed = result.issues.length === 0
  const health = result.choice === 'continue' ? 84 : 100
  const remainingFuel = Math.max(0, config.fuel - r.fuelNeeded)
  return <section className="sim-asset-status" aria-label="Post game vehicle status">
    <div className="sim-asset-status-heading"><div><span className="game-eyebrow">MISSION ASSET STATUS / EDUCATIONAL MODEL</span><h3>Flight vehicle report</h3></div><span className="sim-status live"><i/>RUN COMPLETE</span></div>
    <div className="sim-asset-grid">
      <article><span>LAUNCH VEHICLE</span><b>{r.rocket.name}</b><small>{result.issues.length ? 'Launch not cleared by mission checks' : 'Launch phase modeled complete'}</small><small>Modeled launch capacity {r.limits.mass} kg / mission mass {r.mass} kg</small><small>Fuel allocation {config.fuel} units / modeled need {r.fuelNeeded} units / remaining {remainingFuel} units</small></article>
      <article><span>SPACECRAFT / SATELLITE</span><b>{r.bus.name}</b><small>{deployed ? 'Satellite deployment modeled complete' : 'Satellite deployment not confirmed by the model'}</small><small>Selected orbit {r.orbit.abbr} / {r.orbit.name}</small><small>Modeled health {health} percent / science returned {result.scienceReturned} of {r.sciencePotential} points</small></article>
    </div>
    <p>Values describe this game run and its educational rules. They are not live spacecraft telemetry.</p>
  </section>
}

export default function MissionSimulationView({ config, calc, validation, result, onComplete, onDebrief, onBack, snapshot, onSnapshot, onStarted }) {
  const [seconds, setSeconds] = useState(() => snapshot?.seconds ?? 0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(() => snapshot?.speed ?? 1)
  const [choice, setChoice] = useState(() => snapshot?.choice ?? null)
  const [finished, setFinished] = useState(() => Boolean(snapshot?.finished))
  const [immersive, setImmersive] = useState(() => Boolean(snapshot?.seconds))
  const [preflightOpen, setPreflightOpen] = useState(() => !snapshot?.seconds && !snapshot?.finished)
  const destination = getDestination(config.destination)
  const phase = seconds < 8 ? 'Launch' : seconds < 24 ? 'Transit' : seconds < 36 ? 'Arrival' : seconds < 58 ? 'Science' : 'Completion'
  const eventPending = seconds >= 8 && !choice && seconds < 60
  const labels = ['Launch', 'Transit', 'Arrival', 'Science', 'Completion']

  useEffect(() => {
    if (!playing || finished || eventPending) return undefined
    const timer = setInterval(() => setSeconds((current) => {
      const next = Math.min(60, current + 0.25 * speed)
      if (next >= 60) { setPlaying(false); setFinished(true) }
      return next
    }), 250)
    return () => clearInterval(timer)
  }, [playing, speed, seconds, choice, finished, eventPending])
  useEffect(() => { if (finished && !result) onComplete(choice ?? 'safe') }, [finished, result, onComplete, choice])
  useEffect(() => { onSnapshot({ seconds, speed, choice, finished }) }, [seconds, speed, choice, finished, onSnapshot])
  useEffect(() => {
    const pauseWhenHidden = () => { if (document.hidden) setPlaying(false) }
    document.addEventListener('visibilitychange', pauseWhenHidden)
    return () => document.removeEventListener('visibilitychange', pauseWhenHidden)
  }, [])

  const startMission = () => {
    if (!validation.valid) return
    setPreflightOpen(false)
    setImmersive(true)
    onStarted()
    setPlaying(true)
  }
  const restart = () => { setSeconds(0); setChoice(null); setFinished(false); setPlaying(false); setImmersive(false); setPreflightOpen(true) }

  return <>
    {!immersive && <PageTitle title={config.name || 'Mission simulation.'}>Accelerated educational scenario. Game time represents simplified mission phases, not elapsed flight time.</PageTitle>}
    <section className={`game-card sim-card${immersive ? ' sim-card-immersive' : ''}`}>
      <div className="sim-header"><div><span className="game-eyebrow">{phase.toUpperCase()} / {destination.name.toUpperCase()}</span><h2>{eventPending ? 'Decision required' : finished ? result?.outcome ?? 'Simulation complete' : playing ? 'Mission running' : seconds > 0 ? 'Mission paused' : 'Awaiting launch'}</h2><p>{calc.bus.name} / {calc.propulsion.name} propulsion / {calc.payload.length} science instruments</p></div><div className={`sim-status ${eventPending ? 'event-hold' : playing ? 'live' : ''}`}><i/>{eventPending ? 'DECISION REQUIRED' : playing ? 'SIM RUNNING' : finished ? 'COMPLETE' : 'PAUSED'}</div></div>
      <div className="sim-track"><i style={{ width: `${seconds / 60 * 100}%` }}/></div>
      <div className="phase-row">{labels.map((label, index) => <span className={labels.indexOf(phase) >= index ? 'passed' : ''} key={label}><i/>{label}</span>)}</div>
      <MissionFlightScene seconds={seconds} config={config} playing={playing} speed={speed} reducedMotion={Boolean(config.reducedMotion)}/>
      <div className="sim-live-stats"><div><small>FUEL REMAINING</small><b>{Math.max(0, config.fuel - Math.round(calc.fuelNeeded * seconds / 60))} units</b></div><div><small>SPACECRAFT HEALTH</small><b>{choice === 'continue' ? '84%' : '100%'}</b></div><div><small>SCIENCE RETURN</small><b>{Math.round(calc.sciencePotential * seconds / 60)} / {calc.sciencePotential} points</b></div><div><small>SIMULATION TIME</small><b>{Math.floor(seconds)} / 60 game seconds</b></div></div>
      <div className="sim-controls"><div><Button className="secondary" onClick={restart}>RESTART</Button><Button onClick={() => { if (!validation.valid) { onBack(); return } onStarted(); setImmersive(true); setPlaying(!playing) }} disabled={finished || preflightOpen}>{playing ? 'PAUSE' : seconds ? 'RESUME' : 'START LAUNCH'}</Button></div><div className="speed-controls" aria-label="Simulation speed">{[1, 2, 4].map((value) => <button className={speed === value ? 'active' : ''} key={value} onClick={() => setSpeed(value)}>{value}x</button>)}</div><Button className="danger" onClick={() => { if (window.confirm('Abort this simulation and return to the builder?')) { setPlaying(false); onBack() } }}>ABORT</Button></div>
      {eventPending && <SimulationWarning destination={destination.name} onChoose={(response) => { setChoice(response); setPlaying(true) }}/>}
      {!validation.valid && !preflightOpen && <div className="validation-list">{validation.issues.map((issue) => <p key={issue.code}>{issue.message}</p>)}</div>}
      {finished && result && <><MissionAssetStatus result={result}/><div className="sim-result"><b>{result.outcome} / {result.score} of 100</b><p>{result.eventEffect}</p><Button onClick={onDebrief}>VIEW MISSION DEBRIEF</Button></div></>}
      {preflightOpen && <div className="sim-preflight-scrim"><section className="sim-preflight-dialog" role="dialog" aria-modal="true" aria-labelledby="sim-preflight-title"><span className="game-eyebrow">MISSION BRIEF / PRE FLIGHT</span><h2 id="sim-preflight-title">Ready for launch</h2><p>Review your mission, then start the educational flight simulation. One game minute represents a simplified mission phase.</p><div className="sim-preflight-details"><div><small>DESTINATION</small><b>{destination.name}</b></div><div><small>LAUNCH VEHICLE</small><b>{calc.rocket.name}</b></div><div><small>SPACECRAFT</small><b>{calc.bus.name}</b></div><div><small>SELECTED ORBIT</small><b>{calc.orbit.abbr} / {calc.orbit.name}</b></div></div>{!validation.valid && <div className="validation-list" role="alert">{validation.issues.map((issue) => <p key={issue.code}>{issue.message}</p>)}</div>}<Button autoFocus className="sim-preflight-start" onClick={startMission} disabled={!validation.valid}>START GAME</Button><Button className="sim-preflight-back" onClick={onBack}>BACK TO MISSION BUILDER</Button><small className="sim-model-note">Educational simulation only. Orbit and resource values use simplified game rules.</small></section></div>}
    </section>
  </>
}