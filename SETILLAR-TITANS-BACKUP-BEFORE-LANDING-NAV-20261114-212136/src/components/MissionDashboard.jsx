import missionData from "../data/missions.json" with { type: "json" }
import { Gauge } from "./ResourcePanel.jsx"
const objectiveNames = missionData.objectives

export default function MissionDashboard({ calc, config, result, events, readiness, valid, running, onBuild, onResources, onLaunch, onDebrief }) {
  const destination = calc.orbit.name
  const resourceItems = [
    { label: 'Total mass', used: calc.mass, limit: calc.limits.mass, unit: 'kg', icon: '◇', margin: calc.margins.mass },
    { label: 'Electrical power', used: calc.power, limit: calc.limits.power, unit: 'W', icon: 'ϟ', margin: calc.margins.power },
    { label: 'Mission budget', used: calc.budget, limit: calc.limits.budget, unit: 'M', prefix: '$', icon: '$', margin: calc.margins.budget },
  ]
  const telemetry = result ? [
    { label: 'Mission score', value: result.quality, unit: '/100', percent: result.quality },
    { label: 'Payload mass', value: result.calc.mass, unit: 'kg', percent: Math.min(100, result.calc.mass / result.calc.limits.mass * 100) },
    { label: 'Power used', value: result.calc.power, unit: 'W', percent: Math.min(100, result.calc.power / result.calc.limits.power * 100) },
    { label: 'Data link', value: result.calc.data, unit: 'pts', percent: Math.min(100, result.calc.data / result.calc.limits.data * 100) },
  ] : []
  return <div className="content dashboard-content">
    <section className="dashboard-heading"><div><div className="eyebrow"><span className="eyebrow-line"/> FLIGHT DECK <span className="eyebrow-muted">/ OVERVIEW</span></div><h1>Mission <em>control.</em></h1><p>Your mission at a glance. Design, balance, then discover.</p></div><div className="heading-meta"><span className="mission-pill"><i/>{result ? 'SIMULATION COMPLETE' : 'MISSION IN PREPARATION'}</span><div>EARTH SCIENCE PROGRAM <b>·</b> MISSION 001</div></div></section>
    <section className="kpi-grid" aria-label="Mission summary">
      <article className="kpi-card"><span className="kpi-icon">⌖</span><div className="kpi-caption">ACTIVE MISSION</div><strong>001 <small>/ 01</small></strong><div className="kpi-foot"><span className="kpi-status-dot"/> Earth observation</div><span className="kpi-orbit">{calc.orbit.abbr} · {calc.orbit.name.toUpperCase()}</span></article>
      <article className="kpi-card"><span className="kpi-icon">◉</span><div className="kpi-caption">RESOURCE READINESS</div><strong>{readiness}<small>%</small></strong><div className="kpi-foot"><span className={`kpi-status-dot ${valid ? '' : 'red'}`}/>{valid ? 'All critical limits in range' : 'Constraint warning detected'}</div><span className="kpi-orbit">LOWEST REMAINING MARGIN</span></article>
      <article className="kpi-card status-kpi"><span className="kpi-icon">⌁</span><div className="kpi-caption">MISSION STATUS</div><strong className={result?.outcome === 'MISSION FAILURE' ? 'status-failure' : ''}>{result ? result.outcome : 'PREPARING'}</strong><div className="kpi-foot"><span className={`kpi-status-dot ${result?.outcome === 'MISSION FAILURE' ? 'red' : ''}`}/>{result ? `Game score ${result.quality}/100` : `${calc.selected.length} instrument${calc.selected.length === 1 ? '' : 's'} configured`}</div><span className="kpi-orbit">{result ? 'LATEST SIMULATION' : 'AWAITING LAUNCH'}</span></article>
    </section>
    <section className="dashboard-grid">
      <article className="dash-card active-mission-card">
        <div className="card-heading"><div><span className="section-index">MISSION 001 / ACTIVE</span><h2>Earth observation</h2></div><span className={`status-chip ${result ? 'complete' : 'preparing'}`}><i/>{result ? 'COMPLETE' : 'PREPARING'}</span></div>
        <p className="mission-summary">Design a satellite to collect useful Earth data and return it to the ground.</p>
        <div className="mission-art"><div className="orbit-ring orbit-one"/><div className="orbit-ring orbit-two"/><div className="earth-globe"><span className="earth-mark">✦</span></div><div className="satellite-mark">◇<i/></div><span className="art-label art-label-top">EARTH / {calc.orbit.abbr}</span><span className="art-label art-label-bottom">ORBITAL PATH · ILLUSTRATIVE</span></div>
        <div className="mission-facts"><div><span>OBJECTIVE</span><b>{objectiveNames[config.objective]}</b></div><div><span>DESTINATION</span><b>{destination}</b></div><div><span>SPACECRAFT</span><b>{calc.bus.name}</b></div><div><span>PAYLOAD</span><b>{calc.selected.length} instrument{calc.selected.length === 1 ? '' : 's'}</b></div></div>
        <div className="preparation-line"><span><span className="preparation-dot"/> FLIGHT PLAN {valid ? 'WITHIN MODELED LIMITS' : 'NEEDS REVIEW'}</span><b>{result ? 'SIM COMPLETE' : `${readiness}% MARGIN`}</b></div><div className="prep-meter"><i className={!valid ? 'warning' : ''} style={{ width: `${result ? 100 : readiness}%` }}/></div>
        <button className="text-action" onClick={onBuild}>OPEN FLIGHT PLAN <span>↗</span></button>
      </article>
      <article className="dash-card resource-health-card">
        <div className="card-heading"><div><span className="section-index">LIVE TELEMETRY / CONFIGURATION</span><h2>Resource health</h2></div><span className="live-tag"><i/> LIVE</span></div><p className="card-subtitle">Calculated from your current spacecraft and payload.</p>
        <div className="resource-gauges">{resourceItems.map((resource) => <Gauge key={resource.label} {...resource}/>)}</div>
        <div className={`resource-alert ${valid ? 'clear' : 'warning'}`}><span>{valid ? '✓' : '!'}</span><div><b>{valid ? 'Configuration is within limits' : 'Configuration needs attention'}</b><small>{valid ? `${readiness}% margin remains on the tightest resource` : `${Object.entries(calc.margins).filter(([, margin]) => margin < 0).map(([key]) => key).join(', ') || 'Select at least one instrument'}`}</small></div><button className="icon-action" onClick={onResources} aria-label="Manage mission resources">↗</button></div>
        <button className="outline-action" onClick={onResources}>MANAGE RESOURCES <span>→</span></button>
      </article>
      <article className="dash-card analytics-card">
        <div className="card-heading"><div><span className="section-index">DETERMINISTIC OUTPUT</span><h2>Mission analytics</h2></div><span className="analytics-id">{result ? 'RUN 001' : 'NO RUN'}</span></div>
        {result ? <><div className="analytics-outcome"><div className={`outcome-orb ${result.outcome === 'MISSION FAILURE' ? 'failed' : result.outcome === 'PARTIAL SUCCESS' ? 'partial' : ''}`}>{result.outcome === 'SUCCESS' ? '✓' : result.outcome === 'PARTIAL SUCCESS' ? '◐' : '!'}</div><div><span>SIMULATION OUTCOME</span><b>{result.outcome}</b></div><strong>{result.quality}<small>/100</small></strong></div><div className="telemetry-list">{telemetry.map((item) => <div className="telemetry-row" key={item.label}><div><span>{item.label}</span><b>{item.value}<small> {item.unit}</small></b></div><div className="telemetry-meter"><i style={{ width: `${item.percent}%` }}/></div></div>)}</div><p className="sample-note">Values from your latest mission simulation. Score is an educational game score.</p></> : <div className="analytics-empty"><span className="empty-chart">∿</span><b>Telemetry will appear after launch</b><p>Run a simulation to see the mission score and resource utilization from your selected design.</p><span className="empty-label">NO SIMULATION DATA YET</span></div>}
      </article>
      <article className="dash-card events-card">
        <div className="card-heading"><div><span className="section-index">FLIGHT LOG</span><h2>Recent mission events</h2></div><span className="event-count">{events.length.toString().padStart(2, '0')} LOGGED</span></div>
        {events.length ? <div className="event-list">{events.map((event, index) => <div className="event-row" key={event.id}><span className={`event-marker ${index === 0 ? 'current' : ''}`}>{index === 0 ? '●' : '·'}</span><div><b>{event.title}</b><p>{event.detail}</p></div><small>{event.time}</small></div>)}</div> : <div className="events-empty"><span>⌁</span><p>Mission events will be logged here as you configure and run your flight plan.</p></div>}
      </article>
      <article className="dash-card debrief-preview">
        <div className="card-heading"><div><span className="section-index">MISSION REVIEW</span><h2>Mission debrief</h2></div>{result && <span className="event-count">LATEST RESULT</span>}</div>
        {result ? <><div className={`debrief-preview-result ${result.outcome === 'MISSION FAILURE' ? 'failed' : ''}`}><span>{result.outcome === 'SUCCESS' ? '✓' : result.outcome === 'PARTIAL SUCCESS' ? '◐' : '!'}</span><div><b>{result.outcome}</b><p>{result.issues.length ? `Constraint violations: ${result.issues.join(', ')}.` : result.outcome === 'PARTIAL SUCCESS' ? 'A non-critical performance target reduced the final result.' : 'All mandatory game constraints were satisfied.'}</p></div></div><button className="text-action" onClick={onDebrief}>VIEW FULL DEBRIEF <span>↗</span></button></> : <div className="events-empty"><span>▤</span><p>Launch the simulation to generate an outcome, score, and lessons learned.</p></div>}
      </article>
    </section>
    <section className="action-strip"><div><span className="section-index">MISSION WORKFLOW</span><b>Ready to shape your mission?</b><small>Build, balance, and test your Earth observation design.</small></div><div className="action-buttons"><button className="btn-primary" onClick={onBuild}>⊕ <span>BUILD MISSION</span></button><button className="btn-outline" onClick={onResources}>▥ <span>MANAGE RESOURCES</span></button><button className="btn-launch" onClick={onLaunch} disabled={running}>{running ? 'SIMULATION RUNNING…' : '▷  LAUNCH SIMULATION'}</button></div></section>
    <footer className="content-footer"><span>SETILLAR TITANS <b>·</b> AN EDUCATIONAL MISSION DESIGN GAME</span><span>SIMPLIFIED MODEL <b>·</b> NOT FOR FLIGHT DESIGN</span></footer>
  </div>
}
