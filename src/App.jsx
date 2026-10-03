import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Html, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import './App.css'

const asset = (path) => `${import.meta.env.BASE_URL}${path}`

const evidence = {
  meal: {
    room: 'atrium', title: 'A Shared Meal', image: asset('images/evidence/shared-meal.png'),
    alt: 'Three adults in a Roman house share bread and food around a low table.',
    explanation: 'Meals joined worship to ordinary household life. Sharing food could express hospitality and mutual belonging across families and social ranks.',
    question: 'What might a regular shared meal offer that a public civic ceremony could not?',
  },
  reading: {
    room: 'gathering', title: 'Reading and Instruction', image: asset('images/evidence/scripture-reading.png'),
    alt: 'A reader holds an open papyrus scroll while two people listen closely.',
    explanation: 'Texts were normally heard aloud because books were costly and literacy was uneven. Reading, prayer, teaching, and discussion helped a local gathering develop a shared memory and identity.',
    question: 'How could listening together shape a community differently from reading alone?',
  },
  letter: {
    room: 'entry', title: 'A Traveling Letter', image: asset('images/evidence/traveling-letter.png'),
    alt: 'A dusty traveler hands a sealed papyrus scroll to a householder.',
    explanation: 'Travelers and letters connected assemblies across cities. News, teaching, requests for aid, and personal greetings allowed small communities to imagine themselves as part of a wider network.',
    question: 'Why would distant relationships matter to a small and sometimes vulnerable group?',
  },
  care: {
    room: 'gathering', title: 'Care for Others', image: asset('images/evidence/care-for-others.png'),
    alt: 'Food, coins, and a folded cloak are given from one person to another.',
    explanation: 'Christian communities organized practical help for people facing hunger, travel, imprisonment, widowhood, or poverty. Such care turned belief into a visible social practice.',
    question: 'How might dependable assistance make a community both attractive and resilient?',
  },
  diversity: {
    room: 'atrium', title: 'Different Ranks, One Gathering', image: asset('images/evidence/social-diversity.png'),
    alt: 'A householder, domestic worker, artisan, and traveler participate in one discussion circle.',
    explanation: 'House gatherings could include householders, artisans, dependents, enslaved people, freed people, women, men, and travelers. Roman status distinctions did not disappear, but participation in one assembly could complicate them.',
    question: 'What possibilities and tensions could arise when unequal people addressed one another as members of one community?',
  },
  pressure: {
    room: 'entry', title: 'Roman Religious Pressure', image: asset('images/evidence/roman-pressure.png'),
    alt: 'A Roman household shrine stands near a gathering that does not use it.',
    explanation: 'Religion was woven into Roman household, civic, and imperial life. Refusing expected sacrifices could appear antisocial or disloyal even when Christians sought to live peacefully among their neighbors.',
    question: 'Why might quietly declining one ritual create suspicion in a society built around public obligations?',
  },
}

const rooms = {
  entry: {
    label: 'Entry Court', image: asset('images/panoramas/entry.jpg'),
    prompt: 'A traveler has just arrived. Look for evidence of connection and of the Roman world outside the gathering.',
    spots: [{ id: 'letter', lon: -21, lat: -1 }, { id: 'pressure', lon: 21, lat: -4 }],
  },
  atrium: {
    label: 'Atrium', image: asset('images/panoramas/atrium.jpg'),
    prompt: 'The central court brings people together. Investigate the meal and the people around it.',
    spots: [{ id: 'meal', lon: 21, lat: -7 }, { id: 'diversity', lon: -21, lat: -2 }],
  },
  gathering: {
    label: 'Gathering Room', image: asset('images/panoramas/gathering-room.jpg'),
    prompt: 'Teaching and mutual support happen deeper in the house. Find both forms of evidence.',
    spots: [{ id: 'reading', lon: 21, lat: -2 }, { id: 'care', lon: -21, lat: -7 }],
  },
}

