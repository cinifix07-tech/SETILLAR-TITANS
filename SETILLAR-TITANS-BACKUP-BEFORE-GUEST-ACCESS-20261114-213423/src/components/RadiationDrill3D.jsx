import { Component, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value))
const signals=[[-3.25,1.35,-.8],[0,-1.55,.1],[3.25,1.1,-.7]]

function stars(){
  let seed=4421;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646}
  const values=new Float32Array(900)
  for(let i=0;i<values.length;i+=3){values[i]=(random()-.5)*24;values[i+1]=(random()-.5)*14;values[i+2]=-3-random()*24}
  return values
}

function webglReady(){try{const canvas=document.createElement('canvas');const context=canvas.getContext('webgl2')??canvas.getContext('webgl');if(!context)return false;context.getExtension('WEBGL_lose_context')?.loseContext();return true}catch{return false}}

class DrillErrorBoundary extends Component{
  state={failed:false}
  static getDerivedStateFromError(){return {failed:true}}
  render(){return this.state.failed?<div className="radiation-drill-loading" role="status">3D VIEW UNAVAILABLE · SKIP TO THE FLIGHT RESPONSE TO CONTINUE</div>:this.props.children}
}

function DrillCamera(){
  const {camera,size}=useThree()
  useEffect(()=>{const aspect=size.width/Math.max(size.height,1);const distance=Math.max(9,10.5/(2*Math.tan(THREE.MathUtils.degToRad(42/2))*aspect));camera.position.set(0,0,distance);camera.lookAt(0,0,0);camera.updateProjectionMatrix()},[camera,size.width,size.height])
  return null
}

function Ufo(){
  const saucer=useRef(),ring=useRef()
  useFrame((state,delta)=>{const step=Math.min(delta,.04);if(saucer.current){saucer.current.position.y=Math.sin(state.clock.elapsedTime*1.7)*.08;if(ring.current)ring.current.rotation.z+=step*.35}})
  return <group>
    <group ref={saucer}>
      <mesh position={[0,0,0]} scale={[1,.2,.72]}><sphereGeometry args={[1,48,32]}/><meshStandardMaterial color="#6b9caa" metalness={.86} roughness={.2} emissive="#123949" emissiveIntensity={.35}/></mesh>
      <mesh position={[0,.12,0]}><cylinderGeometry args={[.74,.92,.18,48]}/><meshStandardMaterial color="#a8c1c8" metalness={.78} roughness={.23}/></mesh>
      <mesh position={[0,.28,0]} scale={[.54,.44,.5]}><sphereGeometry args={[1,40,28]}/><meshPhysicalMaterial color="#5ad8df" transparent opacity={.58} roughness={.1} metalness={.32} clearcoat={1} emissive="#0b6176" emissiveIntensity={.55}/></mesh>
      <mesh position={[0,.24,.23]} scale={[.14,.16,.09]}><sphereGeometry args={[1,20,20]}/><meshStandardMaterial color="#a6efb9" roughness={.42}/></mesh>
      {[-1,1].map(side=><mesh key={side} position={[side*.055,.25,.305]} scale={[.026,.055,.018]}><sphereGeometry args={[1,14,14]}/><meshBasicMaterial color="#07131d"/></mesh>)}
      <mesh ref={ring} position={[0,.01,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.92,.025,10,64]}/><meshBasicMaterial color="#35d5ff"/></mesh>
      {[0,1,2,3,4,5,6,7].map(i=>{const angle=i*Math.PI/4;return <mesh key={i} position={[Math.cos(angle)*.82,-.08,Math.sin(angle)*.59]}><sphereGeometry args={[.055,14,14]}/><meshBasicMaterial color={i%2?'#42e7cf':'#ffbd69'} toneMapped={false}/></mesh>})}
      <pointLight position={[0,-.1,0]} color="#38e5ff" intensity={1.1} distance={4}/>
    </group>
  </group>
}

function Signal({position,active}){
  const group=useRef()
  useFrame((state)=>{if(group.current){group.current.rotation.y=state.clock.elapsedTime*.55;group.current.scale.setScalar(.9+Math.sin(state.clock.elapsedTime*3)*.08)}})
  if(!active)return null
  return <group ref={group} position={position}>
    <mesh><octahedronGeometry args={[.32,1]}/><meshBasicMaterial color="#61efff" wireframe/></mesh>
    <mesh><sphereGeometry args={[.12,20,20]}/><meshBasicMaterial color="#dcffff" toneMapped={false}/></mesh>
    <pointLight color="#36d9ff" intensity={1.2} distance={2.5}/>
  </group>
}

