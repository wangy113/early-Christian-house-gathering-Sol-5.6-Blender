// Pure notebook transitions (architecture §7). Timestamps arrive through
// actions; persistence happens in effects (useNotebook), never here.

import { experience } from '../content/experience.js'
import { encounters } from '../content/encounters.js'
import {
  ENTRY_TEXT_FIELDS,
  MAX_FIELD_LENGTH,
  freshEnvelope,
  isChoiceFor,
  isRevisedChoiceFor,
} from './notebookSchema.js'

const known = (id) => experience.order.includes(id)

function updateEntry(state, id, patch, now) {
  return {
    ...state,
    updatedAt: now ?? state.updatedAt,
    entries: { ...state.entries, [id]: { ...state.entries[id], ...patch } },
  }
}

const fits = (value) => typeof value === 'string' && value.length <= MAX_FIELD_LENGTH

export function notebookReducer(state, action) {
  switch (action.type) {
    case 'VISIT_ENCOUNTER': {
      if (!known(action.id) || state.entries[action.id].visited) return state
      return updateEntry(state, action.id, { visited: true }, action.now)
    }

    case 'EDIT_FIELD': {
      const { id, field, value } = action
      if (!known(id) || !ENTRY_TEXT_FIELDS.includes(field) || !fits(value)) return state
      if (state.entries[id][field] === value) return state
      return updateEntry(state, id, { [field]: value }, action.now)
    }

    case 'CHOOSE': {
      const { id, choiceId } = action
      if (!known(id)) return state
      const entry = state.entries[id]
      const captured = encounters[id].kind === 'deep' && entry.firstSnapshot !== null
      if (captured) {
        if (choiceId !== null && !isRevisedChoiceFor(id, choiceId)) return state
        return updateEntry(state, id, { revisedChoiceId: choiceId }, action.now)
      }
      if (choiceId !== null && !isChoiceFor(id, choiceId)) return state
      return updateEntry(state, id, { choiceId }, action.now)
    }

    case 'REVEAL_PERSPECTIVE': {
      const { id } = action
      if (!known(id)) return state
      const entry = state.entries[id]
      const patch = { perspectivesRevealed: true }
      if (encounters[id].kind === 'deep' && entry.firstSnapshot === null) {
        patch.firstSnapshot = {
          observation: entry.observation,
          assumption: entry.assumption,
          choiceId: entry.choiceId,
          reason: entry.reason,
          capturedAt: action.capturedAt ?? null,
        }
      }
      if (entry.perspectivesRevealed && !patch.firstSnapshot) return state
      return updateEntry(state, id, patch, action.capturedAt)
    }

    case 'OPEN_SOURCE': {
      const { id, sourceId } = action
      if (!known(id) || !encounters[id].sourceIds.includes(sourceId)) return state
      const opened = state.entries[id].sourceIdsOpened
      if (opened.includes(sourceId)) return state
      return updateEntry(state, id, { sourceIdsOpened: [...opened, sourceId] }, action.now)
    }

    case 'EDIT_OPENING':
    case 'EDIT_CLOSING': {
      if (!fits(action.value)) return state
      const key = action.type === 'EDIT_OPENING' ? 'openingThought' : 'closingThought'
      if (state[key] === action.value) return state
      return { ...state, [key]: action.value, updatedAt: action.now ?? state.updatedAt }
    }

    case 'SET_ACCESS_PREFERENCE': {
      const descriptionsOnly = Boolean(action.descriptionsOnly)
      if (state.preferences.descriptionsOnly === descriptionsOnly) return state
      return { ...state, preferences: { ...state.preferences, descriptionsOnly } }
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
