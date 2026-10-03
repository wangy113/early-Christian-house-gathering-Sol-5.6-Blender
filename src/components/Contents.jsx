import { useState } from 'react'
import { experience } from '../content/experience.js'
import { encounters } from '../content/encounters.js'
import { encounterHash } from '../lib/routes.js'

const wide = () => typeof window.matchMedia === 'function' && window.matchMedia('(min-width: 60rem)').matches

export function Contents({ route, state }) {
  const [open, setOpen] = useState(wide)
  const current = (hash) => (route.hash === hash ? 'page' : undefined)
  return (
    <nav className={'contents'} aria-labelledby={'contents-heading'}>
      <details open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
        <summary id={'contents-heading'}>Contents</summary>
        <ol className={'contents-list'}>
          <li><a href={'#/start'} aria-current={current('#/start')}>Start</a></li>
          {experience.order.map((id) => {
            const entry = state.entries[id]
            const status = [entry.visited ? 'visited' : null, entry.sortRevealed ? 'sorted' : null].filter(Boolean).join(' · ')
            return (
              <li key={id}>
                <a href={encounterHash(id)} aria-current={current(encounterHash(id))}>
                  <span className={'contents-number'}>{encounters[id].number}</span>
                  <span>
                    {encounters[id].title}
                    {status ? <small>{status}</small> : null}
                  </span>
                </a>
              </li>
            )
          })}
          <li><a href={'#/notebook'} aria-current={current('#/notebook')}>My reconstruction</a></li>
          <li><a href={'#/closing'} aria-current={current('#/closing')}>Look back</a></li>
        </ol>
      </details>
    </nav>
  )
}
