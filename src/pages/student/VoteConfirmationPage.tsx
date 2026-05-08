import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, ShieldCheck, Vote, Loader2, ChevronRight, Fingerprint, Terminal, Activity, ArrowLeft } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import Button from '../../components/ui/Button'
import GlassCard from '../../components/ui/GlassCard'
import { getStudentContext } from '../../lib/studentContext'
import { submitMockVote } from '../../mocks/mockVotes'
import type { VoteSelection } from '../../mocks/mockVotes'
import { POSITIONS, getCandidatesForPosition } from '../../mocks/mockElection'
import type { Position, Candidate } from '../../mocks/mockElection'
import { goeyToast } from 'goey-toast'

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

const getOrdinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
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

  const lineup = useMemo(() => {
    if (!selections) return []
    const posByCode = new Map(POSITIONS.map((p) => [p.positionCode, p]))
    return selections
      .map((s) => {
        const position = posByCode.get(s.positionCode)
        if (!position) return null
        const candidates = getCandidatesForPosition(s.positionCode)
        const candidate = candidates.find((c) => c.candidateId === s.candidateId)
        return { position, candidate: candidate ?? null, selection: s }
      })
      .filter((x): x is { position: Position; candidate: Candidate | null; selection: VoteSelection } => x !== null)
  }, [selections])

  if (!ctx) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <GlassCard className="max-w-md w-full p-8 text-center border-orange-500/20">
          <div className="text-4xl font-black italic uppercase tracking-tighter text-white">ACCESS<br /><span className="text-orange-500">DENIED</span></div>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.3em] text-white/40">Authentication required for ballot review.</p>
          <Button variant="primary" size="lg" className="mt-8 w-full shadow-orange-500/20" onClick={() => navigate('/login')}>RE-AUTHENTICATE</Button>
        </GlassCard>
      </div>
    )
  }

  if (!selections || selections.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <GlassCard className="max-w-md w-full p-8 text-center border-orange-500/20">
          <div className="text-4xl font-black italic uppercase tracking-tighter text-white">EMPTY<br /><span className="text-orange-500">BALLOT</span></div>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.3em] text-white/40">No draft data found in active session.</p>
          <Button variant="primary" size="lg" className="mt-8 w-full shadow-orange-500/20" onClick={() => navigate('/student/vote')}>INITIALIZE VOTING</Button>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      
      {/* ── Leaderboard Header ────────────────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative pt-10 text-center"
      >
        {/* Top bar like the image */}
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-white/30 px-4 mb-6">
          <div className="flex items-center gap-3">
            <Activity className="h-3 w-3 text-orange-500" />
            VOTER_ID: {ctx.studentId}
          </div>
          <div className="h-10 w-10 relative">
             <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full" />
             <ShieldCheck className="h-full w-full text-orange-500 relative z-10" />
          </div>
          <div>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</div>
        </div>

        <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter text-white leading-none mb-2 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
          LEADERBOARD
        </h1>
        <div className="text-xs font-black uppercase tracking-[0.5em] text-orange-500/80 mb-10 italic">
          1ST TO {getOrdinal(lineup.length).toUpperCase()} POSITION
        </div>

        {/* Separator Line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* ── SELECTION LIST (Left - The main "Leaderboard") ───────────── */}
        <div className="lg:col-span-8 space-y-px">
          {lineup.map((item, i) => (
            <motion.div
              key={item.position.positionCode}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative flex items-center gap-6 py-6 border-b border-white/5 hover:bg-white/[0.02] transition-colors"
            >
              {/* Rank column */}
              <div className="w-20 md:w-28 shrink-0">
                <div className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white/40 group-hover:text-orange-500 transition-colors">
                  {getOrdinal(i + 1).toUpperCase()}
                </div>
              </div>

              {/* Center Info - Name */}
              <div className="flex-1">
                <div className="text-lg md:text-2xl font-black italic uppercase tracking-tight text-white group-hover:translate-x-2 transition-transform duration-300">
                  {item.candidate?.fullName ?? 'NO SELECTION'}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mt-1">
                  {item.candidate?.partylist ?? '—'}
                </div>
              </div>

              {/* Right Value - Position */}
              <div className="text-right hidden md:block">
                 <div className="text-sm font-black italic uppercase tracking-widest text-orange-500/40">
                    {item.position.title}
                 </div>
              </div>

              {/* Mobile position indicator */}
              <div className="md:hidden">
                 <ChevronRight className="h-5 w-5 text-white/10" />
              </div>
            </motion.div>
          ))}

          {/* Bottom stats like the image */}
          <div className="pt-10 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-white/10">
             <div className="flex items-center gap-2">
                <Terminal className="h-3 w-3" />
                BALLOT_HASH: {ctx.studentId.split('').reverse().join('')}
             </div>
             <div className="flex items-center gap-2 italic">
                {lineup.length} NODES VERIFIED {">>"}
             </div>
          </div>
        </div>

        {/* ── SUBMIT PANEL (Right) ───────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-6">
           <GlassCard className="p-8 border-orange-500/20 sticky top-24 overflow-hidden group">
              {/* Decorative scanline */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:100%_4px]" />
              </div>

              <div className="relative z-10 space-y-8">
                 <div>
                    <div className="flex items-center gap-3 mb-3">
                       <Fingerprint className="h-5 w-5 text-orange-500" />
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Security Clearance</span>
                    </div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">FINALIZE<br /><span className="text-orange-500">BALLOT</span></h2>
                 </div>

                 <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-3">
                    <div className="flex items-center gap-2">
                       <AlertTriangle className="h-4 w-4 text-red-500" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Warning: Protocol Level 0</span>
                    </div>
                    <p className="text-[10px] font-medium leading-relaxed text-white/40 uppercase tracking-widest">
                       Submitting this ballot is an irreversible action. Ensure all selections are finalized according to your tactical preference.
                    </p>
                 </div>

                 <div className="space-y-3">
                    <Dialog.Root open={open} onOpenChange={setOpen}>
                       <Dialog.Trigger asChild>
                          <Button 
                             variant="primary" 
                             size="lg" 
                             className="w-full h-16 shadow-orange-500/20 text-lg italic tracking-tighter uppercase"
                             disabled={submitting}
                             onClick={() => setError(null)}
                          >
                             <Vote className="h-6 w-6 mr-2" />
                             Deploy Ballot
                          </Button>
                       </Dialog.Trigger>
                       <Dialog.Portal>
                          <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl" />
                          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-[500px] z-[110] bg-[#07070c] border border-white/10 p-8 rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden">
                             {/* Modal Scanline */}
                             <div className="absolute inset-0 pointer-events-none opacity-5">
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:100%_4px]" />
                             </div>

                             <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                   <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/20 grid place-items-center">
                                      <AlertTriangle className="h-8 w-8 text-red-500" />
                                   </div>
                                   <div>
                                      <Dialog.Title className="text-2xl font-black italic uppercase tracking-tighter text-white">CRITICAL CONFIRMATION</Dialog.Title>
                                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/60 mt-1">Irreversible Data Transmission</div>
                                   </div>
                                </div>

                                <p className="text-sm font-medium leading-relaxed text-white/60 uppercase tracking-widest mb-8">
                                   You are about to submit your official vote for <span className="text-white font-black">CETSO ELECTIONS 2026</span>. This action cannot be revoked or modified.
                                </p>

                                {error && (
                                   <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs font-black text-red-500 uppercase tracking-widest text-center">
                                      {error}
                                   </div>
                                )}

                                <div className="flex gap-4">
                                   <Dialog.Close asChild>
                                      <Button variant="secondary" className="flex-1 h-14 uppercase italic tracking-tighter bg-white/5 border-white/10" disabled={submitting}>Abort</Button>
                                   </Dialog.Close>
                                   <Button 
                                      variant="primary" 
                                      className="flex-[2] h-14 uppercase italic tracking-tighter shadow-orange-500/20"
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
                                            setError('IDENTITY CONFLICT: DATA ALREADY RECORDED.')
                                            setTimeout(() => navigate('/student/receipt'), 1500)
                                            return
                                         }
                                         localStorage.removeItem(DRAFT_KEY)
                                         goeyToast.success('Ballot Deployment Successful.')
                                         setTimeout(() => {
                                            setSubmitting(false)
                                            setOpen(false)
                                            navigate('/student/receipt')
                                         }, 800)
                                      }}
                                   >
                                      {submitting ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Authorize Submission'}
                                   </Button>
                                </div>
                             </div>
                          </Dialog.Content>
                       </Dialog.Portal>
                    </Dialog.Root>

                    <Button 
                       variant="ghost" 
                       size="lg" 
                       className="w-full h-14 text-white/30 hover:text-white uppercase italic tracking-tighter"
                       onClick={() => navigate('/student/vote')}
                    >
                       <ArrowLeft className="h-5 w-5 mr-2" />
                       Modify selections
                    </Button>
                 </div>
              </div>
           </GlassCard>

           <div className="px-6 py-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 group">
              <ShieldCheck className="h-5 w-5 text-white/20 group-hover:text-orange-500 transition-colors" />
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                 Nexus Secure Layer 7.4.1 Active
              </div>
           </div>
        </div>

      </div>
    </div>
  )
}
