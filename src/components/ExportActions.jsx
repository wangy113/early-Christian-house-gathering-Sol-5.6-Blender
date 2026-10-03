import { useRef, useState } from 'react'
import { downloadText, copyText, fileStamp, reconstructionToText } from '../lib/notebookExport.js'

/** Copy / download the learner's reconstruction (including changes not yet saved). */
export function ExportActions({ state, compact = false }) {
  const [message, setMessage] = useState('')
  const [fallback, setFallback] = useState(null)
  const fallbackRef = useRef(null)

  const copy = async () => {
    const text = reconstructionToText(state, { format: 'text', exportedAt: new Date().toLocaleString() })
    if (await copyText(text)) {
      setFallback(null)
      setMessage('Your reconstruction was copied to the clipboard.')
    } else {
      setFallback(text)
      setMessage('Copying is not available here. Select the text below and copy it yourself.')
      setTimeout(() => fallbackRef.current?.select(), 0)
    }
  }

  const download = () => {
    const text = reconstructionToText(state, { format: 'markdown', exportedAt: new Date().toLocaleString() })
    downloadText(`at-the-threshold-reconstruction-${fileStamp()}.md`, text, 'text/markdown;charset=utf-8')
    setMessage('Your reconstruction was downloaded as a Markdown text file.')
  }

  return (
    <div className={compact ? 'export-actions compact' : 'export-actions'}>
      <div className={'button-row'}>
        <button type={'button'} onClick={copy}>Copy my reconstruction</button>
        <button type={'button'} onClick={download}>Download my reconstruction</button>
      </div>
      <p className={'action-message'} role={'status'}>{message}</p>
      {fallback ? (
        <label className={'field'}>
          <span>Your reconstruction as plain text</span>
          <textarea ref={fallbackRef} readOnly value={fallback} rows={8} />
        </label>
      ) : null}
    </div>
  )
}
