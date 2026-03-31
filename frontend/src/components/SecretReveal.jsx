// SecretReveal.jsx
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function SecretReveal({ secretText }) {
  const boxRef = useRef(null)
  const [pos, setPos] = useState({ x: -999, y: -999 })
  const [hovering, setHovering] = useState(false)

  const onMove = e => {
    const r = boxRef.current.getBoundingClientRect()
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top })
  }

  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.58rem',
        color: 'var(--gold)',
        letterSpacing: '0.14em',
        marginBottom: '5px',
      }}>
        🔦 SECRET CLUE — hover to reveal
      </div>

      <div
        ref={boxRef}
        onMouseMove={onMove}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => { setHovering(false); setPos({ x: -999, y: -999 }) }}
        style={{
          position: 'relative',
          width: '100%',
          height: '70px',
          background: '#040303',
          border: '1px solid var(--border)',
          borderLeft: '3px solid var(--grey-dim)',
          borderRadius: '3px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'crosshair',
          overflow: 'hidden',
          userSelect: 'none',
        }}
      >
        {/* Hidden background text */}
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          color: '#1c1c1c',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          textAlign: 'center',
          padding: '0 12px',
        }}>
          [ CLASSIFIED EVIDENCE ]
        </span>

        {/* Revealed neon layer */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          color: 'var(--cyan)',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          textAlign: 'center',
          padding: '0 12px',
          pointerEvents: 'none',
          textShadow: '0 0 10px var(--cyan), 0 0 20px rgba(0,242,255,0.4)',
          WebkitMaskImage: `radial-gradient(circle 78px at ${pos.x}px ${pos.y}px, black 20%, transparent 100%)`,
          maskImage:       `radial-gradient(circle 78px at ${pos.x}px ${pos.y}px, black 20%, transparent 100%)`,
        }}>
          {secretText}
        </div>

        {/* Scanline overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)',
          pointerEvents: 'none',
        }} />

        {/* Pulse ring on hover */}
        {hovering && pos.x > 0 && (
          <motion.div
            animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{
              position: 'absolute',
              width: '56px', height: '56px',
              borderRadius: '50%',
              border: '1px solid rgba(0,242,255,0.35)',
              left: pos.x - 28,
              top: pos.y - 28,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </div>
  )
}
