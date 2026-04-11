// ChatRoom.jsx
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ChatRoom({
  history,
  isThinking,
  gameState,
  onSend,
  connectionError,
}) {
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history, isThinking])

  const handleSend = () => {
    const msg = input.trim()
    if (msg && !isThinking && gameState === 'playing') {
      onSend(msg)
      setInput('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isInputDisabled = gameState !== 'playing' || !!connectionError

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      background: 'var(--black-rich)',
    }}>
      {/* Messages area */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <AnimatePresence initial={false}>
          {history.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                width: '100%',
              }}
            >
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.55rem',
                color: 'var(--gold-metallic)',
                marginBottom: '6px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}>
                {msg.role === 'user' ? 'DETECTIVE' : (msg.agent || 'SYSTEM')}
              </div>
              <div style={{
                maxWidth: '85%',
                padding: '12px 16px',
                background: msg.role === 'user' ? 'var(--gold-metallic)' : 'rgba(255,255,255,0.03)',
                color: msg.role === 'user' ? 'var(--black-pure)' : 'var(--white-soft)',
                borderRadius: msg.role === 'user' 
                  ? 'var(--radius-subtle) var(--radius-subtle) 0 var(--radius-subtle)' 
                  : 'var(--radius-subtle) var(--radius-subtle) var(--radius-subtle) 0',
                border: msg.role === 'user' ? 'none' : '1px solid var(--border-gold)',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.78rem',
                lineHeight: 1.5,
                boxShadow: msg.role === 'user' ? '0 4px 15px rgba(212, 175, 55, 0.2)' : 'none',
              }}>
                {msg.content}
              </div>
            </motion.div>
          ))}

          {isThinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                color: 'var(--grey-muted)',
                fontStyle: 'italic',
                padding: '0 4px',
              }}
            >
              Encrypting response...
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input area */}
      <div style={{
        padding: '24px',
        background: 'rgba(255,255,255,0.01)',
        borderTop: '1px solid var(--border-gold)',
      }}>
        <div style={{ position: 'relative', display: 'flex', gap: '12px' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isInputDisabled ? 'INVESTIGATION SUSPENDED' : 'INTERROGATE SUSPECTS...'}
            disabled={isInputDisabled}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              minHeight: '50px',
              maxHeight: '120px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-gold)',
              borderRadius: 'var(--radius-subtle)',
              color: 'var(--white-pure)',
              padding: '12px',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.78rem',
              resize: 'none',
              outline: 'none',
              transition: 'all 0.3s ease',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)',
            }}
          />
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'var(--gold-metallic)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={isInputDisabled || !input.trim()}
            style={{
              width: '50px',
              height: '60px',
              background: 'var(--gold-low)',
              border: 'none',
              borderRadius: 'var(--radius-subtle)',
              color: 'var(--black-pure)',
              fontSize: '1.2rem',
              cursor: (isInputDisabled || !input.trim()) ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: (isInputDisabled || !input.trim()) ? 0.5 : 1,
            }}
          >
            ➤
          </motion.button>
        </div>
      </div>
    </div>
  )
}