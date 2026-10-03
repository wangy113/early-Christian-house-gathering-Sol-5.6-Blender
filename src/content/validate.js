// Structural checks for the authored content (architecture §6).
// Returns a list of problems; an empty list means the records are usable.
// File-existence checks live in scripts/validate-content.mjs (Node only).

const PLACEHOLDER = /\b(TODO|TBD|lorem ipsum|FIXME)\b/i

const nonEmpty = (value) => typeof value === 'string' && value.trim().length > 0

export function validateContent({ experience, encounters, sources }) {
  const problems = []
  const fail = (message) => problems.push(message)

  const order = experience.order
  if (!Array.isArray(order) || order.length !== 6) fail('experience.order must list exactly six encounters')
  if (new Set(order).size !== order.length) fail('experience.order contains duplicate IDs')
  const ids = Object.keys(encounters)
  if (ids.length !== 6) fail(`expected six encounter records, found ${ids.length}`)
  for (const id of order) if (!encounters[id]) fail(`order lists unknown encounter "${id}"`)
  for (const id of ids) if (!order.includes(id)) fail(`encounter "${id}" is missing from experience.order`)

  const kinds = ids.map((id) => encounters[id].kind)
  if (kinds.filter((kind) => kind === 'deep').length !== 3) fail('expected three deep encounters')
  if (kinds.filter((kind) => kind === 'brief').length !== 3) fail('expected three brief encounters')

  for (const id of ids) {
    const item = encounters[id]
    const where = `encounter "${id}"`
    if (item.id !== id) fail(`${where} has mismatched id "${item.id}"`)
    for (const field of ['number', 'title', 'decisionPrompt', 'neutralFeedback', 'imageLimitation', 'feedbackLabel']) {
      if (!nonEmpty(item[field])) fail(`${where} is missing ${field}`)
    }
    if (item.kind === 'deep') {
      if (!nonEmpty(item.observationPrompt)) fail(`${where} is missing observationPrompt`)
      if (!nonEmpty(item.reconsiderPrompt)) fail(`${where} is missing reconsiderPrompt`)
    } else if (item.kind === 'brief') {
      if (!nonEmpty(item.notePrompt)) fail(`${where} is missing notePrompt`)
    } else {
      fail(`${where} has unknown kind "${item.kind}"`)
    }

    const image = item.image ?? {}
    for (const field of ['originalPath', 'displayPath', 'alt', 'description']) {
      if (!nonEmpty(image[field])) fail(`${where} image is missing ${field}`)
      else if (field.endsWith('Path') && image[field].startsWith('/')) fail(`${where} image ${field} must be site-relative`)
    }
    if (!(image.width > 0 && image.height > 0)) fail(`${where} image needs width and height`)

    if (!nonEmpty(item.situation?.label) || !item.situation?.paragraphs?.every(nonEmpty)) {
      fail(`${where} needs a labeled situation`)
    }

    const choiceIds = new Set()
    if (!Array.isArray(item.choices) || item.choices.length < 3) fail(`${where} needs at least three choices`)
    for (const choice of item.choices ?? []) {
      if (!nonEmpty(choice.id)) fail(`${where} has a choice without an id`)
      if (choiceIds.has(choice.id)) fail(`${where} repeats choice id "${choice.id}"`)
      choiceIds.add(choice.id)
      for (const field of ['label', 'feedback', 'followUp']) {
        if (!nonEmpty(choice[field])) fail(`${where} choice "${choice.id}" is missing ${field}`)
      }
      if (choice.support && !['supported', 'unsupported'].includes(choice.support)) {
        fail(`${where} choice "${choice.id}" has invalid support value`)
      }
    }
    if (choiceIds.has('unsure')) fail(`${where} may not use the reserved choice id "unsure"`)

    if (!Array.isArray(item.sourceIds) || item.sourceIds.length === 0) fail(`${where} needs at least one source`)
    for (const sourceId of item.sourceIds ?? []) if (!sources[sourceId]) fail(`${where} references unknown source "${sourceId}"`)
    if (item.comparison && !sources[item.comparison.sourceId]) fail(`${where} comparison references unknown source`)
    if (item.recall && !encounters[item.recall.encounterId]) fail(`${where} recall references unknown encounter`)

    const text = JSON.stringify(item)
    if (PLACEHOLDER.test(text)) fail(`${where} contains placeholder text`)
  }

  for (const [id, source] of Object.entries(sources)) {
    const where = `source "${id}"`
    if (source.id !== id) fail(`${where} has mismatched id`)
    for (const field of ['work', 'passage', 'setting', 'genre', 'summary', 'limit', 'url']) {
      if (!nonEmpty(source[field])) fail(`${where} is missing ${field}`)
    }
    if (nonEmpty(source.url) && !source.url.startsWith('https://')) fail(`${where} url must use HTTPS`)
    if (PLACEHOLDER.test(JSON.stringify(source))) fail(`${where} contains placeholder text`)
  }

  // Scope guard (A01): no assignment or grading language in learner-facing content.
  const everything = JSON.stringify({ experience, encounters, sources })
  for (const banned of [/rubric/i, /\bgrade[ds]?\b/i, /canvas/i, /submit/i, /word count/i, /evidence collected/i]) {
    if (banned.test(everything)) fail(`content contains out-of-scope wording matching ${banned}`)
  }

  return problems
}
