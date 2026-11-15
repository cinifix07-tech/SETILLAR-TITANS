import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { getDestination } from '../engine/gameEngine.js'
import { getOrbit } from '../engine/resourceCalculator.js'
import { getEarthCloudTexture, getEarthTexture } from './orbit/EarthTexture.js'

const EARTH_X=-8
const TARGET_X=8
const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value))
const smooth=value=>{const t=clamp(value);return t*t*(3-2*t)}

function makeStars(){
  let seed=7319
  const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646}
  const positions=new Float32Array(900*3)
  for(let i=0;i<positions.length;i+=3){const theta=random()*Math.PI*2;const z=random()*2-1;const radius=30+random()*35;const ring=Math.sqrt(1-z*z);positions[i]=Math.cos(theta)*ring*radius;positions[i+1]=z*radius;positions[i+2]=Math.sin(theta)*ring*radius}
  return positions
}

function Atmosphere(){return <mesh scale={1.045}><sphereGeometry args={[3.25,64,64]}/><meshBasicMaterial color="#48cfff" transparent opacity={.19} side={THREE.BackSide} depthWrite={false}/></mesh>}

function Earth({playing}){
  const group=useRef()
  const texture=useMemo(()=>getEarthTexture(),[])
  const clouds=useRef();const cloudTexture=useMemo(()=>getEarthCloudTexture(),[])
  useFrame((_,delta)=>{if(playing&&group.current){group.current.rotation.y+=delta*.035;if(clouds.current)clouds.current.rotation.y+=delta*.043}})
  return <group ref={group} position={[EARTH_X,0,0]} rotation={[.16,0,.2]}>
    <mesh><sphereGeometry args={[3.25,72,72]}/><meshStandardMaterial map={texture} roughness={.92} metalness={.015}/></mesh>
    <mesh ref={clouds} scale={1.006}><sphereGeometry args={[3.25,64,64]}/><meshStandardMaterial map={cloudTexture} transparent opacity={.36} depthWrite={false} roughness={1}/></mesh>
    <mesh scale={1.012}><sphereGeometry args={[3.25,64,64]}/><meshBasicMaterial color="#67dfff" transparent opacity={.075} side={THREE.FrontSide} depthWrite={false}/></mesh>
    <Atmosphere/>
    <Html position={[0,-3.75,0]} center distanceFactor={22} zIndexRange={[10,0]}><span className="flight-3d-label">EARTH / LAUNCH</span></Html>
  </group>
}

function Destination({id,name}){
  const color=id==='mars'?'#b65c3e':id==='europa'?'#b8c3c2':'#8e9ba2'
  const material=id==='europa'?'#d4e5e6':color
  const radius=id==='mars'?1.55:id==='europa'?1.28:1.15
  return <group position={[TARGET_X,0,0]} rotation={[.24,.18,0]}>
    <mesh><sphereGeometry args={[radius,56,56]}/><meshStandardMaterial color={material} roughness={id==='europa'?.72:.96} metalness={.015} emissive={id==='mars'?'#351309':'#07111b'} emissiveIntensity={.2}/></mesh>
    {id==='europa'&&<mesh scale={1.008}><sphereGeometry args={[radius,56,56]}/><meshBasicMaterial color="#d9f5f6" transparent opacity={.12} wireframe depthWrite={false}/></mesh>}
    {(id==='europa'?[[.42,.18,.86,.22],[.65,-.36,.67,.16],[-.46,.47,.69,.13]]:[[.3,.2,.93,.19],[-.52,.38,.76,.14],[.1,-.55,.83,.1]]).map(([x,y,z,size],i)=><mesh key={i} position={[x*radius,y*radius,z*radius]} scale={[size,size*.33,.025]}><sphereGeometry args={[1,20,16]}/><meshStandardMaterial color="#253643" roughness={1} transparent opacity={.22}/></mesh>)}
    <mesh scale={1.16}><sphereGeometry args={[radius,48,48]}/><meshBasicMaterial color="#9beaff" transparent opacity={.06} side={THREE.BackSide} depthWrite={false}/></mesh>
    <Html position={[0,-radius-0.62,0]} center distanceFactor={19} zIndexRange={[10,0]}><span className="flight-3d-label">{name.toUpperCase()}</span></Html>
    <Html position={[0,-radius-1.02,0]} center distanceFactor={19} zIndexRange={[10,0]}><span className="flight-3d-orbit-label">MISSION DESTINATION</span></Html>
    <pointLight color={id==='mars'?'#f17c50':'#9ccfff'} intensity={.35} distance={5}/>
  </group>
}

