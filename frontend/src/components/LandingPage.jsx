import React, { Suspense } from 'react'
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion'

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
          background-color: var(--black);
          color: var(--white);
          position: relative;
          overflow: hidden;
          font-family: var(--font-ui);
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
            linear-gradient(rgba(251, 146, 60, 0.12) 1px, transparent 1px), 
            linear-gradient(90deg, rgba(251, 146, 60, 0.12) 1px, transparent 1px);
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
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.45em;
          color: var(--orange);
          text-transform: uppercase;
          font-weight: 400;
        }

        .lp-title-bottom {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.45em;
          color: var(--yellow);
          text-transform: uppercase;
          font-weight: 400;
        }

        .lp-top-right {
          position: absolute;
          top: 40px;
          right: 60px;
          font-family: var(--font-ui);
          font-style: italic;
          font-size: 1.2rem;
          color: var(--white-dim);
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
          font-family: var(--font-hero);
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
          background-image: linear-gradient(to right, var(--yellow), var(--orange));
          filter: drop-shadow(0 0 30px rgba(251, 146, 60, 0.35));
        }

        .lp-desc {
          font-family: var(--font-ui);
          font-size: 1.125rem;
          color: var(--white-dim);
          line-height: 1.625;
          font-weight: 400;
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
          border: 1px solid rgba(251, 146, 60, 0.2);
          border-radius: var(--radius-subtle);
          padding: 24px 32px;
          transition: all 0.3s;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .lp-card:hover {
          border-color: rgba(251, 146, 60, 0.6);
          background: rgba(0, 0, 0, 0.65);
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
          font-family: var(--font-stamp);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--orange);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .lp-card-desc {
          font-family: var(--font-ui);
          color: var(--grey);
          line-height: 1.625;
          font-size: 0.9rem;
        }

        .lp-bottom-container {
          margin-top: 80px;
        }

        .lp-btn-primary {
          background: linear-gradient(to right, var(--yellow), var(--orange));
          color: black;
          padding: 18px 56px;
          border-radius: var(--radius-pill);
          font-family: var(--font-stamp);
          font-weight: 700;
          font-size: 1rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          box-shadow: 0 0 35px rgba(251, 146, 60, 0.35);
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .lp-btn-primary:hover {
          transform: scale(1.05);
          box-shadow: 0 0 50px rgba(251, 146, 60, 0.5);
        }
        .lp-noise-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          opacity: 0.15;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
      `}</style>
      
      {/* Vanilla Noise Background */}
      <div className="lp-noise-overlay" />

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
