import { test } from 'node:test'
import assert from 'node:assert/strict'
import { notebookReducer } from '../src/state/notebookReducer.js'
import { MAX_FIELD_LENGTH, freshEnvelope, parseEnvelope, parseEnvelopeText, progress } from '../src/state/notebookSchema.js'
import { STORAGE_KEY, loadNotebook, removeNotebook, saveNotebook } from '../src/lib/notebookStorage.js'
import { backupToJson, escapeMarkdown, notesToText, parseBackup } from '../src/lib/notebookExport.js'

const run = (actions, state = freshEnvelope()) => actions.reduce(notebookReducer, state)

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  }
}

test('visiting is idempotent and progress is derived', () => {
  const state = run([
    { type: 'VISIT_ENCOUNTER', id: 'meal' },
    { type: 'VISIT_ENCOUNTER', id: 'meal' },
    { type: 'VISIT_ENCOUNTER', id: 'nope' },
    { type: 'CHOOSE', id: 'reading', choiceId: 'repeat' },
    { type: 'OPEN_SOURCE', id: 'reading', sourceId: 'S1' },
  ])
  assert.deepEqual(progress(state), { visitedCount: 1, notesCount: 0, total: 6 })
  const noted = run([{ type: 'EDIT_FIELD', id: 'reading', field: 'note', value: '  ' }], state)
  assert.equal(progress(noted).notesCount, 0, 'whitespace is not a note')
  const real = run([{ type: 'EDIT_FIELD', id: 'reading', field: 'note', value: 'x' }], state)
  assert.equal(progress(real).notesCount, 1)
})

test('first snapshot is captured once and never overwritten', () => {
  let state = run([
    { type: 'EDIT_FIELD', id: 'meal', field: 'observation', value: 'bread' },
    { type: 'CHOOSE', id: 'meal', choiceId: 'wait' },
    { type: 'EDIT_FIELD', id: 'meal', field: 'reason', value: 'fairness' },
    { type: 'REVEAL_PERSPECTIVE', id: 'meal', capturedAt: '2026-10-03T18:00:00.000Z' },
  ])
  const snapshot = state.entries.meal.firstSnapshot
  assert.deepEqual(snapshot, { observation: 'bread', assumption: '', choiceId: 'wait', reason: 'fairness', capturedAt: '2026-10-03T18:00:00.000Z' })
  state = run([
    { type: 'CHOOSE', id: 'meal', choiceId: 'reserve' },
    { type: 'EDIT_FIELD', id: 'meal', field: 'currentThinking', value: 'changed' },
    { type: 'REVEAL_PERSPECTIVE', id: 'meal', capturedAt: '2027-01-01T00:00:00.000Z' },
    { type: 'CHOOSE', id: 'meal', choiceId: 'unsure' },
  ], state)
  assert.deepEqual(state.entries.meal.firstSnapshot, snapshot)
  assert.equal(state.entries.meal.choiceId, 'wait')
  assert.equal(state.entries.meal.revisedChoiceId, 'unsure')
})

test('a blank reveal records a blank snapshot', () => {
  const state = run([{ type: 'REVEAL_PERSPECTIVE', id: 'letter', capturedAt: '2026-10-03T18:00:00.000Z' }])
  assert.equal(state.entries.letter.firstSnapshot.choiceId, null)
  assert.equal(state.entries.letter.firstSnapshot.reason, '')
  assert.equal(progress(state).notesCount, 0)
})

test('brief encounters keep a single editable selection, no snapshot', () => {
  const state = run([
    { type: 'CHOOSE', id: 'pressure', choiceId: 'raid' },
    { type: 'REVEAL_PERSPECTIVE', id: 'pressure' },
    { type: 'CHOOSE', id: 'pressure', choiceId: 'context' },
  ])
  assert.equal(state.entries.pressure.firstSnapshot, null)
  assert.equal(state.entries.pressure.choiceId, 'context')
})

test('reducer rejects unknown fields, choices, sources and oversize text', () => {
  const start = freshEnvelope()
  const same = run([
    { type: 'EDIT_FIELD', id: 'meal', field: 'visited', value: 'x' },
    { type: 'EDIT_FIELD', id: 'meal', field: 'note', value: 'x'.repeat(MAX_FIELD_LENGTH + 1) },
    { type: 'CHOOSE', id: 'meal', choiceId: 'raid' },
    { type: 'CHOOSE', id: 'meal', choiceId: 'unsure' },
    { type: 'OPEN_SOURCE', id: 'meal', sourceId: 'S5' },
    { type: 'EDIT_OPENING', value: 7 },
  ], start)
  assert.equal(same, start)
})

test('storage: empty, loaded, malformed, null, future and other-experience values', () => {
  assert.equal(loadNotebook(memoryStorage()).status, 'empty')
  assert.equal(loadNotebook(null).status, 'unavailable')
  const good = run([{ type: 'EDIT_OPENING', value: 'hello' }])
  const loaded = loadNotebook(memoryStorage({ [STORAGE_KEY]: JSON.stringify(good) }))
  assert.equal(loaded.status, 'loaded')
  assert.equal(loaded.state.openingThought, 'hello')
  for (const raw of ['{not json', 'null', '[]', '42', JSON.stringify({ ...good, schemaVersion: 2 }), JSON.stringify({ ...good, experienceId: 'other' }), JSON.stringify({ ...good, contentVersion: 'threshold-0' })]) {
    const result = loadNotebook(memoryStorage({ [STORAGE_KEY]: raw }))
    assert.equal(result.status, 'unreadable', raw)
    assert.equal(result.raw, raw, 'raw value is kept for recovery download')
  }
  const throwing = { getItem() { throw new Error('denied') } }
  assert.equal(loadNotebook(throwing).status, 'unavailable')
})

