import { useEffect, useRef, useState } from 'react'
import { Activity, Play, ShieldCheck, TriangleAlert } from 'lucide-react'
import '../styles/SimulationWarning.css'

export default function SimulationWarning({ destination, onChoose }) {
  const [mode, setMode] = useState('alert')
  const dialogRef = useRef(null)
  const firstActionRef = useRef(null)

  useEffect(() => {
    const previous = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    firstActionRef.current?.focus()
    const keepFocusInside = (event) => {
      if (event.key === 'Escape' && mode === 'response') {
        event.preventDefault()
        setMode('alert')
        return
      }
      if (event.key !== 'Tab') return
      const actions = dialogRef.current?.querySelectorAll('button:not(:disabled)')
      if (!actions?.length) return
      const first = actions[0]
      const last = actions[actions.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', keepFocusInside)
    return () => {
      document.removeEventListener('keydown', keepFocusInside)
      document.body.style.overflow = previousOverflow
      previous?.focus?.()
    }
  }, [mode])

  if (mode === 'response') return <div className="flight-warning-scrim">
    <section ref={dialogRef} className="flight-warning-dialog" role="alertdialog" aria-modal="true" aria-labelledby="flight-warning-title" aria-describedby="flight-warning-description">
      <div className="warning-dialog-top"><span className="warning-icon"><TriangleAlert size={21}/></span><div><span className="warning-kicker">FLIGHT RESPONSE / EDUCATIONAL SCENARIO</span><h3 id="flight-warning-title">Choose a mission response</h3></div><span className="warning-severity"><i/> ACTION REQUIRED</span></div>
      <p id="flight-warning-description" className="warning-intro">The modeled radiation spike remains active during cruise to <b>{destination}</b>. Choose how the spacecraft responds to continue the mission simulation.</p>
      <div className="warning-readouts" aria-label="Event details"><div><small>FLIGHT PHASE</small><b><Activity size={13}/> CRUISE</b></div><div><small>SCENARIO</small><b>RADIATION SPIKE</b></div><div><small>MODEL STATUS</small><b>SIMULATION PAUSED</b></div></div>
      <div className="warning-choice-heading"><span>SELECT A RESPONSE</span><small>Each choice changes this run's deterministic result.</small></div>
      <div className="warning-actions">
        <button ref={firstActionRef} className="warning-choice safe" onClick={() => onChoose('safe')}><span className="warning-choice-icon"><ShieldCheck size={19}/></span><span className="warning-choice-copy"><b>ENTER SAFE MODE</b><small>Protect modeled spacecraft health. Science collection receives a small time penalty.</small></span><span className="warning-choice-effect">LOWER RISK</span></button>
        <button className="warning-choice continue" onClick={() => onChoose('continue')}><span className="warning-choice-icon"><Activity size={19}/></span><span className="warning-choice-copy"><b>CONTINUE SCIENCE</b><small>Keep science operations active. The model applies a larger health and reliability penalty.</small></span><span className="warning-choice-effect">HIGHER RISK</span></button>
      </div>
      <p className="warning-footnote">Radiation effects use simplified educational game assumptions. The arcade mini games occur at separate flight checkpoints.</p>
    </section>
  </div>

  return <div className="flight-warning-scrim">
    <section ref={dialogRef} className="flight-warning-dialog game-alert-dialog" role="alertdialog" aria-modal="true" aria-labelledby="flight-warning-title" aria-describedby="flight-warning-description">
      <div className="warning-dialog-top"><span className="warning-icon"><TriangleAlert size={21}/></span><div><span className="warning-kicker">FLIGHT EVENT / EDUCATIONAL SCENARIO</span><h3 id="flight-warning-title">Radiation event detected</h3></div><span className="warning-severity"><i/> PAUSED</span></div>
      <p id="flight-warning-description" className="warning-intro">A modeled radiation spike is detected during cruise to <b>{destination}</b>. This pause is for the mission response. Mini games appear separately at their launch, transit, and approach checkpoints.</p>
      <div className="warning-readouts" aria-label="Event details"><div><small>FLIGHT PHASE</small><b><Activity size={13}/> CRUISE</b></div><div><small>SCENARIO</small><b>RADIATION SPIKE</b></div><div><small>MODEL STATUS</small><b>SIMULATION PAUSED</b></div></div>
      <button ref={firstActionRef} className="game-alert-play" onClick={() => setMode('response')}><Play size={21} fill="currentColor"/><span>REVIEW MISSION RESPONSE</span><small>CHOOSE HOW THE SPACECRAFT WILL RESPOND</small></button>
      <p className="warning-footnote">Radiation is represented by a modeled event. Falling debris is a separate arcade obstacle and is not shown as radiation.</p>
    </section>
  </div>
}
