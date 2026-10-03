import { useEffect, useRef } from 'react'

/** Optional enlargement in a native modal dialog: named, Escape closes, focus returns to the trigger. */
export function ImageDialog({ open, onClose, title, src, alt }) {
  const dialogRef = useRef(null)
  const closeRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      closeRef.current?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className={'image-dialog'}
      aria-labelledby={'image-dialog-title'}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <div className={'image-dialog-bar'}>
        <h2 id={'image-dialog-title'}>{title} — full-size modern reconstruction</h2>
        <button ref={closeRef} type={'button'} onClick={onClose}>Close</button>
      </div>
      {open ? <img src={src} alt={alt} /> : null}
    </dialog>
  )
}
