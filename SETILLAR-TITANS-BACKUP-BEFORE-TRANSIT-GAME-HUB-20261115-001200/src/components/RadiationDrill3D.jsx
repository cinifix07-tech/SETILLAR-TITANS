import { Component, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value))
const rocketStartPosition=[0,-1.55,0],rocketStartRotation=[0,0,0]
function makeStars(){let seed=4421;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646};const values=new Float32Array(900);for(let i=0;i<values.length;i+=3){values[i]=(random()-.5)*24;values[i+1]=(random()-.5)*14;values[i+2]=-3-random()*24}return values}
function webglReady(){try{const canvas=document.createElement('canvas');const context=canvas.getContext('webgl2')??canvas.getContext('webgl');if(!context)return false;context.getExtension('WEBGL_lose_context')?.loseContext();return true}catch{return false}}

class DrillErrorBoundary extends Component{
  state={failed:false}
  static getDerivedStateFromError(){return {failed:true}}
  render(){return this.state.failed?<div className="radiation-drill-loading" role="status">3D VIEW UNAVAILABLE / SKIP TO THE FLIGHT RESPONSE TO CONTINUE</div>:this.props.children}
}

function DrillCamera(){const {camera,size}=useThree();useEffect(()=>{const aspect=size.width/Math.max(size.height,1);const distance=Math.max(9,10.5/(2*Math.tan(THREE.MathUtils.degToRad(42/2))*aspect));camera.position.set(0,0,distance);camera.lookAt(0,0,0);camera.updateProjectionMatrix()},[camera,size.width,size.height]);return null}

function Rocket(){const group=useRef(),flame=useRef();useFrame((state,delta)=>{const step=Math.min(delta,.04);if(group.current){group.current.position.y=Math.sin(state.clock.elapsedTime*2.1)*.045;group.current.rotation.z=THREE.MathUtils.damp(group.current.rotation.z,0,4,step)}if(flame.current)flame.current.scale.y=.8+Math.sin(state.clock.elapsedTime*18)*.25});return <group ref={group} rotation={[0,0,0]}>
  <mesh position={[.02,0,0]} rotation={[0,0,-Math.PI/2]}><cylinderGeometry args={[.23,.27,1.25,24]}/><meshStandardMaterial color="#dfeaf0" metalness={.6} roughness={.27}/></mesh>
  <mesh position={[.73,0,0]} rotation={[0,0,-Math.PI/2]}><coneGeometry args={[.24,.48,24]}/><meshStandardMaterial color="#f6fbfd" metalness={.42} roughness={.2}/></mesh>
  <mesh position={[-.47,0,0]} rotation={[0,0,Math.PI/2]}><coneGeometry args={[.19,.36,20]}/><meshStandardMaterial color="#f2a253" emissive="#b34d1e" emissiveIntensity={.4}/></mesh>
  <mesh position={[.33,.16,.02]}><sphereGeometry args={[.105,24,18]}/><meshPhysicalMaterial color="#53dfff" emissive="#0789ae" emissiveIntensity={.5} metalness={.22} roughness={.12} clearcoat={1}/></mesh>
  {[-1,1].map(side=><mesh key={side} position={[-.34,side*.24,0]} rotation={[0,0,side*.18]}><boxGeometry args={[.43,.12,.06]}/><meshStandardMaterial color="#1381a5" metalness={.55} roughness={.32} emissive="#073a51" emissiveIntensity={.45}/></mesh>)}
  <mesh position={[-.73,0,0]} ref={flame} rotation={[0,0,Math.PI/2]}><coneGeometry args={[.13,.62,20]}/><meshBasicMaterial color="#45dfff" toneMapped={false}/></mesh>
  <mesh position={[-.78,0,.01]} rotation={[0,0,Math.PI/2]}><coneGeometry args={[.08,.4,18]}/><meshBasicMaterial color="#ffbd72" toneMapped={false}/></mesh>
  <pointLight position={[-.8,0,.1]} color="#34d8ff" intensity={1.1} distance={3}/>
</group>}