function Orbit({orbit}){
  const geometry=useMemo(()=>{
    const radii={leo:2.25,sso:2.6,meo:3.3,geo:4.1};const r=radii[orbit.id]??2.6
    const inclination=orbit.id==='sso'?THREE.MathUtils.degToRad(72):orbit.id==='geo'?0:THREE.MathUtils.degToRad(orbit.inclination??51)
    const points=Array.from({length:181},(_,i)=>{const a=i/180*Math.PI*2;return new THREE.Vector3(TARGET_X+r*Math.cos(a),r*Math.sin(a)*Math.cos(inclination),r*Math.sin(a)*Math.sin(inclination))})
    const line=new THREE.BufferGeometry().setFromPoints(points);line.computeLineDistances();return line
  },[orbit])
  return <line geometry={geometry}><lineDashedMaterial color="#48d6ff" dashSize={.18} gapSize={.13} transparent opacity={.76} depthWrite={false}/></line>
}

function Rocket({clock,mascot,playing}){
  const flame=useRef(),body=useRef()
  useFrame((state)=>{const progress=smooth(clock.current/36),x=THREE.MathUtils.lerp(EARTH_X+3.2,TARGET_X-2.0,progress),y=Math.sin(progress*Math.PI)*3.5;if(body.current){body.current.position.set(x,y,0);body.current.rotation.z=-.08}if(flame.current&&playing)flame.current.scale.setScalar(.9+Math.sin(state.clock.elapsedTime*18)*.14)})
  return <group ref={body}>
    <group rotation={[0,0,-Math.PI/2]}>
      <mesh><cylinderGeometry args={[.24,.3,1.1,24,1]}/><meshStandardMaterial color="#dce8ef" metalness={.72} roughness={.3}/></mesh>
      <mesh position={[0,.67,0]}><coneGeometry args={[.24,.46,24]}/><meshStandardMaterial color="#eef7fb" metalness={.5} roughness={.26}/></mesh>
      <mesh position={[0,-.4,0]}><cylinderGeometry args={[.31,.37,.22,24]}/><meshStandardMaterial color="#8fa9b7" metalness={.8} roughness={.25}/></mesh>
      <mesh position={[0,.12,.278]}><circleGeometry args={[.085,24]}/><meshStandardMaterial color="#55d9fa" emissive="#35d5ff" emissiveIntensity={1.5} metalness={.35} roughness={.12}/></mesh>
      {[-1,1].map(sign=><mesh key={sign} position={[-.3,sign*.31,0]} rotation={[0,0,sign*.16]}><boxGeometry args={[.48,.075,.1]}/><meshStandardMaterial color="#2588a7" metalness={.6} roughness={.3}/></mesh>)}
      <mesh position={[0,-.72,0]}><coneGeometry args={[.16,.6,16]}/><meshBasicMaterial ref={flame} color="#ffb45e" transparent opacity={.88}/></mesh>
      <mesh position={[0,-.95,0]}><coneGeometry args={[.07,.4,12]}/><meshBasicMaterial color="#e8fbff" transparent opacity={.82}/></mesh>
      {mascot&&<group position={[0,.2,.22]}><mesh><sphereGeometry args={[.09,16,16]}/><meshStandardMaterial color="#f2f8fb" roughness={.4}/></mesh><mesh position={[0,0,.075]} scale={[.065,.045,.025]}><sphereGeometry args={[1,16,16]}/><meshBasicMaterial color="#12617e"/></mesh><mesh position={[0,-.13,0]}><capsuleGeometry args={[.065,.12,4,8]}/><meshStandardMaterial color="#e9f6fa"/></mesh></group>}
    </group>
  </group>
}

function Satellite({clock,orbit}){
  const group=useRef()
  const radius=orbit.id==='leo'?2.25:orbit.id==='meo'?3.3:orbit.id==='geo'?4.1:2.6
  useFrame(()=>{const angle=Math.max(0,clock.current-32)*.45-Math.PI/2;if(group.current){group.current.position.set(TARGET_X+Math.cos(angle)*radius,Math.sin(angle)*radius*.46,Math.sin(angle)*radius*.36);group.current.rotation.z=-angle}})
  return <group ref={group}>
    <group>
      <mesh><boxGeometry args={[.42,.34,.34]}/><meshStandardMaterial color="#dbe5e9" metalness={.75} roughness={.24}/></mesh>
      <mesh position={[0,0,.2]}><cylinderGeometry args={[.1,.1,.045,24]}/><meshStandardMaterial color="#28748d" metalness={.4} roughness={.25} emissive="#1a92b4" emissiveIntensity={.5}/></mesh>
      {[-1,1].map(side=><group key={side} position={[side*.53,0,0]}><mesh><boxGeometry args={[.62,.025,.3]}/><meshStandardMaterial color="#175583" metalness={.38} roughness={.32} emissive="#12659b" emissiveIntensity={.55}/></mesh>{[-.2,0,.2].map(tick=><mesh key={tick} position={[side*tick,0,.016]}><boxGeometry args={[.008,.028,.006]}/><meshBasicMaterial color="#77e7ff"/></mesh>)}</group>)}
      <mesh position={[0,.28,0]}><cylinderGeometry args={[.018,.018,.3,8]}/><meshStandardMaterial color="#dcebf4" metalness={.7}/></mesh>
    </group>
    <pointLight color="#4ddaff" intensity={.6} distance={2}/>
  </group>
}

