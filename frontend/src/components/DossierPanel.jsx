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
        borderRadius: '18px',
        padding: '10px',
        display: 'flex',
        gap: '9px',
        alignItems: 'flex-start',
        marginBottom: '16px',
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: '40px',
          height: '46px',
          flexShrink: 0,
          background: 'var(--black-3)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
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
            fontSize: '0.5rem',
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
            fontSize: '0.88rem',
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
            fontSize: '0.66rem',
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
            fontSize: '0.56rem',
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
            fontSize: '0.56rem',
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
        borderRadius: '16px',
        padding: '9px',
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-start',
        marginBottom: '8px',
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: '30px',
          height: '40px',
          flexShrink: 0,
          background: 'var(--black-3)',
          border: '1px solid var(--border)',
          borderRadius: '9px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.95rem',
        }}
      >
        {icon}
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-stamp)',
            fontWeight: 700,
            fontSize: '0.76rem',
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
            fontSize: '0.56rem',
            color: 'var(--grey)',
            lineHeight: 1.5,
            marginBottom: '2px',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          Motive: {suspect.motive.slice(0, 48)}
          {suspect.motive.length > 48 ? '…' : ''}
        </div>

        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.56rem',
            color: 'var(--grey)',
            lineHeight: 1.5,
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          Alibi: {suspect.alibi.slice(0, 48)}
          {suspect.alibi.length > 48 ? '…' : ''}
        </div>

        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.52rem',
            color: 'var(--orange)',
            fontStyle: 'italic',
            marginTop: '5px',
            paddingTop: '5px',
            borderTop: '1px dashed var(--border)',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          Start msgs with "ask", "found" or "analyze"
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