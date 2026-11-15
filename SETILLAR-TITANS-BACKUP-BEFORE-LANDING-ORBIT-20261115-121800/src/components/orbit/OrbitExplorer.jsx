import { Component, useEffect, useMemo, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, ZoomIn, ZoomOut, Camera, Satellite as SatelliteIcon } from 'lucide-react'
import { getIllustrativeOrbitPeriod, orbitExplorerProfiles } from '../../data/orbitExplorer.js'
import { OrbitScene } from './OrbitScene.jsx'
import '../../styles/orbit-explorer.css'
import '../../styles/orbit-celestial.css'

const INITIAL_CAMERA = [0, 0, 17]
function canUseWebGL() {
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    if (!context) return false
    context.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch { return false }
}

class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

function StaticOrbit({ profile }) {
  const inclination = `${profile.inclination - 18}deg`
  return <div className={`orbit-static ${profile.id}`} role="img" aria-label={`Static illustrative ${profile.name} orbit around Earth, with the Sun and Moon and their orbital paths`}><div className="static-solar-track"/><div className="static-sun"><i/><span>SUN</span></div><div className="static-moon-track"/><div className="static-stars"/><div className="static-moon"><i/><span>MOON</span></div><div className="static-earth"><span>EARTH</span></div><div className="static-track" style={{ transform: `translate(-50%,-50%) rotate(${inclination}) scale(${getRadiusScale(profile)})` }}/><div className="static-satellite">✦</div><small>STATIC ILLUSTRATION / 3D VIEW UNAVAILABLE</small></div>
}
function getRadiusScale(profile) { return 0.85 + Math.log1p(profile.altitudeKm / 400) * 0.3 }
function initialReducedMotion() { return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches }

