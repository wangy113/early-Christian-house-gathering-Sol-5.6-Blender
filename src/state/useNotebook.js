// Notebook controller (architecture §7–8): reducer state plus honest,
// debounced persistence. React state updates immediately; storage writes
// follow ~300 ms later, or at once on flush (blur / in-app navigation).

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { notebookReducer } from './notebookReducer.js'
import { freshEnvelope, parseEnvelopeText, progress } from './notebookSchema.js'
import { STORAGE_KEY, getStorage, loadNotebook, readRaw, removeNotebook, saveNotebook } from '../lib/notebookStorage.js'

const DEBOUNCE_MS = 300

function initialStatus(boot) {
  if (boot.status === 'unavailable') return { kind: 'failed', reason: 'unavailable' }
  if (boot.status === 'unreadable') return { kind: 'suspended', reason: 'unreadable' }
  if (boot.status === 'loaded') return { kind: 'saved' }
  return { kind: 'idle' }
}

export function useNotebook() {
  // Hydration happens synchronously before the first render, so no write
  // effect can ever run against default state while saved work exists.
  const [boot] = useState(() => loadNotebook())
  const [state, rawDispatch] = useReducer(notebookReducer, boot, (b) => (b.status === 'loaded' ? b.state : freshEnvelope()))
  const [status, setStatus] = useState(() => initialStatus(boot))
  const [recovery, setRecovery] = useState(() =>
    boot.status === 'unreadable' ? { raw: boot.raw, message: boot.message } : null,
  )
  const [conflict, setConflict] = useState(false)

  const stateRef = useRef(state)
  const committed = useRef(JSON.stringify(state)) // last state written or loaded
  const known = useRef(boot.status === 'loaded' ? boot.raw : null) // last raw value we know is stored
  const suspended = useRef(boot.status === 'unreadable')
  const timer = useRef(null)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const writeNow = useCallback(() => {
    clearTimeout(timer.current)
    timer.current = null
    const current = stateRef.current
    const serialized = JSON.stringify(current)
    if (serialized === committed.current) return
    if (suspended.current) {
      setStatus((previous) => (previous.kind === 'suspended' ? previous : { kind: 'suspended', reason: 'conflict' }))
      return
    }
    // Re-read before writing: another tab may have changed the notebook.
    const stored = readRaw()
    if (getStorage() && stored !== known.current) {
      suspended.current = true
      setConflict(true)
      setStatus({ kind: 'suspended', reason: 'conflict' })
      return
    }
    const result = saveNotebook(current)
    if (result.ok) {
      known.current = result.serialized
      committed.current = serialized
      setStatus({ kind: 'saved' })
    } else {
      setStatus({ kind: 'failed', reason: result.reason })
    }
  }, [])

  // Schedule persistence after each real state change.
  useEffect(() => {
    if (JSON.stringify(state) === committed.current) return undefined
    if (suspended.current) {
      setStatus((previous) => (previous.kind === 'suspended' ? previous : { kind: 'suspended', reason: 'conflict' }))
      return undefined
    }
    setStatus((previous) => (previous.kind === 'failed' ? previous : { kind: 'pending' }))
    clearTimeout(timer.current)
    timer.current = setTimeout(writeNow, DEBOUNCE_MS)
    return undefined
  }, [state, writeNow])

  const flush = useCallback(() => {
    if (timer.current) writeNow()
  }, [writeNow])

  // Supplementary attempt on page exit; not relied upon.
  useEffect(() => {
    const onHide = () => flush()
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    window.addEventListener('pagehide', onHide)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('pagehide', onHide)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [flush])

  // Another tab changed the notebook: stop writing here until the learner decides.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== STORAGE_KEY && event.key !== null) return
      if (event.key === STORAGE_KEY && event.newValue === known.current) return
      clearTimeout(timer.current)
      timer.current = null
      suspended.current = true
      setConflict(true)
      setStatus({ kind: 'suspended', reason: 'conflict' })
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

  const dispatch = useCallback((action) => rawDispatch({ now: new Date().toISOString(), ...action }), [])

  /** Conflict: replace this tab's notebook with the stored version (after the learner exported). */
  const loadSaved = useCallback(() => {
    const raw = readRaw()
    if (raw === null) {
      known.current = null
      suspended.current = false
      setConflict(false)
      writeNow()
      return { ok: true }
    }
    const parsed = parseEnvelopeText(raw)
    if (!parsed.ok) {
      setRecovery({ raw, message: parsed.message })
      return parsed
    }
    clearTimeout(timer.current)
    timer.current = null
    known.current = raw
    committed.current = JSON.stringify(parsed.state)
    suspended.current = false
    setConflict(false)
    setStatus({ kind: 'saved' })
    rawDispatch({ type: 'RESTORE_VALIDATED_BACKUP', state: parsed.state })
    return { ok: true }
  }, [writeNow])

  /** Conflict: keep this tab's notebook and overwrite the stored version. */
  const keepThisTab = useCallback(() => {
    known.current = readRaw()
    suspended.current = false
    setConflict(false)
    committed.current = null
    writeNow()
  }, [writeNow])

  /** Unreadable stored data: the learner chose to begin fresh (after downloading it). */
  const beginFresh = useCallback(() => {
    known.current = readRaw()
    suspended.current = false
    setRecovery(null)
    committed.current = null
    writeNow()
  }, [writeNow])

  /** Replace the notebook with an already validated backup. */
  const restore = useCallback(
    (nextState) => {
      if (recovery && !conflict) {
        // Replacing unreadable stored data was an explicit, confirmed choice.
        known.current = readRaw()
        suspended.current = false
      }
      committed.current = null
      rawDispatch({ type: 'RESTORE_VALIDATED_BACKUP', state: nextState })
      setRecovery(null)
    },
    [recovery, conflict],
  )

  /** Remove this experience's saved notebook. Returns false (and keeps everything) on failure. */
  const reset = useCallback(() => {
    clearTimeout(timer.current)
    timer.current = null
    if (getStorage()) {
      const removed = removeNotebook()
      if (!removed.ok) {
        setStatus({ kind: 'failed', reason: 'reset' })
        return false
      }
    }
    known.current = null
    committed.current = JSON.stringify(freshEnvelope(null))
    suspended.current = false
    setConflict(false)
    setRecovery(null)
    setStatus({ kind: 'idle' })
    rawDispatch({ type: 'RESET_CONFIRMED', now: null })
    return true
  }, [])

  const counts = useMemo(() => progress(state), [state])

  return { state, dispatch, status, counts, flush, conflict, loadSaved, keepThisTab, recovery, beginFresh, restore, reset }
}
