// Whitelisted hash routes (architecture §4). Student writing never enters the URL.

import { experience } from '../content/experience.js'

export const START = { name: 'start', hash: '#/start' }

export function parseHash(hash) {
  const value = typeof hash === 'string' ? hash : ''
  if (value === '' || value === '#' || value === '#/') return { ...START, empty: true }
  if (value === '#/start') return START
  if (value === '#/notebook') return { name: 'notebook', hash: value }
  if (value === '#/closing') return { name: 'closing', hash: value }
  const match = /^#\/encounter\/([a-z-]+)$/.exec(value)
  if (match && experience.order.includes(match[1])) return { name: 'encounter', id: match[1], hash: value }
  return { name: 'not-found', hash: value }
}

export const encounterHash = (id) => `#/encounter/${id}`

/** Previous/next destinations in the recommended order. */
export function neighbours(id) {
  const index = experience.order.indexOf(id)
  const previous = index > 0 ? encounterHash(experience.order[index - 1]) : '#/start'
  const next = index < experience.order.length - 1 ? encounterHash(experience.order[index + 1]) : '#/closing'
  return { previous, next, isLast: index === experience.order.length - 1 }
}
