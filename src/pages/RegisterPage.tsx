import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Shield, Key, UserCheck } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import Button from '../components/ui/Button'
import GlassCard from '../components/ui/GlassCard'
import TextField from '../components/ui/TextField'
import Modal from '../components/ui/Modal'
import { generatePassword, isValidStudentId } from '../lib/studentTypes'
import type { ProgramCode, YearLevel } from '../lib/studentTypes'
import { setMockSession } from '../lib/mockSession'
import { supabase } from '../lib/supabase'
import { expectedHcdcEmailFromName, normalizeHcdcEmail, validateHcdcEmailForName } from '../lib/hcdcEmail'
import { useTransaction } from '../lib/TransactionContext'

type Step = 1 | 2 | 3

const STEP_LABELS = ['Verify ID', 'Your Info', 'Confirm']

export default function RegisterPage() {
  const navigate = useNavigate()
  const { runTransaction } = useTransaction()

  const [step, setStep] = useState<Step>(1)
  const [studentId, setStudentId] = useState('')
  const [fullName, setFullName] = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [programCode, setProgramCode] = useState<ProgramCode>('BSIT')
  const [yearLevel, setYearLevel] = useState<YearLevel>(1)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [generatedPwd, setGeneratedPwd] = useState('')
  const [loading, setLoading] = useState(false)
  const [alreadyRegisteredOpen, setAlreadyRegisteredOpen] = useState(false)

  // Live password preview
  const passwordPreview = useMemo(() => {
    if (!studentId.trim() || !fullName.trim()) return ''
    return generatePassword(studentId.trim(), fullName.trim())
  }, [studentId, fullName])

  async function goNext() {
    setError(null)
    if (step === 1) {
      if (!studentId.trim()) { setError('Student ID is required.'); return }
      if (!isValidStudentId(studentId.trim())) {
        setError('Student ID must start with "598".')
        return
      }
      
      try {
        const { data: existingStudent, error: lookupError } = await runTransaction(async () => {
          return await supabase
            .rpc('get_student_by_id', { p_student_id: studentId.trim() })
            .maybeSingle()
        }, 'LOOKING UP STUDENT ID')

        if (lookupError) {
          setError('Could not verify this student ID. Please try again.')
          return
        }

        if (existingStudent) {
          setAlreadyRegisteredOpen(true)
          return
        }

        setFullName('')
        setStudentEmail('')
        setStep(2)
      } catch (err: any) {
        setError(err.message || 'Verification error')
      }
      return
    }
    if (step === 2) {
      if (!fullName.trim()) { setError('Full name is required.'); return }
      const emailError = validateHcdcEmailForName(studentEmail, fullName)
      if (emailError) { setError(emailError); return }
      setStep(3)
      return
    }
    if (step === 3) {
      setLoading(true)
      const autoPassword = generatePassword(studentId.trim(), fullName.trim())
      const normalizedEmail = normalizeHcdcEmail(studentEmail)

      try {
        await runTransaction(async () => {
          const { data: existingStudent } = await supabase
            .rpc('get_student_by_id', { p_student_id: studentId.trim() })
            .maybeSingle()

          if (existingStudent) {
            setError('This student ID is already registered. Please login instead.')
            setAlreadyRegisteredOpen(true)
            return
          }

          const { error: dbError } = await supabase.from('students').insert({
            student_id: studentId.trim(),
            email: normalizedEmail,
            full_name: fullName.trim(),
            program_code: programCode,
            year_level: yearLevel
          })

          if (dbError) {
            console.error('Error inserting student:', dbError)
            setError(dbError.code === '42501'
              ? 'Supabase blocked registration. Run the database policy fix in supabase/fix-live-database.sql.'
              : dbError.message || 'Registration failed.')
            return
          }

          setGeneratedPwd(autoPassword)
          setSuccess(true)

          // Auto-login after registration (keeping mock session synced)
          setMockSession({
            role: 'student',
            studentId: studentId.trim(),
            studentName: fullName.trim(),
            programCode,
            yearLevel,
          })
        }, 'WRITING REGISTER RECORD')

        // Navigate to dashboard after brief delay
        setTimeout(() => navigate('/student/dashboard'), 2000)
      } catch (err: any) {
        setError(err.message || 'Failed to complete registration')
      } finally {
        setLoading(false)
      }
    }
  }

  function goBack() {
    setError(null)
    if (step === 1) navigate('/login')
    else setStep((s) => Math.max(1, s - 1) as Step)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: 'var(--cetso-bg)' }}
    >
      <Modal
        isOpen={alreadyRegisteredOpen}
        onClose={() => setAlreadyRegisteredOpen(false)}
        title="Already Registered"
        maxWidth="max-w-md"
      >
        <div className="space-y-6 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-orange-500/20 bg-orange-500/10">
            <UserCheck className="h-8 w-8 text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-relaxed text-white/70">
              ID <span className="font-mono font-black text-white">{studentId.trim() || 'N/A'}</span> is already registered.
            </p>
            <p className="mt-3 text-[11px] font-medium uppercase leading-relaxed tracking-widest text-white/35">
              Use your student ID and generated password on the login page.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="secondary" size="lg" onClick={() => setAlreadyRegisteredOpen(false)}>
              CHECK AGAIN
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                setAlreadyRegisteredOpen(false)
                navigate('/login')
              }}
            >
              LOGIN
            </Button>
          </div>
        </div>
      </Modal>

      {/* Background effects */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 800px 600px at 70% 30%, rgba(255,122,24,0.10), transparent 60%),
            radial-gradient(ellipse 600px 400px at 30% 70%, rgba(255,178,74,0.06), transparent 50%)
          `,
        }}
      />

      {/* Grid lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,122,24,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,122,24,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg z-10"
      >
        {/* Back button */}
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-2 mb-6 text-sm font-semibold transition-colors"
          style={{ color: 'var(--cetso-text-2)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          {step === 1 ? 'Back to Login' : 'Previous Step'}
        </button>

        <GlassCard className="p-8 relative overflow-hidden">
          {/* Top accent */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: 'linear-gradient(90deg, transparent, var(--cetso-orange), transparent)' }}
          />

          {/* Header */}
          <div className="text-center mb-6">
            <div
              className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl overflow-hidden bg-black/20"
              style={{
                border: '1px solid rgba(255,122,24,0.35)',
                boxShadow: '0 0 40px rgba(255,122,24,0.20)',
              }}
            >
              <img
                src="/CETSO ELECTION.png"
                alt="CETSO Election Logo"
                className="h-14 w-14 object-contain"
              />
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-h1)',
                fontSize: 'clamp(24px, 5vw, 40px)',
                lineHeight: 0.95,
                color: 'var(--cetso-text)',
                letterSpacing: '0.02em',
              }}
            >
              CREATE ACCOUNT
            </h1>
          </div>

          {/* Step indicator */}
          <div className="flex items-stretch gap-2 mb-6">
            {STEP_LABELS.map((label, i) => {
              const stepNum = (i + 1) as Step
              const isActive = step === stepNum
              const isDone = step > stepNum
              return (
                <div key={label} className="flex-1">
                  <div
                    className="flex h-full items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-1 sm:px-3 py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-widest whitespace-nowrap transition-all"
                    style={
                      isActive
                        ? {
                            background: 'rgba(255,122,24,0.12)',
                            border: '1px solid rgba(255,122,24,0.30)',
                            color: 'var(--cetso-orange)',
                          }
                        : isDone
                          ? {
                              background: 'var(--cetso-success-bg)',
                              border: '1px solid var(--cetso-success-border)',
                              color: 'var(--cetso-success-text)',
                            }
                          : {
                              background: 'var(--cetso-badge-bg)',
                              border: '1px solid var(--cetso-border)',
                              color: 'var(--cetso-text-3)',
                            }
                    }
                  >
                    {isDone ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <span className="shrink-0">{stepNum}</span>}
                    <span className="truncate">{label}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Success state */}
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div
                  className="mx-auto grid h-16 w-16 place-items-center rounded-2xl mb-4"
                  style={{
                    background: 'var(--cetso-success-bg)',
                    border: '1px solid var(--cetso-success-border)',
                  }}
                >
                  <CheckCircle2 className="h-8 w-8" style={{ color: 'var(--cetso-success-text)' }} />
                </div>
                <div className="text-xl font-black" style={{ color: 'var(--cetso-text)' }}>
                  Registration Complete!
                </div>
                <p className="mt-2 text-sm font-medium" style={{ color: 'var(--cetso-text-2)' }}>
                  Redirecting to your dashboard…
                </p>

                {/* Show generated password */}
                <div
                  className="mt-4 rounded-xl p-4 text-left"
                  style={{
                    background: 'rgba(255,122,24,0.06)',
                    border: '1px solid rgba(255,122,24,0.18)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="h-3.5 w-3.5 text-[var(--cetso-orange)]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>
                      Your Auto-Generated Password
                    </span>
                  </div>
                  <div
                    className="font-mono text-lg font-black px-3 py-2 rounded-lg"
                    style={{
                      background: 'rgba(0,0,0,0.15)',
                      border: '1px solid var(--cetso-border)',
                      color: 'var(--cetso-orange)',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {generatedPwd}
                  </div>
                  <p className="mt-2 text-[11px] font-medium" style={{ color: 'var(--cetso-text-2)' }}>
                    Save this password! You'll need it to log in.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`step-${step}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {/* ─── Step 1: Verify ID ─────────── */}
                {step === 1 && (
                  <div className="space-y-4">
                    <TextField
                      label="Student ID"
                      name="studentId"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="598XXXXX"
                      hint="Must start with 598. Your password will be auto-generated."
                      error={error ?? undefined}
                    />

                    {/* ID prefix badge */}
                    <div
                      className="flex items-center gap-2 rounded-xl p-3"
                      style={{
                        background: 'rgba(255,122,24,0.06)',
                        border: '1px solid rgba(255,122,24,0.18)',
                      }}
                    >
                      <Shield className="h-4 w-4 shrink-0 text-[var(--cetso-orange)]" />
                      <span className="text-[11px] font-semibold" style={{ color: 'var(--cetso-text-2)' }}>
                        Only CET students with a valid 598-prefix ID can register.
                      </span>
                    </div>

                    <Button variant="primary" size="lg" className="w-full" onClick={goNext}>
                      Verify & Continue
                    </Button>
                  </div>
                )}

                {/* ─── Step 2: Student Info ─────── */}
                {step === 2 && (
                  <div className="space-y-4">
                    {/* Pre-filled info notice */}
                    <TextField
                      label="Full Name"
                      name="fullName"
                      value={fullName}
                      onChange={(e) => {
                        const nextFullName = e.target.value
                        const previousExpectedEmail = expectedHcdcEmailFromName(fullName)
                        const nextExpectedEmail = expectedHcdcEmailFromName(nextFullName)
                        setFullName(nextFullName)
                        setStudentEmail((current) => (!current || current === previousExpectedEmail ? nextExpectedEmail : current))
                      }}
                      placeholder="e.g. Juan Cruz"
                      error={error?.startsWith('Full name') ? error : undefined}
                    />

                    <TextField
                      label="HCDC Email"
                      name="studentEmail"
                      type="email"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="firstname.lastname@hcdc.edu.ph"
                      hint="For multiple given names, remove spaces before the dot: firstnamesecondname.lastname@hcdc.edu.ph"
                      error={error && !error.startsWith('Full name') ? error : undefined}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-2 block text-sm font-semibold" style={{ color: 'var(--cetso-text)' }}>
                          Program
                        </label>
                        <select
                          value={programCode}
                          onChange={(e) => setProgramCode(e.target.value as ProgramCode)}
                          className="w-full rounded-2xl border px-4 py-3 text-sm transition focus:outline-none"
                          style={{
                            background: 'var(--cetso-input-bg)',
                            border: '1px solid var(--cetso-border)',
                            color: 'var(--cetso-text)',
                          }}
                        >
                          {(['BSIT', 'BLIS', 'BSCpE', 'BSECE'] as ProgramCode[]).map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold" style={{ color: 'var(--cetso-text)' }}>
                          Year Level
                        </label>
                        <select
                          value={String(yearLevel)}
                          onChange={(e) => setYearLevel(Number(e.target.value) as YearLevel)}
                          className="w-full rounded-2xl border px-4 py-3 text-sm transition focus:outline-none"
                          style={{
                            background: 'var(--cetso-input-bg)',
                            border: '1px solid var(--cetso-border)',
                            color: 'var(--cetso-text)',
                          }}
                        >
                          {[1, 2, 3, 4].map((y) => (
                            <option key={y} value={y}>Year {y}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Live password preview */}
                    {passwordPreview && (
                      <div
                        className="rounded-xl p-3"
                        style={{
                          background: 'rgba(255,122,24,0.06)',
                          border: '1px solid rgba(255,122,24,0.18)',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Key className="h-3 w-3 text-[var(--cetso-orange)]" />
                          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>
                            Auto-Generated Password Preview
                          </span>
                        </div>
                        <div className="font-mono text-sm font-bold" style={{ color: 'var(--cetso-orange)' }}>
                          {passwordPreview}
                        </div>
                      </div>
                    )}

                    <Button variant="primary" size="lg" className="w-full" onClick={goNext}>
                      Continue to Confirmation
                    </Button>
                  </div>
                )}

                {/* ─── Step 3: Confirm ──────────── */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="text-sm font-bold" style={{ color: 'var(--cetso-text)' }}>
                      Review your details before creating your account.
                    </div>

                    {/* Summary card */}
                    <div
                      className="rounded-2xl p-4 space-y-3"
                      style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--cetso-border)' }}
                    >
                      {[
                        { label: 'Student ID', value: studentId },
                        { label: 'Full Name', value: fullName },
                        { label: 'HCDC Email', value: normalizeHcdcEmail(studentEmail) },
                        { label: 'Program', value: programCode },
                        { label: 'Year Level', value: `Year ${yearLevel}` },
                        { label: 'Password', value: passwordPreview },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-3">
                          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>
                            {item.label}
                          </span>
                          <span
                            className={`text-sm font-bold ${item.label === 'Password' ? 'font-mono' : ''}`}
                            style={{ color: item.label === 'Password' ? 'var(--cetso-orange)' : 'var(--cetso-text)' }}
                          >
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 rounded-xl p-3"
                        style={{
                          background: 'var(--cetso-error-bg)',
                          border: '1px solid var(--cetso-error-border)',
                        }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--cetso-error)]" />
                        <span className="text-xs font-semibold" style={{ color: 'var(--cetso-error-text)' }}>
                          {error}
                        </span>
                      </motion.div>
                    )}

                    <Button variant="primary" size="lg" className="w-full" onClick={goNext} loading={loading}>
                      <CheckCircle2 className="h-4 w-4" />
                      Create Account
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom link */}
          {!success && (
            <div className="mt-6 text-center text-sm font-medium" style={{ color: 'var(--cetso-text-2)' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-bold" style={{ color: 'var(--cetso-orange)' }}>
                Sign in
              </Link>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  )
}
