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
  const [isInputHovered, setIsInputHovered] = useState(false)
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
    <div 
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        background: 'linear-gradient(180deg, #050a15 0%, #020202 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Header - Removed border */}
      <div style={{
        padding: '24px 24px 12px', // Tighter header
        display: 'flex',
        justifyContent: 'center',
        background: 'transparent', // No background block
        zIndex: 1,
      }}>
        <div style={{
          fontFamily: 'var(--font-hero)',
          fontSize: '0.9rem',
          color: 'var(--gold-metallic)',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          fontWeight: 700,
          textShadow: '0 0 15px rgba(212, 175, 55, 0.4)',
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
          padding: '12px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <AnimatePresence initial={false}>
          {history.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
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
                marginBottom: '8px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                opacity: 0.7,
                marginLeft: msg.role === 'user' ? 0 : '16px',
                marginRight: msg.role === 'user' ? '16px' : 0,
              }}>
                {msg.role === 'user' ? 'DETECTIVE' : (msg.agent || 'SYSTEM')}
              </div>
              
              <div style={{
                maxWidth: '85%',
                padding: '14px 18px', // Slightly thinner bubbles
                background: msg.role === 'user' 
                  ? 'var(--gold-gradient)' 
                  : 'rgba(255, 255, 255, 0.05)',
                color: msg.role === 'user' ? 'var(--black-pure)' : 'var(--white-soft)',
                borderRadius: '24px',
                border: msg.role === 'user' ? 'none' : '1px solid rgba(212, 175, 55, 0.1)',
                backdropFilter: msg.role === 'user' ? 'none' : 'blur(12px)',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.82rem',
                lineHeight: 1.5,
                boxShadow: msg.role === 'user' 
                  ? '0 8px 25px rgba(212, 175, 55, 0.2)' 
                  : '0 4px 15px rgba(0,0,0,0.3)',
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
                gap: '12px',
                padding: '0 12px',
              }}
            >
              <div className="shimmer" style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.7rem',
                color: 'var(--gold-metallic)',
                fontWeight: 600,
                letterSpacing: '0.05em',
              }}>
                Analyzing Evidence
              </div>
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.8, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{
                  width: '6px',
                  height: '6px',
                  background: 'var(--gold-metallic)',
                  borderRadius: '50%',
                  boxShadow: '0 0 12px var(--gold-metallic)',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input area - Thinner, No separators */}
      <div style={{
        padding: '12px 24px 20px', // Much thinner padding
        background: 'transparent', // Fully seamless
        zIndex: 2,
      }}>
        <div 
          onMouseEnter={() => setIsInputHovered(true)}
          onMouseLeave={() => setIsInputHovered(false)}
          style={{ 
            position: 'relative', 
            display: 'flex', 
            gap: '12px',
            background: '#0a0a0a', // Solid Dark
            padding: '4px 12px 4px 20px', // Increased right padding for more space around button
            borderRadius: 'var(--radius-pill)',
            border: `1px solid ${isInputHovered ? 'var(--gold-metallic)' : 'rgba(212, 175, 55, 0.15)'}`,
            boxShadow: isInputHovered 
              ? '0 0 20px rgba(212, 175, 55, 0.1)' 
              : '0 4px 15px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
            alignItems: 'center',
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isInputDisabled ? 'INVESTIGATION SUSPENDED' : 'SEND MESSAGE'}
            disabled={isInputDisabled}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              height: '22px', // Specific height for centering
              background: 'transparent',
              border: 'none',
              color: 'var(--white-pure)',
              padding: '0', // No internal padding to ensure flex centering works
              fontFamily: 'var(--font-ui)',
              fontSize: '1.05rem', // Slightly larger as requested
              resize: 'none',
              outline: 'none',
              lineHeight: '22px',
              display: 'block',
            }}
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={isInputDisabled || !input.trim()}
            style={{
              width: '38px', // Thinner button
              height: '38px',
              background: '#FFD700',
              border: 'none',
              borderRadius: '50%',
              color: 'var(--black-pure)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: (isInputDisabled || !input.trim()) ? 'default' : 'pointer',
              opacity: (isInputDisabled || !input.trim()) ? 0.3 : 1,
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '0.9rem', marginLeft: '2px' }}>➤</span>
          </motion.button>
        </div>
      </div>
    </div>
  )
}