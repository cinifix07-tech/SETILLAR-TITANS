import destinations from '../data/destinations.json' with { type: 'json' }
import parts from '../data/missionParts.json' with { type: 'json' }
import spacecraft from '../data/components.json' with { type: 'json' }
import instruments from '../data/instruments.json' with { type: 'json' }
import launchVehicles from '../data/launchVehicles.json' with { type: 'json' }
import { getOrbit } from './resourceCalculator.js'

export { destinations, parts, spacecraft, instruments, launchVehicles }
export const getDestination = (id) => destinations.find((item) => item.id === id) ?? destinations[0]
export function calculateGameResources(config) {
  const destination = getDestination(config.destination)
  const orbit = getOrbit(config.orbit)
  const bus = spacecraft.find((item) => item.id === config.craft) ?? spacecraft[1]
  const rocket = launchVehicles.find((item) => item.id === config.rocket) ?? launchVehicles[1]
  const propulsion = parts.propulsion.find((item) => item.id === config.propulsion) ?? parts.propulsion[0]
  const powerSource = parts.powerSource.find((item) => item.id === config.powerSource) ?? parts.powerSource[0]
  const communications = parts.communications.find((item) => item.id === config.communications) ?? parts.communications[0]
  const shielding = parts.shielding.find((item) => item.id === config.shielding) ?? parts.shielding[0]
  const payload = instruments.filter((item) => (config.instruments ?? []).includes(item.id))
  const mass = parts.missionLimits.baseMass + bus.mass + propulsion.mass + powerSource.mass + communications.mass + shielding.mass + payload.reduce((n, x) => n + x.mass, 0)
  const power = parts.missionLimits.basePower + propulsion.power + payload.reduce((n, x) => n + x.power, 0)
  const budget = bus.cost + rocket.cost + propulsion.cost + powerSource.cost + communications.cost + shielding.cost + payload.reduce((n, x) => n + x.cost, 0) + 12
  const fuelNeeded = Math.ceil(destination.travelFuel * propulsion.fuelRate)
  const limits = { mass: Math.round(rocket.mass * orbit.launchFactor), power: powerSource.supply + bus.power, budget: parts.missionLimits.budget, fuel: config.fuel ?? 0, communications: communications.capacity }
  const margins = { mass: limits.mass - mass, power: limits.power - power, budget: limits.budget - budget, fuel: limits.fuel - fuelNeeded, communications: limits.communications - (18 + payload.reduce((n, x) => n + x.value, 0)) }
  const sciencePotential = payload.reduce((n, x) => n + x.value, 0) + (config.objective ? 24 : 0)
  return { destination, orbit, bus, rocket, propulsion, powerSource, communications, shielding, payload, mass, power, budget, fuelNeeded, limits, margins, sciencePotential }
}
export function validateGameMission(config, calc) {
  const issues = Object.entries(calc.margins).filter(([, margin]) => margin < 0).map(([key]) => ({ code: key, message: `${key} requirement exceeds the selected capacity` }))
  if (!calc.payload.length) issues.push({ code: 'payload', message: 'Choose at least one science instrument.' })
  if (!config.orbit) issues.push({ code: 'orbit', message: 'Choose an Earth staging orbit profile.' })
  if (calc.propulsion.range < calc.destination.distance) issues.push({ code: 'propulsion', message: 'Selected propulsion is below the destination range in this game model.' })
  if (calc.communications.range < calc.destination.distance) issues.push({ code: 'communicationsRange', message: 'Choose a longer-range communications system.' })
  if (calc.destination.id === 'europa' && calc.shielding.protection < 0.5) issues.push({ code: 'shielding', message: 'Europa requires reinforced shielding in this educational scenario.' })
  return { valid: issues.length === 0, issues }
}
export function simulateGameMission(config, calc, choices = {}) {
  const validation = validateGameMission(config, calc)
  const choice = choices.eventChoice ?? 'safe'
  const choicePenalty = choice === 'continue' ? 25 : 2
  const scienceReturned = Math.max(0, calc.sciencePotential - choicePenalty)
  const score = Math.max(0, Math.min(100, Math.round(scienceReturned * 0.6 + Math.min(Math.max(calc.margins.power, 0) / 3, 12) + calc.shielding.protection * 10 + calc.orbit.suitability / 10 + 15)))
  const outcome = !validation.valid ? 'MISSION FAILURE' : scienceReturned >= calc.destination.scienceGoal ? 'SUCCESS' : 'PARTIAL SUCCESS'
  return { outcome, score, scienceReturned, config: structuredClone(config), resources: calc, issues: validation.issues, choice, event: { title: 'Radiation alert', description: 'A modeled radiation spike is detected during cruise. How should the crewless spacecraft respond?' }, eventEffect: `${choice === 'continue' ? 'Continuing keeps the timeline moving but causes a larger modeled loss of science reliability and spacecraft health.' : 'Safe mode protects spacecraft health with a small modeled loss of collection time and science.'} Modeled science returned: ${scienceReturned} points.` }
}
