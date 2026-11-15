import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateGameResources, validateGameMission } from '../engine/gameEngine.js'
import { getMissionsForDestination } from './destinationMissions.js'
import { buildRecommendedMissionConfig, getMissionRecommendation } from './missionRecommendations.js'

test('every destination mission has a valid calculated recommended spacecraft setup', () => {
  for (const destinationId of ['moon', 'mars', 'europa']) {
    for (const mission of getMissionsForDestination(destinationId)) {
      const recommendation = getMissionRecommendation(mission)
      assert.ok(recommendation, `${mission.title} has a recommendation`)
      const choice = mission.choices[0].id
      const selectedMission = { ...mission, destination: destinationId }
      const config = buildRecommendedMissionConfig({ name: 'Recommendation check' }, selectedMission, choice)
      const resources = calculateGameResources(config)
      const validation = validateGameMission(config, resources)
      assert.equal(validation.valid, true, `${mission.title}: ${validation.issues.map(issue => issue.message).join('; ')}`)
      assert.equal(config.destination, destinationId)
      assert.equal(config.objective, mission.builderObjective)
      assert.equal(config.missionId, mission.id)
      assert.ok(config.instruments.length > 0)
      assert.ok(resources.mass <= resources.limits.mass)
      assert.ok(resources.power <= resources.limits.power)
      assert.ok(resources.budget <= resources.limits.budget)
      assert.ok(resources.fuelNeeded <= config.fuel)
    }
  }
})
