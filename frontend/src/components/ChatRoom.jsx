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
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--border-gold)',
        display: 'flex',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.2)',
      }}>
        <div style={{
          fontFamily: 'var(--font-hero)',
          fontSize: '1rem',
          color: 'var(--gold-metallic)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          textShadow: '0 0 10px rgba(212, 175, 55, 0.3)',
        }}>
          Investigation Log
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="custom-scrollbar"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          position: 'relative',
        }}
      >
        {/* Connection Line */}
        <div style={{
          position: 'absolute',
          left: '34px',
          top: 0,
          bottom: 0,
          width: '1px',
          background: 'linear-gradient(to bottom, transparent, var(--border-gold), transparent)',
          opacity: 0.1,
          pointerEvents: 'none',
        }} />

        <AnimatePresence initial={false}>
          {history.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                width: '100%',
                zIndex: 1,
              }}
            >
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.55rem',
                color: 'var(--gold-metallic)',
                marginBottom: '8px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                opacity: 0.8,
              }}>
                {msg.role === 'user' ? 'DETECTIVE' : (msg.agent || 'SYSTEM')}
              </div>
              
              <div style={{
                maxWidth: '85%',
                padding: '16px',
                background: msg.role === 'user' 
                  ? 'var(--gold-gradient)' 
                  : 'rgba(255, 255, 255, 0.02)',
                color: msg.role === 'user' ? 'var(--black-pure)' : 'var(--white-soft)',
                borderRadius: msg.role === 'user' 
                  ? '12px 12px 0 12px' 
                  : '12px 12px 12px 0',
                border: msg.role === 'user' ? 'none' : '1px solid rgba(212, 175, 55, 0.2)',
                backdropFilter: msg.role === 'user' ? 'none' : 'blur(10px)',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.8rem',
                lineHeight: 1.6,
                boxShadow: msg.role === 'user' 
                  ? '0 6px 20px rgba(212, 175, 55, 0.2)' 
                  : 'none',
                position: 'relative',
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
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '0 4px',
              }}
            >
              <div className="shimmer" style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                color: 'var(--gold-metallic)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                Analyzing Evidence...
              </div>
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{
                  width: '6px',
                  height: '6px',
                  background: 'var(--gold-metallic)',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px var(--gold-metallic)',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input area */}
      <div style={{
        padding: '24px',
        borderTop: '1px solid var(--border-gold)',
        background: 'rgba(0,0,0,0.4)',
      }}>
        <div style={{ 
          position: 'relative', 
          display: 'flex', 
          gap: '12px',
          background: 'rgba(255,255,255,0.02)',
          padding: '8px',
          borderRadius: '16px',
          border: '1px solid rgba(212, 175, 55, 0.1)',
          boxShadow: 'inset 0 4px 15px rgba(0,0,0,0.5)',
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isInputDisabled ? 'INVESTIGATION SUSPENDED' : 'INTERROGATE SUSPECTS...'}
            disabled={isInputDisabled}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              minHeight: '44px',
              maxHeight: '120px',
              background: 'transparent',
              border: 'none',
              color: 'var(--white-pure)',
              padding: '10px 12px',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.85rem',
              resize: 'none',
              outline: 'none',
              lineHeight: 1.4,
            }}
          />
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 15px var(--gold-glow)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={isInputDisabled || !input.trim()}
            style={{
              width: '44px',
              height: '44px',
              background: 'var(--gold-metallic)',
              border: 'none',
              borderRadius: '12px',
              color: 'var(--black-pure)',
              fontSize: '1rem',
              cursor: (isInputDisabled || !input.trim()) ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: (isInputDisabled || !input.trim()) ? 0.4 : 1,
              transition: 'opacity 0.3s ease',
            }}
          >
            <span style={{ transform: 'rotate(-45deg)', marginLeft: '4px', marginTop: '-2px' }}>➤</span>
          </motion.button>
        </div>
      </div>
    </div>
  )
}