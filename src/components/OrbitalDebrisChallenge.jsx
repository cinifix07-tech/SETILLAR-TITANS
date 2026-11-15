import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Play, RotateCcw, X } from 'lucide-react'
import '../styles/OrbitalDebrisChallenge.css'

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
const controls = { ArrowUp: [0, -42], w: [0, -42], ArrowDown: [0, 42], s: [0, 42], ArrowLeft: [-42, 0], a: [-42, 0], ArrowRight: [42, 0], d: [42, 0] }

export default function OrbitalDebrisChallenge({ onClose }) {
  const [mode, setMode] = useState('brief')
  const [ship, setShip] = useState({ x: 500, y: 490 })
  const [rocks, setRocks] = useState([])
  const [elapsed, setElapsed] = useState(0)
  const [hits, setHits] = useState(0)
  const shipRef = useRef(ship)
  const rocksRef = useRef([])
  const elapsedRef = useRef(0)
  const hitsRef = useRef(0)
  const sequence = useRef(0)

  const move = useCallback((key) => {
    const delta = controls[key] ?? controls[key.toLowerCase()]
    if (!delta || mode !== 'playing') return
    setShip((current) => {
      const next = { x: clamp(current.x + delta[0], 55, 945), y: clamp(current.y + delta[1], 80, 545) }
      shipRef.current = next
      return next
    })
  }, [mode])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!controls[event.key] && !controls[event.key.toLowerCase()]) return
      event.preventDefault()
      move(event.key)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mode, move])

  useEffect(() => {
    if (mode !== 'playing') return undefined
    const timer = window.setInterval(() => {
      elapsedRef.current = Math.min(20, elapsedRef.current + 0.1)
      setElapsed(elapsedRef.current)
      if (elapsedRef.current >= 20) { setMode('clear'); return }
      let next = rocksRef.current.map((rock) => ({ ...rock, y: rock.y + rock.speed * 0.1 })).filter((rock) => rock.y < 625)
      if (Math.round(elapsedRef.current * 10) % 7 === 0) {
        sequence.current += 1
        next = [...next, { id: sequence.current, x: 45 + ((sequence.current * 173) % 910), y: -20, speed: 125 + (sequence.current % 4) * 20 }]
      }
      const shipNow = shipRef.current
      const collided = next.filter((rock) => Math.abs(rock.x - shipNow.x) < 38 && Math.abs(rock.y - shipNow.y) < 38)
      if (collided.length) {
        hitsRef.current = Math.min(3, hitsRef.current + collided.length)
        setHits(hitsRef.current)
        next = next.filter((rock) => !collided.some((hit) => hit.id === rock.id))
        if (hitsRef.current >= 3) setMode('damaged')
      }
      rocksRef.current = next
      setRocks(next)
    }, 100)
    return () => window.clearInterval(timer)
  }, [mode])

  const begin = () => { setShip({ x: 500, y: 490 }); shipRef.current = { x: 500, y: 490 }; rocksRef.current = []; setRocks([]); elapsedRef.current = 0; hitsRef.current = 0; setElapsed(0); setHits(0); sequence.current = 0; setMode('playing') }
  const returnToTransitGames = () => onClose(mode === 'clear' ? 'Orbital Debris Dodge completed' : mode === 'damaged' ? 'Orbital Debris Dodge ended after three collisions' : 'Orbital Debris Dodge skipped')
  const won = mode === 'clear'
  const ended = won || mode === 'damaged'

  return <div className="debris-challenge-scrim">
    <section className="debris-challenge-dialog" role="dialog" aria-modal="true" aria-labelledby="debris-challenge-title">
      <header className="debris-challenge-header"><div><span className="game-eyebrow">APPROACH CHECKPOINT / MINI GAME</span><h2 id="debris-challenge-title">Orbital Debris Dodge</h2><p>Steer the practice satellite through a debris field for 20 seconds. Three collisions end the challenge.</p></div><button className="debris-close" onClick={returnToTransitGames} aria-label="Skip this challenge"><X/></button></header>
      {mode === 'brief' && <div className="debris-brief"><div className="debris-control-guide"><b>HOW TO PLAY</b><span>Use arrow keys or W A S D to move the satellite and avoid the glowing debris.</span><span>On a touch screen, use the direction buttons below the play field.</span><small>This optional challenge does not change your mission score or resource calculations.</small></div><button className="debris-primary" onClick={begin}><Play size={17} fill="currentColor"/> START CHALLENGE</button></div>}
      {mode !== 'brief' && <>
        <div className="debris-hud"><span>TIME <b>{Math.max(0, 20 - elapsed).toFixed(1)} SEC</b></span><span>COLLISIONS <b>{hits} OF 3</b></span><span>{mode === 'playing' ? 'DODGE THE DEBRIS' : won ? 'FIELD CLEARED' : 'SATELLITE HIT LIMIT REACHED'}</span></div>
        <div className="debris-field" role="img" aria-label="Interactive educational satellite debris avoidance challenge">
          <svg viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
            <defs><radialGradient id="debris-glow"><stop stopColor="#34d9ff" stopOpacity=".45"/><stop offset="1" stopColor="#07111f" stopOpacity="0"/></radialGradient></defs>
            <circle className="debris-planet-glow" cx="500" cy="690" r="300" fill="url(#debris-glow)"/><path d="M0 520 Q500 410 1000 520" fill="none" stroke="#35d5ff" strokeOpacity=".2" strokeDasharray="6 12"/>
            {rocks.map((rock) => <g key={rock.id} transform={`translate(${rock.x} ${rock.y}) rotate(${rock.id * 17})`}><path d="M-13 -8L-4 -16L9 -11L15 1L7 13L-8 12L-16 2Z" fill="#98b5c7" stroke="#d6f5ff" strokeWidth="2"/><circle r="25" fill="#ffbd73" opacity=".08"/></g>)}
            <g transform={`translate(${ship.x} ${ship.y})`} className="debris-player"><ellipse cy="9" rx="31" ry="9" fill="#35d5ff" opacity=".28"/><path d="M-28 0Q-20 -19 0 -20Q20 -19 28 0Q12 10 -12 8Z" fill="#d9f7ff" stroke="#60e7ff" strokeWidth="3"/><ellipse cy="-2" rx="15" ry="9" fill="#147696" stroke="#a8f3ff" strokeWidth="2"/><circle cx="-7" cy="-3" r="2" fill="#eaffff"/><path d="M-16 8L-22 13M16 8L22 13" stroke="#35d5ff" strokeWidth="3"/></g>
            <text x="24" y="38" fill="#83dff3" fontSize="13" fontFamily="monospace">ILLUSTRATIVE DEBRIS FIELD / NOT TO SCALE</text>
          </svg>
        </div>
        {mode === 'playing' && <div className="debris-dpad" aria-label="Touch movement controls"><button onClick={() => move('ArrowUp')} aria-label="Move up"><ArrowUp/></button><div><button onClick={() => move('ArrowLeft')} aria-label="Move left"><ArrowLeft/></button><button onClick={() => move('ArrowDown')} aria-label="Move down"><ArrowDown/></button><button onClick={() => move('ArrowRight')} aria-label="Move right"><ArrowRight/></button></div></div>}
        {ended && <div className="debris-outcome"><b>{won ? 'FIELD CLEARED' : 'CHALLENGE ENDED'}</b><span>{won ? 'You avoided the debris throughout the practice run.' : 'The practice satellite reached the collision limit.'} Your mission plan is unchanged.</span><button className="debris-primary" onClick={returnToTransitGames}>CONTINUE SIMULATION</button><button className="debris-retry" onClick={begin}><RotateCcw size={14}/> TRY AGAIN</button></div>}
        <footer className="debris-challenge-footer"><span>Approach mini game / no effect on mission outcome</span><button onClick={returnToTransitGames}>SKIP THIS CHALLENGE</button></footer>
      </>}
    </section>
  </div>
}
