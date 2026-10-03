import { useId } from 'react'
import { experience } from '../content/experience.js'
import { encounters, sortPlaces, supportLabels } from '../content/encounters.js'
import { SORT_PLACES, UNSURE } from '../state/notebookSchema.js'
import { choiceLabel } from '../lib/notebookExport.js'
import { encounterHash, neighbours } from '../lib/routes.js'
import { HotspotImage } from './HotspotImage.jsx'
import { SourceCard } from './SourceCard.jsx'
import { Tag } from './Tag.jsx'
import { kindForLabel } from '../lib/labels.js'
import { Wave } from './Wave.jsx'

function ChoiceGroup({ legend, name, options, value, onChange, className = 'choices' }) {
  return (
    <fieldset className={className}>
      <legend>{legend}</legend>
      {options.map((option) => (
        <label key={option.id} className={'choice'}>
          <input type={'radio'} name={name} value={option.id} checked={value === option.id} onChange={() => onChange(option.id)} />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  )
}

function Response({ encounter, choiceId }) {
  const choice = encounter.choices.find((item) => item.id === choiceId)
  if (!choice) {
    return (
      <div className={'response'}>
        <Tag kind={'interpretation'}>{experience.labels.interpretation}</Tag>
        <p>{encounter.neutralFeedback}</p>
      </div>
    )
  }
  return (
    <div className={'response'}>
      <Tag kind={kindForLabel(encounter.feedbackLabel)}>{encounter.feedbackLabel}</Tag>
      <p className={'response-for'}>In response to: {choice.label}</p>
      {choice.support ? <p className={`support is-${choice.support}`}>{supportLabels[choice.support]}</p> : null}
      <p className={'response-text'}>{choice.feedback}</p>
      <p className={'follow-up'}><strong>Question to consider: </strong>{choice.followUp}</p>
    </div>
  )
}

function OtherResponses({ encounter, choiceId }) {
  return (
    <details className={'other-responses'}>
      <summary>Read the responses to the other options</summary>
      <ul>
        {encounter.choices.filter((item) => item.id !== choiceId).map((choice) => (
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

function Recall({ recall, state }) {
  if (!recall) return null
  const earlier = encounters[recall.encounterId]
  const entry = state.entries[recall.encounterId]
  const first = entry.firstSnapshot ? choiceLabel(earlier.id, entry.firstSnapshot.choiceId) : choiceLabel(earlier.id, entry.choiceId)
  const now = entry.firstSnapshot ? choiceLabel(earlier.id, entry.revisedChoiceId) : null
  return (
    <aside className={'recall card'} aria-labelledby={`recall-${recall.encounterId}`}>
      <h3 id={`recall-${recall.encounterId}`} className={'small-heading'}>{recall.heading}</h3>
      {first ? (
        <>
          <p>In {earlier.number} you recommended: <strong>{first}</strong>{now ? <> Now: <strong>{now}</strong></> : null}</p>
          <p>{recall.question}</p>
        </>
      ) : (
        <p>
          You have not made a recommendation in {earlier.number} yet. You can{' '}
          <a href={encounterHash(earlier.id)}>visit {earlier.number}: {earlier.title}</a> at any time, or continue here.
        </p>
      )}
    </aside>
  )
}

function DecideStep({ encounter, entry, dispatch }) {
  const id = encounter.id
  const name = useId()
  const deep = encounter.kind === 'deep'
  const captured = deep && entry.firstSnapshot !== null
  const respondTo = deep ? entry.firstSnapshot?.choiceId ?? null : entry.choiceId

  return (
    <>
      <div className={'situation card'}>
        <Tag kind={kindForLabel(encounter.situation.label)}>{encounter.situation.label}</Tag>
        {encounter.situation.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
      {captured ? (
        <p className={'first-choice'}>
          Your first recommendation: <strong>{choiceLabel(id, entry.firstSnapshot.choiceId) ?? 'No choice made'}</strong>. It stays as it was.
        </p>
      ) : (
        <ChoiceGroup
          legend={encounter.decisionPrompt}
          name={`${name}-first`}
          options={encounter.choices}
          value={entry.choiceId}
          onChange={(choiceId) => dispatch({ type: 'CHOOSE', id, choiceId })}
        />
      )}
      {!entry.perspectivesRevealed ? (
        <button
          type={'button'}
          className={'primary'}
          onClick={() => dispatch({ type: 'REVEAL_PERSPECTIVE', id, capturedAt: new Date().toISOString() })}
        >
          See a response
        </button>
      ) : (
        <div aria-live={'polite'} className={'stack'}>
          <Response encounter={encounter} choiceId={respondTo} />
          {encounter.perspective ? (
            <div className={'perspective card'}>
              <Tag kind={'fiction'}>{encounter.perspective.label}</Tag>
              <p className={'voice'}>{encounter.perspective.text}</p>
            </div>
          ) : null}
          <OtherResponses encounter={encounter} choiceId={respondTo} />
        </div>
      )}
      {captured ? (
        <ChoiceGroup
          legend={'Your view now (optional). Keeping the same view is fine.'}
          name={`${name}-now`}
          options={[...encounter.choices, { id: UNSURE, label: 'Still unsure' }]}
          value={entry.revisedChoiceId}
          onChange={(choiceId) => dispatch({ type: 'CHOOSE', id, choiceId })}
        />
      ) : null}
    </>
  )
}

function RuleStep({ encounter, entry, dispatch }) {
  const id = encounter.id
  const name = useId()
  return (
    <>
      <p className={'step-intro'}>Use the clues you collected from the picture, the voices, and the sources.</p>
      <ChoiceGroup
        legend={`My ruling: ${encounter.caseQuestion}`}
        name={name}
        options={encounter.verdicts}
        value={entry.verdictId}
        onChange={(verdictId) => dispatch({ type: 'SET_VERDICT', id, verdictId })}
        className={'choices verdicts'}
      />
      {!entry.verdictRevealed ? (
        <button type={'button'} className={'primary'} onClick={() => dispatch({ type: 'REVEAL_VERDICT', id })}>
          See how a historian might rule
        </button>
      ) : (
        <div className={'stack'} aria-live={'polite'}>
          <p>
            {entry.verdictId
              ? <>You ruled <strong>{encounter.verdicts.find((v) => v.id === entry.verdictId).label}</strong>. Historians could defend more than one ruling here. What matters is the reasoning.</>
              : 'Here is how each ruling could be argued.'}
          </p>
          {encounter.verdicts.map((verdict) => (
            <div key={verdict.id} className={verdict.id === entry.verdictId ? 'response is-mine' : 'response'}>
              <Tag kind={'interpretation'}>{experience.labels.interpretation}</Tag>
              <p><strong>{verdict.label}.</strong> {verdict.why}</p>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function SortStep({ encounter, entry, dispatch }) {
  const id = encounter.id
  const name = useId()
  return (
    <>
      <p className={'step-intro'}>Where does each statement come from? Choose one place for each. You can change your mind at any time.</p>
      <div className={'sort-list'}>
        {encounter.sort.map((statement) => {
          const placed = entry.sorts[statement.id] ?? null
          return (
            <fieldset key={statement.id} className={'sort-item'}>
              <legend>{statement.text}</legend>
              <div className={'sort-options'}>
                {SORT_PLACES.map((place) => (
                  <label key={place} className={`sort-option place-${place}`}>
                    <input
                      type={'radio'}
                      name={`${name}-${statement.id}`}
                      value={place}
                      checked={placed === place}
                      onChange={() => dispatch({ type: 'SORT_STATEMENT', id, statementId: statement.id, place })}
                    />
                    <span>{sortPlaces[place]}</span>
                  </label>
                ))}
              </div>
              {entry.sortRevealed ? (
                <p className={'sort-why'}>
                  {!placed
                    ? <>A historian would place this under <strong>{sortPlaces[statement.answer]}</strong>.</>
                    : placed === statement.answer
                      ? <>You placed this under <strong>{sortPlaces[placed]}</strong>, and a historian would too.</>
                      : <>You placed this under {sortPlaces[placed]}. It fits better under <strong>{sortPlaces[statement.answer]}</strong>.</>}{' '}
                  {statement.why}
                </p>
              ) : null}
            </fieldset>
          )
        })}
      </div>
      {!entry.sortRevealed ? (
        <button type={'button'} className={'primary'} onClick={() => dispatch({ type: 'REVEAL_SORT', id })}>
          See how a historian might sort these
        </button>
      ) : null}
    </>
  )
}

function Step({ number, title, id, children, tone }) {
  return (
    <section className={`step tone-${tone}`} aria-labelledby={id}>
      <Wave />
      <div className={'step-inner'}>
        <div className={'step-head'}>
          <span className={'step-badge'} aria-hidden={'true'}>{number}</span>
          <h2 id={id}>{title}</h2>
        </div>
        {children}
      </div>
    </section>
  )
}

export function EncounterPage({ id, notebook }) {
  const encounter = encounters[id]
  const { state, dispatch } = notebook
  const entry = state.entries[id]
  const position = experience.order.indexOf(id) + 1
  const { previous, next, isLast } = neighbours(id)
  const nextEncounter = encounters[experience.order[position]]

  return (
    <article className={'page encounter-page'}>
      <header className={'page-hero'}>
        <p className={'pill pill-mustard'}>Picture {position} of {experience.order.length} · {encounter.number}</p>
        <h1 id={'page-heading'} tabIndex={-1}>{encounter.title}</h1>
        <div className={'case card'}>
          <p className={'case-label'}>Case question for this picture</p>
          <p className={'case-question'}>{encounter.caseQuestion}</p>
          <p className={'step-intro'}>Collect clues as you explore. You will give your ruling in step 3.</p>
        </div>
      </header>

      <Step number={1} title={'Look closely'} id={`${id}-look`} tone={'orange'}>
        <p className={'step-intro'}>Open the numbered details. Each tells you what is in the picture, what a source says, and what the picture cannot tell us.</p>
        <HotspotImage
          encounter={encounter}
          entry={entry}
          descriptionsOnly={state.preferences.descriptionsOnly}
          hideMarkers={state.preferences.hideMarkers}
          onToggleMarkers={() => dispatch({ type: 'SET_MARKERS_HIDDEN', hidden: !state.preferences.hideMarkers })}
          onOpenHotspot={(hotspotId) => dispatch({ type: 'OPEN_HOTSPOT', id, hotspotId })}
          onOpenFrame={(frameId) => dispatch({ type: 'OPEN_FRAME_QUESTION', id, frameId })}
        />
      </Step>

      <Step number={2} title={'What would you advise?'} id={`${id}-decide`} tone={'mustard'}>
        <Recall recall={encounter.recall} state={state} />
        <DecideStep encounter={encounter} entry={entry} dispatch={dispatch} />
      </Step>

      <Step number={3} title={'Rule on the case'} id={`${id}-rule`} tone={'green'}>
        <RuleStep encounter={encounter} entry={entry} dispatch={dispatch} />
      </Step>

      <Step number={4} title={'Sort what you learned'} id={`${id}-sort`} tone={'cream'}>
        <SortStep encounter={encounter} entry={entry} dispatch={dispatch} />
      </Step>

      <section className={'sources'} aria-labelledby={`${id}-sources`}>
        <h2 id={`${id}-sources`}>Sources for comparison</h2>
        <p>{experience.sourceIntroduction}</p>
        {encounter.sourceNote ? <p className={'source-note'}>{encounter.sourceNote}</p> : null}
        <div className={'source-grid'}>
          {encounter.sourceIds.map((sourceId) => (
            <SourceCard key={sourceId} sourceId={sourceId} onOpen={(opened) => dispatch({ type: 'OPEN_SOURCE', id, sourceId: opened })} />
          ))}
        </div>
      </section>

      <nav className={'page-nav'} aria-label={'Picture navigation'}>
        <a href={previous}>{position === 1 ? 'Back to start' : `Previous: ${encounters[experience.order[position - 2]].number}`}</a>
        <a href={'#/notebook'}>My reconstruction</a>
        <a className={'button primary'} href={next}>{isLast ? 'See your reconstruction' : `Next: ${nextEncounter.number}, ${nextEncounter.title}`}</a>
      </nav>
    </article>
  )
}
