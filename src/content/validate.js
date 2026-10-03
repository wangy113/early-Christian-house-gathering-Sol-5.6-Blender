// Structural checks for the authored content.
// Returns a list of problems; an empty list means the records are usable.
// File-existence checks live in scripts/validate-content.mjs (Node only).

const PLACEHOLDER = /\b(TODO|TBD|lorem ipsum|FIXME)\b/i
const SORT_PLACES = ['picture', 'source', 'unestablished']
const CONTEXT_KINDS = ['source', 'interpretation', 'unknown']
const POSITIONS = ['top', 'left', 'right', 'bottom']
const VERDICT_IDS = ['supported', 'partly', 'unestablished']

const nonEmpty = (value) => typeof value === 'string' && value.trim().length > 0

export function validateContent({ experience, encounters, sources }) {
  const problems = []
  const fail = (message) => problems.push(message)
  const checkSource = (where, kind, sourceId) => {
    if (!CONTEXT_KINDS.includes(kind)) fail(`${where} has unknown kind "${kind}"`)
    if (kind === 'source' && !sources[sourceId]) fail(`${where} references unknown source "${sourceId}"`)
    if (kind !== 'source' && sourceId) fail(`${where} has a source id but is not kind "source"`)
  }

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

  const lensIds = experience.lensOrder ?? []
  if (lensIds[0] !== 'picture') fail('the first lens must be "picture"')
  for (const lens of lensIds) if (!nonEmpty(experience.lenses?.[lens]?.label)) fail(`lens "${lens}" needs a label`)
  const voiceLenses = lensIds.filter((lens) => lens !== 'picture')

  for (const id of ids) {
    const item = encounters[id]
    const where = `encounter "${id}"`
    if (item.id !== id) fail(`${where} has mismatched id "${item.id}"`)
    if (!['deep', 'brief'].includes(item.kind)) fail(`${where} has unknown kind "${item.kind}"`)
    for (const field of ['number', 'title', 'caseQuestion', 'decisionPrompt', 'neutralFeedback', 'imageLimitation', 'feedbackLabel']) {
      if (!nonEmpty(item[field])) fail(`${where} is missing ${field}`)
    }

    const image = item.image ?? {}
    for (const field of ['originalPath', 'displayPath', 'alt', 'description']) {
      if (!nonEmpty(image[field])) fail(`${where} image is missing ${field}`)
      else if (field.endsWith('Path') && image[field].startsWith('/')) fail(`${where} image ${field} must be site-relative`)
    }
    if (!(image.width > 0 && image.height > 0)) fail(`${where} image needs width and height`)

    if (!nonEmpty(item.situation?.label) || !item.situation?.paragraphs?.every(nonEmpty)) fail(`${where} needs a labeled situation`)

    // Hotspots
    const hotspots = item.hotspots ?? []
    if (hotspots.length < 3 || hotspots.length > 6) fail(`${where} needs 3–6 hotspots`)
    const hotspotIds = new Set()
    for (const spot of hotspots) {
      const at = `${where} hotspot "${spot.id}"`
      if (!nonEmpty(spot.id) || hotspotIds.has(spot.id)) fail(`${at} needs a unique id`)
      hotspotIds.add(spot.id)
      if (!(spot.x >= 0 && spot.x <= 100 && spot.y >= 0 && spot.y <= 100)) fail(`${at} needs x and y between 0 and 100`)
      for (const field of ['label', 'see', 'limit']) if (!nonEmpty(spot[field])) fail(`${at} is missing ${field}`)
      if (!nonEmpty(spot.context?.text)) fail(`${at} is missing context text`)
      checkSource(at, spot.context?.kind, spot.context?.sourceId)
      for (const lens of voiceLenses) if (!nonEmpty(spot.voices?.[lens])) fail(`${at} is missing the "${lens}" voice`)
    }

    // Outside the frame
    const frame = item.outsideFrame ?? []
    const positions = frame.map((entry) => entry.position)
    if (frame.length !== 4 || POSITIONS.some((p) => !positions.includes(p))) fail(`${where} needs one outside-the-frame question per side`)
    for (const entry of frame) {
      const at = `${where} outside-frame "${entry.id}"`
      if (!nonEmpty(entry.question) || !nonEmpty(entry.answer)) fail(`${at} needs a question and answer`)
      checkSource(at, entry.kind, entry.sourceId)
    }
    if (new Set(frame.map((entry) => entry.id)).size !== frame.length) fail(`${where} repeats an outside-frame id`)

    // Choices
    const choiceIds = new Set()
    if (!Array.isArray(item.choices) || item.choices.length < 3) fail(`${where} needs at least three choices`)
    for (const choice of item.choices ?? []) {
      if (!nonEmpty(choice.id)) fail(`${where} has a choice without an id`)
      if (choiceIds.has(choice.id)) fail(`${where} repeats choice id "${choice.id}"`)
      choiceIds.add(choice.id)
      for (const field of ['label', 'feedback', 'followUp']) if (!nonEmpty(choice[field])) fail(`${where} choice "${choice.id}" is missing ${field}`)
      if (choice.support && !['supported', 'unsupported'].includes(choice.support)) fail(`${where} choice "${choice.id}" has invalid support value`)
    }
    if (choiceIds.has('unsure')) fail(`${where} may not use the reserved choice id "unsure"`)

    // Case verdicts
    const verdictIds = (item.verdicts ?? []).map((verdict) => verdict.id)
    if (VERDICT_IDS.some((v) => !verdictIds.includes(v)) || verdictIds.length !== 3) fail(`${where} needs the three verdicts`)
    for (const verdict of item.verdicts ?? []) if (!nonEmpty(verdict.why)) fail(`${where} verdict "${verdict.id}" needs an explanation`)

    // Sort
    const sort = item.sort ?? []
    if (sort.length < 3 || sort.length > 5) fail(`${where} needs 3–5 sort statements`)
    const sortIds = new Set()
    for (const statement of sort) {
      const at = `${where} sort "${statement.id}"`
      if (!nonEmpty(statement.id) || sortIds.has(statement.id)) fail(`${at} needs a unique id`)
      sortIds.add(statement.id)
      if (!SORT_PLACES.includes(statement.answer)) fail(`${at} has an invalid answer`)
      if (!nonEmpty(statement.text) || !nonEmpty(statement.why)) fail(`${at} needs text and an explanation`)
      if (statement.answer === 'source' && !sources[statement.sourceId]) fail(`${at} needs a valid source id`)
    }
    for (const place of SORT_PLACES) if (!sort.some((statement) => statement.answer === place)) fail(`${where} sort needs at least one "${place}" statement`)

    if (!Array.isArray(item.sourceIds) || item.sourceIds.length === 0) fail(`${where} needs at least one source`)
    for (const sourceId of item.sourceIds ?? []) if (!sources[sourceId]) fail(`${where} references unknown source "${sourceId}"`)
    if (item.recall && !encounters[item.recall.encounterId]) fail(`${where} recall references unknown encounter`)

    if (PLACEHOLDER.test(JSON.stringify(item))) fail(`${where} contains placeholder text`)
  }

  for (const [id, source] of Object.entries(sources)) {
    const where = `source "${id}"`
    if (source.id !== id) fail(`${where} has mismatched id`)
    for (const field of ['work', 'passage', 'setting', 'genre', 'summary', 'limit', 'url']) if (!nonEmpty(source[field])) fail(`${where} is missing ${field}`)
    if (nonEmpty(source.url) && !source.url.startsWith('https://')) fail(`${where} url must use HTTPS`)
    if (PLACEHOLDER.test(JSON.stringify(source))) fail(`${where} contains placeholder text`)
  }

  // Scope guard: no assignment or grading language in learner-facing content.
  const everything = JSON.stringify({ experience, encounters, sources })
  for (const banned of [/rubric/i, /\bgrade[ds]?\b/i, /canvas/i, /submit/i, /word count/i, /evidence collected/i, /\bscore\b/i, /\bpoints?\b/i]) {
    if (banned.test(everything)) fail(`content contains out-of-scope wording matching ${banned}`)
  }

  return problems
}
