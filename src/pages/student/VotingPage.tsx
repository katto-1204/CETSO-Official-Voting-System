import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ChevronLeft, ChevronRight, LockKeyhole, Vote } from 'lucide-react'
import Button from '../../components/ui/Button'
import GlassCard from '../../components/ui/GlassCard'
import { getStudentContext } from '../../lib/studentContext'
import { getCandidatesForPosition, getEligiblePositions } from '../../mocks/mockElection'
import { getMockVoteSubmission, isVoteAlreadySubmitted } from '../../mocks/mockVotes'
import type { VoteSelection } from '../../mocks/mockVotes'
import type { Candidate, Position } from '../../mocks/mockElection'
import { ELECTION } from '../../mocks/mockElection'

const DRAFT_KEY = 'cetso_vote_draft'

type Draft = { studentId: string; selections: VoteSelection[] }

function loadDraft(studentId: string): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Draft
    if (parsed.studentId !== studentId) return null
    return parsed
  } catch { return null }
}

function saveDraft(d: Draft) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(d))
}

const AVATAR_COLORS = [
  ['rgba(255,122,24,0.15)', 'rgba(255,122,24,0.35)', '#ff7a18'],
  ['rgba(139,92,246,0.15)', 'rgba(139,92,246,0.35)', '#a78bfa'],
  ['rgba(20,184,166,0.15)', 'rgba(20,184,166,0.35)', '#2dd4bf'],
  ['rgba(59,130,246,0.15)', 'rgba(59,130,246,0.35)', '#60a5fa'],
]

