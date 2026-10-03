import { useState } from 'react'
import { assetUrl } from '../lib/assetUrl.js'
import { downloadText, fileStamp } from '../lib/notebookExport.js'
import { ExportActions } from './ExportActions.jsx'

const labels = {
  idle: 'Nothing saved yet',
  pending: 'Changes pending',
  saved: 'Saved on this browser',
  failed: 'Not saved on this browser',
  suspended: 'Saving paused',
}

export function SaveStatus({ status }) {
  return <p className={`save-status is-${status.kind}`}>{labels[status.kind]}</p>
}

const failureText = {
  unavailable: 'This browser is not letting the page save your work.',
  denied: 'This browser refused to save your work.',
  full: 'Browser storage is full, so your latest changes could not be saved.',
  reset: 'Your saved work could not be removed, so nothing was reset. Your work is unchanged.',
}

/** Visible, announced storage problems with immediate ways to keep the text. */
export function StorageNotices({ notebook }) {
  const { status, state, conflict, loadSaved, keepThisTab, recovery, beginFresh } = notebook
  const [confirmFresh, setConfirmFresh] = useState(false)

  if (recovery) {
    return (
      <section className={'notice is-warning'} role={'alert'} aria-labelledby={'recovery-heading'}>
        <h2 id={'recovery-heading'}>Saved work could not be opened</h2>
        <p>{recovery.message} The stored data has not been changed or deleted. Saving is paused so it cannot be overwritten.</p>
        <div className={'button-row'}>
          <button type={'button'} onClick={() => downloadText(`at-the-threshold-stored-data-${fileStamp()}.json`, recovery.raw ?? '', 'application/json')}>
            Download the stored data
          </button>
          {confirmFresh ? null : <button type={'button'} onClick={() => setConfirmFresh(true)}>Begin fresh…</button>}
        </div>
        {confirmFresh ? (
          <div className={'confirm-panel'}>
            <p>Beginning fresh will replace the stored data on this browser the next time your work is saved. Download it first if you may need it.</p>
            <div className={'button-row'}>
              <button type={'button'} onClick={beginFresh}>Begin fresh and replace stored data</button>
              <button type={'button'} onClick={() => setConfirmFresh(false)}>Cancel</button>
            </div>
          </div>
        ) : null}
      </section>
    )
  }

  if (conflict) {
    return (
      <section className={'notice is-warning'} role={'alert'} aria-labelledby={'conflict-heading'}>
        <h2 id={'conflict-heading'}>Your work changed in another tab</h2>
        <p>
          Saving in this tab is paused so neither version is silently overwritten. Download this tab's version first if you want
          to keep it, then choose which version to continue with. Using one tab at a time avoids this.
        </p>
        <ExportActions state={state} compact />
        <div className={'button-row'}>
          <button type={'button'} onClick={loadSaved}>Load the saved version</button>
          <button type={'button'} onClick={keepThisTab}>Keep this tab's version</button>
        </div>
      </section>
    )
  }

  if (status.kind === 'failed') {
    return (
      <section className={'notice is-error'} role={'alert'} aria-labelledby={'failure-heading'}>
        <h2 id={'failure-heading'}>Not saved on this browser</h2>
        <p>
          {failureText[status.reason] ?? failureText.denied} Your work is still on this page, but reloading or closing it
          can lose anything not saved. Copy or download your reconstruction now, or use the{' '}
          <a href={assetUrl('experience-packet.html')}>offline experience</a>.
        </p>
        <ExportActions state={state} compact />
      </section>
    )
  }

  return null
}
