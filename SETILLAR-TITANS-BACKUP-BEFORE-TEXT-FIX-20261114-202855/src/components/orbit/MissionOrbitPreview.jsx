import { Component, useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { orbitExplorerProfiles } from '../../data/orbitExplorer.js'
import { getDestination } from '../../engine/gameEngine.js'
import { OrbitScene } from './OrbitScene.jsx'
import '../../styles/orbit-celestial.css'
import '../../styles/mission-orbit-preview.css'

function webglReady() {
  try {
    const canvas=document.createElement('canvas')
    const context=canvas.getContext('webgl2')??canvas.getContext('webgl')
    if(!context)return false
    context.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch { return false }
}

function StaticOrbitPreview({orbit,destination}) {
  return <div className="mission-orbit-static" role="img" aria-label={`Static ${orbit.abbr} Earth orbit preview with the Sun, Moon, and mission destination ${destination}`}>
    <div className="preview-static-solar"/><div className="preview-static-sun"><i/><b>SUN</b></div><div className="preview-static-moon-path"/><div className="preview-static-earth"><span>EARTH</span></div><div className="preview-static-track"/><div className="preview-static-moon"><i/><b>MOON</b></div><div className="preview-static-satellite">✦</div><span className="preview-static-destination">MISSION DESTINATION / {destination.toUpperCase()}</span>
  </div>
}

class PreviewBoundary extends Component {
  state={failed:false}
  static getDerivedStateFromError(){return {failed:true}}
  render(){return this.state.failed?this.props.fallback:this.props.children}
}

export default function MissionOrbitPreview({config,result}) {
  const mission=result?.config??config
  const profile=orbitExplorerProfiles[mission.orbit]??orbitExplorerProfiles.sso
  const destination=getDestination(mission.destination)
  const controlsRef=useRef(null)
  const [playing,setPlaying]=useState(()=>!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [available]=useState(webglReady)
  const [reducedMotion,setReducedMotion]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(()=>{
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)')
    const update=()=>{setReducedMotion(preference.matches);if(preference.matches)setPlaying(false)}
    preference.addEventListener?.('change',update)
    return()=>preference.removeEventListener?.('change',update)
  },[])
  const profiles={[profile.id]:profile}
  return <section className="mission-orbit-preview" aria-label={`Latest mission orbit preview: ${profile.name}`}>
    <div className="mission-orbit-frame">
      {available?<PreviewBoundary fallback={<StaticOrbitPreview orbit={profile} destination={destination.name}/> }><OrbitScene profile={profile} profiles={profiles} playing={playing&&!reducedMotion} speed={1} restartToken={0} reducedMotion={reducedMotion} controlsRef={controlsRef}/></PreviewBoundary>:<StaticOrbitPreview orbit={profile} destination={destination.name}/>}
      <div className="mission-orbit-label"><span className="game-eyebrow">{result?'LATEST LAUNCH':'CURRENT FLIGHT PLAN'}</span><b>{profile.abbr} · {profile.name}</b></div>
      <button className="mission-orbit-play" onClick={()=>setPlaying(value=>!value)} disabled={reducedMotion} aria-label={playing?'Pause orbit preview':'Play orbit preview'} title={reducedMotion?'Animation disabled by reduced-motion setting':undefined}>{playing?<Pause size={14}/>:<Play size={14}/>}<span>{playing?'PAUSE':'PLAY ORBIT'}</span></button>
      <div className="mission-orbit-destination">DESTINATION / {destination.name.toUpperCase()}</div>
      {!available&&<span className="mission-orbit-fallback-tag">STATIC PREVIEW · 3D UNAVAILABLE</span>}
      {result&&<span className={`mission-orbit-result ${result.outcome==='SUCCESS'?'success':''}`}>{result.outcome} · {result.score}/100</span>}
      <span className="mission-orbit-hint">DRAG TO ROTATE · SCROLL TO ZOOM</span>
    </div>
    <p className="mission-orbit-caption">Interactive 3D educational view of the latest configured Earth orbit. Orbit sizes and animation are illustrative, not flight telemetry.</p>
  </section>
}
