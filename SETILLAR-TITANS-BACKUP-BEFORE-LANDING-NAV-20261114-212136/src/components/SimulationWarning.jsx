import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { Activity, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Play, ShieldCheck, TriangleAlert } from 'lucide-react'
import '../styles/SimulationWarning.css'

const RadiationDrill3D=lazy(()=>import('./RadiationDrill3D.jsx'))

function KeyCap({label,icon}){const Icon=icon;return <span className="game-keycap">{Icon?<Icon size={15}/>:label}</span>}

export default function SimulationWarning({destination,onChoose}) {
  const [mode,setMode]=useState('alert'),[signalsFound,setSignalsFound]=useState(0)
  const dialogRef=useRef(null),firstActionRef=useRef(null)
  useEffect(()=>{
    const previous=document.activeElement,previousOverflow=document.body.style.overflow
    document.body.style.overflow='hidden';firstActionRef.current?.focus()
    const keepFocusInside=(event)=>{
      if(event.key==='Escape'&&mode==='game'){event.preventDefault();setMode('response');return}
      if(event.key!=='Tab')return
      const actions=dialogRef.current?.querySelectorAll('button:not(:disabled)')
      if(!actions?.length)return
      const first=actions[0],last=actions[actions.length-1]
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    }
    document.addEventListener('keydown',keepFocusInside)
    return()=>{document.removeEventListener('keydown',keepFocusInside);document.body.style.overflow=previousOverflow;previous?.focus?.()}
  },[mode])

  if(mode==='game')return <div className="flight-warning-scrim radiation-game-scrim">
    <section ref={dialogRef} className="radiation-game-dialog" role="dialog" aria-modal="true" aria-labelledby="radiation-game-title">
      <header className="radiation-game-header"><div><span className="warning-kicker">GAME ALERT / RADIATION NAVIGATION DRILL</span><h2 id="radiation-game-title">Pilot the signal run</h2><p>Guide the alien UFO and collect the three cyan beacons. This optional practice does not change your mission score.</p></div><button className="radiation-game-exit" onClick={()=>setMode('response')}>SKIP TO RESPONSE</button></header>
      <div className="radiation-game-hud"><span><b>{signalsFound} / 3</b> SIGNALS</span><span>{signalsFound===3?'ROUTE CLEAR':'COLLECT THE GLOWING BEACONS'}</span><span className="radiation-game-hint">WASD / ARROW KEYS</span></div>
      <Suspense fallback={<div className="radiation-drill-loading" role="status">INITIALIZING 3D NAVIGATION DRILL…</div>}><RadiationDrill3D progress={signalsFound} onProgress={setSignalsFound} done={signalsFound===3}/></Suspense>
      <footer className="radiation-game-footer"><p>Keyboard: ↑ ↓ ← → or W A S D · Touch: use the direction pad · Educational arcade drill only.</p><button ref={firstActionRef} className="game-button radiation-continue" onClick={()=>setMode('response')} disabled={signalsFound<3}>{signalsFound===3?'CONTINUE TO FLIGHT RESPONSE':'COLLECT ALL 3 TO CONTINUE'}</button></footer>
    </section>
  </div>

  if(mode==='response')return <div className="flight-warning-scrim">
    <section ref={dialogRef} className="flight-warning-dialog" role="alertdialog" aria-modal="true" aria-labelledby="flight-warning-title" aria-describedby="flight-warning-description">
      <div className="warning-dialog-top"><span className="warning-icon"><TriangleAlert size={21}/></span><div><span className="warning-kicker">FLIGHT RESPONSE / EDUCATIONAL SCENARIO</span><h3 id="flight-warning-title">Choose a mission response</h3></div><span className="warning-severity"><i/> ACTION REQUIRED</span></div>
      <p id="flight-warning-description" className="warning-intro">The modeled radiation spike is still active during cruise to <b>{destination}</b>. The UFO navigation drill was a separate practice game; these choices determine the mission simulation outcome.</p>
      <div className="warning-readouts" aria-label="Event details"><div><small>FLIGHT PHASE</small><b><Activity size={13}/> CRUISE</b></div><div><small>SCENARIO</small><b>RADIATION SPIKE</b></div><div><small>DRILL PRACTICE</small><b>{signalsFound} / 3 SIGNALS</b></div></div>
      <div className="warning-choice-heading"><span>SELECT A RESPONSE</span><small>Each choice changes this run's deterministic result.</small></div>
      <div className="warning-actions">
        <button ref={firstActionRef} className="warning-choice safe" onClick={()=>onChoose('safe')}><span className="warning-choice-icon"><ShieldCheck size={19}/></span><span className="warning-choice-copy"><b>ENTER SAFE MODE</b><small>Protect modeled spacecraft health. Science collection receives a small time penalty.</small></span><span className="warning-choice-effect">LOWER RISK</span></button>
        <button className="warning-choice continue" onClick={()=>onChoose('continue')}><span className="warning-choice-icon"><Activity size={19}/></span><span className="warning-choice-copy"><b>CONTINUE SCIENCE</b><small>Keep science operations active. The model applies a larger health and reliability penalty.</small></span><span className="warning-choice-effect">HIGHER RISK</span></button>
      </div>
      <button className="warning-replay-drill" onClick={()=>setMode('alert')}>← BACK TO GAME ALERT</button>
      <p className="warning-footnote">Educational model only · This event and its effects are simplified gameplay assumptions.</p>
    </section>
  </div>

  return <div className="flight-warning-scrim">
    <section ref={dialogRef} className="flight-warning-dialog game-alert-dialog" role="alertdialog" aria-modal="true" aria-labelledby="flight-warning-title" aria-describedby="flight-warning-description">
      <div className="warning-dialog-top"><span className="warning-icon"><TriangleAlert size={21}/></span><div><span className="warning-kicker">GAME ALERT / EDUCATIONAL SCENARIO</span><h3 id="flight-warning-title">Radiation event detected</h3></div><span className="warning-severity"><i/> PAUSED</span></div>
      <p id="flight-warning-description" className="warning-intro">A modeled radiation spike is detected during cruise to <b>{destination}</b>. Start the 3D navigation drill to pilot an alien-style UFO and practice steering through the signal field.</p>
      <div className="warning-readouts" aria-label="Game alert details"><div><small>FLIGHT PHASE</small><b><Activity size={13}/> CRUISE</b></div><div><small>GAME OBJECTIVE</small><b>COLLECT 3 SIGNALS</b></div><div><small>MISSION STATUS</small><b>SIMULATION PAUSED</b></div></div>
      <div className="game-alert-controls"><span>STEERING CONTROLS</span><div className="game-alert-key-row"><KeyCap icon={ArrowUp}/></div><div className="game-alert-key-row"><KeyCap icon={ArrowLeft}/><KeyCap icon={ArrowDown}/><KeyCap icon={ArrowRight}/></div><div className="game-alert-key-row game-alert-wasd"><KeyCap label="W"/><KeyCap label="A"/><KeyCap label="S"/><KeyCap label="D"/><small>OR USE THE ARROW KEYS</small></div></div>
      <button ref={firstActionRef} className="game-alert-play" onClick={()=>setMode('game')}><Play size={21} fill="currentColor"/><span>PLAY</span><small>START UFO NAVIGATION DRILL</small></button>
      <p className="warning-footnote">The practice game is optional and does not affect the mission score. Choose a modeled flight response after the drill.</p>
    </section>
  </div>
}
