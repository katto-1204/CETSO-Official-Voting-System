import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, RefreshCw } from 'lucide-react'

export default function SplashPage() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState('')
  const [showRedirectFallback, setShowRedirectFallback] = useState(false)

  useEffect(() => {
    // Dynamic local time formatter matching "MON, 6:14 PM"
    const updateTime = () => {
      const now = new Date()
      const day = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
      const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      setCurrentTime(`${day}, ${timeStr}`)
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Smooth progress increment matching 2.4s total load
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 1
      })
    }, 20) // 100 steps * 20ms = 2s total duration
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (progress === 100) {
      navigate('/landing', { replace: true })
      const fallback = setTimeout(() => setShowRedirectFallback(true), 1200)
      return () => clearTimeout(fallback)
    }
  }, [progress, navigate])

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center" style={{ background: 'var(--cetso-bg)' }}>
      {/* Premium ambient glows */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 1000px 600px at 20% -10%, rgba(255,122,24,0.18), transparent 65%),
            radial-gradient(ellipse 800px 500px at 80% 90%, rgba(255,122,24,0.08), transparent 60%)
          `,
        }}
      />

      <div className="relative z-10 w-full max-w-[560px] px-4">
        {/* Main Cryptographic Terminal Widget */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-[28px] border border-white/[0.06] bg-[#0c0d10] p-6 sm:p-8 overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.85)]"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.035) 1.5px, transparent 1.5px)',
            backgroundSize: '16px 16px',
          }}
        >
          {/* Subtle top glare highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Top Section */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-white/[0.05]">
            {/* Left Column: Airport-ticket style route */}
            <div className="flex-1">
              <div className="flex items-start gap-2 font-['DotGothic16'] text-[40px] leading-none font-normal tracking-[0.06em] text-white">
                <span>CET ELECTIONS</span>
                <span className="text-xl text-[#ff9f1a] font-bold mt-1">2026</span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-white text-base font-bold tracking-tight">Voter Portal</div>
                  <div className="text-white/40 text-[10px] font-bold tracking-widest mt-1 uppercase font-mono">
                    {currentTime || 'MON, 12:00 AM'}
                  </div>
                </div>
                <div>
                  <div className="text-white text-base font-bold tracking-tight">Secure Vault</div>
                  <div className="text-white/40 text-[10px] font-bold tracking-widest mt-1 uppercase font-mono">
                    TUE, 5:00 PM
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: High-tech ETA Display */}
            <div className="w-full sm:w-[170px] shrink-0 bg-black/45 border border-white/[0.04] rounded-2xl p-4 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between text-white font-extrabold text-sm tracking-wide">
                  <span>POLLS OPEN</span>
                  <div className="h-5 w-5 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                    <RefreshCw className="h-3 w-3 text-white/60 animate-spin" style={{ animationDuration: '4s' }} />
                  </div>
                </div>
                <div className="text-white/30 text-[9px] font-bold tracking-widest uppercase mt-1">
                  Official Server Time
                </div>
              </div>

              <div className="text-[#ff9f1a] font-black text-[10px] tracking-[0.16em] uppercase select-none animate-pulse">
                TUNNEL ACTIVE
              </div>
            </div>
          </div>

          {/* Bottom Section: Progress Bar / Slider */}
          <div className="mt-6">
            <div className="w-full bg-[#050608]/90 rounded-[20px] h-14 p-1.5 border border-white/[0.04] relative flex items-center justify-between overflow-hidden">
              {/* Glowing Orange Progress Bar */}
              <div
                className="h-full rounded-[14px] bg-gradient-to-r from-[#ff5e00] to-[#ff9f1a] shadow-[0_0_24px_rgba(255,94,0,0.45)] flex items-center justify-end pr-1.5 transition-all duration-75 relative z-10"
                style={{ width: `${Math.max(progress, 10)}%` }}
              >
                {/* Floating Secure Icon inside a glass circle */}
                <div className="h-[38px] w-[38px] rounded-full border border-white/30 flex items-center justify-center bg-white/10 backdrop-blur-md text-white shadow-inner">
                  <Shield className="h-4 w-4 stroke-[2.5]" />
                </div>
              </div>

              {/* Dynamic Status / Countdown Text on the right */}
              <div className="absolute right-5 font-mono text-white/35 text-[11px] font-bold tracking-[0.18em] select-none uppercase z-0">
                {progress === 100 ? 'SECURED' : `BOOT: ${progress}%`}
              </div>
            </div>
          </div>

        </motion.div>

        {showRedirectFallback ? (
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={() => navigate('/landing', { replace: true })}
              className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#ffbd5a] underline decoration-[#ff9f1a]/50 underline-offset-4 transition-colors duration-200 hover:text-white"
            >
              click here to redirect
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
