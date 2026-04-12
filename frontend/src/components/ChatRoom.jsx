// ChatRoom.jsx
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import logger from '../utils/logger.js'

function MessageBubble({ msg, isLast }) {
  const [showReasoning, setShowReasoning] = useState(false)
  const isAssistant = msg.role === 'assistant'
  const hasContradiction = isAssistant && msg.audit?.contradiction

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
        width: '100%',
        marginBottom: '24px',
      }}
    >
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.55rem',
        color: hasContradiction ? 'var(--crimson-accent)' : 'var(--gold-metallic)',
        marginBottom: '8px',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        opacity: 0.8,
        marginLeft: msg.role === 'user' ? 0 : '16px',
        marginRight: msg.role === 'user' ? '16px' : 0,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        {msg.role === 'user' ? 'DETECTIVE' : (msg.agent || 'SYSTEM')}
        {hasContradiction && (
          <motion.span 
            animate={{ opacity: [1, 0.4, 1] }} 
            transition={{ repeat: Infinity, duration: 1.5 }}
            style={{ fontWeight: 900, letterSpacing: '0.05em' }}
          >
            [ ! ] DISCREPANCY DETECTED
          </motion.span>
        )}
      </div>
      
      <div 
        style={{
          maxWidth: '85%',
          padding: '14px 18px',
          background: msg.role === 'user' 
            ? 'var(--gold-gradient)' 
            : hasContradiction ? 'rgba(139, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)',
          color: msg.role === 'user' ? 'var(--black-pure)' : 'var(--white-soft)',
          borderRadius: '24px',
          border: hasContradiction 
            ? '1px solid var(--crimson-accent)' 
            : msg.role === 'user' ? 'none' : '1px solid rgba(212, 175, 55, 0.1)',
          backdropFilter: msg.role === 'user' ? 'none' : 'blur(12px)',
          fontFamily: 'var(--font-ui)',
          fontSize: '0.82rem',
          lineHeight: 1.5,
          boxShadow: hasContradiction
            ? '0 0 20px rgba(139, 0, 0, 0.2)'
            : msg.role === 'user' ? '0 8px 25px rgba(212, 175, 55, 0.2)' : '0 4px 15px rgba(0,0,0,0.3)',
          position: 'relative',
        }}
      >
        {msg.content}

        {hasContradiction && (
          <div style={{ 
            marginTop: '12px', 
            paddingTop: '10px', 
            borderTop: '1px dashed rgba(139, 0, 0, 0.4)',
            fontSize: '0.75rem',
            color: 'var(--crimson-accent)',
            fontStyle: 'italic',
            fontFamily: 'var(--font-mono)',
          }}>
            <span style={{ fontWeight: 700 }}>FORENSIC AUDIT:</span> {msg.audit.explanation}
          </div>
        )}
      </div>

      {isAssistant && msg.reasoning && (
        <div style={{ marginTop: '8px', paddingLeft: '16px' }}>
          <motion.button 
            onClick={() => setShowReasoning(!showReasoning)}
            animate={hasContradiction ? { scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
              background: 'transparent',
              border: 'none',
              color: hasContradiction ? 'var(--crimson-accent)' : 'var(--gold-metallic)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.58rem',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontWeight: 600,
              padding: '6px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ fontSize: '0.8rem' }}>{showReasoning ? '▽' : '▷'}</span>
            {showReasoning ? 'Hide Diagnostic Trace' : 'View Analysis'}
            {hasContradiction && !showReasoning && <span style={{ fontSize: '0.5rem' }}>(CRITICAL)</span>}
          </motion.button>
          
          <AnimatePresence>
            {showReasoning && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{
                  background: 'rgba(5, 10, 20, 0.6)',
                  borderLeft: `2px solid ${hasContradiction ? 'var(--crimson-accent)' : 'var(--gold-metallic)'}`,
                  padding: '16px',
                  marginTop: '6px',
                  borderRadius: '0 12px 12px 0',
                  maxWidth: '450px',
                  overflow: 'hidden',
                  backdropFilter: 'blur(8px)',
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  color: 'var(--grey-chic)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}>
                  <div style={{ 
                    color: hasContradiction ? 'var(--crimson-accent)' : 'var(--gold-metallic)', 
                    opacity: 1,
                    marginBottom: '8px',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    letterSpacing: '0.15em'
                  }}>
                    // NVPD FORENSIC ANALYTICS // NODE_ID: {Math.floor(Math.random()*10000)}
                  </div>
                  {msg.reasoning}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

export default function ChatRoom({
  history,
  isThinking,
  gameState,
  onSend,
  connectionError,
  case_,
}) {
  const [input, setInput] = useState('')
  const [selectedSuspect, setSelectedSuspect] = useState('')
  const [isInputHovered, setIsInputHovered] = useState(false)
  const [isSelectHovered, setIsSelectHovered] = useState(false)
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
      logger.logUserAction('send_message', { 
        messageLength: msg.length, 
        suspectTarget: selectedSuspect 
      });
      
      // We now pass the suspect explicitly to the backend instead of prepending
      const startTime = Date.now();
      onSend(msg, selectedSuspect)
      setInput('')
      
      // Log processing time when response comes back
      setTimeout(() => {
        logger.logAgentInteraction(
          selectedSuspect ? `witness_${selectedSuspect}` : 'auto_agent',
          msg,
          '', // Will be filled when response arrives
          Date.now() - startTime
        );
      }, 100);
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
      {/* Header */}
      <div style={{
        padding: '24px 24px 12px',
        display: 'flex',
        justifyContent: 'center',
        background: 'transparent',
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
          position: 'relative',
          zIndex: 1,
        }}
      >
        <AnimatePresence initial={false}>
          {history.map((msg, idx) => (
            <MessageBubble 
              key={idx} 
              msg={msg} 
              isLast={idx === history.length - 1} 
            />
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

      {/* Input area */}
      <div style={{
        padding: '12px 24px 20px',
        background: 'transparent',
        zIndex: 2,
      }}>
        {/* Suspect Dropdown */}
        {case_ && gameState === 'playing' && (
          <div 
            style={{ marginBottom: '12px', position: 'relative' }}
            onMouseEnter={() => setIsSelectHovered(true)}
            onMouseLeave={() => setIsSelectHovered(false)}
          >
            <select
              value={selectedSuspect}
              onChange={(e) => {
                const previous = selectedSuspect;
                const newSelection = e.target.value;
                setSelectedSuspect(newSelection);
                logger.logSuspectSelection(newSelection, previous);

                // AUTO-PREFIX LOGIC: If message is empty, fill with suspect name
                // This helps the user start questioning immediately
                if (newSelection && (!input.trim())) {
                  setInput(`[${newSelection}]: `);
                  // Brief delay to ensure state update before focusing
                  setTimeout(() => inputRef.current?.focus(), 10);
                }
              }}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: '#0a0a0a',
                border: `1px solid ${isSelectHovered ? 'var(--gold-metallic)' : 'rgba(212, 175, 55, 0.15)'}`,
                borderRadius: 'var(--radius-pill)',
                color: 'var(--white-pure)',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                appearance: 'none', // Custom arrow implementation
                boxShadow: isSelectHovered ? '0 0 15px rgba(212, 175, 55, 0.1)' : 'none',
              }}
            >
              <option value="">All Agents (Auto-detect)</option>
              {case_.suspect_a && (
                <option value={case_.suspect_a.name}>
                  {case_.suspect_a.name} (Suspect Alpha)
                </option>
              )}
              {case_.suspect_b && (
                <option value={case_.suspect_b.name}>
                  {case_.suspect_b.name} (Suspect Beta)
                </option>
              )}
            </select>
            {/* Custom Arrow */}
            <div style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--gold-metallic)',
              pointerEvents: 'none',
              fontSize: '0.6rem',
              opacity: 0.7,
            }}>
              ▽
            </div>
          </div>
        )}
        
        <div 
          onMouseEnter={() => setIsInputHovered(true)}
          onMouseLeave={() => setIsInputHovered(false)}
          style={{ 
            position: 'relative', 
            display: 'flex', 
            gap: '12px',
            background: '#0a0a0a',
            padding: '4px 8px 4px 20px',
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
            placeholder={
              isInputDisabled 
                ? 'INVESTIGATION SUSPENDED' 
                : selectedSuspect 
                  ? `Questioning ${selectedSuspect}...`
                  : 'SEND MESSAGE'
            }
            disabled={isInputDisabled}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              height: '22px',
              background: 'transparent',
              border: 'none',
              color: 'var(--white-pure)',
              padding: '0',
              fontFamily: 'var(--font-ui)',
              fontSize: '1.05rem',
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
              width: '38px',
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
            <span style={{ fontSize: '0.9rem', marginLeft: '2px' }}>{'>'}</span>
          </motion.button>
        </div>
      </div>
    </div>
  )
}