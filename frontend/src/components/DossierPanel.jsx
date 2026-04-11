// DossierPanel.jsx — Victim + Suspect info
import { motion } from 'framer-motion'

function ProfileCard({ title, name, role, image, fileId }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.5)' }}
      style={{
        background: 'var(--gold-gradient)',
        border: '1px solid #7d6b35',
        borderRadius: 'var(--radius-subtle)',
        padding: '14px',
        marginBottom: '12px',
        position: 'relative',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        boxShadow: '0 3px 15px rgba(0,0,0,0.4)',
      }}
    >
      {/* Character Image Frame */}
      <div style={{
        width: '95px',
        height: '95px',
        flexShrink: 0,
        border: '2px solid #7d6b35',
        borderRadius: '4px',
        overflow: 'hidden',
        background: '#000',
      }}>
        {image && <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'Impact, sans-serif',
          fontSize: '1.2rem',
          color: 'var(--rust-text)',
          letterSpacing: '0.01em',
          textTransform: 'uppercase',
          lineHeight: 1,
          marginBottom: '8px',
          opacity: 0.9,
        }}>
          {title}
        </div>
        
        <div style={{
          fontFamily: 'Impact, sans-serif',
          fontSize: '1.15rem',
          color: 'var(--rust-text)',
          marginBottom: '4px',
          lineHeight: 1,
          textTransform: 'uppercase',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {name}
        </div>

        <div style={{
          fontFamily: 'serif',
          fontSize: '0.7rem',
          color: 'var(--rust-text)',
          marginBottom: '10px',
          fontStyle: 'italic',
          lineHeight: 1.2,
          opacity: 0.8,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {role}
        </div>

        <div style={{
          fontFamily: 'Impact, sans-serif',
          fontSize: '0.7rem',
          color: 'var(--rust-text)',
          lineHeight: 1.3,
          textTransform: 'uppercase',
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
  
  // Check if any part of the name is in the list or ends with 'a'
  const isMatch = parts.some(p => 
    femaleNames.includes(p) || 
    (p.length > 2 && p.endsWith('a') && !['joshua', 'luca', 'noah'].includes(p))
  )
  
  if (isMatch) return true
  return false
}

export default function DossierPanel({ case_, connectionError }) {
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
    <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: '1rem',
        color: 'var(--white-pure)',
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '1px solid var(--border-gold)',
        letterSpacing: '0.05em',
      }}>
        CASE DOSSIER
      </div>

      <ProfileCard
        title="THE DECEASED"
        name={case_.victim.name}
        role={case_.victim.role}
        fileId={`${case_.victim.name.replace(/\s+/g, '')}.DR`}
        image={`${import.meta.env.BASE_URL}assets/${victimImg}`}
      />

      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.55rem',
        color: 'var(--grey-muted)',
        letterSpacing: '0.2em',
        margin: '16px 0 12px',
        textTransform: 'uppercase',
      }}>
        PRIMARY SUSPECTS
      </div>

      <ProfileCard
        title="SUSPECT ALPHA"
        name={case_.suspect_a.name}
        role={case_.suspect_a.motive}
        fileId={`${case_.suspect_a.name.replace(/\s+/g, '')}.POI`}
        image={`${import.meta.env.BASE_URL}assets/${suspectAImg}`}
      />

      <ProfileCard
        title="SUSPECT BETA"
        name={case_.suspect_b.name}
        role={case_.suspect_b.motive}
        fileId={`${case_.suspect_b.name.replace(/\s+/g, '')}.POI`}
        image={`${import.meta.env.BASE_URL}assets/${suspectBImg}`}
      />
    </div>
  )
}