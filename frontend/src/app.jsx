// App.jsx — root component
// Manages: view (landing/game), game state, API calls
// Renders: LandingPage → scroll → GamePage

import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import LandingPage from './components/LandingPage.jsx'
import GamePage    from './components/GamePage.jsx'

// Vite injects this at build time. Keep a production fallback so GitHub Pages still works
// even if the `VITE_API_URL` Actions secret isn't configured.
const PRODUCTION_API_FALLBACK = 'https://csi-vegas.onrender.com'
const MIN_LOADING_MS = 1500

function normalizeApiBaseUrl(raw) {
  let base = String(raw || '').trim()
  if (!base) return ''

  // If someone pasted a deep link or Pages URL by mistake, keep only the origin.
  try {
    if (base.includes('://')) {
      const u = new URL(base)
      base = `${u.protocol}//${u.host}`
    }
  } catch {
    // ignore — we'll still attempt to use the string as-is
  }

  return base.replace(/\/+$/, '')
}

const configuredApiUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_URL)
const apiBaseUrl = normalizeApiBaseUrl(
  configuredApiUrl
    || (import.meta.env.DEV ? 'http://localhost:8000' : PRODUCTION_API_FALLBACK)
)

const api = axios.create({
  baseURL: apiBaseUrl,
  // Render cold starts + LLM calls can exceed axios' default timeout.
  timeout: 180000,
})

function getApiErrorMessage(error, fallback) {
  if (error?.code === 'ECONNABORTED') return 'Request timed out. Is the backend still waking up? Try again in a few seconds.'
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string' && detail.trim()) return detail.trim()
  if (Array.isArray(detail) && detail.length) return String(detail[0]?.msg || fallback)
  return fallback
}

export default function App() {
  const [view,       setView]       = useState('landing')
  const [gameState,  setGameState]  = useState('idle')   // idle|loading|playing|solved|failed|gameover
  const [case_,      setCase]       = useState(null)
  const [caseFile,   setCaseFile]   = useState('')
  const [history,    setHistory]    = useState([])
  const [isThinking, setIsThinking] = useState(false)
  const [startTime,  setStartTime]  = useState(null)
  const gameRef = useRef(null)

  const pingBackendWarmup = useCallback(() => {
    // Fire-and-forget: wake cheaply, and hit health for older caches.
    api.get('/wake').catch(() => {})
    api.get('/health').catch(() => {})
  }, [])

  useEffect(() => {
    pingBackendWarmup()
  }, [pingBackendWarmup])

  if (import.meta.env.PROD && !configuredApiUrl) {
    // eslint-disable-next-line no-console
    console.warn(
      '[csi-vegas] VITE_API_URL is missing for this build; using fallback:',
      PRODUCTION_API_FALLBACK
    )
  }

  // ── Scroll to game ───────────────────────────────────────────────────────────
  const goToGame = () => {
    setView('game')
    setTimeout(() => gameRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
  }

  // ── Generate new case ────────────────────────────────────────────────────────
  const startNewCase = useCallback(async () => {
    const startedAt = Date.now()
    const waitForMinimumLoading = async () => {
      const elapsed = Date.now() - startedAt
      if (elapsed < MIN_LOADING_MS) {
        await new Promise(resolve => setTimeout(resolve, MIN_LOADING_MS - elapsed))
      }
    }

    setGameState('loading')
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
      setCaseFile(`⚠️ ${msg}`)
      setGameState('playing')
    }
  }, [])

  // Auto-start case when game view appears
  useEffect(() => {
    if (view === 'game' && gameState === 'idle') startNewCase()
  }, [view, gameState, startNewCase])

  // ── Send chat message ────────────────────────────────────────────────────────
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
  }, [case_, caseFile, history, isThinking, gameState])

  // ── Accuse ───────────────────────────────────────────────────────────────────
  const accuse = useCallback((guess) => {
    if (!case_) return
    const c = case_.culprit.toLowerCase()
    const g = guess.toLowerCase()
    setGameState(g.includes(c) || c.includes(g) ? 'solved' : 'failed')
  }, [case_])

  // ── Timer up ─────────────────────────────────────────────────────────────────
  const handleTimeUp = useCallback(() => {
    if (gameState === 'playing') setGameState('gameover')
  }, [gameState])

  // ── Loading screen — glitchy typewriter ─────────────────────────────────────
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

    // Random glitch flicker
    useEffect(() => {
      const flicker = setInterval(() => {
        setGlitch(true)
        setTimeout(() => setGlitch(false), 80)
      }, 1800)
      return () => clearInterval(flicker)
    }, [])

    // Scramble effect on top of typed text
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
        {/* Scanlines */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 6px)',
        }} />

        {/* Glitchy text */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
          color: glitch ? 'var(--cyan)' : 'var(--purple-light)',
          letterSpacing: '0.18em',
          textShadow: glitch
            ? '2px 0 var(--orange), -2px 0 var(--cyan), 0 0 20px var(--cyan)'
            : '0 0 14px rgba(192,112,192,0.6)',
          transition: 'color 0.05s, text-shadow 0.05s',
          minHeight: '2rem',
          textAlign: 'center',
          padding: '0 20px',
        }}>
          {scrambled}
          {/* Blinking cursor */}
          <span style={{
            display: 'inline-block',
            width: '2px', height: '1.2em',
            background: 'var(--purple-light)',
            marginLeft: '4px',
            verticalAlign: 'middle',
            animation: 'bounce 0.8s step-end infinite',
          }} />
        </div>

        {/* Sub label */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: 'var(--grey-dim)',
          letterSpacing: '0.25em',
        }}>
          ACCESSING BELLAGIO SECURITY FILES...
        </div>

        {/* Progress bar */}
        <div style={{
          width: '260px', height: '2px',
          background: 'var(--grey-dim)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            background: 'var(--purple-light)',
            boxShadow: '0 0 8px var(--purple-light)',
            animation: 'progressBar 2.5s ease-in-out infinite',
          }} />
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Page 1 — Landing */}
      <div style={{ minHeight: '100vh' }}>
        <LandingPage onStart={goToGame} />
      </div>

      {/* Page 2 — Game */}
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
              />
        )}
      </div>
    </div>
  )
}
