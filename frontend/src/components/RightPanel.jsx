// RightPanel.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SecretReveal from './SecretReveal.jsx'

function CaseFile({ text }) {
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
      {/* Folder Tab */}
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

      {/* Main Folder Body */}
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
        {/* Scuff marks / texture overlays */}
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
            fontFamily: 'serif',
            fontSize: '1rem',
            color: '#3d251a',
            lineHeight: 1.7,
            fontStyle: 'italic',
            whiteSpace: 'pre-wrap',
            fontWeight: 500,
          }}>
            {text}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function AccusationPanel({ case_, gameState, onAccuse, onNewCase }) {
  const [selected, setSelected] = useState('')
  const [shown, setShown] = useState(false)

  if (gameState === 'solved') return (
    <div style={{
      padding: '24px',
      background: 'rgba(212, 175, 55, 0.1)',
      border: '2px solid var(--gold-metallic)',
      borderRadius: 'var(--radius-subtle)',
      textAlign: 'center',
    }}>
      <h3 style={{ fontFamily: 'var(--font-hero)', color: 'var(--gold-metallic)', marginBottom: '16px' }}>CASE RESOLVED</h3>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9rem', color: 'var(--white-pure)', marginBottom: '24px' }}>
        The culprit was indeed {case_.culprit}.
      </p>
      <button className="lp-btn" style={{ width: '100%' }} onClick={onNewCase}>NEW CASE</button>
    </div>
  )

  if (gameState === 'failed') return (
    <div style={{
      padding: '24px',
      background: 'rgba(139, 0, 0, 0.1)',
      border: '2px solid var(--crimson-accent)',
      borderRadius: 'var(--radius-subtle)',
      textAlign: 'center',
    }}>
      <h3 style={{ fontFamily: 'var(--font-hero)', color: 'var(--crimson-accent)', marginBottom: '16px' }}>CASE COMPROMISED</h3>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9rem', color: 'var(--white-pure)', marginBottom: '24px' }}>
        A false accusation was made. The killer escaped.
      </p>
      <button className="lp-btn" style={{ width: '100%', background: 'var(--crimson-accent)', color: 'white' }} onClick={onNewCase}>TRY AGAIN</button>
    </div>
  )

  return (
    <div style={{
      padding: '24px',
      background: 'rgba(0,0,0,0.3)',
      border: '1px solid var(--border-gold)',
      borderRadius: 'var(--radius-subtle)',
      marginBottom: '20px',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6rem',
        color: 'var(--gold-metallic)',
        letterSpacing: '0.2em',
        marginBottom: '20px',
        textTransform: 'uppercase',
      }}>
        Formal Accusation
      </div>

      {!shown ? (
        <button 
          onClick={() => setShown(true)}
          style={{
            width: '100%',
            padding: '16px',
            background: 'transparent',
            border: '1px solid var(--gold-metallic)',
            color: 'var(--gold-metallic)',
            borderRadius: 'var(--radius-pill)',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            cursor: 'pointer',
          }}
        >
          I AM READY TO ACCUSE
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--black-pure)',
              border: '1px solid var(--border-gold)',
              borderRadius: 'var(--radius-sharp)',
              color: 'var(--white-pure)',
              fontFamily: 'var(--font-ui)',
              outline: 'none',
            }}
          >
            <option value="">Select the Culprit</option>
            <option value={case_.suspect_a.name}>{case_.suspect_a.name}</option>
            <option value={case_.suspect_b.name}>{case_.suspect_b.name}</option>
          </select>
          <button
            onClick={() => selected && onAccuse(selected)}
            disabled={!selected}
            style={{
              width: '100%',
              padding: '12px',
              background: selected ? 'var(--gold-metallic)' : 'var(--grey-muted)',
              color: 'var(--black-pure)',
              borderRadius: 'var(--radius-pill)',
              fontFamily: 'var(--font-ui)',
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              border: 'none',
              cursor: selected ? 'pointer' : 'default',
              transition: 'all 0.3s ease',
            }}
          >
            DELIVER VERDICT
          </button>
        </div>
      )}
    </div>
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

export default function RightPanel({ case_, caseFile, gameState, onAccuse, onNewCase, connectionError }) {
  if (!case_) return null
  return (
    <div style={{ padding: '24px', height: '100%', overflowY: 'auto' }}>
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
      <AccusationPanel 
        case_={case_} 
        gameState={gameState} 
        onAccuse={onAccuse} 
        onNewCase={onNewCase} 
      />
      <Instructions />
    </div>
  )
}