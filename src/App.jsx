import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import { experience } from './content/experience.js'
import { useNotebook } from './state/useNotebook.js'
import { parseHash } from './lib/routes.js'
import { Contents } from './components/Contents.jsx'
import { SaveStatus, StorageNotices } from './components/SaveStatus.jsx'
import { StartPage } from './components/StartPage.jsx'
import { EncounterPage } from './components/EncounterPage.jsx'
import { NotebookPage } from './components/NotebookPage.jsx'
import { ClosingPage } from './components/ClosingPage.jsx'
import { NotFoundPage } from './components/NotFoundPage.jsx'

const focusById = (id) => {
  const element = document.getElementById(id)
  if (!element) return
  element.focus({ preventScroll: true })
  element.scrollIntoView({ block: 'start' })
}

function App() {
  const notebook = useNotebook()
  const { dispatch, flush, counts, state } = notebook
  const [route, setRoute] = useState(() => parseHash(window.location.hash))
  const [navigations, setNavigations] = useState(0)
  const firstRender = useRef(true)

  // One place records visits, whatever caused the route change:
  // contents, Next/Previous, a deep link, reload, or browser Back/Forward.
  useEffect(() => {
    if (route.name === 'encounter') dispatch({ type: 'VISIT_ENCOUNTER', id: route.id })
  }, [route, dispatch])

  useEffect(() => {
    if (route.empty) window.history.replaceState(null, '', '#/start')
    const onHashChange = () => {
      flush()
      setRoute(parseHash(window.location.hash))
      setNavigations((count) => count + 1)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [flush, route.empty])

  // Move focus to the new page heading only after a user-initiated change.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    focusById('page-heading')
  }, [navigations])

  useEffect(() => {
    const page =
      route.name === 'encounter'
        ? `Picture ${experience.order.indexOf(route.id) + 1} of 6`
        : { start: 'Start', notebook: 'My reconstruction', closing: 'Your reconstruction', 'not-found': 'Not found' }[route.name]
    document.title = `${page} · ${experience.shortTitle}`
  }, [route])

  const skipTo = useCallback((id) => (event) => {
    event.preventDefault()
    focusById(id)
  }, [])

  const descriptionsOnly = state.preferences.descriptionsOnly

  let page
  if (route.name === 'start') page = <StartPage notebook={notebook} />
  else if (route.name === 'encounter') page = <EncounterPage key={route.id} id={route.id} notebook={notebook} />
  else if (route.name === 'notebook') page = <NotebookPage notebook={notebook} />
  else if (route.name === 'closing') page = <ClosingPage notebook={notebook} />
  else page = <NotFoundPage />

  return (
    <div className={'app-shell'}>
      <a className={'skip-link'} href={'#/start'} onClick={skipTo('main-content')}>Skip to main content</a>
      <header className={'site-header'}>
        <a className={'brand'} href={'#/start'}>
          <span className={'brand-mark'} aria-hidden={'true'} />
          <span className={'brand-name'}>{experience.shortTitle}</span>
          <span className={'brand-tag'}>Rome · c. AD 160</span>
        </a>
        <div className={'site-status'}>
          <p className={'progress-text'}>
            {counts.visitedCount} of {counts.total} pictures explored · {counts.sortedCount} sorted
          </p>
          <SaveStatus status={notebook.status} />
          {descriptionsOnly ? <p className={'mode-text'}>Descriptions only</p> : null}
        </div>
      </header>
      <StorageNotices notebook={notebook} />
      <div className={'layout'}>
        <Contents route={route} state={state} />
        <main id={'main-content'} tabIndex={-1}>
          {page}
        </main>
      </div>
    </div>
  )
}

export default App
