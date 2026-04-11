import React, { Suspense } from 'react'
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion'
import ErrorBoundary from './ErrorBoundary.jsx'
import '../framer/styles.css'
import SpectraNoise from '../framer/SpectraNoise.js'

export default function LandingPage({ onStart }) {
  // Track mouse coordinates for dynamic background glow
  const mouseX = useMotionValue(15)
  const mouseY = useMotionValue(20)
  
  // Apply a smooth spring so it follows naturally
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 })
  
  const glowBackground = useMotionTemplate`
    radial-gradient(circle at ${springX}% ${springY}%, rgba(190, 242, 100, 0.32), transparent 40%),
    radial-gradient(circle at 80% 30%, rgba(251, 146, 60, 0.18), transparent 40%), 
    radial-gradient(circle at 50% 80%, rgba(132, 204, 22, 0.15), transparent 45%)
  `

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect()
    mouseX.set(((clientX - left) / width) * 100)
    mouseY.set(((clientY - top) / height) * 100)
  }

  return (
    <div className="lp-container" onMouseMove={handleMouseMove}>
      <style>{`
        .lp-container {
          min-height: 100vh;
          background-color: #050805;
          color: white;
          position: relative;
          overflow: hidden;
          font-family: sans-serif;
        }
        
        .lp-spectra {
          position: absolute;
          inset: 0;
          opacity: 0.4;
          z-index: 0;
        }

        .framer-spectra-override {
          width: 100% !important;
          height: 100% !important;
          min-height: 100vh !important;
        }

        .lp-glow {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
        }

        .lp-grid {
          position: absolute;
          inset: 0;
          opacity: 0.1;
          z-index: 1;
          pointer-events: none;
          background-image: 
            linear-gradient(rgba(190, 242, 100, 0.08) 1px, transparent 1px), 
            linear-gradient(90deg, rgba(190, 242, 100, 0.08) 1px, transparent 1px);
          background-size: 45px 45px;
        }

        .lp-main {
          position: absolute;
          inset: 0;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 80px;
        }

        .lp-top-left {
          position: absolute;
          top: 40px;
          left: 60px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .lp-title-top {
          font-size: 0.8rem;
          letter-spacing: 0.45em;
          color: #bef264;
          text-transform: uppercase;
          font-weight: 600;
        }

        .lp-title-bottom {
          font-size: 0.8rem;
          letter-spacing: 0.45em;
          color: #fb923c;
          text-transform: uppercase;
          font-weight: 600;
        }

        .lp-top-right {
          position: absolute;
          top: 40px;
          right: 60px;
          font-family: serif;
          font-style: italic;
          font-size: 1.5rem;
          color: #f4f4f5;
        }

        .lp-middle-row {
          display: flex;
          flex-direction: row;
          gap: 100px;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 1300px;
          margin-top: 40px;
        }

        @media (max-width: 1024px) {
          .lp-middle-row { flex-direction: column; text-align: center; gap: 60px; }
        }

        .lp-hero-left {
          display: flex;
          flex-direction: column;
          max-width: 500px;
        }

        @media (max-width: 1024px) {
          .lp-hero-left { align-items: center; }
        }

        .lp-h1 {
          font-size: 9rem;
          font-weight: 900;
          line-height: 0.85;
          margin-bottom: 24px;
          letter-spacing: -0.025em;
          text-transform: uppercase;
        }
        @media (max-width: 768px) {
          .lp-h1 { font-size: 5rem; }
        }

        .lp-gradient-text {
          color: transparent;
          background-clip: text;
          -webkit-background-clip: text;
          background-image: linear-gradient(to right, #bef264, #fb923c);
          filter: drop-shadow(0 0 30px rgba(190, 242, 100, 0.35));
        }

        .lp-desc {
          font-size: 1.125rem;
          color: #d4d4d8;
          line-height: 1.625;
          font-weight: 300;
        }

        .lp-cards {
          display: grid;
          gap: 20px;
          flex-grow: 1;
          max-width: 600px;
        }

        .lp-card {
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(190, 242, 100, 0.2);
          border-radius: 1.25rem;
          padding: 24px 32px;
          transition: all 0.3s;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .lp-card:hover {
          border-color: rgba(190, 242, 100, 0.6);
        }
        
        .lp-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .lp-card-icon {
          font-size: 1.4rem;
        }

        .lp-card-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #bef264;
        }

        .lp-card-desc {
          color: #a1a1aa;
          line-height: 1.625;
          font-size: 0.95rem;
        }

        .lp-bottom-container {
          margin-top: 80px;
        }

        .lp-btn-primary {
          background: linear-gradient(to right, #bef264, #fb923c);
          color: black;
          padding: 16px 48px;
          border-radius: 1.25rem;
          font-weight: 800;
          font-size: 1.1rem;
          box-shadow: 0 0 35px rgba(190, 242, 100, 0.35);
          border: none;
          cursor: pointer;
        }
      `}</style>
      
      {/* Spectra Noise Background */}
      <div className="lp-spectra">
        <ErrorBoundary fallback={null}>
          <SpectraNoise.Responsive className="framer-spectra-override" />
        </ErrorBoundary>
      </div>

      {/* Green / Yellow Ambient Glow */}
      <motion.div className="lp-glow" style={{ background: glowBackground }} />

      {/* Tactical Grid Overlay */}
      <div className="lp-grid" />

      <main className="lp-main">
        {/* Top left metadata */}
        <div className="lp-top-left">
          <div className="lp-title-top">Bellagio Case Simulation</div>
          <div className="lp-title-bottom">Live Investigation Interface</div>
        </div>

        {/* Top right floating text */}
        <div className="lp-top-right">
          how to play
        </div>

        <div className="lp-middle-row">
          {/* Left Hero */}
          <motion.div
            className="lp-hero-left"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="lp-h1">
              CSI <br />
              <span className="lp-gradient-text">Vegas</span>
            </h2>

            <p className="lp-desc">
              Investigate dynamic AI-driven murder cases in real time. Question suspects,
              examine evidence, and expose contradictions before the killer disappears.
            </p>
          </motion.div>

          {/* Right Cards */}
          <div className="lp-cards">
            {[
              {
                icon: '🕵️‍♂️',
                title: 'Witness Agent',
                desc: 'Interrogate suspects and pressure-test every statement.'
              },
              {
                icon: '🧠',
                title: 'Analyst Agent',
                desc: 'Cross-reference clues and identify timeline inconsistencies.'
              },
              {
                icon: '🎬',
                title: 'Narrator Agent',
                desc: 'Explore crime scenes and advance the case narrative.'
              }
            ].map((card, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03, x: 10 }}
                className="lp-card"
              >
                <div className="lp-card-header">
                  <span className="lp-card-icon">{card.icon}</span>
                  <h3 className="lp-card-title">{card.title}</h3>
                </div>
                <p className="lp-card-desc">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="lp-bottom-container">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="lp-btn-primary"
            onClick={onStart}
          >
            Start Investigation
          </motion.button>
        </div>
      </main>
    </div>
  )
}
