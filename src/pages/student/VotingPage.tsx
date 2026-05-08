import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ChevronLeft, ChevronRight, LockKeyhole, Vote, Info, ShieldCheck, AlertCircle, User } from 'lucide-react'
import Button from '../../components/ui/Button'
import GlassCard from '../../components/ui/GlassCard'
import Modal from '../../components/ui/Modal'
import { getStudentContext } from '../../lib/studentContext'
import { getCandidatesForPosition, getEligiblePositions, getCandidateById } from '../../mocks/mockElection'
import { getMockVoteSubmission, isVoteAlreadySubmitted, submitMockVote } from '../../mocks/mockVotes'
import type { VoteSelection } from '../../mocks/mockVotes'
import type { Candidate, Position } from '../../mocks/mockElection'
import { ELECTION } from '../../mocks/mockElection'
import { goeyToast } from 'goey-toast'

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
  const [showIntro, setShowIntro] = useState(true)
  const [showConfirm, setShowConfirm] = useState(false)

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
    
    // If they have a draft, they probably already saw the intro
    if (draft.selections.length > 0) {
      setShowIntro(false)
    }
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
    
    // Toggle logic: if clicking same one, maybe deselect? User didn't specify, but usually you select.
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

    goeyToast.success(`Selected ${candidate.fullName} for ${currentPosition.title}`)
    
    // Auto-advance if not last
    if (activeIdx < eligiblePositions.length - 1) {
      setTimeout(() => setActiveIdx(activeIdx + 1), 600)
    }
  }

  async function handleFinalSubmit() {
    if (!ctx || !isComplete) return
    setSubmitting(true)
    
    try {
      const selections: VoteSelection[] = eligiblePositions.map((p) => ({
        positionCode: p.positionCode,
        candidateId: selectionsByPosition[p.positionCode],
      }))
      
      const res = submitMockVote({
        studentName: ctx.studentName,
        studentId: ctx.studentId,
        programCode: ctx.programCode,
        yearLevel: ctx.yearLevel,
        selections,
      })
      if (res.ok) {
        localStorage.removeItem(DRAFT_KEY)
        goeyToast.success('Vote submitted successfully! Redirecting to receipt...')
        setTimeout(() => navigate('/student/receipt'), 2000)
      } else {
        goeyToast.error(res.reason === 'already_submitted' ? 'Your vote was already submitted.' : 'Submission failed.')
        setSubmitting(false)
      }
    } catch {
      goeyToast.error('A system error occurred.')
      setSubmitting(false)
    }
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
      
      {/* Intro Modal */}
      <Modal isOpen={showIntro} onClose={() => setShowIntro(false)} title="Welcome to CETSO Portal" maxWidth="max-w-xl">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--cetso-orange)]/10 border border-[var(--cetso-orange)]/20">
                <Info className="h-5 w-5 text-[var(--cetso-orange)]" />
              </div>
              <div>
                <h4 className="font-black text-white uppercase text-sm tracking-tight">About CETSO</h4>
                <p className="mt-1 text-sm text-[var(--cetso-text-2)] leading-relaxed">
                  The College of Engineering and Technology Student Organization (CETSO) is the official student body representing all engineering and technology programs. This portal ensures a transparent and secure election process.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/10 border border-blue-500/20">
                <ShieldCheck className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h4 className="font-black text-white uppercase text-sm tracking-tight">Voting Rules</h4>
                <ul className="mt-2 space-y-1.5 text-xs text-[var(--cetso-text-2)] list-disc pl-4">
                  <li>You must be an officially enrolled CET student to vote.</li>
                  <li>Votes are immutable once submitted and confirmed.</li>
                  <li>One (1) vote per student only.</li>
                  <li>Tampering with the system is strictly prohibited.</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
              <AlertCircle className="h-5 w-5 text-[var(--cetso-orange)]" />
              <p className="text-xs font-bold text-orange-200 leading-relaxed">
                IMPORTANT: You must select a candidate for EVERY position to complete the ballot. Your draft is saved automatically.
              </p>
            </div>
          </div>
          
          <Button variant="primary" size="lg" className="w-full" onClick={() => setShowIntro(false)}>
            I Understand, Let's Start
          </Button>
        </div>
      </Modal>

      {/* Confirmation Modal (Lineup Style) */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Final Review" maxWidth="max-w-2xl">
        <div className="space-y-6">
          <div className="text-center">
            <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">Your Tactical Lineup</h4>
            <p className="mt-1 text-sm text-[var(--cetso-text-2)]">Review your selections before finalizing your ballot.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {eligiblePositions.map((p) => {
              const candId = selectionsByPosition[p.positionCode]
              const candidate = candId ? getCandidateById(candId) : null
              return (
                <div key={p.positionCode} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-white/[0.08]">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 border border-white/10">
                    <User className="h-5 w-5 text-white/40" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)] truncate">{p.title}</div>
                    <div className="text-sm font-black text-[var(--cetso-orange)] truncate">{candidate?.fullName || 'No selection'}</div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
            <p className="text-xs font-bold text-red-200">
              ACTION IS PERMANENT. SUBMITTING WILL LOCK YOUR VOTE.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="secondary" size="lg" className="flex-1" onClick={() => setShowConfirm(false)} disabled={submitting}>
              Edit Selections
            </Button>
            <Button variant="primary" size="lg" className="flex-1" onClick={handleFinalSubmit} loading={submitting}>
              Confirm & Submit
            </Button>
          </div>
        </div>
      </Modal>

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
          <div className="text-[10px] font-bold uppercase tracking-widest text-[rgba(255,178,74,0.85)]">System Status: Secure</div>
          <div className="mt-0.5 text-sm font-bold text-white">
            Encrypted Ballot Protocol Active
          </div>
          <div className="mt-0.5 text-xs font-medium text-[var(--cetso-text-2)]">
            {ctx.programCode} • {ctx.yearLevel}{ctx.yearLevel === 1 ? 'st' : ctx.yearLevel === 2 ? 'nd' : ctx.yearLevel === 3 ? 'rd' : 'th'} Year Voter
          </div>
        </div>
      </div>

      {/* Progress tracker */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]">Ballot Progress</div>
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
              {selectedCount}<span className="text-[var(--cetso-text-3)] text-[0.6em] mx-1">/</span>{eligiblePositions.length}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={activeIdx === 0}
              onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
              className="bg-white/5 hover:bg-white/10 border border-white/5"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={activeIdx >= eligiblePositions.length - 1}
              onClick={() => setActiveIdx((i) => Math.min(eligiblePositions.length - 1, i + 1))}
              className="bg-white/5 hover:bg-white/10 border border-white/5"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #ff7a18, #ffb24a)', boxShadow: '0 0 12px rgba(255,122,24,0.30)' }}
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
                className="group relative flex h-9 w-9 items-center justify-center rounded-xl text-[10px] font-black transition-all duration-150"
                style={active ? {
                  background: 'rgba(255,122,24,0.18)',
                  border: '1.5px solid rgba(255,122,24,0.60)',
                  color: 'white',
                  boxShadow: '0 0 15px rgba(255,122,24,0.25)',
                } : selected ? {
                  background: 'rgba(34,197,94,0.12)',
                  border: '1px solid rgba(34,197,94,0.40)',
                  color: 'rgba(134,239,172,1)',
                } : {
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--cetso-text-3)',
                }}
              >
                {idx + 1}
                {selected && !active && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-[rgb(10,10,15)]" />
                )}
              </button>
            )
          })}
        </div>
      </GlassCard>

      {/* Current position */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPosition?.positionCode}
          initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
          transition={{ duration: 0.4, ease: 'backOut' }}
          className="relative overflow-hidden rounded-[32px] p-6"
          style={{
            background: 'rgba(20,20,25,0.4)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.60)',
          }}
        >
          {/* Background Accent */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--cetso-orange)]/5 blur-[80px]" />

          <div className="relative flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-6 rounded-full bg-[var(--cetso-orange)]" />
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--cetso-orange)]">
                  Tactical Selection
                </div>
              </div>
              <div className="mt-2 text-3xl font-black text-white italic tracking-tighter uppercase">{currentPosition?.title}</div>
              <div className="mt-1 text-xs font-bold text-[var(--cetso-text-3)] uppercase tracking-wider">Candidate Authorization Required</div>
            </div>
            <div
              className="shrink-0 rounded-xl px-4 py-2 text-[12px] font-black text-white italic"
              style={{ background: 'rgba(255,122,24,0.15)', border: '1px solid rgba(255,122,24,0.30)' }}
            >
              {ELECTION.electionYear}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {candidates.map((c, i) => {
              const selected = selectionsByPosition[currentPosition?.positionCode ?? ''] === c.candidateId
              const [bg, border, textColor] = AVATAR_COLORS[i % AVATAR_COLORS.length]

              return (
                <motion.button
                  key={c.candidateId}
                  type="button"
                  onClick={() => onSelectCandidate(c)}
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden transition-all duration-300"
                  aria-pressed={selected}
                >
                  <div 
                    className="relative rounded-[24px] p-5 text-left h-full"
                    style={selected ? {
                      background: 'rgba(255,122,24,0.08)',
                      border: '2px solid rgba(255,122,24,0.8)',
                      boxShadow: '0 0 30px rgba(255,122,24,0.15)',
                    } : {
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {/* Tactical Corners */}
                    {selected && (
                      <>
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--cetso-orange)]" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--cetso-orange)]" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--cetso-orange)]" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--cetso-orange)]" />
                      </>
                    )}

                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div
                          className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl overflow-hidden"
                          style={{ background: bg, border: `2px solid ${selected ? border : 'rgba(255,255,255,0.1)'}` }}
                        >
                          <User className="h-8 w-8" style={{ color: selected ? textColor : 'rgba(255,255,255,0.2)' }} />
                        </div>
                        {selected && (
                          <div className="absolute -bottom-1 -right-1 bg-[var(--cetso-orange)] rounded-lg p-1 shadow-lg shadow-orange-500/40">
                            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className={`text-base font-black uppercase italic tracking-tight transition-colors ${selected ? 'text-white' : 'text-white/80'}`}>
                          {c.fullName}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-black text-white/60 uppercase">
                            {c.partylist}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--cetso-orange)]/30 rounded-full" />
                        <p className="pl-3 text-xs font-medium italic text-white/50 leading-relaxed line-clamp-2">
                          "{c.tagline}"
                        </p>
                      </div>
                      <p className="text-[11px] font-medium text-white/40 leading-relaxed line-clamp-3">
                        {c.bio}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${selected ? 'bg-[var(--cetso-orange)] animate-pulse' : 'bg-white/20'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Candidate Profile</span>
                      </div>
                      {selected && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--cetso-orange)]">Primary Target</span>
                      )}
                    </div>
                  </div>
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
          onClick={() => setShowConfirm(true)}
        >
          <Vote className="h-4 w-4" />
          {isComplete ? 'Review Lineup' : `Select all ${eligiblePositions.length} positions`}
        </Button>
        <div className="mt-2 text-center text-[11px] font-medium text-[var(--cetso-text-3)]">
          {selectedCount} of {eligiblePositions.length} selected • Ballot submission is final.
        </div>
      </div>

      {/* Desktop submit */}
      <div className="hidden lg:block">
        <Button
          variant="primary"
          size="lg"
          className="w-full sm:w-auto"
          disabled={!isComplete || submitting}
          onClick={() => setShowConfirm(true)}
        >
          <Vote className="h-4 w-4" />
          {isComplete ? 'Review & Submit Ballot' : `Complete all ${eligiblePositions.length} selections`}
        </Button>
      </div>
    </div>
  )
}
