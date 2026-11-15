import { useEffect, useState } from 'react'
import { ArrowRight, BookOpen, Compass, Gauge, LoaderCircle, Plus, Radio, Satellite, Sparkles, Users, UserRound, X } from 'lucide-react'
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
  const [password, setPassword] = useState('')
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
    const savedToken = localStorage.getItem('setillar-account-token')
    if (savedToken) {
      request('/api/game/account', { headers: { Authorization: `Bearer ${savedToken}` } }).then(({ account }) => {
        if (mounted) onEnter({ ...account, kind: 'account', label: account.name, accountToken: savedToken })
      }).catch(() => { if (mounted) localStorage.removeItem('setillar-account-token') })
    }
    request('/api/game/profiles').then((next) => { if (mounted) { setData(next); setError('') } })
      .catch((cause) => { if (mounted) setError(`${cause.message} Start the app with npm run dev so its local SQLite service is available.`) })
      .finally(() => { if (mounted) setBusy(false) })
    return () => { mounted = false }
  }, [onEnter])

  const createPlayer = async (event) => {
    event.preventDefault()
    try {
      const { account, token } = await request('/api/game/accounts', { method: 'POST', body: JSON.stringify({ name: playerName, password }) })
      localStorage.setItem('setillar-account-token', token)
      onEnter({ ...account, kind: 'account', label: account.name, accountToken: token })
    } catch (cause) { setError(cause.message) }
  }
  const signIn = async (event) => {
    event.preventDefault()
    try {
      const { account, token } = await request('/api/game/login', { method: 'POST', body: JSON.stringify({ name: playerName, password }) })
      localStorage.setItem('setillar-account-token', token)
      onEnter({ ...account, kind: 'account', label: account.name, accountToken: token })
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
  const visibleTeams = data.teams.filter((team) => team.members.length > 0)

  return <main className="player-hub">
    <header className="hub-topbar"><a className="hub-brand" href="#home"><span className="hub-mark"><img src="/sentillar-icon.png" alt=""/></span><span>SETILLAR <b>TITANS</b><small>MISSION CONTROL / V5</small></span></a><div className="hub-topbar-actions"><span className="hub-mode"><i/> LOCAL COMMAND NETWORK</span><button className="hub-signin" onClick={()=>{setError('');setPassword('');setModal('login')}}>SIGN IN</button></div></header>
    <section className="hub-hero"><div className="hub-copy"><div className="hub-eyebrow">COMMANDER ACCESS / MISSION CAMPAIGNS</div><h1>Choose your crew.<br/><em>Begin your mission.</em></h1><p>Continue a saved campaign or create a player profile to start a mission.</p><div className="hub-actions"><button className="hub-primary" onClick={() => setModal('player')}><UserRound/> CREATE PLAYER <ArrowRight/></button></div></div><div className="hub-orbit-art" aria-hidden="true"><div className="hub-planet"><span/></div><div className="hub-ring hub-ring-a"/><div className="hub-ring hub-ring-b"/><div className="hub-satellite"><Sparkles size={20}/></div><span className="hub-planet-label">MISSION NETWORK / EARTH ORBIT</span></div></section>
    <nav className="hub-shortcuts" aria-label="Mission areas">{quickLinks.map(([id, label, description, Icon]) => <button className="hub-shortcut" key={id} onClick={() => { if (id !== 'overview') onEnter(getGuestSession({ id })); else { setPendingRoute({ id, label }); setModal('access') } }}><span><Icon/></span><b>{label}</b><small>{description}</small><ArrowRight className="hub-shortcut-arrow"/></button>)}</nav>
    <section className="hub-saves"><div className="hub-section-title"><div><div className="hub-eyebrow">SAVED FLIGHT CREWS</div><h2>Continue your campaign</h2></div><span>{data.playerCount ?? data.players.length} PLAYERS / {visibleTeams.length} TEAMS</span></div>
      {error&&<div className="hub-error" role="alert"><span>{error}</span><button onClick={refresh} aria-label="Retry"><LoaderCircle size={16}/></button></div>}
      {busy?<div className="hub-empty">Connecting to the local mission database...</div>:data.players.length+visibleTeams.length===0?<div className="hub-empty"><Radio/><b>Your command roster is ready.</b><span>Create a player to save your first campaign here.</span></div>:<div className="hub-rosters">
        {data.players.map((player)=><article className="hub-profile" key={`p-${player.id}`}><div className="hub-avatar"><UserRound/></div><div className="hub-profile-copy"><small>INDIVIDUAL COMMANDER</small><b>{player.name}</b><span>Personal campaign  /  saved on this computer</span></div><button onClick={()=>onEnter({...player,kind:'player',label:player.name})}>CONTINUE <ArrowRight/></button></article>)}
        {visibleTeams.map((team)=><article className="hub-profile team-profile" key={`t-${team.id}`}><div className="hub-avatar"><Users/></div><div className="hub-profile-copy"><small>TEAM CAMPAIGN  /  {team.members.length}/4 PLAYERS</small><b>{team.name}</b><span>{team.members.length?team.members.map((member)=>member.name).join('  /  '):'Team created  /  add players whenever you are ready'}</span></div><button className="hub-roster-button" onClick={()=>{setRosterTeam(team);setRosterPlayerId('');setModal('roster')}}>ROSTER</button><button onClick={()=>onEnter({...team,kind:'team',label:team.name})}>CONTINUE <ArrowRight/></button></article>)}
      </div>}
      <div className="hub-note">Campaign progress stays on this device. Team members take turns in one shared mission session.</div>
    </section>
    <footer className="hub-footer">SETILLAR TITANS  /  EDUCATIONAL MISSION DESIGN GAME  /  SIMPLIFIED MODEL  /  NOT FOR FLIGHT DESIGN</footer>
    {modal&&<div className="hub-modal-scrim" onMouseDown={(event)=>event.target===event.currentTarget&&setModal('')}><section className="hub-modal" role="dialog" aria-modal="true" aria-labelledby="hub-modal-title"><button className="hub-close" onClick={()=>setModal('')} aria-label="Close"><X/></button>
      <div className="hub-eyebrow">{modal==='roster'?'TEAM SETUP':modal==='access'?'COMMANDER ACCESS':modal==='login'?'RETURNING COMMANDER':'NEW CAMPAIGN / COMMANDER SETUP'}</div>
      <h2 id="hub-modal-title">{modal==='access'?`Open ${pendingRoute?.label}`:modal==='roster'?'Manage team roster':modal==='team'?'Create your team':modal==='login'?'Sign in':'Create player account'}</h2>
      <p>{modal==='access'?'Choose a saved player or team to open this mission area.':modal==='roster'?'Add saved players to this team. A crew can include up to four players.':modal==='login'?'Use your unique commander name and password. Your account is shared by devices connected to this mission server.':modal==='player'?'Choose a unique commander name. Existing names cannot be registered again. Use at least 8 characters for your password.':'Choose a name to continue. Team members can be added later from the team roster.'}</p>
      {modal==='access'&&<div className="hub-access-list">{data.players.map((player)=><button key={`access-player-${player.id}`} onClick={()=>enterRoute({...player,kind:'player',label:player.name})}><UserRound/><span><b>{player.name}</b><small>Individual commander</small></span><ArrowRight/></button>)}{visibleTeams.map((team)=><button key={`access-team-${team.id}`} onClick={()=>enterRoute({...team,kind:'team',label:team.name})}><Users/><span><b>{team.name}</b><small>Team campaign  /  {team.members.length}/4 players</small></span><ArrowRight/></button>)}{!data.players.length&&!visibleTeams.length&&<div className="hub-empty"><b>No saved commanders yet</b><span>Create a player or team, then choose this area.</span></div>}</div>}
      {modal==='roster'&&<form onSubmit={addRosterPlayer}><div className="hub-member-fields"><div className="hub-member-head"><b>{rosterTeam?.name}</b><span>{rosterTeam?.members.length ?? 0}/4 PLAYERS</span></div>{rosterTeam?.members.map((member)=><div className="hub-roster-member" key={member.id}><UserRound size={15}/>{member.name}</div>)}{(rosterTeam?.members.length ?? 0)<4&&<label>Add a saved player<select required value={rosterPlayerId} onChange={(event)=>setRosterPlayerId(event.target.value)}><option value="">Choose a player...</option>{data.players.map((player)=><option key={player.id} value={player.id}>{player.name}</option>)}</select></label>}{!data.players.length&&(rosterTeam?.members.length ?? 0)<4&&<small className="hub-roster-hint">Create a player profile first, then return here to add them.</small>}</div>{(rosterTeam?.members.length ?? 0)<4&&data.players.length>0&&<button className="hub-primary hub-submit" type="submit"><Plus size={16}/> ADD PLAYER TO TEAM</button>}</form>}
      {error&&<div className="hub-modal-error" role="alert">{error}</div>}
      {(modal==='player'||modal==='login')&&<form onSubmit={modal==='login'?signIn:createPlayer}><label>Commander name<input autoFocus maxLength={40} autoComplete="username" required value={playerName} onChange={(event)=>setPlayerName(event.target.value)} placeholder="e.g. Commander Alex"/></label><label>Password<input type="password" autoComplete={modal==='login'?'current-password':'new-password'} required minLength={modal==='login'?1:8} maxLength={200} value={password} onChange={(event)=>setPassword(event.target.value)} placeholder={modal==='login'?'Enter your password':'At least 8 characters'}/></label><button className="hub-primary hub-submit" type="submit">{modal==='login'?'SIGN IN & CONTINUE':'CREATE ACCOUNT & BEGIN'} <ArrowRight/></button><button className="hub-account-switch" type="button" onClick={()=>{setError('');setPassword('');setModal(modal==='login'?'player':'login')}}>{modal==='login'?'New commander? Create an account':'Already have an account? Sign in'}</button></form>}
      {modal==='team'&&<form onSubmit={createTeam}><label>Team name<input autoFocus maxLength={40} required value={teamName} onChange={(event)=>setTeamName(event.target.value)} placeholder="e.g. Lunar Survey Crew"/></label><button className="hub-primary hub-submit" type="submit">CREATE TEAM & BEGIN <ArrowRight/></button></form>}
    </section></div>}
  </main>
}
