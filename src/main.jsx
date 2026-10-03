import { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const packetHref = `${import.meta.env.BASE_URL}experience-packet.html`

// If the app fails while rendering, keep a usable route to the same content.
class AppErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className={'boot-fallback'} role={'alert'}>
        <h1>Something went wrong</h1>
        <p>
          The interactive page stopped working. Notes already saved in this browser have not been deleted. You can reload
          the page, or open the <a href={packetHref}>offline experience</a>, which has the same encounters and sources.
        </p>
      </div>
    )
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
)
