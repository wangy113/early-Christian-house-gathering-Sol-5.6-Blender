import { sortPlaces } from '../content/encounters.js'
import { SORT_PLACES } from '../state/notebookSchema.js'
import { buildBoard } from '../lib/notebookExport.js'

/** The learner's sorted statements across all pictures, in three columns. */
export function ReconstructionBoard({ state }) {
  const board = buildBoard(state)
  return (
    <div className={'board'}>
      {SORT_PLACES.map((place) => (
        <section key={place} className={`board-column card place-${place}`} aria-labelledby={`board-${place}`}>
          <h3 id={`board-${place}`}>{sortPlaces[place]}</h3>
          {board[place].length ? (
            <ul>
              {board[place].map((item) => (
                <li key={`${item.encounterId}-${item.statementId}`}>
                  <span className={'board-number'}>{item.number}</span> {item.text}
                  {item.historian && item.historian !== place ? (
                    <small className={'board-note'}>A historian would place this under: {sortPlaces[item.historian]}</small>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className={'empty-note'}>Nothing sorted here yet.</p>
          )}
        </section>
      ))}
    </div>
  )
}
