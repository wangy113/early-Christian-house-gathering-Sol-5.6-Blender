import { useRef, useState } from 'react'
import { downloadText, copyText, fileStamp, notesToText } from '../lib/notebookExport.js'

/** Copy / download the learner's live notes (including text not yet saved). */
export function ExportActions({ state, compact = false }) {
  const [message, setMessage] = useState('')
  const [fallback, setFallback] = useState(null)
  const fallbackRef = useRef(null)

  const copy = async () => {
    const text = notesToText(state, { format: 'text', exportedAt: new Date().toLocaleString() })
    if (await copyText(text)) {
      setFallback(null)
      setMessage('Notes copied to the clipboard.')
    } else {
      setFallback(text)
      setMessage('Copying is not available here. Select the text below and copy it yourself.')
      setTimeout(() => fallbackRef.current?.select(), 0)
    }
  }

  const download = () => {
    const text = notesToText(state, { format: 'markdown', exportedAt: new Date().toLocaleString() })
    downloadText(`at-the-threshold-notes-${fileStamp()}.md`, text, 'text/markdown;charset=utf-8')
    setMessage('Notes downloaded as a Markdown text file.')
  }

  return (
    <div className={compact ? 'export-actions compact' : 'export-actions'}>
      <div className={'button-row'}>
        <button type={'button'} onClick={copy}>Copy notes</button>
        <button type={'button'} onClick={download}>Download notes</button>
      </div>
      <p className={'action-message'} role={'status'}>{message}</p>
      {fallback ? (
        <label className={'field'}>
          <span>Your notes as plain text</span>
          <textarea ref={fallbackRef} readOnly value={fallback} rows={8} />
        </label>
      ) : null}
    </div>
  )
}
