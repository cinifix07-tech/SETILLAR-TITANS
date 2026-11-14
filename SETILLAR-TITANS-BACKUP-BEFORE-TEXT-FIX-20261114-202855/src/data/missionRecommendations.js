import { calculateGameResources } from '../engine/gameEngine.js'

// These are catalog selections, not invented resource totals. The game engine
// calculates the resulting mass, power, budget, fuel need, and margins.
const recommendations = {
  'polar-ice-exploration': { craft: 'pioneer', propulsion: 'chemical', powerSource: 'solar', communications: 'highgain', shielding: 'basic', rocket: 'titan', orbit: 'sso', fuel: 40, instruments: ['camera', 'thermal'] },
  'lunar-mineral-survey': { craft: 'pioneer', propulsion: 'chemical', powerSource: 'solar', communications: 'highgain', shielding: 'basic', rocket: 'titan', orbit: 'sso', fuel: 40, instruments: ['camera', 'thermal'] },
  'lunar-dust-observation': { craft: 'pioneer', propulsion: 'chemical', powerSource: 'solar', communications: 'highgain', shielding: 'basic', rocket: 'titan', orbit: 'sso', fuel: 40, instruments: ['radar'] },
  'martian-seasonal-ice': { craft: 'pathfinder', propulsion: 'chemical', powerSource: 'solar', communications: 'deep', shielding: 'basic', rocket: 'titan', orbit: 'sso', fuel: 75, instruments: ['camera', 'thermal'] },
  'mars-dust-weather': { craft: 'horizon', propulsion: 'ion', powerSource: 'solar', communications: 'highgain', shielding: 'reinforced', rocket: 'titan', orbit: 'sso', fuel: 75, instruments: ['camera', 'radar'] },
  'martian-surface-geology': { craft: 'pathfinder', propulsion: 'chemical', powerSource: 'solar', communications: 'deep', shielding: 'basic', rocket: 'titan', orbit: 'sso', fuel: 75, instruments: ['camera', 'thermal'] },
  'europa-ocean-clues': { craft: 'horizon', propulsion: 'ion', powerSource: 'solar', communications: 'highgain', shielding: 'reinforced', rocket: 'titan', orbit: 'sso', fuel: 75, instruments: ['camera', 'thermal', 'radar'] },
  'europa-radiation-study': { craft: 'horizon', propulsion: 'ion', powerSource: 'solar', communications: 'highgain', shielding: 'reinforced', rocket: 'titan', orbit: 'sso', fuel: 75, instruments: ['camera', 'thermal', 'radar'] },
  'europa-surface-composition': { craft: 'horizon', propulsion: 'ion', powerSource: 'solar', communications: 'highgain', shielding: 'reinforced', rocket: 'titan', orbit: 'sso', fuel: 75, instruments: ['camera', 'thermal', 'radar'] },
}

export function getMissionRecommendation(mission) {
  return mission ? recommendations[mission.id] ?? null : null
}

export function buildRecommendedMissionConfig(currentConfig, mission, planningChoice) {
  const recommended = getMissionRecommendation(mission)
  if (!mission || !recommended) return null
  return {
    ...currentConfig,
    ...recommended,
    destination: mission.destination,
    objective: mission.builderObjective,
    missionId: mission.id,
    planningChoice,
  }
}

export function calculateMissionRecommendation(config, mission) {
  const recommendedConfig = buildRecommendedMissionConfig(config, mission, config.planningChoice)
  return recommendedConfig ? { config: recommendedConfig, resources: calculateGameResources(recommendedConfig) } : null
}
