// Builds the offline, text-first packet from the same content records as the app.
// Self-contained: inline CSS (Groovy palette, local font fallbacks), no scripts,
// no images, no network requests.

import { experience } from '../src/content/experience.js'
import { contextLabels, encounters, sortPlaces, supportLabels } from '../src/content/encounters.js'
import { sources } from '../src/content/sources.js'

const esc = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])

const tag = (label, kind) => `<span class="tag ${kind}">${esc(label)}</span>`
const kindClass = { source: 'source', interpretation: 'interp', unknown: 'unknown' }
const labelKind = (label) => (label === 'Interpretation' || label === 'Interpretive task' ? 'interp' : 'fiction')
const contextTag = (kind, sourceId) =>
  kind === 'source' ? tag(`${contextLabels.source} · ${sources[sourceId].work}`, 'source') : tag(contextLabels[kind], kindClass[kind])
const letter = (n) => String.fromCharCode(65 + n)

function sourceBlock(id) {
  const s = sources[id]
  return `<div class="card source">
  ${tag('Historical source', 'source')}
  <h4>${esc(s.work)} ${esc(s.passage)}</h4>
  <p><strong>Setting:</strong> ${esc(s.setting)}</p>
  <p><strong>Kind of text:</strong> ${esc(s.genre)}</p>
  <p><strong>Summary (attributed paraphrase, not a quotation):</strong> ${esc(s.summary)}</p>
  <p><strong>What this source cannot establish:</strong> ${esc(s.limit)}</p>
  ${s.readingAid ? `<p><strong>Reading aid:</strong> ${esc(s.readingAid)}</p>` : ''}
  <p class="url">Optional full text: <a href="${esc(s.url)}">${esc(s.url)}</a></p>
</div>`
}

function encounterBlock(id, index) {
  const e = encounters[id]
  const lenses = experience.lensOrder.filter((lens) => lens !== 'picture')
  const details = e.hotspots
    .map(
      (h, n) => `<li class="card detail"><h4>Detail ${n + 1}: ${esc(h.label)}</h4>
  <p><strong>In the picture:</strong> ${esc(h.see)}</p>
  <p><strong>From the sources</strong> ${contextTag(h.context.kind, h.context.sourceId)} ${esc(h.context.text)}</p>
  <p><strong>What the picture can’t tell us:</strong> ${esc(h.limit)}</p>
  <details><summary>Invented voices ${tag(experience.labels.fictionalPerspective, 'fiction')}</summary><ul>${lenses
    .map((lens) => `<li><strong>${esc(experience.lenses[lens].label)}:</strong> ${esc(h.voices[lens])}</li>`)
    .join('')}</ul></details></li>`,
    )
    .join('\n')
  const frame = e.outsideFrame
    .map((f) => `<li><strong>${esc(f.question)}</strong> ${contextTag(f.kind, f.sourceId)} ${esc(f.answer)}</li>`)
    .join('\n')
  const choices = e.choices
    .map(
      (c, n) => `<li><strong>Option ${letter(n)}: ${esc(c.label)}</strong>
      <p>${tag(e.feedbackLabel, labelKind(e.feedbackLabel))}${c.support ? ` <em>${esc(supportLabels[c.support])}</em>` : ''} ${esc(c.feedback)}</p>
      <p class="follow">Question to consider: ${esc(c.followUp)}</p></li>`,
    )
    .join('\n')
  const sortItems = e.sort.map((s, n) => `<li>${n + 1}. ${esc(s.text)} <span class="choices-line">☐ ${esc(sortPlaces.picture)} ☐ ${esc(sortPlaces.source)} ☐ ${esc(sortPlaces.unestablished)}</span></li>`).join('\n')
  const sortAnswers = e.sort.map((s, n) => `<li>${n + 1}. <strong>${esc(sortPlaces[s.answer])}.</strong> ${esc(s.why)}</li>`).join('\n')
  const recall = e.recall
    ? `<p class="card note"><strong>${esc(e.recall.heading)}</strong> Look back at what you recommended in ${esc(encounters[e.recall.encounterId].number)}. ${esc(e.recall.question)}</p>`
    : ''
  return `<section class="encounter" id="${esc(id)}">
<p class="eyebrow">Picture ${index + 1} of ${experience.order.length} · ${esc(e.number)}</p>
<h2>${esc(e.title)}</h2>
<div class="card case"><p class="small-caps">Case question</p><p class="big">${esc(e.caseQuestion)}</p></div>
<div class="card">
  ${tag('Modern reconstruction', 'recon')}
  <p><strong>Image description</strong> (${esc(e.image.originalPath)}): ${esc(e.image.alt)} ${esc(e.image.description)}</p>
  <p><strong>What this image cannot show:</strong> ${esc(e.imageLimitation)}</p>
</div>
<h3>1. Look closely</h3>
<ol class="details">${details}</ol>
<h4>Outside the picture</h4>
<ul class="frame">${frame}</ul>
<h3>2. What would you advise?</h3>
${recall}
<div class="card">${tag(e.situation.label, labelKind(e.situation.label))}${e.situation.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
<p>${esc(e.decisionPrompt)} Note the letter of your option before reading on.</p>
<p class="instruction">Read the response for your option first. The other responses stay available; no option wins. If you did not choose, read this:</p>
<p class="card">${tag('Interpretation', 'interp')} ${esc(e.neutralFeedback)}</p>
<ul class="choices">${choices}</ul>
${e.perspective ? `<div class="card">${tag(e.perspective.label, 'fiction')}<p>${esc(e.perspective.text)}</p></div>` : ''}
<h3>3. Rule on the case</h3>
<p>${esc(e.caseQuestion)} Choose: Supported / Partly supported / Not established. Then read how a historian might argue each ruling.</p>
<ul>${e.verdicts.map((v) => `<li>${tag('Interpretation', 'interp')} <strong>${esc(v.label)}.</strong> ${esc(v.why)}</li>`).join('\n')}</ul>
<h3>4. Sort what you learned</h3>
<p>Where does each statement come from? Mark one place for each before reading on.</p>
<ul class="sort">${sortItems}</ul>
<details class="card"><summary>How a historian might sort these</summary><ul class="sort">${sortAnswers}</ul></details>
<h3>Sources for comparison</h3>
<p>${esc(experience.sourceIntroduction)}</p>
${e.sourceNote ? `<p class="small">${esc(e.sourceNote)}</p>` : ''}
${e.sourceIds.map(sourceBlock).join('\n')}
</section>`
}

