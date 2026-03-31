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
      gridTemplateColumns: '1fr 440px',
      background: 'radial-gradient(circle at 20% 30%, #131420 0%, #08090b 58%, #050506 100%)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Ambient overlays */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 30% 45%, rgba(124,63,124,0.18) 0%, transparent 68%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.14) 3px, rgba(0,0,0,0.14) 6px)',
      }} />

      {/* ── LEFT: Hero ─────────────────────────────────────────────── */}
      <div style={{
        padding: '52px 56px 64px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Top meta */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.64rem',
            color: 'var(--grey)',
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
          }}
        >
          Bellagio Case Simulation // Multi-Agent
        </motion.div>

        {/* Big hero text */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: '-24px' }}>
          {['CSI', 'VEGAS'].map((word, i) => (
            <motion.div
              key={word}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.15 + i * 0.18, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: 'var(--font-hero)',
                fontSize: 'clamp(6.8rem, 14vw, 12rem)',
                color: i === 0 ? '#f6f6f6' : 'var(--purple-light)',
                lineHeight: 0.86,
                letterSpacing: '0.04em',
                textShadow: i === 0 ? '0 0 24px rgba(255,255,255,0.16)' : '0 0 28px rgba(192,112,192,0.3)',
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
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: 'clamp(0.75rem, 1.3vw, 1rem)',
              color: 'var(--grey)',
              letterSpacing: '0.22em',
              marginTop: '14px',
              textTransform: 'uppercase',
            }}
          >
            Interrogate. Analyze. Deduce.
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            style={{
              maxWidth: '620px',
              marginTop: '18px',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.94rem',
              color: 'var(--white-dim)',
              lineHeight: 1.7,
            }}
          >
            Enter the investigation room and solve a live murder case. Every action updates the case file in real time.
          </motion.div>
        </div>

        {/* Start CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
        >
          <motion.button
            whileHover={{ scale: 1.02, borderColor: 'var(--white-dim)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            style={{
              padding: '14px 22px',
              borderRadius: '999px',
              background: '#0b0d10',
              border: '1px solid var(--border-2)',
              color: '#f2f2f2',
              fontFamily: 'var(--font-stamp)',
              fontSize: '0.86rem',
              letterSpacing: '0.18em',
              cursor: 'pointer',
            }}
          >
            START INVESTIGATION
          </motion.button>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.58rem',
            color: 'var(--grey)',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}>
            Scrolls to live case room
          </div>
        </motion.div>
      </div>

      {/* ── RIGHT: Agent info panel ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        style={{
          background: '#0a0b0e',
          borderLeft: '1px solid var(--border)',
          padding: '48px 34px',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{
          fontFamily: 'var(--font-stamp)',
          fontSize: '1.15rem',
          fontWeight: 700,
          color: 'var(--white)',
          lineHeight: 1.35,
          marginBottom: '28px',
          letterSpacing: '0.05em',
        }}>
          How the Investigation Works
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
              fontFamily: 'var(--font-stamp)',
              fontWeight: 700,
              fontSize: '0.78rem',
              letterSpacing: '0.08em',
              color: 'var(--white)',
              marginBottom: '9px',
              textTransform: 'uppercase',
            }}>
              <span style={{ color: 'var(--grey)' }}>{agent.num}</span>
              <span>{agent.icon}</span>
              <span>{agent.title}</span>
            </div>
            <div style={{
              paddingLeft: '18px',
              borderLeft: '1px solid var(--border-2)',
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
