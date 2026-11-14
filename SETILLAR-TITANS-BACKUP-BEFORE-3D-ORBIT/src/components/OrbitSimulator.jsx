import { useEffect, useMemo, useRef, useState } from 'react'
import { getOrbit, orbitOrder, orbitPosition } from '../engine/resourceCalculator.js'
import '../styles/OrbitSimulator.css'

const stars = [[62,57],[144,108],[220,37],[301,92],[380,53],[544,88],[612,35],[692,101],[775,54],[858,87],[93,215],[184,192],[263,396],[338,455],[578,414],[674,379],[763,449],[843,317],[43,358],[890,203],[713,247],[320,180],[590,186],[119,433],[810,161],[479,42],[455,474],[40,129],[884,429],[227,275]]
const speedOptions = [1, 2, 5]

function Satellite({ x, y, angle }) {
  return <g transform={`translate(${x} ${y}) rotate(${angle})`} className="orbit-satellite" aria-hidden="true">
    <rect x="-25" y="-4" width="14" height="8" rx="1" fill="#38c9ef" stroke="#b6f2ff" strokeWidth="1"/>
    <path d="M-20 -4V4M-15 -4V4M11 -4V4M16 -4V4" stroke="#09243a" strokeWidth="1"/>
    <rect x="-10" y="-7" width="20" height="14" rx="2" fill="#d9e7ed" stroke="#f5fdff" strokeWidth="1"/>
    <rect x="-5" y="-5" width="10" height="10" rx="1" fill="#315878"/>
    <path d="M0 -7V-14M-3 -14H3" stroke="#d6f8ff" strokeWidth="1.5"/>
    <circle cx="0" cy="0" r="2" fill="#35d5ff"/>
  </g>
}

