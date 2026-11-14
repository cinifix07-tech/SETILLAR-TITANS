import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, Check, CircleAlert, FlaskConical, MapPin, ShieldAlert, Target, X } from 'lucide-react'
import { calculateGameResources, getDestination } from '../engine/gameEngine.js'
import { getMissionReference } from '../data/destinationMissions.js'
import '../styles/DestinationMissionBriefing.css'

const steps = [
  ['MISSION OVERVIEW', MapPin],
  ['SCIENCE BRIEFING', FlaskConical],
  ['MISSION CHALLENGE', ShieldAlert],
  ['PLANNING TASK', Target],
  ['CONFIRM MISSION', Check],
]

function ResourceMetric({ label, value, limit, unit }) {
  const over = value > limit
  return <div className={`brief-resource ${over ? 'over' : ''}`}>
    <span>{label}</span>
    <b>{value} / {limit} {unit}</b>
    <small>{over ? `Over the configured limit by ${Math.round(value - limit)} ${unit}` : `${Math.round(limit - value)} ${unit} remaining`}</small>
  </div>
}

function DestinationArtwork({ destination }) {
  return <div className={`destination-art briefing-destination-art ${destination.id}`} role="img" aria-label={`Illustrative route from Earth to ${destination.name}`}>
    <div className="destination-stars"/><div className="destination-orbit"/>
    <div className="destination-earth" aria-hidden="true"><i/></div>
    <div className={`destination-target ${destination.id}`} aria-hidden="true"><i/><i/></div>
    <small className="destination-route-label">EARTH DEPARTURE / {destination.name.toUpperCase()}</small>
    <small className="destination-network-label">ILLUSTRATIVE MISSION ROUTE</small>
  </div>
}

