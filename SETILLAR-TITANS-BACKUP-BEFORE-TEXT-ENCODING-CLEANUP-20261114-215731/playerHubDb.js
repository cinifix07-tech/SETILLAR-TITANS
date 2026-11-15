import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

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
  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL UNIQUE REFERENCES players(id) ON DELETE CASCADE,
    username_normalized TEXT NOT NULL UNIQUE,
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS account_sessions (
    token_hash TEXT PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`)

const readBody = (req) => new Promise((resolveBody, reject) => {
  let body = ''
  req.on('data', (chunk) => { body += chunk; if (body.length > 16_384) reject(new Error('Request is too large.')) })
  req.on('end', () => { try { resolveBody(body ? JSON.parse(body) : {}) } catch { reject(new Error('Invalid request data.')) } })
  req.on('error', reject)
})
const cleanName = (value) => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, 40) : ''
const normalizeUser = (value) => cleanName(value).toLocaleLowerCase('en-US')
const tokenHash = (token) => createHash('sha256').update(token).digest('hex')
function issueSession(playerId) {
  const token = randomBytes(32).toString('base64url')
  const expiresAt = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
  db.prepare('INSERT INTO account_sessions(token_hash, player_id, expires_at) VALUES (?, ?, ?)').run(tokenHash(token), playerId, expiresAt)
  return token
}
function getSession(req) {
  const token = /^Bearer\s+(.+)$/i.exec(req.headers.authorization ?? '')?.[1]
  if (!token) return null
  db.prepare('DELETE FROM account_sessions WHERE expires_at <= ?').run(Math.floor(Date.now() / 1000))
  return db.prepare('SELECT players.id, players.name FROM account_sessions JOIN players ON players.id = account_sessions.player_id WHERE token_hash = ? AND expires_at > ?').get(tokenHash(token), Math.floor(Date.now() / 1000)) ?? null
}
function send(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(payload))
}
function getProfiles() {
  const players = db.prepare('SELECT id, name, created_at AS createdAt FROM players WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE team_members.player_id = players.id) AND NOT EXISTS (SELECT 1 FROM accounts WHERE accounts.player_id = players.id) ORDER BY id DESC').all()
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
    if (req.method === 'GET' && url.pathname === '/api/game/account') {
      const account = getSession(req)
      if (!account) return send(res, 401, { error: 'Sign in to continue with this account.' })
      return send(res, 200, { account })
    }
    if (req.method === 'POST' && url.pathname === '/api/game/accounts') {
      const body = await readBody(req)
      const name = cleanName(body.name)
      const username = normalizeUser(name)
      const password = typeof body.password === 'string' ? body.password : ''
      if (name.length < 2) return send(res, 400, { error: 'Commander name must have at least 2 characters.' })
      if (password.length < 8 || password.length > 200) return send(res, 400, { error: 'Use a password between 8 and 200 characters.' })
      if (db.prepare('SELECT id FROM accounts WHERE username_normalized = ?').get(username)) return send(res, 409, { error: 'That commander name already has an account. Sign in with it instead.' })
      const salt = randomBytes(16)
      const passwordHash = scryptSync(password, salt, 64)
      db.exec('BEGIN IMMEDIATE')
      try {
        const existingPlayer = db.prepare('SELECT id, name FROM players WHERE lower(trim(name)) = ? ORDER BY id LIMIT 1').get(username)
        const player = existingPlayer ?? { id: Number(db.prepare('INSERT INTO players(name) VALUES (?)').run(name).lastInsertRowid), name }
        db.prepare('INSERT INTO accounts(player_id, username_normalized, password_salt, password_hash) VALUES (?, ?, ?, ?)').run(player.id, username, salt.toString('hex'), passwordHash.toString('hex'))
        const token = issueSession(player.id)
        db.exec('COMMIT')
        return send(res, 201, { account: player, token })
      } catch (error) {
        db.exec('ROLLBACK')
        if (String(error.message).includes('UNIQUE constraint failed: accounts.username_normalized')) return send(res, 409, { error: 'That commander name already has an account. Sign in with it instead.' })
        throw error
      }
    }
    if (req.method === 'POST' && url.pathname === '/api/game/login') {
      const body = await readBody(req)
      const username = normalizeUser(body.name)
      const password = typeof body.password === 'string' ? body.password.slice(0, 200) : ''
      const record = db.prepare('SELECT accounts.player_id AS id, accounts.password_salt AS salt, accounts.password_hash AS passwordHash, players.name AS name FROM accounts JOIN players ON players.id = accounts.player_id WHERE accounts.username_normalized = ?').get(username)
      if (!record || !password) return send(res, 401, { error: 'Commander name or password is incorrect.' })
      const candidate = scryptSync(password, Buffer.from(record.salt, 'hex'), 64)
      if (!timingSafeEqual(candidate, Buffer.from(record.passwordHash, 'hex'))) return send(res, 401, { error: 'Commander name or password is incorrect.' })
      return send(res, 200, { account: { id: record.id, name: record.name }, token: issueSession(record.id) })
    }
    if (req.method === 'POST' && url.pathname === '/api/game/logout') {
      const token = /^Bearer\s+(.+)$/i.exec(req.headers.authorization ?? '')?.[1]
      if (token) db.prepare('DELETE FROM account_sessions WHERE token_hash = ?').run(tokenHash(token))
      return send(res, 200, { ok: true })
    }
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
