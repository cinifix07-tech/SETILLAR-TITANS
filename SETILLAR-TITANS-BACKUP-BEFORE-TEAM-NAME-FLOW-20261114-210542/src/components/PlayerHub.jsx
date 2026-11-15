import { useEffect, useState } from 'react'
import { ArrowRight, LoaderCircle, Plus, Radio, Users, UserRound, X } from 'lucide-react'
import '../styles/PlayerHub.css'

async function request(path, options) {
  const response = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || 'Could not save this profile. Please try again.')
  return payload
}

export default function PlayerHub({ onEnter }) {
  const [data, setData] = useState({ players: [], teams: [] })
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [teamName, setTeamName] = useState('')
  const [members, setMembers] = useState([''])

  const refresh = async () => {
    setBusy(true)
    try { setData(await request('/api/game/profiles')); setError('') }
    catch (cause) { setError(`${cause.message} Start the app with npm run dev so its local SQLite service is available.`) }
    finally { setBusy(false) }
  }
  useEffect(() => {
    let mounted = true
    request('/api/game/profiles').then((next) => { if (mounted) { setData(next); setError('') } }).catch((cause) => { if (mounted) setError(`${cause.message} Start the app with npm run dev so its local SQLite service is available.`) }).finally(() => { if (mounted) setBusy(false) })
    return () => { mounted = false }
  }, [])

  const createPlayer = async (event) => {
    event.preventDefault()
    try { const { player } = await request('/api/game/players', { method: 'POST', body: JSON.stringify({ name: playerName }) }); await refresh(); setModal(''); setPlayerName(''); onEnter({ ...player, kind: 'player', label: player.name }) }
    catch (cause) { setError(cause.message) }
  }
  const createTeam = async (event) => {
    event.preventDefault()
    try {
      const { team } = await request('/api/game/teams', { method: 'POST', body: JSON.stringify({ name: teamName, members: members.filter((name) => name.trim()) }) })
      await refresh(); setModal(''); setTeamName(''); setMembers(['']); onEnter({ ...team, kind: 'team', label: team.name })
    } catch (cause) { setError(cause.message) }
  }
  return <main className="player-hub">
    <header className="hub-topbar"><a className="hub-brand" href="#home"><span className="hub-mark"><img src="/sentillar-icon.png" alt=""/></span><span>SETILLAR <b>TITANS</b><small>MISSION CONTROL / V5</small></span></a><span className="hub-mode"><i/> LOCAL COMMAND NETWORK</span></header>
    <section className="hub-hero"><div className="hub-copy"><div className="hub-eyebrow">COMMANDER ACCESS / MISSION CAMPAIGNS</div><h1>Choose your crew.<br/><em>Begin your mission.</em></h1><p>Continue a saved campaign, fly solo, or create a crew of up to four players and plan together.</p><div className="hub-actions"><button className="hub-primary" onClick={() => setModal('player')}><UserRound/> CREATE PLAYER <ArrowRight/></button><button className="hub-secondary" onClick={() => { setMembers(['']); setModal('team') }}><Users/> CREATE TEAM</button></div></div><div className="hub-orbit-art" aria-hidden="true"><div className="hub-planet"><span/></div><div className="hub-ring hub-ring-a"/><div className="hub-ring hub-ring-b"/><div className="hub-satellite">✦</div><span className="hub-planet-label">MISSION NETWORK / EARTH ORBIT</span></div></section>
    <section className="hub-saves"><div className="hub-section-title"><div><div className="hub-eyebrow">SAVED FLIGHT CREWS</div><h2>Continue your campaign</h2></div><span>{data.players.length} PLAYERS · {data.teams.length} TEAMS</span></div>
      {error&&<div className="hub-error" role="alert"><span>{error}</span><button onClick={refresh} aria-label="Retry"><LoaderCircle size={16}/></button></div>}
      {busy?<div className="hub-empty">Connecting to the local mission database…</div>:data.players.length+data.teams.length===0?<div className="hub-empty"><Radio/><b>Your command roster is ready.</b><span>Create a player or team to save your first campaign here.</span></div>:<div className="hub-rosters">
        {data.players.map((player)=><article className="hub-profile" key={`p-${player.id}`}><div className="hub-avatar"><UserRound/></div><div className="hub-profile-copy"><small>INDIVIDUAL COMMANDER</small><b>{player.name}</b><span>Personal campaign · saved on this computer</span></div><button onClick={()=>onEnter({...player,kind:'player',label:player.name})}>CONTINUE <ArrowRight/></button></article>)}
        {data.teams.map((team)=><article className="hub-profile team-profile" key={`t-${team.id}`}><div className="hub-avatar"><Users/></div><div className="hub-profile-copy"><small>TEAM CAMPAIGN · {team.members.length}/4 PLAYERS</small><b>{team.name}</b><span>{team.members.map((member)=>member.name).join(' · ')}</span></div><button onClick={()=>onEnter({...team,kind:'team',label:team.name})}>CONTINUE <ArrowRight/></button></article>)}
      </div>}
      <div className="hub-note">Campaign progress stays on this device. Team members take turns in one shared mission session.</div>
    </section>
    <footer className="hub-footer">SETILLAR TITANS · EDUCATIONAL MISSION DESIGN GAME · SIMPLIFIED MODEL · NOT FOR FLIGHT DESIGN</footer>
    {modal&&<div className="hub-modal-scrim" onMouseDown={(event)=>event.target===event.currentTarget&&setModal('')}><section className="hub-modal" role="dialog" aria-modal="true" aria-labelledby="hub-modal-title"><button className="hub-close" onClick={()=>setModal('')} aria-label="Close"><X/></button><div className="hub-eyebrow">NEW CAMPAIGN / COMMANDER SETUP</div><h2 id="hub-modal-title">{modal==='team'?'Create your team':'Create a player'}</h2><p>{modal==='team'?'Name your crew and add up to four teammates. You can play the same saved mission together on this device.':'Choose a commander name. Your mission progress will be saved separately.'}</p>
      <form onSubmit={modal==='team'?createTeam:createPlayer}><label>{modal==='team'?'Team name':'Commander name'}<input autoFocus maxLength={40} required value={modal==='team'?teamName:playerName} onChange={(event)=>modal==='team'?setTeamName(event.target.value):setPlayerName(event.target.value)} placeholder={modal==='team'?'e.g. Lunar Survey Crew':'e.g. Commander Alex'}/></label>
      {modal==='team'&&<div className="hub-member-fields"><div className="hub-member-head"><b>TEAM ROSTER</b><span>{members.filter((name)=>name.trim()).length}/4 players</span></div>{members.map((name,index)=><label key={index}>Player {index+1}<div className="hub-input-row"><input maxLength={40} required={index===0} value={name} onChange={(event)=>setMembers((current)=>current.map((item,itemIndex)=>itemIndex===index?event.target.value:item))} placeholder={index===0?'Team captain name':'Add a teammate (optional)'}/>{index>0&&<button type="button" onClick={()=>setMembers((current)=>current.filter((_,itemIndex)=>itemIndex!==index))} aria-label={`Remove player ${index+1}`}><X size={16}/></button>}</div></label>)}{members.length<4&&<button className="hub-add-member" type="button" onClick={()=>setMembers((current)=>[...current,''])}><Plus size={15}/> ADD PLAYER</button>}</div>}
      <button className="hub-primary hub-submit" type="submit">{modal==='team'?'CREATE TEAM & BEGIN':'CREATE PLAYER & BEGIN'} <ArrowRight/></button></form>
    </section></div>}
  </main>
}
