const destinationMissions = {
  moon: [
    {
      id: 'polar-ice-exploration',
      title: 'Polar Ice Exploration',
      builderObjective: 'Polar ice survey',
      summary: 'Investigate shadowed polar terrain for clues about lunar water ice.',
      scienceObjective: 'Study permanently shadowed lunar polar regions and look for signs of water ice.',
      whyItMatters: 'Learning where lunar water may be present helps scientists understand the Moon and plan future exploration.',
      environmentTitle: 'A cold, shadowed landscape',
      environment: ['Some polar areas receive little or no direct sunlight.', 'Sharp temperature differences challenge instruments.', 'Rough terrain and low light make observations difficult.'],
      takeaway: 'Water ice may exist in permanently shadowed regions near the lunar poles.',
      planningPrompt: 'What should this mission prioritize?',
      choices: [
        { id: 'ice-survey', title: 'Polar ice survey', description: 'Focus observations on shadowed polar regions.', feedback: 'You prioritized looking for potential water resources. That focus is valuable, while low light and difficult terrain remain planning challenges.' },
        { id: 'mineral-map', title: 'Surface mineral mapping', description: 'Study lunar materials across a broader area.', feedback: 'You chose broader geological context. This can help compare surface materials, while it does not directly prioritize ice-resource investigation.' },
      ],
    },
    {
      id: 'lunar-mineral-survey',
      title: 'Surface Mineral Survey',
      builderObjective: 'Surface mineral map',
      summary: 'Compare lunar surface materials to study the Moon’s geology.',
      scienceObjective: 'Observe lunar surface materials and investigate differences in mineral composition.',
      whyItMatters: 'Surface composition gives scientists clues about how the Moon formed and changed over time.',
      environmentTitle: 'Dusty, uneven terrain',
      environment: ['Loose regolith and rough terrain complicate surface access.', 'Fine dust can affect exposed instruments.', 'Observations must account for changing illumination.'],
      takeaway: 'The minerals and rocks at the surface preserve clues about the Moon’s history.',
      planningPrompt: 'How should the survey balance coverage and detail?',
      choices: [
        { id: 'broad-map', title: 'Broad surface mapping', description: 'Compare materials across a wider region.', feedback: 'You selected wider coverage. This helps compare regions, though each location receives less detailed attention.' },
        { id: 'detailed-geology', title: 'Detailed geology study', description: 'Examine a smaller area more closely.', feedback: 'You chose closer study. This supports detailed local comparisons, while fewer locations can be covered.' },
      ],
    },
    {
      id: 'lunar-dust-observation',
      title: 'Lunar Dust Observation',
      builderObjective: 'Lunar dust study',
      summary: 'Investigate how fine lunar dust is distributed across the surface.',
      scienceObjective: 'Observe the distribution and characteristics of fine lunar surface dust.',
      whyItMatters: 'Understanding dust helps scientists interpret the lunar environment and consider how it interacts with equipment.',
      environmentTitle: 'Fine surface dust',
      environment: ['The Moon has no thick atmosphere to move dust like Earth’s weather.', 'Dust properties can vary between surface locations.', 'Observation conditions change with the Sun’s angle.'],
      takeaway: 'Lunar dust is a distinctive surface material that future exploration must understand.',
      planningPrompt: 'Which observation strategy should lead?',
      choices: [
        { id: 'dust-distribution', title: 'Monitor dust distribution', description: 'Compare where dust appears across the surface.', feedback: 'You prioritized location patterns. This helps compare surface areas, while giving less attention to the properties of individual dust samples.' },
        { id: 'dust-characteristics', title: 'Study dust characteristics', description: 'Focus on the physical properties of dust.', feedback: 'You prioritized material properties. This offers deeper context about the dust itself, while covering fewer locations.' },
      ],
    },
  ],
  mars: [
    {
      id: 'martian-seasonal-ice',
      title: 'Martian Seasonal Ice Monitoring',
      builderObjective: 'Seasonal ice monitoring',
      summary: 'Track seasonal surface changes connected with ice and temperature.',
      scienceObjective: 'Observe seasonal changes in surface ice and environmental conditions on Mars.',
      whyItMatters: 'Seasonal observations help scientists study Martian climate and the history of water on the planet.',
      environmentTitle: 'A changing seasonal environment',
      environment: ['Temperatures vary through seasons and across locations.', 'Dust can obscure surface features.', 'The thin atmosphere still influences weather and surface conditions.'],
      takeaway: 'Some visible polar frost is seasonal carbon dioxide ice; water ice also occurs on Mars. Repeated observations help scientists compare these changes.',
      planningPrompt: 'Which seasonal signal should be the main focus?',
      choices: [
        { id: 'seasonal-ice', title: 'Seasonal ice observation', description: 'Look for changes associated with surface ice.', feedback: 'You focused on ice-related change. This connects observations to Martian water and climate, while temperature trends provide useful context.' },
        { id: 'surface-temperature', title: 'Surface temperature monitoring', description: 'Compare temperature patterns over time.', feedback: 'You focused on temperature patterns. This gives environmental context across seasons, while ice-related observations receive less attention.' },
      ],
    },
    {
      id: 'mars-dust-weather',
      title: 'Mars Dust and Weather Mapping',
      builderObjective: 'Dust and weather mapping',
      summary: 'Study atmospheric conditions and dust patterns on Mars.',
      scienceObjective: 'Investigate dust distribution and changing atmospheric weather patterns.',
      whyItMatters: 'Dust and weather observations help explain the Martian environment and the conditions that surface missions encounter.',
      environmentTitle: 'Thin air, mobile dust',
      environment: ['Dust can reduce visibility of surface features.', 'Atmospheric conditions change over time.', 'Long distances can make communication planning important.'],
      takeaway: 'Mars has a thin atmosphere, but its weather and dust still shape observations.',
      planningPrompt: 'What should the observing plan emphasize?',
      choices: [
        { id: 'weather-observation', title: 'Prioritize weather observation', description: 'Track atmospheric conditions over time.', feedback: 'You chose atmospheric context. It helps explain changing conditions, while mapping where dust accumulates is less central.' },
        { id: 'dust-mapping', title: 'Prioritize dust mapping', description: 'Compare dust patterns across the surface.', feedback: 'You chose dust distribution. It helps describe where dust is present, while broader atmospheric changes receive less focus.' },
      ],
    },
    {
      id: 'martian-surface-geology',
      title: 'Martian Surface Geology',
      builderObjective: 'Surface mineral survey',
      summary: 'Examine surface formations and compare the materials they contain.',
      scienceObjective: 'Investigate Martian surface formations and the materials that make them up.',
      whyItMatters: 'Geological patterns help scientists reconstruct how the Martian surface formed and evolved.',
      environmentTitle: 'Rocky terrain and dust',
      environment: ['Rocky terrain varies between locations.', 'Dust may hide or soften the appearance of surface features.', 'A landing or observation site must be considered carefully.'],
      takeaway: 'Landforms and surface composition together help tell the geological story of Mars.',
      planningPrompt: 'Which geological view should come first?',
      choices: [
        { id: 'formation-mapping', title: 'Map geological formations', description: 'Compare the shapes and arrangement of landforms.', feedback: 'You prioritized landscape patterns. This helps compare how features are arranged, while material composition is less directly examined.' },
        { id: 'composition-study', title: 'Study surface composition', description: 'Compare what surface materials are made of.', feedback: 'You prioritized composition. This helps characterize surface materials, while the larger arrangement of geological formations is less central.' },
      ],
    },
  ],
  europa: [
    {
      id: 'europa-ocean-clues',
      title: 'Subsurface Ocean Clues',
      builderObjective: 'Ice surface survey',
      summary: 'Study Europa’s ice and geology for clues about its subsurface ocean.',
      scienceObjective: 'Investigate Europa’s icy surface and geological features that may provide clues about a subsurface ocean.',
      whyItMatters: 'Europa is a key place to study when exploring how ocean worlds form and whether they may have conditions of interest to astrobiology.',
      environmentTitle: 'Cold ice near Jupiter',
      environment: ['Europa’s surface is extremely cold.', 'Jupiter’s radiation environment is a major mission-planning concern.', 'Icy terrain and distant operations make observations challenging.'],
      takeaway: 'Scientists infer a global ocean beneath Europa’s ice, but its properties are still being studied.',
      planningPrompt: 'Which surface clue should be prioritized?',
      choices: [
        { id: 'ice-investigation', title: 'Investigate surface ice', description: 'Study the texture and patterns of icy terrain.', feedback: 'You prioritized the ice itself. It can reveal surface processes, while geological structures provide another route to ocean-related clues.' },
        { id: 'geology-mapping', title: 'Map geological features', description: 'Compare cracks, ridges, and other surface structures.', feedback: 'You prioritized surface structures. These features can help scientists study Europa’s geology, while direct ice characterization receives less focus.' },
      ],
    },
    {
      id: 'europa-radiation-study',
      title: 'Radiation Environment Study',
      builderObjective: 'Radiation environment study',
      summary: 'Explore how the radiation environment shapes spacecraft operations near Europa.',
      scienceObjective: 'Study the radiation environment surrounding Europa and its relevance to mission planning.',
      whyItMatters: 'Radiation is an important factor for designing observations and considering spacecraft protection near Jupiter.',
      environmentTitle: 'A demanding radiation environment',
      environment: ['Europa orbits within Jupiter’s radiation environment.', 'The surface is extremely cold.', 'Science observations and protective design must both be considered.'],
      takeaway: 'Radiation affects spacecraft planning, but this game does not calculate real radiation dose or shielding performance.',
      planningPrompt: 'What should your planning discussion prioritize?',
      choices: [
        { id: 'protection-priority', title: 'Prioritize radiation protection', description: 'Consider how protective design affects mission planning.', feedback: 'You emphasized protection as a design consideration. This is a planning focus only; it does not change the game’s modeled spacecraft performance.' },
        { id: 'science-observation', title: 'Prioritize science observation', description: 'Focus on how to collect useful observations.', feedback: 'You emphasized observation goals. This clarifies the science plan, while protective design remains a separate consideration. The game does not model a numerical radiation penalty for this choice.' },
      ],
    },
    {
      id: 'europa-surface-composition',
      title: 'Surface Composition Mapping',
      builderObjective: 'Thermal feature mapping',
      summary: 'Compare icy surface features and their composition across Europa.',
      scienceObjective: 'Study the composition and characteristics of Europa’s icy surface.',
      whyItMatters: 'Surface observations help scientists interpret Europa’s geology and identify places for closer study.',
      environmentTitle: 'Ice, cold, and limited viewing',
      environment: ['Europa’s surface is very cold and icy.', 'Radiation near Jupiter influences mission operations.', 'Observation opportunities and lighting may be limited.'],
      takeaway: 'Surface composition and patterns are clues to geological processes, not direct proof of habitability.',
      planningPrompt: 'What should your mapping emphasize?',
      choices: [
        { id: 'ice-composition', title: 'Analyze ice composition', description: 'Focus on differences in surface ice materials.', feedback: 'You focused on surface material. This helps compare the ice itself, while the shape and distribution of features receive less focus.' },
        { id: 'surface-features', title: 'Map surface features', description: 'Compare the location and arrangement of visible features.', feedback: 'You focused on surface patterns. This can highlight geological context, while direct comparison of ice composition receives less attention.' },
      ],
    },
  ],
}

export const destinationMissionReferences = {
  moon: { label: 'NASA: The Lunar South Pole Region', url: 'https://www.nasa.gov/reference/moonbase-environment/' },
  mars: { label: 'NASA: Mars Reconnaissance Orbiter Science Highlights', url: 'https://science.nasa.gov/mission/mars-reconnaissance-orbiter/science-highlights/' },
  europa: { label: 'NASA: Europa Clipper Mission FAQ', url: 'https://science.nasa.gov/mission/europa-clipper/mission-faq/' },
}

export function getMissionsForDestination(destinationId) {
  return destinationMissions[destinationId] ?? []
}

export function getDestinationMission(destinationId, missionId) {
  return getMissionsForDestination(destinationId).find((mission) => mission.id === missionId) ?? null
}

export function getMissionForObjective(destinationId, objective) {
  return getMissionsForDestination(destinationId).find((mission) => mission.builderObjective === objective) ?? null
}

export function getMissionReference(destinationId) {
  return destinationMissionReferences[destinationId] ?? null
}

export default destinationMissions