test('storage: denied and quota failures are reported, not thrown', () => {
  const quota = { setItem() { const e = new Error('full'); e.name = 'QuotaExceededError'; throw e } }
  assert.deepEqual(saveNotebook(freshEnvelope(), quota), { ok: false, reason: 'full' })
  const denied = { setItem() { throw new Error('SecurityError') } }
  assert.deepEqual(saveNotebook(freshEnvelope(), denied), { ok: false, reason: 'denied' })
  assert.equal(saveNotebook(freshEnvelope(), null).ok, false)
})

test('storage: reset removes only this experience key', () => {
  const storage = memoryStorage({ [STORAGE_KEY]: '{}', 'house-evidence': '["meal"]', other: 'x' })
  assert.ok(removeNotebook(storage).ok)
  assert.deepEqual([...storage.data.keys()].sort(), ['house-evidence', 'other'])
  const stuck = { removeItem() { throw new Error('no') }, getItem: () => '{}' }
  assert.equal(removeNotebook(stuck).ok, false)
})

test('schema rejects wrong types and unknown keys; builds a whitelisted object', () => {
  const base = JSON.parse(JSON.stringify(freshEnvelope()))
  assert.equal(parseEnvelope({ ...base, openingThought: 5 }).ok, false)
  assert.equal(parseEnvelope({ ...base, entries: { ...base.entries, extra: {} } }).ok, false)
  assert.equal(parseEnvelope({ ...base, entries: { ...base.entries, meal: { ...base.entries.meal, choiceId: 'raid' } } }).ok, false)
  assert.equal(parseEnvelope({ ...base, entries: { ...base.entries, meal: { ...base.entries.meal, visited: 'yes' } } }).ok, false)
  const result = parseEnvelope({ ...base, injected: '<script>', entries: { ...base.entries, meal: { ...base.entries.meal, extra: 1 } } })
  assert.ok(result.ok)
  assert.equal('injected' in result.state, false)
  assert.equal('extra' in result.state.entries.meal, false)
})

test('backup JSON roundtrip preserves supported data', () => {
  const state = run([
    { type: 'EDIT_OPENING', value: 'shared risk' },
    { type: 'VISIT_ENCOUNTER', id: 'meal' },
    { type: 'EDIT_FIELD', id: 'meal', field: 'reason', value: 'first' },
    { type: 'CHOOSE', id: 'meal', choiceId: 'separate' },
    { type: 'REVEAL_PERSPECTIVE', id: 'meal', capturedAt: '2026-10-03T18:00:00.000Z' },
    { type: 'EDIT_FIELD', id: 'meal', field: 'currentThinking', value: 'now' },
    { type: 'OPEN_SOURCE', id: 'meal', sourceId: 'S2' },
    { type: 'SET_ACCESS_PREFERENCE', descriptionsOnly: true },
    { type: 'EDIT_CLOSING', value: 'qualify' },
  ])
  const restored = parseBackup(backupToJson(state))
  assert.ok(restored.ok)
  assert.deepEqual(restored.state, state)
})

test('import rejects oversized, malformed and oversize-field files', () => {
  assert.equal(parseBackup('{}', 1024 * 1024 + 1).code, 'too-large')
  assert.equal(parseBackup('nope').ok, false)
  const big = JSON.parse(JSON.stringify(freshEnvelope()))
  big.closingThought = 'x'.repeat(MAX_FIELD_LENGTH + 1)
  const result = parseEnvelopeText(JSON.stringify(big))
  assert.equal(result.ok, false)
  assert.match(result.message, /longer than/)
})

test('export includes first and current thinking, sources, and escapes learner text', () => {
  const state = run([
    { type: 'EDIT_OPENING', value: '# heading [link](http://x) <b>hi</b>' },
    { type: 'EDIT_FIELD', id: 'meal', field: 'reason', value: 'first reason' },
    { type: 'CHOOSE', id: 'meal', choiceId: 'wait' },
    { type: 'REVEAL_PERSPECTIVE', id: 'meal', capturedAt: '2026-10-03T18:00:00.000Z' },
    { type: 'EDIT_FIELD', id: 'meal', field: 'currentThinking', value: 'pending text' },
  ])
  const md = notesToText(state)
  assert.match(md, /First response/)
  assert.match(md, /> first reason/)
  assert.match(md, /> pending text/)
  assert.match(md, /Wait for those who have not arrived\./)
  assert.match(md, /S2: 1 Corinthians 11:17–34 — https:\/\//)
  assert.ok(md.includes('\\# heading \\[link\\](http://x) \\<b\\>hi\\</b\\>'))
  assert.ok(!md.includes('Closing'), 'blank closing thought is omitted')
  assert.ok(!/rubric|grade|submit|canvas|score/i.test(md))
  const text = notesToText(state, { format: 'text' })
  assert.match(text, /No note recorded\./)
})

test('escapeMarkdown neutralises list and heading starts', () => {
  assert.equal(escapeMarkdown('- item\n1. two\n## h'), '\\- item\n1\\. two\n\\## h')
})
