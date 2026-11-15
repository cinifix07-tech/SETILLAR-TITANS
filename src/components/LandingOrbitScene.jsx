import { useEffect, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'

const orbitOptions = [
  { id: 'earth', label: 'EARTH ORBIT', caption: 'A small satellite traces an illustrative orbit around Earth.' },
  { id: 'lunar', label: 'LUNAR TRANSFER', caption: 'A spacecraft follows an illustrative route toward the Moon.' },
]

function readMotionPreference() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

function SatelliteModel() {
  return <g className="landing-satellite-model" aria-hidden="true">
    <path d="M-20 -5h9v10h-9zM11 -5h9v10h-9z" fill="#1599bd" stroke="#a4f2ff" strokeWidth="1.4"/>
    <path d="M-17 -4v8M-13 -4v8M14 -4v8M18 -4v8" stroke="#75ddf2" strokeWidth=".7"/>
    <rect x="-10" y="-7" width="20" height="14" rx="3" fill="#d9f6ff" stroke="#fff" strokeWidth="1.2"/>
    <circle r="3.2" fill="#21cfff" stroke="#e3fbff" strokeWidth="1"/>
    <path d="M0 -7v-7m-5 0h10" stroke="#d5f8ff" strokeWidth="1.2"/>
  </g>
}

export default function LandingOrbitScene() {
  const [orbit, setOrbit] = useState('earth')
  const [playing, setPlaying] = useState(() => !readMotionPreference())
  const [speed, setSpeed] = useState(1)
  const [restartKey, setRestartKey] = useState(0)
  const selectedOrbit = orbitOptions.find((option) => option.id === orbit)

  useEffect(() => {
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!preference) return undefined
    const updatePreference = () => { if (preference.matches) setPlaying(false) }
    preference.addEventListener?.('change', updatePreference)
    return () => preference.removeEventListener?.('change', updatePreference)
  }, [])

  useEffect(() => {
    const pauseInBackground = () => { if (document.hidden) setPlaying(false) }
    document.addEventListener('visibilitychange', pauseInBackground)
    return () => document.removeEventListener('visibilitychange', pauseInBackground)
  }, [])

  const duration = (orbit === 'lunar' ? 24 : 12) / speed
  const moonDuration = 34 / speed

  return <figure className="hub-orbit-scene">
    <div className="hub-orbit-visual">
      <svg key={restartKey} className="hub-orbit-svg" viewBox="0 0 480 310" role="img" aria-labelledby="landing-orbit-title landing-orbit-description">
        <title id="landing-orbit-title">Sun, Earth, Moon, and an orbiting spacecraft</title>
        <desc id="landing-orbit-description">An illustrative animated view of Earth orbit or a lunar transfer route. Distances and paths are not to scale.</desc>
        <defs>
          <radialGradient id="landing-space-glow"><stop stopColor="#16496a" stopOpacity=".7"/><stop offset="1" stopColor="#07111f" stopOpacity="0"/></radialGradient>
          <radialGradient id="landing-earth-shade" cx="32%" cy="27%"><stop stopColor="#81edff"/><stop offset=".36" stopColor="#187da8"/><stop offset=".78" stopColor="#0d4269"/><stop offset="1" stopColor="#071a30"/></radialGradient>
          <radialGradient id="landing-sun-shade"><stop stopColor="#fff6c6"/><stop offset=".55" stopColor="#ffd36b"/><stop offset="1" stopColor="#ff9d37"/></radialGradient>
          <clipPath id="landing-earth-clip"><circle cx="236" cy="156" r="49"/></clipPath>
          <filter id="landing-glow"><feGaussianBlur stdDeviation="10" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect width="480" height="310" fill="#07111f"/>
        <ellipse cx="245" cy="160" rx="240" ry="178" fill="url(#landing-space-glow)"/>
        <g className="hub-orbit-stars" fill="#b8d5e5">
          <circle cx="34" cy="38" r="1.1"/><circle cx="115" cy="25" r=".8"/><circle cx="177" cy="62" r="1.2"/><circle cx="279" cy="28" r=".8"/><circle cx="351" cy="53" r="1.1"/><circle cx="449" cy="42" r=".8"/><circle cx="56" cy="247" r=".8"/><circle cx="140" cy="278" r="1.1"/><circle cx="332" cy="282" r=".9"/><circle cx="447" cy="235" r="1.2"/><circle cx="388" cy="117" r=".8"/><circle cx="93" cy="112" r="1"/>
        </g>

        <circle cx="61" cy="157" r="42" fill="#ffbd55" opacity=".1" filter="url(#landing-glow)"/>
        <circle cx="61" cy="157" r="21" fill="url(#landing-sun-shade)"/>
        <circle cx="61" cy="157" r="29" fill="none" stroke="#ffc968" strokeOpacity=".34"/>
        <text x="61" y="203" textAnchor="middle" className="hub-orbit-label">SUN</text>

        <circle cx="236" cy="156" r="176" fill="none" stroke="#67849a" strokeOpacity=".42" strokeWidth="1.4"/>
        <ellipse cx="236" cy="156" rx="78" ry="31" transform="rotate(-9 236 156)" fill="none" stroke={orbit === 'earth' ? '#55def7' : '#46758b'} strokeOpacity={orbit === 'earth' ? '.95' : '.3'} strokeWidth={orbit === 'earth' ? '2' : '1'} className="hub-selected-orbit"/>
        <path d="M236 156 C294 102 350 94 408 139" fill="none" stroke={orbit === 'lunar' ? '#55def7' : '#46758b'} strokeOpacity={orbit === 'lunar' ? '.9' : '.24'} strokeDasharray="4 7" strokeWidth="1.6"/>

        <circle cx="236" cy="156" r="60" fill="#45d9ff" opacity=".12" filter="url(#landing-glow)"/>
        <circle cx="236" cy="156" r="52" fill="none" stroke="#71dff5" strokeOpacity=".46" strokeWidth="2"/>
        <circle cx="236" cy="156" r="49" fill="url(#landing-earth-shade)"/>
        <g clipPath="url(#landing-earth-clip)" fill="#58c1a5" opacity=".8">
          <path d="M197 130l13-9 17 4 6 11-9 8-3 17-11 8-10-8-3-13-9-6z"/>
          <path d="M236 176l11-8 13 5 7 13-8 12-14 5-7-11z"/>
          <path d="M255 119l11-3 7 8-5 8-10-2z"/>
        </g>
        <path d="M236 108a48 48 0 0 1 0 96" fill="none" stroke="#051425" strokeOpacity=".24" strokeWidth="14"/>
        <text x="236" y="225" textAnchor="middle" className="hub-orbit-label">EARTH</text>

        <g className="hub-lunar-mover" style={{ transformOrigin: '236px 156px', animationDuration: `${moonDuration}s`, animationPlayState: playing ? 'running' : 'paused' }}>
          <circle cx="412" cy="156" r="12" fill="#d9e2e9" stroke="#f5fbff" strokeWidth="1.6"/>
          <circle cx="408" cy="152" r="3.2" fill="#9daab4"/><circle cx="416" cy="160" r="2.1" fill="#9daab4"/>
        </g>
        <text x="412" y="185" textAnchor="middle" className="hub-orbit-label">MOON</text>

        <g className={`hub-satellite-mover ${orbit === 'lunar' ? 'hub-satellite-mover-lunar' : ''}`} style={{ transformOrigin: '236px 156px', animationDuration: `${duration}s`, animationPlayState: playing ? 'running' : 'paused' }}>
          <g transform={`translate(${orbit === 'lunar' ? 402 : 312} 156) rotate(-12)`}><SatelliteModel/></g>
        </g>
      </svg>
      <div className="hub-orbit-badge"><span className="hub-orbit-live-dot"/>{orbit === 'earth' ? 'EARTH ORBIT' : 'LUNAR TRANSFER'}<small>ILLUSTRATIVE</small></div>
    </div>
    <div className="hub-orbit-caption"><span>MISSION NETWORK / {orbit === 'earth' ? 'EARTH ORBIT' : 'LUNAR ROUTE'}</span><small>Orbital paths and distances are not to scale.</small></div>
    <div className="hub-orbit-controls">
      <div className="hub-orbit-select" role="group" aria-label="Select orbit visualization">{orbitOptions.map((option) => <button key={option.id} type="button" aria-pressed={orbit === option.id} onClick={() => setOrbit(option.id)}>{option.label}</button>)}</div>
      <div className="hub-orbit-actions">
        <button type="button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? 'Pause orbit animation' : 'Play orbit animation'}>{playing ? <Pause size={14}/> : <Play size={14} fill="currentColor"/>}{playing ? 'PAUSE' : 'PLAY'}</button>
        <button type="button" onClick={() => setRestartKey((value) => value + 1)} aria-label="Restart orbit animation"><RotateCcw size={14}/> RESET</button>
        <button type="button" onClick={() => setSpeed((value) => value === 1 ? 2 : 1)} aria-label={`Animation speed ${speed} times, click to change`} aria-pressed={speed === 2}>{speed}X</button>
      </div>
    </div>
    <figcaption className="hub-orbit-caption-text">{selectedOrbit.caption} This educational illustration is not a precise orbital model.</figcaption>
  </figure>
}
