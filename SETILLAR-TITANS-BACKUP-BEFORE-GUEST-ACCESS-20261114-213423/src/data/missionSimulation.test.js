import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateGameResources } from '../engine/gameEngine.js'
import { getMissionsForDestination } from './destinationMissions.js'
import { getMissionSimulationBrief } from './missionSimulation.js'

test('every destination mission has its own science task and event briefing', () => {
  const tasks = new Set()
  const eventTitles = new Set()

  for (const destination of ['moon', 'mars', 'europa']) {
    for (const mission of getMissionsForDestination(destination)) {
      const config = {
        destination,
        missionId: mission.id,
        objective: mission.builderObjective,
        planningChoice: mission.choices[0].id,
        craft: 'pathfinder',
        rocket: 'titan',
        propulsion: 'chemical',
        powerSource: 'solar',
        communications: 'highgain',
        shielding: destination === 'europa' ? 'reinforced' : 'basic',
        fuel: 140,
        instruments: ['camera'],
      }
      const brief = getMissionSimulationBrief(config, calculateGameResources(config), 'Science')
      assert.ok(brief.task)
      assert.ok(brief.phaseMessage.includes(mission.scienceObjective))
      assert.ok(brief.scenario.description)
      assert.equal(tasks.has(brief.task), false, `${mission.title} should have a distinct science task`)
      assert.equal(eventTitles.has(brief.scenario.title), false, `${mission.title} should have a distinct event`)
      tasks.add(brief.task)
      eventTitles.add(brief.scenario.title)
    }
  }

  assert.equal(tasks.size, 9)
  assert.equal(eventTitles.size, 9)
})