function FlightCamera({clock,orbit}){
  const {camera,size}=useThree();const look=useRef(new THREE.Vector3(EARTH_X+1,0,0));const desired=useRef(new THREE.Vector3())
  useFrame(()=>{
    const seconds=clock.current
    const t=clamp(seconds/36),rocketX=THREE.MathUtils.lerp(EARTH_X+3.2,TARGET_X-2.0,smooth(t)),rocketY=Math.sin(smooth(t)*Math.PI)*3.5
    const transit=smooth(seconds/10),arrival=smooth((seconds-29)/7)
    const focusX=THREE.MathUtils.lerp(EARTH_X+1,rocketX,transit);look.current.x=THREE.MathUtils.lerp(focusX,TARGET_X,arrival)
    const fitDistance=THREE.MathUtils.clamp(10.8/(Math.tan(THREE.MathUtils.degToRad(38/2))*Math.max(.7,size.width/Math.max(size.height,1))),15,29)
    const closeDistance=THREE.MathUtils.lerp(Math.max(10,fitDistance*.64),fitDistance,transit)
    const orbitRadius=orbit.id==='leo'?2.25:orbit.id==='meo'?3.3:orbit.id==='geo'?4.1:2.6
    const finalDistance=THREE.MathUtils.lerp(closeDistance,Math.max(11.5,fitDistance*.7,orbitRadius*3),arrival)
    desired.current.set(look.current.x,3.3,finalDistance)
    camera.position.lerp(desired.current,.09);camera.lookAt(look.current.x,rocketY*.18,0)
  })
  return null
}

function Stars(){
  const positions=useMemo(()=>makeStars(),[])
  return <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/></bufferGeometry><pointsMaterial color="#c5e8f5" size={.055} sizeAttenuation transparent opacity={.78} depthWrite={false}/></points>
}

function FlightObjects({seconds,config,playing,speed,showMascot}){
  const clock=useRef(seconds)
  const destination=getDestination(config.destination);const orbit=getOrbit(config.orbit??'sso')
  useEffect(()=>{clock.current=seconds},[clock,seconds])
  useFrame((_,delta)=>{if(playing)clock.current=Math.min(60,clock.current+delta*speed)})
  return <>
    <color attach="background" args={['#06111e']}/><fog attach="fog" args={['#06111e',28,76]}/>
    <ambientLight intensity={.48}/><directionalLight position={[-10,8,12]} intensity={2.2} color="#f3fbff"/><pointLight position={[10,3,8]} intensity={1.1} color="#57cfff"/>
    <Stars/><Earth playing={playing}/><Destination id={config.destination} name={destination.name}/><Orbit orbit={orbit}/>
    <Rocket clock={clock} mascot={showMascot} playing={playing}/>{seconds>=32&&<Satellite clock={clock} orbit={orbit}/>}
    <Html position={[EARTH_X+3,4.8,0]} center distanceFactor={25} zIndexRange={[10,0]}><span className="flight-3d-label">ILLUSTRATIVE FLIGHT / NOT TO SCALE</span></Html>
    <FlightCamera clock={clock} orbit={orbit}/>
  </>
}

export default function MissionFlight3DScene({seconds,config,playing=false,speed=1,showMascot=false,reducedMotion=false}){
  const destination=getDestination(config.destination);const orbit=getOrbit(config.orbit??'sso')
  const stage=seconds<8?'ASCENT':seconds<32?'TRANSIT':seconds<36?'ORBIT INSERTION':'SATELLITE DEPLOYED'
  return <div className={`sim-visual flight-visual flight-visual-3d${showMascot?' flight-visual-prelaunch':''}`} role="img" aria-label={`Interactive illustrative 3D flight scene: launch vehicle travelling from Earth to ${destination.name}, deploying a satellite into ${orbit.abbr} orbit${showMascot?'; astronaut mascot shown in cockpit for illustration; spacecraft remains uncrewed':''}`}>
    <Canvas frameloop={playing&&!reducedMotion?'always':'demand'} dpr={[1,1.5]} camera={{position:[-7,3,24],fov:38,near:.1,far:100}} gl={{antialias:true,alpha:false,powerPreference:'high-performance'}}><FlightObjects seconds={seconds} config={config} playing={playing&&!reducedMotion} speed={speed} showMascot={showMascot}/></Canvas>
    <div className="flight-3d-stage-pill"><i/>{stage}<span> / {orbit.abbr} ORBIT</span></div>
    <span className="sim-readout">{destination.name.toUpperCase()} / {Math.floor(seconds/60*100)}% COMPLETE</span>
    {showMascot&&<span className="flight-3d-mascot-note">ASTRONAUT MASCOT / VISUALIZATION ONLY / UNCREWED SPACECRAFT</span>}
  </div>
}
