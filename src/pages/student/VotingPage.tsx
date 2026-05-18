import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ChevronLeft, ChevronRight, LockKeyhole, Vote, Info, ShieldCheck, AlertCircle, User, CircleSlash, RotateCcw } from 'lucide-react'
import Button from '../../components/ui/Button'
import GlassCard from '../../components/ui/GlassCard'
import Modal from '../../components/ui/Modal'
import { getStudentContext } from '../../lib/studentContext'
import { supabase } from '../../lib/supabase'
import { POSITIONS, getPositionSelectionLimit } from '../../lib/electionData'
import { buildVoteSubmission, getVoteSubmission, hasVoteSubmission } from '../../lib/voteRecords'
import type { VoteSelection } from '../../lib/voteRecords'
import type { Candidate, Position } from '../../lib/electionData'
import { ELECTION, mergeCandidatesWithOfficialSeed } from '../../lib/electionData'
import { goeyToast } from 'goey-toast'
import { useCandidates } from '../../lib/queries'
import { useTransaction } from '../../lib/TransactionContext'
import { fetchElectionConfig, subscribeToElectionConfig, type ElectionConfig } from '../../lib/electionConfig'

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

export default function VotingPage() {
  const navigate = useNavigate()
  const ctx = getStudentContext()
  const { runTransaction } = useTransaction()
  const [time, setTime] = useState(() => new Date())
  const [dbConfig, setDbConfig] = useState<ElectionConfig | null>(null)
  const [configLoading, setConfigLoading] = useState(true)
  const [configError, setConfigError] = useState('')
  const [showEndedModal, setShowEndedModal] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeToElectionConfig((config) => {
      setDbConfig(config)
      setConfigError('')
      setConfigLoading(false)
    }, (error) => {
      setConfigError(error.message)
      setConfigLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const electionConfig = useMemo(() => {
    if (!dbConfig) return null
    
    const startDate = new Date(dbConfig.startDate).getTime()
    const endDate = new Date(dbConfig.endDate).getTime()
    
    return { enabled: dbConfig.enabled, startDate, endDate, validDates: Number.isFinite(startDate) && Number.isFinite(endDate) }
  }, [dbConfig, time])

  const isVotingClosed = useMemo(() => {
    if (!electionConfig || !electionConfig.validDates) return true
    const nowMs = time.getTime()
    return !electionConfig.enabled || nowMs < electionConfig.startDate || nowMs >= electionConfig.endDate
  }, [electionConfig, time])

  const lockoutMessage = useMemo(() => {
    if (!electionConfig || !electionConfig.validDates) {
      return {
        reason: 'VOTING STATUS UNAVAILABLE',
        title: 'BALLOT SYSTEM LOCKED',
        description: 'The voting status could not be verified. Please try again or contact an administrator.',
      }
    }

    if (!electionConfig.enabled) {
      return {
        reason: 'ELECTION SUSPENDED BY ADMINISTRATOR',
        title: 'VOTING IS CURRENTLY CLOSED',
        description: 'The administrator has manually closed the voting window. Any unsaved selections or unsubmitted ballots are locked until voting is opened again.',
      }
    }

    if (time.getTime() < electionConfig.startDate) {
      return {
        reason: 'ELECTION HAS NOT STARTED YET',
        title: 'VOTING HAS NOT STARTED YET',
        description: 'The voting window is scheduled to open later. Please return when the official start time has arrived.',
      }
    }

    return {
      reason: 'ELECTION HAS ENDED',
      title: 'VOTING HAS OFFICIALLY ENDED',
      description: 'The scheduled election time has elapsed. Any unsaved selections or unsubmitted ballots have been locked.',
    }
  }, [electionConfig, time])

  const [lastElectionState, setLastElectionState] = useState<boolean | null>(null)

  useEffect(() => {
    if (configLoading) return
    const currentOpenState = !isVotingClosed
    if (lastElectionState && !currentOpenState) {
      setShowEndedModal(true)
      setShowConfirm(false)
      setShowIntro(false)
    }
    setLastElectionState(currentOpenState)
  }, [configLoading, isVotingClosed, lastElectionState])

  async function refreshElectionStatus() {
    setConfigLoading(true)
    try {
      const config = await fetchElectionConfig()
      setDbConfig(config)
      setConfigError('')
    } catch (error: any) {
      setConfigError(error.message || 'Could not fetch voting status.')
    } finally {
      setConfigLoading(false)
    }
  }


  const eligiblePositions: Position[] = useMemo(() => {
    if (!ctx) return []
    return POSITIONS
  }, [ctx])

  const [activeIdx, setActiveIdx] = useState(0)
  const [selectionsByPosition, setSelectionsByPosition] = useState<Record<string, string[]>>({})
  const [submitting, setSubmitting] = useState(false)
  const [showIntro, setShowIntro] = useState(true)
  const [showConfirm, setShowConfirm] = useState(false)
  const [existingSubmission, setExistingSubmission] = useState<any>(null)

  const alreadySubmitted = Boolean(existingSubmission)

  useEffect(() => {
    let active = true
    if (!ctx?.studentId) {
      setExistingSubmission(null)
      return
    }
    getVoteSubmission(ctx.studentId).then((submission) => {
      if (!active) return
      setExistingSubmission(submission)
    })
    return () => { active = false }
  }, [ctx?.studentId])

  useEffect(() => {
    if (!ctx?.studentId) return
    const draft = loadDraft(ctx.studentId)
    if (!draft) return
    const next: Record<string, string[]> = {}
    for (const s of draft.selections) {
      next[s.positionCode] = [...(next[s.positionCode] ?? []), s.candidateId]
    }
    setSelectionsByPosition(next)
    
    // If they have a draft, they probably already saw the intro
    if (draft.selections.length > 0) {
      setShowIntro(false)
    }
  }, [ctx?.studentId])

  useEffect(() => { setActiveIdx(0) }, [ctx?.studentId])

  const { data: dbCandidates } = useCandidates()
  const sourceCandidates = useMemo(
    () => mergeCandidatesWithOfficialSeed(dbCandidates),
    [dbCandidates]
  )

  const currentPosition = eligiblePositions[activeIdx]
  const candidates: Candidate[] = useMemo(() => {
    if (!currentPosition) return []
    const posCandidates = sourceCandidates.filter((c) => c.positionCode === currentPosition.positionCode)
    return [
      ...posCandidates,
      {
        candidateId: `ABSTAIN_${currentPosition.positionCode}`,
        positionCode: currentPosition.positionCode,
        fullName: 'Abstain',
        partylist: 'None',
        tagline: 'No candidate selected for this position',
        bio: 'Choose this if you prefer not to vote for any candidate in this position.',
        imageUrl: ''
      }
    ]
  }, [currentPosition, sourceCandidates])

  const isComplete = useMemo(() => {
    if (!eligiblePositions.length) return false
    return eligiblePositions.every((p) => {
      const sels = selectionsByPosition[p.positionCode] ?? []
      if (sels.includes(`ABSTAIN_${p.positionCode}`)) return true
      return sels.length === getPositionSelectionLimit(p)
    })
  }, [eligiblePositions, selectionsByPosition])

  const selectedCount = eligiblePositions.reduce((sum, p) => {
    const sels = selectionsByPosition[p.positionCode] ?? []
    if (sels.includes(`ABSTAIN_${p.positionCode}`)) {
      return sum + getPositionSelectionLimit(p)
    }
    return sum + Math.min(sels.length, getPositionSelectionLimit(p))
  }, 0)
  const requiredSelectionCount = eligiblePositions.reduce((sum, p) => sum + getPositionSelectionLimit(p), 0)
  const canClearBallot = selectedCount > 0 && !alreadySubmitted && !submitting

  function handleClearBallot() {
    if (!canClearBallot) return
    setSelectionsByPosition({})
    setActiveIdx(0)
    setShowConfirm(false)
    localStorage.removeItem(DRAFT_KEY)
    goeyToast.success('Ballot cleared. You can start selecting again.')
  }

  function onSelectCandidate(candidate: Candidate) {
    if (!currentPosition) return
    const posCode = currentPosition.positionCode
    const limit = getPositionSelectionLimit(currentPosition)
    const getUpdatedSelections = (current: string[]) => {
      const alreadySelected = current.includes(candidate.candidateId)
      const isAbstain = candidate.candidateId.startsWith('ABSTAIN_')

      if (alreadySelected) {
        return current.filter((id) => id !== candidate.candidateId)
      }

      if (isAbstain) {
        return [candidate.candidateId]
      }

      const currentWithoutAbstain = current.filter(id => !id.startsWith('ABSTAIN_'))
      if (limit === 1) {
        return [candidate.candidateId]
      }
      if (currentWithoutAbstain.length < limit) {
        return [...currentWithoutAbstain, candidate.candidateId]
      }
      return [...currentWithoutAbstain.slice(1), candidate.candidateId]
    }

    const currentSelections = selectionsByPosition[posCode] ?? []
    const wasAlreadySelected = currentSelections.includes(candidate.candidateId)
    const nextSelections = getUpdatedSelections(currentSelections)
    const shouldAutoAdvance =
      !wasAlreadySelected &&
      activeIdx < eligiblePositions.length - 1 &&
      (nextSelections.includes(`ABSTAIN_${posCode}`) || nextSelections.length >= limit)
    
    setSelectionsByPosition((prev) => {
      const current = prev[posCode] ?? []
      const updatedForPosition = getUpdatedSelections(current)
      
      const next = { ...prev, [posCode]: updatedForPosition }
      if (ctx) {
        const draftSelections: VoteSelection[] = eligiblePositions
          .flatMap((p) => (next[p.positionCode] ?? []).map((candidateId) => ({ positionCode: p.positionCode, candidateId })))
        saveDraft({ studentId: ctx.studentId, selections: draftSelections })
      }
      return next
    })

    goeyToast.success(`${limit === 1 ? 'Selected' : 'Updated'} ${candidate.fullName} for ${currentPosition.title}`)
    
    if (shouldAutoAdvance) {
      setTimeout(() => setActiveIdx(activeIdx + 1), 600)
    }
  }

  async function handleFinalSubmit() {
    if (!ctx || !isComplete) return
    setSubmitting(true)
    
    try {
      const latestConfig = await fetchElectionConfig()
      const latestStart = new Date(latestConfig.startDate).getTime()
      const latestEnd = new Date(latestConfig.endDate).getTime()
      const nowMs = Date.now()
      const latestClosed =
        !latestConfig.enabled ||
        !Number.isFinite(latestStart) ||
        !Number.isFinite(latestEnd) ||
        nowMs < latestStart ||
        nowMs >= latestEnd

      setDbConfig(latestConfig)
      if (latestClosed) {
        throw new Error('Voting is currently closed. Your ballot was not submitted.')
      }

      const selections: VoteSelection[] = eligiblePositions.flatMap((p) =>
        (selectionsByPosition[p.positionCode] ?? []).map((candidateId) => ({
          positionCode: p.positionCode,
          candidateId,
        }))
      )
      
      await runTransaction(async () => {
        if (await hasVoteSubmission(ctx.studentId)) {
          throw new Error('Your vote was already submitted.')
        }

        const submission = buildVoteSubmission({
          studentName: ctx.studentName,
          studentId: ctx.studentId,
          programCode: ctx.programCode,
          yearLevel: ctx.yearLevel,
          selections,
        })

        const { error: voteError } = await supabase.from('votes').insert({
          student_id: ctx.studentId,
          receipt_id: submission.receipt.verificationCode,
          program_code: ctx.programCode,
          selections,
        })

        if (voteError) {
          console.error('[votes] insert failed:', JSON.stringify(voteError))
          const msg =
            voteError.code === 'PGRST204'
              ? `Schema error: "${voteError.message}" — run supabase/fix-missing-selections-column.sql in the Supabase SQL Editor.`
              : voteError.code === '42501'
              ? 'Permission denied — run supabase/fix-live-database.sql in the Supabase SQL Editor.'
              : `Vote save failed [${voteError.code}]: ${voteError.message}`
          throw new Error(msg)
        }

        localStorage.removeItem(DRAFT_KEY)
      }, 'COMMITTING SECURE ENCRYPTED BALLOT TO LEDGER')

      goeyToast.success('Vote submitted successfully! Redirecting to receipt...')
      setTimeout(() => navigate('/student/receipt'), 1200)
    } catch (err: any) {
      goeyToast.error(err.message || 'A system error occurred.')
    } finally {
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

  if (configLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center py-10 px-4">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[var(--cetso-orange)]" />
          <div className="text-xl font-black text-white uppercase italic tracking-tighter">Checking Voting Status</div>
          <div className="mt-2 text-sm font-medium text-[var(--cetso-text-2)]">
            Reading the latest election status from Supabase.
          </div>
        </GlassCard>
      </div>
    )
  }

  if (configError || !electionConfig || !electionConfig.validDates) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center py-10 px-4">
        <GlassCard className="max-w-xl w-full p-8 text-center border-red-500/30">
          <AlertCircle className="mx-auto mb-5 h-10 w-10 text-red-500" />
          <div className="text-xl font-black text-white uppercase italic tracking-tighter">Voting Status Unavailable</div>
          <div className="mt-3 text-sm font-semibold leading-relaxed text-red-200">
            {configError || 'Election schedule dates are invalid. Ask an admin to save the voting schedule again.'}
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button variant="primary" size="lg" className="flex-1" onClick={refreshElectionStatus}>
              Retry Status Check
            </Button>
            <Button variant="secondary" size="lg" className="flex-1" onClick={() => navigate('/student/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </GlassCard>
      </div>
    )
  }

  if (isVotingClosed) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center py-10 px-4">
        <GlassCard className="max-w-xl w-full p-6 sm:p-10 text-center relative overflow-hidden group">
          {/* Holographic scanner effect */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent animate-pulse" />
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-red-500/5 blur-[120px] pointer-events-none" />
          
          <div
            className="mx-auto grid h-20 w-20 place-items-center rounded-3xl mb-6 relative"
            style={{ 
              background: 'rgba(239,68,68,0.08)', 
              border: '2px solid rgba(239,68,68,0.3)',
              boxShadow: '0 0 40px rgba(239,68,68,0.1)'
            }}
          >
            <LockKeyhole className="h-10 w-10 text-red-500 animate-pulse" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tighter">
            Ballot System Locked
          </h2>
          <p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-red-500/80 max-w-md mx-auto">
            {lockoutMessage.reason}
          </p>

          <div className="mt-8 border border-white/5 bg-black/40 rounded-2xl p-5 text-left space-y-4">
            <div className="flex justify-between items-center text-xs border-b border-white/5 pb-3">
              <span className="font-bold text-white/40 uppercase tracking-wider">Current Time</span>
              <span className="font-black text-white italic">{time.toLocaleTimeString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs border-b border-white/5 pb-3">
              <span className="font-bold text-white/40 uppercase tracking-wider">Start Time</span>
              <span className="font-black text-white">{new Date(electionConfig.startDate).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs pb-1">
              <span className="font-bold text-white/40 uppercase tracking-wider">End Time</span>
              <span className="font-black text-white">{new Date(electionConfig.endDate).toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button variant="secondary" size="lg" className="w-full" onClick={() => navigate('/student/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </GlassCard>

        {/* Election Ended Transition Modal (Shown on mount/refresh if closed) */}
        <Modal 
          isOpen={showEndedModal} 
          onClose={() => {
            setShowEndedModal(false)
            navigate('/student/dashboard')
          }} 
          title="BALLOT LOCKOUT DETECTED" 
          maxWidth="max-w-md"
          showClose={false}
        >
          <div className="space-y-6 text-center">
            <div
              className="mx-auto grid h-20 w-20 place-items-center rounded-3xl relative animate-bounce"
              style={{ 
                background: 'rgba(239,68,68,0.1)', 
                border: '2px solid rgba(239,68,68,0.4)',
                boxShadow: '0 0 40px rgba(239,68,68,0.2)'
              }}
            >
              <LockKeyhole className="h-10 w-10 text-red-500 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-red-500 uppercase tracking-tight italic">
                {lockoutMessage.title}
              </h3>
              <p className="text-sm font-semibold text-[var(--cetso-text-2)] leading-relaxed">
                {lockoutMessage.description}
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/5 p-4 space-y-2 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white/40 uppercase">STATUS</span>
                <span className="font-black text-red-500 uppercase tracking-wider">LOCKED OUT</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white/40 uppercase">VOTER HASH</span>
                <span className="font-mono text-white/60">0x{ctx?.studentId}</span>
              </div>
            </div>

            <Button 
              variant="primary" 
              size="lg" 
              className="w-full bg-red-600 hover:bg-red-700 border-red-500 text-white" 
              onClick={() => {
                setShowEndedModal(false)
                navigate('/student/dashboard')
              }}
            >
              Acknowledge & Exit
            </Button>
          </div>
        </Modal>
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

            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
              <div className="flex gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-orange-500/20 bg-orange-500/10">
                  <Vote className="h-5 w-5 text-[var(--cetso-orange)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-black uppercase tracking-tight text-white">Program Voting Weight</h4>
                  <p className="mt-1 text-xs font-semibold leading-relaxed text-orange-100/80">
                    Election results shall be based on a 25% voting weight per program, ensuring equal representation across all CET programs.
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {[
                      ['BSIT', '25%'],
                      ['BLIS', '25%'],
                      ['BSpE', '25%'],
                      ['BSECE', '25%'],
                    ].map(([program, weight]) => (
                      <div
                        key={program}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs"
                      >
                        <span className="font-black text-white">{program}</span>
                        <span className="font-black text-[var(--cetso-orange)]">{weight}</span>
                      </div>
                    ))}
                  </div>
                </div>
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
            <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">Your Selected Candidates</h4>
            <p className="mt-1 text-sm text-[var(--cetso-text-2)]">Review your selections before finalizing your ballot.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {eligiblePositions.map((p) => {
              const candIds = selectionsByPosition[p.positionCode] ?? []
            const candidates = candIds
              .map((candId) => sourceCandidates.find(c => c.candidateId === candId) || null)
                .filter((candidate): candidate is Candidate => Boolean(candidate))
              return (
                <div key={p.positionCode} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-white/[0.08]">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 border border-white/10">
                    <User className="h-5 w-5 text-white/40" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)] truncate">{p.title}</div>
                    <div className="text-sm font-black text-[var(--cetso-orange)] truncate">
                      {candidates.length ? candidates.map((candidate) => candidate.fullName).join(', ') : 'No selection'}
                    </div>
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
            <Button variant="danger" size="lg" className="flex-1" onClick={handleClearBallot} disabled={!canClearBallot}>
              <RotateCcw className="h-4 w-4" />
              Clear Ballot
            </Button>
            <Button variant="primary" size="lg" className="flex-1" onClick={handleFinalSubmit} loading={submitting}>
              Confirm & Submit
            </Button>
          </div>
        </div>
      </Modal>

      {/* Election Ended Transition Modal */}
      <Modal 
        isOpen={showEndedModal} 
        onClose={() => {
          setShowEndedModal(false)
          navigate('/student/dashboard')
        }} 
        title="BALLOT LOCKOUT DETECTED" 
        maxWidth="max-w-md"
        showClose={false}
      >
        <div className="space-y-6 text-center">
          <div
            className="mx-auto grid h-20 w-20 place-items-center rounded-3xl relative animate-bounce"
            style={{ 
              background: 'rgba(239,68,68,0.1)', 
              border: '2px solid rgba(239,68,68,0.4)',
              boxShadow: '0 0 40px rgba(239,68,68,0.2)'
            }}
          >
            <LockKeyhole className="h-10 w-10 text-red-500 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-red-500 uppercase tracking-tight italic">
              {lockoutMessage.title}
            </h3>
            <p className="text-sm font-semibold text-[var(--cetso-text-2)] leading-relaxed">
              {lockoutMessage.description}
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/5 p-4 space-y-2 text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white/40 uppercase">STATUS</span>
              <span className="font-black text-red-500 uppercase tracking-wider">LOCKED OUT</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white/40 uppercase">VOTER HASH</span>
              <span className="font-mono text-white/60">0x{ctx?.studentId}</span>
            </div>
          </div>

          <Button 
            variant="primary" 
            size="lg" 
            className="w-full bg-red-600 hover:bg-red-700 border-red-500 text-white" 
            onClick={() => {
              setShowEndedModal(false)
              navigate('/student/dashboard')
            }}
          >
            Acknowledge & Exit
          </Button>
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
                fontSize: 'clamp(22px, 3.5vw, 38px)',
                lineHeight: 0.95,
                letterSpacing: '0.01em',
                color: 'var(--cetso-text)',
                marginTop: 6,
              }}
            >
              {selectedCount}<span className="text-[var(--cetso-text-3)] text-[0.6em] mx-1">/</span>{requiredSelectionCount}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="danger"
              size="sm"
              disabled={!canClearBallot}
              onClick={handleClearBallot}
              className="bg-red-500/10"
            >
              <RotateCcw className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #ff7a18, #ffb24a)', boxShadow: '0 0 12px rgba(255,122,24,0.30)' }}
            initial={{ width: '0%' }}
            animate={{ width: requiredSelectionCount ? `${(selectedCount / requiredSelectionCount) * 100}%` : '0%' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        {/* Position dots */}
        <div className="mt-4 flex flex-wrap gap-2">
          {eligiblePositions.map((p, idx) => {
            const positionSelections = selectionsByPosition[p.positionCode] ?? []
            const selected =
              positionSelections.includes(`ABSTAIN_${p.positionCode}`) ||
              positionSelections.length === getPositionSelectionLimit(p)
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
                {/* Abstain Indicator */}
                {!active && !selected && (selectionsByPosition[p.positionCode] ?? []).includes(`ABSTAIN_${p.positionCode}`) && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-yellow-500 border-2 border-[rgb(10,10,15)]" />
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
                  Ballot Selection
                </div>
              </div>
              <div className="mt-2 text-3xl font-black text-white italic tracking-tighter uppercase">{currentPosition?.title}</div>
              <div className="mt-1 text-xs font-bold text-[var(--cetso-text-3)] uppercase tracking-wider">
                Select {currentPosition ? getPositionSelectionLimit(currentPosition) : 1} candidate{currentPosition && getPositionSelectionLimit(currentPosition) !== 1 ? 's' : ''}
              </div>
            </div>
            <div
              className="shrink-0 rounded-xl px-4 py-2 text-[12px] font-black text-white italic"
              style={{ background: 'rgba(255,122,24,0.15)', border: '1px solid rgba(255,122,24,0.30)' }}
            >
              {ELECTION.electionYear}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {candidates.map((c, i) => {
              const selected = (selectionsByPosition[currentPosition?.positionCode ?? ''] ?? []).includes(c.candidateId)
              const ZZZ_COLORS = [
                { bg: '#ff3131', accent: '#ff8a8a', text: 'text-white' },
                { bg: '#e032d9', accent: '#f07bf0', text: 'text-white' },
                { bg: '#00d2ff', accent: '#8ce6ff', text: 'text-black' },
                { bg: '#ffb800', accent: '#ffd252', text: 'text-black' },
                { bg: '#00ff66', accent: '#8affb8', text: 'text-black' },
              ]
              const isAbstain = c.candidateId.startsWith('ABSTAIN_')
              const theme = isAbstain
                ? { bg: '#ff7a18', accent: '#ffb24a', text: 'text-black' }
                : ZZZ_COLORS[i % ZZZ_COLORS.length]

              return (
                <div key={c.candidateId} className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.666rem)] lg:w-[calc(25%-0.75rem)] xl:w-[calc(20%-0.8rem)]">
                  <motion.button
                    type="button"
                    onClick={() => onSelectCandidate(c)}
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative w-full aspect-[3/4] outline-none"
                    aria-pressed={selected}
                  >
                    <div
                      className={`absolute inset-0 overflow-hidden transition-all duration-300 z-10 ${selected ? 'animate-pulse' : ''}`}
                      style={{ 
                        transform: 'skew(-8deg)',
                        background: theme.bg,
                        borderRadius: '1.5rem',
                        border: selected ? '3px solid white' : '1px solid rgba(255,255,255,0.1)',
                        boxShadow: selected ? `0 0 30px ${theme.accent}60` : '0 10px 30px rgba(0,0,0,0.5)'
                      }}
                    >
                      {/* Unskewed Content Wrapper */}
                      <div 
                        className="absolute inset-0 w-full h-full flex flex-col justify-end origin-center"
                        style={{ transform: 'skew(8deg) scale(1.15)' }}
                      >
                        {/* Character Image */}
                        {c.imageUrl ? (
                          <img 
                            src={c.imageUrl} 
                            alt={c.fullName} 
                            className="absolute inset-0 w-full h-full object-cover object-center filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)] transition-transform duration-700 group-hover:scale-110" 
                          />
                        ) : c.candidateId.startsWith('ABSTAIN_') ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 bg-black/40">
                            <CircleSlash className="w-24 h-24 mb-4 text-white" />
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center opacity-20">
                            <User className="w-32 h-32" />
                          </div>
                        )}

                        {/* Half-tone dot pattern overlay */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none" 
                             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }} />

                        {/* Top Right Position Badge */}
                        <div className="absolute top-6 right-8 z-20 flex items-center gap-1.5 bg-black/80 backdrop-blur-md rounded-md px-2.5 py-1 border border-white/10 shadow-lg" style={{ borderBottom: `2px solid ${theme.accent}` }}>
                          <span className="text-xs font-black italic uppercase" style={{ color: theme.accent }}>
                            {c.positionCode.slice(0, 1).toUpperCase()}
                          </span>
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest opacity-90">
                            {c.positionCode.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {/* Bottom Gradient for Text Legibility */}
                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                        {/* Info Container */}
                        <div className="relative z-10 px-8 pb-10 pt-4 w-full flex flex-col justify-end text-left pr-16 md:pr-20 md:pb-12">
                          <div className={`text-xl md:text-2xl font-black italic tracking-tighter uppercase drop-shadow-xl leading-tight text-white break-words`}>
                            {c.fullName.split(' ')[0]}
                            {c.fullName.split(' ').length > 1 && (
                              <span className="block text-sm md:text-base opacity-90 mt-1 break-words">
                                {c.fullName.substring(c.fullName.indexOf(' ') + 1)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 transition-opacity duration-300 pointer-events-none opacity-0 group-hover:opacity-100">
                          <div className="bg-black text-white px-5 py-2.5 rounded-full font-black text-sm tracking-widest border border-white/20 shadow-xl">
                            {selected ? '- DESELECT' : '+ SELECT'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Top Left Selected Checkmark (Unskewed) */}
                    <AnimatePresence>
                      {selected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.5, y: 10 }}
                          className="absolute -top-3 -left-3 h-10 w-10 bg-black rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center z-40"
                          style={{ border: `2px solid ${theme.accent}`, transform: 'rotate(-8deg)' }}
                        >
                          <CheckCircle2 className="h-5 w-5" style={{ color: theme.accent }} strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              )
            })}
          </div>

          <div className="relative mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="secondary"
              size="lg"
              disabled={activeIdx === 0}
              onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="secondary"
              size="lg"
              disabled={activeIdx >= eligiblePositions.length - 1}
              onClick={() => setActiveIdx((i) => Math.min(eligiblePositions.length - 1, i + 1))}
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Mobile sticky submit */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[rgba(255,255,255,0.06)] p-4 lg:hidden"
        style={{ background: 'rgba(7,7,12,0.85)', backdropFilter: 'blur(28px)' }}
      >
        <div className="flex gap-2">
          <Button
            variant="danger"
            size="lg"
            className="shrink-0 px-4"
            disabled={!canClearBallot}
            onClick={handleClearBallot}
            title="Clear ballot selections"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            disabled={!isComplete || submitting}
            onClick={() => setShowConfirm(true)}
          >
            <Vote className="h-4 w-4" />
            {isComplete ? 'Review Lineup' : `Select all ${requiredSelectionCount} choices`}
          </Button>
        </div>
        <div className="mt-2 text-center text-[11px] font-medium text-[var(--cetso-text-3)]">
          {selectedCount} of {requiredSelectionCount} selected • Ballot submission is final.
        </div>
      </div>

      {/* Desktop submit */}
      <div className="hidden lg:flex gap-3">
        <Button
          variant="danger"
          size="lg"
          className="w-full sm:w-auto"
          disabled={!canClearBallot}
          onClick={handleClearBallot}
        >
          <RotateCcw className="h-4 w-4" />
          Clear Ballot
        </Button>
        <Button
          variant="primary"
          size="lg"
          className="w-full sm:w-auto"
          disabled={!isComplete || submitting}
          onClick={() => setShowConfirm(true)}
        >
          <Vote className="h-4 w-4" />
          {isComplete ? 'Review & Submit Ballot' : `Complete all ${requiredSelectionCount} selections`}
        </Button>
      </div>
    </div>
  )
}
