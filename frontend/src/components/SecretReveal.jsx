// SecretReveal.jsx
import { useRef, useState } from 'react'

export default function SecretReveal({ secretText }) {
  const boxRef = useRef(null)
  const [pos, setPos] = useState({ x: -999, y: -999 })
  const [hovering, setHovering] = useState(false)
  const [touchReveal, setTouchReveal] = useState(false)

  const updatePosFromClient = (clientX, clientY) => {
    const el = boxRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setPos({ x: clientX - r.left, y: clientY - r.top })
  }

  const onMove = e => {
    updatePosFromClient(e.clientX, e.clientY)
  }

  const onTouchMove = e => {
    if (!e.touches?.length) return
    updatePosFromClient(e.touches[0].clientX, e.touches[0].clientY)
    setTouchReveal(true)
  }

  const onTouchStart = e => {
    if (!e.touches?.length) return
    updatePosFromClient(e.touches[0].clientX, e.touches[0].clientY)
    setTouchReveal(true)
    setHovering(true)
  }

  const onTouchEnd = () => {
    setHovering(false)
    setTouchReveal(false)
    setPos({ x: -999, y: -999 })
  }

  const showPulse = hovering && (pos.x > 0 || touchReveal)

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6rem',
        color: 'var(--gold-low)',
        letterSpacing: '0.2em',
        marginBottom: '10px',
        textTransform: 'uppercase',
      }}>
        ULTraviolet Evidence
      </div>

      <div
        ref={boxRef}
        onMouseMove={onMove}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => { setHovering(false); setTouchReveal(false); setPos({ x: -999, y: -999 }) }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          position: 'relative',
          width: '100%',
          height: '80px',
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid var(--border-gold)',
          borderRadius: 'var(--radius-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'crosshair',
          overflow: 'hidden',
          userSelect: 'none',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: 'var(--gold-metallic)',
          textTransform: 'uppercase',
          letterSpacing: '0.25em',
          textAlign: 'center',
          padding: '0 16px',
          fontWeight: 600,
          pointerEvents: 'none',
          textShadow: '0 0 15px rgba(212, 175, 55, 0.6)',
          WebkitMaskImage: `radial-gradient(circle 60px at ${pos.x}px ${pos.y}px, black 30%, transparent 100%)`,
          maskImage:       `radial-gradient(circle 60px at ${pos.x}px ${pos.y}px, black 30%, transparent 100%)`,
        }}>
          {secretText}
        </div>

        {/* Pulse ring on hover */}
        {showPulse && (
          <div
            className="pulse-ring"
            style={{
              position: 'absolute',
              width: '120px', height: '120px',
              borderRadius: '50%',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              left: pos.x - 60,
              top: pos.y - 60,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </div>
  )
}
