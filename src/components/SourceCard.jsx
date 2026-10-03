import { sources } from '../content/sources.js'

/** A bundled source summary with its setting and limit. Expanding records "opened", not "read". */
export function SourceCard({ sourceId, onOpen }) {
  const source = sources[sourceId]
  return (
    <details className={'source-card'} onToggle={(event) => event.currentTarget.open && onOpen?.(sourceId)}>
      <summary>
        <span className={'tag tag-source'}>Historical source</span>
        <span className={'source-title'}>{source.work} {source.passage}</span>
        <span className={'source-setting'}>{source.setting}</span>
      </summary>
      <dl>
        <dt>Kind of text</dt>
        <dd>{source.genre}</dd>
        <dt>Summary (attributed paraphrase, not a quotation)</dt>
        <dd>{source.summary}</dd>
        <dt>What this source cannot establish</dt>
        <dd>{source.limit}</dd>
        {source.readingAid ? (
          <>
            <dt>Reading aid</dt>
            <dd>{source.readingAid}</dd>
          </>
        ) : null}
      </dl>
      <p>
        <a href={source.url} target={'_blank'} rel={'noopener noreferrer'}>
          Read the full passage (optional, opens an external site in a new tab)
        </a>
      </p>
    </details>
  )
}
