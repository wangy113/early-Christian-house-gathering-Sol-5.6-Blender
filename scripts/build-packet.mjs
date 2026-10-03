// Builds the offline, text-first packet from the same content records as the app
// (architecture §9). Self-contained: inline CSS, no scripts, no network requests.

import { experience } from '../src/content/experience.js'
import { encounters, supportLabels } from '../src/content/encounters.js'
import { sources } from '../src/content/sources.js'

const esc = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])

const tag = (label, kind) => `<span class="tag ${kind}">${esc(label)}</span>`
const tagKind = (label) => (label === 'Interpretation' || label === 'Interpretive task' ? 'interp' : 'fiction')
const lines = (count) => `<div class="lines" aria-hidden="true">${'<span></span>'.repeat(count)}</div>`

function sourceBlock(id) {
  const s = sources[id]
  return `<div class="source">
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
  const deep = e.kind === 'deep'
  const choices = e.choices
    .map(
      (c, n) => `<li><strong>Option ${String.fromCharCode(65 + n)}: ${esc(c.label)}</strong>
      <p>${tag(e.feedbackLabel, tagKind(e.feedbackLabel))}${c.support ? ` <em>${esc(supportLabels[c.support])}.</em>` : ''} ${esc(c.feedback)}</p>
      <p class="follow">Question to consider: ${esc(c.followUp)}</p></li>`,
    )
    .join('\n')
  const recall = e.recall
    ? `<p class="box"><strong>${esc(e.recall.heading)}</strong> Look at what you wrote for ${esc(encounters[e.recall.encounterId].number)}, if anything. ${esc(e.recall.question)}</p>`
    : ''
  return `<section class="encounter" id="${esc(id)}">
<p class="eyebrow">Encounter ${index + 1} of ${experience.order.length} · ${esc(e.number)}</p>
<h2>${esc(e.title)}</h2>
<div class="box">
  ${tag('Modern reconstruction', 'recon')}
  <p><strong>Image description</strong> (${esc(e.image.originalPath)}): ${esc(e.image.alt)} ${esc(e.image.description)}</p>
  <p><strong>What this image cannot show:</strong> ${esc(e.imageLimitation)}</p>
</div>
<div class="box">
  ${tag(e.situation.label, tagKind(e.situation.label))}
  ${e.situation.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('\n  ')}
</div>
${e.comparison ? `<div class="box">${tag('Historical source', 'source')}<p><em>${esc(e.comparison.label)}.</em> ${esc(e.comparison.text)}</p></div>` : ''}
${recall}
${deep ? `<h3>1. Observe</h3><p>${esc(e.observationPrompt)}</p><p class="label">I can see…</p>${lines(2)}<p class="label">I am assuming…</p>${lines(2)}` : ''}
<h3>${deep ? '2. Decide' : '1. Decide'}</h3>
<p>${esc(e.decisionPrompt)} Note the letter of your option${deep ? ' and a brief reason' : ''} before reading on.</p>
${deep ? `<p class="label">My recommendation and reason</p>${lines(3)}` : ''}
<h3>${deep ? '3. Another perspective' : '2. Responses'}</h3>
<p class="instruction">Read the response for your selected option first. The other responses remain available; no option wins. If you did not choose, read this first:</p>
<p class="box">${tag('Interpretation', 'interp')} ${esc(e.neutralFeedback)}</p>
<ul class="choices">${choices}</ul>
${e.perspective ? `<div class="box">${tag(e.perspective.label, 'fiction')}<p>${esc(e.perspective.text)}</p>${e.perspective.note ? `<p class="small">${esc(e.perspective.note)}</p>` : ''}</div>` : ''}
<h3>${deep ? '4. Sources for comparison' : '3. Sources for comparison'}</h3>
<p>${esc(experience.sourceIntroduction)}</p>
${e.sourceNote ? `<p class="small">${esc(e.sourceNote)}</p>` : ''}
${e.sourceIds.map(sourceBlock).join('\n')}
${deep ? `<h3>5. Reconsider</h3><p>Keep your first response as it was. Then write your thinking now.</p><p>${esc(e.reconsiderPrompt)}</p>${lines(4)}` : `<h3>4. Note</h3><p>${esc(e.notePrompt)}</p>${lines(3)}`}
${e.transition ? `<p class="transition">${esc(e.transition)}</p>` : ''}
</section>`
}

export function buildPacket() {
  const toc = experience.order.map((id) => `<li><a href="#${esc(id)}">${esc(encounters[id].number)}: ${esc(encounters[id].title)}</a></li>`).join('')
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(experience.shortTitle)} — offline experience</title>
<style>
body{margin:0;background:#fffdf8;color:#1d1a15;font:1rem/1.6 Georgia,'Times New Roman',serif}
main{max-width:46rem;margin:0 auto;padding:1.5rem 1rem 4rem}
h1{font-size:1.9rem;line-height:1.2}h2{margin-top:0;font-size:1.5rem}h3{margin-top:1.6rem;font-family:system-ui,sans-serif;font-size:1.05rem}h4{margin:.2rem 0}
a{color:#6b3f00}.eyebrow{font:700 .85rem system-ui,sans-serif;text-transform:uppercase;letter-spacing:.06em;color:#7a4b00;margin:0}
.box,.source{border:1px solid #c9bda6;border-radius:6px;padding:.6rem .9rem;margin:.8rem 0;background:#fff}
.source{border-left:4px solid #2f6f5e}.tag{display:inline-block;font:700 .78rem system-ui,sans-serif;border:1px solid currentColor;border-radius:999px;padding:0 .45rem;margin-right:.25rem}
.recon{color:#7a4b00}.fiction{color:#8a2f12}.source .tag,.tag.source{color:#1f5b4c}.interp{color:#4a3d8f}
.choices{padding-left:1.1rem}.choices li{margin:.7rem 0}.follow,.small,.url{font-size:.92rem;color:#4b443a}.url{overflow-wrap:anywhere}
.label{font:700 .9rem system-ui,sans-serif;margin:.6rem 0 .1rem}.lines span{display:block;height:1.9rem;border-bottom:1px solid #b8ab92}
.encounter{border-top:2px solid #c9bda6;margin-top:2.5rem;padding-top:1rem}.central{border-left:4px solid #7a4b00;padding:.5rem 1rem;background:#fff;font-size:1.15rem}
.instruction{font-style:italic}@media print{.encounter{break-before:page}a{color:inherit}}
</style>
</head>
<body>
<main>
<p class="eyebrow">${esc(experience.setting)}</p>
<h1>${esc(experience.title)}</h1>
<p><strong>Offline experience.</strong> This page has the same encounters, responses, and sources as the online version. It does not save anything: write your notes on paper or in your own document. Images are replaced by written descriptions.</p>
<p class="central"><strong>Central question:</strong> ${esc(experience.centralQuestion)}</p>
${experience.opening.map((p) => `<p>${esc(p)}</p>`).join('\n')}
<p><strong>Labels used:</strong> ${tag('Modern reconstruction', 'recon')} images; ${tag('Fictional situation', 'fiction')} invented events; ${tag('Fictional dialogue', 'fiction')} invented speech; ${tag('Historical source', 'source')} ancient texts, summarized; ${tag('Interpretation', 'interp')} an explanatory inference.</p>
<h3>Before you begin (optional)</h3>
<p>${esc(experience.openingPrompt)}</p>${lines(2)}
<h3>Contents</h3><ol>${toc}<li><a href="#closing">${esc(experience.closing.heading)}</a></li></ol>
${experience.order.map(encounterBlock).join('\n')}
<section class="encounter" id="closing">
<h2>${esc(experience.closing.heading)}</h2>
${experience.closing.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('\n')}
<p class="label">${esc(experience.closing.prompt)} (optional)</p>${lines(4)}
<p>${esc(experience.closing.ending)}</p>
</section>
<p class="small">Content version ${esc(experience.contentVersion)}. The people, dialogue, and situations are fictional; the images are modern reconstructions. Source summaries are paraphrases; follow the links for full texts.</p>
</main>
</body>
</html>
`
}
