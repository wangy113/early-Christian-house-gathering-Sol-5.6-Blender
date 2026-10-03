import { experience } from '../content/experience.js'
import { encounterHash } from '../lib/routes.js'
import { assetUrl } from '../lib/assetUrl.js'
import { TextField } from './TextField.jsx'

export function StartPage({ notebook }) {
  const { state, dispatch, flush, counts } = notebook
  const hasWork = counts.notesCount > 0 || state.openingThought.trim() !== '' || counts.visitedCount > 0
  const nextUnvisited = experience.order.find((id) => !state.entries[id].visited)
  const resumeHref = nextUnvisited ? encounterHash(nextUnvisited) : '#/notebook'
  const descriptionsOnly = state.preferences.descriptionsOnly

  const focusContents = (event) => {
    event.preventDefault()
    const details = document.querySelector('.contents details')
    if (details) details.open = true
    document.getElementById('contents-heading')?.focus()
  }

  return (
    <article className={'page start-page'}>
      <p className={'eyebrow'}>{experience.setting}</p>
      <h1 id={'page-heading'} tabIndex={-1}>{experience.title}</h1>
      <p className={'central-question'}>
        <span>Central question</span>
        {experience.centralQuestion}
      </p>
      {experience.opening.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

      <section className={'label-key'} aria-labelledby={'label-key-heading'}>
        <h2 id={'label-key-heading'}>How material is labeled</h2>
        <ul>
          <li><span className={'tag tag-reconstruction'}>{experience.labels.reconstruction}</span> every image</li>
          <li><span className={'tag tag-fiction'}>{experience.labels.fictionalSituation}</span> invented events</li>
          <li><span className={'tag tag-fiction'}>{experience.labels.fictionalDialogue}</span> invented speech</li>
          <li><span className={'tag tag-source'}>{experience.labels.source}</span> ancient texts, summarized</li>
          <li><span className={'tag tag-interpretation'}>{experience.labels.interpretation}</span> an explanatory inference</li>
        </ul>
      </section>

      <TextField
        label={`${experience.openingPrompt} (optional)`}
        value={state.openingThought}
        onChange={(value) => dispatch({ type: 'EDIT_OPENING', value })}
        onBlur={flush}
      />

      <div className={'start-actions'}>
        {hasWork ? <a className={'button primary'} href={resumeHref}>Resume</a> : null}
        <a className={hasWork ? 'button' : 'button primary'} href={encounterHash('letter')}>Begin at the threshold</a>
        <a className={'button'} href={'#/start'} onClick={focusContents}>Contents</a>
      </div>

      <section className={'access-options'} aria-labelledby={'access-heading'}>
        <h2 id={'access-heading'}>Ways to take part</h2>
        <label className={'check'}>
          <input
            type={'checkbox'}
            checked={descriptionsOnly}
            onChange={(event) => dispatch({ type: 'SET_ACCESS_PREFERENCE', descriptionsOnly: event.target.checked })}
          />
          <span>
            <strong>Descriptions only</strong> — show written image descriptions instead of loading images. Every
            situation, choice, and source stays the same.
          </span>
        </label>
        <p>
          <a href={assetUrl('experience-packet.html')}>Open offline experience</a> — a single printable page with every
          encounter, response, and source. It works without this app; keep notes on paper or in your own document.
        </p>
      </section>
    </article>
  )
}
