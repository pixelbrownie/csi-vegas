// App.jsx — root component
// Manages: view (landing/game), game state, API calls
// Renders: LandingPage → scroll → GamePage

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import axios from 'axios'
import LandingPage from './components/LandingPage.jsx'
import GamePage    from './components/GamePage.jsx'

// Build-time override (e.g. GitHub Actions secret). Runtime override: `public/api-config.json`.
const PRODUCTION_API_FALLBACK = 'https://csi-vegas.onrender.com'
const MIN_LOADING_MS = 1500

const ENV_API_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL)

function normalizeApiBaseUrl(raw) {
  let base = String(raw || '').trim()
  if (!base) return ''

  try {
    if (base.includes('://')) {
      const u = new URL(base)
      base = `${u.protocol}//${u.host}`
    }
  } catch {
    // ignore
  }

  return base.replace(/\/+$/, '')
}

function getApiErrorMessage(error, fallback) {
  if (!error?.response && typeof error?.message === 'string' && error.message.includes('Network Error')) {
    return 'Network error — blocked or wrong API URL. Check CORS and that the Render URL matches this app.'
  }
  if (error?.code === 'ECONNABORTED') {
    return 'Request timed out. Is the backend still waking up? Try again in a few seconds.'
  }
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string' && detail.trim()) return detail.trim()
  if (Array.isArray(detail) && detail.length) return String(detail[0]?.msg || fallback)
  return fallback
}

