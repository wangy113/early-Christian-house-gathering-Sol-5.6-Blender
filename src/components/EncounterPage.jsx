import { useId } from 'react'
import { experience } from '../content/experience.js'
import { encounters, supportLabels } from '../content/encounters.js'
import { UNSURE } from '../state/notebookSchema.js'
import { choiceLabel } from '../lib/notebookExport.js'
import { encounterHash, neighbours } from '../lib/routes.js'
import { EncounterFigure } from './EncounterFigure.jsx'
import { SourceCard } from './SourceCard.jsx'
import { TextField } from './TextField.jsx'

const tagClass = (label) =>
  label === 'Historical source' ? 'tag tag-source' : label === 'Interpretation' || label === 'Interpretive task' ? 'tag tag-interpretation' : 'tag tag-fiction'

function ChoiceGroup({ legend, name, options, value, onChange }) {
  return (
    <fieldset className={'choices'}>
      <legend>{legend}</legend>
      {options.map((option) => (
        <label key={option.id} className={'choice'}>
          <input type={'radio'} name={name} value={option.id} checked={value === option.id} onChange={() => onChange(option.id)} />
          <span>{option.label}</span>
        </label>
      ))}
      {value !== null ? (
        <button type={'button'} className={'link-button'} onClick={() => onChange(null)}>Clear selection</button>
      ) : null}
    </fieldset>
  )
}

function Response({ encounter, choiceId }) {
  const choice = encounter.choices.find((item) => item.id === choiceId)
  if (!choice) {
    return (
      <div className={'response'}>
        <p className={'tag tag-interpretation'}>Interpretation</p>
        <p>{encounter.neutralFeedback}</p>
      </div>
    )
  }
  return (
    <div className={'response'}>
      <p className={tagClass(encounter.feedbackLabel)}>{encounter.feedbackLabel}</p>
      <p className={'response-for'}>In response to: {choice.label}</p>
      {choice.support ? <p className={`support is-${choice.support}`}>{supportLabels[choice.support]}</p> : null}
      <p className={'response-text'}>{choice.feedback}</p>
      <p className={'follow-up'}><strong>Question to consider: </strong>{choice.followUp}</p>
    </div>
  )
}

function OtherResponses({ encounter, choiceId }) {
  const others = encounter.choices.filter((item) => item.id !== choiceId)
  return (
    <details className={'other-responses'}>
      <summary>Read the responses to the other options</summary>
      <ul>
        {others.map((choice) => (
          <li key={choice.id}>
            <strong>{choice.label}</strong>
            {choice.support ? <span className={`support is-${choice.support}`}> {supportLabels[choice.support]}.</span> : null}
            <p>{choice.feedback}</p>
            <p className={'follow-up'}>{choice.followUp}</p>
          </li>
        ))}
      </ul>
    </details>
  )
}

function Perspective({ perspective }) {
  if (!perspective) return null
  return (
    <aside className={'perspective'} aria-label={'Another perspective'}>
      <p className={'tag tag-fiction'}>{perspective.label}</p>
      <p className={'perspective-text'}>{perspective.text}</p>
      {perspective.note ? <p className={'perspective-note'}>{perspective.note}</p> : null}
    </aside>
  )
}

function Recall({ recall, state }) {
  if (!recall) return null
  const earlier = encounters[recall.encounterId]
  const entry = state.entries[recall.encounterId]
  const quotes = [
    ['Your first reason', entry.firstSnapshot?.reason ?? entry.reason],
    ['Your thinking now', entry.currentThinking],
  ].filter(([, text]) => typeof text === 'string' && text.trim() !== '')
  return (
    <section className={'recall'} aria-labelledby={`recall-${recall.encounterId}`}>
      <h2 id={`recall-${recall.encounterId}`} className={'small-heading'}>{recall.heading}</h2>
      {quotes.length ? (
        <>
          {quotes.map(([label, text]) => (
            <figure key={label}>
              <figcaption>{label} ({earlier.number})</figcaption>
              <blockquote>{text}</blockquote>
            </figure>
          ))}
          <p>{recall.question}</p>
        </>
      ) : (
        <p>
          You have not recorded a reason in {earlier.number} yet. You can{' '}
          <a href={encounterHash(earlier.id)}>revisit {earlier.number}: {earlier.title}</a> at any time, or continue here.
        </p>
      )}
    </section>
  )
}

