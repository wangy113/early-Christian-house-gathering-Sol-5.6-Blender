import { useId } from 'react'
import { MAX_FIELD_LENGTH } from '../state/notebookSchema.js'

const WARN_AT = MAX_FIELD_LENGTH - 1000

/** Labelled optional textarea with a visible length limit near the maximum. */
export function TextField({ label, hint, value, onChange, onBlur, rows = 3 }) {
  const id = useId()
  const remaining = MAX_FIELD_LENGTH - value.length
  return (
    <div className={'field'}>
      <label htmlFor={id}>{label}</label>
      {hint ? <p className={'field-hint'} id={`${id}-hint`}>{hint}</p> : null}
      <textarea
        id={id}
        value={value}
        rows={rows}
        maxLength={MAX_FIELD_LENGTH}
        aria-describedby={hint || value.length > WARN_AT ? [hint ? `${id}-hint` : '', value.length > WARN_AT ? `${id}-limit` : ''].join(' ').trim() : undefined}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      />
      {value.length > WARN_AT ? (
        <p className={'field-limit'} id={`${id}-limit`}>
          {remaining.toLocaleString('en-US')} characters left. This short-note space holds up to {MAX_FIELD_LENGTH.toLocaleString('en-US')} characters.
        </p>
      ) : null}
    </div>
  )
}
