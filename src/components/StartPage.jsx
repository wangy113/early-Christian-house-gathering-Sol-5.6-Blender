import { experience } from '../content/experience.js'
import { encounters } from '../content/encounters.js'
import { encounterHash } from '../lib/routes.js'
import { assetUrl } from '../lib/assetUrl.js'
import { Tag } from './Tag.jsx'
import { Wave } from './Wave.jsx'

export function StartPage({ notebook }) {
  const { state, dispatch, counts } = notebook
  const hasWork = counts.visitedCount > 0
  const nextUnvisited = experience.order.find((id) => !state.entries[id].visited)
  const resumeHref = nextUnvisited ? encounterHash(nextUnvisited) : '#/closing'
  const descriptionsOnly = state.preferences.descriptionsOnly

  const focusContents = (event) => {
    event.preventDefault()
    const details = document.querySelector('.contents details')
    if (details) details.open = true
    document.getElementById('contents-heading')?.focus()
  }

  return (
    <article className={'page start-page'}>
      <header className={'page-hero start-hero'}>
        <div className={'hero-pills'}>
          <span className={'pill pill-mustard'}>Rome · around AD 160</span>
          <span className={'pill'}>6 pictures</span>
        </div>
        <span className={'sticker'} aria-hidden={'true'}>Look closer!</span>
        <h1 id={'page-heading'} tabIndex={-1}>
          At the Threshold<span className={'hero-accent'}>Belonging in an Early Christian Gathering</span>
        </h1>
        <p className={'hero-question'}>{experience.centralQuestion}</p>
        {experience.opening.map((paragraph) => <p key={paragraph} className={'lead'}>{paragraph}</p>)}
        <div className={'start-actions'}>
          {hasWork ? <a className={'button primary'} href={resumeHref}>Resume</a> : null}
          <a className={hasWork ? 'button mustard' : 'button primary'} href={encounterHash('letter')}>Begin at the threshold</a>
          <a className={'button'} href={'#/start'} onClick={focusContents}>Contents</a>
        </div>
      </header>

      <section className={'step tone-orange'} aria-labelledby={'how-heading'}>
        <Wave />
        <div className={'step-inner'}>
          <h2 id={'how-heading'}>How each picture works</h2>
          <ol className={'how-grid'}>
            {experience.howTo.map((item, index) => (
              <li key={item.title} className={'card how-card'}>
                <span className={'step-badge'} aria-hidden={'true'}>{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={'step tone-mustard'} aria-labelledby={'pictures-heading'}>
        <Wave />
        <div className={'step-inner'}>
          <h2 id={'pictures-heading'}>The six pictures</h2>
          <ol className={'picture-grid'}>
            {experience.order.map((id) => (
              <li key={id}>
                <a className={'picture-card card'} href={encounterHash(id)}>
                  {descriptionsOnly ? null : (
                    <img src={assetUrl(encounters[id].image.srcSet[0].path)} alt={''} width={640} height={360} loading={'lazy'} decoding={'async'} />
                  )}
                  <span className={'picture-card-text'}>
                    <span className={'picture-number'}>{encounters[id].number}</span>
                    <span className={'picture-title'}>{encounters[id].title}</span>
                    {state.entries[id].visited ? <small>visited</small> : null}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={'step tone-green'} aria-labelledby={'label-key-heading'}>
        <Wave />
        <div className={'step-inner two-col'}>
          <div>
            <h2 id={'label-key-heading'}>How material is labeled</h2>
            <ul className={'label-key'}>
              <li><Tag kind={'reconstruction'}>{experience.labels.reconstruction}</Tag> every image</li>
              <li><Tag kind={'fiction'}>{experience.labels.fictionalSituation}</Tag> invented events</li>
              <li><Tag kind={'fiction'}>{experience.labels.fictionalPerspective}</Tag> invented voices</li>
              <li><Tag kind={'source'}>{experience.labels.source}</Tag> ancient texts, summarized</li>
              <li><Tag kind={'interpretation'}>{experience.labels.interpretation}</Tag> an explanatory inference</li>
              <li><Tag kind={'unknown'}>{experience.labels.unknown}</Tag> no evidence either way</li>
            </ul>
          </div>
          <div className={'card access-card'}>
            <h2 id={'access-heading'}>Ways to take part</h2>
            <label className={'check'}>
              <input
                type={'checkbox'}
                checked={descriptionsOnly}
                onChange={(event) => dispatch({ type: 'SET_ACCESS_PREFERENCE', descriptionsOnly: event.target.checked })}
              />
              <span>
                <strong>Descriptions only</strong>: show written image descriptions instead of loading images. Every detail,
                question, and source stays the same.
              </span>
            </label>
            <p>
              <a href={assetUrl('experience-packet.html')}>Open offline experience</a>: one printable page with every picture’s
              details, questions, responses, and sources. It works without this app.
            </p>
          </div>
        </div>
      </section>
    </article>
  )
}
