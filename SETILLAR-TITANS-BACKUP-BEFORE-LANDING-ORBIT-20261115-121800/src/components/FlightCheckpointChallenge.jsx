import { Suspense, lazy, useState } from 'react'
import OrbitalDebrisChallenge from './OrbitalDebrisChallenge.jsx'
import SignalRelayChallenge from './SignalRelayChallenge.jsx'
import '../styles/SimulationWarning.css'

const RadiationDrill3D = lazy(() => import('./RadiationDrill3D.jsx'))

export default function FlightCheckpointChallenge({ type, onComplete }) {
  const [run, setRun] = useState({ seconds: 0, hits: 0, complete: false })

  if (type === 'orbital') return <OrbitalDebrisChallenge onClose={onComplete}/>
  if (type === 'signal') return <div className="flight-warning-scrim radiation-game-scrim"><section className="radiation-game-dialog relay-dialog" role="dialog" aria-modal="true" aria-label="Transit checkpoint: Signal Relay"><SignalRelayChallenge onClose={onComplete}/></section></div>

  return <div className="flight-warning-scrim radiation-game-scrim">
    <section className="radiation-game-dialog" role="dialog" aria-modal="true" aria-labelledby="launch-challenge-title">
      <header className="radiation-game-header"><div><span className="warning-kicker">LAUNCH CHECKPOINT / MINI GAME</span><h2 id="launch-challenge-title">Rocket Debris Run</h2><p>Practice steering a launch vehicle around falling debris. This arcade activity is separate from the mission model.</p></div><button className="radiation-game-exit" onClick={onComplete}>SKIP THIS CHALLENGE</button></header>
      <div className="radiation-game-hud"><span><b>{run.seconds} / 15</b> SECONDS</span><span>{run.hits} / 3 COLLISIONS</span><span>{run.complete ? run.hits >= 3 ? 'PRACTICE ENDED' : 'DEBRIS FIELD CLEARED' : 'AVOID THE FALLING DEBRIS'}</span></div>
      <Suspense fallback={<div className="radiation-drill-loading" role="status">LOADING ROCKET AND DEBRIS FIELD...</div>}><RadiationDrill3D run={run} onProgress={setRun}/></Suspense>
      <footer className="radiation-game-footer"><p>Use W A S D or the arrow keys. Touch players can use the direction pad. Debris is an arcade obstacle, not a radiation effect.</p><button className="game-button radiation-continue" onClick={onComplete} disabled={!run.complete}>{run.complete ? 'CONTINUE SIMULATION' : 'SURVIVE 15 SECONDS OR REACH 3 COLLISIONS'}</button></footer>
    </section>
  </div>
}
