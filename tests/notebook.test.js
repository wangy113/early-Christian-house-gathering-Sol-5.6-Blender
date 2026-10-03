import { test } from 'node:test'
import assert from 'node:assert/strict'
import { notebookReducer } from '../src/state/notebookReducer.js'
import { freshEnvelope, parseEnvelope, parseEnvelopeText, progress } from '../src/state/notebookSchema.js'
import { STORAGE_KEY, loadNotebook, removeNotebook, saveNotebook } from '../src/lib/notebookStorage.js'
import { backupToJson, buildBoard, parseBackup, reconstructionToText } from '../src/lib/notebookExport.js'

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

test('visits, hotspots, frame questions and sources are recorded once', () => {
  const state = run([
    { type: 'VISIT_ENCOUNTER', id: 'meal' },
    { type: 'VISIT_ENCOUNTER', id: 'meal' },
    { type: 'OPEN_HOTSPOT', id: 'meal', hotspotId: 'bread' },
    { type: 'OPEN_HOTSPOT', id: 'meal', hotspotId: 'bread' },
    { type: 'OPEN_HOTSPOT', id: 'meal', hotspotId: 'roll' },
    { type: 'OPEN_FRAME_QUESTION', id: 'meal', frameId: 'late' },
    { type: 'OPEN_FRAME_QUESTION', id: 'meal', frameId: 'nope' },
    { type: 'OPEN_SOURCE', id: 'meal', sourceId: 'S2' },
    { type: 'OPEN_SOURCE', id: 'meal', sourceId: 'S5' },
    { type: 'VISIT_ENCOUNTER', id: 'nope' },
  ])
  const entry = state.entries.meal
  assert.equal(entry.visited, true)
  assert.deepEqual(entry.hotspotsOpened, ['bread'])
  assert.deepEqual(entry.outsideOpened, ['late'])
  assert.deepEqual(entry.sourceIdsOpened, ['S2'])
  assert.deepEqual(progress(state), { visitedCount: 1, sortedCount: 0, total: 6 })
})

test('first recommendation is captured once and never overwritten', () => {
  let state = run([
    { type: 'CHOOSE', id: 'meal', choiceId: 'wait' },
    { type: 'REVEAL_PERSPECTIVE', id: 'meal', capturedAt: '2026-10-03T18:00:00.000Z' },
  ])
  const snapshot = state.entries.meal.firstSnapshot
  assert.deepEqual(snapshot, { choiceId: 'wait', capturedAt: '2026-10-03T18:00:00.000Z' })
  state = run([
    { type: 'CHOOSE', id: 'meal', choiceId: 'reserve' },
    { type: 'REVEAL_PERSPECTIVE', id: 'meal', capturedAt: '2027-01-01T00:00:00.000Z' },
    { type: 'CHOOSE', id: 'meal', choiceId: 'unsure' },
  ], state)
  assert.deepEqual(state.entries.meal.firstSnapshot, snapshot)
  assert.equal(state.entries.meal.choiceId, 'wait')
  assert.equal(state.entries.meal.revisedChoiceId, 'unsure')
})

test('a reveal without a choice records an empty first recommendation', () => {
  const state = run([{ type: 'REVEAL_PERSPECTIVE', id: 'letter', capturedAt: '2026-10-03T18:00:00.000Z' }])
  assert.equal(state.entries.letter.firstSnapshot.choiceId, null)
})

test('brief encounters keep a single editable choice', () => {
  const state = run([
    { type: 'CHOOSE', id: 'pressure', choiceId: 'raid' },
    { type: 'REVEAL_PERSPECTIVE', id: 'pressure' },
    { type: 'CHOOSE', id: 'pressure', choiceId: 'context' },
  ])
  assert.equal(state.entries.pressure.firstSnapshot, null)
  assert.equal(state.entries.pressure.choiceId, 'context')
})