function DrillScene({movementRef,onProgress,initialProgress,done}){
  const player=useRef(),positions=useMemo(()=>stars(),[]),foundSignals=useRef([0,1,2].map(index=>index<initialProgress)),[foundCount,setFoundCount]=useState(initialProgress)
  useFrame((_,delta)=>{
    if(!player.current)return
    const step=Math.min(delta,.04),x=(movementRef.current.right?1:0)-(movementRef.current.left?1:0),y=(movementRef.current.up?1:0)-(movementRef.current.down?1:0)
    if(!done){player.current.position.x=clamp(player.current.position.x+x*step*4.6,-4.65,4.65);player.current.position.y=clamp(player.current.position.y+y*step*4.2,-2.65,2.65)}
    player.current.rotation.z=THREE.MathUtils.damp(player.current.rotation.z,-x*.14,5,step);player.current.rotation.x=THREE.MathUtils.damp(player.current.rotation.x,y*.08,5,step)
    let count=foundSignals.current.filter(Boolean).length
    signals.forEach(([signalX,signalY],index)=>{if(!foundSignals.current[index]){const dx=player.current.position.x-signalX,dy=player.current.position.y-signalY;if(Math.hypot(dx,dy)<.62){foundSignals.current[index]=true;count++;setFoundCount(count);onProgress(count)}}})
  })
  return <>
    <color attach="background" args={['#030a14']}/><fog attach="fog" args={['#06111e',12,36]}/>
    <ambientLight intensity={.5}/><directionalLight position={[-4,6,8]} intensity={1.7} color="#e8fbff"/><pointLight position={[0,2,1]} intensity={.7} color="#36d5ff"/>
    <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/></bufferGeometry><pointsMaterial color="#d9f3ff" size={.045} transparent opacity={.78} sizeAttenuation/></points>
    <mesh position={[-7.7,2.7,-8]}><sphereGeometry args={[2.3,48,48]}/><meshStandardMaterial color="#214e7e" emissive="#0b3765" emissiveIntensity={.5} roughness={.8}/></mesh>
    <mesh position={[-7.7,2.7,-7.7]} scale={1.035}><sphereGeometry args={[2.3,36,36]}/><meshBasicMaterial color="#35d5ff" transparent opacity={.12} side={THREE.BackSide}/></mesh>
    {[[-1.8,2.3,-1.4],[2.1,-2.1,-1.8],[4.1,2.35,-2.4],[-4.3,-2.2,-3]].map((p,i)=><mesh key={i} position={p} rotation={[i*.7,i*.9,.2]}><dodecahedronGeometry args={[.38+i%2*.18,1]}/><meshStandardMaterial color="#344252" roughness={1} metalness={.08}/></mesh>)}
    {signals.map((position,index)=><Signal key={index} position={position} active={index>=foundCount}/>) }
    <group ref={player}><Ufo/></group>
    <mesh position={[0,0,-5]} rotation={[0,0,0]}><ringGeometry args={[6.5,6.57,80]}/><meshBasicMaterial color="#1d6c89" transparent opacity={.22} side={THREE.DoubleSide}/></mesh>
  </>
}

export default function RadiationDrill3D({progress,onProgress,done}){
  const movementRef=useRef({up:false,down:false,left:false,right:false})
  const [available]=useState(webglReady)
  const setDirection=(key,value)=>{movementRef.current[key]=value}
  useEffect(()=>{
    const keyMap={arrowup:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',arrowright:'right',d:'right'}
    const onKeyDown=event=>{const direction=keyMap[event.key.toLowerCase()];if(direction){event.preventDefault();movementRef.current[direction]=true}}
    const onKeyUp=event=>{const direction=keyMap[event.key.toLowerCase()];if(direction)movementRef.current[direction]=false}
    const onBlur=()=>{movementRef.current={up:false,down:false,left:false,right:false}}
    window.addEventListener('keydown',onKeyDown);window.addEventListener('keyup',onKeyUp);window.addEventListener('blur',onBlur)
    return()=>{window.removeEventListener('keydown',onKeyDown);window.removeEventListener('keyup',onKeyUp);window.removeEventListener('blur',onBlur);onBlur()}
  },[])
  if(!available)return <div className="radiation-drill-loading" role="status">3D VIEW UNAVAILABLE · SKIP TO THE FLIGHT RESPONSE TO CONTINUE</div>
  return <div className="radiation-drill-scene" onPointerLeave={()=>{movementRef.current={up:false,down:false,left:false,right:false}}}>
    <DrillErrorBoundary><Canvas dpr={[1,1.5]} camera={{position:[0,0,11.5],fov:42,near:.1,far:60}} gl={{antialias:true,alpha:false,powerPreference:'high-performance'}}>
      <DrillCamera/><DrillScene movementRef={movementRef} onProgress={onProgress} done={done} initialProgress={progress}/>
    </Canvas></DrillErrorBoundary>
    <div className="drill-crosshair" aria-hidden="true">+</div>
    <div className="drill-dpad" aria-label="Touch flight controls">
      <button aria-label="Move up" onPointerDown={()=>setDirection('up',true)} onPointerUp={()=>setDirection('up',false)} onPointerCancel={()=>setDirection('up',false)}>↑</button>
      <div><button aria-label="Move left" onPointerDown={()=>setDirection('left',true)} onPointerUp={()=>setDirection('left',false)} onPointerCancel={()=>setDirection('left',false)}>←</button><button aria-label="Move down" onPointerDown={()=>setDirection('down',true)} onPointerUp={()=>setDirection('down',false)} onPointerCancel={()=>setDirection('down',false)}>↓</button><button aria-label="Move right" onPointerDown={()=>setDirection('right',true)} onPointerUp={()=>setDirection('right',false)} onPointerCancel={()=>setDirection('right',false)}>→</button></div>
    </div>
  </div>
}
