import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { goeyToast } from 'goey-toast'
import { CheckCircle2, IdCard, Mail } from 'lucide-react'
import Button from '../../components/ui/Button'
import GlassCard from '../../components/ui/GlassCard'
import TextField from '../../components/ui/TextField'
import { CET_PROGRAM_CODES, type ProgramCode, type YearLevel } from '../../lib/studentTypes'
import {
  ensureHcdcGoogleSession,
  getGoogleFullName,
  HCDC_EMAIL_ERROR,
  saveGoogleStudentProfile,
} from '../../lib/hcdcGoogleAuth'
import { supabase } from '../../lib/supabase'

export default function CompleteProfilePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [email, setEmail] = useState('')
  const [studentId, setStudentId] = useState('')
  const [fullName, setFullName] = useState('')
  const [programCode, setProgramCode] = useState<ProgramCode>('BSIT')
  const [yearLevel, setYearLevel] = useState<YearLevel>(1)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadGoogleUser() {
      try {
        const result = await ensureHcdcGoogleSession()
        if (!active) return

        if (result.ok) {
          navigate(result.alreadyVoted ? '/student/receipt' : '/student/dashboard', { replace: true })
          return
        }

        if (result.reason === 'INVALID_EMAIL') {
          sessionStorage.setItem('cetso_login_error', HCDC_EMAIL_ERROR)
          navigate('/login', { replace: true })
          return
        }

        if (result.reason === 'NO_SESSION' || !result.user) {
          navigate('/login', { replace: true })
          return
        }

        setEmail(result.email)
        setFullName(result.suggestedName || getGoogleFullName(result.user))
        setLoading(false)
      } catch (err: any) {
        if (!active) return
        setError(err.message || 'Could not verify your Google login.')
        setLoading(false)
      }
    }

    loadGoogleUser()

    return () => {
      active = false
    }
  }, [navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      await saveGoogleStudentProfile({
        studentId,
        fullName,
        programCode,
        yearLevel,
      })
      goeyToast.success('Profile completed.')
      navigate('/student/dashboard', { replace: true })
    } catch (err: any) {
      setError(err.message || 'Could not save your profile.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--cetso-bg)' }}>
        <GlassCard className="w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[var(--cetso-orange)]" />
          <div className="text-xl font-black text-[var(--cetso-text)] uppercase italic tracking-tighter">Checking Profile</div>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: 'var(--cetso-bg)' }}>
      <GlassCard className="w-full max-w-lg p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--cetso-orange)] to-transparent" />

        <div className="text-center mb-7">
          <img
            src="/Copy of CET Logotype (White).png"
            alt="CET Logotype"
            className="mx-auto mb-5 h-16 w-auto object-contain drop-shadow-[0_4px_16px_rgba(255,255,255,0.12)]"
          />
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--cetso-orange)]">
            Google Verified
          </div>
          <h1
            className="mt-2 italic uppercase tracking-tighter text-[var(--cetso-text)]"
            style={{ fontFamily: 'var(--font-h1)', fontSize: 'clamp(28px, 6vw, 46px)', lineHeight: 0.9 }}
          >
            Complete Profile
          </h1>
          <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white/65">
            <Mail className="h-3.5 w-3.5 text-[var(--cetso-orange)]" />
            <span className="truncate">{email}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Student ID Number"
            name="studentId"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value.trim())}
            placeholder="Enter your real student ID"
            autoComplete="off"
          />

          <TextField
            label="Full Name"
            name="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            autoComplete="name"
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--cetso-text)] tracking-[-0.01em]">
                Program
              </label>
              <select
                value={programCode}
                onChange={(e) => setProgramCode(e.target.value as ProgramCode)}
                className="w-full rounded-2xl border border-[var(--cetso-border)] bg-[var(--cetso-input-bg)] px-4 py-3 text-sm text-[var(--cetso-text)] focus:outline-none"
              >
                {CET_PROGRAM_CODES.map((program) => (
                  <option key={program} value={program} className="bg-[#0b0b10]">
                    {program}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--cetso-text)] tracking-[-0.01em]">
                Year Level
              </label>
              <select
                value={yearLevel}
                onChange={(e) => setYearLevel(Number(e.target.value) as YearLevel)}
                className="w-full rounded-2xl border border-[var(--cetso-border)] bg-[var(--cetso-input-bg)] px-4 py-3 text-sm text-[var(--cetso-text)] focus:outline-none"
              >
                {[1, 2, 3, 4].map((year) => (
                  <option key={year} value={year} className="bg-[#0b0b10]">
                    Year {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-3 text-center text-xs font-bold uppercase tracking-wider text-red-200">
              {error}
            </div>
          ) : null}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs font-semibold leading-relaxed text-white/55">
            <div className="mb-2 flex items-center gap-2 font-black uppercase tracking-wider text-white/70">
              <IdCard className="h-4 w-4 text-[var(--cetso-orange)]" />
              Visible Student ID
            </div>
            Your Google auth UUID is stored internally only. The admin student list will show the Student ID number you enter here.
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={saving}>
            <CheckCircle2 className="h-4 w-4" />
            Save Profile
          </Button>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/35 transition hover:bg-white/[0.06] hover:text-white/70"
          >
            Use Different Google Account
          </button>
        </form>
      </GlassCard>
    </div>
  )
}
