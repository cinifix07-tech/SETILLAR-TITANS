import { getDestination } from '../engine/gameEngine.js'
import { getOrbit } from '../engine/resourceCalculator.js'

const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value))
const bezier=(t,a,b,c)=>((1-t)*(1-t)*a)+(2*(1-t)*t*b)+(t*t*c)

function LaunchVehicle({x,y,angle,opacity}) {
  return <g className="flight-rocket" transform={`translate(${x} ${y}) rotate(${angle})`} opacity={opacity}>
    <path d="M-38 0 Q-54 -4 -65 -11 Q-57 0 -65 11 Q-52 5 -38 0" fill="#ffb45e" opacity=".92"/><path d="M-38 0 Q-49 -3 -56 -6 Q-51 0 -56 6 Q-49 3 -38 0" fill="#e9fbff"/>
    <path d="M-34 -9 L-20 -13 L-13 -8 L16 -8 Q29 -7 38 0 Q29 7 16 8 L-13 8 L-20 13 L-34 9 L-28 0 Z" fill="#dcebf3" stroke="#f8ffff" strokeWidth="1.5"/>
    <path d="M-4 -8 L4 -20 L20 -8 M-4 8 L4 20 L20 8" fill="#2588a7" stroke="#72e4fa" strokeWidth="1.4"/>
    <path d="M24 -5 Q34 -2 38 0 Q34 3 24 5 Z" fill="#79ddf2"/><path d="M-18 -7 L-12 -7 L-12 7 L-18 7 Z" fill="#ec9a53"/>
    <circle cx="17" cy="0" r="3.5" fill="#35d5ff" stroke="#e8fbff" strokeWidth="1"/>
  </g>
}

function DeployedSatellite({x,y,angle,opacity}) {
  return <g className="flight-satellite" transform={`translate(${x} ${y}) rotate(${angle})`} opacity={opacity}>
    <rect x="-34" y="-8" width="20" height="16" rx="1.5" fill="#1674a3" stroke="#a9efff" strokeWidth="1.5"/><path d="M-29 -7V7M-24 -7V7M-19 -7V7" stroke="#65c9eb" strokeWidth="1"/>
    <rect x="14" y="-8" width="20" height="16" rx="1.5" fill="#1674a3" stroke="#a9efff" strokeWidth="1.5"/><path d="M19 -7V7M24 -7V7M29 -7V7" stroke="#65c9eb" strokeWidth="1"/>
    <rect x="-13" y="-12" width="26" height="24" rx="4" fill="#e4edf0" stroke="#fff" strokeWidth="1.4"/><rect x="-7" y="-7" width="14" height="14" rx="2" fill="#246887"/>
    <path d="M0 -12V-22M-5 -22H5" stroke="#e4f8ff" strokeWidth="2"/><circle cx="0" cy="0" r="3" fill="#35d5ff"/>
  </g>
}

