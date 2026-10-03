// "My reconstruction": the board, the plain-text/Markdown export, and backups.
// Everything works from in-memory state, so unsaved changes are included.

import { experience } from '../content/experience.js'
import { encounters, sortPlaces } from '../content/encounters.js'
import { sources } from '../content/sources.js'
import { MAX_IMPORT_BYTES, SORT_PLACES, UNSURE, parseEnvelopeText } from '../state/notebookSchema.js'

export function choiceLabel(encounterId, choiceId) {
  if (choiceId === null || choiceId === undefined) return null
  if (choiceId === UNSURE) return 'Still unsure'
  return encounters[encounterId].choices.find((choice) => choice.id === choiceId)?.label ?? null
}

export function verdictLabel(encounterId, verdictId) {
  return encounters[encounterId].verdicts.find((verdict) => verdict.id === verdictId)?.label ?? null
}

/**
 * The learner's sorted statements grouped by where the learner placed them.
 * Each item notes whether the historian's placement has been revealed and differs.
 */
export function buildBoard(state) {
  const board = Object.fromEntries(SORT_PLACES.map((place) => [place, []]))
  for (const id of experience.order) {
    const entry = state.entries[id]
    for (const statement of encounters[id].sort) {
      const placed = entry.sorts[statement.id]
      if (!placed) continue
      board[placed].push({
        encounterId: id,
        number: encounters[id].number,
        statementId: statement.id,
        text: statement.text,
        historian: entry.sortRevealed ? statement.answer : null,
      })
    }
  }
  return board
}

/** One encounter's record as display-ready lines (no learner prose exists). */
export function encounterSummary(state, id) {
  const item = encounters[id]
  const entry = state.entries[id]
  const lines = []
  lines.push(['Details explored', `${entry.hotspotsOpened.length} of ${item.hotspots.length}`])
  lines.push(['Outside-the-frame questions opened', `${entry.outsideOpened.length} of ${item.outsideFrame.length}`])
  if (item.kind === 'deep' && entry.firstSnapshot) {
    lines.push(['First recommendation', choiceLabel(id, entry.firstSnapshot.choiceId) ?? 'No choice made'])
    lines.push(['Recommendation now', choiceLabel(id, entry.revisedChoiceId) ?? 'Not revisited'])
  } else {
    lines.push([item.kind === 'deep' ? 'Recommendation' : 'Choice', choiceLabel(id, entry.choiceId) ?? 'No choice made'])
  }
  lines.push([`Ruling: ${item.caseQuestion}`, verdictLabel(id, entry.verdictId) ?? 'No ruling yet'])
  return lines
}

/** The reconstruction as Markdown (format 'markdown') or plain text (format 'text'). */
export function reconstructionToText(state, { format = 'markdown', exportedAt = null } = {}) {
  const md = format === 'markdown'
  const out = []
  const heading = (level, text) =>
    out.push(md ? `${'#'.repeat(level)} ${text}\n` : `${text}\n${(level === 1 ? '=' : '-').repeat(text.length)}\n`)
  const bullet = (text) => out.push(`${md ? '-' : '*'} ${text}`)

  heading(1, `${experience.shortTitle}: my reconstruction`)
  out.push(`${experience.title}\n`)
  out.push(`Setting: ${experience.setting} The images are modern reconstructions; the situations and voices are fictional.\n`)
  out.push(`Content version: ${experience.contentVersion}${exportedAt ? ` · Exported ${exportedAt}` : ''}\n`)

  heading(2, 'The gathering as I sorted it')
  const board = buildBoard(state)
  for (const place of SORT_PLACES) {
    heading(3, sortPlaces[place])
    if (!board[place].length) out.push('Nothing sorted here yet.')
    for (const item of board[place]) {
      const note = item.historian && item.historian !== place ? ` (a historian would place this under: ${sortPlaces[item.historian]})` : ''
      bullet(`${item.number}: ${item.text}${note}`)
    }
    out.push('')
  }

  heading(2, 'Picture by picture')
  for (const id of experience.order) {
    const item = encounters[id]
    heading(3, `${item.number}: ${item.title}`)
    out.push(`${state.entries[id].visited ? 'Visited' : 'Not visited'} · Image: ${item.image.originalPath} (modern reconstruction)`)
    for (const [label, value] of encounterSummary(state, id)) bullet(`${label}: ${value}`)
    out.push(`Sources for comparison: ${item.sourceIds.map((sourceId) => `${sources[sourceId].work} ${sources[sourceId].passage} <${sources[sourceId].url}>`).join('; ')}`)
    out.push('')
  }

  heading(2, 'Questions to carry forward')
  for (const question of experience.closing.questions) bullet(question)
  out.push('')
  return out.join('\n')
}

export function backupToJson(state) {
  return JSON.stringify(state, null, 2)
}

/** Validate an imported backup file's text without mutating anything. */
export function parseBackup(textValue, byteLength = new Blob([textValue]).size) {
  if (byteLength > MAX_IMPORT_BYTES) {
    return { ok: false, code: 'too-large', message: 'That file is larger than 1 MiB, so it is not a backup from this experience.' }
  }
  return parseEnvelopeText(textValue)
}

export function downloadText(filename, contents, type) {
  const blob = new Blob([contents], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Resolves true when the clipboard accepted the text; false means show the selectable fallback. */
export async function copyText(contents) {
  try {
    if (!navigator.clipboard?.writeText) return false
    await navigator.clipboard.writeText(contents)
    return true
  } catch {
    return false
  }
}

export const fileStamp = (date = new Date()) => date.toISOString().slice(0, 10)
