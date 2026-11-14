import { getDestination } from '../engine/gameEngine.js'
import { getDestinationMission } from './destinationMissions.js'

const missionScenarios = {
  'polar-ice-exploration': {
    title: 'Shadowed observation window',
    category: 'LOW-LIGHT SURVEY',
    description: 'A brief low-light window opens over the lunar polar terrain. Decide whether to pause observations and protect the schedule or continue collecting modeled data.',
    task: 'Collect polar ice observations',
    transit: 'The spacecraft is approaching a permanently shadowed polar region. Low light and sharp temperature changes make observation planning important.',
    science: 'Compare the selected instrument readings for signs that may help scientists investigate lunar polar ice.',
  },
  'lunar-mineral-survey': {
    title: 'Surface contrast check',
    category: 'GEOLOGY MAPPING',
    description: 'The planned lunar survey crosses areas with different illumination. Decide whether to pause for a cleaner comparison or continue the broader mapping pass.',
    task: 'Compare lunar surface materials',
    transit: 'The spacecraft is approaching the lunar mapping region. Changing illumination can affect how surface materials appear in observations.',
    science: 'Compare the selected instrument readings across the survey area to study differences in lunar surface materials.',
  },
  'lunar-dust-observation': {
    title: 'Dust pattern checkpoint',
    category: 'SURFACE DUST STUDY',
    description: 'The lunar dust survey reaches a new observation strip. Decide whether to pause for a careful pass or continue gathering broader coverage.',
    task: 'Map lunar dust distribution',
    transit: 'The spacecraft is approaching its dust observation strip. The Moon has no thick atmosphere to move dust like Earth weather, so local surface conditions matter.',
    science: 'Use the selected instruments to compare where fine lunar dust appears and how its distribution changes across the target.',
  },
  'martian-seasonal-ice': {
    title: 'Seasonal frost boundary',
    category: 'SEASONAL MONITORING',
    description: 'A seasonal boundary is crossing the planned observation area. Decide whether to pause for a clearer comparison or continue collecting the current pass.',
    task: 'Record seasonal ice and temperature data',
    transit: 'The spacecraft is approaching a Martian seasonal observation region. Frost, temperature, and dust conditions can change over time.',
    science: 'Compare the selected measurements to track seasonal surface changes. Some polar frost is carbon dioxide ice; water ice is also present on Mars.',
  },
  'mars-dust-weather': {
    title: 'Dust and weather front',
    category: 'ATMOSPHERE WATCH',
    description: 'Modeled dust activity may reduce the clarity of this weather observation. Decide whether to pause for a clearer window or continue collecting atmospheric data.',
    task: 'Map Martian dust and weather',
    transit: 'The spacecraft is approaching a Martian weather observation area. Dust can obscure surface features and the thin atmosphere still influences local conditions.',
    science: 'Track atmospheric conditions and compare dust patterns using the selected instrument data.',
  },
  'martian-surface-geology': {
    title: 'Geology comparison pass',
    category: 'SURFACE GEOLOGY',
    description: 'The planned route reaches a second geological region. Decide whether to pause for a more consistent comparison or continue the wider survey.',
    task: 'Compare Martian formations and composition',
    transit: 'The spacecraft is approaching a Martian geology target. Comparing landforms and surface composition can reveal different parts of the planet’s history.',
    science: 'Compare selected observations of surface formations or materials, based on the science priority chosen in your briefing.',
  },
  'europa-ocean-clues': {
    title: 'Radiation and ice-fracture alert',
    category: 'EUROPA ENVIRONMENT',
    description: 'The spacecraft is operating near Jupiter’s radiation environment while approaching icy terrain. Decide whether to pause observations or continue the modeled science pass.',
    task: 'Survey Europa’s ice for ocean clues',
    transit: 'The spacecraft is approaching Europa. The moon’s icy surface and Jupiter’s radiation environment are important mission-planning considerations.',
    science: 'Study ice patterns and geological features that may provide clues about Europa’s subsurface ocean. These observations do not directly detect life.',
  },
  'europa-radiation-study': {
    title: 'Radiation environment checkpoint',
    category: 'RADIATION STUDY',
    description: 'A modeled radiation-condition checkpoint appears near Europa. Decide whether to pause science activity or continue the observation sequence.',
    task: 'Record Europa environment observations',
    transit: 'The spacecraft is approaching Europa within Jupiter’s radiation environment. This game represents the environment qualitatively and does not calculate radiation dose.',
    science: 'Review the selected measurements and explain why radiation conditions matter when planning spacecraft operations near Europa.',
  },
  'europa-surface-composition': {
    title: 'Icy surface mapping window',
    category: 'ICE COMPOSITION',
    description: 'A short mapping window opens over Europa’s icy terrain. Decide whether to pause for a more consistent pass or continue the composition survey.',
    task: 'Map Europa’s icy surface features',
    transit: 'The spacecraft is approaching an icy mapping target. Cold surface conditions and limited observation opportunities shape this educational scenario.',
    science: 'Compare ice composition and surface patterns. These clues help scientists study geology but are not direct proof of habitability.',
  },
}

export function getMissionSimulationBrief(config, calc, phase) {
  const destination = getDestination(config.destination)
  const mission = getDestinationMission(config.destination, config.missionId)
  const fallback = {
    title: `${destination.name} mission checkpoint`,
    category: 'MISSION CHECKPOINT',
    description: `A modeled environment checkpoint occurs during the mission to ${destination.name}. Choose whether to pause observations or continue science collection.`,
    task: `Complete the ${config.objective || 'science observation'} task`,
    transit: `The spacecraft is approaching ${destination.name}. ${destination.environment}.`,
    science: mission?.scienceObjective ?? `Use the selected instruments to complete the ${config.objective || 'science observation'} task.`,
  }
  const scenario = missionScenarios[mission?.id] ?? fallback
  const choice = mission?.choices.find((item) => item.id === config.planningChoice)
  const payload = calc.payload.map((item) => item.name).join(', ') || 'the selected science payload'
  const phaseMessages = {
    Launch: `Launch sequence: ${calc.rocket.name} carries the ${calc.bus.name} and ${payload}. Mission objective: ${mission?.scienceObjective ?? config.objective}.`,
    Transit: `${scenario.transit}${choice ? ` Your briefing priority is “${choice.title}.”` : ''}`,
    Arrival: `Arrival at ${destination.name}: the spacecraft checks its modeled route and prepares for the ${mission?.title ?? config.objective} observation campaign. ${mission?.environment[1] ?? destination.environment}.`,
    Science: `Mission objective: ${mission?.scienceObjective ?? config.objective}. ${scenario.science}${choice ? ` Your selected plan: ${choice.description}` : ''}`,
    Completion: `The deterministic game model has evaluated the ${scenario.task.toLowerCase()} task. ${mission?.takeaway ?? 'Compare the result with the mission resource checks to see how the design affected the outcome.'}`,
  }

  return {
    mission,
    destination,
    scenario,
    task: scenario.task,
    phaseMessage: phaseMessages[phase] ?? phaseMessages.Launch,
    objective: mission?.scienceObjective ?? config.objective,
    planningChoice: choice,
  }
}
