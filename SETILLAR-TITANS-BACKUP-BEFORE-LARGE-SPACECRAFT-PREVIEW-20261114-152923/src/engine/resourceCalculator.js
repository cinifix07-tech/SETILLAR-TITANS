import spacecraft from '../data/components.json' with { type: 'json' }
import instruments from '../data/instruments.json' with { type: 'json' }
import launchVehicles from '../data/launchVehicles.json' with { type: 'json' }
import orbitProfiles from '../data/orbits.json' with { type: 'json' }
import resourceLimits from '../data/resourceLimits.json' with { type: 'json' }

export const getOrbit = (id) => orbitProfiles[id] ?? orbitProfiles.sso
export const orbitOrder = Object.keys(orbitProfiles)
export const getSpacecraft = (id) => spacecraft.find((item) => item.id === id)
export const getLaunchVehicle = (id) => launchVehicles.find((item) => item.id === id)
export const getInstrument = (id) => instruments.find((item) => item.id === id)
export const destinationPayloadLimit = (capacity, orbitId) => Math.round(capacity * getOrbit(orbitId).launchFactor)

export function orbitPosition(phase, profile, width = 920, height = 520) {
  const angle = phase * Math.PI * 2
  const rotation = profile.rotation * Math.PI / 180
  const x = profile.radiusX * Math.cos(angle)
  const y = profile.radiusY * Math.sin(angle)
  return {
    x: width / 2 + x * Math.cos(rotation) - y * Math.sin(rotation),
    y: height / 2 + x * Math.sin(rotation) + y * Math.cos(rotation),
    angle: Math.atan2(y, x) * 180 / Math.PI + profile.rotation + 90,
  }
}

export function calculateMissionResources(config) {
  const vehicle = getLaunchVehicle(config.rocket)
  const bus = getSpacecraft(config.craft)
  const selected = instruments.filter((item) => config.instruments.includes(item.id))
  const orbit = getOrbit(config.orbit)
  const mass = bus.mass + selected.reduce((sum, item) => sum + item.mass, 0)
  const power = resourceLimits.baselinePowerDemand + selected.reduce((sum, item) => sum + item.power, 0)
  const budget = bus.cost + vehicle.cost + selected.reduce((sum, item) => sum + item.cost, 0) + resourceLimits.baselineMissionCost
  const data = resourceLimits.baselineDataDemand + selected.reduce((sum, item) => sum + item.value, 0)
  const limits = { mass: destinationPayloadLimit(vehicle.mass, config.orbit), power: bus.power, budget: resourceLimits.budget, data: vehicle.comm }
  const margins = { mass: limits.mass - mass, power: limits.power - power, budget: limits.budget - budget, data: limits.data - data }
  return { vehicle, bus, selected, orbit, mass, power, budget, data, limits, margins }
}