function spherePosition(lon, lat, radius = 4.7) {
  const phi = THREE.MathUtils.degToRad(90 - lat)
  const theta = THREE.MathUtils.degToRad(lon + 180)
  return [-radius * Math.sin(phi) * Math.sin(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.cos(theta)]
}

function Panorama({ room, rotation, found, discover }) {
  const texture = useTexture(room.image)
  return (
    <group rotation={[rotation.pitch, rotation.yaw, 0]}>
      <mesh>
        <sphereGeometry args={[5, 64, 40]} />
        <meshBasicMaterial map={texture} side={THREE.BackSide} />
      </mesh>
      {room.spots.map((spot) => {
        const item = evidence[spot.id]
        const collected = found.includes(spot.id)
        return (
          <Html key={spot.id} position={spherePosition(spot.lon, spot.lat)} center transform distanceFactor={5.4}>
            <button className={`hotspot ${collected ? 'is-found' : ''}`} type={'button'}
              onClick={(event) => { event.stopPropagation(); discover(spot.id) }}
              aria-label={`${collected ? 'Review' : 'Investigate'}: ${item.title}`}>
              <span aria-hidden={true}>{collected ? 'OK' : 'i'}</span><strong>{item.title}</strong>
            </button>
          </Html>
        )
      })}
    </group>
  )
}

function Scene(props) {
  return (
    <Canvas camera={{ position: [0, 0, 0.01], fov: 72, near: 0.01, far: 20 }} dpr={[1, 1.6]}>
      <Suspense fallback={null}><Panorama {...props} /></Suspense>
    </Canvas>
  )
}

function EvidenceDialog({ id, close, step }) {
  const item = evidence[id]
  useEffect(() => {
    const handler = (event) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [close])
  return (
    <div className={'dialog-backdrop'} onMouseDown={close}>
      <section className={'evidence-dialog'} role={'dialog'} aria-modal={true}
        onMouseDown={(event) => event.stopPropagation()}>
        <button className={'dialog-close'} type={'button'} onClick={close}>x</button>
        <img src={item.image} alt={item.alt} />
        <div className={'dialog-copy'}>
          <p className={'eyebrow'}>Evidence collected</p>
          <h2 id={'evidence-title'}>{item.title}</h2>
          <p>{item.explanation}</p>
          <div className={'interpretation'}>
            <span>Interpret the evidence</span>
            <p>{item.question}</p>
          </div>
          <div className={'dialog-actions'}>
            <button type={'button'} onClick={() => step(-1)}>Previous evidence</button>
            <button type={'button'} onClick={() => step(1)}>Next evidence</button>
          </div>
        </div>
      </section>
    </div>
  )
}

function App() {
  const ids = Object.keys(evidence)
  const [roomId, setRoomId] = useState('entry')
  const [selected, setSelected] = useState(null)
  const [listOpen, setListOpen] = useState(false)
  const [tourOpen, setTourOpen] = useState(false)
  const [rotation, setRotation] = useState({ yaw: 0, pitch: 0 })
  const [found, setFound] = useState(() => {
    try { return JSON.parse(localStorage.getItem('house-evidence') || '[]') } catch { return [] }
  })
  const drag = useRef(null)

  useEffect(() => localStorage.setItem('house-evidence', JSON.stringify(found)), [found])

  const discover = (id) => {
    setFound((current) => current.includes(id) ? current : [...current, id])
    setSelected(id)
  }
  const openFromList = (id) => {
    setRoomId(evidence[id].room)
    setRotation({ yaw: 0, pitch: 0 })
    discover(id)
    setListOpen(false)
  }
  const step = (amount) => {
    const index = ids.indexOf(selected)
    setSelected(ids[(index + amount + ids.length) % ids.length])
  }
  const rotate = (dx, dy) => setRotation((current) => ({
    yaw: current.yaw + dx,
    pitch: THREE.MathUtils.clamp(current.pitch + dy, -0.8, 0.8),
  }))
  const changeRoom = (id) => {
    setRoomId(id)
    setRotation({ yaw: 0, pitch: 0 })
  }
  return (
    <main className={'app-shell'}>
      <header className={'topbar'}>
        <div>
          <p className={'eyebrow'}>AD 150-250 | Roman domestic world</p>
          <h1>Inside an Early Christian House Gathering</h1>
        </div>
        <div className={'progress-block'} aria-live={'polite'}>
          <span>Evidence collected</span>
          <strong>{found.length}/6</strong>
          <div className={'progress-track'} aria-hidden={true}>
            <i style={{ width: `${(found.length / 6) * 100}%` }} />
          </div>
        </div>
      </header>
      <nav className={'room-tabs'}>
        <button type={'button'} className={roomId === 'entry' ? 'active' : ''} onClick={() => changeRoom('entry')}>Entry Court</button>
        <button type={'button'} className={roomId === 'atrium' ? 'active' : ''} onClick={() => changeRoom('atrium')}>Atrium</button>
        <button type={'button'} className={roomId === 'gathering' ? 'active' : ''} onClick={() => changeRoom('gathering')}>Gathering Room</button>
        <button type={'button'} onClick={() => setTourOpen(true)}>Guided overview</button>
        <button type={'button'} onClick={() => setListOpen((open) => !open)}>Evidence list</button>
      </nav>
      {found.length === 6 ? (
        <section className={'completion'} role={'status'}>
          <strong>Exploration complete.</strong>
          <span>You found all six pieces of evidence. Return to Canvas when you are ready.</span>
        </section>
      ) : null}
      <section className={'learning-layout'}>
        <div className={'viewer'} tabIndex={0}
          aria-label={`Interactive 360-degree view: ${rooms[roomId].label}. Drag or use arrow keys to look around.`}
          onPointerDown={(event) => {
            drag.current = { x: event.clientX, y: event.clientY }
            event.currentTarget.setPointerCapture(event.pointerId)
          }}
          onPointerMove={(event) => {
            if (!drag.current) return
            const dx = event.clientX - drag.current.x
            const dy = event.clientY - drag.current.y
            drag.current = { x: event.clientX, y: event.clientY }
            rotate(-dx * 0.006, -dy * 0.004)
          }}
          onPointerUp={() => { drag.current = null }}
          onKeyDown={(event) => {
            const keys = { ArrowLeft: [0.12, 0], ArrowRight: [-0.12, 0], ArrowUp: [0, 0.1], ArrowDown: [0, -0.1] }
            if (keys[event.key]) {
              event.preventDefault()
              rotate(...keys[event.key])
            }
          }}>
          <Scene room={rooms[roomId]} rotation={rotation} found={found} discover={discover} />
          <div className={'viewer-shade'} aria-hidden={true} />
          <div className={'viewer-instructions'}>
            <strong>{rooms[roomId].label}</strong>
            <span>{rooms[roomId].prompt}</span>
          </div>
          <div className={'look-controls'}>
            <button type={'button'} onClick={() => rotate(0.18, 0)}>Look left</button>
            <button type={'button'} onClick={() => rotate(-0.18, 0)}>Look right</button>
            <button type={'button'} onClick={() => rotate(0, 0.14)}>Look up</button>
            <button type={'button'} onClick={() => rotate(0, -0.14)}>Look down</button>
          </div>
        </div>
        <aside className={`evidence-rail ${listOpen ? 'is-open' : ''}`}>
          <div className={'rail-heading'}>
            <p className={'eyebrow'}>Field notebook</p>
            <h2>Evidence discovered</h2>
            <p>Select any item to investigate or review it.</p>
          </div>
          <ol>{ids.map((id, index) => (
            <li key={id}>
              <button type={'button'} onClick={() => openFromList(id)}>
                <span>{found.includes(id) ? 'OK' : index + 1}</span>
                <div>
                  <strong>{evidence[id].title}</strong>
                  <small>{found.includes(id) ? 'Collected Â· review evidence' : `Investigate in ${rooms[evidence[id].room].label}`}</small>
                </div>
              </button>
            </li>
          ))}</ol>
        </aside>
      </section>
      <footer>
        <span>Drag, swipe, use the controls, or press the keyboard arrow keys.</span>
        <button type={'button'} onClick={() => {
          setFound([])
          setSelected(null)
          localStorage.removeItem('house-evidence')
        }}>Reset exploration</button>
      </footer>
      {selected ? <EvidenceDialog id={selected} close={() => setSelected(null)} step={step} /> : null}
      {tourOpen ? (
        <div className={'dialog-backdrop'}>
          <section className={'tour-dialog'} role={'dialog'} aria-modal={true}>
            <button className={'dialog-close'} type={'button'} onClick={() => setTourOpen(false)}>x</button>
            <h2>Guided overview</h2>
            <p>Watch a brief orientation, then return to investigate the evidence yourself.</p>
            <video controls preload={'metadata'} poster={evidence.meal.image}>
              <source src={asset('video/guided-overview.mp4')} type={'video/mp4'} />
            </video>
          </section>
        </div>
      ) : null}
    </main>
  )
}

export default App
