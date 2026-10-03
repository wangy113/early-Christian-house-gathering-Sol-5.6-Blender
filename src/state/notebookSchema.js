// Versioned notebook envelope (architecture §7–8).
// Every load and import passes through parseEnvelope, which builds a new
// whitelisted object instead of trusting arbitrary keys.

import { experience } from '../content/experience.js'
import { encounters } from '../content/encounters.js'
import { sources } from '../content/sources.js'

export const SCHEMA_VERSION = 1
export const MAX_FIELD_LENGTH = 20000
export const MAX_IMPORT_BYTES = 1024 * 1024
export const UNSURE = 'unsure'

export const ENTRY_TEXT_FIELDS = ['observation', 'assumption', 'reason', 'currentThinking', 'note']

export function freshEntry() {
  return {
    visited: false,
    observation: '',
    assumption: '',
    choiceId: null,
    reason: '',
    firstSnapshot: null,
    perspectivesRevealed: false,
    revisedChoiceId: null,
    currentThinking: '',
    note: '',
    sourceIdsOpened: [],
  }
}

export function freshEnvelope(now = null) {
  return {
    schemaVersion: SCHEMA_VERSION,
    experienceId: experience.id,
    contentVersion: experience.contentVersion,
    updatedAt: now,
    openingThought: '',
    closingThought: '',
    preferences: { descriptionsOnly: false },
    entries: Object.fromEntries(experience.order.map((id) => [id, freshEntry()])),
  }
}

export const isChoiceFor = (encounterId, choiceId) =>
  Boolean(encounters[encounterId]?.choices.some((choice) => choice.id === choiceId))

export const isRevisedChoiceFor = (encounterId, choiceId) =>
  choiceId === UNSURE || isChoiceFor(encounterId, choiceId)

class InvalidEnvelope extends Error {}

function text(value, where) {
  if (value === undefined) return ''
  if (typeof value !== 'string') throw new InvalidEnvelope(`${where} must be text`)
  if (value.length > MAX_FIELD_LENGTH) {
    throw new InvalidEnvelope(`${where} is longer than ${MAX_FIELD_LENGTH.toLocaleString('en-US')} characters`)
  }
  return value
}

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

function choice(value, encounterId, where, allowUnsure = false) {
  if (value === undefined || value === null) return null
  const valid = allowUnsure ? isRevisedChoiceFor(encounterId, value) : isChoiceFor(encounterId, value)
  if (!valid) throw new InvalidEnvelope(`${where} is not a known choice`)
  return value
}

function parseEntry(raw, id) {
  const where = `entry "${id}"`
  if (raw === undefined) return freshEntry()
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new InvalidEnvelope(`${where} must be an object`)
  const entry = freshEntry()
  entry.visited = bool(raw.visited, `${where}.visited`)
  entry.perspectivesRevealed = bool(raw.perspectivesRevealed, `${where}.perspectivesRevealed`)
  for (const field of ENTRY_TEXT_FIELDS) entry[field] = text(raw[field], `${where}.${field}`)
  entry.choiceId = choice(raw.choiceId, id, `${where}.choiceId`)
  entry.revisedChoiceId = choice(raw.revisedChoiceId, id, `${where}.revisedChoiceId`, true)

  if (raw.sourceIdsOpened !== undefined) {
    if (!Array.isArray(raw.sourceIdsOpened)) throw new InvalidEnvelope(`${where}.sourceIdsOpened must be a list`)
    for (const sourceId of raw.sourceIdsOpened) {
      if (!sources[sourceId]) throw new InvalidEnvelope(`${where} lists unknown source "${sourceId}"`)
    }
    entry.sourceIdsOpened = [...new Set(raw.sourceIdsOpened)]
  }

  if (raw.firstSnapshot !== undefined && raw.firstSnapshot !== null) {
    const snap = raw.firstSnapshot
    if (typeof snap !== 'object' || Array.isArray(snap)) throw new InvalidEnvelope(`${where}.firstSnapshot must be an object`)
    entry.firstSnapshot = {
      observation: text(snap.observation, `${where}.firstSnapshot.observation`),
      assumption: text(snap.assumption, `${where}.firstSnapshot.assumption`),
      choiceId: choice(snap.choiceId, id, `${where}.firstSnapshot.choiceId`),
      reason: text(snap.reason, `${where}.firstSnapshot.reason`),
      capturedAt: nullableTimestamp(snap.capturedAt, `${where}.firstSnapshot.capturedAt`),
    }
  }
  return entry
}

