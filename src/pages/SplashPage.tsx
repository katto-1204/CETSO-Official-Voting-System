import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function SplashPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const t = window.setTimeout(() => navigate('/landing'), 2400)
    return () => window.clearTimeout(t)
  }, [navigate])

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--cetso-bg)' }}>
      {/* Radial glow background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 1000px 600px at 20% -10%, rgba(255,122,24,0.32), transparent 65%),
            radial-gradient(ellipse 800px 500px at 82% 15%, rgba(255,178,74,0.18), transparent 60%),
            radial-gradient(ellipse 600px 400px at 50% 95%, rgba(255,122,24,0.12), transparent 55%)
          `,
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.10), rgba(0,0,0,0.60))' }}
      />

      {/* Animated blobs */}
      <motion.div
        aria-hidden="true"
        className="absolute rounded-full blur-3xl"
        style={{
          width: 400,
          height: 400,
          left: '-80px',
          top: '12%',
          background: 'rgba(255,122,24,0.14)',
        }}
        animate={{ x: [0, 60, 0], y: [0, 20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute rounded-full blur-3xl"
        style={{
          width: 460,
          height: 460,
          right: '-100px',
          top: '40%',
          background: 'rgba(255,178,74,0.09)',
        }}
        animate={{ x: [0, -50, 0], y: [0, -15, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Center content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="flex flex-col items-center gap-8"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <div
              className="grid h-20 w-20 place-items-center rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,122,24,0.24), rgba(255,178,74,0.14))',
                border: '1px solid rgba(255,122,24,0.42)',
                boxShadow: '0 0 60px rgba(255,122,24,0.35), 0 0 120px rgba(255,122,24,0.15), 0 8px 32px rgba(0,0,0,0.40)',
              }}
            >
              <img
                src="/CETLOGO.png"
                alt="CET Logo"
                className="h-12 w-12 object-contain"
              />
            </div>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          >
            <div
              className="font-[var(--font-heading)] text-5xl tracking-wider sm:text-6xl"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.80) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: 'none',
                filter: 'drop-shadow(0 0 32px rgba(255,122,24,0.30))',
              }}
            >
              CETSO ELECTIONS
            </div>
            <div
              className="font-[var(--font-heading)] text-5xl tracking-wider sm:text-6xl"
              style={{
                background: 'linear-gradient(135deg, #ff7a18, #ffb24a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 24px rgba(255,122,24,0.45))',
              }}
            >
              2026
            </div>
            <motion.div
              className="mt-4 text-sm font-semibold tracking-widest uppercase text-[var(--cetso-text-2)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Lead Now. Vote with confidence.
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-10 inset-x-0 flex items-center justify-center px-6">
        <div
          className="w-[200px] rounded-full p-[3px]"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          <motion.div
            className="h-1.5 rounded-full"
            style={{
              background: 'linear-gradient(90deg, #ff7a18, #ffb24a)',
              boxShadow: '0 0 20px rgba(255,122,24,0.55)',
            }}
            initial={{ width: 16 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.0, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </div>
  )
}