const rockStarts=[[-3.8,3.8,-1.2],[-1.9,4.7,-2.2],[.2,5.4,-1.5],[2.2,4.2,-2.5],[4,5.1,-1.8],[-3.1,6.1,-3],[1.1,6.6,-2.6],[3.2,6.9,-1.4]]
function DrillScene({movementRef,run,onProgress}){
  const rocket=useRef(),debris=useRef([]),positions=useMemo(()=>makeStars(),[]),elapsed=useRef(run.seconds),lastReport=useRef(Math.floor(run.seconds)),hitCount=useRef(run.hits)
  useFrame((state,delta)=>{
    if(!rocket.current||run.complete)return
    const step=Math.min(delta,.04),x=(movementRef.current.right?1:0)-(movementRef.current.left?1:0),y=(movementRef.current.up?1:0)-(movementRef.current.down?1:0)
    rocket.current.position.x=clamp(rocket.current.position.x+x*step*4.3,-4.6,4.6);rocket.current.position.y=clamp(rocket.current.position.y+y*step*3.6,-2.6,2.5)
    rocket.current.rotation.z=THREE.MathUtils.damp(rocket.current.rotation.z,-y*.07,5,step)
    elapsed.current+=step
    const wholeSecond=Math.floor(elapsed.current)
    if(wholeSecond>lastReport.current){lastReport.current=wholeSecond;onProgress({seconds:Math.min(15,wholeSecond),hits:hitCount.current,complete:wholeSecond>=15||hitCount.current>=3})}
    debris.current.forEach((item,index)=>{
      if(!item)return
      item.position.y-=step*(1.75+(index%3)*.42)
      item.rotation.x+=step*.8;item.rotation.z+=step*(index%2?-.55:.65)
      const dx=item.position.x-rocket.current.position.x,dy=item.position.y-rocket.current.position.y
      if(Math.hypot(dx,dy)<.56){hitCount.current=Math.min(3,hitCount.current+1);item.position.y=6.8+(index%2);item.position.x=rockStarts[(index+hitCount.current*3)%rockStarts.length][0];onProgress({seconds:Math.floor(elapsed.current),hits:hitCount.current,complete:hitCount.current>=3||elapsed.current>=15})}
      else if(item.position.y< -4){item.position.y=6+(index%3)*.45;item.position.x=rockStarts[(index+Math.floor(elapsed.current))%rockStarts.length][0]}
    })
  })
  return <>
    <color attach="background" args={['#030a14']}/><fog attach="fog" args={['#06111e',13,38]}/>
    <ambientLight intensity={.5}/><directionalLight position={[-4,6,8]} intensity={1.7} color="#e8fbff"/><pointLight position={[0,2,1]} intensity={.6} color="#36d5ff"/>
    <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/></bufferGeometry><pointsMaterial color="#d9f3ff" size={.045} transparent opacity={.78} sizeAttenuation/></points>
    <mesh position={[-7.4,-3.2,-9]}><sphereGeometry args={[2.1,48,48]}/><meshStandardMaterial color="#1b5485" emissive="#0b3765" emissiveIntensity={.5} roughness={.8}/></mesh>
    <mesh position={[-7.4,-3.2,-8.7]} scale={1.035}><sphereGeometry args={[2.1,36,36]}/><meshBasicMaterial color="#35d5ff" transparent opacity={.12} side={THREE.BackSide}/></mesh>
    {rockStarts.map((position,index)=><group key={index} ref={node=>{debris.current[index]=node}} position={position} rotation={[index*.7,index*.9,.2]}><mesh><dodecahedronGeometry args={[.26+(index%3)*.09,1]}/><meshStandardMaterial color={index%2?'#b87755':'#748494'} roughness={.94} metalness={.12} emissive="#653b27" emissiveIntensity={.3}/></mesh><mesh position={[0,.43,0]}><cylinderGeometry args={[.025,.1,.48,8]}/><meshBasicMaterial color="#ffb56a" transparent opacity={.3}/></mesh></group>)}
    <group ref={rocket} position={rocketStartPosition} rotation={rocketStartRotation}><Rocket/></group>
    <mesh position={[0,0,-5]}><ringGeometry args={[6.5,6.57,80]}/><meshBasicMaterial color="#1d6c89" transparent opacity={.22} side={THREE.DoubleSide}/></mesh>
  </>
}

export default function RadiationDrill3D({run,onProgress}){
  const movementRef=useRef({up:false,down:false,left:false,right:false}),[available]=useState(webglReady)
  const setDirection=(key,value)=>{movementRef.current[key]=value}
  useEffect(()=>{
    const keyMap={arrowup:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',arrowright:'right',d:'right'}
    const onKeyDown=event=>{const direction=keyMap[event.key.toLowerCase()];if(direction){event.preventDefault();movementRef.current[direction]=true}}
    const onKeyUp=event=>{const direction=keyMap[event.key.toLowerCase()];if(direction)movementRef.current[direction]=false}
    const onBlur=()=>{movementRef.current={up:false,down:false,left:false,right:false}}
    window.addEventListener('keydown',onKeyDown);window.addEventListener('keyup',onKeyUp);window.addEventListener('blur',onBlur)
    return()=>{window.removeEventListener('keydown',onKeyDown);window.removeEventListener('keyup',onKeyUp);window.removeEventListener('blur',onBlur);onBlur()}
  },[])
  if(!available)return <div className="radiation-drill-loading" role="status">3D VIEW UNAVAILABLE / SKIP TO THE FLIGHT RESPONSE TO CONTINUE</div>
  return <div className="radiation-drill-scene" onPointerLeave={()=>{movementRef.current={up:false,down:false,left:false,right:false}}}>
    <DrillErrorBoundary><Canvas dpr={[1,1.5]} camera={{position:[0,0,11.5],fov:42,near:.1,far:60}} gl={{antialias:true,alpha:false,powerPreference:'high-performance'}}><DrillCamera/><DrillScene movementRef={movementRef} run={run} onProgress={onProgress}/></Canvas></DrillErrorBoundary>
    <div className="drill-crosshair" aria-hidden="true">+</div>
    <div className="drill-dpad" aria-label="Touch rocket controls"><button aria-label="Move up" onPointerDown={()=>setDirection('up',true)} onPointerUp={()=>setDirection('up',false)} onPointerCancel={()=>setDirection('up',false)}>↑</button><div><button aria-label="Move left" onPointerDown={()=>setDirection('left',true)} onPointerUp={()=>setDirection('left',false)} onPointerCancel={()=>setDirection('left',false)}>←</button><button aria-label="Move down" onPointerDown={()=>setDirection('down',true)} onPointerUp={()=>setDirection('down',false)} onPointerCancel={()=>setDirection('down',false)}>↓</button><button aria-label="Move right" onPointerDown={()=>setDirection('right',true)} onPointerUp={()=>setDirection('right',false)} onPointerCancel={()=>setDirection('right',false)}>→</button></div></div>
  </div>
}
