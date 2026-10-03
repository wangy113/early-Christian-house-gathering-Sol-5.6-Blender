import { useState } from 'react'
import { experience } from '../content/experience.js'
import { encounters } from '../content/encounters.js'
import { sources } from '../content/sources.js'
import { encounterHash } from '../lib/routes.js'
import { backupToJson, downloadText, encounterSummary, fileStamp, parseBackup, reconstructionToText } from '../lib/notebookExport.js'
import { ExportActions } from './ExportActions.jsx'
import { ReconstructionBoard } from './ReconstructionBoard.jsx'
import { SaveStatus } from './SaveStatus.jsx'

const downloadReconstruction = (state) =>
  downloadText(`at-the-threshold-reconstruction-${fileStamp()}.md`, reconstructionToText(state, { exportedAt: new Date().toLocaleString() }), 'text/markdown;charset=utf-8')

const downloadBackup = (state) => downloadText(`at-the-threshold-backup-${fileStamp()}.json`, backupToJson(state), 'application/json')

function RestoreBackup({ notebook }) {
  const { state, restore } = notebook
  const [pending, setPending] = useState(null)
  const [message, setMessage] = useState('')

  const onFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    setPending(null)
    if (!file) return
    if (file.size > 1024 * 1024) {
      setMessage('That file is larger than 1 MiB, so it is not a backup from this experience. Nothing was changed.')
      return
    }
    const result = parseBackup(await file.text(), file.size)
    if (!result.ok) {
      setMessage(`${result.message} Nothing was changed.`)
      return
    }
    setMessage('')
    setPending({ name: file.name, state: result.state })
  }

  return (
    <div className={'restore'}>
      <label className={'field'}>
        <span>Restore backup (a .json file downloaded from this experience)</span>
        <input type={'file'} accept={'application/json,.json'} onChange={onFile} />
      </label>
      <p className={'action-message'} role={'status'}>{message}</p>
      {pending ? (
        <div className={'confirm-panel'} role={'group'} aria-labelledby={'restore-confirm'}>
          <p id={'restore-confirm'}>
            Replace what is on this page with the backup “{pending.name}”
            {pending.state.updatedAt ? ` (last changed ${new Date(pending.state.updatedAt).toLocaleString()})` : ''}? Download the
            current version first if you want to keep it.
          </p>
          <div className={'button-row'}>
            <button type={'button'} onClick={() => downloadReconstruction(state)}>Download current version first</button>
            <button type={'button'} onClick={() => { restore(pending.state); setPending(null); setMessage('Backup restored.') }}>Replace with backup</button>
            <button type={'button'} onClick={() => { setPending(null); setMessage('Restore cancelled. Nothing was changed.') }}>Cancel</button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ResetNotebook({ notebook }) {
  const { state, reset } = notebook
  const [confirming, setConfirming] = useState(false)
  const [message, setMessage] = useState('')
  return (
    <div className={'reset'}>
      {confirming ? (
        <div className={'confirm-panel'} role={'group'} aria-labelledby={'reset-confirm'}>
          <p id={'reset-confirm'}>
            Starting over deletes everything recorded for {experience.shortTitle} in this browser: visits, details explored,
            choices, rulings, and sorting. It does not affect any other site or activity. This cannot be undone.
          </p>
          <div className={'button-row'}>
            <button type={'button'} onClick={() => downloadReconstruction(state)}>Download my reconstruction first</button>
            <button
              type={'button'}
              className={'danger'}
              onClick={() => {
                const ok = reset()
                setConfirming(false)
                setMessage(ok ? 'Everything was deleted. You are starting over.' : 'Your saved work could not be deleted, so nothing was reset.')
              }}
            >
              Delete and start over
            </button>
            <button type={'button'} onClick={() => { setConfirming(false); setMessage('Nothing was deleted.') }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button type={'button'} onClick={() => setConfirming(true)}>Start over…</button>
      )}
      <p className={'action-message'} role={'status'}>{message}</p>
    </div>
  )
}

export function NotebookPage({ notebook }) {
  const { state, status } = notebook
  return (
    <article className={'page notebook-page'}>
      <header className={'page-hero'}>
        <p className={'pill pill-mustard'}>Saved in this browser</p>
        <h1 id={'page-heading'} tabIndex={-1}>{experience.notebook.heading}</h1>
        <p className={'lead'}>{experience.notebook.explanation}</p>
        <SaveStatus status={status} />
        <ExportActions state={state} />
      </header>

      <section className={'notebook-section'} aria-labelledby={'nb-board'}>
        <h2 id={'nb-board'}>The gathering as you sorted it</h2>
        <ReconstructionBoard state={state} />
      </section>

      <section className={'notebook-section'} aria-labelledby={'nb-pictures'}>
        <h2 id={'nb-pictures'}>Picture by picture</h2>
        <div className={'entry-grid'}>
          {experience.order.map((id) => {
            const encounter = encounters[id]
            const entry = state.entries[id]
            return (
              <section key={id} className={'card notebook-entry'} aria-labelledby={`nb-${id}`}>
                <h3 id={`nb-${id}`}>{encounter.number}: {encounter.title}</h3>
                <p className={'entry-meta'}>
                  {entry.visited ? 'Visited' : 'Not visited yet'} · <a href={encounterHash(id)}>{entry.visited ? 'Revisit' : 'Go to'} {encounter.number}</a>
                </p>
                <dl className={'entry-summary'}>
                  {encounterSummary(state, id).map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <p className={'entry-sources'}>
                  Sources:{' '}
                  {encounter.sourceIds.map((sourceId, index) => (
                    <span key={sourceId}>
                      {index ? '; ' : ''}
                      <a href={sources[sourceId].url} target={'_blank'} rel={'noopener noreferrer'}>{sources[sourceId].work} {sources[sourceId].passage}</a>
                    </span>
                  ))}
                </p>
              </section>
            )
          })}
        </div>
      </section>

      <section className={'card notebook-controls'} aria-labelledby={'nb-controls'}>
        <h2 id={'nb-controls'}>Backup and other controls</h2>
        <p>A backup file lets you move your work to another browser or recover it later.</p>
        <div className={'button-row'}>
          <button type={'button'} onClick={() => downloadBackup(state)}>Download backup</button>
        </div>
        <RestoreBackup notebook={notebook} />
        <ResetNotebook notebook={notebook} />
      </section>
    </article>
  )
}
