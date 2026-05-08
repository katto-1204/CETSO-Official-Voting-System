import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, LogIn, ShieldCheck, Fingerprint, ArrowLeft, Terminal, ShieldAlert, Info, Settings, User, Command } from 'lucide-react'
import Button from '../components/ui/Button'
import TextField from '../components/ui/TextField'
import GlassCard from '../components/ui/GlassCard'
import { login, setSession } from '../lib/mockSession'
import { goeyToast } from 'goey-toast'


export default function LoginPage() {
  const navigate = useNavigate()
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isAdminMode, setIsAdminMode] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!studentId.trim() || !password.trim()) {
      goeyToast.error('Identity and clearance level required.')
      return
    }

    if (!studentId.startsWith('598') && !isAdminMode) {
      goeyToast.error('Invalid ID sequence. Student IDs must begin with 598.')
      return
    }

    setLoading(true)

    // Simulate network delay
    setTimeout(() => {
      const result = login(studentId.trim(), password.trim())
      if (!result.ok) {
        goeyToast.error(result.error || 'Authentication failed. Access denied.')
        setLoading(false)
        return
      }
      
      setSession(result)
      setLoading(false)
      
      goeyToast.success(`Welcome back, ${result.role === 'admin' ? 'Administrator' : 'Voter'}.`)
      
      if (result.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/student/dashboard')
      }
    }, 1200)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: 'var(--cetso-bg)' }}
    >
      {/* Background effects */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          background: `
            radial-gradient(circle at 10% 10%, rgba(255,122,24,0.05), transparent 40%),
            radial-gradient(circle at 90% 90%, rgba(255,178,74,0.05), transparent 40%)
          `,
        }}
      >
        {/* Animated Scanline */}
        <motion.div 
          className="absolute inset-0 w-full h-[2px] bg-[var(--cetso-orange)]/5 z-10"
          animate={{ y: ['-100%', '200%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Cyberpunk Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,122,24,0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,122,24,0.2) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.6, ease: 'backOut' }}
        className="relative w-full max-w-md z-10"
      >
        {/* Header decoration */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-50">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--cetso-orange)]" />
          <Terminal className="h-4 w-4 text-[var(--cetso-orange)]" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--cetso-orange)]" />
        </div>

        <GlassCard className="p-8 relative overflow-hidden group">
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 p-4 opacity-10">
            {isAdminMode ? (
              <ShieldCheck className="h-16 w-16 text-blue-500" />
            ) : (
              <ShieldAlert className="h-16 w-16 text-[var(--cetso-orange)]" />
            )}
          </div>

          <div
            className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-${isAdminMode ? 'blue-500' : '[var(--cetso-orange)]'} to-transparent opacity-50`}
          />

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative mx-auto mb-6 w-fit"
            >
              <div
                className="grid h-20 w-20 place-items-center rounded-[24px] rotate-3 group-hover:rotate-6 transition-transform duration-500"
                style={{
                  background: isAdminMode ? 'rgba(59,130,246,0.08)' : 'rgba(255,122,24,0.08)',
                  border: `1.5px solid ${isAdminMode ? 'rgba(59,130,246,0.4)' : 'rgba(255,122,24,0.4)'}`,
                  boxShadow: `0 0 50px ${isAdminMode ? 'rgba(59,130,246,0.15)' : 'rgba(255,122,24,0.15)'}`,
                }}
              >
                {isAdminMode ? (
                  <Command className="h-10 w-10 text-blue-400 -rotate-3 group-hover:-rotate-6 transition-transform" />
                ) : (
                  <Fingerprint className="h-10 w-10 text-[var(--cetso-orange)] -rotate-3 group-hover:-rotate-6 transition-transform" />
                )}
              </div>
            </motion.div>

            <h1
              className="italic uppercase tracking-tighter"
              style={{
                fontFamily: 'var(--font-h1)',
                fontSize: 'clamp(36px, 6vw, 48px)',
                lineHeight: 0.8,
                color: 'var(--cetso-text)',
              }}
            >
              {isAdminMode ? 'ADMIN' : 'SECURE'}<br />
              <span className={isAdminMode ? 'text-blue-500' : 'text-[var(--cetso-orange)]'}>
                {isAdminMode ? 'CONSOLE' : 'LOGIN'}
              </span>
            </h1>
            <p className="mt-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
              Nexus Protocol • Phase 02 Access
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex gap-2 p-1 rounded-2xl bg-black/40 border border-white/5 mb-8">
            <button
              onClick={() => setIsAdminMode(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isAdminMode ? 'bg-white/5 text-white border border-white/10 shadow-lg' : 'text-white/30 hover:text-white/50'}`}
            >
              <User className="h-3 w-3" /> Voter
            </button>
            <button
              onClick={() => setIsAdminMode(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isAdminMode ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg' : 'text-white/30 hover:text-white/50'}`}
            >
              <Settings className="h-3 w-3" /> Administrator
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <TextField
              label={isAdminMode ? "Admin Identifier" : "Operator Identity (ID)"}
              name="studentId"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder={isAdminMode ? "ADMIN_NAME" : "598XXXXX"}
              autoComplete="username"
            />

            <div className="relative">
              <TextField
                label="Clearance Code"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] p-2 transition-colors hover:text-white"
                style={{ color: 'var(--cetso-text-3)' }}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className={`w-full relative overflow-hidden group/btn ${isAdminMode ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20' : ''}`}
              loading={loading}
            >
              <div className="flex items-center justify-center gap-3">
                <LogIn className="h-5 w-5" />
                <span className="italic tracking-tighter">{isAdminMode ? 'AUTHORIZE CONSOLE' : 'INITIATE SESSION'}</span>
              </div>
              
              {/* Button shimmer */}
              <motion.div 
                className="absolute inset-0 bg-white/10"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-10 mb-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
              Tactical Support
            </span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <div className="flex gap-3">
             <Link to="/" className="flex-1">
              <Button variant="ghost" size="sm" className="w-full bg-white/5 border border-white/5 group/home">
                <ArrowLeft className="h-3 w-3 group-hover/home:-translate-x-1 transition-transform" /> Home
              </Button>
            </Link>
          </div>

          {/* Dynamic Tooltip */}
          <AnimatePresence mode="wait">
            {isAdminMode ? (
              <motion.div
                key="admin-tip"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-8 rounded-2xl p-4 bg-blue-500/5 border border-blue-500/10"
              >
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-3 w-3 text-blue-400" />
                  <div className="text-[9px] font-black uppercase tracking-widest text-blue-400">
                    Admin Protocol
                  </div>
                </div>
                <div className="text-[11px] font-medium text-white/40 leading-relaxed">
                  Use your registered administrator credentials. Session logs are monitored.
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="student-tip"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-8 rounded-2xl p-4 bg-orange-500/5 border border-orange-500/10"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-3 w-3 text-[var(--cetso-orange)]" />
                  <div className="text-[9px] font-black uppercase tracking-widest text-[var(--cetso-orange)]">
                    Identity Retrieval Hint
                  </div>
                </div>
                <div className="text-[11px] font-medium text-white/40 leading-relaxed">
                  Code = Suffix digits + <span className="text-white/60">LASTNAME</span> (Upper)
                  <div className="mt-1 font-mono text-[10px] text-white/20">59812345 + DOE → 12345DOE</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
        
        {/* Footer legal subtle */}
        <div className="mt-6 text-center text-[9px] font-black uppercase tracking-widest text-white/20 italic">
          Authorized CETSO Personnel Only • Access Logged • Node: Stable
        </div>
      </motion.div>
    </div>
  )
}
