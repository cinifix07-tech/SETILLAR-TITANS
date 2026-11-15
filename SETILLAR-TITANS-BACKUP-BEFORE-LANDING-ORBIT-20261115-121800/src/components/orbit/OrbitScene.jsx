import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { OrbitControls as OrbitControlsImpl } from 'three/addons/controls/OrbitControls.js'
import * as THREE from 'three'
import { getIllustrativeSceneRadius } from '../../data/orbitExplorer.js'
import { getEarthTexture } from './EarthTexture.js'

const EARTH_CENTER = [0,0,0]

function Earth({ playing, speed, reducedMotion }) {
  const earth = useRef()
  const texture = useMemo(() => getEarthTexture(), [])
  useFrame((_, delta) => {
    if (playing && !reducedMotion && earth.current) earth.current.rotation.y += delta * 0.045 * speed
  })
  return <group ref={earth} rotation={[Math.PI / 2, 0, 0]}>
    <mesh><sphereGeometry args={[1, 72, 72]}/><meshStandardMaterial map={texture} roughness={0.94} metalness={0.02}/></mesh>
    <mesh scale={1.045}><sphereGeometry args={[1, 48, 48]}/><meshBasicMaterial color="#35d5ff" transparent opacity={0.12} side={THREE.BackSide} depthWrite={false}/></mesh>
    <mesh scale={1.025}><sphereGeometry args={[1, 48, 48]}/><meshBasicMaterial color="#78dfff" transparent opacity={0.055} side={THREE.FrontSide} depthWrite={false}/></mesh>
  </group>
}

function OrbitPath({ profile, color, selected }) {
  const points = useMemo(() => {
    const radius = getIllustrativeSceneRadius(profile)
    const inclination = THREE.MathUtils.degToRad(profile.inclination)
    return Array.from({ length: 241 }, (_, index) => {
      const angle = index / 240 * Math.PI * 2
      return new THREE.Vector3(radius * Math.cos(angle), radius * Math.sin(angle) * Math.cos(inclination), radius * Math.sin(angle) * Math.sin(inclination))
    })
  }, [profile])
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])
  return <line geometry={geometry}><lineBasicMaterial color={color} transparent opacity={selected ? 0.86 : 0.24} depthWrite={false}/></line>
}

function CelestialOrbit({ radius, center = EARTH_CENTER, color, tilt = 0, opacity = 0.4 }) {
  const geometry = useMemo(() => {
    const points=Array.from({length:241},(_,index)=>{
      const angle=index/240*Math.PI*2
      return new THREE.Vector3(center[0]+radius*Math.cos(angle),center[1]+radius*Math.sin(angle)*Math.cos(tilt),center[2]+radius*Math.sin(angle)*Math.sin(tilt))
    })
    return new THREE.BufferGeometry().setFromPoints(points)
  },[radius,center,tilt])
  return <line geometry={geometry}><lineBasicMaterial color={color} transparent opacity={opacity} depthWrite={false}/></line>
}

function Sun() {
  return <group position={[-4.2,0,0]}>
    <mesh scale={2.3}><sphereGeometry args={[0.58,32,32]}/><meshBasicMaterial color="#ffb64d" transparent opacity={0.045} depthWrite={false} side={THREE.BackSide}/></mesh>
    <mesh scale={1.55}><sphereGeometry args={[0.58,32,32]}/><meshBasicMaterial color="#ffca69" transparent opacity={0.12} depthWrite={false} side={THREE.BackSide}/></mesh>
    <mesh><sphereGeometry args={[0.58,48,48]}/><meshBasicMaterial color="#ffd77a" toneMapped={false}/></mesh>
    <pointLight color="#ffc766" intensity={3.2} distance={17} decay={2}/>
    <Html position={[0,0.84,0]} center distanceFactor={14} zIndexRange={[10,0]}><span className="orbit-celestial-label sun-label">SUN <small>SOLAR ORBIT</small></span></Html>
  </group>
}

function Moon({ playing, speed, reducedMotion }) {
  const moon=useRef(),phase=useRef(0)
  const radius=5.65,tilt=THREE.MathUtils.degToRad(9)
  useFrame((_,delta)=>{
    if(!playing||reducedMotion||!moon.current)return
    phase.current=(phase.current+delta*.11*speed)%(Math.PI*2)
    const angle=phase.current
    moon.current.position.set(radius*Math.cos(angle),radius*Math.sin(angle)*Math.cos(tilt),radius*Math.sin(angle)*Math.sin(tilt))
    moon.current.rotation.y+=delta*.07*speed
  })
  return <>
    <CelestialOrbit radius={radius} tilt={tilt} color="#c7d5df" opacity={0.5}/>
    <group ref={moon} position={[radius,0,0]}>
      <mesh><sphereGeometry args={[0.31,40,40]}/><meshStandardMaterial color="#b7c2ca" roughness={0.95} metalness={0.02}/></mesh>
      <mesh position={[-0.1,0.18,0.24]} scale={[0.09,0.055,0.025]}><sphereGeometry args={[1,20,16]}/><meshStandardMaterial color="#7d8992" roughness={1}/></mesh>
      <mesh position={[0.15,-0.1,0.25]} scale={[0.06,0.04,0.02]}><sphereGeometry args={[1,20,16]}/><meshStandardMaterial color="#78858e" roughness={1}/></mesh>
    </group>
    <Html position={[0,5.1,0]} center distanceFactor={17} zIndexRange={[10,0]}><span className="orbit-celestial-label moon-label">MOON <small>EARTH ORBIT</small></span></Html>
  </>
}

