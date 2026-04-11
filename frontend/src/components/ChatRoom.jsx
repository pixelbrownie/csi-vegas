// ChatRoom.jsx
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const AGENT_STYLES = {
  witness: { bg: '#1c1808', border: '#3a3010', accent: '#D4AF37', label: 'WITNESS AGENT' },
  analyst: { bg: '#0c1618', border: '#143848', accent: '#3a8aaa', label: 'ANALYST AGENT' },
  narrator: { bg: '#160c1c', border: '#2a1440', accent: '#8040b0', label: 'NARRATOR AGENT' },
  system: { bg: '#1a0808', border: '#3a1414', accent: '#c03030', label: 'SYSTEM' },
}

function getKey(agent = '') {
  const a = agent.toLowerCase()
  if (a.includes('witness')) return 'witness'
  if (a.includes('analyst')) return 'analyst'
  if (a.includes('narrator')) return 'narrator'
  return 'system'
}

function TypingDots() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        display: 'flex',
        gap: '5px',
        padding: '6px 2px',
        alignSelf: 'flex-start',
        marginBottom: '10px',
        flexShrink: 0,
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: 'var(--yellow)',
            animation: `bounce 0.85s ease-in-out ${i * 0.16}s infinite`,
          }}
        />
      ))}
    </motion.div>
  )
}

function Bubble({ msg }) {
  const isUser = msg.role === 'user'

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{
          alignSelf: 'flex-end',
          maxWidth: '72%',
          background: '#e8e8e2',
          color: '#111',
          borderRadius: 'var(--radius-subtle)',
          padding: '11px 15px',
          fontFamily: 'var(--font-ui)',
          fontWeight: 400,
          fontStyle: 'italic',
          fontSize: '0.88rem',
          lineHeight: 1.55,
          marginBottom: '10px',
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
          minWidth: 0,
        }}
      >
        {msg.content}
      </motion.div>
    )
  }

  const s = AGENT_STYLES[getKey(msg.agent)]

  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        alignSelf: 'flex-start',
        maxWidth: '80%',
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderLeft: `4px solid ${s.accent}`,
        borderRadius: 'var(--radius-subtle)',
        padding: '11px 15px',
        marginBottom: '10px',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere',
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.58rem',
          color: s.accent,
          letterSpacing: '0.12em',
          marginBottom: '5px',
        }}
      >
        {s.label}
      </div>

      <div
        style={{
          fontFamily: 'var(--font-ui)',
          fontWeight: 400,
          fontStyle: 'italic',
          fontSize: '0.88rem',
          color: 'var(--white-dim)',
          lineHeight: 1.65,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
          minWidth: 0,
        }}
      >
        {msg.content}
      </div>
    </motion.div>
  )
}

export default function ChatRoom({
  history,
  isThinking,
  gameState,
  onSend,
  connectionError,
  apiBaseUrl,
  onConnectionRetry,
}) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const isLocked = gameState !== 'playing'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, isThinking])

  const send = () => {
    if (!input.trim() || isLocked) return
    onSend(input.trim())
    setInput('')
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#0b0c0f',
        minWidth: 0,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '18px 22px 12px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
          textAlign: 'center',
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-hero)',
            fontWeight: 900,
            fontStyle: 'normal',
            fontSize: '2rem',
            color: 'var(--white)',
            lineHeight: 1,
            letterSpacing: '0.04em',
          }}
        >
          CSI VEGAS
        </div>

        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.8rem',
            color: 'var(--grey)',
            fontStyle: 'italic',
            marginTop: '2px',
            marginBottom: '10px',
          }}
        >
          A multi-agent AI murder mystery — interrogate, analyze, deduce.
        </div>

        <div
          style={{
            fontFamily: 'var(--font-stamp)',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: 'var(--white)',
            letterSpacing: '0.06em',
          }}
        >
          INVESTIGATION ROOM
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '18px 22px',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: 0,
        }}
      >
        {connectionError && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              alignSelf: 'center',
              maxWidth: '420px',
              margin: '12px 0 20px',
              padding: '18px 20px',
              background: '#1a0808',
              border: '1px solid var(--orange)',
              borderRadius: 'var(--radius-sharp)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-stamp)',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: 'var(--orange)',
                letterSpacing: '0.12em',
                marginBottom: '10px',
              }}
            >
              CANNOT REACH BACKEND
            </div>
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.82rem',
                color: 'var(--white-dim)',
                lineHeight: 1.55,
                marginBottom: '10px',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
              }}
            >
              {connectionError}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.58rem',
                color: 'var(--grey)',
                marginBottom: '14px',
                wordBreak: 'break-all',
              }}
            >
              API base: {apiBaseUrl || '(not set)'}
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConnectionRetry}
              style={{
                padding: '10px 20px',
                background: 'var(--orange)',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                color: 'var(--black)',
                fontFamily: 'var(--font-stamp)',
                fontWeight: 700,
                fontStyle: 'normal',
                fontSize: '0.72rem',
                letterSpacing: '0.14em',
                cursor: 'pointer',
              }}
            >
              RETRY CONNECTION
            </motion.button>
          </motion.div>
        )}

        {history.length === 0 && !connectionError && (
          <div
            style={{
              textAlign: 'center',
              margin: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.64rem',
              color: 'var(--grey-dim)',
              letterSpacing: '0.15em',
              lineHeight: 2.2,
              textTransform: 'uppercase',
            }}
          >
            CASE FILE OPEN.
            <br />
            BEGIN YOUR INVESTIGATION.
          </div>
        )}

        <AnimatePresence initial={false}>
          {history.map((msg, i) => (
            <Bubble key={i} msg={msg} />
          ))}
        </AnimatePresence>

        {isThinking && <TypingDots />}

        {gameState === 'gameover' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center',
              padding: '16px',
              background: '#1a1000',
              border: '1px solid var(--yellow)',
              borderRadius: 'var(--radius-sharp)',
              fontFamily: 'var(--font-ui)',
              fontWeight: 400,
              fontStyle: 'italic',
              fontSize: '0.88rem',
              color: 'var(--yellow)',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
            }}
          >
            ⏰ Time expired. The case goes cold.
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!isLocked && (
        <div
          style={{
            padding: '12px 22px 18px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '10px',
            flexShrink: 0,
            minWidth: 0,
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())
            }
            placeholder="Ask a witness, submit evidence, or describe a scene..."
            disabled={isThinking}
            style={{
              flex: 1,
              minWidth: 0,
              padding: '11px 16px',
              background: 'var(--card)',
              border: '1px solid var(--border-2)',
              borderRadius: 'var(--radius-subtle)',
              color: 'var(--white)',
              fontFamily: 'var(--font-ui)',
              fontWeight: 400,
              fontStyle: 'italic',
              fontSize: '0.88rem',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--white-dim)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-2)')}
          />

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={send}
            disabled={isThinking || !input.trim()}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: input.trim() ? 'var(--white)' : 'var(--grey-dim)',
              border: 'none',
              color: 'var(--black)',
              fontSize: '0.9rem',
              cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
              flexShrink: 0,
            }}
          >
            ➤
          </motion.button>
        </div>
      )}
    </div>
  )
}