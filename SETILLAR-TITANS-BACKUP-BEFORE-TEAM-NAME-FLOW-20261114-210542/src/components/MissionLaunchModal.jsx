import { useEffect, useRef } from 'react'
import { getDestination } from '../engine/gameEngine.js'
import { getOrbit } from '../engine/resourceCalculator.js'
import MissionFlightScene from './MissionFlightScene.jsx'
import '../styles/MissionLaunchModal.css'

export default function MissionLaunchModal({ open, config, calc, onClose, onStart }) {
  const closeButton = useRef(null)
  const destination = getDestination(config.destination)
  const orbit = getOrbit(config.orbit ?? 'sso')

  useEffect(() => {
    if (!open) return undefined
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') {
        const dialog = event.currentTarget.querySelector('[role="dialog"]')
        const items = dialog?.querySelectorAll('button:not(:disabled)')
        if (!items?.length) return
        const first = items[0]
        const last = items[items.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null
  return <div className="launch-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section className="launch-modal" role="dialog" aria-modal="true" aria-labelledby="launch-modal-title" aria-describedby="launch-modal-note">
      <header className="launch-modal-header">
        <div><span className="game-eyebrow">MISSION SIMULATION / PRE-LAUNCH</span><h2 id="launch-modal-title">{config.name || 'Untitled mission'}</h2><p>{calc.bus.name} · {destination.name} · {orbit.abbr} orbit</p></div>
        <button ref={closeButton} className="launch-modal-close" onClick={onClose} aria-label="Close launch preview">×</button>
      </header>
      <div className="launch-modal-scene"><MissionFlightScene seconds={0} config={config} showMascot/><div className="launch-mascot-note" id="launch-modal-note"><span aria-hidden="true">✦</span> ASTRONAUT MASCOT / VISUALIZATION ONLY — THIS IS AN UNCREWED SPACECRAFT</div></div>
      <div className="launch-modal-details">
        <div><small>DESTINATION</small><b>{destination.name}</b></div>
        <div><small>SPACECRAFT</small><b>{calc.bus.name}</b></div>
        <div><small>SELECTED ORBIT</small><b>{orbit.abbr} · {orbit.name}</b></div>
      </div>
      <footer className="launch-modal-actions"><span>Illustrative flight sequence · not to scale</span><div><button className="game-button secondary" onClick={onClose}>BACK TO REVIEW</button><button className="game-button" onClick={onStart}>▶ PLAY SIMULATION</button></div></footer>
    </section>
  </div>
}