export default function DestinationMissionBriefing({ open, mission, config, initialChoiceId = null, onClose, onBuild, onChoiceChange }) {
  const [step, setStep] = useState(0)
  const [choiceId, setChoiceId] = useState(initialChoiceId)
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const onBuildRef = useRef(onBuild)
  const destination = mission ? getDestination(mission.destination) : null
  const reference = mission ? getMissionReference(mission.destination) : null
  const selectedChoice = mission?.choices.find((choice) => choice.id === choiceId) ?? null
  const modeled = useMemo(() => mission ? calculateGameResources({
    ...config,
    destination: mission.destination,
    objective: mission.builderObjective,
  }) : null, [config, mission])

  useEffect(() => { onCloseRef.current = onClose; onBuildRef.current = onBuild }, [onClose, onBuild])
  useEffect(() => {
    if (!open || !mission) return undefined
    const previous = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const handleKeys = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current?.()
        return
      }
      if (event.key !== 'Tab') return
      const controls = dialogRef.current?.querySelectorAll('button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])')
      if (!controls?.length) return
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', handleKeys)
    return () => {
      document.removeEventListener('keydown', handleKeys)
      document.body.style.overflow = previousOverflow
      previous?.focus?.()
    }
  }, [open, mission])

  if (!open || !mission || !destination || !modeled) return null
  const next = () => setStep((current) => Math.min(steps.length - 1, current + 1))
  const back = () => setStep((current) => Math.max(0, current - 1))
  const buildMission = () => {
    if (!destination?.id || !mission.builderObjective || !selectedChoice) return
    onBuildRef.current?.({ destination: destination.id, mission, choice: selectedChoice })
  }
  const scienceTarget = destination.scienceGoal
  const fuelGuide = destination.travelFuel

  return <div className="destination-briefing-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onCloseRef.current?.() }}>
    <section ref={dialogRef} className="destination-briefing-dialog" role="dialog" aria-modal="true" aria-labelledby="destination-briefing-title" aria-describedby="destination-briefing-description">
      <header className="destination-briefing-header">
        <div><span className="game-eyebrow">MISSION SELECT / {destination.name.toUpperCase()}</span><h2 id="destination-briefing-title">{mission.title}</h2><p id="destination-briefing-description">Complete the planning task to save your choice with this mission. It does not change the game’s resource calculations.</p></div>
        <button ref={closeRef} className="destination-briefing-close" onClick={() => onCloseRef.current?.()} aria-label="Close mission briefing"><X size={18}/></button>
      </header>

      <div className="destination-briefing-progress">
        <div className="destination-briefing-progress-top"><span>BRIEFING STEP {String(step + 1).padStart(2, '0')} / 05</span><b>{steps[step][0]}</b></div>
        <div className="destination-briefing-progress-track" role="progressbar" aria-label="Mission briefing progress" aria-valuemin="1" aria-valuemax="5" aria-valuenow={step + 1}><i style={{ width: `${((step + 1) / steps.length) * 100}%` }}/></div>
        <nav className="destination-briefing-stepper" aria-label="Briefing steps">{steps.map(([label, Icon], index) => <div className={index < step ? 'done' : index === step ? 'current' : ''} key={label}><span><Icon size={13}/></span><small>{label}</small></div>)}</nav>
      </div>

      <div className="destination-briefing-content" key={step}>
        {step === 0 && <div className="briefing-overview">
          <DestinationArtwork destination={destination}/>
          <div className="briefing-copy"><span className="briefing-tag">{destination.difficulty} / {destination.name.toUpperCase()}</span><h3>Mission overview</h3><p>{mission.summary}</p><div className="briefing-objective"><b>SCIENCE OBJECTIVE</b><span>{mission.scienceObjective}</span></div><div className="briefing-facts"><span><b>SCIENCE TARGET</b>{scienceTarget} pts</span><span><b>DESTINATION FUEL GUIDE</b>{fuelGuide} units</span></div></div>
        </div>}

        {step === 1 && <article className="briefing-reading"><span className="briefing-icon"><BookOpen size={20}/></span><span className="game-eyebrow">SCIENCE BRIEFING</span><h3>Why this mission matters</h3><p>{mission.whyItMatters}</p><div className="briefing-learning-note"><b>LEARNING TAKEAWAY</b><span>{mission.takeaway}</span></div><small>Educational context: scientific observations can support further study; they do not by themselves prove a conclusion.</small>{reference&&<a className="briefing-source-link" href={reference.url} target="_blank" rel="noreferrer">{reference.label} ↗</a>}</article>}

        {step === 2 && <article className="briefing-reading"><span className="briefing-icon warning"><ShieldAlert size={20}/></span><span className="game-eyebrow">ENVIRONMENTAL CHALLENGE</span><h3>{mission.environmentTitle}</h3><p>Consider these conditions while planning your spacecraft and science observations.</p><ul className="briefing-challenge-list">{mission.environment.map((item) => <li key={item}><CircleAlert size={15}/><span>{item}</span></li>)}</ul><div className="briefing-learning-note"><b>PLANNING REMINDER</b><span>These are educational scenario notes. The game only applies resource and mission rules that already exist in its model.</span></div></article>}

        {step === 3 && <article className="briefing-planning"><span className="game-eyebrow">INTERACTIVE PLANNING TASK</span><h3>{mission.planningPrompt}</h3><p>Choose one option. Read its advantage and trade-off before moving on.</p><div className="briefing-choice-list" role="group" aria-label={mission.planningPrompt}>{mission.choices.map((option, index) => <button type="button" className={`briefing-choice ${choiceId === option.id ? 'selected' : ''}`} onClick={() => { setChoiceId(option.id); onChoiceChange?.(mission.id, option.id) }} aria-pressed={choiceId === option.id} key={option.id}><span className="briefing-choice-letter">{String.fromCharCode(65 + index)}</span><span className="briefing-choice-copy"><b>{option.title}</b><small>{option.description}</small></span><span className="briefing-choice-check" aria-hidden="true">{choiceId === option.id ? '✓' : ''}</span></button>)}</div>{selectedChoice ? <div className="briefing-feedback" role="status"><b>DECISION RECORDED / {selectedChoice.title.toUpperCase()}</b><p>{selectedChoice.feedback}</p></div> : <p className="briefing-select-hint">Select one response to complete this planning step.</p>}<small className="briefing-educational-caveat">This learning choice is briefing metadata. It does not change the existing simulation calculations.</small></article>}

        {step === 4 && <div className="briefing-confirmation"><div className="briefing-confirmation-copy"><span className="briefing-icon success"><Check size={20}/></span><span className="game-eyebrow">MISSION READY FOR THE BUILDER</span><h3>{mission.title}</h3><p>{destination.name} · {mission.builderObjective}</p><div className="briefing-learning-note"><b>PLANNING DECISION</b><span>{selectedChoice?.title ?? 'No planning choice selected'}. {selectedChoice?.feedback ?? 'Return to the planning step and select an option.'}</span></div></div><section className="briefing-resource-summary" aria-label="Current spacecraft resource estimate"><div className="briefing-resource-heading"><div><span className="game-eyebrow">CURRENT CONFIGURATION / EDUCATIONAL ESTIMATE</span><h4>Resource preview</h4></div><small>{modeled.bus.name}</small></div><div className="briefing-resource-grid"><ResourceMetric label="Mission mass" value={modeled.mass} limit={modeled.limits.mass} unit="kg"/><ResourceMetric label="Electrical demand" value={modeled.power} limit={modeled.limits.power} unit="W"/><ResourceMetric label="Mission budget" value={modeled.budget} limit={modeled.limits.budget} unit="M credits"/><ResourceMetric label="Fuel needed / allocated" value={modeled.fuelNeeded} limit={Number(config.fuel) || 0} unit="units"/></div><p>Science target: {scienceTarget} pts · destination fuel guide: {fuelGuide} units. Estimates use your current spacecraft settings and the game’s existing formulas.</p></section></div>}
      </div>

      <footer className="destination-briefing-footer">
        <div className="destination-briefing-footer-links"><button className="briefing-text-button" onClick={() => onCloseRef.current?.()}>CHANGE DESTINATION</button><button className="briefing-text-button" onClick={() => onCloseRef.current?.()}>CLOSE</button></div>
        <div className="destination-briefing-footer-actions">{step > 0 && <button className="game-button secondary" onClick={back}><ArrowLeft size={14}/> BACK</button>}{step < steps.length - 1 ? <button className="game-button" onClick={next} disabled={step === 3 && !selectedChoice}>CONTINUE <ArrowRight size={14}/></button> : <button className="game-button briefing-build-button" onClick={buildMission} disabled={!selectedChoice}>BUILD THIS MISSION <ArrowRight size={15}/></button>}</div>
      </footer>
    </section>
  </div>
}
