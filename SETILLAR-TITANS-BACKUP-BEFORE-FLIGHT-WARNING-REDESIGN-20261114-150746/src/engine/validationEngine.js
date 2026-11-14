const resourceLabels = { mass: 'Payload mass exceeds the selected launch capacity', power: 'Electrical power demand exceeds spacecraft generation', budget: 'Mission cost exceeds the game budget', data: 'Modeled data demand exceeds communication capacity' }

export function validateMission(config, calculation) {
  const issues = Object.entries(calculation.margins)
    .filter(([, margin]) => margin < 0)
    .map(([resource]) => ({ code: resource, message: resourceLabels[resource] }))

  if (!calculation.selected.length) issues.push({ code: 'instrument', message: 'Select at least one scientific instrument' })
  if (!config.objective) issues.push({ code: 'objective', message: 'Choose a mission objective' })
  if (!calculation.bus) issues.push({ code: 'spacecraft', message: 'Choose a spacecraft' })
  if (!calculation.vehicle) issues.push({ code: 'launch', message: 'Choose a launch vehicle' })
  if (!config.orbit) issues.push({ code: 'orbit', message: 'Choose an orbit' })

  return { valid: issues.length === 0, issues }
}
