import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle2, ChevronRight, ShieldCheck } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import Button from '../../components/ui/Button'
import GlassCard from '../../components/ui/GlassCard'
import { getStudentContext } from '../../lib/studentContext'
import { submitMockVote } from '../../mocks/mockVotes'
import type { VoteSelection } from '../../mocks/mockVotes'
import { POSITIONS } from '../../mocks/mockElection'
import type { Position } from '../../mocks/mockElection'

const DRAFT_KEY = 'cetso_vote_draft'

function loadDraft(studentId: string) {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { studentId: string; selections: VoteSelection[] }
    if (parsed.studentId !== studentId) return null
    return parsed.selections
  } catch { return null }
}

export default function VoteConfirmationPage() {
  const navigate = useNavigate()
  const ctx = getStudentContext()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selections = useMemo(() => {
    if (!ctx) return null
    return loadDraft(ctx.studentId)
  }, [ctx])

  const selectedPositions = useMemo(() => {
    if (!selections) return []
    const posByCode = new Map(POSITIONS.map((p) => [p.positionCode, p]))
    return selections
      .map((s) => posByCode.get(s.positionCode))
      .filter((p): p is Position => Boolean(p))
  }, [selections])

  if (!ctx) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <div className="text-xl font-black text-white">Login required</div>
          <div className="mt-2 text-sm font-medium text-[var(--cetso-text-2)]">Please login as a CET student.</div>
          <Button variant="primary" size="lg" className="mt-6 w-full" onClick={() => navigate('/login')}>Go to Login</Button>
        </GlassCard>
      </div>
    )
  }

  if (!selections || selections.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <div className="text-xl font-black text-white">No draft vote found.</div>
          <div className="mt-2 text-sm font-medium text-[var(--cetso-text-2)]">Please start voting again.</div>
          <Button variant="primary" size="lg" className="mt-6 w-full" onClick={() => navigate('/student/vote')}>Back to Voting</Button>
        </GlassCard>
      </div>
    )
  }

  const initials = ctx.studentName.split(' ').slice(0, 2).map((p: string) => p[0]).join('').toUpperCase()

  return (
    <div className="space-y-5">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[32px] p-5"
        style={{
          background: 'rgba(255,122,24,0.07)',
          border: '1px solid rgba(255,122,24,0.25)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
            style={{ background: 'rgba(255,122,24,0.16)', border: '1px solid rgba(255,122,24,0.35)' }}
          >
            <ShieldCheck className="h-6 w-6 text-[var(--cetso-orange)]" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[rgba(255,178,74,0.85)]">Secure Confirmation</div>
            <div className="mt-1 text-xl font-black text-white">Review your selections.</div>
            <div className="mt-0.5 text-sm font-medium text-[var(--cetso-text-2)]">
              Candidate names are omitted from the receipt for privacy and legitimacy.
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">

        {/* Student info + positions */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="lg:col-span-8 space-y-4"
        >
          {/* Student details */}
          <GlassCard className="p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)] mb-3">Voter</div>
            <div className="flex items-center gap-4">
              <div
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-sm font-black"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,122,24,0.20), rgba(255,178,74,0.12))',
                  border: '1px solid rgba(255,122,24,0.35)',
                  color: 'var(--cetso-orange)',
                }}
              >
                {initials}
              </div>
              <div>
                <div className="text-base font-black text-white">{ctx.studentName}</div>
                <div className="mt-0.5 text-xs font-semibold text-[var(--cetso-text-2)]">
                  {ctx.studentId} • {ctx.programCode} • Year {ctx.yearLevel}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Selected positions */}
          <GlassCard className="p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)] mb-3">
              Positions Voted ({selectedPositions.length})
            </div>
            <div className="space-y-2">
              {selectedPositions.map((p, i) => (
                <motion.div
                  key={p.positionCode}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.04 }}
                  className="flex items-center gap-3 rounded-xl p-3"
                  style={{ background: 'rgba(0,0,0,0.20)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-full"
                    style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.30)' }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-[rgba(134,239,172,0.90)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-white">{p.title}</div>
                    <div className="text-[10px] font-medium text-[var(--cetso-text-3)]">{p.positionCode}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--cetso-text-3)] shrink-0" />
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Submit panel */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.10 }}
          className="lg:col-span-4"
        >
          <GlassCard className="p-5 h-full">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]">Final Action</div>
            <div className="mt-1.5 text-xl font-black text-white">Submit your vote</div>

            <div
              className="mt-4 rounded-2xl p-4"
              style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)' }}
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 text-[rgba(252,165,165,0.80)] mt-0.5" />
                <div className="text-xs font-medium text-[rgba(252,165,165,0.80)] leading-relaxed">
                  This action is final. You cannot vote again for CETSO Elections 2026.
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <Dialog.Root open={open} onOpenChange={setOpen}>
                <Dialog.Trigger asChild>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={submitting}
                    onClick={() => setError(null)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Confirm & Submit
                  </Button>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay
                    className="fixed inset-0"
                    style={{ background: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(8px)' }}
                  />
                  <Dialog.Content
                    className="fixed left-1/2 top-1/2 w-[92vw] max-w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] p-6"
                    style={{
                      background: 'rgba(10,10,18,0.96)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      backdropFilter: 'blur(24px)',
                      boxShadow: '0 40px 100px rgba(0,0,0,0.80)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl"
                        style={{ background: 'rgba(239,68,68,0.14)', border: '1px solid rgba(239,68,68,0.30)' }}
                      >
                        <AlertTriangle className="h-5 w-5 text-[rgba(252,165,165,0.90)]" />
                      </div>
                      <div>
                        <Dialog.Title className="text-xl font-black text-white">Final Warning</Dialog.Title>
                        <Dialog.Description className="mt-1 text-sm font-medium text-[var(--cetso-text-2)]">
                          This action is <span className="font-bold text-white">permanent</span>. You cannot vote again for CETSO Elections 2026.
                        </Dialog.Description>
                      </div>
                    </div>

                    <AnimatePresence>
                      {error ? (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="mt-4 rounded-2xl p-3"
                          style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.30)' }}
                        >
                          <p className="text-xs font-semibold text-[rgba(252,165,165,0.90)]">{error}</p>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>

                    <div className="mt-6 flex gap-3">
                      <Dialog.Close asChild>
                        <Button variant="secondary" size="lg" className="flex-1" disabled={submitting}>Cancel</Button>
                      </Dialog.Close>
                      <Button
                        variant="primary"
                        size="lg"
                        className="flex-1"
                        disabled={submitting}
                        onClick={() => {
                          setSubmitting(true)
                          setError(null)
                          const res = submitMockVote({
                            studentName: ctx.studentName,
                            studentId: ctx.studentId,
                            programCode: ctx.programCode,
                            yearLevel: ctx.yearLevel,
                            selections: selections!,
                          })
                          if (!res.ok) {
                            setSubmitting(false)
                            setError('Vote already submitted. Redirecting to your receipt…')
                            window.setTimeout(() => navigate('/student/receipt'), 900)
                            return
                          }
                          localStorage.removeItem(DRAFT_KEY)
                          window.setTimeout(() => {
                            setSubmitting(false)
                            setOpen(false)
                            navigate('/student/receipt')
                          }, 600)
                        }}
                      >
                        {submitting ? 'Submitting…' : 'Submit Vote'}
                      </Button>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>

              <Button variant="ghost" size="lg" className="w-full" onClick={() => navigate('/student/vote')}>
                ← Back to Voting
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
