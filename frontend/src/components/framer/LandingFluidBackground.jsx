import { Suspense } from 'react'
import ErrorBoundary from '../ErrorBoundary.jsx'
import '../../framer/styles.css'
import FluidFlowBackground from '../../framer/FluidFlowBackground.js'

/**
 * Framer marketplace fluid WebGL background for the landing hero (full-viewport layer).
 */
export default function LandingFluidBackground() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        minHeight: '100%',
      }}
    >
      <style>{`
        .framer-fluid-override {
          width: 100% !important;
          height: 100% !important;
          min-height: 100vh !important;
          opacity: 0.85 !important;
        }
      `}</style>
      <ErrorBoundary fallback={null}>
        <FluidFlowBackground.Responsive
          className="framer-fluid-override"
          resolution={0.35}
          autoDemo
        />
      </ErrorBoundary>
    </div>
  )
}
