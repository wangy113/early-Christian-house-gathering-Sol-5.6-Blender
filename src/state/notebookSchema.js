// Versioned envelope for what a learner explored, decided and sorted.
// Version 2 holds no free text: learners type nothing. Every load and import
// passes through parseEnvelope, which builds a new whitelisted object.

import { experience } from '../content/experience.js'
import { encounters } from '../content/encounters.js'
import { sources } from '../content/sources.js'

export const SCHEMA_VERSION = 2
export const MAX_IMPORT_BYTES = 1024 * 1024
export const UNSURE = 'unsure'
export const SORT_PLACES = ['picture', 'source', 'unestablished']
export const VERDICT_IDS = ['supported', 'partly', 'unestablished']

export function freshEntry() {
  return {
    visited: false,
    hotspotsOpened: [],
    outsideOpened: [],
    choiceId: null,
    firstSnapshot: null,
    perspectivesRevealed: false,
    revisedChoiceId: null,
    verdictId: null,
    verdictRevealed: false,
    sorts: {},
    sortRevealed: false,
    sourceIdsOpened: [],
  }
}

export function freshEnvelope(now = null) {
  return {
    schemaVersion: SCHEMA_VERSION,
    experienceId: experience.id,
    contentVersion: experience.contentVersion,
    updatedAt: now,
    preferences: { descriptionsOnly: false },
    entries: Object.fromEntries(experience.order.map((id) => [id, freshEntry()])),
  }
}

export const isChoiceFor = (encounterId, choiceId) =>
  Boolean(encounters[encounterId]?.choices.some((choice) => choice.id === choiceId))
export const isRevisedChoiceFor = (encounterId, choiceId) => choiceId === UNSURE || isChoiceFor(encounterId, choiceId)
export const isHotspotFor = (encounterId, hotspotId) =>
  Boolean(encounters[encounterId]?.hotspots.some((spot) => spot.id === hotspotId))
export const isFrameQuestionFor = (encounterId, frameId) =>
  Boolean(encounters[encounterId]?.outsideFrame.some((entry) => entry.id === frameId))
export const isSortStatementFor = (encounterId, statementId) =>
  Boolean(encounters[encounterId]?.sort.some((statement) => statement.id === statementId))

class InvalidEnvelope extends Error {}

function bool(value, where) {
  if (value === undefined) return false
  if (typeof value !== 'boolean') throw new InvalidEnvelope(`${where} must be true or false`)
  return value
}

function nullableTimestamp(value, where) {
  if (value === undefined || value === null) return null
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) throw new InvalidEnvelope(`${where} must be a date`)
  return value
}

function member(value, valid, where) {
  if (value === undefined || value === null) return null
  if (!valid(value)) throw new InvalidEnvelope(`${where} is not a known option`)
  return value
}

function idList(value, valid, where) {
  if (value === undefined) return []
  if (!Array.isArray(value)) throw new InvalidEnvelope(`${where} must be a list`)
  for (const item of value) if (!valid(item)) throw new InvalidEnvelope(`${where} lists an unknown item`)
  return [...new Set(value)]
}

