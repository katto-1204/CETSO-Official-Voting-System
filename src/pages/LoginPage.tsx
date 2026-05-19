import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, LogIn, ShieldCheck, ArrowLeft, Terminal, ShieldAlert, Mail } from 'lucide-react'
import Button from '../components/ui/Button'
import TextField from '../components/ui/TextField'
import GlassCard from '../components/ui/GlassCard'
import Modal from '../components/ui/Modal'
import { setMockSession } from '../lib/mockSession'
import { supabase } from '../lib/supabase'
import { goeyToast } from 'goey-toast'
import { useTransaction } from '../lib/TransactionContext'
import { ensureHcdcGoogleSession, HCDC_EMAIL_ERROR, signInWithHcdcGoogle } from '../lib/hcdcGoogleAuth'

const ADMIN_USERNAME = '598ADMIN'

export default function LoginPage() {
  const navigate = useNavigate()
  const { runTransaction } = useTransaction()
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [invalidCredentialsOpen, setInvalidCredentialsOpen] = useState(false)

  function handleStudentIdChange(e: React.ChangeEvent<HTMLInputElement>) {
    const normalized = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, ADMIN_USERNAME.length)

    if (ADMIN_USERNAME.startsWith(normalized)) {
      setStudentId(normalized)
    }
  }

  const isAdminMode = useMemo(
    () => studentId.trim().toUpperCase() === ADMIN_USERNAME,
    [studentId]
  )

  useEffect(() => {
    const error = sessionStorage.getItem('cetso_login_error')
    if (error) {
      sessionStorage.removeItem('cetso_login_error')
      setLoginError(error)
      goeyToast.error(error)
    }

    ensureHcdcGoogleSession()
      .then((result) => {
        if (result.ok) {
          navigate(result.alreadyVoted ? '/student/receipt' : '/student/dashboard', { replace: true })
          return
        }
        if (result.reason === 'PROFILE_REQUIRED') {
          navigate('/student/complete-profile', { replace: true })
          return
        }
        if (result.reason === 'INVALID_EMAIL') {
          setLoginError(HCDC_EMAIL_ERROR)
        }
      })
      .catch((err) => {
        console.error('Google session check failed:', err)
      })
  }, [navigate])

  async function handleGoogleLogin() {
    setLoginError('')
    setGoogleLoading(true)
    try {
      await signInWithHcdcGoogle()
    } catch (error: any) {
      setLoginError(error.message || 'Could not start Google login.')
      goeyToast.error(error.message || 'Could not start Google login.')
      setGoogleLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const identity = studentId.trim().toUpperCase()

    if (!identity || !password.trim()) {
      goeyToast.error('Admin username and password required.')
      return
    }

    if (!isAdminMode) {
      goeyToast.error('Use Google login for students. Manual login is only for administrators.')
      return
    }

    setLoading(true)

    try {
      await runTransaction(async () => {
        const email = `${identity}@admin.cetso.edu`
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: password.trim()
        })

        if (error) {
          setInvalidCredentialsOpen(true)
          return
        }

        // Upsert into public.users table so all users appear in Table Editor
        await supabase.from('users').upsert({
          auth_uid: data.user?.id,
          email,
          student_id: null,
          display_name: identity,
          role: 'admin'
        }, { onConflict: 'auth_uid' })

        setMockSession({
          role: 'admin',
          studentId: identity,
          studentName: identity,
          programCode: 'BSIT',
          yearLevel: 1
        })

        goeyToast.success('Welcome back, Administrator.')
        navigate('/admin/dashboard')
      }, 'AUTHENTICATING ADMINISTRATOR')
    } catch (err: any) {
      goeyToast.error(err.message || 'Authentication error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: 'var(--cetso-bg)' }}
    >
      <Modal
        isOpen={invalidCredentialsOpen}
        onClose={() => setInvalidCredentialsOpen(false)}
        title="Invalid Credentials"
        maxWidth="max-w-md"
      >
        <div className="space-y-6 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-red-500/20 bg-red-500/10">
            <ShieldAlert className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-relaxed text-white/70">
              The admin username or password does not match a registered administrator account.
            </p>
            <p className="mt-3 text-[11px] font-medium uppercase leading-relaxed tracking-widest text-white/35">
              Please verify your credentials and try again.
            </p>
          </div>
          <Button variant="primary" size="lg" className="w-full" onClick={() => setInvalidCredentialsOpen(false)}>
            TRY AGAIN
          </Button>
        </div>
      </Modal>

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
            {showAdminLogin ? (
              <ShieldCheck className="h-16 w-16 text-blue-500" />
            ) : (
              <ShieldAlert className="h-16 w-16 text-[var(--cetso-orange)]" />
            )}
          </div>

          <div
            className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent ${showAdminLogin ? 'via-blue-500' : 'via-[var(--cetso-orange)]'} to-transparent opacity-50`}
          />

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative mx-auto mb-6 max-w-[200px]"
            >
              <img
                src="/Copy of CET Logotype (White).png"
                alt="CET Logotype"
                className="h-16 w-auto mx-auto object-contain drop-shadow-[0_4px_16px_rgba(255,255,255,0.12)]"
              />
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.h1
                key={showAdminLogin ? 'admin-title' : 'voter-title'}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.25 }}
                className="italic uppercase tracking-tighter"
                style={{
                  fontFamily: 'var(--font-h1)',
                  fontSize: 'clamp(28px, 5vw, 48px)',
                  lineHeight: 0.8,
                  color: 'var(--cetso-text)',
                }}
              >
                {showAdminLogin ? 'ADMIN' : 'STUDENT'}<br />
                <span className={showAdminLogin ? 'text-blue-500' : 'text-[var(--cetso-orange)]'}>
                  LOGIN
                </span>
              </motion.h1>
            </AnimatePresence>

            <p className="mt-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
              CET Voting System
            </p>
          </div>

          {loginError ? (
            <div className="mb-5 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-center text-xs font-bold uppercase leading-relaxed tracking-wider text-red-200">
              {loginError}
            </div>
          ) : null}

          {!showAdminLogin ? (
            <div className="space-y-5">
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="w-full relative overflow-hidden group/btn"
                loading={googleLoading}
                onClick={handleGoogleLogin}
              >
                <div className="flex items-center justify-center gap-3">
                  <Mail className="h-5 w-5" />
                  <span className="italic tracking-tighter">Continue with HCDC Google Email</span>
                </div>
                <motion.div
                  className="absolute inset-0 bg-white/10"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              </Button>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                  Student access
                </div>
                <div className="mt-2 text-xs font-semibold leading-relaxed text-white/60">
                  Use your official <span className="font-black text-white">@hcdc.edu.ph</span> Google account. Student ID and masterlist checks are disabled for now.
                </div>
              </div>
            </div>
          ) : null}

          {/* Admin Form */}
          <form onSubmit={handleSubmit} className={`space-y-6 ${showAdminLogin ? '' : 'hidden'}`}>
            <TextField
              label="Admin Username"
              name="studentId"
              type="text"
              inputMode="text"
              pattern="598ADMIN"
              maxLength={8}
              value={studentId}
              onChange={handleStudentIdChange}
              placeholder={ADMIN_USERNAME}
              autoComplete="username"
            />

            <div className="relative">
              <TextField
                label="Password"
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
              className="w-full relative overflow-hidden group/btn bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"
              loading={loading}
            >
              <div className="flex items-center justify-center gap-3">
                <LogIn className="h-5 w-5" />
                <span className="italic tracking-tighter">ADMIN LOGIN</span>
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
              Help &amp; Support
            </span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <div className="flex flex-col gap-3">
            <Link to="/" className="w-full">
              <Button variant="ghost" size="sm" className="w-full bg-white/5 border border-white/5 group/home">
                <ArrowLeft className="h-3 w-3 group-hover/home:-translate-x-1 transition-transform" /> Home
              </Button>
            </Link>

            <button
              type="button"
              onClick={() => {
                setShowAdminLogin((current) => !current)
                setLoginError('')
                setStudentId('')
                setPassword('')
              }}
              className="w-full rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/35 transition hover:bg-white/[0.06] hover:text-white/70"
            >
              {showAdminLogin ? 'Use Student Google Login' : 'Admin Login'}
            </button>
          </div>

          {/* Dynamic Tooltip */}
          <AnimatePresence mode="wait">
            {showAdminLogin && (
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
                    Admin Mode Active
                  </div>
                </div>
                <div className="text-[11px] font-medium text-white/40 leading-relaxed">
                  Admin credentials detected. Use your registered administrator password.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* Footer legal subtle */}
        <div className="mt-6 text-center text-[9px] font-black uppercase tracking-widest text-white/20 italic">
          Official CET System • All activity is recorded
        </div>
      </motion.div>
    </div>
  )
}
