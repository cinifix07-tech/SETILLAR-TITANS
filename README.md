# SETILLAR TITANS v5

Beginner-friendly space mission design game built with React and Vite. Explore Moon, Mars, or Europa missions, configure spacecraft, compare live resource limits, run an accelerated deterministic simulation, and review the debrief.

## Project files

```text
NASA APP/
|-- src/
|   |-- data/
|   |   |-- missions.json             Existing Earth-observation mission setup
|   |   |-- destinations.json         Moon, Mars, and Europa mission briefs
|   |   |-- missionParts.json         Propulsion, power, communications, shielding, limits
|   |   |-- components.json           Spacecraft buses
|   |   |-- instruments.json          Science instruments and modeled resource costs
|   |   |-- launchVehicles.json       Launch capacity and game costs
|   |   |-- orbits.json               Existing mission orbit profiles
|   |   |-- orbitExplorer.js          3D orbit profiles and educational period calculation
|   |   |-- resourceLimits.json       Existing Earth-mission resource rules
|   |   |-- simulationRules.json      Existing Earth-mission simulation settings
|   |   `-- scoringCriteria.json      Existing Earth-mission scoring settings
|   |-- engine/
|   |   |-- gameEngine.js             Destination calculations, validation, outcomes
|   |   |-- resourceCalculator.js     Orbit profiles and existing resource formulas
|   |   |-- validationEngine.js       Existing Earth-mission validation
|   |   |-- missionSimulator.js       Existing deterministic Earth-mission outcome
|   |   `-- scoringEngine.js          Existing Earth-mission score rules
|   |-- components/
|   |   |-- orbit/
|   |   |   |-- OrbitExplorer.jsx     Orbit controls, selector, information, fallback
|   |   |   |-- OrbitScene.jsx        3D Earth, paths, satellite, lights, camera
|   |   |   `-- EarthTexture.js       Original procedural Earth surface texture
|   |   |-- MissionGame.jsx           Command center, builder, simulation, debrief
|   |   |-- OrbitSimulator.jsx        Existing SVG orbit scene kept for legacy screens
|   |   |-- MissionDashboard.jsx      Existing Earth-observation dashboard
|   |   |-- MissionBuilder.jsx        Existing Earth-observation builder
|   |   |-- ResourcePanel.jsx         Existing resource indicators
|   |   |-- MissionSimulation.jsx     Existing Earth-observation simulation view
|   |   |-- MissionDebrief.jsx        Existing Earth-observation debrief
|   |   |-- GameExplorer.jsx          Existing orbit explorer wrapper
|   |   `-- EducationalGuide.jsx      Existing learning guide
|   |-- styles/
|   |   |-- Game.css                 Responsive game interface
|   |   |-- orbit-explorer.css       Responsive 3D Orbit Explorer layout
|   |   |-- OrbitSimulator.css       Existing SVG orbit scene styles
|   |   |-- App.css                  Existing application styles
|   |   |-- Dashboard.css            Existing and legacy screen styles
|   |   `-- index.css                Global theme and typography
|   |-- App.jsx                      Shared mission configuration and navigation
|   `-- main.jsx                     React application entry point
|-- SETILLAR-TITANS-BACKUP-BEFORE-3D-ORBIT/
|-- tests/
|   `-- orbitExplorer.test.js       Kepler periods, orbit capacities, deterministic outcomes
|-- package.json                    Dependencies and npm commands
|-- package-lock.json               Exact npm dependency lock
`-- README.md                       This guide
```

## Run locally

```sh
npm install
npm run dev
```

Run `npm test` for the orbit and mission-rule checks, `npm run lint` for lint checks, and `npm run build` for a production build in `dist/`.

## Color system

The interface uses a restrained 70/20/10 palette: deep-space navy `#07111F` for the background, orbit blue `#16283D` for cards and surfaces, and signal cyan `#35D5FF` for controls and emphasis. Neutral light and muted text colors preserve contrast; status warnings use labels and icons as well as color.

## Mission flow

1. **Explore Missions** and pick the Moon, Mars, or Europa.
2. **Mission Builder** lets you name the mission and choose a spacecraft, propulsion, power source, communications system, shielding, launch vehicle, fuel allocation, instruments, and Earth staging orbit.
3. Resource meters recalculate mass, electrical demand, budget, fuel, and communications from those selections. Invalid designs show the specific modeled constraints.
4. **Launch Simulation** advances through launch, transit, arrival, science, and completion. A radiation event pauses the run for a choice with different modeled science and health effects.
5. **Debrief** shows the deterministic outcome, score, science return, resource review, flight timeline, and next steps.

Drafts, mission history, discoveries, settings, and a paused simulation snapshot are saved in this browser. **Run Again** retains the design; **New Mission** starts a fresh design; **Reset Progress** clears local data after confirmation.

## 3D Orbit Explorer

The Orbit Explorer dynamically loads Three.js, React Three Fiber, and Drei. It includes an original procedural Earth texture, atmospheric shell, stars, spacecraft model, LEO/SSO/MEO/GEO paths, play/pause, restart, 1x/2x/5x speed, drag-to-rotate, zoom, and reset-camera controls. The Earth and GEO satellite use matching visual angular rates. **Use This Orbit** updates the shared mission configuration, confirms the selection, and opens Mission Builder while preserving other choices. A static CSS Earth and orbit are shown if WebGL is unavailable or the 3D scene fails.

Orbit radii are log-compressed for visibility. Paths and animation speeds are not to scale, live tracking, or precise propagation. Approximate circular periods use the Kepler equation with Earth's mean radius and standard gravitational parameter. SSO is explained as a sun-synchronous near-polar LEO case, not a separate altitude class. Background references: [NASA Earth Observatory orbits](https://science.nasa.gov/earth/earth-observatory/catalog-of-earth-satellite-orbits/) and [ESA orbit types](https://www.esa.int/Enabling_Support/Space_Transportation/Types_of_orbits).

## Educational scope

Mission outcomes are deterministic educational rules. They are not professional aerospace engineering results and do not model full orbital mechanics, radiation, power behavior, uncertainty, or real spacecraft performance. All game costs, capacities, masses, science values, and resource assumptions are simplified.

## Backup

The pre-change source and project configuration snapshot is `SETILLAR-TITANS-BACKUP-BEFORE-3D-ORBIT/`. It includes `src/`, `public/`, project metadata, the npm lockfile, Vite settings, and documentation. Generated `node_modules/` and `dist/` are excluded.

## Stack

React 19, Vite, Three.js, React Three Fiber, Drei, Lucide, JavaScript, CSS, and local browser storage. No account or game server is required.