export default function VotingPage() {
  const navigate = useNavigate()
  const ctx = getStudentContext()

  const eligiblePositions: Position[] = useMemo(() => {
    if (!ctx) return []
    return getEligiblePositions({ programCode: ctx.programCode, yearLevel: ctx.yearLevel })
  }, [ctx])

  const [activeIdx, setActiveIdx] = useState(0)
  const [selectionsByPosition, setSelectionsByPosition] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const alreadySubmitted = ctx ? isVoteAlreadySubmitted(ctx.studentId) : false
  const existingSubmission = useMemo(() => {
    if (!ctx || !alreadySubmitted) return null
    return getMockVoteSubmission(ctx.studentId)
  }, [ctx?.studentId, alreadySubmitted])

  useEffect(() => {
    if (!ctx?.studentId) return
    const draft = loadDraft(ctx.studentId)
    if (!draft) return
    const next: Record<string, string> = {}
    for (const s of draft.selections) next[s.positionCode] = s.candidateId
    setSelectionsByPosition(next)
  }, [ctx?.studentId])

  useEffect(() => { setActiveIdx(0) }, [ctx?.studentId])

  const currentPosition = eligiblePositions[activeIdx]
  const candidates: Candidate[] = useMemo(() => {
    if (!currentPosition) return []
    return getCandidatesForPosition(currentPosition.positionCode)
  }, [currentPosition])

  const isComplete = useMemo(() => {
    if (!eligiblePositions.length) return false
    return eligiblePositions.every((p) => Boolean(selectionsByPosition[p.positionCode]))
  }, [eligiblePositions, selectionsByPosition])

  const selectedCount = eligiblePositions.filter((p) => Boolean(selectionsByPosition[p.positionCode])).length

  function onSelectCandidate(candidate: Candidate) {
    if (!currentPosition) return
    const posCode = currentPosition.positionCode
    setSelectionsByPosition((prev) => {
      const next = { ...prev, [posCode]: candidate.candidateId }
      if (ctx) {
        const draftSelections: VoteSelection[] = eligiblePositions
          .map((p) => ({ positionCode: p.positionCode, candidateId: next[p.positionCode] }))
          .filter((x) => Boolean(x.candidateId))
        saveDraft({ studentId: ctx.studentId, selections: draftSelections })
      }
      return next
    })
  }

  function goConfirm() {
    if (!ctx || !currentPosition) return
    if (!isComplete) return
    const selections: VoteSelection[] = eligiblePositions.map((p) => ({
      positionCode: p.positionCode,
      candidateId: selectionsByPosition[p.positionCode],
    }))
    saveDraft({ studentId: ctx.studentId, selections })
    navigate('/student/confirm')
  }

  if (!ctx) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <div className="text-xl font-black text-white">Login required</div>
          <div className="mt-2 text-sm font-medium text-[var(--cetso-text-2)]">Please login as a CET student to vote.</div>
          <Button variant="primary" size="lg" className="mt-6 w-full" onClick={() => navigate('/login')}>Go to Login</Button>
        </GlassCard>
      </div>
    )
  }

  if (alreadySubmitted && existingSubmission) {
    return (
      <div className="space-y-5">
        <GlassCard variant="orange" className="p-6">
          <div className="flex items-start gap-4">
            <div
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
              style={{ background: 'rgba(255,122,24,0.16)', border: '1px solid rgba(255,122,24,0.32)' }}
            >
              <CheckCircle2 className="h-6 w-6 text-[var(--cetso-orange)]" />
            </div>
            <div>
              <div className="text-xl font-black text-white">Your vote is already submitted.</div>
              <div className="mt-1 text-sm font-medium text-[var(--cetso-text-2)]">
                You can download your official receipt anytime.
              </div>
              <div className="mt-3 inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-[var(--cetso-text-2)]">Verification:</span>
                <span className="font-black text-white">{existingSubmission.receipt.verificationCode}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button variant="primary" size="lg" onClick={() => navigate('/student/receipt')}>Go to Receipt</Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/student/dashboard')}>Back to Dashboard</Button>
          </div>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-28 lg:pb-0">

      {/* Notice banner */}
      <div
        className="flex items-start gap-3 rounded-[28px] p-4"
        style={{
          background: 'rgba(255,122,24,0.08)',
          border: '1px solid rgba(255,122,24,0.24)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl"
          style={{ background: 'rgba(255,122,24,0.14)', border: '1px solid rgba(255,122,24,0.28)' }}
        >
          <LockKeyhole className="h-4 w-4 text-[var(--cetso-orange)]" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[rgba(255,178,74,0.85)]">Important Notice</div>
          <div className="mt-0.5 text-sm font-bold text-white">
            25% contribution per academic program applies.
          </div>
          <div className="mt-0.5 text-xs font-medium text-[var(--cetso-text-2)]">
            Eligible positions for {ctx.programCode} • Year {ctx.yearLevel} only.
          </div>
        </div>
      </div>

      {/* Progress tracker */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]">Progress</div>
            <div
              style={{
                fontFamily: 'var(--font-h1)',
                fontSize: 'clamp(26px, 3.5vw, 38px)',
                lineHeight: 0.95,
                letterSpacing: '0.01em',
                color: 'var(--cetso-text)',
                marginTop: 6,
              }}
            >
              {selectedCount} / {eligiblePositions.length}
            </div>
            <div className="mt-0.5 text-xs font-medium text-[var(--cetso-text-2)]">positions selected</div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={activeIdx === 0}
              onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={activeIdx >= eligiblePositions.length - 1}
              onClick={() => setActiveIdx((i) => Math.min(eligiblePositions.length - 1, i + 1))}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #ff7a18, #ffb24a)', boxShadow: '0 0 12px rgba(255,122,24,0.50)' }}
            initial={{ width: '0%' }}
            animate={{ width: eligiblePositions.length ? `${(selectedCount / eligiblePositions.length) * 100}%` : '0%' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        {/* Position dots */}
        <div className="mt-4 flex flex-wrap gap-2">
          {eligiblePositions.map((p, idx) => {
            const selected = Boolean(selectionsByPosition[p.positionCode])
            const active = idx === activeIdx
            return (
              <button
                key={p.positionCode}
                type="button"
                onClick={() => setActiveIdx(idx)}
                title={p.title}
                className="group relative flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-all duration-150"
                style={active ? {
                  background: 'rgba(255,122,24,0.18)',
                  border: '1px solid rgba(255,122,24,0.40)',
                  color: 'white',
                } : selected ? {
                  background: 'rgba(34,197,94,0.10)',
                  border: '1px solid rgba(34,197,94,0.25)',
                  color: 'rgba(134,239,172,0.85)',
                } : {
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--cetso-text-3)',
                }}
              >
                {selected ? <CheckCircle2 className="h-3 w-3" /> : <span className="h-2 w-2 rounded-full" style={{ background: 'currentColor' }} />}
                {idx + 1}
              </button>
            )
          })}
        </div>
      </GlassCard>

      {/* Current position */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPosition?.positionCode}
          initial={{ opacity: 0, x: 20, filter: 'blur(6px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: -20, filter: 'blur(6px)' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="rounded-[32px] p-5"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.50)',
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]">
                Current Position
              </div>
              <div className="mt-1.5 text-2xl font-black text-white">{currentPosition?.title}</div>
              <div className="mt-0.5 text-xs font-medium text-[var(--cetso-text-2)]">Select one candidate below.</div>
            </div>
            <div
              className="shrink-0 rounded-xl px-3 py-1.5 text-[11px] font-bold text-[rgba(255,178,74,0.90)]"
              style={{ background: 'rgba(255,122,24,0.10)', border: '1px solid rgba(255,122,24,0.22)' }}
            >
              {ELECTION.electionYear}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {candidates.map((c, i) => {
              const selected = selectionsByPosition[currentPosition?.positionCode ?? ''] === c.candidateId
              const inits = c.fullName.split(' ').slice(0, 2).map((p) => p[0]).join('')
              const [bg, border, textColor] = AVATAR_COLORS[i % AVATAR_COLORS.length]

              return (
                <motion.button
                  key={c.candidateId}
                  type="button"
                  onClick={() => onSelectCandidate(c)}
                  whileTap={{ scale: 0.98 }}
                  className="relative rounded-[24px] p-4 text-left transition-all duration-200"
                  style={selected ? {
                    background: 'rgba(255,122,24,0.12)',
                    border: '1.5px solid rgba(255,122,24,0.55)',
                    boxShadow: '0 0 0 1px rgba(255,122,24,0.20), 0 4px 32px rgba(255,122,24,0.18)',
                  } : {
                    background: 'rgba(0,0,0,0.22)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: 'none',
                  }}
                  aria-pressed={selected}
                >
                  {selected ? (
                    <div
                      className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full"
                      style={{ background: 'rgba(255,122,24,0.20)', border: '1px solid rgba(255,122,24,0.45)' }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-[var(--cetso-orange)]" />
                    </div>
                  ) : null}

                  <div className="flex items-start gap-3">
                    <div
                      className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
                      style={{ background: bg, border: `1.5px solid ${border}` }}
                    >
                      <span className="text-base font-black" style={{ color: textColor }}>{inits}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-black text-white">{c.fullName}</div>
                      <div
                        className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{
                          background: 'rgba(255,178,74,0.08)',
                          border: '1px solid rgba(255,178,74,0.20)',
                          color: 'rgba(255,178,74,0.85)',
                        }}
                      >
                        {c.partylist}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs font-semibold italic text-[var(--cetso-text-2)] leading-relaxed line-clamp-2">
                    "{c.tagline}"
                  </div>
                  <div className="mt-2 text-xs font-medium text-[var(--cetso-text-3)] leading-relaxed line-clamp-2">
                    {c.bio}
                  </div>

                  {selected ? (
                    <div
                      className="mt-3 inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-bold"
                      style={{ background: 'rgba(255,122,24,0.14)', border: '1px solid rgba(255,122,24,0.32)', color: 'rgba(255,178,74,0.95)' }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Selected
                    </div>
                  ) : null}
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Mobile sticky submit */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[rgba(255,255,255,0.06)] p-4 lg:hidden"
        style={{ background: 'rgba(7,7,12,0.85)', backdropFilter: 'blur(28px)' }}
      >
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!isComplete || submitting}
          onClick={() => {
            setSubmitting(true)
            window.setTimeout(() => { setSubmitting(false); goConfirm() }, 400)
          }}
        >
          <Vote className="h-4 w-4" />
          {isComplete ? 'Review & Submit Vote' : `Select all ${eligiblePositions.length} positions`}
        </Button>
        <div className="mt-2 text-center text-[11px] font-medium text-[var(--cetso-text-3)]">
          {selectedCount} of {eligiblePositions.length} selected • You can only submit once.
        </div>
      </div>

      {/* Desktop submit */}
      <div className="hidden lg:block">
        <Button
          variant="primary"
          size="lg"
          disabled={!isComplete || submitting}
          onClick={() => {
            setSubmitting(true)
            window.setTimeout(() => { setSubmitting(false); goConfirm() }, 400)
          }}
        >
          <Vote className="h-4 w-4" />
          {isComplete ? 'Review & Submit Vote' : `Complete all ${eligiblePositions.length} selections`}
        </Button>
      </div>
    </div>
  )
}