export default function OrbitSimulator({ selectedOrbit = 'sso', onUseOrbit }) {
  const [orbitId, setOrbitId] = useState(selectedOrbit)
  const [phase, setPhase] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [reducedMotion, setReducedMotion] = useState(false)
  const phaseRef = useRef(0)
  const orbit = getOrbit(orbitId)
  const position = useMemo(() => orbitPosition(phase, orbit), [phase, orbit])
  const progress = Math.round(phase * 100)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncPreference = () => {
      setReducedMotion(preference.matches)
      if (preference.matches) setPlaying(false)
    }
    syncPreference()
    preference.addEventListener?.('change', syncPreference)
    const stopWhenHidden = () => { if (document.hidden) setPlaying(false) }
    document.addEventListener('visibilitychange', stopWhenHidden)
    return () => {
      preference.removeEventListener?.('change', syncPreference)
      document.removeEventListener('visibilitychange', stopWhenHidden)
    }
  }, [])

  useEffect(() => {
    if (!playing) return undefined
    let frame = 0
    let previous = 0
    let lastPaint = 0
    const tick = (time) => {
      if (previous) {
        const elapsed = Math.min(time - previous, 80)
        phaseRef.current = (phaseRef.current + elapsed / 1000 * orbit.angularRate * speed / (Math.PI * 2)) % 1
        if (time - lastPaint >= 32) {
          setPhase(phaseRef.current)
          lastPaint = time
        }
      }
      previous = time
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [playing, speed, orbit.angularRate])

  const selectOrbit = (id) => setOrbitId(id)
  const restart = () => {
    phaseRef.current = 0
    setPhase(0)
    setPlaying(!reducedMotion)
  }
  const zoomBy = (delta) => setZoom((current) => Math.max(0.78, Math.min(1.3, Number((current + delta).toFixed(2)))))

  return <section className="orbit-explorer" aria-labelledby="orbit-explorer-title">
    <div className="orbit-explorer-heading"><div><span className="section-index">GAME EXPLORER / ORBIT LAB</span><h2 id="orbit-explorer-title">Explore Earth’s orbits</h2><p>Select an orbit to see its path and learn what it can do.</p></div><span className="orbit-illustrative-tag">EDUCATIONAL MODEL</span></div>
    <div className="orbit-selectors" role="group" aria-label="Select an orbit">{orbitOrder.map((id) => {
      const profile = getOrbit(id)
      return <button key={id} className={`orbit-select-card ${orbitId === id ? 'selected' : ''}`} onClick={() => selectOrbit(id)} aria-pressed={orbitId === id}><span className="orbit-select-top"><b>{profile.abbr}</b><span>{orbitId === id ? '●' : '○'}</span></span><strong>{profile.name}</strong><small>{profile.altitude}</small></button>
    })}</div>
    <div className="orbit-main-grid">
      <div className="orbit-visual-column">
        <div className="orbit-scene-wrap">
          <svg className="orbit-scene" viewBox="0 0 920 520" role="img" aria-labelledby="orbit-scene-title orbit-scene-desc">
            <title id="orbit-scene-title">Animated {orbit.abbr} orbit around Earth</title>
            <desc id="orbit-scene-desc">Illustrative space view with a glowing Earth, a {orbit.abbr} orbital path, and satellite at {progress} percent around the animated route.</desc>
            <defs>
              <radialGradient id="ocean-fill" cx="35%" cy="29%" r="76%"><stop offset="0" stopColor="#3cbad4"/><stop offset=".55" stopColor="#12658f"/><stop offset="1" stopColor="#071d3b"/></radialGradient>
              <radialGradient id="earth-shade" cx="35%" cy="28%" r="80%"><stop offset=".5" stopColor="#fff" stopOpacity="0"/><stop offset="1" stopColor="#020a19" stopOpacity=".76"/></radialGradient>
              <radialGradient id="earth-atmosphere"><stop offset=".69" stopColor="#35d5ff" stopOpacity="0"/><stop offset=".86" stopColor="#35d5ff" stopOpacity=".08"/><stop offset=".98" stopColor="#35d5ff" stopOpacity=".33"/><stop offset="1" stopColor="#35d5ff" stopOpacity="0"/></radialGradient>
              <clipPath id="earth-clip"><circle cx="460" cy="260" r="82"/></clipPath>
              <filter id="earth-glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="12"/></filter>
              <filter id="sat-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="5"/></filter>
            </defs>
            <rect width="920" height="520" fill="#06101d"/>
            <g className="orbit-stars">{stars.map(([x,y], index) => <circle key={`${x}-${y}`} cx={x} cy={y} r={index % 4 === 0 ? 1.4 : .8} fill="#b8d8f2" opacity={index % 3 === 0 ? '.7' : '.36'}/>)}</g>
            <g className="orbit-camera" transform={`translate(460 260) scale(${zoom}) translate(-460 -260)`}>
              <ellipse cx="460" cy="260" rx={orbit.radiusX} ry={orbit.radiusY} transform={`rotate(${orbit.rotation} 460 260)`} fill="none" stroke="#35d5ff" strokeOpacity=".13" strokeWidth="8" filter="url(#earth-glow)"/>
              <ellipse cx="460" cy="260" rx={orbit.radiusX} ry={orbit.radiusY} transform={`rotate(${orbit.rotation} 460 260)`} fill="none" stroke="#35d5ff" strokeOpacity=".78" strokeWidth="1.5" strokeDasharray="5 5"/>
              <ellipse cx="460" cy="260" rx={orbit.radiusX} ry={orbit.radiusY} transform={`rotate(${orbit.rotation} 460 260)`} fill="none" stroke="#a7efff" strokeOpacity=".18" strokeWidth=".7"/>
              <circle cx="460" cy="260" r="96" fill="#35d5ff" opacity=".1" filter="url(#earth-glow)"/>
              <g clipPath="url(#earth-clip)">
                <circle cx="460" cy="260" r="82" fill="url(#ocean-fill)"/>
                <g className="earth-continents" style={orbit.id === 'geo' ? { transform: `rotate(${phase * 360}deg)` } : undefined}>
                  <path d="M405 207l12-14 17-4 11 8 15 2 7 13-9 8-4 15-11 5-3 16-11 10-8-8-2-14-11-8-1-12-12-9zM448 274l13 5 10 11 4 16-7 18-8 17-7 10-8-11 2-15-6-12 2-13-8-11zM489 207l16-9 21 3 13 10-5 10-14 3-8 11-15-5-12-12zM502 246l17-8 20 5 10 13-5 16-12 4-7 18-15-1-8-14-15-7 2-15zM535 302l12-5 9 10-7 17-9 8-8-10z" fill="#45aa7e" stroke="#91edbd" strokeOpacity=".43" strokeWidth="1.1"/>
                  <path d="M418 188l-2 158M440 180l-1 160M460 177v166M480 180l1 160M502 188l2 145" stroke="#8be7ff" strokeOpacity=".18" strokeWidth=".7" fill="none"/>
                  <ellipse cx="460" cy="260" rx="76" ry="26" fill="none" stroke="#8be7ff" strokeOpacity=".2" strokeWidth=".7"/>
                  <ellipse cx="460" cy="260" rx="80" ry="54" fill="none" stroke="#8be7ff" strokeOpacity=".13" strokeWidth=".7"/>
                </g>
                <circle cx="460" cy="260" r="82" fill="url(#earth-shade)"/>
              </g>
              <circle cx="460" cy="260" r="85" fill="none" stroke="#8beaff" strokeOpacity=".5" strokeWidth="1.4"/>
              <circle cx="460" cy="260" r="94" fill="url(#earth-atmosphere)"/>
              <path d={`M460 260 L${position.x} ${position.y}`} stroke="#b6edff" strokeOpacity=".28" strokeWidth="1" strokeDasharray="3 5"/>
              <circle cx={position.x} cy={position.y} r="14" fill="#35d5ff" opacity=".2" filter="url(#sat-glow)"/>
              <Satellite x={position.x} y={position.y} angle={position.angle}/>
              <circle cx={position.x} cy={position.y} r="2" fill="#fff"/>
              <text x="460" y="366" fill="#86a9c3" fontSize="10" textAnchor="middle" fontFamily="DM Mono, monospace" letterSpacing="2">EARTH</text>
            </g>
            <text x="23" y="32" fill="#69cde8" fontSize="10" fontFamily="DM Mono, monospace" letterSpacing="1.8">{orbit.abbr} · {orbit.name.toUpperCase()}</text>
            <text x="897" y="32" fill="#6f899f" fontSize="9" textAnchor="end" fontFamily="DM Mono, monospace">ILLUSTRATIVE SCALE</text>
          </svg>
          <div className="scene-readout"><span className={`scene-live ${playing ? 'active' : ''}`}/>{playing ? 'ORBIT ANIMATION ACTIVE' : reducedMotion ? 'PAUSED · REDUCED MOTION' : 'ORBIT ANIMATION PAUSED'}<b>{progress}%</b></div>
        </div>
        <div className="orbit-controls">
          <div className="playback-controls"><button className="orbit-control-button play-button" onClick={() => setPlaying((current) => !current)} aria-label={playing ? 'Pause orbit animation' : 'Play orbit animation'}>{playing ? 'Ⅱ' : '▶'}<span>{playing ? 'PAUSE' : 'PLAY'}</span></button><button className="orbit-control-button restart-button" onClick={restart} aria-label="Restart orbit animation">↺<span>RESTART</span></button><span className="control-divider"/><div className="speed-control" role="group" aria-label="Animation speed">{speedOptions.map((option) => <button key={option} className={speed === option ? 'selected' : ''} aria-pressed={speed === option} onClick={() => setSpeed(option)}>{option}×</button>)}</div></div>
          <div className="zoom-controls"><button className="orbit-control-button zoom-button" onClick={() => zoomBy(.1)} aria-label="Zoom in">＋</button><button className="orbit-control-button zoom-button" onClick={() => zoomBy(-.1)} aria-label="Zoom out">−</button><button className="orbit-control-button reset-zoom" onClick={() => setZoom(1)}>RESET VIEW</button></div>
        </div>
        <div className="orbit-scale-note"><span>↗</span> Orbit altitude and size are not shown to scale. Path, inclination, and animation are illustrative; this is not orbital propagation.</div>
      </div>
      <aside className="orbit-info-panel">
        <div className="orbit-info-header"><div><span className="section-index">SELECTED ORBIT</span><h3>{orbit.name}</h3></div><span className="orbit-abbr">{orbit.abbr}</span></div>
        <div className="orbit-facts"><div><span>APPROXIMATE ALTITUDE</span><b>{orbit.altitude}</b></div><div><span>REPRESENTATIVE PERIOD</span><b>{orbit.period}</b></div><div><span>ANIMATED PATH POSITION</span><b>{progress}% around path</b></div></div>
        <div className="orbit-education"><b>WHY THIS ORBIT?</b><p>{orbit.purpose}</p></div>
        <div className="orbit-education"><b>TYPICAL APPLICATIONS</b><p>{orbit.applications}</p></div>
        <div className="orbit-pros-cons"><div><span>ADVANTAGE</span><p>{orbit.advantages}</p></div><div><span>LIMITATION</span><p>{orbit.limitations}</p></div></div>
        <div className="orbit-suitability"><span>EARTH OBSERVATION FIT</span><b>{orbit.missionFit}</b></div>
        <button className="use-orbit-button" onClick={() => onUseOrbit(orbitId)}>USE THIS ORBIT <span>→</span></button>
      </aside>
    </div>
    <div className="orbit-references"><span>LEARN MORE</span><a href="https://science.nasa.gov/earth/earth-observatory/catalog-of-earth-satellite-orbits/" target="_blank" rel="noreferrer">NASA Earth Satellite Orbits ↗</a><a href="https://science.nasa.gov/learn/basics-of-space-flight/chapter5-1/" target="_blank" rel="noreferrer">NASA Basics of Space Flight: Orbits ↗</a><a href="https://terra.nasa.gov/About" target="_blank" rel="noreferrer">NASA Terra Orbit Example ↗</a></div>
  </section>
}
