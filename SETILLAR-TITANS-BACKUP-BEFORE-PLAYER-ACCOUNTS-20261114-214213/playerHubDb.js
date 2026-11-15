import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const databaseDirectory = resolve(process.cwd(), 'data')
mkdirSync(databaseDirectory, { recursive: true })
const db = new DatabaseSync(resolve(databaseDirectory, 'player-hub.sqlite'))
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 40),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 40),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS team_members (
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(team_id, player_id)
  );
`)

const readBody = (req) => new Promise((resolveBody, reject) => {
  let body = ''
  req.on('data', (chunk) => { body += chunk; if (body.length > 16_384) reject(new Error('Request is too large.')) })
  req.on('end', () => { try { resolveBody(body ? JSON.parse(body) : {}) } catch { reject(new Error('Invalid request data.')) } })
  req.on('error', reject)
})
const cleanName = (value) => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, 40) : ''
function send(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(payload))
}
function getProfiles() {
  const players = db.prepare('SELECT id, name, created_at AS createdAt FROM players WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE team_members.player_id = players.id) ORDER BY id DESC').all()
  const playerCount = db.prepare('SELECT COUNT(*) AS count FROM players').get().count
  const teams = db.prepare('SELECT id, name, created_at AS createdAt FROM teams ORDER BY id DESC').all().map((team) => ({
    ...team,
    members: db.prepare('SELECT players.id, players.name FROM players JOIN team_members ON team_members.player_id = players.id WHERE team_members.team_id = ? ORDER BY team_members.joined_at, players.id').all(team.id),
  }))
  return { players, teams, playerCount }
}
async function handle(req, res, next) {
  if (!req.url?.startsWith('/api/game/')) return next()
  try {
    const url = new URL(req.url, 'http://localhost')
    if (req.method === 'GET' && url.pathname === '/api/game/profiles') return send(res, 200, getProfiles())
    if (req.method === 'POST' && url.pathname === '/api/game/players') {
      const name = cleanName((await readBody(req)).name)
      if (!name) return send(res, 400, { error: 'Enter a commander name to continue.' })
      const result = db.prepare('INSERT INTO players(name) VALUES (?)').run(name)
      return send(res, 201, { player: { id: Number(result.lastInsertRowid), name } })
    }
    if (req.method === 'POST' && url.pathname === '/api/game/teams') {
      const body = await readBody(req)
      const name = cleanName(body.name)
      if (!name) return send(res, 400, { error: 'Enter a team name to continue.' })
      const result = db.prepare('INSERT INTO teams(name) VALUES (?)').run(name)
      return send(res, 201, { team: { id: Number(result.lastInsertRowid), name, members: [] } })
    }
    const teamMemberRoute = url.pathname.match(/^\/api\/game\/teams\/(\d+)\/members$/)
    if (req.method === 'POST' && teamMemberRoute) {
      const teamId = Number(teamMemberRoute[1])
      const body = await readBody(req)
      const team = db.prepare('SELECT id, name FROM teams WHERE id = ?').get(teamId)
      if (!team) return send(res, 404, { error: 'That team could not be found.' })
      const memberCount = db.prepare('SELECT COUNT(*) AS count FROM team_members WHERE team_id = ?').get(teamId).count
      if (memberCount >= 4) return send(res, 409, { error: 'This team already has four players.' })
      const playerId = Number(body.playerId)
      if (!Number.isSafeInteger(playerId) || playerId < 1) return send(res, 400, { error: 'Choose a saved player to add to this team.' })
      if (!db.prepare('SELECT id FROM players WHERE id = ?').get(playerId)) return send(res, 404, { error: 'That player could not be found.' })
      try { db.prepare('INSERT INTO team_members(team_id, player_id) VALUES (?, ?)').run(teamId, playerId) }
      catch { return send(res, 409, { error: 'That player is already on this team.' })
      }
      const members = db.prepare('SELECT players.id, players.name FROM players JOIN team_members ON team_members.player_id = players.id WHERE team_members.team_id = ? ORDER BY team_members.joined_at, players.id').all(teamId)
      return send(res, 200, { team: { ...team, members } })
    }
    return send(res, 404, { error: 'Unknown player hub endpoint.' })
  } catch (error) {
    console.error('[player hub database]', error)
    return send(res, 500, { error: error.message || 'The local mission database could not complete that request.' })
  }
}

export function playerHubDatabase() {
  return {
    name: 'setillar-player-hub-database',
    configureServer(server) { server.middlewares.use(handle) },
    configurePreviewServer(server) { server.middlewares.use(handle) },
  }
}
