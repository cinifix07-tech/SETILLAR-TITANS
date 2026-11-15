import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { Activity, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Play, Radio, ShieldCheck, TriangleAlert } from 'lucide-react'
import SignalRelayChallenge from './SignalRelayChallenge.jsx'
import '../styles/SimulationWarning.css'

const RadiationDrill3D=lazy(()=>import('./RadiationDrill3D.jsx'))
function KeyCap({label,icon}){const Icon=icon;return <span className="game-keycap">{Icon?<Icon size={15}/>:label}</span>}

export default function SimulationWarning({destination,onChoose}){
  const [mode,setMode]=useState('alert')
  const [run,setRun]=useState({seconds:0,hits:0,complete:false})
  const [practiceSummary,setPracticeSummary]=useState('No practice challenge played')
  const dialogRef=useRef(null),firstActionRef=useRef(null)
  const finishRocketDrill=()=>{setPracticeSummary(run.hits>=3?'Rocket Debris Run ended after three collisions':'Rocket Debris Run completed');setMode('response')}

  useEffect(()=>{
    const previous=document.activeElement,previousOverflow=document.body.style.overflow
    document.body.style.overflow='hidden';firstActionRef.current?.focus()
    const keepFocusInside=event=>{
      if(event.key==='Escape'&&(mode==='game'||mode==='relay')){event.preventDefault();setPracticeSummary(`${mode==='game'?'Rocket Debris Run':'Signal Relay'} ended`);setMode('response');return}
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

  if(mode==='relay')return <div className="flight-warning-scrim radiation-game-scrim"><section ref={dialogRef} className="radiation-game-dialog relay-dialog" role="dialog" aria-modal="true" aria-label="Signal Relay challenge"><SignalRelayChallenge onClose={summary=>{setPracticeSummary(summary);setMode('response')}}/></section></div>

  if(mode==='game')return <div className="flight-warning-scrim radiation-game-scrim">
    <section ref={dialogRef} className="radiation-game-dialog" role="dialog" aria-modal="true" aria-labelledby="radiation-game-title">
      <header className="radiation-game-header"><div><span className="warning-kicker">RADIATION EVENT / OPTIONAL ARCADE DRILL</span><h2 id="radiation-game-title">Rocket Debris Run</h2><p>Steer the rocket-style practice craft around falling debris. The rocket is an arcade stand in for the spacecraft. The modeled mission vehicle continues separately.</p></div><button className="radiation-game-exit" onClick={()=>{setPracticeSummary('Rocket Debris Run skipped');setMode('response')}}>SKIP TO RESPONSE</button></header>
      <div className="radiation-game-hud"><span><b>{run.seconds} / 15</b> SECONDS</span><span>{run.hits} / 3 COLLISIONS</span><span>{run.complete?run.hits>=3?'PRACTICE ENDED':'DEBRIS FIELD CLEARED':'AVOID THE FALLING DEBRIS'}</span></div>
      <Suspense fallback={<div className="radiation-drill-loading" role="status">LOADING ROCKET AND DEBRIS FIELD...</div>}><RadiationDrill3D run={run} onProgress={setRun}/></Suspense>
      <footer className="radiation-game-footer"><p>Use W A S D or the arrow keys. Touch players can use the direction pad. Debris is a separate arcade obstacle, not a radiation effect.</p><button ref={firstActionRef} className="game-button radiation-continue" onClick={finishRocketDrill} disabled={!run.complete}>{run.complete?'CONTINUE TO FLIGHT RESPONSE':'SURVIVE 15 SECONDS OR REACH 3 COLLISIONS'}</button></footer>
    </section>
  </div>

  if(mode==='response')return <div className="flight-warning-scrim">
    <section ref={dialogRef} className="flight-warning-dialog" role="alertdialog" aria-modal="true" aria-labelledby="flight-warning-title" aria-describedby="flight-warning-description">
      <div className="warning-dialog-top"><span className="warning-icon"><TriangleAlert size={21}/></span><div><span className="warning-kicker">FLIGHT RESPONSE / EDUCATIONAL SCENARIO</span><h3 id="flight-warning-title">Choose a mission response</h3></div><span className="warning-severity"><i/> ACTION REQUIRED</span></div>
      <p id="flight-warning-description" className="warning-intro">The modeled radiation spike remains active during cruise to <b>{destination}</b>. Practice games are separate arcade activities. Choose a response to continue the mission simulation.</p>
      <div className="warning-readouts" aria-label="Event details"><div><small>FLIGHT PHASE</small><b><Activity size={13}/> CRUISE</b></div><div><small>SCENARIO</small><b>RADIATION SPIKE</b></div><div><small>PRACTICE</small><b>{practiceSummary}</b></div></div>
      <div className="warning-choice-heading"><span>SELECT A RESPONSE</span><small>Each choice changes this run's deterministic result.</small></div>
      <div className="warning-actions">
        <button ref={firstActionRef} className="warning-choice safe" onClick={()=>onChoose('safe')}><span className="warning-choice-icon"><ShieldCheck size={19}/></span><span className="warning-choice-copy"><b>ENTER SAFE MODE</b><small>Protect modeled spacecraft health. Science collection receives a small time penalty.</small></span><span className="warning-choice-effect">LOWER RISK</span></button>
        <button className="warning-choice continue" onClick={()=>onChoose('continue')}><span className="warning-choice-icon"><Activity size={19}/></span><span className="warning-choice-copy"><b>CONTINUE SCIENCE</b><small>Keep science operations active. The model applies a larger health and reliability penalty.</small></span><span className="warning-choice-effect">HIGHER RISK</span></button>
      </div>
      <button className="warning-replay-drill" onClick={()=>setMode('alert')}>BACK TO CHALLENGE SELECT</button>
      <p className="warning-footnote">Radiation penalties are simplified game assumptions. Falling debris is not shown as a physical radiation effect.</p>
    </section>
  </div>

  return <div className="flight-warning-scrim">
    <section ref={dialogRef} className="flight-warning-dialog game-alert-dialog" role="alertdialog" aria-modal="true" aria-labelledby="flight-warning-title" aria-describedby="flight-warning-description">
      <div className="warning-dialog-top"><span className="warning-icon"><TriangleAlert size={21}/></span><div><span className="warning-kicker">GAME ALERT / EDUCATIONAL SCENARIO</span><h3 id="flight-warning-title">Radiation event detected</h3></div><span className="warning-severity"><i/> PAUSED</span></div>
      <p id="flight-warning-description" className="warning-intro">A modeled radiation spike is detected during cruise to <b>{destination}</b>. Choose a practice game or go straight to the mission response. Arcade obstacles are separate from the radiation model.</p>
      <div className="warning-readouts" aria-label="Game alert details"><div><small>FLIGHT PHASE</small><b><Activity size={13}/> CRUISE</b></div><div><small>GAME OBJECTIVE</small><b>OPTIONAL TRANSIT PRACTICE</b></div><div><small>MISSION STATUS</small><b>SIMULATION PAUSED</b></div></div>
      <div className="game-alert-controls"><span>ROCKET STEERING CONTROLS</span><div className="game-alert-key-row"><KeyCap icon={ArrowUp}/></div><div className="game-alert-key-row"><KeyCap icon={ArrowLeft}/><KeyCap icon={ArrowDown}/><KeyCap icon={ArrowRight}/></div><div className="game-alert-key-row game-alert-wasd"><KeyCap label="W"/><KeyCap label="A"/><KeyCap label="S"/><KeyCap label="D"/><small>OR USE THE ARROW KEYS</small></div></div>
      <button ref={firstActionRef} className="game-alert-play" onClick={()=>{setRun({seconds:0,hits:0,complete:false});setMode('game')}}><Play size={21} fill="currentColor"/><span>PLAY</span><small>ROCKET DEBRIS RUN</small></button>
      <button className="game-alert-secondary" onClick={()=>setMode('relay')}><Radio size={17}/><span>PLAY SIGNAL RELAY</span><small>LOCK 3 COMMUNICATION WINDOWS</small></button>
      <button className="warning-replay-drill" onClick={()=>{setPracticeSummary('No practice challenge played');setMode('response')}}>SKIP PRACTICE / CHOOSE MISSION RESPONSE</button>
      <p className="warning-footnote">Educational arcade games only. Neither challenge changes resource calculations or mission scoring.</p>
    </section>
  </div>
}
