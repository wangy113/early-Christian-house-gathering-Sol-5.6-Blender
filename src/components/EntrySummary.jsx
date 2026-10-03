import { experience } from '../content/experience.js'
import { choiceLabel } from '../lib/notebookExport.js'

const EMPTY = experience.notebook.empty

function Item({ label, text }) {
  const filled = typeof text === 'string' && text.trim() !== ''
  return (
    <>
      <dt>{label}</dt>
      <dd className={filled ? 'learner-text' : 'empty-note'}>{filled ? text : EMPTY}</dd>
    </>
  )
}

function Choice({ label, encounter, choiceId }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{choiceLabel(encounter.id, choiceId) ?? 'No choice selected.'}</dd>
    </>
  )
}

/** Read-only view of one encounter's learner text. Shows only what the learner entered. */
export function EntrySummary({ encounter, entry }) {
  if (encounter.kind === 'brief') {
    return (
      <dl className={'entry-summary'}>
        <Choice label={'Selected'} encounter={encounter} choiceId={entry.choiceId} />
        <Item label={'Note'} text={entry.note} />
      </dl>
    )
  }
  const first = entry.firstSnapshot
  if (!first) {
    return (
      <dl className={'entry-summary'}>
        <Item label={'I can see…'} text={entry.observation} />
        <Item label={'I am assuming…'} text={entry.assumption} />
        <Choice label={'Recommendation'} encounter={encounter} choiceId={entry.choiceId} />
        <Item label={'My reason'} text={entry.reason} />
      </dl>
    )
  }
  return (
    <div className={'entry-summary-grid'}>
      <div>
      <h3 className={'small-heading'}>First response</h3>
      <dl className={'entry-summary'}>
        <Item label={'I could see…'} text={first.observation} />
        <Item label={'I was assuming…'} text={first.assumption} />
        <Choice label={'First recommendation'} encounter={encounter} choiceId={first.choiceId} />
        <Item label={'My reason'} text={first.reason} />
      </dl>
      </div>
      <div>
      <h3 className={'small-heading'}>My thinking now</h3>
      <dl className={'entry-summary'}>
        <Choice label={'Recommendation now'} encounter={encounter} choiceId={entry.revisedChoiceId} />
        <Item label={'My thinking now'} text={entry.currentThinking} />
      </dl>
      </div>
    </div>
  )
}
