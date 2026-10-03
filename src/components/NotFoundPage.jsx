export function NotFoundPage() {
  return (
    <article className={'page'}>
      <h1 id={'page-heading'} tabIndex={-1}>That section was not found</h1>
      <p>The link may be mistyped or out of date. Your notes have not been changed.</p>
      <p><a className={'button primary'} href={'#/start'}>Go to the start</a></p>
    </article>
  )
}