export default function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState(() => {
    if (ENV_API_URL) return ENV_API_URL
    if (import.meta.env.DEV) return 'http://localhost:8000'
    return PRODUCTION_API_FALLBACK
  })

  const [view,       setView]       = useState('landing')
  // idle | loading | playing | error | solved | failed | gameover
  const [gameState,  setGameState]  = useState('idle')
  const [case_,      setCase]       = useState(null)
  const [caseFile,   setCaseFile]   = useState('')
  const [loadError,  setLoadError]  = useState('')
  const [history,    setHistory]    = useState([])
  const [isThinking, setIsThinking] = useState(false)
  const [startTime,  setStartTime]  = useState(null)
  const gameRef = useRef(null)

  // After deploy, `api-config.json` can point at your Render URL without rebuilding env.
  useEffect(() => {
    if (ENV_API_URL) return
    let cancelled = false
    ;(async () => {
      try {
        const base = import.meta.env.BASE_URL || '/'
        const res = await fetch(`${base}api-config.json`, { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        const fromFile = normalizeApiBaseUrl(data?.apiBaseUrl)
        if (fromFile && !cancelled) setApiBaseUrl(fromFile)
      } catch {
        /* keep initial fallback */
      }
    })()
    return () => { cancelled = true }
  }, [])

  const api = useMemo(() => axios.create({
    baseURL: apiBaseUrl,
    timeout: 180000,
  }), [apiBaseUrl])

  const pingBackendWarmup = useCallback(() => {
    api.get('/wake').catch(() => {})
    api.get('/health').catch(() => {})
  }, [api])

  useEffect(() => {
    pingBackendWarmup()
  }, [pingBackendWarmup])

  useEffect(() => {
    if (import.meta.env.PROD && !ENV_API_URL) {
      // eslint-disable-next-line no-console
      console.warn(
        '[csi-vegas] No VITE_API_URL at build time — using',
        apiBaseUrl,
        '(from api-config.json or fallback). Set repo secret VITE_API_URL to lock the API.'
      )
    }
  }, [apiBaseUrl])

  const goToGame = () => {
    setView('game')
    setTimeout(() => gameRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
  }

  const startNewCase = useCallback(async () => {
    const startedAt = Date.now()
    const waitForMinimumLoading = async () => {
      const elapsed = Date.now() - startedAt
      if (elapsed < MIN_LOADING_MS) {
        await new Promise(resolve => setTimeout(resolve, MIN_LOADING_MS - elapsed))
      }
    }

    setGameState('loading')
    setLoadError('')
    setHistory([])
    setCase(null)
    setCaseFile('')
    setStartTime(null)
    try {
      const res = await api.post('/new-case')
      await waitForMinimumLoading()
      setCase(res.data.case)
      setCaseFile(res.data.case_file)
      setStartTime(Date.now())
      setGameState('playing')
    } catch (error) {
      await waitForMinimumLoading()
      const msg = getApiErrorMessage(error, 'Backend not reachable. Check API URL and backend logs.')
      setLoadError(msg)
      setCaseFile('')
      setGameState('error')
    }
  }, [api])

  useEffect(() => {
    if (view === 'game' && gameState === 'idle') startNewCase()
  }, [view, gameState, startNewCase])

  const sendMessage = useCallback(async (message) => {
    if (!message.trim() || isThinking || gameState !== 'playing' || !case_) return

    const userMsg = { role: 'user', content: message }
    setHistory(prev => [...prev, userMsg])
    setIsThinking(true)

    try {
      const res = await api.post('/chat', {
        message,
        case: case_,
        case_file: caseFile,
        history: [...history, userMsg],
      })
      setCaseFile(res.data.updated_case_file)
      setHistory(prev => [...prev, {
        role:    'assistant',
        content: res.data.response,
        agent:   res.data.agent,
      }])
    } catch (error) {
      const msg = getApiErrorMessage(error, 'Connection lost. Try again.')
      setHistory(prev => [...prev, {
        role:    'assistant',
        content: `System error: ${msg}`,
        agent:   '⚠️ System',
      }])
    } finally {
      setIsThinking(false)
    }
  }, [case_, caseFile, history, isThinking, gameState, api])

  const accuse = useCallback((guess) => {
    if (!case_) return
    const c = case_.culprit.toLowerCase()
    const g = guess.toLowerCase()
    setGameState(g.includes(c) || c.includes(g) ? 'solved' : 'failed')
  }, [case_])

  const handleTimeUp = useCallback(() => {
    if (gameState === 'playing') setGameState('gameover')
  }, [gameState])

  const LoadingScreen = () => {
    const [displayed, setDisplayed] = useState('')
    const [glitch, setGlitch]       = useState(false)
    const full = 'CONNECTING TO BELLAGIO SERVERS...'
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&!'

    useEffect(() => {
      pingBackendWarmup()
      let i = 0
      const type = setInterval(() => {
        if (i >= full.length) { clearInterval(type); return }
        setDisplayed(full.slice(0, i + 1))
        i++
      }, 65)
      return () => clearInterval(type)
    }, [pingBackendWarmup])

    useEffect(() => {
      const flicker = setInterval(() => {
        setGlitch(true)
        setTimeout(() => setGlitch(false), 80)
      }, 1800)
      return () => clearInterval(flicker)
    }, [])

    const scrambled = displayed.split('').map((ch, i) =>
      glitch && Math.random() > 0.7 ? chars[Math.floor(Math.random() * chars.length)] : ch
    ).join('')

    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '28px', background: 'var(--black)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 6px)',
        }} />

        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
          color: glitch ? 'var(--gold)' : 'var(--orange)',
          letterSpacing: '0.18em',
          textShadow: glitch
            ? '2px 0 var(--orange), -2px 0 var(--yellow), 0 0 20px var(--yellow)'
            : '0 0 14px rgba(251,146,60,0.6)',
          transition: 'color 0.05s, text-shadow 0.05s',
          minHeight: '2rem',
          textAlign: 'center',
          padding: '0 20px',
        }}>
          {scrambled}
          <span style={{
            display: 'inline-block',
            width: '2px', height: '1.2em',
            background: 'var(--orange)',
            marginLeft: '4px',
            verticalAlign: 'middle',
            animation: 'bounce 0.8s step-end infinite',
          }} />
        </div>

        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: 'var(--grey-dim)',
          letterSpacing: '0.25em',
        }}>
          ACCESSING BELLAGIO SECURITY FILES...
        </div>

        <div style={{
          width: '260px', height: '2px',
          background: 'var(--grey-dim)',
          borderRadius: 'var(--radius-sharp)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            background: 'var(--orange)',
            boxShadow: '0 0 8px var(--orange)',
            animation: 'progressBar 2.5s ease-in-out infinite',
          }} />
        </div>
      </div>
    )
  }

  const connectionError = gameState === 'error' ? loadError : ''

  return (
    <div>
      <div style={{ minHeight: '100vh' }}>
        <LandingPage onStart={goToGame} />
      </div>

      <div ref={gameRef}>
        {view === 'game' && (
          gameState === 'loading'
            ? <LoadingScreen />
            : <GamePage
                case_={case_}
                caseFile={caseFile}
                history={history}
                isThinking={isThinking}
                gameState={gameState}
                startTime={startTime}
                onSend={sendMessage}
                onNewCase={startNewCase}
                onAccuse={accuse}
                onTimeUp={handleTimeUp}
                connectionError={connectionError}
                apiBaseUrl={apiBaseUrl}
                onConnectionRetry={startNewCase}
              />
        )}
      </div>
    </div>
  )
}
