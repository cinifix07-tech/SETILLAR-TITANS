import { useEffect, useRef } from 'react'
import { Activity, BatteryCharging, CircleAlert, DollarSign, Fuel, Radio, Scale, X } from 'lucide-react'
import '../styles/ResourceHealthDialog.css'

function Meter({label,value,limit,unit,Icon}) {
  const safeLimit=Number(limit)||0,amount=Number(value)||0,percent=safeLimit>0?Math.max(0,Math.min(100,amount/safeLimit*100)):0,over=amount>safeLimit
  const display=number=>Number.isInteger(number)?number:Number(number).toFixed(1)
  return <div className={`health-meter ${over?'over':''}`}><div className="health-meter-top"><span><Icon size={15}/>{label}</span><b>{display(amount)} / {display(safeLimit)} {unit}</b></div><div className="health-meter-track"><i style={{width:`${percent}%`}}/></div><small>{over?`Over configured limit by ${display(amount-safeLimit)} ${unit}`:`${display(safeLimit-amount)} ${unit} remaining`}</small></div>
}

export default function ResourceHealthDialog({open,onClose,config,calc,validation}) {
  const dialogRef=useRef(null),closeRef=useRef(null)
  useEffect(()=>{
    if(!open)return undefined
    const previous=document.activeElement,previousOverflow=document.body.style.overflow
    document.body.style.overflow='hidden'
    closeRef.current?.focus()
    const handleKeys=event=>{
      if(event.key==='Escape'){event.preventDefault();onClose();return}
      if(event.key!=='Tab')return
      const controls=dialogRef.current?.querySelectorAll('button:not(:disabled)')
      if(!controls?.length)return
      const first=controls[0],last=controls[controls.length-1]
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    }
    document.addEventListener('keydown',handleKeys)
    return()=>{document.removeEventListener('keydown',handleKeys);document.body.style.overflow=previousOverflow;previous?.focus?.()}
  },[open,onClose])
  if(!open)return null
  const dataDemand=18+calc.payload.reduce((sum,item)=>sum+item.value,0)
  const launchCapacity=Math.round(calc.rocket.mass*calc.orbit.launchFactor)
  return <div className="resource-dialog-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}>
    <section ref={dialogRef} className="resource-health-dialog" role="dialog" aria-modal="true" aria-labelledby="resource-dialog-title" aria-describedby="resource-dialog-description">
      <header className="resource-dialog-header"><div className="resource-dialog-icon"><Activity size={20}/></div><div className="resource-dialog-heading"><span className="game-eyebrow">LIVE MISSION CALCULATION</span><h2 id="resource-dialog-title">Resource health</h2><p id="resource-dialog-description">Current configuration for {config.name||calc.destination.name} / {calc.destination.name}</p></div><span className={`resource-dialog-state ${validation.valid?'ready':'warning'}`}><i/>{validation.valid?'WITHIN LIMITS':'REVIEW'}</span><button ref={closeRef} className="resource-dialog-close" onClick={onClose} aria-label="Close resource health"><X size={18}/></button></header>
      <div className="resource-dialog-orbit"><span><b>{calc.orbit.abbr}</b> / {calc.orbit.name}</span><small>{calc.destination.name} target / modeled launch capacity {launchCapacity} kg</small></div>
      <div className="resource-dialog-meters"><Meter label="Mission mass" value={calc.mass} limit={launchCapacity} unit="kg" Icon={Scale}/><Meter label="Electrical demand" value={calc.power} limit={calc.limits.power} unit="W" Icon={BatteryCharging}/><Meter label="Mission budget" value={calc.budget} limit={calc.limits.budget} unit="M credits" Icon={DollarSign}/><Meter label="Fuel required" value={calc.fuelNeeded} limit={config.fuel} unit="units" Icon={Fuel}/><Meter label="Data link demand" value={dataDemand} limit={calc.limits.communications} unit="pts" Icon={Radio}/></div>
      {validation.valid?<div className="resource-dialog-result good"><Activity size={16}/><span><b>Configuration meets modeled checks</b><small>Resource margins are currently within the game scenario limits.</small></span></div>:<div className="resource-dialog-result needs-review"><CircleAlert size={17}/><div><b>Review these constraints</b><ul>{validation.issues.map(issue=><li key={issue.code}>{issue.message}</li>)}</ul></div></div>}
      <p className="resource-dialog-note">Educational estimates for gameplay; not spacecraft engineering advice.</p>
    </section>
  </div>
}
