// DossierPanel.jsx
import { motion } from 'framer-motion'

function VictimCard({ victim }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      style={{
        background: 'var(--black-2)',
        border: '1px solid var(--border-2)',
        borderRadius: 'var(--radius-subtle)',
        padding: '12px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        marginBottom: '16px',
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: '44px',
          height: '48px',
          flexShrink: 0,
          background: 'var(--black-3)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
        }}
      >
        🕵️
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.55rem',
            color: 'var(--orange)',
            letterSpacing: '0.12em',
            marginBottom: '4px',
          }}
        >
          VICTIM
        </div>

        <div
          style={{
            fontFamily: 'var(--font-stamp)',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: 'var(--white)',
            lineHeight: 1.2,
            marginBottom: '4px',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          {victim.name}
        </div>

        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.7rem',
            color: 'var(--yellow)',
            fontStyle: 'italic',
            marginBottom: '8px',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          {victim.role}
        </div>

        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.58rem',
            color: 'var(--grey)',
            marginBottom: '3px',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          <span style={{ color: 'var(--white-dim)' }}>FILE</span>: {victim.name}.DR
        </div>

        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.58rem',
            color: 'var(--grey)',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          <span style={{ color: 'var(--white-dim)' }}>STATUS</span>: CLOSED_V
        </div>
      </div>
    </motion.div>
  )
}

function SuspectCard({ suspect, icon, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 + index * 0.1 }}
      whileHover={{ borderColor: 'var(--grey)', transition: { duration: 0.15 } }}
      style={{
        background: 'var(--black)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-subtle)',
        padding: '10px',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start',
        marginBottom: '10px',
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: '32px',
          height: '42px',
          flexShrink: 0,
          background: 'var(--black-3)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1rem',
        }}
      >
        {icon}
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-stamp)',
            fontWeight: 700,
            fontSize: '0.82rem',
            color: 'var(--white)',
            marginBottom: '6px',
            lineHeight: 1.2,
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          {suspect.name}
        </div>

        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.58rem',
            color: 'var(--grey)',
            lineHeight: 1.6,
            marginBottom: '4px',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          <span style={{ color: 'var(--orange)', fontSize: '0.5rem' }}>MOTIVE</span> {suspect.motive.slice(0, 52)}
          {suspect.motive.length > 52 ? '…' : ''}
        </div>

        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.58rem',
            color: 'var(--grey)',
            lineHeight: 1.6,
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          <span style={{ color: 'var(--orange)', fontSize: '0.5rem' }}>ALIBI</span> {suspect.alibi.slice(0, 52)}
          {suspect.alibi.length > 52 ? '…' : ''}
        </div>
      </div>
    </motion.div>
  )
}

export default function DossierPanel({ case_, connectionError }) {
  if (!case_ && connectionError) {
    return (
      <div
        style={{
          padding: '24px 16px',
          height: '100%',
          background: '#0b0c0e',
          overflowX: 'hidden',
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-hero)',
            fontSize: '1.1rem',
            color: 'var(--orange)',
            letterSpacing: '0.06em',
            marginBottom: '12px',
            textTransform: 'uppercase',
          }}
        >
          Case file unavailable
        </div>
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.82rem',
            color: 'var(--white-dim)',
            lineHeight: 1.65,
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          The dossier loads after the backend returns a new case. Use <strong style={{ color: 'var(--white)' }}>NEW CASE</strong> or{' '}
          <strong style={{ color: 'var(--white)' }}>RETRY</strong> in the chat column once the API is reachable.
        </p>
        <p
          style={{
            marginTop: '14px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.62rem',
            color: 'var(--grey)',
            lineHeight: 1.6,
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          {connectionError}
        </p>
      </div>
    )
  }

  if (!case_) return null

  return (
    <div
      style={{
        padding: '18px 14px',
        height: '100%',
        background: '#0b0c0e',
        overflowX: 'hidden',
        minWidth: 0,
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          fontFamily: 'var(--font-hero)',
          fontSize: '1.45rem',
          color: 'var(--white)',
          letterSpacing: '0.04em',
          marginBottom: '10px',
          textTransform: 'uppercase',
        }}
      >
        VICTIM
      </motion.div>

      <VictimCard victim={case_.victim} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{
          fontFamily: 'var(--font-hero)',
          fontSize: '1.25rem',
          color: 'var(--white)',
          letterSpacing: '0.04em',
          marginBottom: '8px',
          textTransform: 'uppercase',
        }}
      >
        SUSPECTS
      </motion.div>

      {[case_.suspect_a, case_.suspect_b].map((s, i) => (
        <SuspectCard key={i} suspect={s} icon={['🧑‍💼', '🕴️'][i]} index={i} />
      ))}
    </div>
  )
}