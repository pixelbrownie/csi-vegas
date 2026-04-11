import { Suspense } from 'react'
import ErrorBoundary from '../ErrorBoundary.jsx'
import '../../framer/styles.css'
import Eyes from '../../framer/eyes.js'

/**
 * Framer marketplace “eyes” (cursor-follow). Placed in the game sidebar below NEW CASE.
 */
export default function FramerEyes() {
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '48px',
        marginBottom: '10px',
      }}
    >
      <style>{`
        .framer-eyes-override {
          transform: scale(1.35) !important;
          width: 56px !important;
          height: 36px !important;
        }
      `}</style>
      <ErrorBoundary fallback={null}>
        <Eyes.Responsive className="framer-eyes-override" />
      </ErrorBoundary>
    </div>
  )
}
