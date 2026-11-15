import { useCallback, useEffect, useRef, useState } from 'react'
import { Radio, RotateCcw } from 'lucide-react'
import '../styles/SignalRelayChallenge.css'

const targetBands=[28,70,50]
export default function SignalRelayChallenge({onClose}){
  const [playing,setPlaying]=useState(false),[seconds,setSeconds]=useState(0),[locks,setLocks]=useState(0),[misses,setMisses]=useState(0),[outcome,setOutcome]=useState('')
  const [marker,setMarker]=useState(5),markerRef=useRef(5),lockRef=useRef(0),missRef=useRef(0)
  useEffect(()=>{
    if(!playing)return undefined
    const timer=window.setInterval(()=>{setSeconds(value=>{const next=value+.05;const position=5+90*(.5+.5*Math.sin(next*1.8));markerRef.current=position;setMarker(position);return next})},50)
    return()=>window.clearInterval(timer)
  },[playing])
  const begin=()=>{setSeconds(0);setLocks(0);setMisses(0);setOutcome('');lockRef.current=0;missRef.current=0;markerRef.current=5;setMarker(5);setPlaying(true)}
  const lockSignal=useCallback(()=>{
    if(!playing)return
    const target=targetBands[lockRef.current]??50
    if(Math.abs(markerRef.current-target)<=9){lockRef.current+=1;setLocks(lockRef.current);if(lockRef.current>=3){setOutcome('CLEAR');setPlaying(false)}}
    else{missRef.current+=1;setMisses(missRef.current);if(missRef.current>=5){setOutcome('MISSED');setPlaying(false)}}
  },[playing])
  useEffect(()=>{
    const onKeyDown=event=>{if(event.code==='Space'&&playing&&event.target?.tagName!=='BUTTON'){event.preventDefault();lockSignal()}}
    window.addEventListener('keydown',onKeyDown)
    return()=>window.removeEventListener('keydown',onKeyDown)
  },[playing,lockSignal])
  const target=targetBands[locks]??50
  return <section className="signal-relay-game" aria-label="Signal Relay challenge">
    <div className="signal-relay-heading"><span className="signal-relay-icon"><Radio size={20}/></span><div><span className="warning-kicker">TRANSIT MINI GAME / EDUCATIONAL MODEL</span><h3>Signal Relay</h3><p>Lock the moving carrier when it crosses the cyan window. Make three clean connections before five misses.</p></div></div>
    {!playing&&!outcome&&<div className="signal-relay-brief"><div><b>HOW TO PLAY</b><span>Watch the signal marker move across the channel. Press LOCK SIGNAL or Space when it reaches the target band.</span><small>Practice only. This challenge does not change the mission score, spacecraft health, or resource calculations.</small></div><button className="game-button radiation-continue" onClick={begin}>START SIGNAL RELAY</button></div>}
    {(playing||outcome)&&<>
      <div className="signal-relay-stats"><span>CONNECTIONS <b>{locks} OF 3</b></span><span>MISSED LOCKS <b>{misses} OF 5</b></span><span>TRANSMIT TIME <b>{seconds.toFixed(1)} SEC</b></span></div>
      <div className="signal-relay-track" role="img" aria-label={`Moving signal at ${Math.round(marker)} percent, target window at ${target} percent`}><span className="signal-target-band" style={{left:`${target}%`}}/><i className="signal-marker" style={{left:`${marker}%`}}/></div>
      {playing&&<button className="game-button signal-lock-button" onClick={lockSignal}>LOCK SIGNAL</button>}
      {outcome&&<div className={`signal-relay-result ${outcome==='CLEAR'?'clear':''}`}><b>{outcome==='CLEAR'?'SIGNAL PATH RESTORED':'SIGNAL WINDOW MISSED'}</b><span>{outcome==='CLEAR'?'Three data links connected.':'The practice relay ended after five missed timing windows.'} The mission rules are unchanged.</span><button className="game-button radiation-continue" onClick={()=>onClose(`Signal Relay ${outcome==='CLEAR'?'completed':'ended'}`)}>CONTINUE SIMULATION</button><button className="signal-relay-retry" onClick={begin}><RotateCcw size={14}/> TRY AGAIN</button></div>}
    </>}
    <footer className="signal-relay-footer"><span>Transit mini game / no effect on mission outcome</span><button onClick={()=>onClose('Signal Relay skipped')}>SKIP THIS CHALLENGE</button></footer>
  </section>
}
