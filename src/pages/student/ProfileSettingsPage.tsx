import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, RefreshCw, IdCard, GraduationCap, Mail, BookOpen, CheckCircle2 } from 'lucide-react'
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
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (!ctx?.studentId || refreshing) return
    setRefreshing(true)
    try {
      const rpc = await supabase.rpc('get_student_by_id', { p_student_id: ctx.studentId })
      const rpcData = rpc.data as StudentRow[] | StudentRow | null
      const data = Array.isArray(rpcData) ? rpcData[0] ?? null : rpcData

      if (rpc.error) throw rpc.error
      if (!data) throw new Error('Student profile was not found.')

      const nextProfile = mapDbStudent(data)
      setProfile(nextProfile)
      setMockSession({
        role: 'student',
        studentId: nextProfile.studentId,
        studentName: nextProfile.fullName,
        programCode: nextProfile.programCode,
        yearLevel: nextProfile.yearLevel,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setTimeout(() => {
        setRefreshing(false)
      }, 600)
    }
  }

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
          <div className="text-xl font-black text-[var(--cetso-text)]">Login required</div>
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
          <div className="text-xl font-black text-[var(--cetso-text)]">Loading profile...</div>
          <div className="mt-2 text-sm font-medium text-[var(--cetso-text-2)]">Syncing your student record from the registry.</div>
        </GlassCard>
      </div>
    )
  }

  if (error || !activeStudent) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <GlassCard className="max-w-md w-full p-8 text-center border border-red-500/25">
          <div className="text-xl font-black text-[var(--cetso-text)]">Profile sync failed</div>
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
    <div className="mx-auto max-w-4xl pb-12">
      {/* Sleek Floating Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 border-b border-white/5 pb-5 mb-6"
      >
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="grid h-11 w-11 place-items-center rounded-2xl bg-white/5 text-[var(--cetso-text)] transition-all hover:bg-white/10 active:scale-95 border border-white/10 hover:border-white/20 shadow-lg hover:shadow-white/5 shrink-0"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1
              className="italic uppercase tracking-tighter text-2xl md:text-3.5xl"
              style={{
                fontFamily: 'var(--font-h1)',
                lineHeight: 1,
                color: 'var(--cetso-text)',
              }}
            >
              MY <span className="text-[var(--cetso-orange)]">PROFILE</span>
            </h1>
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/40 mt-1">
              Verified Student Credentials
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Reference 1 & Reference 2 Styled Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <GlassCard className="overflow-hidden p-0 relative border-white/10 hover:border-white/15 transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          {/* Cover Header Banner */}
          <div className="relative h-40 sm:h-48 md:h-56 overflow-hidden">
            {/* Rich Cyberpunk Mesh & Gradient backdrop */}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-600 via-[var(--cetso-orange)] to-black" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:14px_14px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0d] via-transparent to-transparent" />
          </div>

          {/* Overlapping Avatar & Pill Button Container */}
          <div className="relative flex items-center justify-between px-6 sm:px-10 h-16 sm:h-20">
            {/* Circular Overlapping Profile Avatar */}
            <div className="absolute left-6 sm:left-10 -top-12 sm:-top-16 h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-[#0e0f14] bg-[#121318] flex items-center justify-center shadow-[0_15px_30px_rgba(0,0,0,0.6)] z-15 overflow-hidden group">
              <div className="relative h-full w-full flex items-center justify-center bg-gradient-to-br from-neutral-900 to-black">
                <span className="text-2xl sm:text-4.5xl font-black tracking-tighter text-[var(--cetso-orange)] italic drop-shadow-[0_0_12px_rgba(255,122,24,0.5)]">
                  {initials}
                </span>
                {/* HUD inside vector ring */}
                <div className="absolute inset-2 rounded-full border border-[var(--cetso-orange)]/15 pointer-events-none" />
              </div>
            </div>

            {/* Empty space matching left overlap */}
            <div className="w-24 sm:w-32" />

            {/* Custom cyber badge */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--cetso-orange)]/60">
                CET STUDENT
              </span>
            </div>
          </div>

          {/* Biography & Student Info Block */}
          <div className="px-6 sm:px-10 pb-6 sm:pb-8">
            {/* Full Name & Verified Badge */}
            <div className="flex items-center gap-2 mt-4">
              <h2 className="text-2xl sm:text-3.5xl font-black italic uppercase tracking-tighter text-[var(--cetso-text)]">
                {activeStudent.fullName}
              </h2>
              <div className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                <CheckCircle2 className="h-3.5 w-3.5 fill-current text-blue-500 stroke-[3px] text-white" />
              </div>
            </div>

            {/* Handle/ID Label */}
            <p className="text-xs sm:text-sm font-semibold tracking-wider text-[var(--cetso-orange)]/80 mt-1 font-mono uppercase">
              @{activeStudent.studentId.toLowerCase()}_{activeStudent.programCode.toLowerCase()}
            </p>

            {/* Bio quote paragraph */}
            <p className="text-xs sm:text-sm font-medium text-[var(--cetso-text-2)] leading-relaxed mt-4 max-w-2xl">
              Official registered voter of the College of Engineering and Technology.
            </p>

            {/* Title with icon-only Refresh data */}
            <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-6 mb-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--cetso-orange)]">
                Student Registry Details
              </h3>
              
              {/* Icon Only Refresh Data Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-[var(--cetso-orange)] hover:border-[var(--cetso-orange)]/40 hover:bg-[rgba(255,122,24,0.05)] transition-all duration-300 active:scale-95 disabled:opacity-50"
                title="Sync Registry Records"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-[var(--cetso-orange)]' : 'transition-transform duration-500 hover:rotate-180'}`} />
              </button>
            </div>

            {/* Chips flow layout instead of bulk Bento boxes */}
            <div className="flex flex-wrap gap-2.5 mt-2">
              {/* Chip 1: Student ID */}
              <div className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.01] hover:border-[var(--cetso-orange)]/30 hover:bg-white/[0.03] transition-all duration-300">
                <IdCard className="h-4 w-4 text-[var(--cetso-orange)] shrink-0" />
                <span className="text-[10px] font-black text-[var(--cetso-text-3)] uppercase tracking-wider">ID</span>
                <span className="font-mono text-xs font-black text-white">{activeStudent.studentId}</span>
              </div>

              {/* Chip 2: Program */}
              <div className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.01] hover:border-[var(--cetso-orange)]/30 hover:bg-white/[0.03] transition-all duration-300">
                <BookOpen className="h-4 w-4 text-[var(--cetso-orange)] shrink-0" />
                <span className="text-[10px] font-black text-[var(--cetso-text-3)] uppercase tracking-wider">Program</span>
                <span className="text-xs font-black text-white italic">{activeStudent.programCode}</span>
              </div>

              {/* Chip 3: Year Level */}
              <div className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.01] hover:border-[var(--cetso-orange)]/30 hover:bg-white/[0.03] transition-all duration-300">
                <GraduationCap className="h-4 w-4 text-[var(--cetso-orange)] shrink-0" />
                <span className="text-[10px] font-black text-[var(--cetso-text-3)] uppercase tracking-wider">Year Level</span>
                <span className="text-xs font-black text-white">Year {activeStudent.yearLevel}</span>
              </div>

              {/* Chip 4: Email Address */}
              <div className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.01] hover:border-[var(--cetso-orange)]/30 hover:bg-white/[0.03] transition-all duration-300 max-w-full">
                <Mail className="h-4 w-4 text-[var(--cetso-orange)] shrink-0" />
                <span className="text-[10px] font-black text-[var(--cetso-text-3)] uppercase tracking-wider shrink-0">Email</span>
                <span className="font-mono text-xs font-black text-white/90 truncate">{emailValue}</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
