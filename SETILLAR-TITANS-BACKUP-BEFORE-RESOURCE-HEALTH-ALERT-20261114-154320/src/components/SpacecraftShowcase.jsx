import '../styles/SpacecraftEquipment.css'

export default function SpacecraftShowcase({bus,config,payload=[]}) {
  const equipmentLabel=[config?.powerSource,config?.propulsion,config?.communications,config?.shielding,...payload.map(item=>item.id)].filter(Boolean).join(', ')
  const equipmentTags=[config?.powerSource==='solar'?'SOLAR ARRAYS':'RTG GENERATOR',config?.propulsion==='ion'?'ION THRUSTER':'CHEMICAL ENGINE',config?.communications==='highgain'?'HIGH-GAIN ARRAY':config?.communications==='deep'?'DEEP-SPACE DISH':'COMPACT ANTENNA',config?.shielding==='reinforced'?'REINFORCED SHIELDING':'BASIC SHIELDING',...payload.map(item=>item.name.toUpperCase())]
  return <section className="game-card spacecraft-showcase" aria-label={`Selected spacecraft preview: ${bus.name}. Configured equipment: ${equipmentLabel}`}>
    <div className="spacecraft-showcase-head"><span className="game-eyebrow">LIVE SPACECRAFT PREVIEW</span><span className="showcase-live"><i/>CONFIGURED</span></div>
    <h2>{bus.name}</h2><p>{bus.type} · preview updates with your bus selection</p>
    <div className={`showcase-stage bus-${bus.id}`}>
      <div className="showcase-stars" aria-hidden="true"/><div className="showcase-orbit-ring" aria-hidden="true"/>
      <svg className="showcase-model" viewBox="0 0 640 360" role="img" aria-label={`Illustrative 3D-style ${bus.name} with configured ${equipmentLabel}`}>
        <defs>
          <linearGradient id="panel-face" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#64dfff"/><stop offset=".5" stopColor="#1a75a2"/><stop offset="1" stopColor="#12395e"/></linearGradient>
          <linearGradient id="bus-front" x1="0" y1="0" x2=".9" y2="1"><stop stopColor="#f2fbff"/><stop offset=".55" stopColor="#a7c0d0"/><stop offset="1" stopColor="#45667f"/></linearGradient>
          <linearGradient id="bus-side" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#547b96"/><stop offset="1" stopColor="#203c55"/></linearGradient>
          <radialGradient id="sensor-glass"><stop stopColor="#a7f1ff"/><stop offset=".6" stopColor="#347da1"/><stop offset="1" stopColor="#102c47"/></radialGradient>
          <filter id="model-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="9"/></filter>
        </defs>
        <ellipse cx="306" cy="186" rx="190" ry="58" fill="none" stroke="#35d5ff" strokeOpacity=".27" strokeDasharray="4 8" transform="rotate(-17 306 186)"/>
        <ellipse cx="290" cy="177" rx="105" ry="80" fill="#35d5ff" opacity=".09" filter="url(#model-glow)"/>
        <g className="showcase-satellite-model" transform={bus.id==='pioneer'?'translate(286 174) scale(.78)':bus.id==='horizon'?'translate(286 174) scale(1.16)':'translate(286 174) scale(1)'}>
          {config?.powerSource==='solar'&&<><g className="showcase-solar-panel left-panel"><path d="M-132 -28L-72 -35L-72 34L-132 26Z" fill="url(#panel-face)" stroke="#7ce4ff" strokeWidth="2"/><path d="M-118 -29L-118 28M-103 -31L-103 30M-88 -33L-88 32M-131 -6L-73 -4M-131 11L-73 13" stroke="#8de9ff" strokeOpacity=".45" strokeWidth="1.5"/></g><g className="showcase-solar-panel right-panel"><path d="M72 -35L132 -28L132 26L72 34Z" fill="url(#panel-face)" stroke="#7ce4ff" strokeWidth="2"/><path d="M87 -33L87 32M102 -31L102 30M117 -29L117 28M73 -4L131 -6M73 13L131 11" stroke="#8de9ff" strokeOpacity=".45" strokeWidth="1.5"/></g></>}
          {config?.powerSource==='rtg'&&<g className="showcase-rtg"><path d="M76 -15L91 -24L114 -18L114 18L91 24L76 15Z" fill="#d48d42" stroke="#ffe09a" strokeWidth="2"/><path d="M84 -18V18M92 -21V21M100 -21V21M108 -19V19" stroke="#5e4d3b" strokeWidth="2"/><ellipse cx="113" cy="0" rx="5" ry="18" fill="#ffcf76" stroke="#fff0ba" strokeWidth="1"/><path d="M73 -8H59M73 8H59" stroke="#b8d3df" strokeWidth="3"/></g>}
          <path d="M-72 -28L-49 -43L49 -43L72 -28L72 27L49 43L-49 43L-72 27Z" fill="url(#bus-front)" stroke="#f1fbff" strokeWidth="2"/>
          <path d="M49 -43L72 -28L72 27L49 43Z" fill="url(#bus-side)" stroke="#8eb6cb" strokeWidth="1.5"/>
          <path d="M-72 -28L-49 -43L49 -43L72 -28L0 -12Z" fill="#d9e9f1" stroke="#fff" strokeWidth="1.5"/>
          <rect x="-39" y="-21" width="78" height="47" rx="4" fill="#718fa2" stroke="#f1fbff" strokeWidth="1.2"/>
          <circle cx="0" cy="1" r={bus.id==='horizon'?20:15} fill="url(#sensor-glass)" stroke="#d9faff" strokeWidth="2"/><circle cx="-5" cy="-4" r="4" fill="#efffff" opacity=".75"/>
          <path d="M-34 32H34M-24 37H24" stroke="#385a73" strokeWidth="2"/>
          <g className={`showcase-antenna ${config?.communications??'compact'}`}><path d="M0 -43V-56" stroke="#d8f7ff" strokeWidth="2"/>{config?.communications==='highgain'?<><path d="M-24 -66Q0 -42 24 -66L17 -62Q0 -47 -17 -62Z" fill="#e4edf0" stroke="#8deaff" strokeWidth="1.5"/><path d="M0 -56V-63M0 -56L-9 -47" stroke="#e9f8ff" strokeWidth="1.5"/></>:config?.communications==='deep'?<><path d="M-17 -64Q0 -45 17 -64L12 -60Q0 -49 -12 -60Z" fill="#d8e6ec" stroke="#8deaff" strokeWidth="1.3"/><path d="M0 -56V-62" stroke="#f2fcff" strokeWidth="1.5"/></>:<><path d="M-7 -58H7" stroke="#d8f7ff" strokeWidth="2"/><circle cx="0" cy="-60" r="3" fill="#53dfff"/></>}</g>
          {config?.shielding==='reinforced'&&<path className="showcase-shielding" d="M-78 -31L-54 -49L54 -49L78 -31L78 30L54 49L-54 49L-78 30Z" fill="#46d6f0" fillOpacity=".08" stroke="#ffc96b" strokeWidth="3" strokeDasharray="6 4"/>}
          <g className={`showcase-engine ${config?.propulsion??'chemical'}`}>{config?.propulsion==='ion'?<><path d="M-17 43L-12 54H12L17 43Z" fill="#527a94" stroke="#b7e8fa" strokeWidth="1.5"/><path d="M-7 55Q0 68 7 55" fill="none" stroke="#59dfff" strokeWidth="4" filter="url(#model-glow)"/><path d="M-5 55Q0 64 5 55" fill="none" stroke="#d8fbff" strokeWidth="2"/></>:<><path d="M-20 43L-14 56H-5L-2 43ZM2 43L5 56H14L20 43Z" fill="#526b7e" stroke="#c9e3ef" strokeWidth="1.5"/><path d="M-12 57Q-10 70-7 57M10 57Q12 70 14 57" fill="none" stroke="#ffb55e" strokeWidth="3"/></>}</g>
          {payload.map((instrument,index)=>{const positions=payload.length===1?[44]:payload.length===2?[-47,47]:[-53,-36,53];const offset=positions[index]??(index-1)*18;return <g key={instrument.id} className={`showcase-payload ${instrument.id}`} transform={`translate(${offset} 57)`}><path d="M-8 0H8L6 12H-6Z" fill="#b6c9d4" stroke="#f1fbff" strokeWidth="1.2"/><circle cx="0" cy="3" r="4.5" fill={instrument.id==='thermal'?'#ffbd63':instrument.id==='radar'?'#8edbf1':'url(#sensor-glass)'} stroke="#e6fcff" strokeWidth="1.2"/><path d="M-4 12H4" stroke="#7896a8" strokeWidth="2"/></g>})}
          {bus.id==='horizon'&&<><path d="M-52 -50L-66 -63M52 -50L66 -63" stroke="#daeaf3" strokeWidth="3"/><rect x="-11" y="-52" width="22" height="10" rx="3" fill="#e8a75b"/></>}
          {bus.id==='pioneer'&&<path d="M-47 48H47" stroke="#ffc96a" strokeWidth="3"/>}
          <circle cx="-63" cy="0" r="4" fill="#ffbd65"/><circle cx="63" cy="0" r="4" fill="#ffbd65"/>
        </g>
        <g className="showcase-astronaut" transform="translate(505 220)">
          <path d="M-4 78Q0 59 0 43L-19 41L-30 76Q-29 82-21 82L-12 63L-10 84H-2Z" fill="#c5d8e2" stroke="#edfaff" strokeWidth="2"/><path d="M5 78Q1 60 4 43L22 40L31 75Q30 82 22 82L13 62L13 84H5Z" fill="#829db1" stroke="#e3f4fd" strokeWidth="2"/><path d="M-20 74L-6 75L-4 84H-24Q-31 82-27 76Z" fill="#102d46"/><path d="M12 74L26 74L31 79Q31 85 25 85H9Z" fill="#102d46"/>
          <path d="M-28 4Q-39 14-37 39L-28 49L-16 42L-17 24L-11 15Z" fill="#d7e7ee" stroke="#f7fdff" strokeWidth="2"/><path d="M19 4Q31 13 34 32L29 47L19 44L15 25L8 15Z" fill="#c2d7e2" stroke="#f7fdff" strokeWidth="2"/><circle cx="-38" cy="41" r="8" fill="#e5f4fa" stroke="#96b7c8" strokeWidth="2"/><circle cx="29" cy="43" r="8" fill="#e5f4fa" stroke="#96b7c8" strokeWidth="2"/>
          <path d="M-21 9Q0-1 21 9L24 42Q2 57-23 42Z" fill="#e7f1f4" stroke="#fff" strokeWidth="2"/><path d="M-14 17Q0 10 15 17L13 31Q0 39-13 31Z" fill="#153f60" stroke="#81e6ff" strokeWidth="2"/><path d="M-11 20Q-2 15 5 18" fill="none" stroke="#c8f8ff" strokeOpacity=".8" strokeWidth="2"/><rect x="-7" y="39" width="14" height="8" rx="2" fill="#287fa0"/><circle cx="0" cy="43" r="2" fill="#a5f1ff"/><path d="M-20 12L-26 25M20 12L26 24" stroke="#50cce8" strokeWidth="3"/><path d="M-15 47L-8 53M14 47L8 53" stroke="#dbeaf0" strokeWidth="3"/>
          <path d="M-10 0Q-14-7-8-11M10 0Q14-7 8-11" fill="none" stroke="#e3f1f5" strokeWidth="3"/><circle cx="0" cy="-18" r="20" fill="#d9e6eb" stroke="#f7fdff" strokeWidth="2"/><path d="M-15-22Q0-35 15-22L13-12Q0-5-13-12Z" fill="#123855" stroke="#6eddfa" strokeWidth="2"/><path d="M-8-24Q-1-30 5-27" fill="none" stroke="#d4f9ff" strokeOpacity=".8" strokeWidth="2"/><path d="M-20-14L-27-10M20-14L27-10" stroke="#35d5ff" strokeWidth="3"/>
        </g>
        <text x="290" y="286" textAnchor="middle" fill="#a7cada" fontSize="12" fontFamily="ui-monospace,monospace" letterSpacing="2">{bus.id==='pioneer'?'6U CUBESAT':bus.id==='horizon'?'EARTH SCIENCE PLATFORM':'SMALL SATELLITE BUS'}</text>
        <text x="505" y="320" textAnchor="middle" fill="#8ceaff" fontSize="10" fontFamily="ui-monospace,monospace" letterSpacing="1.4">ASTRONAUT / SCALE REFERENCE</text>
      </svg>
      <span className="showcase-chip"><i/>BUS MODEL / {bus.id.toUpperCase()}</span>
    </div>
    <div className="showcase-system-chips" aria-label="Installed spacecraft equipment">{equipmentTags.map(tag=><span key={tag}><i/>{tag}</span>)}</div>
    <div className="showcase-specs"><div><small>DRY MASS</small><b>{bus.mass} kg</b></div><div><small>BUS POWER</small><b>{bus.power} W</b></div><div><small>BUS COST</small><b>{bus.cost} M credits</b></div></div>
    <p className="showcase-note">Astronaut shown as a size reference only. This is a crewless satellite mission; the character does not imply a crewed spacecraft.</p>
  </section>
}
