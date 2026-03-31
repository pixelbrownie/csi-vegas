// GamePage.jsx — 4-column layout: Sidebar | DossierPanel | ChatRoom | RightPanel

import { motion } from 'framer-motion'
import Sidebar from './Sidebar.jsx'
import DossierPanel from './DossierPanel.jsx'
import ChatRoom from './ChatRoom.jsx'
import RightPanel from './RightPanel.jsx'

function TickerTape() {
  const chunk = 'KEEP OUT  '
  const text = chunk.repeat(25)
  const durationSec = 30

  return (
    <div
      style={{
        background: 'var(--yellow)',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        padding: '7px 0',
        borderTop: '3px solid #c8a000',
        borderBottom: '3px solid #c8a000',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: 'inline-block',
          animation: `scrollLeft ${durationSec}s linear infinite`,
          fontFamily: 'var(--font-stamp)',
          fontWeight: 700,
          fontSize: '0.95rem',
          color: 'var(--black)',
          letterSpacing: '0.22em',
        }}
      >
        {text}
        {text}
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
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'var(--black)',
        overflow: 'hidden',
      }}
    >
      <TickerTape />

      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '208px 320px minmax(0, 1fr) 300px',
          columnGap: '10px',
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
            borderRight: '1px solid var(--border)',
            borderLeft: '1px solid var(--border)',
            overflowY: 'auto',
            overflowX: 'hidden',
            minWidth: 0,
            minHeight: 0,
          }}
        >
          <DossierPanel case_={case_} />
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
          }}
        >
          <ChatRoom
            history={history}
            isThinking={isThinking}
            gameState={gameState}
            onSend={onSend}
          />
        </motion.div>

        {/* Col 4: Right panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            borderLeft: '1px solid var(--border)',
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
          />
        </motion.div>
      </div>
    </div>
  )
}