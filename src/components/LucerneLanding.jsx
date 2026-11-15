import { useEffect, useRef } from 'react'
import './LucerneLanding.css'

const team = [
  ['Alex Bisogni', 'ORGANIZER', 'photo-1500648767791-00dcc994a43e'],
  ['Yvonne Bemelmans', 'MISSION VOLUNTEER', 'photo-1534528741775-53994a69daeb'],
  ['Rylan Coury', 'MISSION VOLUNTEER', 'photo-1506794778202-cad84cf45f1d'],
  ['Magdalena Herová', 'MISSION VOLUNTEER', 'photo-1531123897727-8f129e1688ce'],
  ['Paulo Pinheiro', 'MISSION VOLUNTEER', 'photo-1507003211169-0a1dd7228f2d'],
  ['Dino Causevic', 'MISSION VOLUNTEER', 'photo-1506794778202-cad84cf45f1d'],
  ['Aldo Lamberti', 'MISSION VOLUNTEER', 'photo-1500648767791-00dcc994a43e'],
]

const feeds = [
  ['Daylight Earth', 'NASA GIBS · Blue Marble', 'Satellite imagery served as map layers, including clouds, sea temperature, vegetation and aerosols.'],
  ['City lights on the night side', 'NASA GIBS · VIIRS Black Marble', 'Night-time lights seen from orbit reveal where people live and how much energy is used.'],
  ['Day and night line', 'Calculated from current UTC', 'The Sun’s position over Earth, recalculated in your browser.'],
  ['Red patches · fire detections', 'NASA GIBS · VIIRS Suomi NPP', 'Daily global heat detections from fires, agricultural burns and industrial flares.'],
  ['Orange dots · reported events', 'NASA EONET v3 · IRWIN', 'Named wildfire events with location, date history, size and links to source agencies.'],
  ['Blue dots · tropical storms', 'NASA EONET · JTWC / NOAA', 'Storm name, position track and maximum wind for recent tropical cyclone advisories.'],
  ['ISS marker and trail', 'Where the ISS at? public API', 'Position, altitude, speed, daylight and the area currently visible from orbit.'],
  ['Aurora oval and Kp', 'NOAA Space Weather Prediction Center', 'Geomagnetic activity on a scale of 0 to 9, updated in three-hour steps.'],
  ['Solar wind', 'NOAA SWPC', 'Particle speed, density and temperature measured by spacecraft sunward of Earth.'],
]

function Eyebrow({ children }) { return <div className="luc-eyebrow">{children}</div> }

function Navbar({ onEnter }) {
  return <header className="luc-nav"><a className="luc-brand" href="#top" aria-label="NASA Space Apps Challenge Lucerne home"><span className="luc-brand-mark">✦</span><span>NASA SPACE APPS CHALLENGE <b>LUCERNE</b></span></a><div className="luc-nav-right"><span className="luc-live"><i/> LIVE TELEMETRY</span><a href="#mission-team">MISSION VOLUNTEERS</a><button className="luc-menu" onClick={onEnter}>MISSION BUILDER ↗</button></div></header>
}

function Hero({ onEnter }) {
  return <section className="luc-hero" id="top">
    <div className="luc-event-line"><span>LUZERN · SWITZERLAND</span><span>KICK-OFF NOV 13 · HACKATHON NOV 14–15, 2026</span></div>
    <div className="luc-hero-copy"><Eyebrow>NASA SPACE APPS CHALLENGE · 2026</Eyebrow><h1>The planet below<br/>is <em>live.</em></h1><p>Real satellite imagery, tonight’s day-and-night line, the International Space Station right now, and every wildfire NASA detected yesterday. This is the data you will build with.</p><div className="luc-hero-actions"><a href="https://www.spaceappschallenge.org/" target="_blank" rel="noreferrer" className="luc-cta">Register for the event <span>↗</span></a><a className="luc-text-link" href="#focus-earth">EXPLORE THE MISSION <span>↓</span></a></div></div>
    <div className="luc-earth-wrap" aria-label="Illustration of Earth at night with live satellite data"><div className="luc-orbit luc-orbit-one"/><div className="luc-orbit luc-orbit-two"/><div className="luc-earth"><div className="luc-earth-map"/><div className="luc-earth-clouds"/><span className="luc-fire fire-one"/><span className="luc-fire fire-two"/><span className="luc-fire fire-three"/><span className="luc-satellite">✦</span></div><div className="luc-earth-caption"><span>EARTH · LIVE VIEW</span><span>VIIRS / GIBS</span></div><div className="luc-coordinate">40° 42′ N &nbsp; 74° 00′ W<br/><span>THERMAL ANOMALIES · 24H</span></div></div>
    <div className="luc-scroll-note"><span/> SCROLL TO LEAVE EARTH</div>
    <div className="luc-focus-card" id="focus-earth"><div className="luc-focus-top"><span>FOCUS 01 <i/> HOME</span><span>01 / 04</span></div><h2>Start with Earth.</h2><p>Six of this year’s fourteen challenges are about our own planet: fire hot spots, surface change from radar, farming under shifting climate, and more.</p><div className="luc-data-bars"><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/></div><div className="luc-sensor"><i/> RED PATCHES · NASA VIIRS FIRE DETECTIONS <b>LIVE FEED</b></div><div className="luc-pills"><span>EARTH OBSERVATION</span><span>CLIMATE DATA</span><span>LIVE FEEDS</span></div></div>
    <button className="luc-game-link" onClick={onEnter}>OPEN THE MISSION DESIGN GAME <span>↗</span></button>
  </section>
}

