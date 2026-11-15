import { useEffect, useState } from 'react'
import { ArrowRight, BookOpen, Compass, Gauge, LoaderCircle, Plus, Radio, Satellite, Users, UserRound, X } from 'lucide-react'
import '../styles/PlayerHub.css'

async function request(path, options) {
  const response = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || 'Could not save this profile. Please try again.')
  return payload
}

const quickLinks = [
  ['overview', 'Mission Control', 'Commander dashboard', Gauge],
  ['explore', 'Game Explorer', 'Choose a destination', Compass],
  ['orbit', 'Orbit Explorer', 'Explore orbital paths', Satellite],
  ['academy', 'Learning Center', 'Learn space science', BookOpen],
]

function getGuestSession(route) {
  const key = 'setillar-titans-guest-session'
  let id
  try {
    id = localStorage.getItem(key)
    if (!id) {
      id = globalThis.crypto?.randomUUID?.() ?? `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`
      localStorage.setItem(key, id)
    }
  } catch {
    id = 'temporary-visitor'
  }
  return { id, kind: 'guest', label: 'VISITOR', name: 'Visitor', startView: route.id }
}

export default function PlayerHub({ onEnter }) {
  const [data, setData] = useState({ players: [], teams: [], playerCount: 0 })
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [teamName, setTeamName] = useState('')
  const [pendingRoute, setPendingRoute] = useState(null)
  const [rosterTeam, setRosterTeam] = useState(null)
  const [rosterPlayerId, setRosterPlayerId] = useState('')

  const refresh = async () => {
    setBusy(true)
    try { setData(await request('/api/game/profiles')); setError('') }
    catch (cause) { setError(`${cause.message} Start the app with npm run dev so its local SQLite service is available.`) }
    finally { setBusy(false) }
  }
  useEffect(() => {
    let mounted = true
    request('/api/game/profiles').then((next) => { if (mounted) { setData(next); setError('') } })
      .catch((cause) => { if (mounted) setError(`${cause.message} Start the app with npm run dev so its local SQLite service is available.`) })
      .finally(() => { if (mounted) setBusy(false) })
    return () => { mounted = false }
  }, [])

  const createPlayer = async (event) => {
    event.preventDefault()
    try {
      const { player } = await request('/api/game/players', { method: 'POST', body: JSON.stringify({ name: playerName }) })
      await refresh()
      onEnter({ ...player, kind: 'player', label: player.name })
    } catch (cause) { setError(cause.message) }
  }
  const createTeam = async (event) => {
    event.preventDefault()
    try {
      const { team } = await request('/api/game/teams', { method: 'POST', body: JSON.stringify({ name: teamName }) })
      await refresh()
      onEnter({ ...team, kind: 'team', label: team.name })
    } catch (cause) { setError(cause.message) }
  }
  const addRosterPlayer = async (event) => {
    event.preventDefault()
    try {
      const { team } = await request(`/api/game/teams/${rosterTeam.id}/members`, { method: 'POST', body: JSON.stringify({ playerId: Number(rosterPlayerId) }) })
      setData((current) => ({ ...current, players: current.players.filter((player) => player.id !== Number(rosterPlayerId)), teams: current.teams.map((item) => item.id === team.id ? team : item) }))
      setRosterTeam(team)
      setRosterPlayerId('')
      setError('')
    } catch (cause) { setError(cause.message) }
  }
  const enterRoute = (profile) => onEnter({ ...profile, startView: pendingRoute?.id, label: profile.label ?? profile.name })

  return <main className="player-hub">
    <header className="hub-topbar"><a className="hub-brand" href="#home"><span className="hub-mark"><img src="/sentillar-icon.png" alt=""/></span><span>SETILLAR <b>TITANS</b><small>MISSION CONTROL / V5</small></span></a><span className="hub-mode"><i/> LOCAL COMMAND NETWORK</span></header>
    <section className="hub-hero"><div className="hub-copy"><div className="hub-eyebrow">COMMANDER ACCESS / MISSION CAMPAIGNS</div><h1>Choose your crew.<br/><em>Begin your mission.</em></h1><p>Continue a saved campaign, fly solo, or create a crew of up to four players and plan together.</p><div className="hub-actions"><button className="hub-primary" onClick={() => setModal('player')}><UserRound/> CREATE PLAYER <ArrowRight/></button><button className="hub-secondary" onClick={() => setModal('team')}><Users/> CREATE TEAM</button></div></div><div className="hub-orbit-art" aria-hidden="true"><div className="hub-planet"><span/></div><div className="hub-ring hub-ring-a"/><div className="hub-ring hub-ring-b"/><div className="hub-satellite">✦</div><span className="hub-planet-label">MISSION NETWORK / EARTH ORBIT</span></div></section>
    <nav className="hub-shortcuts" aria-label="Mission areas">{quickLinks.map(([id, label, description, Icon]) => <button className="hub-shortcut" key={id} onClick={() => { if (id !== 'overview') onEnter(getGuestSession({ id })); else { setPendingRoute({ id, label }); setModal('access') } }}><span><Icon/></span><b>{label}</b><small>{description}</small><ArrowRight className="hub-shortcut-arrow"/></button>)}</nav>
    <section className="hub-saves"><div className="hub-section-title"><div><div className="hub-eyebrow">SAVED FLIGHT CREWS</div><h2>Continue your campaign</h2></div><span>{data.playerCount ?? data.players.length} PLAYERS · {data.teams.length} TEAMS</span></div>
      {error&&<div className="hub-error" role="alert"><span>{error}</span><button onClick={refresh} aria-label="Retry"><LoaderCircle size={16}/></button></div>}
      {busy?<div className="hub-empty">Connecting to the local mission database…</div>:data.players.length+data.teams.length===0?<div className="hub-empty"><Radio/><b>Your command roster is ready.</b><span>Create a player or team to save your first campaign here.</span></div>:<div className="hub-rosters">
        {data.players.map((player)=><article className="hub-profile" key={`p-${player.id}`}><div className="hub-avatar"><UserRound/></div><div className="hub-profile-copy"><small>INDIVIDUAL COMMANDER</small><b>{player.name}</b><span>Personal campaign · saved on this computer</span></div><button onClick={()=>onEnter({...player,kind:'player',label:player.name})}>CONTINUE <ArrowRight/></button></article>)}
        {data.teams.map((team)=><article className="hub-profile team-profile" key={`t-${team.id}`}><div className="hub-avatar"><Users/></div><div className="hub-profile-copy"><small>TEAM CAMPAIGN · {team.members.length}/4 PLAYERS</small><b>{team.name}</b><span>{team.members.length?team.members.map((member)=>member.name).join(' · '):'Team created · add players whenever you are ready'}</span></div><button className="hub-roster-button" onClick={()=>{setRosterTeam(team);setRosterPlayerId('');setModal('roster')}}>ROSTER</button><button onClick={()=>onEnter({...team,kind:'team',label:team.name})}>CONTINUE <ArrowRight/></button></article>)}
      </div>}
      <div className="hub-note">Campaign progress stays on this device. Team members take turns in one shared mission session.</div>
    </section>
    <footer className="hub-footer">SETILLAR TITANS · EDUCATIONAL MISSION DESIGN GAME · SIMPLIFIED MODEL · NOT FOR FLIGHT DESIGN</footer>
    {modal&&<div className="hub-modal-scrim" onMouseDown={(event)=>event.target===event.currentTarget&&setModal('')}><section className="hub-modal" role="dialog" aria-modal="true" aria-labelledby="hub-modal-title"><button className="hub-close" onClick={()=>setModal('')} aria-label="Close"><X/></button>
      <div className="hub-eyebrow">{modal==='roster'?'TEAM SETUP':modal==='access'?'COMMANDER ACCESS':'NEW CAMPAIGN / COMMANDER SETUP'}</div>
      <h2 id="hub-modal-title">{modal==='access'?`Open ${pendingRoute?.label}`:modal==='roster'?'Manage team roster':modal==='team'?'Create your team':'Create a player'}</h2>
      <p>{modal==='access'?'Choose a saved player or team to open this mission area.':modal==='roster'?'Add saved players to this team. A crew can include up to four players.':'Choose a name to continue. Team members can be added later from the team roster.'}</p>
      {modal==='access'&&<div className="hub-access-list">{data.players.map((player)=><button key={`access-player-${player.id}`} onClick={()=>enterRoute({...player,kind:'player',label:player.name})}><UserRound/><span><b>{player.name}</b><small>Individual commander</small></span><ArrowRight/></button>)}{data.teams.map((team)=><button key={`access-team-${team.id}`} onClick={()=>enterRoute({...team,kind:'team',label:team.name})}><Users/><span><b>{team.name}</b><small>Team campaign · {team.members.length}/4 players</small></span><ArrowRight/></button>)}{!data.players.length&&!data.teams.length&&<div className="hub-empty"><b>No saved commanders yet</b><span>Create a player or team, then choose this area.</span></div>}</div>}
      {modal==='roster'&&<form onSubmit={addRosterPlayer}><div className="hub-member-fields"><div className="hub-member-head"><b>{rosterTeam?.name}</b><span>{rosterTeam?.members.length ?? 0}/4 PLAYERS</span></div>{rosterTeam?.members.map((member)=><div className="hub-roster-member" key={member.id}><UserRound size={15}/>{member.name}</div>)}{(rosterTeam?.members.length ?? 0)<4&&<label>Add a saved player<select required value={rosterPlayerId} onChange={(event)=>setRosterPlayerId(event.target.value)}><option value="">Choose a player…</option>{data.players.map((player)=><option key={player.id} value={player.id}>{player.name}</option>)}</select></label>}{!data.players.length&&(rosterTeam?.members.length ?? 0)<4&&<small className="hub-roster-hint">Create a player profile first, then return here to add them.</small>}</div>{(rosterTeam?.members.length ?? 0)<4&&data.players.length>0&&<button className="hub-primary hub-submit" type="submit"><Plus size={16}/> ADD PLAYER TO TEAM</button>}</form>}
      {(modal==='player'||modal==='team')&&<form onSubmit={modal==='team'?createTeam:createPlayer}><label>{modal==='team'?'Team name':'Commander name'}<input autoFocus maxLength={40} required value={modal==='team'?teamName:playerName} onChange={(event)=>modal==='team'?setTeamName(event.target.value):setPlayerName(event.target.value)} placeholder={modal==='team'?'e.g. Lunar Survey Crew':'e.g. Commander Alex'}/></label><button className="hub-primary hub-submit" type="submit">{modal==='team'?'CREATE TEAM & BEGIN':'CREATE PLAYER & BEGIN'} <ArrowRight/></button></form>}
    </section></div>}
  </main>
}
