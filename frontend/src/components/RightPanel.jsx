import { useState, useEffect, useRef } from 'react'
import SecretReveal from './SecretReveal.jsx'

function CaseResult({ gameState, case_, onNewCase }) {
  const isSolved = gameState === 'solved'
  const isFailed = gameState === 'failed'
  if (!isSolved && !isFailed) return null

  return (
    <div
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
    </div>
  )
}

function CaseFile({ text }) {
  const [displayedText, setDisplayedText] = useState('')
  const prevFullTextRef = useRef('')

  useEffect(() => {
    if (!text) {
      setDisplayedText('')
      prevFullTextRef.current = ''
      return
    }

    // Check if new text is an extension of the previously typed text
    const isExtension = text.startsWith(prevFullTextRef.current) && prevFullTextRef.current !== ''
    const startFrom = isExtension ? prevFullTextRef.current.length : 0

    if (!isExtension) {
      setDisplayedText('')
    }

    let i = startFrom
    const interval = setInterval(() => {
      // Don't type more than the current text length
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
        prevFullTextRef.current = text
      }
    }, 25) // Slightly faster typewriter

    return () => clearInterval(interval)
  }, [text])

  return (
    <div
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
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
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
        padding: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        border: '1px solid #c59f2a',
        minHeight: '200px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.15,
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }} />

        <div style={{
          padding: '8px 4px',
          minHeight: '140px',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: '#3d251a',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            fontWeight: 600,
          }}>
            {displayedText}
            <span
              className="terminal-cursor"
              style={{ borderRight: '2px solid #3d251a', marginLeft: '2px' }}
            />
          </div>
        </div>
      </div>
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
        SAMPLE QUESTIONS
      </div>
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '0.7rem',
        color: 'var(--grey-chic)',
        lineHeight: 1.6,
      }}>
        WITNESS AGENT:<br />
        1. Where were you at the time of the murder?<br />
        2. I saw you leaving the high-stakes room, did you kill them?<br />
        3. Tell me about your relationship with the victim<br />
        4. You're lying about not needing to harm him. What really happened?<br /><br />


        ANALYST AGENT:<br />
        1. Sweep the crime scene for any overlooked clues?<br />
        2. Analyze the toxicology report<br />
        3. What's the atmosphere of the scene?<br /><br />

        NARRATOR AGENT:<br />
        1. Anything else you say<br />
        2. Drop clues<br />
        3. Add to the story<br /><br />
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