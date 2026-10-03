import { experience } from '../content/experience.js'
import { encounters } from '../content/encounters.js'
import { encounterHash } from '../lib/routes.js'
import { choiceLabel, verdictLabel } from '../lib/notebookExport.js'
import { ExportActions } from './ExportActions.jsx'
import { ReconstructionBoard } from './ReconstructionBoard.jsx'
import { Wave } from './Wave.jsx'

export function ClosingPage({ notebook }) {
  const { state } = notebook
  const { closing } = experience

  return (
    <article className={'page closing-page'}>
      <header className={'page-hero'}>
        <p className={'pill pill-mustard'}>Look back</p>
        <h1 id={'page-heading'} tabIndex={-1}>{closing.heading}</h1>
        <p className={'lead'}>{closing.intro}</p>
      </header>

      <section className={'step tone-orange'} aria-labelledby={'board-heading'}>
        <Wave />
        <div className={'step-inner'}>
          <h2 id={'board-heading'}>What the pictures show, what the sources support, what remains imagined</h2>
          <ReconstructionBoard state={state} />
        </div>
      </section>

      <section className={'step tone-mustard'} aria-labelledby={'rulings-heading'}>
        <Wave />
        <div className={'step-inner'}>
          <h2 id={'rulings-heading'}>Your rulings and decisions</h2>
          <ul className={'ruling-list'}>
            {experience.order.map((id) => {
              const item = encounters[id]
              const entry = state.entries[id]
              const first = item.kind === 'deep' && entry.firstSnapshot ? choiceLabel(id, entry.firstSnapshot.choiceId) : choiceLabel(id, entry.choiceId)
              const now = item.kind === 'deep' && entry.firstSnapshot ? choiceLabel(id, entry.revisedChoiceId) : null
              return (
                <li key={id} className={'card ruling-card'}>
                  <a href={encounterHash(id)} className={'ruling-title'}>{item.number}: {item.title}</a>
                  <p><span className={'ruling-label'}>Case question:</span> {item.caseQuestion}</p>
                  <p><span className={'ruling-label'}>Your ruling:</span> {verdictLabel(id, entry.verdictId) ?? 'No ruling yet'}</p>
                  <p>
                    <span className={'ruling-label'}>Your advice:</span> {first ?? 'No choice made'}
                    {now && now !== first ? <> → now: {now}</> : null}
                  </p>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className={'step tone-green'} aria-labelledby={'carry-heading'}>
        <Wave />
        <div className={'step-inner'}>
          <h2 id={'carry-heading'}>Questions to carry forward</h2>
          <ol className={'carry-list'}>
            {closing.questions.map((question) => <li key={question}>{question}</li>)}
          </ol>
          <p className={'step-intro'}>{closing.questionsNote}</p>
          <div className={'button-row'}>
            <a className={'button'} href={'#/notebook'}>Review my reconstruction</a>
          </div>
          <ExportActions state={state} />
          <p className={'ending'}>{closing.ending}</p>
        </div>
      </section>
    </article>
  )
}