export default function OrbitExplorer({ selectedOrbit = 'sso', onUseOrbit }) {
  const [orbitId, setOrbitId] = useState(selectedOrbit)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [restartToken, setRestartToken] = useState(0)
  const [webglAvailable] = useState(() => typeof document !== 'undefined' && canUseWebGL())
  const [reducedMotion, setReducedMotion] = useState(initialReducedMotion)
  const controlsRef = useRef(null)
  const profile = orbitExplorerProfiles[orbitId] ?? orbitExplorerProfiles.sso
  const profiles = orbitExplorerProfiles
  const period = useMemo(() => getIllustrativeOrbitPeriod(profile), [profile])

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setReducedMotion(preference.matches)
    preference.addEventListener?.('change', updatePreference)
    return () => preference.removeEventListener?.('change', updatePreference)
  }, [])
  useEffect(() => {
    const pauseInBackground = () => { if (document.hidden) setPlaying(false) }
    document.addEventListener('visibilitychange', pauseInBackground)
    return () => document.removeEventListener('visibilitychange', pauseInBackground)
  }, [])
  const restart = () => { setPlaying(false); setRestartToken((value) => value + 1) }
  const changeZoom = (factor) => {
    const camera = controlsRef.current?.object
    if (!camera) return
    camera.position.multiplyScalar(factor)
    controlsRef.current.update()
  }
  const resetCamera = () => {
    const controls = controlsRef.current
    if (!controls) return
    controls.target.set(0, 0, 0)
    controls.object.position.set(...INITIAL_CAMERA)
    controls.object.up.set(0, 1, 0)
    controls.update()
  }

  return <div className="orbit-explorer">
    <div className="orbit-explorer-title"><div><span className="game-eyebrow">LEARNING BAY / ORBITAL MECHANICS</span><h2>ORBIT EXPLORER</h2><p>Discover how satellites travel around Earth.</p></div><span className="orbit-model-tag">EDUCATIONAL MODEL</span></div>
    <section className="orbit-explorer-layout">
      <div className="orbit-visual-column">
        <div className="orbit-scene-frame">
          <div className="orbit-scene-label"><SatelliteIcon size={14}/> LIVE VISUALIZATION <span> / ILLUSTRATIVE SCALE</span></div>
          {webglAvailable ? <SceneBoundary fallback={<StaticOrbit profile={profile}/>}><OrbitScene profile={profile} profiles={profiles} playing={playing} speed={speed} restartToken={restartToken} reducedMotion={reducedMotion} controlsRef={controlsRef}/></SceneBoundary> : <StaticOrbit profile={profile}/>}
          <div className="orbit-scene-hint">DRAG TO ROTATE <span>/ </span> SCROLL OR USE ZOOM BUTTONS</div>
        </div>
        <div className="orbit-controls" aria-label="Orbit simulation controls">
          <div className="orbit-transport"><button className={`orbit-control-primary ${playing?'is-paused':''}`} onClick={()=>setPlaying((value)=>!value)} aria-label={playing?'Pause orbit animation':'Play orbit animation'}>{playing?<Pause size={16}/>:<Play size={16}/>}<span>{playing?'PAUSE':'PLAY'}</span></button><button className="orbit-icon-control" onClick={restart} aria-label="Restart satellite orbit" title="Restart"><RotateCcw size={16}/></button></div>
          <div className="orbit-speed-control" role="group" aria-label="Animation speed">{[1,2,5].map((rate)=><button key={rate} className={speed===rate?'active':''} onClick={()=>setSpeed(rate)} aria-pressed={speed===rate}>{rate}x</button>)}</div>
          <div className="orbit-camera-controls"><button className="orbit-icon-control" onClick={()=>changeZoom(0.82)} aria-label="Zoom in" title="Zoom in"><ZoomIn size={16}/></button><button className="orbit-icon-control" onClick={()=>changeZoom(1.22)} aria-label="Zoom out" title="Zoom out"><ZoomOut size={16}/></button><button className="orbit-icon-control reset-camera" onClick={resetCamera} aria-label="Reset camera" title="Reset camera"><Camera size={16}/><span>RESET VIEW</span></button></div>
        </div>
        <div className="orbit-selector-grid" aria-label="Select an orbit">{Object.values(profiles).map((item)=><button key={item.id} className={`orbit-selector-card ${orbitId===item.id?'selected':''}`} onClick={()=>{setOrbitId(item.id);setPlaying(false);setRestartToken((value)=>value+1)}} aria-pressed={orbitId===item.id}><span className={`orbit-mini-icon ${item.id}`}/><span><b>{item.abbr}</b><small>{item.name}</small></span></button>)}</div>
      </div>
      <aside className="orbit-info-panel">
        <span className="game-eyebrow">CURRENT TRAJECTORY</span><div className="orbit-info-title"><span>{profile.abbr}</span><h3>{profile.name}</h3></div>
        <div className="orbit-fact-grid"><div><small>ILLUSTRATIVE ALTITUDE</small><b>{profile.altitudeKm.toLocaleString()} km</b></div><div><small>APPROX. CIRCULAR PERIOD</small><b>{period}</b></div><div><small>INCLINATION EXAMPLE</small><b>{profile.inclination} degrees</b></div></div>
        {profile.id==='sso'&&<p className="orbit-science-note">SSO is typically a near-polar low Earth orbit with carefully selected precession. A near-polar orbit alone is not automatically sun-synchronous.</p>}
        {profile.id==='geo'&&<p className="orbit-science-note">In this visualization, GEO motion is synchronized with Earth's rotation so the satellite stays above roughly the same equatorial longitude.</p>}
        <div className="orbit-info-block"><b>MISSION APPLICATIONS</b><p>{profile.applications}</p></div>
        <div className="orbit-info-block"><b>ADVANTAGE</b><p>{profile.advantages}</p></div>
        <div className="orbit-info-block"><b>LIMITATION</b><p>{profile.limitations}</p></div>
        <div className="orbit-info-block"><b>MISSION FIT</b><p>{profile.fit}</p></div>
        <div className="orbit-disclaimer">Orbit period is estimated with the circular-orbit Kepler equation using mean Earth radius and Earth's standard gravitational parameter. Geometry, radius scale, and animation rate are simplified; this is not live tracking or precise propagation.</div>
        <button className="game-button orbit-use-button" onClick={()=>onUseOrbit?.(profile.id)}>USE THIS ORBIT <span>→</span></button>
      </aside>
    </section>
  </div>
}