function parseEntry(raw, id) {
  const where = `entry "${id}"`
  if (raw === undefined) return freshEntry()
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new InvalidEnvelope(`${where} must be an object`)
  const entry = freshEntry()
  entry.visited = bool(raw.visited, `${where}.visited`)
  entry.perspectivesRevealed = bool(raw.perspectivesRevealed, `${where}.perspectivesRevealed`)
  entry.verdictRevealed = bool(raw.verdictRevealed, `${where}.verdictRevealed`)
  entry.sortRevealed = bool(raw.sortRevealed, `${where}.sortRevealed`)
  entry.hotspotsOpened = idList(raw.hotspotsOpened, (h) => isHotspotFor(id, h), `${where}.hotspotsOpened`)
  entry.outsideOpened = idList(raw.outsideOpened, (f) => isFrameQuestionFor(id, f), `${where}.outsideOpened`)
  entry.sourceIdsOpened = idList(raw.sourceIdsOpened, (s) => Boolean(sources[s]), `${where}.sourceIdsOpened`)
  entry.choiceId = member(raw.choiceId, (c) => isChoiceFor(id, c), `${where}.choiceId`)
  entry.revisedChoiceId = member(raw.revisedChoiceId, (c) => isRevisedChoiceFor(id, c), `${where}.revisedChoiceId`)
  entry.verdictId = member(raw.verdictId, (v) => VERDICT_IDS.includes(v), `${where}.verdictId`)

  if (raw.sorts !== undefined) {
    if (!raw.sorts || typeof raw.sorts !== 'object' || Array.isArray(raw.sorts)) throw new InvalidEnvelope(`${where}.sorts must be an object`)
    for (const [statementId, place] of Object.entries(raw.sorts)) {
      if (!isSortStatementFor(id, statementId) || !SORT_PLACES.includes(place)) throw new InvalidEnvelope(`${where}.sorts has an unknown item`)
      entry.sorts[statementId] = place
    }
  }

  if (raw.firstSnapshot !== undefined && raw.firstSnapshot !== null) {
    const snap = raw.firstSnapshot
    if (typeof snap !== 'object' || Array.isArray(snap)) throw new InvalidEnvelope(`${where}.firstSnapshot must be an object`)
    entry.firstSnapshot = {
      choiceId: member(snap.choiceId, (c) => isChoiceFor(id, c), `${where}.firstSnapshot.choiceId`),
      capturedAt: nullableTimestamp(snap.capturedAt, `${where}.firstSnapshot.capturedAt`),
    }
  }
  return entry
}

/**
 * Validate an already-parsed value.
 * Returns { ok: true, state } or { ok: false, code, message }.
 */
export function parseEnvelope(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, code: 'not-envelope', message: 'This is not saved work from this experience.' }
  }
  if (raw.experienceId !== experience.id) {
    return { ok: false, code: 'other-experience', message: 'This file belongs to a different activity.' }
  }
  if (raw.schemaVersion !== SCHEMA_VERSION) {
    return {
      ok: false,
      code: 'unsupported-version',
      message: `This saved work uses format version ${String(raw.schemaVersion)}, which this version of the experience cannot read.`,
    }
  }
  if (raw.contentVersion !== experience.contentVersion) {
    return {
      ok: false,
      code: 'incompatible-content',
      message: `This saved work was made for content version ${String(raw.contentVersion)}; this page uses ${experience.contentVersion}.`,
    }
  }
  try {
    const state = freshEnvelope()
    state.updatedAt = nullableTimestamp(raw.updatedAt, 'updatedAt')
    if (raw.preferences !== undefined) {
      if (!raw.preferences || typeof raw.preferences !== 'object') throw new InvalidEnvelope('preferences must be an object')
      state.preferences.descriptionsOnly = bool(raw.preferences.descriptionsOnly, 'preferences.descriptionsOnly')
    }
    if (raw.entries !== undefined && (typeof raw.entries !== 'object' || raw.entries === null || Array.isArray(raw.entries))) {
      throw new InvalidEnvelope('entries must be an object')
    }
    const rawEntries = raw.entries ?? {}
    for (const key of Object.keys(rawEntries)) if (!experience.order.includes(key)) throw new InvalidEnvelope(`unknown encounter "${key}"`)
    for (const id of experience.order) state.entries[id] = parseEntry(rawEntries[id], id)
    return { ok: true, state }
  } catch (error) {
    if (error instanceof InvalidEnvelope) return { ok: false, code: 'invalid', message: `The saved work could not be read: ${error.message}.` }
    throw error
  }
}

/** Parse JSON text (from storage or an imported file). */
export function parseEnvelopeText(textValue) {
  if (typeof textValue !== 'string') return { ok: false, code: 'not-envelope', message: 'No saved work was found.' }
  let raw
  try {
    raw = JSON.parse(textValue)
  } catch {
    return { ok: false, code: 'malformed', message: 'The saved data is not valid JSON.' }
  }
  return parseEnvelope(raw)
}

export const entrySorted = (entry) => Object.keys(entry.sorts).length > 0

/** Derived progress: never persisted, never a score. */
export function progress(state) {
  let visitedCount = 0
  let sortedCount = 0
  for (const id of experience.order) {
    const entry = state.entries[id]
    if (entry?.visited) visitedCount += 1
    if (entry?.sortRevealed) sortedCount += 1
  }
  return { visitedCount, sortedCount, total: experience.order.length }
}
