// Portable notes and backups (architecture §8). Works from the in-memory
// state, so pending (unsaved) text is always included.

import { experience } from '../content/experience.js'
import { encounters } from '../content/encounters.js'
import { sources } from '../content/sources.js'
import { MAX_IMPORT_BYTES, UNSURE, parseEnvelopeText } from '../state/notebookSchema.js'

const EMPTY = experience.notebook.empty

export function choiceLabel(encounterId, choiceId) {
  if (choiceId === null || choiceId === undefined) return null
  if (choiceId === UNSURE) return 'Still unsure'
  return encounters[encounterId].choices.find((choice) => choice.id === choiceId)?.label ?? null
}

const filled = (value) => typeof value === 'string' && value.trim().length > 0

// Escape learner text so a Markdown preview shows it literally and cannot
// produce links, emphasis, headings, or raw HTML.
export function escapeMarkdown(value) {
  return value
    .replace(/[\\`*_[\]<>|~&]/g, (char) => (char === '&' ? '&amp;' : `\\${char}`))
    .split('\n')
    .map((line) => line.replace(/^(\s*)([#+=-])/, '$1\\$2').replace(/^(\s*\d+)([.)])/, '$1\\$2'))
    .join('\n')
}

function learnerText(value, markdown) {
  if (!filled(value)) return markdown ? `_${EMPTY}_` : EMPTY
  if (!markdown) return value.trim()
  return escapeMarkdown(value.trim())
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n')
}

function field(label, value, markdown) {
  return markdown ? `**${label}**\n\n${learnerText(value, true)}\n` : `${label}:\n${learnerText(value, false)}\n`
}

function chosen(label, encounterId, choiceId, markdown) {
  const text = choiceLabel(encounterId, choiceId) ?? 'No choice selected.'
  return markdown ? `**${label}:** ${text}\n` : `${label}: ${text}\n`
}

/** Notes as Markdown (format 'markdown') or plain text (format 'text'). */
export function notesToText(state, { format = 'markdown', exportedAt = null } = {}) {
  const md = format === 'markdown'
  const out = []
  const heading = (level, text) => out.push(md ? `${'#'.repeat(level)} ${text}\n` : `${text}\n${(level === 1 ? '=' : '-').repeat(text.length)}\n`)

  heading(1, `${experience.shortTitle} — my notes`)
  out.push(`${experience.title}\n`)
  out.push(`Setting: ${experience.setting} The images are modern reconstructions; the situations and dialogue are fictional.\n`)
  out.push(`Content version: ${experience.contentVersion}${exportedAt ? ` · Exported ${exportedAt}` : ''}\n`)

  if (filled(state.openingThought)) {
    heading(2, 'Opening thought')
    out.push(field(experience.openingPrompt, state.openingThought, md))
  }

  for (const id of experience.order) {
    const item = encounters[id]
    const entry = state.entries[id]
    heading(2, `${item.number}: ${item.title}`)
    out.push(`Image: ${item.image.originalPath} (modern reconstruction) · ${entry.visited ? 'Visited' : 'Not visited'}\n`)

    if (item.kind === 'deep') {
      const first = entry.firstSnapshot
      if (first) {
        heading(3, 'First response')
        out.push(field('I can see…', first.observation, md))
        out.push(field('I am assuming…', first.assumption, md))
        out.push(chosen('First recommendation', id, first.choiceId, md))
        out.push(field('My reason', first.reason, md))
        heading(3, 'My thinking now')
        out.push(chosen('Current recommendation', id, entry.revisedChoiceId, md))
        out.push(field('My thinking now', entry.currentThinking, md))
      } else {
        out.push(field('I can see…', entry.observation, md))
        out.push(field('I am assuming…', entry.assumption, md))
        out.push(chosen('Recommendation', id, entry.choiceId, md))
        out.push(field('My reason', entry.reason, md))
        if (filled(entry.currentThinking)) out.push(field('My thinking now', entry.currentThinking, md))
      }
    } else {
      out.push(chosen('Selected', id, entry.choiceId, md))
      out.push(field('Note', entry.note, md))
    }

    const refs = item.sourceIds.map((sourceId) => {
      const source = sources[sourceId]
      return `${md ? '- ' : '  * '}${sourceId}: ${source.work} ${source.passage} — ${source.url}`
    })
    out.push(`${md ? '**Sources for comparison**' : 'Sources for comparison:'}\n\n${refs.join('\n')}\n`)
  }

  if (filled(state.closingThought)) {
    heading(2, 'Looking back')
    out.push(field(experience.closing.prompt, state.closingThought, md))
  }

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
