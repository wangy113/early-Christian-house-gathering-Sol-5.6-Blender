// Pure transitions for exploring, deciding, ruling and sorting. Timestamps
// arrive through actions; persistence happens in effects (useNotebook).

import { experience } from '../content/experience.js'
import { encounters } from '../content/encounters.js'
import {
  SORT_PLACES,
  VERDICT_IDS,
  freshEnvelope,
  isChoiceFor,
  isFrameQuestionFor,
  isHotspotFor,
  isRevisedChoiceFor,
  isSortStatementFor,
} from './notebookSchema.js'

const known = (id) => experience.order.includes(id)

function updateEntry(state, id, patch, now) {
  return {
    ...state,
    updatedAt: now ?? state.updatedAt,
    entries: { ...state.entries, [id]: { ...state.entries[id], ...patch } },
  }
}

function addOnce(state, id, field, value, now) {
  const list = state.entries[id][field]
  if (list.includes(value)) return state
  return updateEntry(state, id, { [field]: [...list, value] }, now)
}

export function notebookReducer(state, action) {
  const { id } = action
  switch (action.type) {
    case 'VISIT_ENCOUNTER':
      if (!known(id) || state.entries[id].visited) return state
      return updateEntry(state, id, { visited: true }, action.now)

    case 'OPEN_HOTSPOT':
      if (!known(id) || !isHotspotFor(id, action.hotspotId)) return state
      return addOnce(state, id, 'hotspotsOpened', action.hotspotId, action.now)

    case 'OPEN_FRAME_QUESTION':
      if (!known(id) || !isFrameQuestionFor(id, action.frameId)) return state
      return addOnce(state, id, 'outsideOpened', action.frameId, action.now)

    case 'OPEN_SOURCE':
      if (!known(id) || !encounters[id].sourceIds.includes(action.sourceId)) return state
      return addOnce(state, id, 'sourceIdsOpened', action.sourceId, action.now)

    case 'CHOOSE': {
      if (!known(id)) return state
      const { choiceId } = action
      const entry = state.entries[id]
      if (encounters[id].kind === 'deep' && entry.firstSnapshot !== null) {
        if (choiceId !== null && !isRevisedChoiceFor(id, choiceId)) return state
        if (entry.revisedChoiceId === choiceId) return state
        return updateEntry(state, id, { revisedChoiceId: choiceId }, action.now)
      }
      if (choiceId !== null && !isChoiceFor(id, choiceId)) return state
      if (entry.choiceId === choiceId) return state
      return updateEntry(state, id, { choiceId }, action.now)
    }

    case 'REVEAL_PERSPECTIVE': {
      if (!known(id)) return state
      const entry = state.entries[id]
      const capture = encounters[id].kind === 'deep' && entry.firstSnapshot === null
      if (entry.perspectivesRevealed && !capture) return state
      const patch = { perspectivesRevealed: true }
      if (capture) patch.firstSnapshot = { choiceId: entry.choiceId, capturedAt: action.capturedAt ?? null }
      return updateEntry(state, id, patch, action.capturedAt ?? action.now)
    }

    case 'SET_VERDICT':
      if (!known(id)) return state
      if (action.verdictId !== null && !VERDICT_IDS.includes(action.verdictId)) return state
      if (state.entries[id].verdictId === action.verdictId) return state
      return updateEntry(state, id, { verdictId: action.verdictId }, action.now)

    case 'REVEAL_VERDICT':
      if (!known(id) || state.entries[id].verdictRevealed) return state
      return updateEntry(state, id, { verdictRevealed: true }, action.now)

    case 'SORT_STATEMENT': {
      if (!known(id) || !isSortStatementFor(id, action.statementId) || !SORT_PLACES.includes(action.place)) return state
      const sorts = state.entries[id].sorts
      if (sorts[action.statementId] === action.place) return state
      return updateEntry(state, id, { sorts: { ...sorts, [action.statementId]: action.place } }, action.now)
    }

    case 'REVEAL_SORT':
      if (!known(id) || state.entries[id].sortRevealed) return state
      return updateEntry(state, id, { sortRevealed: true }, action.now)

    case 'SET_ACCESS_PREFERENCE': {
      const descriptionsOnly = Boolean(action.descriptionsOnly)
      if (state.preferences.descriptionsOnly === descriptionsOnly) return state
      return { ...state, preferences: { ...state.preferences, descriptionsOnly } }
    }

    case 'SET_MARKERS_HIDDEN': {
      const hideMarkers = Boolean(action.hidden)
      if (state.preferences.hideMarkers === hideMarkers) return state
      return { ...state, preferences: { ...state.preferences, hideMarkers } }
    }

    case 'RESTORE_VALIDATED_BACKUP':
      // action.state must already have passed parseEnvelope.
      return action.state

    case 'RESET_CONFIRMED':
      return freshEnvelope(action.now ?? null)

    default:
      return state
  }
}
