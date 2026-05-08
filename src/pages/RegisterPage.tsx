import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import Button from '../components/ui/Button'
import GlassCard from '../components/ui/GlassCard'
import TextField from '../components/ui/TextField'
import CetsoLogo from '../components/brand/CetsoLogo'
import { findStudentById, registerStudent } from '../lib/studentRegistry'
import type { ProgramCode, YearLevel } from '../mocks/mockStudents'
import { setMockSession } from '../lib/mockSession'

type Step = 1 | 2 | 3

const STEP_LABELS = ['Verify ID', 'Your Info', 'Set Password']

export default function RegisterPage() {
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>(1)
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [programCode, setProgramCode] = useState<ProgramCode>('BSIT')
  const [yearLevel, setYearLevel] = useState<YearLevel>(1)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const student = useMemo(() => {
    if (!studentId.trim()) return null
    return findStudentById(studentId.trim())
  }, [studentId])

  function goNext() {
    setError(null)
    if (step === 1) {
      if (!studentId.trim()) { setError('Student ID is required.'); return }
      if (student) {
        setFullName(student.fullName)
        setProgramCode(student.programCode)
        setYearLevel(student.yearLevel)
      }
      setStep(2)
      return
    }
    if (step === 2) {
      if (!fullName.trim()) { setError('Full name is required.'); return }
      setStep(3)
      return
    }
    if (step === 3) {
      if (password.length < 4) { setError('Password is too short (min 4 characters).'); return }
      if (password !== confirmPassword) { setError('Passwords do not match.'); return }
      const savedStudent = registerStudent({ studentId, fullName, programCode, yearLevel, password })
      setSuccess(true)
      setMockSession({
        role: 'student',
        studentId: savedStudent.studentId,
        studentName: savedStudent.fullName,
        programCode: savedStudent.programCode,
        yearLevel: savedStudent.yearLevel,
      })
      window.setTimeout(() => navigate('/student/dashboard'), 700)
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: `radial-gradient(ellipse 1200px 700px at 80% -5%, rgba(255,122,24,0.16), transparent 65%),
        radial-gradient(ellipse 900px 600px at 15% 15%, rgba(255,178,74,0.10), transparent 60%),
        var(--cetso-bg)`,
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Top bar */}
        <div className="mb-8 flex items-center justify-between">
          <CetsoLogo />
          <Link to="/login">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-3.5 w-3.5" /> Sign In Instead
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
              className="relative overflow-hidden rounded-[32px] p-8"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)',
                minHeight: 480,
              }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: 'radial-gradient(ellipse 600px 350px at 80% 0%, rgba(255,122,24,0.26), transparent 60%), radial-gradient(ellipse 500px 280px at 10% 90%, rgba(255,178,74,0.14), transparent 55%)',
                }}
              />
              <div className="relative">
                <h1
                  style={{
                    fontFamily: 'var(--font-h1)',
                    fontSize: 'clamp(48px, 6vw, 72px)',
                    lineHeight: 0.93,
                    letterSpacing: '0.01em',
                    color: 'white',
                  }}
                >
                  JOIN THE VOTE
                </h1>
                <p className="mt-4 text-sm font-medium leading-relaxed text-[var(--cetso-text-2)] max-w-[280px]">
                  CET-exclusive voter registration. Secure, simple, and verified for your program.
                </p>

                <div
                  className="mt-7 flex items-center gap-3 rounded-2xl p-4"
                  style={{
                    background: 'rgba(255,122,24,0.08)',
                    border: '1px solid rgba(255,122,24,0.22)',
                  }}
                >
                  <div
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                    style={{ background: 'rgba(255,122,24,0.16)', border: '1px solid rgba(255,122,24,0.30)' }}
                  >
                    <Sparkles className="h-4 w-4 text-[var(--cetso-orange)]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">CET Exclusive Badge</div>
                    <div className="mt-0.5 text-xs font-medium text-[var(--cetso-text-2)]">
                      Imported students + manual registration supported.
                    </div>
                  </div>
                </div>

                {/* Step indicators */}
                <div className="mt-8 space-y-3">
                  {STEP_LABELS.map((label, i) => {
                    const n = i + 1
                    const done = n < step
                    const active = n === step
                    return (
                      <div key={label} className="flex items-center gap-3">
                        <div
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black transition-all"
                          style={done ? {
                            background: 'rgba(34,197,94,0.20)',
                            border: '1px solid rgba(34,197,94,0.40)',
                            color: 'rgba(134,239,172,0.90)',
                          } : active ? {
                            background: 'rgba(255,122,24,0.22)',
                            border: '1px solid rgba(255,122,24,0.45)',
                            color: 'var(--cetso-orange)',
                          } : {
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.10)',
                            color: 'var(--cetso-text-3)',
                          }}
                        >
                          {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : n}
                        </div>
                        <span
                          className="text-sm font-semibold"
                          style={{ color: active ? 'white' : done ? 'rgba(134,239,172,0.80)' : 'var(--cetso-text-3)' }}
                        >
                          {label}
                        </span>
                      </div>
                    )
                  })}
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
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--cetso-text-3)]">
                    Registration
                  </div>
                  <h2 className="mt-2 text-3xl font-black text-white">Create your voter profile</h2>
                </div>
                <div className="shrink-0 text-[11px] font-bold text-[rgba(255,178,74,0.85)]">
                  Step {step} / 3
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-6 flex gap-2">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-1.5 flex-1 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.07)' }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: n < step
                          ? 'linear-gradient(90deg, rgba(34,197,94,0.70), rgba(34,197,94,0.50))'
                          : n === step
                            ? 'linear-gradient(90deg, #ff7a18, #ffb24a)'
                            : 'transparent',
                      }}
                      initial={{ width: '0%' }}
                      animate={{ width: n <= step ? '100%' : '0%' }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  </div>
                ))}
              </div>

              {/* Form steps */}
              <div className="mt-7">
                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.28 }}
                      className="space-y-4"
                    >
                      <TextField
                        label="Student ID"
                        name="studentId"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="e.g. 598_____"
                        autoComplete="username"
                        error={error ?? undefined}
                      />
                      <AnimatePresence>
                        {student ? (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="rounded-2xl p-4"
                            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}
                          >
                            <div className="text-[11px] font-bold uppercase tracking-widest text-[rgba(134,239,172,0.80)] mb-1">
                              Found in Records
                            </div>
                            <div className="text-sm font-bold text-white">{student.fullName}</div>
                            <div className="text-xs font-medium text-[var(--cetso-text-2)] mt-0.5">
                              {student.programCode} • Year {student.yearLevel}
                            </div>
                          </motion.div>
                        ) : studentId.trim() ? (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="rounded-2xl p-4"
                            style={{ background: 'rgba(255,122,24,0.06)', border: '1px solid rgba(255,122,24,0.18)' }}
                          >
                            <div className="text-xs font-medium text-[var(--cetso-text-2)]">
                              Not found in imported records — manual registration is allowed.
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </motion.div>
                  ) : step === 2 ? (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.28 }}
                      className="space-y-4"
                    >
                      <TextField
                        label="Full Name"
                        name="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Juan Dela Cruz"
                        error={error ?? undefined}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-[var(--cetso-text)]">
                            Program
                          </label>
                          <select
                            value={programCode}
                            onChange={(e) => setProgramCode(e.target.value as ProgramCode)}
                            className="w-full rounded-2xl border border-[var(--cetso-border)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[var(--cetso-text)] transition focus:border-[var(--cetso-border-strong)] focus:outline-none"
                            style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.25)' }}
                          >
                            {['BSIT', 'BLIS', 'BSCpE', 'BSECE'].map((p) => (
                              <option key={p} value={p} className="bg-[#0b0b10]">{p}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-[var(--cetso-text)]">
                            Year Level
                          </label>
                          <select
                            value={String(yearLevel)}
                            onChange={(e) => setYearLevel(Number(e.target.value) as YearLevel)}
                            className="w-full rounded-2xl border border-[var(--cetso-border)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[var(--cetso-text)] transition focus:border-[var(--cetso-border-strong)] focus:outline-none"
                            style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.25)' }}
                          >
                            {[1, 2, 3, 4].map((y) => (
                              <option key={y} value={y} className="bg-[#0b0b10]">Year {y}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.28 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <TextField
                          label="Create Password"
                          name="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          placeholder="Min 4 characters"
                          hint="Demo rule: min 4 characters"
                          error={error?.includes('Password') || error?.includes('short') ? error : undefined}
                        />
                        <TextField
                          label="Confirm Password"
                          name="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          placeholder="Repeat your password"
                          error={error?.includes('match') ? error : undefined}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[var(--cetso-text-2)] hover:text-white transition"
                      >
                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        {showPassword ? 'Hide passwords' : 'Show passwords'}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error (non-field) */}
                <AnimatePresence>
                  {error && step !== 1 && !error.includes('Password') && !error.includes('match') && !error.includes('short') ? (
                    <motion.div
                      key="err"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-4 rounded-2xl p-4"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.30)' }}
                    >
                      <div className="text-xs font-semibold text-[rgba(252,165,165,0.90)]">{error}</div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {/* Actions */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    disabled={step === 1 || success}
                    onClick={() => { setError(null); setStep((s) => (s === 1 ? 1 : ((s - 1) as Step))) }}
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={goNext}
                    variant="primary"
                    size="lg"
                    disabled={success}
                    className="w-full sm:w-[200px]"
                  >
                    {step === 3 ? 'Complete Registration' : 'Continue →'}
                  </Button>
                </div>

                {/* Success */}
                <AnimatePresence>
                  {success ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-4 flex items-center gap-3 rounded-2xl p-4"
                      style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.30)' }}
                    >
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[rgba(134,239,172,0.90)]" />
                      <div>
                        <div className="text-sm font-black text-white">Registration Successful!</div>
                        <div className="mt-0.5 text-xs font-medium text-[var(--cetso-text-2)]">
                          Redirecting to your dashboard…
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <div className="mt-5 text-center text-xs font-semibold text-[var(--cetso-text-3)]">
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="font-bold text-[rgba(255,178,74,0.85)] hover:text-white transition"
                    onClick={() => navigate('/login')}
                  >
                    Sign in →
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
