import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import Sidebar from './components/Sidebar.jsx'
import DossierPanel from './components/DossierPanel.jsx'
import ChatRoom from './components/ChatRoom.jsx'
import RightPanel from './components/RightPanel.jsx'

const API = '/api'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  })
}

export default function App() {
  const [gameState, setGameState] = useState('loading') // loading | playing | gameover | solved | failed
  const [case_, setCase] = useState(null)
  const [caseFile, setCaseFile] = useState('')
  const [history, setHistory] = useState([])
  const [startTime, setStartTime] = useState(null)
  const [isThinking, setIsThinking] = useState(false)
  const [error, setError] = useState(null)

  // ── Start a new case ────────────────────────────────────────────────────────
  const startNewCase = useCallback(async () => {
    setGameState('loading')
    setHistory([])
    setError(null)
    try {
      const res = await axios.post(`${API}/new-case`)
      setCase(res.data.case)
      setCaseFile(res.data.case_file)
      setStartTime(Date.now())
      setGameState('playing')
    } catch (e) {
      setError('Could not connect to backend. Is FastAPI running on port 8000?')
      setGameState('error')
    }
  }, [])

  useEffect(() => { startNewCase() }, [])

  // ── Send chat message ────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (message) => {
    if (!message.trim() || isThinking) return

    const userMsg = { role: 'user', content: message }
    setHistory(prev => [...prev, userMsg])
    setIsThinking(true)

    try {
      const res = await axios.post(`${API}/chat`, {
        message,
        case: case_,
        case_file: caseFile,
        history: [...history, userMsg]
      })
      setCaseFile(res.data.updated_case_file)
      setHistory(prev => [...prev, {
        role: 'assistant',
        content: res.data.response,
        agent: res.data.agent
      }])
    } catch (e) {
      setHistory(prev => [...prev, {
        role: 'assistant',
        content: 'The connection to the precinct went dark. Try again.',
        agent: '⚠️ System'
      }])
    } finally {
      setIsThinking(false)
    }
  }, [case_, caseFile, history, isThinking])

  // ── Accuse ───────────────────────────────────────────────────────────────────
  const accuse = useCallback((guess) => {
    const culprit = case_?.culprit || ''
    if (guess.toLowerCase().includes(culprit.toLowerCase()) ||
        culprit.toLowerCase().includes(guess.toLowerCase())) {
      setGameState('solved')
    } else {
      setGameState('failed')
    }
  }, [case_])

  // ── Timer expiry ─────────────────────────────────────────────────────────────
  const handleTimeUp = useCallback(() => {
    if (gameState === 'playing') setGameState('gameover')
  }, [gameState])

  // ── Loading screen ───────────────────────────────────────────────────────────
  if (gameState === 'loading') {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '24px'
      }}>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--gold)' }}
        >
          CSI VEGAS
        </motion.div>
        <motion.div
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          style={{ fontFamily: 'var(--font-stamp)', fontSize: '0.85rem', color: 'var(--cream-dim)', letterSpacing: '0.2em' }}
        >
          GENERATING CRIME SCENE...
        </motion.div>
      </div>
    )
  }

  // ── Error screen ─────────────────────────────────────────────────────────────
  if (gameState === 'error') {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '16px',
        padding: '40px'
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: '#c0392b' }}>
          Connection Failed
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--cream-dim)', textAlign: 'center', maxWidth: '400px' }}>
          {error}
        </div>
        <button onClick={startNewCase} style={{
          marginTop: '16px', padding: '10px 24px',
          background: 'transparent', border: '1px solid var(--gold)',
          color: 'var(--gold)', fontFamily: 'var(--font-stamp)',
          letterSpacing: '0.1em', cursor: 'pointer', fontSize: '0.85rem'
        }}>
          RETRY
        </button>
      </div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      style={{
        display: 'grid',
        gridTemplateColumns: '200px 1fr 2fr 320px',
        height: '100vh',
        overflow: 'hidden',
        gap: '0',
      }}
    >
      {/* Left Sidebar — timer + controls */}
      <motion.div variants={fadeUp} custom={0}>
        <Sidebar
          startTime={startTime}
          gameState={gameState}
          onTimeUp={handleTimeUp}
          onNewCase={startNewCase}
        />
      </motion.div>

      {/* Dossier — victim + suspects */}
      <motion.div variants={fadeUp} custom={1} style={{ overflowY: 'auto', borderRight: '1px solid var(--dark-border)' }}>
        <DossierPanel case_={case_} />
      </motion.div>

      {/* Chat — investigation room */}
      <motion.div variants={fadeUp} custom={2} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <ChatRoom
          history={history}
          isThinking={isThinking}
          gameState={gameState}
          onSend={sendMessage}
        />
      </motion.div>

      {/* Right — case file + reveal + accusation */}
      <motion.div variants={fadeUp} custom={3} style={{ overflowY: 'auto', borderLeft: '1px solid var(--dark-border)' }}>
        <RightPanel
          case_={case_}
          caseFile={caseFile}
          gameState={gameState}
          onAccuse={accuse}
          onNewCase={startNewCase}
        />
      </motion.div>
    </motion.div>
  )
}