function Sources({ encounter, onOpen }) {
  return (
    <section className={'sources'} aria-labelledby={`${encounter.id}-sources`}>
      <h2 id={`${encounter.id}-sources`}>Sources for comparison</h2>
      <p>{experience.sourceIntroduction}</p>
      {encounter.sourceNote ? <p className={'source-note'}>{encounter.sourceNote}</p> : null}
      {encounter.sourceIds.map((sourceId) => <SourceCard key={sourceId} sourceId={sourceId} onOpen={onOpen} />)}
    </section>
  )
}

function Snapshot({ encounter, snapshot }) {
  const show = (text) => (text && text.trim() ? text : experience.notebook.empty)
  return (
    <div className={'snapshot'}>
      <h3>My first response</h3>
      <p className={'snapshot-note'}>Recorded when you first asked for another perspective. It stays as it was.</p>
      <dl>
        <dt>I could see…</dt>
        <dd>{show(snapshot.observation)}</dd>
        <dt>I was assuming…</dt>
        <dd>{show(snapshot.assumption)}</dd>
        <dt>My recommendation</dt>
        <dd>{choiceLabel(encounter.id, snapshot.choiceId) ?? 'No choice selected.'}</dd>
        <dt>My reason</dt>
        <dd>{show(snapshot.reason)}</dd>
      </dl>
    </div>
  )
}

function DeepEncounter({ encounter, entry, notebook }) {
  const { dispatch, flush } = notebook
  const id = encounter.id
  const edit = (field) => (value) => dispatch({ type: 'EDIT_FIELD', id, field, value })
  const revealed = entry.firstSnapshot !== null
  const name = useId()

  return (
    <>
      {!revealed ? (
        <section className={'step'} aria-labelledby={`${id}-observe`}>
          <h2 id={`${id}-observe`}>Observe and advise</h2>
          <p>{encounter.observationPrompt}</p>
          <TextField label={'I can see… (optional)'} value={entry.observation} onChange={edit('observation')} onBlur={flush} />
          <TextField label={'I am assuming… (optional)'} value={entry.assumption} onChange={edit('assumption')} onBlur={flush} />
          <ChoiceGroup
            legend={encounter.decisionPrompt}
            name={`${name}-first`}
            options={encounter.choices}
            value={entry.choiceId}
            onChange={(choiceId) => dispatch({ type: 'CHOOSE', id, choiceId })}
          />
          <TextField label={'My reason (optional)'} value={entry.reason} onChange={edit('reason')} onBlur={flush} />
          <p className={'field-hint'}>
            Nothing here is required. When you continue, what you have written so far is kept as your first response.
          </p>
          <button
            type={'button'}
            className={'primary'}
            onClick={() => {
              dispatch({ type: 'REVEAL_PERSPECTIVE', id, capturedAt: new Date().toISOString() })
              flush()
            }}
          >
            Consider another perspective
          </button>
        </section>
      ) : (
        <>
          <section className={'step'} aria-labelledby={`${id}-perspective`}>
            <h2 id={`${id}-perspective`}>Another perspective</h2>
            <Response encounter={encounter} choiceId={entry.firstSnapshot.choiceId} />
            <Perspective perspective={encounter.perspective} />
            <OtherResponses encounter={encounter} choiceId={entry.firstSnapshot.choiceId} />
          </section>
          <Sources encounter={encounter} onOpen={(sourceId) => dispatch({ type: 'OPEN_SOURCE', id, sourceId })} />
          <section className={'step reconsider'} aria-labelledby={`${id}-reconsider`}>
            <h2 id={`${id}-reconsider`}>Reconsider</h2>
            <div className={'reconsider-grid'}>
              <Snapshot encounter={encounter} snapshot={entry.firstSnapshot} />
              <div className={'current'}>
                <h3>My thinking now</h3>
                <ChoiceGroup
                  legend={'My recommendation now (optional)'}
                  name={`${name}-now`}
                  options={[...encounter.choices, { id: UNSURE, label: 'Still unsure' }]}
                  value={entry.revisedChoiceId}
                  onChange={(choiceId) => dispatch({ type: 'CHOOSE', id, choiceId })}
                />
                <TextField
                  label={'My thinking now (optional)'}
                  hint={encounter.reconsiderPrompt}
                  value={entry.currentThinking}
                  onChange={edit('currentThinking')}
                  onBlur={flush}
                  rows={4}
                />
                <p className={'field-hint'}>Keeping the same recommendation is a valid choice. No option wins.</p>
              </div>
            </div>
          </section>
        </>
      )}
      {encounter.transition && revealed ? <p className={'transition'}>{encounter.transition}</p> : null}
    </>
  )
}

