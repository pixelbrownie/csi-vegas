// RightPanel.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SecretReveal from './SecretReveal.jsx'

// ── Parchment Case File ────────────────────────────────────────────────────────
function CaseFile({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0, rotate: 0.8 }}
      animate={{ opacity: 1, rotate: 0.3 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'linear-gradient(140deg, #d2bc82 0%, #b89050 100%)',
        border: '1px solid #8a6c3a',
        borderRadius: 'var(--radius-sharp)',
        padding: '16px',
        position: 'relative',
        boxShadow: '3px 4px 14px rgba(0,0,0,0.6)',
        transform: 'rotate(0.3deg)',
        marginBottom: '14px',
        marginTop: '8px',
        minWidth: 0,
      }}
    >
      {/* Gold paperclip */}
      <div
        style={{
          position: 'absolute',
          top: '-7px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '34px',
          height: '11px',
          background: 'var(--gold)',
          borderRadius: '2px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
        }}
      />

      <div
        style={{
          fontFamily: 'var(--font-stamp)',
          fontWeight: 700,
          fontStyle: 'normal',
          fontSize: '0.9rem',
          color: '#2a1808',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '10px',
          borderBottom: '1px solid rgba(42,24,8,0.25)',
          paddingBottom: '7px',
        }}
      >
        Live Case File
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={text}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 400,
            fontStyle: 'italic',
            fontSize: '0.76rem',
            color: '#2a1808',
            lineHeight: 1.75,
            maxHeight: '160px',
            overflowY: 'auto',
            overflowX: 'hidden',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
            minWidth: 0,
            whiteSpace: 'pre-wrap',
          }}
        >
          {text}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