test('verdicts and sorting accept only known values and can be changed', () => {
  let state = run([
    { type: 'SET_VERDICT', id: 'meal', verdictId: 'partly' },
    { type: 'SET_VERDICT', id: 'meal', verdictId: 'maybe' },
    { type: 'SORT_STATEMENT', id: 'meal', statementId: 'equal', place: 'picture' },
    { type: 'SORT_STATEMENT', id: 'meal', statementId: 'equal', place: 'nowhere' },
    { type: 'SORT_STATEMENT', id: 'meal', statementId: 'phoebe', place: 'source' },
  ])
  assert.equal(state.entries.meal.verdictId, 'partly')
  assert.deepEqual(state.entries.meal.sorts, { equal: 'picture' })
  state = run([
    { type: 'SORT_STATEMENT', id: 'meal', statementId: 'equal', place: 'unestablished' },
    { type: 'REVEAL_SORT', id: 'meal' },
    { type: 'REVEAL_VERDICT', id: 'meal' },
  ], state)
  assert.deepEqual(state.entries.meal.sorts, { equal: 'unestablished' })
  assert.equal(progress(state).sortedCount, 1)
})

test('the reconstruction board groups by the learner’s placement and notes the historian’s', () => {
  const state = run([
    { type: 'SORT_STATEMENT', id: 'meal', statementId: 'sharing', place: 'picture' },
    { type: 'SORT_STATEMENT', id: 'meal', statementId: 'equal', place: 'picture' },
    { type: 'SORT_STATEMENT', id: 'letter', statementId: 'phoebe', place: 'source' },
    { type: 'REVEAL_SORT', id: 'meal' },
  ])
  const board = buildBoard(state)
  assert.deepEqual(board.picture.map((item) => item.statementId), ['sharing', 'equal'])
  assert.equal(board.picture[1].historian, 'unestablished')
  assert.equal(board.source[0].historian, null, 'not revealed for E1 yet')
  assert.equal(board.unestablished.length, 0)
})

test('storage: empty, loaded, malformed, null, old v1, future, other-experience values', () => {
  assert.equal(loadNotebook(memoryStorage()).status, 'empty')
  assert.equal(loadNotebook(null).status, 'unavailable')
  const good = run([{ type: 'VISIT_ENCOUNTER', id: 'meal' }])
  const loaded = loadNotebook(memoryStorage({ [STORAGE_KEY]: JSON.stringify(good) }))
  assert.equal(loaded.status, 'loaded')
  assert.equal(loaded.state.entries.meal.visited, true)
  const v1 = JSON.stringify({ schemaVersion: 1, experienceId: 'at-the-threshold', contentVersion: 'threshold-1', openingThought: 'kept for recovery' })
  for (const raw of ['{not json', 'null', '[]', '42', v1, JSON.stringify({ ...good, schemaVersion: 9 }), JSON.stringify({ ...good, experienceId: 'other' }), JSON.stringify({ ...good, contentVersion: 'threshold-0' })]) {
    const result = loadNotebook(memoryStorage({ [STORAGE_KEY]: raw }))
    assert.equal(result.status, 'unreadable', raw)
    assert.equal(result.raw, raw, 'raw value is kept for recovery download')
  }
  assert.equal(loadNotebook({ getItem() { throw new Error('denied') } }).status, 'unavailable')
})

test('storage: denied and quota failures are reported, not thrown', () => {
  const quota = { setItem() { const e = new Error('full'); e.name = 'QuotaExceededError'; throw e } }
  assert.deepEqual(saveNotebook(freshEnvelope(), quota), { ok: false, reason: 'full' })
  assert.deepEqual(saveNotebook(freshEnvelope(), { setItem() { throw new Error('SecurityError') } }), { ok: false, reason: 'denied' })
  assert.equal(saveNotebook(freshEnvelope(), null).ok, false)
})

test('storage: reset removes only this experience key', () => {
  const storage = memoryStorage({ [STORAGE_KEY]: '{}', 'house-evidence': '["meal"]', other: 'x' })
  assert.ok(removeNotebook(storage).ok)
  assert.deepEqual([...storage.data.keys()].sort(), ['house-evidence', 'other'])
  assert.equal(removeNotebook({ removeItem() { throw new Error('no') }, getItem: () => '{}' }).ok, false)
})

