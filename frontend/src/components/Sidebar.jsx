// Sidebar.jsx — timer + location + new case only
import { useState, useEffect } from 'react'

const TOTAL = 30 * 60

export default function Sidebar({ startTime, gameState, onTimeUp, onNewCase }) {
  const [remaining, setRemaining] = useState(TOTAL)

  useEffect(() => {
    if (!startTime || gameState !== 'playing') return
    const id = setInterval(() => {
      const left = Math.max(0, TOTAL - Math.floor((Date.now() - startTime) / 1000))
      setRemaining(left)
      if (left === 0) { clearInterval(id); onTimeUp() }
    }, 1000)
    return () => clearInterval(id)
  }, [startTime, gameState, onTimeUp])

  useEffect(() => { if (startTime) setRemaining(TOTAL) }, [startTime])

  const mins = String(Math.floor(remaining / 60)).padStart(2, '0')
  const secs = String(remaining % 60).padStart(2, '0')
  const pct  = remaining / TOTAL
  const r    = 34
  const circ = 2 * Math.PI * r
  const timerColor = pct > 0.33 ? 'var(--gold-metallic)' : 'var(--crimson-accent)'

  return (
    <div style={{
      height: '100%',
      background: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '32px 16px 24px',
    }}>
      <div style={{
        width: '100%',
        marginBottom: '40px',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--font-hero)',
          fontWeight: 700,
          fontSize: '1.2rem',
          letterSpacing: '0.05em',
          color: 'var(--white-pure)',
          lineHeight: 1,
        }}>
          CSI VEGAS
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.45rem',
          color: 'var(--gold-metallic)',
          letterSpacing: '0.3em',
          marginTop: '6px',
          textTransform: 'uppercase',
          fontWeight: 400,
        }}>
          Sin City Division
        </div>
      </div>

      {/* Timer label */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.55rem',
        color: 'var(--grey-chic)',
        letterSpacing: '0.15em',
        marginBottom: '16px',
        textTransform: 'uppercase',
      }}>CASE DURATION</div>

      {/* SVG Ring timer */}
      <div style={{ position: 'relative', width: '90px', height: '90px', marginBottom: '32px' }}>
        <svg width="90" height="90" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          <circle
            cx="45" cy="45" r={r} fill="none"
            stroke={timerColor} strokeWidth="3" strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct)}
            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 600,
              color: timerColor,
            }}
          >{mins}:{secs}</span>
        </div>
      </div>

      <div style={{ width: '100%', borderTop: '1px solid var(--border-gold)', margin: '0 0 32px' }} />

      {/* Location */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.55rem',
        color: 'var(--grey-chic)',
        letterSpacing: '0.15em',
        marginBottom: '12px',
        textTransform: 'uppercase',
        width: '100%',
        textAlign: 'left',
      }}>CURRENT LOCATION</div>
      <div style={{
        width: '100%',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border-gold)',
        borderRadius: 'var(--radius-sharp)',
        padding: '14px',
        fontFamily: 'var(--font-ui)',
        fontWeight: 400,
        fontSize: '0.75rem',
        color: 'var(--white-soft)',
        textAlign: 'center',
        lineHeight: 1.5,
        marginBottom: '40px',
      }}>
        <div style={{ fontWeight: 600, color: 'var(--gold-metallic)', marginBottom: '4px' }}>THE BELLAGIO</div>
        LAS VEGAS STRIP, NV
      </div>

      {/* New Case Button */}
      <button
        onClick={onNewCase}
        className="lp-btn"
        style={{
          width: '100%',
          padding: '16px',
          background: 'var(--gold-metallic)',
          border: 'none',
          color: 'var(--black-pure)',
          fontFamily: 'var(--font-ui)',
          fontWeight: 700,
          fontSize: '0.75rem',
          letterSpacing: '0.15em',
          cursor: 'pointer',
          borderRadius: 'var(--radius-pill)',
          marginBottom: '20px',
          textTransform: 'uppercase',
        }}
      >
        NEW INVESTIGATION
      </button>

      {/* Hint */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.55rem',
        color: 'var(--grey-muted)',
        lineHeight: 1.8,
        textAlign: 'center',
        marginTop: 'auto',
      }}>
        SYSTEMS SECURED // ACCESS LEVEL 5
      </div>
    </div>
  )
}