// Guarded local storage for the notebook (architecture §8).
// Never touches the legacy `house-evidence` key and never calls clear().

import { parseEnvelopeText } from '../state/notebookSchema.js'

export const STORAGE_KEY = 'at-the-threshold:notebook:v1'

/** Returns the browser storage object, or null when access itself throws or is absent. */
export function getStorage() {
  try {
    const storage = globalThis.localStorage
    return storage ?? null
  } catch {
    return null
  }
}

/**
 * Read the stored notebook.
 * status: 'empty' | 'loaded' | 'unavailable' | 'unreadable'
 * For 'unreadable', `raw` holds the original stored text so the learner can download it.
 */
export function loadNotebook(storage = getStorage()) {
  if (!storage) return { status: 'unavailable', message: 'This browser is not allowing the page to save notes.' }
  let raw
  try {
    raw = storage.getItem(STORAGE_KEY)
  } catch {
    return { status: 'unavailable', message: 'This browser is not allowing the page to read saved notes.' }
  }
  if (raw === null) return { status: 'empty' }
  const result = parseEnvelopeText(raw)
  if (result.ok) return { status: 'loaded', state: result.state, raw }
  return { status: 'unreadable', raw, code: result.code, message: result.message }
}

export function readRaw(storage = getStorage()) {
  try {
    return storage ? storage.getItem(STORAGE_KEY) : null
  } catch {
    return null
  }
}

/** Write the notebook. Resolves only on a completed setItem call. */
export function saveNotebook(state, storage = getStorage()) {
  if (!storage) return { ok: false, reason: 'unavailable' }
  const serialized = JSON.stringify(state)
  try {
    storage.setItem(STORAGE_KEY, serialized)
    return { ok: true, serialized }
  } catch (error) {
    const quota = error && (error.name === 'QuotaExceededError' || error.code === 22 || error.code === 1014)
    return { ok: false, reason: quota ? 'full' : 'denied' }
  }
}

export function removeNotebook(storage = getStorage()) {
  if (!storage) return { ok: false }
  try {
    storage.removeItem(STORAGE_KEY)
    return { ok: storage.getItem(STORAGE_KEY) === null }
  } catch {
    return { ok: false }
  }
}
