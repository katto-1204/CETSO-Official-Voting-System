import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, ShieldCheck, ArrowLeft, User, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../components/ui/Button'
import GlassCard from '../components/ui/GlassCard'
import TextField from '../components/ui/TextField'
import CetsoLogo from '../components/brand/CetsoLogo'
import { findStudentById } from '../lib/studentRegistry'
import { setMockSession } from '../lib/mockSession'

const ADMIN_USERNAME = 'admin@cetso.local'
const ADMIN_PASSWORD = 'CETSO-ADMIN-2026'

export default function LoginPage() {
  const navigate = useNavigate()
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mode, setMode] = useState<'student' | 'admin'>('student')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const student = useMemo(() => {
    if (!studentId) return null
    return findStudentById(studentId)
  }, [studentId])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    setTimeout(() => {
      setLoading(false)

      if (mode === 'admin') {
        if (!studentId.trim() || !password.trim()) {
          setError('Please enter admin username and password.')
          return
        }
        if (studentId.trim() !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
          setError('Invalid admin credentials.')
          return
        }
        setMockSession({ role: 'admin', studentId: null, studentName: 'Admin', programCode: null, yearLevel: null })
        navigate('/admin/dashboard')
        return
      }

      if (!studentId.trim()) { setError('Student ID is required.'); return }
      if (!student) { setError('Student not found. Please register first.'); return }
      if (password !== student.password) { setError('Incorrect password.'); return }

      setMockSession({
        role: 'student',
        studentId: student.studentId,
        studentName: student.fullName,
        programCode: student.programCode,
        yearLevel: student.yearLevel,
      })
      navigate('/student/dashboard')
    }, 350)
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: `radial-gradient(ellipse 1200px 700px at 20% -5%, rgba(255,122,24,0.18), transparent 65%),
        radial-gradient(ellipse 900px 600px at 85% 10%, rgba(255,178,74,0.12), transparent 60%),
        var(--cetso-bg)`,
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Top bar */}
        <div className="mb-8 flex items-center justify-between">
          <CetsoLogo />
          <Link to="/landing">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Left branding */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="col-span-12 hidden lg:col-span-5 lg:block"
          >
            <div
              className="relative h-full min-h-[560px] overflow-hidden rounded-[32px] p-8"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)',
              }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: 'radial-gradient(ellipse 700px 350px at 20% 0%, rgba(255,122,24,0.28), transparent 60%), radial-gradient(ellipse 500px 280px at 90% 25%, rgba(255,178,74,0.18), transparent 55%)',
                }}
              />
              <div className="relative flex flex-col h-full">
                <h1
                  style={{
                    fontFamily: 'var(--font-h1)',
                    fontSize: 'clamp(48px, 6vw, 72px)',
                    lineHeight: 0.93,
                    letterSpacing: '0.01em',
                    color: 'white',
                  }}
                >
                  LEAD WITH TRUST
                </h1>
                <p className="mt-4 text-sm font-medium leading-relaxed text-[var(--cetso-text-2)] max-w-[280px]">
                  Secure authentication, eligibility-based voting, and a verifiable receipt you can keep forever.
                </p>

                <div className="mt-8 space-y-3">
                  {[
                    { icon: ShieldCheck, title: 'CET-only access', sub: 'Only verified CET students can register and vote.' },
                    { icon: Lock, title: 'One vote guaranteed', sub: 'Your vote is cryptographically protected from duplicates.' },
                    { icon: User, title: 'Eligibility matched', sub: 'Positions are auto-filtered for your program and year.' },
                  ].map((item) => {
                    const Icon = item.icon
                    return (
                      <div
                        key={item.title}
                        className="flex items-start gap-3 rounded-2xl p-4"
                        style={{
                          background: 'rgba(255,122,24,0.07)',
                          border: '1px solid rgba(255,122,24,0.18)',
                        }}
                      >
                        <div
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                          style={{
                            background: 'rgba(255,122,24,0.14)',
                            border: '1px solid rgba(255,122,24,0.28)',
                          }}
                        >
                          <Icon className="h-4 w-4 text-[var(--cetso-orange)]" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{item.title}</div>
                          <div className="mt-0.5 text-xs font-medium text-[var(--cetso-text-2)] leading-relaxed">{item.sub}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="divider-orange mt-8" />
                <div className="mt-4 text-xs font-medium text-[var(--cetso-text-2)]">
                  Demo: use Student IDs visible on the registration screen.
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="col-span-12 lg:col-span-7"
          >
            <GlassCard variant="elevated" className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-7">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--cetso-text-3)]">
                    Secure Login
                  </div>
                  <h2 className="mt-2 text-3xl font-black text-white">Welcome back.</h2>
                </div>
                <div
                  className="shrink-0 rounded-xl px-3 py-1.5 text-[11px] font-bold text-[var(--cetso-text-2)]"
                  style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  Secure session
                </div>
              </div>

              {/* Mode toggle */}
              <div
                className="flex gap-1.5 rounded-2xl p-1.5 mb-7"
                style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {(['student', 'admin'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMode(m); setError(null) }}
                    className={[
                      'flex-1 rounded-xl py-2.5 text-sm font-bold transition-all duration-200 capitalize',
                      mode === m
                        ? 'text-white shadow-[0_2px_8px_rgba(0,0,0,0.40)]'
                        : 'text-[var(--cetso-text-2)] hover:text-[var(--cetso-text)]',
                    ].join(' ')}
                    style={mode === m ? {
                      background: 'rgba(255,122,24,0.16)',
                      border: '1px solid rgba(255,122,24,0.38)',
                    } : { border: '1px solid transparent' }}
                  >
                    {m === 'student' ? 'Student Login' : 'Admin Login'}
                  </button>
                ))}
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <TextField
                  label={mode === 'admin' ? 'Admin Username' : 'Student ID'}
                  name="studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder={mode === 'admin' ? 'admin@cetso.local' : 'e.g. 598_____'}
                  autoComplete="username"
                />

                <div>
                  <TextField
                    label="Password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    error={error ?? undefined}
                  />
                  <div className="mt-2.5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[var(--cetso-text-2)] hover:text-white transition"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {showPassword ? 'Hide' : 'Show'} password
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/register')}
                      className="text-xs font-bold text-[rgba(255,178,74,0.90)] hover:text-white transition"
                    >
                      New user? Register →
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-2"
                  disabled={loading}
                >
                  {loading ? 'Signing in…' : mode === 'admin' ? 'Sign in as Admin' : 'Sign in'}
                </Button>
              </form>

              <AnimatePresence>
                {mode === 'student' && student ? (
                  <motion.div
                    key="student-detected"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-4 rounded-2xl p-4"
                    style={{
                      background: 'rgba(255,122,24,0.07)',
                      border: '1px solid rgba(255,122,24,0.22)',
                    }}
                  >
                    <div className="text-[11px] font-bold uppercase tracking-widest text-[rgba(255,178,74,0.85)] mb-1">
                      Student Found
                    </div>
                    <div className="text-sm font-bold text-white">{student.fullName}</div>
                    <div className="text-xs font-medium text-[var(--cetso-text-2)] mt-0.5">
                      {student.programCode} • Year {student.yearLevel}
                    </div>
                  </motion.div>
                ) : null}

                {mode === 'admin' ? (
                  <motion.div
                    key="admin-creds"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 rounded-2xl p-4"
                    style={{
                      background: 'rgba(255,122,24,0.06)',
                      border: '1px solid rgba(255,122,24,0.20)',
                    }}
                  >
                    <div className="text-[11px] font-bold uppercase tracking-widest text-[rgba(255,178,74,0.80)] mb-2">
                      Demo Credentials
                    </div>
                    <div className="text-xs font-medium text-[var(--cetso-text-2)] space-y-1">
                      <div>Username: <span className="font-bold text-white">{ADMIN_USERNAME}</span></div>
                      <div>Password: <span className="font-bold text-white">{ADMIN_PASSWORD}</span></div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
