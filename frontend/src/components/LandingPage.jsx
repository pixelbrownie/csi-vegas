// LandingPage.jsx
import { motion } from 'framer-motion'

const AGENTS = [
  {
    num: '1.',
    icon: '🧑',
    title: 'THE WITNESS AGENT',
    desc: 'Ask the suspects about their location, motives, or secrets.',
    example: '"Leo, why were you near the vault at 3 AM?"',
    note: '(The Witness might lie—it\'s your job to catch them.)',
  },
  {
    num: '2.',
    icon: '💻',
    title: 'THE ANALYST AGENT',
    desc: 'Submit clues or ask for a logic check on a suspect\'s story.',
    example: '"Does the security log match Sasha\'s alibi?"',
    note: '(The Analyst will flag contradictions if they find a lie.)',
  },
  {
    num: '3.',
    icon: '🎙',
    title: 'THE NARRATOR AGENT',
    desc: 'Interact with the room or get a summary of your progress.',
    example: '"Search the victim\'s pockets" or "Give me a case recap."',
    note: '(The Narrator evolves the story based on your discoveries.)',
  },
]

export default function LandingPage({ onStart }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 420px',
      background: 'var(--black)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Subtle purple radial bg */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 30% 50%, rgba(124,63,124,0.12) 0%, transparent 65%)',
      }} />

      {/* ── LEFT: Hero ─────────────────────────────────────────────── */}
      <div style={{
        padding: '48px 48px 60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Quote marks */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '4.5rem',
            color: 'var(--white)',
            lineHeight: 0.8,
            letterSpacing: '-0.04em',
            userSelect: 'none',
          }}
        >
          ❝❝
        </motion.div>

        {/* Big hero text */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: '-20px' }}>
          {['CRIME', 'SCENE'].map((word, i) => (
            <motion.div
              key={word}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.15 + i * 0.18, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: 'var(--font-hero)',
                fontSize: 'clamp(7rem, 15vw, 13rem)',
                color: 'var(--purple)',
                lineHeight: 0.88,
                letterSpacing: '0.01em',
                textShadow: '3px 3px 0px var(--purple-dim), 0 0 60px rgba(124,63,124,0.3)',
              }}
            >
              {word}
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            style={{
              fontFamily: 'var(--font-stamp)',
              fontWeight: 700,
              fontSize: 'clamp(1rem, 2.5vw, 1.8rem)',
              color: 'var(--purple-light)',
              letterSpacing: '0.3em',
              marginTop: '16px',
            }}
          >
            INVESTIGATION.......
          </motion.div>
        </div>

        {/* START button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={onStart}
            style={{
              width: '155px', height: '155px',
              borderRadius: '50%',
              background: 'var(--orange)',
              border: 'none',
              color: 'var(--black)',
              fontFamily: 'var(--font-hero)',
              fontSize: '2.2rem',
              letterSpacing: '0.06em',
              cursor: 'pointer',
              animation: 'pulseGlow 2.2s ease-in-out infinite',
              position: 'relative',
              zIndex: 10,
            }}
          >
            START
          </motion.button>
        </motion.div>
      </div>

      {/* ── RIGHT: Agent info panel ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        style={{
          background: 'var(--black-2)',
          borderLeft: '1px solid var(--border)',
          padding: '48px 32px',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{
          fontSize: '1.3rem',
          fontWeight: 700,
          color: 'var(--white)',
          lineHeight: 1.35,
          marginBottom: '36px',
        }}>
          😱 What happens in the<br />investigation room?
        </div>

        {AGENTS.map((agent, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 + i * 0.14 }}
            style={{ marginBottom: '32px' }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 700,
              fontSize: '0.82rem',
              letterSpacing: '0.04em',
              color: 'var(--white)',
              marginBottom: '10px',
            }}>
              <span style={{ color: 'var(--grey)' }}>{agent.num}</span>
              <span>{agent.icon}</span>
              <span>{agent.title}</span>
            </div>
            <div style={{
              paddingLeft: '18px',
              borderLeft: '2px solid var(--border-2)',
            }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--white-dim)', marginBottom: '6px', lineHeight: 1.65 }}>
                {agent.desc}
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--grey)', fontStyle: 'italic', lineHeight: 1.6 }}>
                ↳ Example: {agent.example}
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--grey)', fontStyle: 'italic', lineHeight: 1.6 }}>
                {agent.note}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