function Satellite({ profile, playing, speed, restartToken }) {
  const group = useRef()
  const phase = useRef(0)
  const lastRestart = useRef(restartToken)
  const radius = getIllustrativeSceneRadius(profile)
  const inclination = THREE.MathUtils.degToRad(profile.inclination)
  useEffect(() => {
    if (lastRestart.current !== restartToken) {
      phase.current = 0
      lastRestart.current = restartToken
      group.current?.position.set(radius, 0, 0)
    }
  }, [restartToken, profile.id, radius])
  useFrame((_, delta) => {
    if (!group.current || !playing) return
    const rate = profile.id === 'geo' ? 0.045 : profile.angularRate
    phase.current = (phase.current + delta * rate * speed) % (Math.PI * 2)
    const angle = phase.current
    group.current.position.set(radius * Math.cos(angle), radius * Math.sin(angle) * Math.cos(inclination), radius * Math.sin(angle) * Math.sin(inclination))
    group.current.rotation.z = -angle
  })
  useEffect(() => {
    if (group.current) group.current.position.set(radius, 0, 0)
  }, [radius, profile.id])
  return <group ref={group} position={[radius, 0, 0]}>
    <mesh><boxGeometry args={[0.16, 0.12, 0.12]}/><meshStandardMaterial color="#c9d9e8" metalness={0.75} roughness={0.25} emissive="#276078" emissiveIntensity={0.35}/></mesh>
    <mesh position={[0, 0.02, 0.11]}><cylinderGeometry args={[0.055, 0.07, 0.04, 20]}/><meshStandardMaterial color="#eaf4ff" metalness={0.8} roughness={0.2}/></mesh>
    <mesh position={[0, 0.08, 0.19]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.055, 0.007, 8, 24]}/><meshBasicMaterial color="#9ceeff"/></mesh>
    {[-0.25, 0.25].map((x) => <group key={x} position={[x, 0, 0]}><mesh><boxGeometry args={[0.32, 0.015, 0.18]}/><meshStandardMaterial color="#183a65" metalness={0.35} roughness={0.4} emissive="#12659b" emissiveIntensity={0.42}/></mesh><mesh position={[0, 0.009, 0]}><boxGeometry args={[0.27, 0.003, 0.13]}/><meshBasicMaterial color="#388ec4"/></mesh></group>)}
    <pointLight color="#35d5ff" intensity={0.8} distance={0.75} decay={2}/>
  </group>
}

export function OrbitScene({ profile, profiles, playing, speed, restartToken, reducedMotion, controlsRef }) {
  return <Canvas className="orbit-canvas" frameloop={playing?'always':'demand'} dpr={[1, 1.65]} camera={{ position: [0, 0, 17], fov: 38 }} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}>
    <color attach="background" args={['#030914']}/>
    <ambientLight intensity={0.55}/><directionalLight position={[-4, 3, 5]} intensity={2.25} color="#f3fbff"/><pointLight position={[3, -2, -3]} intensity={0.45} color="#247fa7"/>
    <StarField playing={playing && !reducedMotion}/>
    <Earth playing={playing} speed={speed} reducedMotion={reducedMotion}/>
    <CelestialOrbit radius={4.2} center={[-4.2,0,0]} color="#ffc766" tilt={THREE.MathUtils.degToRad(7)} opacity={0.22}/>
    <Sun/>
    <Moon playing={playing} speed={speed} reducedMotion={reducedMotion}/>
    {Object.values(profiles).map((item) => <OrbitPath key={item.id} profile={item} color={item.id === profile.id ? '#35d5ff' : '#5e9fba'} selected={item.id === profile.id}/>) }
    <Satellite key={profile.id} profile={profile} playing={playing} speed={speed} restartToken={restartToken}/>
    <CameraControls controlsRef={controlsRef}/>
  </Canvas>
}

function CameraControls({ controlsRef }) {
  const { camera, gl, invalidate } = useThree()
  useEffect(() => {
    const controls = new OrbitControlsImpl(camera, gl.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minDistance = 3.2
    controls.maxDistance = 22
    controls.enablePan = false
    controls.rotateSpeed = 0.6
    controls.zoomSpeed = 0.75
    controlsRef.current = controls
    const update = () => invalidate()
    controls.addEventListener('change', update)
    return () => {
      controls.removeEventListener('change', update)
      controls.dispose()
      if (controlsRef.current === controls) controlsRef.current = null
    }
  }, [camera, gl, controlsRef, invalidate])
  useFrame(() => controlsRef.current?.update())
  return null
}

function StarField({ playing }) {
  const stars = useRef()
  const positions = useMemo(() => {
    const data = new Float32Array(900 * 3)
    let seed = 8472
    const next = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }
    for (let i = 0; i < data.length; i += 3) {
      const theta = next() * Math.PI * 2
      const z = next() * 2 - 1
      const radius = 22 + next() * 24
      const ring = Math.sqrt(1 - z * z)
      data[i] = Math.cos(theta) * ring * radius
      data[i + 1] = z * radius
      data[i + 2] = Math.sin(theta) * ring * radius
    }
    return data
  }, [])
  useFrame((_, delta) => { if (playing && stars.current) stars.current.rotation.y += delta * 0.002 })
  return <points ref={stars}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]}/></bufferGeometry><pointsMaterial color="#b9e9f7" size={0.055} sizeAttenuation transparent opacity={0.78} depthWrite={false}/></points>
}