/**
 * Validate an already-parsed value.
 * Returns { ok: true, state } or { ok: false, code, message }.
 * code: 'not-envelope' | 'other-experience' | 'unsupported-version' | 'incompatible-content' | 'invalid'
 */
export function parseEnvelope(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, code: 'not-envelope', message: 'This is not a notebook from this experience.' }
  }
  if (raw.experienceId !== experience.id) {
    return { ok: false, code: 'other-experience', message: 'This notebook belongs to a different activity.' }
  }
  if (raw.schemaVersion !== SCHEMA_VERSION) {
    return {
      ok: false,
      code: 'unsupported-version',
      message: `This notebook uses format version ${String(raw.schemaVersion)}, which this version of the experience cannot read.`,
    }
  }
  if (raw.contentVersion !== experience.contentVersion) {
    return {
      ok: false,
      code: 'incompatible-content',
      message: `This notebook was written for content version ${String(raw.contentVersion)}; this page uses ${experience.contentVersion}.`,
    }
  }
  try {
    const state = freshEnvelope()
    state.updatedAt = nullableTimestamp(raw.updatedAt, 'updatedAt')
    state.openingThought = text(raw.openingThought, 'openingThought')
    state.closingThought = text(raw.closingThought, 'closingThought')
    if (raw.preferences !== undefined) {
      if (!raw.preferences || typeof raw.preferences !== 'object') throw new InvalidEnvelope('preferences must be an object')
      state.preferences.descriptionsOnly = bool(raw.preferences.descriptionsOnly, 'preferences.descriptionsOnly')
    }
    if (raw.entries !== undefined && (typeof raw.entries !== 'object' || raw.entries === null || Array.isArray(raw.entries))) {
      throw new InvalidEnvelope('entries must be an object')
    }
    const rawEntries = raw.entries ?? {}
    for (const key of Object.keys(rawEntries)) {
      if (!experience.order.includes(key)) throw new InvalidEnvelope(`unknown encounter "${key}"`)
    }
    for (const id of experience.order) state.entries[id] = parseEntry(rawEntries[id], id)
    return { ok: true, state }
  } catch (error) {
    if (error instanceof InvalidEnvelope) return { ok: false, code: 'invalid', message: `The notebook could not be read: ${error.message}.` }
    throw error
  }
}

/** Parse JSON text (from storage or an imported file). */
export function parseEnvelopeText(textValue) {
  if (typeof textValue !== 'string') return { ok: false, code: 'not-envelope', message: 'No notebook data was found.' }
  let raw
  try {
    raw = JSON.parse(textValue)
  } catch {
    return { ok: false, code: 'malformed', message: 'The notebook data is not valid JSON.' }
  }
  return parseEnvelope(raw)
}

const hasText = (value) => typeof value === 'string' && value.trim().length > 0

export function entryHasNotes(entry) {
  return ENTRY_TEXT_FIELDS.some((field) => hasText(entry[field]))
}

/** Derived progress: never persisted, never a score (architecture §7). */
export function progress(state) {
  let visitedCount = 0
  let notesCount = 0
  for (const id of experience.order) {
    const entry = state.entries[id]
    if (entry?.visited) visitedCount += 1
    if (entry && entryHasNotes(entry)) notesCount += 1
  }
  return { visitedCount, notesCount, total: experience.order.length }
}
