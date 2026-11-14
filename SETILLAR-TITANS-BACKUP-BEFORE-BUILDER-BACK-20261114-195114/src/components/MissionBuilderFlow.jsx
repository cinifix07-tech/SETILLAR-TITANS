import { useMemo, useState } from 'react'
import destinations from '../data/destinations.json' with { type: 'json' }
import missionParts from '../data/missionParts.json' with { type: 'json' }
import { spacecraft, instruments, launchVehicles, getDestination } from '../engine/gameEngine.js'
import { getOrbit, orbitOrder } from '../engine/resourceCalculator.js'
import SpacecraftShowcase from './SpacecraftShowcase.jsx'
import ResourceHealthDialog from './ResourceHealthDialog.jsx'
import MissionLaunchModal from './MissionLaunchModal.jsx'
import '../styles/MissionBuilderFlow.css'
import '../styles/BuilderShowcaseSizing.css'

const steps=[['Mission brief','Set a name, destination, and science objective.'],['Spacecraft','Choose a bus and its supporting systems.'],['Science payload','Select instruments for the mission.'],['Orbit & fuel','Choose an orbit and check fuel allocation.'],['Flight review','Review the design and resource limits.']]
const objectivesByDestination={moon:['Polar ice survey','Surface mineral map','Lunar dust study'],mars:['Dust and weather mapping','Surface mineral survey','Seasonal ice monitoring'],europa:['Ice surface survey','Thermal feature mapping','Radiation environment study']}
export default function MissionBuilderFlow({config,patchConfig,calc,validation,setView,onLaunch,step,setStep,furthestStep,setFurthestStep}) {
  const [resourceHealthOpen,setResourceHealthOpen]=useState(false)
  const [launchModalOpen,setLaunchModalOpen]=useState(false)
  const destination=getDestination(config.destination)
  const objectives=objectivesByDestination[config.destination]??[]
  const complete=useMemo(()=>[
    Boolean(config.name?.trim()&&config.destination&&config.objective),
    Boolean(config.craft&&config.propulsion&&config.powerSource&&config.communications&&config.shielding&&config.rocket),
    calc.payload.length>0,
    Boolean(config.orbit&&Number(config.fuel)>=0),
    validation.valid,
  ],[config,calc.payload.length,validation.valid])
  const completedCount=complete.reduce((count,isComplete,index)=>count+(index<=furthestStep&&isComplete?1:0),0)
  const canContinue=step===0?complete[0]:step===1?complete[1]:step===2?complete[2]:step===3?complete[3]:true
  const advance=()=>{if(step<4&&canContinue){setFurthestStep(current=>Math.max(current,step+1));setStep(step+1)}}
  const selector=(label,key,items)=> <label className="field" key={key}><span>{label}</span><select value={config[key]} onChange={event=>{const value=event.target.value;patchConfig(key,value);if(key==='destination')patchConfig('objective',({moon:'Polar ice survey',mars:'Dust and weather mapping',europa:'Ice surface survey'})[value])}}>{items.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
  const reviewRow=(label,value,target)=><div className="review-row" key={label}><span>{label}</span><strong>{value}</strong><button onClick={()=>setStep(target)}>EDIT</button></div>

  return <>
    <div className="game-title"><div className="game-eyebrow">FLIGHT DECK / MISSION BUILDER</div><h1>Design your spacecraft.</h1><p>Complete each step. Your spacecraft preview and resource checks respond to your selections.</p></div>
    <section className="builder-progress game-card" aria-label="Mission design progress">
      <div className="builder-progress-heading"><div><span className="game-eyebrow">MISSION DESIGN PROGRESS</span><b>{completedCount} OF 5 STEPS COMPLETE</b></div><span>{Math.round(completedCount/5*100)}%</span></div>
      <div className="builder-progress-track"><i style={{width:`${completedCount/5*100}%`}}/></div>
      <nav className="builder-stepper" aria-label="Mission builder steps">{steps.map(([name,description],index)=>{const unlocked=index<=furthestStep,done=index<=furthestStep&&complete[index];return <button key={name} className={`builder-step ${step===index?'current':''} ${done?'complete':''}`} onClick={()=>unlocked&&setStep(index)} disabled={!unlocked} aria-current={step===index?'step':undefined} aria-label={`Step ${index+1}: ${name}${done?', complete':''}${!unlocked?', locked':''}`}><span className="builder-step-number">{done?'✓':`0${index+1}`}</span><span className="builder-step-copy"><b>{name}</b><small>{description}</small></span><span className="builder-step-state">{done?'DONE':step===index?'NOW':unlocked?'READY':'LOCKED'}</span></button>})}</nav>
    </section>

    <div className="mission-builder-flow">
      <section className="game-card builder-step-panel">
        <div className="builder-step-title"><span className="step-label">STEP 0{step+1} / 05</span><h2>{steps[step][0]}</h2><p>{steps[step][1]}</p></div>
        {step===0&&<div className="builder-fields-grid"><label className="field full"><span>Mission name</span><input value={config.name??''} maxLength={48} onChange={event=>patchConfig('name',event.target.value)} placeholder="e.g. Europa Ice Mapper"/></label>{selector('Destination','destination',destinations)}<label className="field"><span>Science objective</span><select value={config.objective} onChange={event=>patchConfig('objective',event.target.value)}>{objectives.map(objective=><option key={objective}>{objective}</option>)}</select></label><div className="builder-destination-note full"><b>{destination.name} mission brief</b><p>{destination.description}</p><small>Distance class {destination.distance} / {destination.environment}</small></div></div>}
        {step===1&&<><div className="builder-bus-list" role="group" aria-label="Choose a spacecraft bus">{spacecraft.map(bus=><button key={bus.id} className={`builder-bus-choice ${config.craft===bus.id?'selected':''}`} onClick={()=>patchConfig('craft',bus.id)} aria-pressed={config.craft===bus.id}><span className={`builder-bus-glyph ${bus.id}`}><i/></span><span><b>{bus.name}</b><small>{bus.type}</small><small>{bus.description}</small></span><strong>{bus.mass} kg<br/><small>BUS MASS</small></strong></button>)}</div><div className="builder-fields-grid systems-grid">{selector('Propulsion','propulsion',missionParts.propulsion)}{selector('Power source','powerSource',missionParts.powerSource)}{selector('Communications','communications',missionParts.communications)}{selector('Radiation shielding','shielding',missionParts.shielding)}{selector('Launch vehicle','rocket',launchVehicles)}<label className="field range-field"><span>Fuel allocation <b>{config.fuel} units</b></span><input type="range" min="0" max="140" step="5" value={config.fuel} onChange={event=>patchConfig('fuel',Number(event.target.value))}/><small>Additional fuel raises the modeled allocation; it does not change the selected spacecraft bus.</small></label></div></>}
        {step===2&&<div className="builder-payload-list">{instruments.map(instrument=><label key={instrument.id} className={`builder-payload-choice ${config.instruments.includes(instrument.id)?'selected':''}`}><input type="checkbox" checked={config.instruments.includes(instrument.id)} onChange={event=>patchConfig('instruments',event.target.checked?[...config.instruments,instrument.id]:config.instruments.filter(id=>id!==instrument.id))}/><span className="payload-checkbox">{config.instruments.includes(instrument.id)?'✓':''}</span><span className="payload-copy"><b>{instrument.name}</b><small>{instrument.desc}</small><small>{instrument.mass} kg · {instrument.power} W · {instrument.value} science points</small></span><span className="payload-cost">{instrument.cost} M<br/><small>COST</small></span></label>)}{!calc.payload.length&&<p className="builder-validation-message">Select at least one instrument to continue.</p>}</div>}
        {step===3&&<><div className="builder-orbit-options" role="group" aria-label="Choose a mission orbit">{orbitOrder.map(id=>{const orbit=getOrbit(id);return <button key={id} className={`builder-orbit-option ${config.orbit===id?'selected':''}`} onClick={()=>patchConfig('orbit',id)} aria-pressed={config.orbit===id}><span className="builder-orbit-top"><b>{orbit.abbr}</b><span>{config.orbit===id?'✓':'○'}</span></span><strong>{orbit.name}</strong><small>{orbit.altitude}</small><small>{orbit.missionFit}</small></button>})}</div><div className="builder-destination-note"><b>{calc.orbit.name} selected for {destination.name}</b><p>{calc.orbit.description??calc.orbit.missionFit}</p><small>Fuel needed: {calc.fuelNeeded} units · allocated: {config.fuel} units</small></div></>}
        {step===4&&<div className="builder-review">{reviewRow('MISSION',`${config.name||'Untitled mission'} · ${destination.name}`,0)}{reviewRow('SPACECRAFT BUS',calc.bus.name,1)}{reviewRow('INSTRUMENTS',calc.payload.length?calc.payload.map(item=>item.name).join(' · '):'None selected',2)}{reviewRow('LAUNCH VEHICLE',calc.rocket.name,1)}{reviewRow('ORBIT',`${calc.orbit.abbr} · ${calc.orbit.name}`,3)}{reviewRow('FUEL',`${config.fuel} allocated / ${calc.fuelNeeded} modeled need`,3)}<div className={`builder-review-status ${validation.valid?'ready':'warning'}`}><b>{validation.valid?'READY FOR SIMULATION':'RESOURCE CHECK NEEDS ATTENTION'}</b>{validation.valid?<p>The current design passes the game’s modeled equipment, mass, power, budget, fuel, and communication checks.</p>:<ul>{validation.issues.map(issue=><li key={issue.code}>{issue.message}</li>)}</ul>}</div></div>}
        <div className="builder-flow-footer"><span>Changes save automatically to this mission.</span><div>{step>0&&<button className="game-button secondary" onClick={()=>setStep(step-1)}>← BACK</button>}{step<4?<button className="game-button" onClick={advance} disabled={!canContinue}>CONTINUE TO {steps[step+1][0].toUpperCase()} →</button>:<button className="game-button" onClick={()=>setLaunchModalOpen(true)} disabled={!validation.valid}>▶ PLAY</button>}</div></div>
      </section>
      <aside className="builder-side-stack"><SpacecraftShowcase bus={calc.bus} config={config} payload={calc.payload} validation={validation} onOpenResourceHealth={()=>setResourceHealthOpen(true)} resourceHealthOpen={resourceHealthOpen}/></aside>
    </div>
    <div className="builder-quick-nav"><button onClick={()=>setView('orbit')}>OPEN ORBIT EXPLORER</button><button onClick={()=>setView('explore')}>CHANGE DESTINATION</button></div>
    <ResourceHealthDialog open={resourceHealthOpen} onClose={()=>setResourceHealthOpen(false)} config={config} calc={calc} validation={validation}/>
    <MissionLaunchModal open={launchModalOpen} config={config} calc={calc} onClose={()=>setLaunchModalOpen(false)} onStart={onLaunch}/>
  </>
}
