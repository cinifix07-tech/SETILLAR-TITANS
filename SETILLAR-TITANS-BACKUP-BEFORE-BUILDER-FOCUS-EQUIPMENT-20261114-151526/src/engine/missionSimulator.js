import simulationRules from '../data/simulationRules.json' with { type: 'json' }
import { getOrbit } from './resourceCalculator.js'
import { validateMission } from './validationEngine.js'
import { calculateMissionScore, meetsFullSuccessScore } from './scoringEngine.js'

export function simulateMission(config, calculation) {
  const validation = validateMission(config, calculation)
  const score = calculateMissionScore(config, calculation)
  const orbit = getOrbit(config.orbit)
  const criticalFailure = validation.issues.length > 0
  const dataMarginIsEnough = calculation.margins.data >= simulationRules.minimumDataMarginForFullSuccess
  const orbitSupportsFullScore = orbit.suitability >= 15
  const outcome = criticalFailure
    ? 'MISSION FAILURE'
    : meetsFullSuccessScore(score.total) && dataMarginIsEnough && orbitSupportsFullScore
      ? 'SUCCESS'
      : 'PARTIAL SUCCESS'

  return {
    outcome,
    quality: score.total,
    score,
    issues: validation.issues.map((issue) => issue.code),
    issueDetails: validation.issues,
    config: { ...config, instruments: [...config.instruments] },
    calc: calculation,
  }
}
