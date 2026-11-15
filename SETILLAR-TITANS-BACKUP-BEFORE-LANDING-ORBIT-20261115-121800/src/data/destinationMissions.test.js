import test from 'node:test'
import assert from 'node:assert/strict'
import { destinations } from '../engine/gameEngine.js'
import { destinationMissionReferences, getMissionForObjective, getMissionsForDestination } from './destinationMissions.js'

test('each supported destination has three complete, distinct briefing missions', () => {
  const ids = new Set()
  for (const destination of destinations) {
    const missions = getMissionsForDestination(destination.id)
    assert.equal(missions.length, 3, destination.name + ' should offer three missions')
    const referenceUrl = destinationMissionReferences[destination.id]?.url ?? ''
    assert.ok(referenceUrl.startsWith('https://www.nasa.gov') || referenceUrl.startsWith('https://science.nasa.gov'))
    const objectives = new Set()
    for (const mission of missions) {
      assert.ok(mission.id && mission.title && mission.summary && mission.scienceObjective && mission.whyItMatters && mission.environment.length)
      assert.equal(ids.has(mission.id), false, 'mission ids must be unique')
      assert.equal(objectives.has(mission.builderObjective), false, destination.name + ' objectives must map to one mission')
      assert.equal(getMissionForObjective(destination.id, mission.builderObjective)?.id, mission.id)
      assert.equal(mission.choices.length, 2, mission.title + ' should have two planning options')
      assert.notEqual(mission.choices[0].id, mission.choices[1].id)
      assert.notEqual(mission.choices[0].feedback, mission.choices[1].feedback)
      ids.add(mission.id)
      objectives.add(mission.builderObjective)
    }
  }
  assert.equal(ids.size, 9)
})
