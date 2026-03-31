// DossierPanel.jsx
import { motion } from 'framer-motion'

function VictimCard({ victim }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border-2)',
        borderRadius: '24px',
        padding: '12px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        marginBottom: '20px',
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: '68px',
          height: '76px',
          flexShrink: 0,
          background: 'var(--black-3)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.1rem',
        }}
      >
        🕵️
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            color: 'var(--orange)',
            letterSpacing: '0.12em',
            marginBottom: '3px',
          }}
        >
          VICTIM
        </div>

        <div
          style={{
            fontFamily: 'var(--font-stamp)',
            fontWeight: 700,
            fontSize: '1rem',
            color: 'var(--white)',
            lineHeight: 1.2,
            marginBottom: '3px',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          {victim.name}
        </div>

        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.75rem',
            color: 'var(--orange)',
            fontStyle: 'italic',
            marginBottom: '7px',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          {victim.role}
        </div>

        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.63rem',
            color: 'var(--grey)',
            marginBottom: '2px',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          <span style={{ color: 'var(--white-dim)' }}>DETAILS</span> {victim.name}
        </div>

        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.63rem',
            color: 'var(--grey)',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          <span style={{ color: 'var(--white-dim)' }}>EVIDENCE</span> 🔍 Fingerprint on file
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
        borderRadius: '24px',
        padding: '10px',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start',
        marginBottom: '8px',
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: '52px',
          height: '60px',
          flexShrink: 0,
          background: 'var(--black-3)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.7rem',
        }}
      >
        {icon}
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-stamp)',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: 'var(--white)',
            marginBottom: '4px',
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
            fontSize: '0.62rem',
            color: 'var(--grey)',
            lineHeight: 1.5,
            marginBottom: '2px',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          Motive: {suspect.motive.slice(0, 55)}
          {suspect.motive.length > 55 ? '…' : ''}
        </div>

        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.62rem',
            color: 'var(--grey)',
            lineHeight: 1.5,
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          Alibi: {suspect.alibi.slice(0, 55)}
          {suspect.alibi.length > 55 ? '…' : ''}
        </div>

        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.58rem',
            color: 'var(--orange)',
            fontStyle: 'italic',
            marginTop: '5px',
            paddingTop: '5px',
            borderTop: '1px dashed var(--border)',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          🎮 Start msgs with "ask", "found" or "analyze"
        </div>
      </div>
    </motion.div>
  )
}

export default function DossierPanel({ case_ }) {
  if (!case_) return null

  return (
    <div
      style={{
        padding: '20px 16px',
        height: '100%',
        background: 'var(--black-2)',
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
          fontSize: '1.6rem',
          color: 'var(--white)',
          letterSpacing: '0.04em',
          marginBottom: '14px',
        }}
      >
        victim
      </motion.div>

      <VictimCard victim={case_.victim} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{
          fontFamily: 'var(--font-hero)',
          fontSize: '1.3rem',
          color: 'var(--white)',
          letterSpacing: '0.04em',
          marginBottom: '10px',
        }}
      >
        suspects
      </motion.div>

      {[case_.suspect_a, case_.suspect_b].map((s, i) => (
        <SuspectCard key={i} suspect={s} icon={['🧑‍💼', '🕴️'][i]} index={i} />
      ))}
    </div>
  )
}