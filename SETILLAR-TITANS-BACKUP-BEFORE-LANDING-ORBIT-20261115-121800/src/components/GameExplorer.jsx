import OrbitSimulator from "./OrbitSimulator.jsx"

export default function GameExplorer({ selectedOrbit, onUseOrbit }) {
  return <div className="content explorer-content">
    <section className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line"/> LEARNING BAY <span className="eyebrow-muted">/ GAME EXPLORER</span></div><h1>Explore the <em>universe.</em></h1><p>Discover what each orbit can do, then bring your choice into Mission 001.</p></div><div className="heading-meta"><span className="mission-pill"><i/> INTERACTIVE ORBIT LAB</span><div>ILLUSTRATIVE MODEL <b>/</b> NO PROPAGATION</div></div></section>
    <div className="explorer-note"><span>✳</span><p><b>An orbit is a path around Earth.</b> Its altitude and shape affect how often a satellite passes over places, how much of Earth it can see, and what a mission can observe.</p></div>
    <OrbitSimulator selectedOrbit={selectedOrbit} onUseOrbit={onUseOrbit}/>
    <div className="explorer-basics"><article><span>01 / MOTION</span><b>Gravity keeps a satellite in orbit</b><p>Satellites move forward while Earth’s gravity continually bends their path around the planet.</p></article><article><span>02 / TRADE-OFF</span><b>Closer isn’t always better</b><p>Lower orbits can give detailed views, while higher orbits can cover a wider region.</p></article><article><span>03 / MISSION DESIGN</span><b>Match the orbit to the question</b><p>Repeated Earth images often benefit from similar lighting; continuous regional viewing favors a much higher orbit.</p></article></div>
    <footer className="content-footer"><span>SETILLAR TITANS <b>/</b> AN EDUCATIONAL MISSION DESIGN GAME</span><span>ILLUSTRATIVE ORBITS <b>/</b> NOT FOR FLIGHT DESIGN</span></footer>
  </div>
}
