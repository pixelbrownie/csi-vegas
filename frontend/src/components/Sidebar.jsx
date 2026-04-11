// Sidebar.jsx — timer + location + new case only
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'


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
  const r    = 36
  const circ = 2 * Math.PI * r
  const timerColor = pct > 0.33 ? 'var(--gold)' : pct > 0.1 ? '#e07030' : '#c0392b'

  return (
    <div style={{
      height: '100%',
      background: '#08090b',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '22px 14px 16px',
    }}>
      <div style={{
        width: '100%',
        marginBottom: '22px',
      }}>
        <div style={{
          fontFamily: 'var(--font-hero)',
          fontWeight: 900,
          fontStyle: 'normal',
          fontSize: '1.2rem',
          letterSpacing: '0.06em',
          color: 'var(--white)',
          lineHeight: 1,
        }}>
          CSI VEGAS
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 400,
          fontSize: '0.46rem',
          color: 'var(--grey)',
          letterSpacing: '0.2em',
          marginTop: '4px',
          textTransform: 'uppercase',
        }}>
          Murder Mystery
        </div>
      </div>

      {/* Timer label */}
      <div style={{
        fontFamily: 'var(--font-stamp)',
        fontWeight: 700,
        fontStyle: 'normal',
        fontSize: '0.52rem',
        color: 'var(--grey)',
        letterSpacing: '0.14em',
        marginBottom: '10px',
        alignSelf: 'flex-start',
        textTransform: 'uppercase',
      }}>TIME REMAINING</div>

      {/* SVG Ring timer */}
      <div style={{ position: 'relative', width: '84px', height: '84px', marginBottom: '18px' }}>
        <svg width="84" height="84" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="42" cy="42" r={r} fill="none" stroke="var(--grey-dim)" strokeWidth="2.2" />
          <motion.circle
            cx="42" cy="42" r={r} fill="none"
            stroke={timerColor} strokeWidth="2.2" strokeLinecap="round"
            strokeDasharray={circ}
            animate={{ strokeDashoffset: circ * (1 - pct) }}
            transition={{ duration: 0.9, ease: 'linear' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatePresence mode="wait">
            <motion.span
              key={secs}
              initial={{ scale: 0.9, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 400, fontStyle: 'normal',
                color: timerColor, filter: `drop-shadow(0 0 6px ${timerColor})`,
              }}
            >{mins}:{secs}</motion.span>
          </AnimatePresence>
        </div>
      </div>

      <div style={{ width: '100%', height: '1px', background: 'var(--border)', marginBottom: '18px' }} />

      {/* Location — bigger label */}
      <div style={{
        fontFamily: 'var(--font-stamp)',
        fontSize: '0.52rem',
        fontWeight: 700,
        fontStyle: 'normal',
        color: 'var(--grey)',
        letterSpacing: '0.14em',
        marginBottom: '8px',
        alignSelf: 'flex-start',
        textTransform: 'uppercase',
      }}>LOCATION</div>
      <div style={{
        width: '100%',
        background: '#0d0f12',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sharp)',
        padding: '10px',
        fontFamily: 'var(--font-mono)',
        fontWeight: 400,
        fontSize: '0.6rem',
        color: 'var(--orange)',
        textAlign: 'center',
        lineHeight: 1.5,
        marginBottom: '24px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>The Bellagio<br />Las Vegas Strip</div>

      {/* New Case — yellow pill, black text — right below location */}
      <motion.button
        whileHover={{ scale: 1.03, backgroundColor: 'var(--yellow)' }}
        whileTap={{ scale: 0.96 }}
        onClick={onNewCase}
        style={{
          width: '100%',
          padding: '11px 12px',
          background: 'var(--orange)',
          border: 'none',
          color: 'var(--black)',
          fontFamily: 'var(--font-stamp)',
          fontWeight: 700,
          fontStyle: 'normal',
          fontSize: '0.7rem',
          letterSpacing: '0.14em',
          cursor: 'pointer',
          borderRadius: 'var(--radius-pill)',
          transition: 'all 0.2s',
          marginBottom: '16px',
        }}
      >
        NEW CASE
      </motion.button>

      {/* Tip */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontWeight: 400,
        fontSize: '0.48rem',
        color: 'var(--grey-dim)',
        lineHeight: 1.5,
        textAlign: 'left',
        marginBottom: 'auto',
        width: '100%',
      }}>
        Hint keys: "ask"
        <br />
        "found" "analyze"
      </div>

      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingTop: '20px' }}>
      </div>
    </div>
  )
}