// ── Accusation Panel ───────────────────────────────────────────────────────────
function AccusationPanel({ case_, gameState, onAccuse, onNewCase }) {
  const [selected, setSelected] = useState('')
  const [shown, setShown] = useState(false)

  if (gameState === 'solved')
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: '#081a08',
          border: '2px solid var(--green)',
          borderRadius: 'var(--radius-subtle)',
          padding: '16px',
          marginBottom: '10px',
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-stamp)',
            fontWeight: 700,
            fontStyle: 'normal',
            fontSize: '1rem',
            color: 'var(--green)',
            marginBottom: '8px',
          }}
        >
          ✅ CASE CLOSED!
        </div>

        {[
          ['Culprit', case_.culprit],
          ['Weapon', case_.murder_weapon],
          ['Key Clue', case_.key_clue],
        ].map(([k, v]) => (
          <div
            key={k}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: '#4a9850',
              lineHeight: 1.8,
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
            }}
          >
            <strong style={{ color: 'var(--green)' }}>{k}:</strong> {v}
          </div>
        ))}

        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={onNewCase}
          style={{
            marginTop: '12px',
            width: '100%',
            padding: '9px',
            background: 'transparent',
            border: '1px solid var(--green)',
            color: 'var(--green)',
            fontFamily: 'var(--font-stamp)',
            fontWeight: 700,
            fontStyle: 'normal',
            fontSize: '0.72rem',
            letterSpacing: '0.12em',
            cursor: 'pointer',
            borderRadius: 'var(--radius-pill)',
          }}
        >
          PLAY AGAIN
        </motion.button>
      </motion.div>
    )

  if (gameState === 'failed')
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: '#1a0808',
          border: '2px solid var(--orange)',
          borderRadius: 'var(--radius-subtle)',
          padding: '16px',
          marginBottom: '10px',
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-stamp)',
            fontWeight: 700,
            fontStyle: 'normal',
            fontSize: '1rem',
            color: 'var(--orange)',
            marginBottom: '8px',
          }}
        >
          ❌ WRONG ACCUSATION
        </div>

        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: '#c06050',
            lineHeight: 1.8,
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          The culprit was{' '}
          <strong style={{ color: 'var(--white-dim)' }}>{case_.culprit}</strong>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={onNewCase}
          style={{
            marginTop: '12px',
            width: '100%',
            padding: '9px',
            background: 'transparent',
            border: '1px solid var(--orange)',
            color: 'var(--orange)',
            fontFamily: 'var(--font-stamp)',
            fontWeight: 700,
            fontStyle: 'normal',
            fontSize: '0.72rem',
            letterSpacing: '0.12em',
            cursor: 'pointer',
            borderRadius: 'var(--radius-pill)',
          }}
        >
          PLAY AGAIN
        </motion.button>
      </motion.div>
    )

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border-2)',
        borderRadius: 'var(--radius-subtle)',
        padding: '14px',
        marginBottom: '10px',
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-stamp)',
          fontWeight: 700,
          fontStyle: 'normal',
          fontSize: '0.9rem',
          color: 'var(--white)',
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          marginBottom: '12px',
        }}
      >
        Make Your Accusation
      </div>

      {!shown ? (
        <motion.button
          whileHover={{ borderColor: 'var(--white-dim)', color: 'var(--white)' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShown(true)}
          style={{
            width: '100%',
            padding: '9px',
            background: 'transparent',
            border: '1px solid var(--grey-dim)',
            color: 'var(--grey)',
            fontFamily: 'var(--font-stamp)',
            fontWeight: 700,
            fontStyle: 'normal',
            fontSize: '0.72rem',
            letterSpacing: '0.1em',
            cursor: 'pointer',
            borderRadius: 'var(--radius-pill)',
            transition: 'all 0.2s',
          }}
        >
          I KNOW THE CULPRIT
        </motion.button>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                background: 'var(--black)',
                border: '1px solid var(--border-2)',
                color: selected ? 'var(--white)' : 'var(--grey)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                borderRadius: 'var(--radius-subtle)',
                marginBottom: '8px',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="">— select suspect —</option>
              <option value={case_.suspect_a.name}>{case_.suspect_a.name}</option>
              <option value={case_.suspect_b.name}>{case_.suspect_b.name}</option>
            </select>

            <motion.button
              whileHover={selected ? { scale: 1.02, backgroundColor: 'var(--orange-dark)' } : {}}
              whileTap={selected ? { scale: 0.97 } : {}}
              onClick={() => selected && onAccuse(selected)}
              disabled={!selected}
              style={{
                width: '100%',
                padding: '10px',
                background: selected ? 'var(--orange)' : 'var(--grey-dim)',
                border: 'none',
                color: selected ? 'var(--black)' : 'var(--grey)',
                fontFamily: 'var(--font-stamp)',
                fontWeight: 700,
                fontStyle: 'normal',
                fontSize: '0.82rem',
                letterSpacing: '0.14em',
                cursor: selected ? 'pointer' : 'default',
                borderRadius: 'var(--radius-pill)',
                transition: 'background 0.2s',
              }}
            >
              ACCUSE
            </motion.button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

// ── How to Play ────────────────────────────────────────────────────────────────
function HowToPlay({ victimName }) {
  const items = [
    { icon: '🔍', agent: 'Witness Agent', desc: '– Question suspects', eg: `"Where were you when ${victimName} died?"` },
    { icon: '🧬', agent: 'Analyst Agent', desc: '– Submit clues', eg: '"I found a loyalty card. Analyze it."' },
    { icon: '🎙', agent: 'Narrator Agent', desc: '– Advance the story', eg: 'Anything else you type' },
  ]

  return (
    <div
      style={{
        background: 'var(--black)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-subtle)',
        padding: '12px',
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-stamp)',
          fontWeight: 700,
          fontStyle: 'normal',
          fontSize: '0.84rem',
          color: 'var(--gold)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '10px',
        }}
      >
        How to Play
      </div>

      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: '9px', marginBottom: '9px', minWidth: 0 }}>
          <span style={{ fontSize: '0.9rem', flexShrink: 0, marginTop: '1px' }}>{item.icon}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--orange)' }}>
              {item.agent}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.7rem',
                color: 'var(--grey)',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
              }}
            >
              {item.desc}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.68rem',
                color: 'var(--grey-dim)',
                fontStyle: 'italic',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
              }}
            >
              {item.eg}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function RightPanel({ case_, caseFile, gameState, onAccuse, onNewCase, connectionError, apiBaseUrl }) {
  if (!case_ && connectionError) {
    return (
      <div
        style={{
          padding: '12px 10px',
          height: '100%',
          background: '#090a0d',
          overflowY: 'auto',
          overflowX: 'hidden',
          minWidth: 0,
        }}
      >
        <CaseFile
          text={`⚠️ ${connectionError}\n\nAPI base URL:\n${apiBaseUrl || '(not set)'}\n\nTip: set repo secret VITE_API_URL or edit frontend/public/api-config.json, then redeploy Pages.`}
        />
      </div>
    )
  }

  if (!case_) return null

  return (
    <div
      style={{
        padding: '12px 10px',
        height: '100%',
        background: '#090a0d',
        overflowY: 'auto',
        overflowX: 'hidden',
        minWidth: 0,
      }}
    >
      <CaseFile text={caseFile} />
      <SecretReveal secretText={case_.key_clue.toUpperCase()} />
      <AccusationPanel
        case_={case_}
        gameState={gameState}
        onAccuse={onAccuse}
        onNewCase={onNewCase}
      />
      <HowToPlay victimName={case_.victim.name} />
    </div>
  )
}