test('schema rejects wrong types and unknown ids; builds a whitelisted object', () => {
  const base = JSON.parse(JSON.stringify(freshEnvelope()))
  const withEntry = (patch) => ({ ...base, entries: { ...base.entries, meal: { ...base.entries.meal, ...patch } } })
  assert.equal(parseEnvelope(withEntry({ choiceId: 'raid' })).ok, false)
  assert.equal(parseEnvelope(withEntry({ visited: 'yes' })).ok, false)
  assert.equal(parseEnvelope(withEntry({ hotspotsOpened: ['roll'] })).ok, false)
  assert.equal(parseEnvelope(withEntry({ sorts: { equal: 'maybe' } })).ok, false)
  assert.equal(parseEnvelope(withEntry({ verdictId: 'guilty' })).ok, false)
  assert.equal(parseEnvelope({ ...base, entries: { ...base.entries, extra: {} } }).ok, false)
  const result = parseEnvelope({ ...base, injected: '<script>', entries: { ...base.entries, meal: { ...base.entries.meal, note: 'old text' } } })
  assert.ok(result.ok)
  assert.equal('injected' in result.state, false)
  assert.equal('note' in result.state.entries.meal, false)
})

test('hiding the numbered details is a saved preference', () => {
  const state = run([{ type: 'SET_MARKERS_HIDDEN', hidden: true }])
  assert.equal(state.preferences.hideMarkers, true)
  assert.equal(run([{ type: 'SET_MARKERS_HIDDEN', hidden: true }], state), state)
  assert.equal(parseEnvelope(JSON.parse(JSON.stringify(state))).state.preferences.hideMarkers, true)
  assert.equal(parseEnvelope({ ...JSON.parse(JSON.stringify(state)), preferences: { hideMarkers: 'yes' } }).ok, false)
})

test('backup JSON roundtrip preserves supported data', () => {
  const state = run([
    { type: 'VISIT_ENCOUNTER', id: 'meal' },
    { type: 'OPEN_HOTSPOT', id: 'meal', hotspotId: 'table' },
    { type: 'OPEN_FRAME_QUESTION', id: 'meal', frameId: 'cooked' },
    { type: 'CHOOSE', id: 'meal', choiceId: 'separate' },
    { type: 'REVEAL_PERSPECTIVE', id: 'meal', capturedAt: '2026-10-03T18:00:00.000Z' },
    { type: 'CHOOSE', id: 'meal', choiceId: 'wait' },
    { type: 'SET_VERDICT', id: 'meal', verdictId: 'unestablished' },
    { type: 'SORT_STATEMENT', id: 'meal', statementId: 'hungry', place: 'source' },
    { type: 'OPEN_SOURCE', id: 'meal', sourceId: 'S2' },
    { type: 'SET_ACCESS_PREFERENCE', descriptionsOnly: true },
    { type: 'SET_MARKERS_HIDDEN', hidden: true },
  ])
  const restored = parseBackup(backupToJson(state))
  assert.ok(restored.ok)
  assert.deepEqual(restored.state, state)
})

test('import rejects oversized and malformed files', () => {
  assert.equal(parseBackup('{}', 1024 * 1024 + 1).code, 'too-large')
  assert.equal(parseBackup('nope').ok, false)
  assert.equal(parseEnvelopeText(undefined).ok, false)
})

test('export contains the board, decisions, rulings and sources, with no scoring language', () => {
  const state = run([
    { type: 'VISIT_ENCOUNTER', id: 'meal' },
    { type: 'CHOOSE', id: 'meal', choiceId: 'wait' },
    { type: 'REVEAL_PERSPECTIVE', id: 'meal', capturedAt: '2026-10-03T18:00:00.000Z' },
    { type: 'CHOOSE', id: 'meal', choiceId: 'unsure' },
    { type: 'SET_VERDICT', id: 'meal', verdictId: 'partly' },
    { type: 'SORT_STATEMENT', id: 'meal', statementId: 'equal', place: 'picture' },
    { type: 'REVEAL_SORT', id: 'meal' },
  ])
  const md = reconstructionToText(state)
  assert.match(md, /### In the picture\n\n- E2: Everyone at this gathering was treated as an equal\. \(a historian would place this under: Not established\)/)
  assert.match(md, /First recommendation: Wait for those who have not arrived\./)
  assert.match(md, /Recommendation now: Still unsure/)
  assert.match(md, /Ruling: Was everyone at this table equally welcome\?: Partly supported/)
  assert.match(md, /1 Corinthians 11:17–34 <https:\/\//)
  assert.ok(!/rubric|grade|submit|canvas|score|points/i.test(md))
  assert.match(reconstructionToText(state, { format: 'text' }), /Nothing sorted here yet\./)
})
