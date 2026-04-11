import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SecretReveal from './SecretReveal.jsx'

function CaseResult({ gameState, case_, onNewCase }) {
  const isSolved = gameState === 'solved'
  const isFailed = gameState === 'failed'
  if (!isSolved && !isFailed) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        padding: '24px',
        marginBottom: '20px',
        background: isSolved ? 'rgba(0,163,108,0.1)' : 'rgba(139,0,0,0.1)',
        border: `2px solid ${isSolved ? 'var(--success-green)' : 'var(--crimson-accent)'}`,
        borderRadius: 'var(--radius-subtle)',
        textAlign: 'center',
        boxShadow: `0 0 30px ${isSolved ? 'rgba(0,163,108,0.2)' : 'rgba(139,0,0,0.2)'}`,
      }}
    >
      <h3 style={{ 
        fontFamily: 'var(--font-hero)', 
        color: isSolved ? 'var(--success-green)' : 'var(--crimson-accent)', 
        marginBottom: '10px',
        letterSpacing: '0.1em'
      }}>
        {isSolved ? 'CASE RESOLVED' : 'CASE COMPROMISED'}
      </h3>
      <p style={{ 
        fontFamily: 'var(--font-ui)', 
        fontSize: '0.85rem', 
        color: 'var(--white-pure)', 
        marginBottom: '20px',
        opacity: 0.9
      }}>
        {isSolved 
          ? `Exceptional work. The culprit was indeed ${case_.culprit}.`
          : `A false accusation was made. The suspect escaped into the night.`
        }
      </p>
      <button 
        className="lp-btn" 
        style={{ 
          width: '100%', 
          padding: '12px', 
          fontSize: '0.75rem',
          background: isSolved ? 'var(--success-green)' : 'var(--crimson-accent)',
          color: isSolved ? 'var(--black-pure)' : 'white'
        }} 
        onClick={onNewCase}
      >
        {isSolved ? 'NEXT CASE' : 'TRY AGAIN'}
      </button>
    </motion.div>
  )
}

function CaseFile({ text }) {
  const [displayedText, setDisplayedText] = useState('')
  
  useEffect(() => {
    setDisplayedText('')
    if (!text) return
    
    let i = 0
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1))
      i++
      if (i >= text.length) clearInterval(interval)
    }, 30)
    
    return () => clearInterval(interval)
  }, [text])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: 'relative',
        marginTop: '20px',
        marginBottom: '30px',
      }}
    >
      <div style={{
        position: 'absolute',
        top: '-18px',
        right: '15px',
        background: '#f1e1ad',
        padding: '4px 18px',
        borderRadius: '12px 12px 0 0',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        zIndex: 2,
        border: '1px solid #d4af37',
        borderBottom: 'none',
      }}>
        <div style={{
          fontFamily: 'Impact, sans-serif',
          fontSize: '0.8rem',
          color: '#8e5033',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontWeight: 900,
        }}>
          CASE FILE
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(145deg, #e6ce7b 0%, #d4af37 100%)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        border: '1px solid #c59f2a',
        minHeight: '220px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.2,
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }} />
        
        <div style={{
          padding: '12px 4px',
          minHeight: '140px',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            color: '#3d251a',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            fontWeight: 500,
          }}>
            {displayedText}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              style={{ borderRight: '2px solid #3d251a', marginLeft: '2px' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function Instructions() {
  return (
    <div style={{ padding: '24px', opacity: 0.7 }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.55rem',
        color: 'var(--grey-chic)',
        letterSpacing: '0.2em',
        marginBottom: '16px',
        textTransform: 'uppercase',
      }}>
        Operational Guidance
      </div>
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '0.7rem',
        color: 'var(--grey-chic)',
        lineHeight: 1.6,
      }}>
        - Question suspects about motive.<br />
        - Analyze evidence via the sensor.<br />
        - Accuse only when certain.
      </div>
    </div>
  )
}

export default function RightPanel({ case_, caseFile, gameState, onNewCase }) {
  if (!case_) return null
  return (
    <div style={{ padding: '24px', height: '100%', overflowY: 'auto' }}>
      <CaseResult gameState={gameState} case_={case_} onNewCase={onNewCase} />
      <CaseFile text={caseFile} />
      
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6rem',
        color: 'var(--gold-metallic)',
        letterSpacing: '0.2em',
        marginBottom: '10px',
        textAlign: 'center',
        textTransform: 'uppercase',
        opacity: 0.8,
      }}>
        Hover To Reveal
      </div>
      <SecretReveal secretText={case_.key_clue.toUpperCase()} />
      <Instructions />
    </div>
  )
}