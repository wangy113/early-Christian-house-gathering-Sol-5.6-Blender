import { useId, useState } from 'react'
import { experience } from '../content/experience.js'
import { encounters } from '../content/encounters.js'
import { entryHasNotes } from '../state/notebookSchema.js'
import { encounterHash } from '../lib/routes.js'
import { EntrySummary } from './EntrySummary.jsx'
import { ExportActions } from './ExportActions.jsx'
import { TextField } from './TextField.jsx'

export function ClosingPage({ notebook }) {
  const { state, dispatch, flush } = notebook
  const withNotes = experience.order.filter((id) => entryHasNotes(state.entries[id]))
  const [selected, setSelected] = useState('')
  const selectId = useId()
  const { closing } = experience

  return (
    <article className={'page closing-page'}>
      <h1 id={'page-heading'} tabIndex={-1}>{closing.heading}</h1>
      {closing.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

      {state.openingThought.trim() ? (
        <figure className={'recall'}>
          <figcaption>At the start you wrote, in answer to “{experience.openingPrompt}”</figcaption>
          <blockquote>{state.openingThought}</blockquote>
        </figure>
      ) : null}

      {withNotes.length ? (
        <div className={'field'}>
          <label htmlFor={selectId}>Show one of your earlier notes</label>
          <select id={selectId} value={selected} onChange={(event) => setSelected(event.target.value)}>
            <option value={''}>Choose an encounter…</option>
            {withNotes.map((id) => (
              <option key={id} value={id}>{encounters[id].number}: {encounters[id].title}</option>
            ))}
          </select>
          {selected ? <EntrySummary encounter={encounters[selected]} entry={state.entries[selected]} /> : null}
        </div>
      ) : (
        <p>You have not recorded notes in an encounter. You can revisit any of them below.</p>
      )}

      <TextField
        label={`${closing.prompt} (optional)`}
        value={state.closingThought}
        onChange={(value) => dispatch({ type: 'EDIT_CLOSING', value })}
        onBlur={flush}
        rows={4}
      />

      <section aria-labelledby={'closing-actions'}>
        <h2 id={'closing-actions'}>Revisit an encounter</h2>
        <ul className={'revisit-list'}>
          {experience.order.map((id) => (
            <li key={id}><a href={encounterHash(id)}>{encounters[id].number}: {encounters[id].title}</a></li>
          ))}
        </ul>
        <p><a className={'button'} href={'#/notebook'}>Review my notes</a></p>
        <ExportActions state={state} />
      </section>

      <p className={'ending'}>{closing.ending}</p>
    </article>
  )
}