export default function MissionFlightScene({seconds,config}) {
  const destination=getDestination(config.destination)
  const orbit=getOrbit(config.orbit??'sso')
  const t=clamp(seconds/36), x=bezier(t,195,470,842), y=bezier(t,287,92,218)
  const dx=2*((1-t)*(470-195)+t*(842-470)),dy=2*((1-t)*(92-287)+t*(218-92))
  const heading=Math.atan2(dy,dx)*180/Math.PI
  const orbitSize=({leo:45,sso:53,meo:63,geo:76})[orbit.id]??53
  const orbitAngle=seconds>=36?(seconds-36)*.72-Math.PI/2:-Math.PI/2
  const satX=842+Math.cos(orbitAngle)*orbitSize,satY=218+Math.sin(orbitAngle)*orbitSize*.72
  const separation=clamp((seconds-32)/4)
  const ascentProgress=clamp(seconds/8)
  const cameraZoom=seconds<8?2.45-(2.45-1.18)*ascentProgress:seconds<32?1.18:seconds<36?1.18+.42*separation:1.6
  const focusX=seconds<8?150+(x-150)*ascentProgress:seconds<32?x:seconds<36?x+(satX-x)*separation:satX
  const focusY=seconds<8?305+(y-305)*ascentProgress:seconds<32?y:seconds<36?y+(satY-y)*separation:satY
  const cameraTransform=`translate(500 220) scale(${cameraZoom}) translate(${-focusX} ${-focusY})`
  const targetName=destination.name.toUpperCase()
  const targetColor=config.destination==='mars'?'url(#target-mars)':config.destination==='europa'?'url(#target-europa)':'url(#target-moon)'
  const stage=seconds<8?'ASCENT':seconds<32?'TRANSIT':seconds<36?'ORBIT INSERTION':'SATELLITE DEPLOYED'
  const targetSize=config.destination==='mars'?29:config.destination==='europa'?27:23
  return <div className="sim-visual flight-visual" role="img" aria-label={`Illustrative mission animation: launch vehicle travelling from Earth to ${destination.name}, deploying a satellite into ${orbit.abbr} orbit`}>
    <svg className="flight-scene-svg" viewBox="0 0 1000 440" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <radialGradient id="flight-earth"><stop stopColor="#55c9df"/><stop offset=".62" stopColor="#176b9c"/><stop offset="1" stopColor="#092344"/></radialGradient>
        <radialGradient id="target-moon"><stop stopColor="#f2f2e9"/><stop offset=".7" stopColor="#aab8c0"/><stop offset="1" stopColor="#556777"/></radialGradient>
        <radialGradient id="target-mars"><stop stopColor="#ffbf83"/><stop offset=".67" stopColor="#c76040"/><stop offset="1" stopColor="#71362f"/></radialGradient>
        <radialGradient id="target-europa"><stop stopColor="#fff1cf"/><stop offset=".7" stopColor="#d4c3a0"/><stop offset="1" stopColor="#827d75"/></radialGradient>
        <filter id="flight-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="12"/></filter>
      </defs>
      <g className="flight-camera" transform={cameraTransform}>
      <g fill="#bfe9ff" opacity=".55">{[[70,48],[208,114],[312,46],[520,66],[700,112],[928,72],[89,211],[380,188],[614,310],[930,315],[225,370],[540,385],[750,363]].map(([sx,sy],i)=><circle key={i} cx={sx} cy={sy} r={i%3===0?1.7:1}/>)}</g>
      <path d="M195 287 Q470 92 842 218" fill="none" stroke="#35d5ff" strokeOpacity=".25" strokeDasharray="5 9" strokeWidth="2"/>
      <circle cx="150" cy="305" r="57" fill="#35d5ff" opacity=".12" filter="url(#flight-glow)"/>
      <circle cx="150" cy="305" r="44" fill="url(#flight-earth)" stroke="#87eaff" strokeOpacity=".75" strokeWidth="2"/>
      <path d="M130 278l15-9 12 6-2 12-12 5-5 13-10-3-4-10-10-4zM163 315l14-8 10 7-4 13-14 8-8-9z" fill="#53ba8e" opacity=".86"/>
      <text x="150" y="369" className="flight-label" textAnchor="middle">EARTH / LAUNCH</text>
      <circle cx="842" cy="218" r={targetSize+18} fill="#35d5ff" opacity=".1" filter="url(#flight-glow)"/>
      <circle cx="842" cy="218" r={targetSize} fill={targetColor} stroke="#d9efff" strokeOpacity=".7" strokeWidth="1.5"/>
      {config.destination==='mars'?<path d="M823 211q16-12 32 0t-3 17q-14-5-29 2z" fill="#e78c5a" opacity=".58"/>:<><circle cx="834" cy="208" r="5" fill="#53606b" opacity=".34"/><circle cx="850" cy="226" r="7" fill="#53606b" opacity=".3"/></>}
      <ellipse cx="842" cy="218" rx={orbitSize} ry={orbitSize*.72} fill="none" stroke="#35d5ff" strokeWidth="1.7" strokeDasharray="5 5" opacity={seconds>=30?.8:.3}/>
      <text x="842" y="278" className="flight-label" textAnchor="middle">{targetName}</text>
      <text x="842" y="294" className="flight-orbit-label" textAnchor="middle">{orbit.abbr} / SELECTED ORBIT</text>
      <LaunchVehicle x={x} y={y} angle={heading} opacity={1-separation}/>
      {seconds>=32&&<><circle cx={satX} cy={satY} r="17" fill="#35d5ff" opacity=".22" filter="url(#flight-glow)"/><DeployedSatellite x={satX} y={satY} angle={heading} opacity={separation}/></>}
      </g>
      <text x="30" y="35" className="flight-label">ILLUSTRATIVE FLIGHT SEQUENCE / NOT TO SCALE</text>
    </svg>
    <div className="flight-stage-pill"><i/>{stage}<span>· {orbit.abbr} ORBIT</span></div>
    <span className="sim-readout">{destination.name.toUpperCase()} / {Math.floor(seconds/60*100)}% COMPLETE</span>
  </div>
}