export function buildPacket() {
  const toc = experience.order.map((id) => `<li><a href="#${esc(id)}">${esc(encounters[id].number)}: ${esc(encounters[id].title)}</a></li>`).join('')
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(experience.shortTitle)}: offline experience</title>
<style>
body{margin:0;background:#fdf6e3;color:#2d1b00;font:1rem/1.6 'DM Sans','Segoe UI',Roboto,Helvetica,Arial,sans-serif}
main{max-width:48rem;margin:0 auto;padding:1.5rem 1rem 4rem}
h1,h2,h3,h4{font-family:'Righteous','Trebuchet MS',sans-serif;font-weight:400;line-height:1.2}
h1{font-size:2.1rem}h2{margin-top:0;font-size:1.7rem}h3{margin-top:1.8rem;font-size:1.25rem}h4{margin:.3rem 0}
a{color:#b7410e}.eyebrow{font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#8b4513;margin:0;font-size:.85rem}
.card{background:#fff;border:3px solid #2d1b00;border-radius:24px 12px 24px 12px;box-shadow:4px 4px 0 #2d1b00;padding:.7rem 1rem;margin:.9rem 0}
.case{background:#fffde7}.big{font-family:'Righteous','Trebuchet MS',sans-serif;font-size:1.3rem;margin:.2rem 0}.small-caps{margin:0;font-size:.8rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8b4513}
.source{background:#f1f8e9}.note{background:#f1f8e9}
.tag{display:inline-block;font-size:.76rem;font-weight:700;border:2px solid #2d1b00;border-radius:999px;padding:0 .5rem;margin-right:.25rem;color:#2d1b00}
.recon{background:#d4a017}.fiction{background:#fbd9bf}.tag.source{background:#dfe8c6}.interp{background:#fff;border-style:dashed}.unknown{background:#eadfcf}
.details,.choices,.frame,.sort{padding-left:1.1rem}.details{list-style:none;padding:0}.choices li,.frame li,.sort li{margin:.6rem 0}
.follow,.small,.url{font-size:.92rem;color:#8b4513}.url{overflow-wrap:anywhere}.choices-line{display:block;font-size:.92rem;color:#8b4513}
.encounter{border-top:3px solid #2d1b00;margin-top:2.5rem;padding-top:1rem}.central{background:#fff3e0}
summary{cursor:pointer;font-weight:700}.instruction{font-style:italic}@media print{.encounter{break-before:page}a{color:inherit}details{display:block}}
</style>
</head>
<body>
<main>
<p class="eyebrow">${esc(experience.setting)}</p>
<h1>${esc(experience.title)}</h1>
<p><strong>Offline experience.</strong> This page has the same pictures’ details, questions, responses, and sources as the online version. It does not save anything; mark your choices on paper. Images are replaced by written descriptions.</p>
<p class="card central"><strong>Central question:</strong> ${esc(experience.centralQuestion)}</p>
${experience.opening.map((p) => `<p>${esc(p)}</p>`).join('\n')}
<p><strong>Labels used:</strong> ${tag('Modern reconstruction', 'recon')} images; ${tag('Fictional situation', 'fiction')} invented events; ${tag(experience.labels.fictionalPerspective, 'fiction')} invented voices; ${tag('Historical source', 'source')} ancient texts, summarized; ${tag('Interpretation', 'interp')} an explanatory inference; ${tag('Not recorded', 'unknown')} no evidence either way.</p>
<h3>Contents</h3><ol>${toc}<li><a href="#closing">${esc(experience.closing.heading)}</a></li></ol>
${experience.order.map(encounterBlock).join('\n')}
<section class="encounter" id="closing">
<h2>${esc(experience.closing.heading)}</h2>
<p>Gather the statements you sorted into three lists: ${esc(sortPlaces.picture)}, ${esc(sortPlaces.source)}, and ${esc(sortPlaces.unestablished)}. Together they are your reconstruction of the gathering.</p>
<h3>Questions to carry forward</h3>
<ol>${experience.closing.questions.map((q) => `<li>${esc(q)}</li>`).join('')}</ol>
<p>${esc(experience.closing.questionsNote)}</p>
</section>
<p class="small">Content version ${esc(experience.contentVersion)}. The people, dialogue, voices, and situations are fictional; the images are modern reconstructions. Source summaries are paraphrases; follow the links for full texts.</p>
</main>
</body>
</html>
`
}
