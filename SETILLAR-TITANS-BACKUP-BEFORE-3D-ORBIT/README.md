# SETILLAR TITANS v5

Beginner-friendly space mission design game built with React and Vite. Choose a Moon, Mars, or Europa mission, configure a spacecraft, watch live resource calculations, run an accelerated deterministic simulation, and review the mission debrief.

## Project files

```text
NASA APP/
├── src/
│   ├── data/
│   │   ├── missions.json             # Existing Earth-observation mission setup
│   │   ├── destinations.json         # Moon, Mars, and Europa mission briefs
│   │   ├── missionParts.json         # Propulsion, power, communications, shielding, limits
│   │   ├── components.json           # Spacecraft buses
│   │   ├── instruments.json          # Science instruments and modeled resource costs
│   │   ├── launchVehicles.json       # Launch capacity and game costs
│   │   ├── orbits.json               # LEO, SSO, MEO, and GEO learning profiles
│   │   ├── resourceLimits.json       # Existing Earth-mission resource rules
│   │   ├── simulationRules.json      # Existing Earth-mission simulation settings
│   │   └── scoringCriteria.json      # Existing Earth-mission scoring settings
│   ├── engine/
│   │   ├── gameEngine.js             # Destination mission calculations, validation, outcomes
│   │   ├── resourceCalculator.js     # Earth-orbit profile and existing resource formulas
│   │   ├── validationEngine.js       # Existing Earth-mission validation
│   │   ├── missionSimulator.js       # Existing deterministic Earth-mission outcome
│   │   └── scoringEngine.js          # Existing Earth-mission score rules
│   ├── components/
│   │   ├── MissionGame.jsx           # Command center, mission builder, simulation, debrief
│   │   ├── OrbitSimulator.jsx        # Interactive orbit learning scene
│   │   ├── MissionDashboard.jsx      # Existing Earth-observation dashboard
│   │   ├── MissionBuilder.jsx        # Existing Earth-observation builder
│   │   ├── ResourcePanel.jsx         # Existing resource indicators
│   │   ├── MissionSimulation.jsx     # Existing Earth-observation simulation view
│   │   ├── MissionDebrief.jsx        # Existing Earth-observation debrief
│   │   ├── GameExplorer.jsx          # Existing orbit explorer wrapper
│   │   └── EducationalGuide.jsx      # Existing learning guide
│   ├── styles/
│   │   ├── Game.css                  # New responsive game interface
│   │   ├── App.css                   # Existing application styles
│   │   ├── Dashboard.css             # Existing dashboard and legacy screen styles
│   │   ├── OrbitSimulator.css        # Orbit scene styles
│   │   └── index.css                 # Global theme and typography
│   ├── App.jsx                       # Shared configuration, save state, navigation
│   └── main.jsx                      # React application entry point
├── backups/                          # Pre-change project copies
├── package.json                      # Dependencies and npm commands
└── README.md                         # This guide
```

## Start the game

```sh
npm install
npm run dev
```

Run `npm run build` to create the production site in `dist/`, and `npm run lint` to check the source.

## Color system

The interface uses a restrained 70/20/10 palette: deep-space navy `#07111F` for the background, orbit blue `#16283D` for cards and surfaces, and signal cyan `#35D5FF` for active controls and emphasis. Neutral light and muted text colors preserve contrast; status warnings use labels and icons as well as color.

## Main game loop

1. **Explore Missions** and pick the Moon, Mars, or Europa.
2. **Mission Builder** lets you name the mission and choose a spacecraft, propulsion, power source, communications system, shielding, launch vehicle, fuel allocation, and instruments.
3. The resource panel recalculates mass, power, budget, fuel, and communications limits from those choices. Invalid configurations show the specific constraints to fix.
4. **Launch Simulation** advances through launch, transit, arrival, science, and completion. At the radiation event, the simulation pauses for a choice with different science and health effects.
5. **Debrief** shows the deterministic outcome, score reasons, resource review, flight timeline, and follow-up actions.

Drafts, mission history, discoveries, settings, and a paused simulation snapshot are saved in this browser. **Run Again** retains the current design; **New Mission** starts a fresh design; **Reset Progress** clears local saved game data after confirmation.

## Orbit Lab

The Orbit Lab includes LEO, SSO, MEO, and GEO with working play/pause, restart, speed, and zoom controls. **Use This Orbit** stores the selection in the shared mission configuration. The selected Earth staging profile contributes a simplified launch-capacity factor and orbit-fit points in game calculations. The destination mission route itself is not propagated as an orbit.

The display is an illustrative 2D representation. Orbit geometry and animation speed are not to scale and are not spacecraft telemetry. Approximate orbit periods and altitudes are educational reference values, not predictions. For background, see [NASA's catalog of Earth satellite orbits](https://science.nasa.gov/earth/earth-observatory/catalog-of-earth-satellite-orbits/) and [ESA's overview of orbit types](https://www.esa.int/Enabling_Support/Space_Transportation/Types_of_orbits).

## Educational assumptions

The destination missions use fixed, deterministic game rules. They are not professional aerospace engineering tools and do not model full orbital mechanics, power behavior, radiation effects, uncertainty, or real spacecraft performance. All masses, budgets, capacities, science points, fuel, periods, and outcomes are simplified educational values.

## Technology

React 19, Vite, JavaScript, CSS, and local browser storage. The app does not require an account or game server.
