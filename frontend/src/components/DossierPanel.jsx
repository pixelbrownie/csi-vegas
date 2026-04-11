import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function ProfileCard({ title, name, role, image, fileId, onAccuse, gameState }) {
  const [isHovered, setIsHovered] = useState(false)
  const isSuspect = title !== 'THE DECEASED'
  const canAccuse = isSuspect && gameState === 'playing'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        background: 'var(--gold-gradient)',
        border: '1px solid #7d6b35',
        borderRadius: 'var(--radius-sharp)',
        padding: '12px 16px', // Balanced padding
        marginBottom: '10px',
        position: 'relative',
        display: 'flex',
        gap: '14px', // Reduced gap for symmetry
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        cursor: canAccuse ? 'pointer' : 'default',
        overflow: 'hidden',
      }}
    >
      <AnimatePresence>
        {isHovered && canAccuse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 10,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px var(--gold-glow)' }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation()
                onAccuse(name)
              }}
              style={{
                background: 'var(--gold-metallic)',
                color: 'var(--black-pure)',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 'var(--radius-pill)',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.7rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                cursor: 'pointer',
              }}
            >
              DELIVER VERDICT
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character Image Frame - Reduced size */}
      <div style={{
        width: '78px',
        height: '78px',
        flexShrink: 0,
        border: '1.5px solid #7d6b35',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#000',
        boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
      }}>
        {image && <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-title)',
          fontSize: '0.75rem', // Smaller
          color: 'var(--rust-text)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          fontWeight: 800,
          lineHeight: 1,
          marginBottom: '4px',
          opacity: 0.8,
        }}>
          {title}
        </div>
        
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '1.05rem', // Slightly smaller for mono
          color: 'var(--rust-text)',
          fontWeight: 700,
          marginBottom: '4px',
          lineHeight: 1.1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          letterSpacing: '-0.02em',
        }}>
          {name}
        </div>

        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '0.68rem', // Smaller
          color: 'var(--rust-text)',
          marginBottom: '6px',
          fontWeight: 500,
          lineHeight: 1.3,
          opacity: 0.85,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {role}
        </div>

        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.62rem', // Smaller
          color: 'var(--rust-text)',
          lineHeight: 1.3,
          opacity: 0.9,
          fontWeight: 600,
        }}>
          FILE: {fileId}<br />
          STATUS: <span style={{ textDecoration: 'underline' }}>{title === 'THE DECEASED' ? 'CLOSED_V' : 'UNDER SURVEILLANCE'}</span>
        </div>
      </div>
    </motion.div>
  )
}

function isFemale(name) {
  if (!name) return false
  const femaleNames = [
    'priya', 'lena', 'lola', 'sarah', 'elena', 'maria', 'sophia', 'isabella', 
    'mia', 'amelia', 'evelyn', 'abigail', 'elizabeth', 'anna', 'laura', 'rose', 
    'ananya', 'maya', 'zara', 'lily', 'grace', 'clara', 'julia', 'emily', 'lucy',
    'nina', 'tanya', 'sheila', 'rachel', 'monica', 'phoebe', 'claire', 'beverly',
    'veronica', 'diana', 'sandra', 'cynthia', 'natalie', 'stacy', 'victoria'
  ]
  const n = name.toLowerCase()
  const parts = n.split(/\s+/)
  
  const isMatch = parts.some(p => 
    femaleNames.includes(p) || 
    (p.length > 2 && p.endsWith('a') && !['joshua', 'luca', 'noah'].includes(p))
  )
  
  if (isMatch) return true
  return false
}

export default function DossierPanel({ case_, connectionError, onAccuse, gameState }) {
  if (connectionError) return (
    <div style={{ padding: '24px', color: 'var(--crimson-accent)', fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>
      ERROR: CONNECTION SEVERED
    </div>
  )
  
  if (!case_) return (
    <div style={{ padding: '24px', color: 'var(--grey-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>
      // AWAITING DATA...
    </div>
  )

  const victimImg = isFemale(case_.victim.name) ? 'victim_f.png' : 'victim_m.png'
  const suspectAImg = isFemale(case_.suspect_a.name) ? 'suspect_f.png' : 'suspect_m.png'
  const suspectBImg = isFemale(case_.suspect_b.name) ? 'suspect_f.png' : 'suspect_m.png'

  return (
    <div style={{ padding: '20px 24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        fontFamily: 'var(--font-title)',
        fontSize: '1rem',
        color: 'var(--white-pure)',
        fontWeight: 800,
        marginBottom: '12px', // Balanced distance
        paddingBottom: '8px',
        borderBottom: '1px solid var(--border-gold)',
        letterSpacing: '0.12em',
        textAlign: 'center',
        textTransform: 'uppercase',
      }}>
        Case Dossier
      </div>

      <ProfileCard
        title="THE DECEASED"
        name={case_.victim.name}
        role={case_.victim.role}
        fileId={`${case_.victim.name.replace(/\s+/g, '')}.DR`}
        image={`${import.meta.env.BASE_URL}assets/${victimImg}`}
        onAccuse={onAccuse}
        gameState={gameState}
      />

      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.52rem',
        color: 'var(--grey-muted)',
        letterSpacing: '0.25em',
        margin: '14px 0 10px',
        textTransform: 'uppercase',
        fontWeight: 700,
        textAlign: 'center', // Symmetrical
      }}>
        PRIMARY SUSPECTS
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <ProfileCard
          title="SUSPECT ALPHA"
          name={case_.suspect_a.name}
          role={case_.suspect_a.motive}
          fileId={`${case_.suspect_a.name.replace(/\s+/g, '')}.POI`}
          image={`${import.meta.env.BASE_URL}assets/${suspectAImg}`}
          onAccuse={onAccuse}
          gameState={gameState}
        />

        <ProfileCard
          title="SUSPECT BETA"
          name={case_.suspect_b.name}
          role={case_.suspect_b.motive}
          fileId={`${case_.suspect_b.name.replace(/\s+/g, '')}.POI`}
          image={`${import.meta.env.BASE_URL}assets/${suspectBImg}`}
          onAccuse={onAccuse}
          gameState={gameState}
        />
      </div>

      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.55rem',
        color: 'var(--gold-metallic)',
        letterSpacing: '0.12em',
        marginTop: 'auto',
        paddingTop: '20px',
        textAlign: 'center',
        textTransform: 'uppercase',
        opacity: 0.5,
      }}>
        Hover to vote or accuse
      </div>
    </div>
  )
}