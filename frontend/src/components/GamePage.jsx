// GamePage.jsx — 4-column layout: Sidebar | DossierPanel | ChatRoom | RightPanel

import { motion } from 'framer-motion'
import Sidebar from './Sidebar.jsx'
import DossierPanel from './DossierPanel.jsx'
import ChatRoom from './ChatRoom.jsx'
import RightPanel from './RightPanel.jsx'

function TickerTape() {
  const chunk = 'CRIME SCENE DO NOT CROSS  '
  const text = chunk.repeat(25)
  const durationSec = 100

  return (
    <div
      style={{
        background: 'var(--gold-metallic)',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        padding: '5px 0',
        flexShrink: 0,
        zIndex: 60,
      }}
    >
      <div
        style={{
          display: 'inline-block',
          animation: `scrollLeft ${durationSec}s linear infinite`,
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          fontSize: '0.65rem',
          color: 'var(--black-pure)',
          letterSpacing: '0.4em',
        }}
      >
        {text}
        {text}
      </div>
    </div>
  )
}

function StatusBar() {
  return (
    <div
      style={{
        background: 'var(--black-pure)',
        overflow: 'hidden',
        padding: '8px 30px',
        borderBottom: '1px solid var(--border-gold)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
        zIndex: 50,
      }}
    >
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.55rem',
        color: 'var(--gold-metallic)',
        letterSpacing: '0.4em',
        textTransform: 'uppercase',
      }}>
        Bellagio Security Network // Encrypted
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.55rem',
        color: 'var(--grey-chic)',
        letterSpacing: '0.2em',
      }}>
        LV NV // 10:40 PM
      </div>
    </div>
  )
}

export default function GamePage({
  case_,
  caseFile,
  history,
  isThinking,
  gameState,
  startTime,
  onSend,
  onNewCase,
  onAccuse,
  onTimeUp,
  connectionError,
  apiBaseUrl,
  onConnectionRetry,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'var(--black-pure)',
        overflow: 'hidden',
      }}
    >
      <TickerTape />
      <StatusBar />

      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '220px 340px minmax(0, 1fr) 320px',
          gap: '12px',
          padding: '12px',
          overflow: 'hidden',
          minHeight: 0,
          width: '100%',
        }}
      >
        {/* Col 1: Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            overflow: 'hidden',
            minWidth: 0,
            minHeight: 0,
            background: 'var(--black-rich)',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--border-gold)',
          }}
        >
          <Sidebar
            startTime={startTime}
            gameState={gameState}
            onTimeUp={onTimeUp}
            onNewCase={onNewCase}
          />
        </motion.div>

        {/* Col 2: Dossier */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          style={{
            background: 'var(--black-rich)',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--border-gold)',
            overflowY: 'auto',
            overflowX: 'hidden',
            minWidth: 0,
            minHeight: 0,
          }}
        >
          <DossierPanel case_={case_} connectionError={connectionError} />
        </motion.div>

        {/* Col 3: Chat */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.14 }}
          style={{
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            minHeight: 0,
            background: 'var(--black-rich)',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--border-gold)',
          }}
        >
          <ChatRoom
            history={history}
            isThinking={isThinking}
            gameState={gameState}
            onSend={onSend}
            connectionError={connectionError}
            apiBaseUrl={apiBaseUrl}
            onConnectionRetry={onConnectionRetry}
          />
        </motion.div>

        {/* Col 4: Right panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            background: 'var(--black-rich)',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--border-gold)',
            overflowY: 'auto',
            overflowX: 'hidden',
            minWidth: 0,
            minHeight: 0,
          }}
        >
          <RightPanel
            case_={case_}
            caseFile={caseFile}
            gameState={gameState}
            onAccuse={onAccuse}
            onNewCase={onNewCase}
            connectionError={connectionError}
            apiBaseUrl={apiBaseUrl}
          />
        </motion.div>
      </div>
    </div>
  )
}