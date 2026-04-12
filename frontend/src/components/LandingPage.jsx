import React, { useState, useEffect } from 'react'

function FloatingAsset({ src, initialPos, duration, delay }) {
  const [randomId] = useState(() => Math.random().toString(36).substr(2, 9))
  
  return (
    <>
      <style>{`
        @keyframes float-${randomId} {
          0% { transform: translateY(0) rotate(0); opacity: 0; }
          10% { opacity: 0.4; }
          50% { transform: translateY(-40px) rotate(10deg); opacity: 0.4; }
          90% { opacity: 0.4; }
          100% { transform: translateY(0) rotate(0); opacity: 0; }
        }
      `}</style>
      <img
        src={src}
        style={{
          ...initialPos,
          position: 'absolute',
          width: '120px',
          pointerEvents: 'none',
          zIndex: 2,
          filter: 'blur(1px) drop-shadow(0 10px 20px rgba(0,0,0,0.5))',
          animation: `float-${randomId} ${duration}s ease-in-out infinite`,
          animationDelay: `${delay}s`,
          opacity: 0,
        }}
      />
    </>
  )
}

function Particle({ size, top, left, delay }) {
  const [randomId] = useState(() => Math.random().toString(36).substr(2, 9))
  
  return (
    <>
      <style>{`
        @keyframes drift-${randomId} {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          50% { opacity: 0.5; scale: 1; }
          100% { transform: translateY(-100px) scale(0); opacity: 0; }
        }
      `}</style>
      <div
        style={{
          position: 'absolute',
          top: `${top}%`,
          left: `${left}%`,
          width: size,
          height: size,
          background: 'var(--gold-metallic)',
          borderRadius: '50%',
          filter: 'blur(2px)',
          zIndex: 3,
          animation: `drift-${randomId} ${4 + Math.random() * 4}s linear infinite`,
          animationDelay: `${delay}s`,
          opacity: 0,
        }}
      />
    </>
  )
}

export default function LandingPage({ onStart }) {
  const chipPath = `${import.meta.env.BASE_URL}assets/poker_chip.png`

  return (
    <div className="lp-container">
      <style>{`
        .lp-container {
          min-height: 100vh;
          background-color: #050505;
          color: var(--white-soft);
          position: relative;
          overflow: hidden;
          font-family: var(--font-ui);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lp-bg-wrapper {
          position: absolute;
          inset: -10px;
          z-index: 0;
        }

        .lp-bg {
          width: 100%;
          height: 100%;
          background: url("${import.meta.env.BASE_URL}assets/vegas_luxury_noir_background_1775884030168.png") center/cover no-repeat;
          filter: brightness(0.3) saturate(0.7) blur(2px);
        }

        .lp-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, transparent 0%, #050505 95%);
          z-index: 1;
        }

        .lp-content {
          position: relative;
          z-index: 20;
          text-align: center;
          max-width: 1000px;
          padding: 60px;
        }

        .lp-eyebrow {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.6em;
          color: var(--gold-metallic);
          text-transform: uppercase;
          margin-bottom: 30px;
          display: block;
          text-shadow: 0 2px 10px rgba(212, 175, 55, 0.3);
          animation: fadeIn 1.5s ease-out forwards;
        }

        .lp-title {
          font-family: var(--font-title);
          font-size: clamp(3.5rem, 10vw, 8rem);
          font-weight: 800;
          line-height: 0.9;
          margin-bottom: 40px;
          letter-spacing: -0.01em;
          text-shadow: 0 10px 50px rgba(0,0,0,0.8);
          animation: slowGlow 8s ease-in-out infinite, fadeInUp 1s ease-out forwards;
        }

        .lp-subtitle {
          font-family: var(--font-mono);
          font-size: 0.95rem;
          color: #bdbdbd;
          line-height: 1.8;
          max-width: 700px;
          margin: 0 auto 60px;
          letter-spacing: 0.05em;
          font-weight: 300;
          padding: 24px;
          border-left: 2px solid var(--gold-metallic);
          border-right: 2px solid var(--gold-metallic);
          background: rgba(212, 175, 55, 0.03);
          animation: fadeInUp 1s ease-out 0.3s forwards;
          opacity: 0;
        }

        .lp-btn-container {
          animation: fadeInUp 1s ease-out 0.6s forwards;
          opacity: 0;
        }

        .lp-btn {
          background: linear-gradient(135deg, #d4af37 0%, #a67c00 100%);
          color: #000;
          padding: 22px 60px;
          border-radius: var(--radius-pill);
          border: 1px solid rgba(255,255,255,0.2);
          font-family: var(--font-ui);
          font-weight: 800;
          font-size: 1rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .lp-btn:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 20px 50px rgba(212, 175, 55, 0.4);
          letter-spacing: 0.25em;
          background: #f9f6e5;
        }

        .lp-noise {
          position: absolute;
          inset: 0;
          opacity: 0.04;
          pointer-events: none;
          z-index: 5;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <div className="lp-bg-wrapper">
        <div className="lp-bg" />
      </div>
      <div className="lp-overlay" />
      <div className="lp-noise" />

      {/* Floating Assets */}
      <FloatingAsset src={chipPath} initialPos={{ top: '20%', left: '10%' }} duration={8} delay={0} />
      <FloatingAsset src={chipPath} initialPos={{ top: '60%', right: '10%' }} duration={10} delay={2} />
      
      {/* Particles */}
      {[...Array(15)].map((_, i) => (
        <Particle 
          key={i} 
          size={Math.random() * 4 + 2} 
          top={Math.random() * 100} 
          left={Math.random() * 100} 
          delay={Math.random() * 5} 
        />
      ))}

      <main className="lp-content">
        <span className="lp-eyebrow">
          AN EXCLUSIVE LAS VEGAS INVESTIGATION
        </span>

        <h1 className="lp-title gold-text-metallic">
          CSI VEGAS
        </h1>

        <div className="lp-subtitle">
          In a city built on secrets, the truth is just another gamble. 
          You have 30 minutes, key suspects, and a multi-agent AI framework. 
          Can you crack the code before the trail goes cold?
        </div>

        <div className="lp-btn-container">
          <button className="lp-btn" onClick={onStart}>
            INITIATE INVESTIGATION
          </button>
        </div>
      </main>
    </div>
  )
}
