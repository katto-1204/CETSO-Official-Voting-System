import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, FileText, LockKeyhole, Vote, CheckCircle2, Clock, User } from 'lucide-react'
import Button from '../../components/ui/Button'
import GlassCard from '../../components/ui/GlassCard'
import { getMockVoteSubmission, isVoteAlreadySubmitted } from '../../mocks/mockVotes'
import { getStudentContext } from '../../lib/studentContext'
import { ELECTION } from '../../mocks/mockElection'

export default function StudentDashboardPage() {
  const navigate = useNavigate()
  const ctx = getStudentContext()

  const submitted = ctx ? isVoteAlreadySubmitted(ctx.studentId) : false
  const receipt = useMemo(() => {
    if (!ctx || !submitted) return null
    return getMockVoteSubmission(ctx.studentId)
  }, [ctx, submitted])

  if (!ctx) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <div
            className="mx-auto grid h-14 w-14 place-items-center rounded-2xl"
            style={{ background: 'rgba(255,122,24,0.12)', border: '1px solid rgba(255,122,24,0.28)' }}
          >
            <User className="h-6 w-6 text-[var(--cetso-orange)]" />
          </div>
          <div className="mt-4 text-xl font-black text-white">Login Required</div>
          <div className="mt-2 text-sm font-medium text-[var(--cetso-text-2)]">
            Please login as a CET student to access your dashboard.
          </div>
          <Button variant="primary" size="lg" className="mt-6 w-full" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </GlassCard>
      </div>
    )
  }

  const initials = ctx.studentName.split(' ').slice(0, 2).map((p: string) => p[0]).join('').toUpperCase()

  const quickActions = [
    {
      icon: FileText,
      title: 'Candidate Directory',
      sub: 'Browse & filter candidates by position',
      onClick: () => navigate('/student/candidates'),
      highlight: false,
    },
    {
      icon: User,
      title: 'Profile Settings',
      sub: 'Update password and account info',
      onClick: () => navigate('/student/profile'),
      highlight: false,
    },
    ...(submitted && receipt ? [{
      icon: Download,
      title: 'Download Receipt',
      sub: receipt.receipt.verificationCode,
      onClick: () => navigate('/student/receipt'),
      highlight: true,
    }] : []),
  ]

  return (
    <div className="space-y-5">

      {/* ─── Welcome banner ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-[32px] p-6"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.07)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 600px 300px at 0% 0%, rgba(255,122,24,0.18), transparent 60%)' }}
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-xl font-black"
              style={{
                background: 'linear-gradient(135deg, rgba(255,122,24,0.22), rgba(255,178,74,0.12))',
                border: '1px solid rgba(255,122,24,0.38)',
                color: 'var(--cetso-orange)',
                boxShadow: '0 0 28px rgba(255,122,24,0.20)',
              }}
            >
              {initials}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--cetso-text-3)]">
                Welcome back
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-h1)',
                  fontSize: 'clamp(28px, 4vw, 42px)',
                  lineHeight: 0.95,
                  letterSpacing: '0.01em',
                  color: 'var(--cetso-text)',
                  marginTop: 4,
                }}
              >
                {ctx.studentName.toUpperCase()}
              </div>
              <div className="mt-0.5 text-xs font-semibold text-[var(--cetso-text-2)]">
                {ctx.programCode} • Year {ctx.yearLevel} • {ELECTION.electionYear}
              </div>
            </div>
          </div>

          <div
            className="flex items-center gap-2.5 self-start sm:self-auto rounded-2xl px-4 py-3"
            style={{
              background: 'rgba(255,122,24,0.09)',
              border: '1px solid rgba(255,122,24,0.25)',
            }}
          >
            <div
              className="grid h-8 w-8 place-items-center rounded-xl"
              style={{ background: 'rgba(255,122,24,0.16)', border: '1px solid rgba(255,122,24,0.32)' }}
            >
              <LockKeyhole className="h-4 w-4 text-[var(--cetso-orange)]" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[rgba(255,178,74,0.90)]">One vote only</div>
              <div className="mt-0.5 text-[11px] font-medium text-[var(--cetso-text-2)]">Protected from duplicates</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Status + Quick access ────────────────── */}
      <div className="grid grid-cols-12 gap-4">

        {/* Voting status */}
        <motion.div
          className="col-span-12 lg:col-span-7"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <GlassCard className="p-6 h-full">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]">
                  Voting Status
                </div>
                <div className="mt-2 text-2xl font-black text-white">
                  {submitted ? 'Vote Submitted' : 'Ready to Vote'}
                </div>
              </div>
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={submitted ? {
                  background: 'rgba(34,197,94,0.12)',
                  border: '1px solid rgba(34,197,94,0.30)',
                } : {
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.10)',
                }}
              >
                {submitted ? (
                  <CheckCircle2 className="h-4 w-4 text-[rgba(134,239,172,0.95)]" />
                ) : (
                  <Clock className="h-4 w-4 text-[var(--cetso-text-2)]" />
                )}
                <span
                  className="text-xs font-bold"
                  style={{ color: submitted ? 'rgba(134,239,172,0.95)' : 'var(--cetso-text-2)' }}
                >
                  {submitted ? 'Vote Locked' : 'Pending'}
                </span>
              </div>
            </div>

            <div
              className="mt-5 rounded-2xl p-4"
              style={{ background: 'rgba(0,0,0,0.20)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="text-sm font-bold text-white">Election rule reminder</div>
              <div className="mt-1 text-xs font-medium text-[var(--cetso-text-2)] leading-relaxed">
                Election results are weighted at 25% contribution per academic program (BSIT, BLIS, BSCpE, BSECE).
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {!submitted ? (
                <>
                  <Button variant="primary" size="lg" onClick={() => navigate('/student/vote')}>
                    <Vote className="h-4 w-4" /> Start Voting
                  </Button>
                  <Button variant="secondary" size="lg" onClick={() => navigate('/student/candidates')}>
                    Browse Candidates
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="primary" size="lg" onClick={() => navigate('/student/receipt')}>
                    <Download className="h-4 w-4" /> View Receipt
                  </Button>
                  <Button variant="secondary" size="lg" onClick={() => navigate('/student/candidates')}>
                    Candidates (Read-only)
                  </Button>
                </>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Quick access */}
        <motion.div
          className="col-span-12 lg:col-span-5"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.14 }}
        >
          <GlassCard className="p-6 h-full">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]">
              Quick Access
            </div>
            <div className="mt-1.5 text-xl font-black text-white">Move fast, vote clearly.</div>

            <div className="mt-5 space-y-2.5">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.title}
                    type="button"
                    onClick={action.onClick}
                    className="group w-full rounded-2xl p-4 text-left transition-all duration-200 hover:scale-[1.01]"
                    style={action.highlight ? {
                      background: 'rgba(255,122,24,0.10)',
                      border: '1px solid rgba(255,122,24,0.30)',
                    } : {
                      background: 'rgba(0,0,0,0.18)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                        style={{
                          background: 'rgba(255,122,24,0.12)',
                          border: '1px solid rgba(255,122,24,0.25)',
                        }}
                      >
                        <Icon className="h-4 w-4 text-[var(--cetso-orange)]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white">{action.title}</div>
                        <div className="mt-0.5 truncate text-xs font-medium text-[var(--cetso-text-2)]">
                          {action.sub}
                        </div>
                      </div>
                      <div className="ml-auto text-[var(--cetso-text-3)] opacity-0 group-hover:opacity-100 transition">→</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
