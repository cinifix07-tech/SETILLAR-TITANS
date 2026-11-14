import scoringCriteria from '../data/scoringCriteria.json' with { type: 'json' }

export function calculateMissionScore(config, calculation) {
  const orbitPoints = Math.round(scoringCriteria.orbitSuitabilityPoints * calculation.orbit.suitability / 30)
  const instrumentPoints = calculation.selected.reduce((sum, item) => sum + item.value, 0)
  const powerPoints = Math.min(Math.max(calculation.margins.power, 0) / 2, scoringCriteria.powerMarginPointsCap)
  const durationPoints = config.duration >= 12 ? scoringCriteria.durationAtLeast12MonthsPoints : scoringCriteria.shorterDurationPoints
  const rawTotal = instrumentPoints + orbitPoints + powerPoints + durationPoints
  const total = Math.max(0, Math.min(scoringCriteria.maxScore, Math.round(rawTotal)))
  return { total, instrumentPoints, orbitPoints, powerPoints: Math.round(powerPoints), durationPoints }
}

export function meetsFullSuccessScore(score) {
  return score >= scoringCriteria.fullSuccessThreshold
}