function BriefEncounter({ encounter, entry, notebook }) {
  const { dispatch, flush } = notebook
  const id = encounter.id
  const name = useId()
  return (
    <>
      <section className={'step'} aria-labelledby={`${id}-decide`}>
        <h2 id={`${id}-decide`}>Your view</h2>
        <ChoiceGroup
          legend={encounter.decisionPrompt}
          name={name}
          options={encounter.choices}
          value={entry.choiceId}
          onChange={(choiceId) => dispatch({ type: 'CHOOSE', id, choiceId })}
        />
        {entry.perspectivesRevealed ? (
          <div aria-live={'polite'}>
            <Response encounter={encounter} choiceId={entry.choiceId} />
          </div>
        ) : (
          <button type={'button'} className={'primary'} onClick={() => dispatch({ type: 'REVEAL_PERSPECTIVE', id })}>
            See a response
          </button>
        )}
        {entry.perspectivesRevealed ? (
          <>
            <Perspective perspective={encounter.perspective} />
            <OtherResponses encounter={encounter} choiceId={entry.choiceId} />
          </>
        ) : null}
      </section>
      <Sources encounter={encounter} onOpen={(sourceId) => dispatch({ type: 'OPEN_SOURCE', id, sourceId })} />
      <section className={'step'} aria-labelledby={`${id}-note`}>
        <h2 id={`${id}-note`}>Note</h2>
        <TextField
          label={'My note (optional)'}
          hint={encounter.notePrompt}
          value={entry.note}
          onChange={(value) => dispatch({ type: 'EDIT_FIELD', id, field: 'note', value })}
          onBlur={flush}
        />
      </section>
    </>
  )
}

export function EncounterPage({ id, notebook }) {
  const encounter = encounters[id]
  const { state } = notebook
  const entry = state.entries[id]
  const position = experience.order.indexOf(id) + 1
  const { previous, next, isLast } = neighbours(id)
  const nextEncounter = encounters[experience.order[position]]

  return (
    <article className={'page encounter-page'}>
      <p className={'eyebrow'}>Encounter {position} of {experience.order.length} · {encounter.number}</p>
      <h1 id={'page-heading'} tabIndex={-1}>{encounter.title}</h1>

      <EncounterFigure encounter={encounter} descriptionsOnly={state.preferences.descriptionsOnly} />

      <section className={'situation'} aria-labelledby={`${id}-situation`}>
        <h2 id={`${id}-situation`} className={'visually-hidden'}>Situation</h2>
        <p className={tagClass(encounter.situation.label)}>{encounter.situation.label}</p>
        {encounter.situation.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </section>

      {encounter.comparison ? (
        <aside className={'comparison'} aria-label={'Comparison text'}>
          <p className={'tag tag-source'}>Historical source</p>
          <p className={'comparison-label'}>{encounter.comparison.label}</p>
          <p>{encounter.comparison.text}</p>
        </aside>
      ) : null}

      <Recall recall={encounter.recall} state={state} />

      {encounter.kind === 'deep' ? (
        <DeepEncounter encounter={encounter} entry={entry} notebook={notebook} />
      ) : (
        <BriefEncounter encounter={encounter} entry={entry} notebook={notebook} />
      )}

      <nav className={'page-nav'} aria-label={'Encounter navigation'}>
        <a href={previous}>{position === 1 ? 'Back to start' : `Previous: ${encounters[experience.order[position - 2]].number}`}</a>
        <a href={'#/notebook'}>My notes</a>
        <a className={'button primary'} href={next}>{isLast ? 'Look back' : `Next: ${nextEncounter.number}, ${nextEncounter.title}`}</a>
      </nav>
    </article>
  )
}
