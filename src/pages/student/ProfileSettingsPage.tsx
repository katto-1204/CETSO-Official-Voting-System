import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, RefreshCw, ShieldCheck, UserCircle2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import GlassCard from '../../components/ui/GlassCard'
import { getStudentContext } from '../../lib/studentContext'
import { mapDbStudent, type StudentRecord } from '../../lib/studentTypes'
import { setMockSession } from '../../lib/mockSession'
import { supabase } from '../../lib/supabase'

type StudentRow = {
  student_id: string
  full_name: string
  email?: string | null
  program_code: string
  year_level: number
}

export default function ProfileSettingsPage() {
  const navigate = useNavigate()
  const ctx = getStudentContext()
  const [profile, setProfile] = useState<StudentRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadProfile() {
      if (!ctx?.studentId) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const rpc = await supabase.rpc('get_student_by_id', { p_student_id: ctx.studentId })
        const rpcData = rpc.data as StudentRow[] | StudentRow | null
        const data = Array.isArray(rpcData) ? rpcData[0] ?? null : rpcData

        if (rpc.error) throw rpc.error
        if (!data) throw new Error('Student profile was not found in the database.')

        const nextProfile = mapDbStudent(data)
        if (!active) return

        setProfile(nextProfile)
        setMockSession({
          role: 'student',
          studentId: nextProfile.studentId,
          studentName: nextProfile.fullName,
          programCode: nextProfile.programCode,
          yearLevel: nextProfile.yearLevel,
        })
      } catch (fetchError: any) {
        if (!active) return
        setError(fetchError?.message || 'Could not load student profile from the database.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProfile()
    return () => {
      active = false
    }
  }, [ctx?.studentId])

  const activeStudent = profile ?? (ctx ? {
    studentId: ctx.studentId,
    fullName: ctx.studentName,
    programCode: ctx.programCode,
    yearLevel: ctx.yearLevel,
    email: null,
  } : null)

  const initials = useMemo(() => {
    if (!activeStudent) return '?'
    return activeStudent.fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
  }, [activeStudent])

  if (!ctx) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <div className="text-xl font-black text-white">Login required</div>
          <div className="mt-2 text-sm font-medium text-[var(--cetso-text-2)]">Please log in to view your profile.</div>
          <Button variant="primary" size="lg" className="mt-6 w-full" onClick={() => navigate('/login')}>Go to Login</Button>
        </GlassCard>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[var(--cetso-orange)] border-t-transparent" />
          <div className="text-xl font-black text-white">Loading profile...</div>
          <div className="mt-2 text-sm font-medium text-[var(--cetso-text-2)]">Syncing your student record from the registry.</div>
        </GlassCard>
      </div>
    )
  }

  if (error || !activeStudent) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <GlassCard className="max-w-md w-full p-8 text-center border border-red-500/25">
          <div className="text-xl font-black text-white">Profile sync failed</div>
          <div className="mt-2 text-sm font-medium text-[var(--cetso-text-2)]">
            {error || 'Student profile could not be loaded.'}
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" size="lg" className="flex-1" onClick={() => navigate('/student/dashboard')}>
              Back to Dashboard
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </GlassCard>
      </div>
    )
  }

  const emailValue = profile?.email || 'Not available in student registry'

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[32px] p-6"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.50)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 500px 280px at 0% 0%, rgba(255,122,24,0.16), transparent 65%)' }}
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-xl font-black"
              style={{
                background: 'linear-gradient(135deg, rgba(255,122,24,0.22), rgba(255,178,74,0.12))',
                border: '1px solid rgba(255,122,24,0.38)',
                color: 'var(--cetso-orange)',
                boxShadow: '0 0 28px rgba(255,122,24,0.18)',
              }}
            >
              {initials}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]">Profile Settings</div>
              <div className="mt-1 text-2xl font-black text-white">{activeStudent.fullName}</div>
              <div className="mt-0.5 text-xs font-semibold text-[var(--cetso-text-2)]">
                {activeStudent.studentId} - {activeStudent.programCode} - Year {activeStudent.yearLevel}
              </div>
            </div>
          </div>

          <div
            className="self-start sm:self-auto flex items-center gap-2 rounded-2xl px-4 py-3"
            style={{ background: 'rgba(255,122,24,0.08)', border: '1px solid rgba(255,122,24,0.25)' }}
          >
            <ShieldCheck className="h-4 w-4 text-[var(--cetso-orange)] shrink-0" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[rgba(255,178,74,0.90)]">Live Database Sync</div>
              <div className="mt-0.5 text-[11px] font-medium text-[var(--cetso-text-2)]">Student registry record</div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-12 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="col-span-12 lg:col-span-4"
        >
          <GlassCard className="p-6 h-full">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]">Profile Photo</div>
            <div className="mt-5 flex flex-col items-center gap-4">
              <div
                className="grid h-28 w-28 place-items-center rounded-3xl text-4xl font-black"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,122,24,0.22), rgba(255,178,74,0.14))',
                  border: '2px solid rgba(255,122,24,0.35)',
                  color: 'var(--cetso-orange)',
                  boxShadow: '0 0 40px rgba(255,122,24,0.20)',
                }}
              >
                <UserCircle2 className="h-14 w-14" />
              </div>

              <div className="text-center">
                <div className="text-sm font-bold text-white">{activeStudent.fullName}</div>
                <div className="mt-0.5 text-xs font-medium text-[var(--cetso-text-2)]">{activeStudent.programCode}</div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[var(--cetso-text-2)]">
              The profile photo area follows the student registry record.
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.10 }}
          className="col-span-12 lg:col-span-8"
        >
          <GlassCard className="p-6 h-full">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]">Account Details</div>
                <div className="mt-1.5 text-xl font-black text-white">Synced from the database</div>
                <p className="mt-1 text-sm font-medium text-[var(--cetso-text-2)]">This view now reads the latest student row from Supabase.</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { label: 'Student ID', value: activeStudent.studentId },
                { label: 'Full Name', value: activeStudent.fullName },
                { label: 'Email', value: emailValue },
                { label: 'Program', value: activeStudent.programCode },
                { label: 'Year Level', value: `Year ${activeStudent.yearLevel}` },
                { label: 'Source', value: 'Supabase students table' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl p-4"
                  style={{ background: 'rgba(0,0,0,0.20)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]">{item.label}</div>
                  <div className="mt-1 break-words text-sm font-bold text-white">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-orange-500/20 bg-orange-500/8 p-4 text-sm text-[var(--cetso-text-2)]">
              If the student record changes in Supabase, this page will reflect the updated name, program, year level, and email after refresh or next login.
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <div>
        <Button variant="ghost" size="lg" onClick={() => navigate('/student/dashboard')}>
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
      </div>
    </div>
  )
}