function Chapters({ onEnter }) {
  const chapters = [
    ['FOCUS 02 · THE MOON', 'Plan the return.', 'Commercial landers are heading for the lunar south pole, where light and communications are brutal. Find places on Earth that look like a Moon base, and tell the story of the hardware already left behind.', ['CLPS LUNAR MISSIONS', 'EARTH ANALOGS', 'LUNAR DATA']],
    ['FOCUS 03 · MARS', 'Survive the red planet.', 'Decades of rovers and landers have mapped Mars. Turn that data into a survival guide, or design the whole mission yourself.', ['MARS HABITAT', 'RESOURCE MAPPING', 'AUTONOMOUS ROVERS']],
    ['FOCUS 04 · BEYOND', 'Your move, Lucerne.', 'Join us for the kick-off on Friday, November 13 at 16:00 for orientation and networking. Then pick a challenge, form a team, and ship something over the weekend.', ['NOV 13 · KICK-OFF', 'NOV 14–15 · HACKATHON', 'LUZERN, SWITZERLAND']],
  ]
  return <section className="luc-chapters"><div className="luc-chapter-art"><div className="luc-moon"/><div className="luc-mars"/><div className="luc-stars">✦<br/>· &nbsp;&nbsp; ✧</div><div className="luc-side-label">A WORLD OF DATA<br/>A WEEKEND TO BUILD</div></div>{chapters.map(([label,title,copy,tags],i)=><article className="luc-chapter" key={title}><Eyebrow>{label}</Eyebrow><h2>{title}</h2><p>{copy}</p><div className="luc-tags">{tags.map(tag=><span key={tag}>{tag}</span>)}</div>{i===2&&<a href="https://www.spaceappschallenge.org/" target="_blank" rel="noreferrer" className="luc-cta luc-chapter-cta">Register for Lucerne <span>→</span></a>}</article>)}<button className="luc-chapter-game" onClick={onEnter}>TRY THE SPACE MISSION DESIGN GAME ↗</button></section>
}

function MissionTeam() {
  return <section className="luc-content-section" id="mission-team"><Eyebrow>THE PEOPLE BEHIND IT</Eyebrow><h2>Mission Team</h2><p className="luc-section-intro">Volunteers and advisors from SSIP and the Lucerne space community, organizing the NASA Space Apps Challenge in Lucerne.</p><div className="luc-team-grid">{team.map(([name,role,image])=><article className="luc-person" key={name}><img src={`https://images.unsplash.com/${image}?auto=format&fit=crop&w=180&h=180&q=80`} alt={name} loading="lazy"/><h3>{name}</h3><span>{role}</span></article>)}</div></section>
}

function MissionSponsors() {
  const sponsors=['SSIP','HSLU','Luzern','Space Exchange','Swiss Space Office','Pilatus','Roche','RUAG','Luzerner Kantonalbank','TechLab','Lucerne University','swissnex','Open Data'];
  return <section className="luc-content-section luc-sponsors"><Eyebrow>THANK YOU</Eyebrow><h2>Mission Sponsors</h2><p className="luc-section-intro">Our sponsors and partners make the event free for every participant. Meet them at the kick-off on Friday, November 13 at 16:00.</p><div className="luc-sponsor-grid">{sponsors.map((name,i)=><div className={`luc-sponsor sponsor-${i}`} key={name}><span className="luc-sponsor-symbol">{i%3===0?'✳':i%3===1?'◉':'✦'}</span>{name}</div>)}</div></section>
}

function LiveDataSection() {
  return <section className="luc-content-section luc-live-data"><Eyebrow>UNDER THE HOOD</Eyebrow><h2>Live Data</h2><p className="luc-section-intro">Most of what moves on this page is real. These public feeds are the same kind of data you can build with during the hackathon.</p><div className="luc-table-wrap"><table><thead><tr><th>WHERE YOU SEE IT</th><th>SOURCE</th><th>WHAT THE FEED OFFERS</th></tr></thead><tbody>{feeds.map(([where,source,description])=><tr key={where}><td>{where}</td><td>{source}</td><td>{description}</td></tr>)}</tbody></table></div></section>
}

function Footer() { return <footer className="luc-footer"><a className="luc-brand" href="#top"><span className="luc-brand-mark">✦</span><span>NASA SPACE APPS CHALLENGE <b>LUCERNE</b></span></a><span>© 2026 NASA Space Apps Challenge Lucerne · Hosted by SSIP · Space Systems Innovation Platform</span><a href="#top">BACK TO ORBIT ↑</a></footer> }

export default function LucerneLanding({ onEnter }) {
  const root = useRef(null)
  useEffect(() => {
    const elements = root.current?.querySelectorAll('.luc-chapter,.luc-content-section,.luc-person,.luc-sponsor,.luc-live-data tbody tr')
    if (!elements) return undefined
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target) } }), { threshold: 0.12 })
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])
  return <main className="lucerne" ref={root}><Navbar onEnter={onEnter}/><Hero onEnter={onEnter}/><Chapters onEnter={onEnter}/><MissionTeam/><MissionSponsors/><LiveDataSection/><Footer/></main>
}
