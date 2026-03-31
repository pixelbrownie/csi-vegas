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
      background: 'var(--black-2)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px 14px 20px',
    }}>

      {/* Timer label */}
      <div style={{
        fontFamily: 'var(--font-stamp)',
        fontSize: '0.6rem',
        color: 'var(--grey)',
        letterSpacing: '0.14em',
        marginBottom: '10px',
      }}>⏱ TIME REMAINING</div>

      {/* SVG Ring timer */}
      <div style={{ position: 'relative', width: '90px', height: '90px', marginBottom: '16px' }}>
        <svg width="90" height="90" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="45" cy="45" r={r} fill="none" stroke="var(--grey-dim)" strokeWidth="3" />
          <motion.circle
            cx="45" cy="45" r={r} fill="none"
            stroke={timerColor} strokeWidth="3" strokeLinecap="round"
            strokeDasharray={circ}
            animate={{ strokeDashoffset: circ * (1 - pct) }}
            transition={{ duration: 0.9, ease: 'linear' }}
            style={{ filter: `drop-shadow(0 0 5px ${timerColor})` }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatePresence mode="wait">
            <motion.span
              key={secs}
              initial={{ scale: 0.9, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                fontFamily: 'var(--font-stamp)', fontSize: '1.2rem', fontWeight: 700,
                color: timerColor, filter: `drop-shadow(0 0 6px ${timerColor})`,
              }}
            >{mins}:{secs}</motion.span>
          </AnimatePresence>
        </div>
      </div>

      <div style={{ width: '100%', height: '1px', background: 'var(--border)', marginBottom: '16px' }} />

      {/* Location — bigger label */}
      <div style={{
        fontFamily: 'var(--font-stamp)',
        fontSize: '1rem',
        fontWeight: 700,
        color: 'var(--gold)',
        letterSpacing: '0.1em',
        marginBottom: '8px',
        alignSelf: 'flex-start',
      }}>📍 LOCATION</div>
      <div style={{
        width: '100%',
        background: 'var(--black)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '8px',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.65rem',
        color: 'var(--grey)',
        textAlign: 'center',
        lineHeight: 1.6,
        marginBottom: '20px',
      }}>The Bellagio<br />Las Vegas Strip</div>

      {/* New Case — yellow pill, black text — right below location */}
      <motion.button
        whileHover={{ scale: 1.03, backgroundColor: '#e6c000' }}
        whileTap={{ scale: 0.96 }}
        onClick={onNewCase}
        style={{
          width: '100%',
          padding: '12px',
          background: 'var(--yellow)',
          border: 'none',
          color: 'var(--black)',
          fontFamily: 'var(--font-stamp)',
          fontWeight: 700,
          fontSize: '0.85rem',
          letterSpacing: '0.12em',
          cursor: 'pointer',
          borderRadius: '999px',
          transition: 'background 0.2s',
          marginBottom: '20px',
        }}
      >
        NEW CASE
      </motion.button>

      {/* Tip */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6rem',
        color: 'var(--grey-dim)',
        lineHeight: 1.7,
        textAlign: 'center',
        marginBottom: 'auto',
        padding: '0 4px',
      }}>
        Start with "ask",<br />"found", or "analyze"
      </div>
    </div>
  )
}