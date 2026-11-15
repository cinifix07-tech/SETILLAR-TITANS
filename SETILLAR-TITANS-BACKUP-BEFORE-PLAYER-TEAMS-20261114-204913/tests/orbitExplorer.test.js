import test from 'node:test'
import assert from 'node:assert/strict'
import { getIllustrativeOrbitPeriod, getIllustrativeSceneRadius, orbitExplorerProfiles } from '../src/data/orbitExplorer.js'
import { calculateGameResources, simulateGameMission, validateGameMission } from '../src/engine/gameEngine.js'

test('all four educational orbit profiles have increasing illustrative altitude and scene radius', () => {
  const profiles = Object.values(orbitExplorerProfiles)
  assert.deepEqual(profiles.map((profile) => profile.id), ['leo', 'sso', 'meo', 'geo'])
  for (let index = 1; index < profiles.length; index += 1) {
    assert.ok(profiles[index].altitudeKm > profiles[index - 1].altitudeKm)
    assert.ok(getIllustrativeSceneRadius(profiles[index]) > getIllustrativeSceneRadius(profiles[index - 1]))
  }
})

test('circular-orbit period estimates use the altitude and Earth parameters', () => {
  assert.match(getIllustrativeOrbitPeriod(orbitExplorerProfiles.leo), /^1\.5 hours$/)
  assert.match(getIllustrativeOrbitPeriod(orbitExplorerProfiles.sso), /^1\.6 hours$/)
  assert.match(getIllustrativeOrbitPeriod(orbitExplorerProfiles.meo), /^5\.8 hours$/)
  assert.match(getIllustrativeOrbitPeriod(orbitExplorerProfiles.geo), /^23\.9 hours$/)
})

test('staging orbit selection changes shared mission launch capacity', () => {
  const config = { destination: 'moon', craft: 'pioneer', rocket: 'titan', propulsion: 'chemical', powerSource: 'solar', communications: 'deep', shielding: 'basic', fuel: 40, instruments: ['camera', 'thermal'], orbit: 'leo' }
  const lowOrbitCapacity = calculateGameResources(config).limits.mass
  const geoCapacity = calculateGameResources({ ...config, orbit: 'geo' }).limits.mass
  assert.ok(lowOrbitCapacity > geoCapacity)
  assert.equal(simulateGameMission(config, calculateGameResources(config), { eventChoice: 'safe' }).config.orbit, 'leo')
})

test('a starter mission validates and repeats deterministically', () => {
  const config = { destination: 'moon', craft: 'pioneer', rocket: 'titan', propulsion: 'chemical', powerSource: 'solar', communications: 'deep', shielding: 'basic', fuel: 40, instruments: ['camera', 'thermal'], orbit: 'sso' }
  const resources = calculateGameResources(config)
  assert.equal(validateGameMission(config, resources).valid, true)
  const first = simulateGameMission(config, resources, { eventChoice: 'safe' })
  const second = simulateGameMission(config, resources, { eventChoice: 'safe' })
  assert.deepEqual([first.outcome, first.score, first.scienceReturned], [second.outcome, second.score, second.scienceReturned])
})

test('Europa event choices have consequential, deterministic outcomes', () => {
  const config = { destination: 'europa', craft: 'horizon', rocket: 'titan', propulsion: 'ion', powerSource: 'solar', communications: 'highgain', shielding: 'reinforced', fuel: 120, instruments: ['camera', 'thermal', 'radar'], orbit: 'sso' }
  const resources = calculateGameResources(config)
  assert.equal(validateGameMission(config, resources).valid, true)
  const safeMode = simulateGameMission(config, resources, { eventChoice: 'safe' })
  const continueScience = simulateGameMission(config, resources, { eventChoice: 'continue' })
  assert.equal(safeMode.outcome, 'SUCCESS')
  assert.equal(continueScience.outcome, 'PARTIAL SUCCESS')
  assert.ok(safeMode.scienceReturned > continueScience.scienceReturned)
  assert.notEqual(safeMode.score, continueScience.score)
})
