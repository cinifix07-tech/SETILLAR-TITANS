# SETILLAR TITANS

An educational space mission design game. Configure a simplified Earth-observation mission, balance its modeled resources, launch a deterministic simulation, and review the engineering trade-offs.

## Project structure

```text
src/
├── data/
│   ├── missions.json
│   ├── components.json
│   ├── instruments.json
│   ├── launchVehicles.json
│   ├── orbits.json
│   ├── resourceLimits.json
│   ├── simulationRules.json
│   └── scoringCriteria.json
├── engine/
│   ├── resourceCalculator.js
│   ├── validationEngine.js
│   ├── missionSimulator.js
│   └── scoringEngine.js
├── components/
│   ├── MissionDashboard.jsx
│   ├── MissionBuilder.jsx
│   ├── ResourcePanel.jsx
│   ├── MissionSimulation.jsx
│   ├── MissionDebrief.jsx
│   ├── GameExplorer.jsx
│   ├── OrbitSimulator.jsx
│   └── EducationalGuide.jsx
├── styles/
│   ├── App.css
│   ├── Dashboard.css
│   ├── OrbitSimulator.css
│   └── index.css
├── App.jsx
└── main.jsx

backups/   Previous versions saved before the refactor
```

**Where to look:** Edit game options in `data/`. Change resource formulas and rules in `engine/`. Update screens in `components/`. Global mission state and navigation live in `App.jsx`.

## Run locally

```sh
npm install
npm run dev
```

Create a production build with `npm run build`; preview it with `npm run preview`.

## Gameplay

The Mission Builder has six editable steps: objective, spacecraft, instruments, launch option, orbit and duration, and review. The live telemetry panel recalculates payload mass, power demand, budget, and data-link demand as selections change. Launch runs a repeatable rule-based simulation and opens a debrief with the mission score, resource review, timeline, and lessons learned. No account or server is required.

The How to Play section provides beginner explanations and links to NASA Earth Science and the NASA Systems Engineering Handbook.

## Game Explorer orbit lab

Open **Game Explorer** in the top navigation to use the animated Orbit Lab. It provides LEO, SSO, MEO, and GEO profiles, a responsive SVG Earth/orbit scene, play/pause/restart, 1×/2×/5× animation rate, zoom controls, and orbit-specific learning notes. **Use this orbit** applies the selected orbit to Mission Builder step 5 and the dashboard.

The animation is an illustrative 2D projection and is not orbital propagation. Orbital size, inclination, and animation speed are not to scale or physical telemetry. Approximate heights and periods refer to typical ranges or named mission examples shown in the interface. A destination factor adjusts the game's launch payload capacity, and the orbit's educational suitability contributes to the deterministic game score. These factors are game-design assumptions.

The scene uses SVG and CSS and does not require WebGL, so it remains available when 3D/WebGL rendering is unsupported. Animation pauses when the page becomes hidden and starts paused for users who prefer reduced motion. The SVG remains a static scene if animation is paused.

Orbit references: [NASA Earth Observatory: Catalog of Earth Satellite Orbits](https://science.nasa.gov/earth/earth-observatory/catalog-of-earth-satellite-orbits/), [NASA Basics of Space Flight: Planetary Orbits](https://science.nasa.gov/learn/basics-of-space-flight/chapter5-1/), and [NASA Terra mission orbit facts](https://terra.nasa.gov/About).

## Educational model and assumptions

All costs, capacities, masses, power values, instrument science values, data points, and scoring values in the game are illustrative game-design assumptions. They are not NASA specifications, mission predictions, or professional engineering guidance. The model simplifies a real mission: it does not calculate orbital mechanics, thermal behavior, radiation, launch environments, pointing, data rates, uncertainty, redundancy, or subsystem interactions in full. “Game score” is an educational feedback score, not an official mission evaluation.

The simulator uses the same outcome rules every run. It checks launch mass capacity, spacecraft power generation, a $100M game budget, instrument selection, and data-link capacity. A critical resource violation or no selected instruments causes mission failure. Designs meeting critical constraints receive success or partial success based on modeled science value and data-link margin.

## Stack

React 19, Vite, JavaScript, and responsive CSS. Mission data and simulation logic are kept in the frontend for the self-contained MVP.

## Demonstration flow

1. Open Mission Builder and select an objective.
2. Compare spacecraft, instruments, and launch options while watching telemetry update.
3. Choose orbit and mission duration, then review the flight plan.
4. Launch the simulation and discuss the timeline, outcome, score, and recommendations.

## Deployment

Build the static site with `npm run build`, then publish the generated `dist/` directory to any static host that supports Vite single-page applications. Configure the host to serve `index.html` for application routes.
