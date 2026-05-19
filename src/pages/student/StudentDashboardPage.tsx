import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, FileText, LockKeyhole, Vote, CheckCircle2, Clock, User, ShieldAlert, Activity, Bell, Terminal, ChevronRight, Users } from 'lucide-react'
import Button from '../../components/ui/Button'
import GlassCard from '../../components/ui/GlassCard'
import { getStudentContext } from '../../lib/studentContext'
import { getVoteSubmission } from '../../lib/voteRecords'
import type { VoteSubmission } from '../../lib/voteRecords'
import Modal from '../../components/ui/Modal'
import { subscribeToElectionConfig, type ElectionConfig } from '../../lib/electionConfig'

export default function StudentDashboardPage() {
  const navigate = useNavigate()
  const ctx = getStudentContext()
  const [receipt, setReceipt] = useState<VoteSubmission | null>(null)
  const [time, setTime] = useState(() => new Date())
  const [electionConfig, setElectionConfig] = useState<ElectionConfig | null>(null)
  const [configLoading, setConfigLoading] = useState(true)
  const [configError, setConfigError] = useState('')
  const [showEndedModal, setShowEndedModal] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeToElectionConfig((config) => {
      setElectionConfig(config)
      setConfigError('')
      setConfigLoading(false)
    }, (error) => {
      setConfigError(error.message)
      setConfigLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const isVotingOpen = useMemo(() => {
    if (!electionConfig) return false
    
    const nowMs = time.getTime()
    const startDate = new Date(electionConfig.startDate).getTime()
    const endDate = new Date(electionConfig.endDate).getTime()
    
    return electionConfig.enabled && Number.isFinite(startDate) && Number.isFinite(endDate) && nowMs >= startDate && nowMs < endDate
  }, [electionConfig, time])

  const submitted = Boolean(receipt)

  const lockoutMessage = useMemo(() => {
    if (configError || !electionConfig) {
      return {
        title: 'BALLOT SYSTEM LOCKED',
        description: 'The voting status could not be verified. Please try again or contact an administrator.',
      }
    }

    const startDate = new Date(electionConfig.startDate).getTime()
    const endDate = new Date(electionConfig.endDate).getTime()

    if (!Number.isFinite(startDate) || !Number.isFinite(endDate)) {
      return {
        title: 'BALLOT SYSTEM LOCKED',
        description: 'The voting schedule could not be verified. Please try again or contact an administrator.',
      }
    }

    if (!electionConfig.enabled) {
      return {
        title: 'VOTING IS CURRENTLY CLOSED',
        description: 'The administrator has manually closed the voting window. Any unsubmitted ballots are locked until voting is opened again.',
      }
    }

    if (time.getTime() < startDate) {
      return {
        title: 'VOTING HAS NOT STARTED YET',
        description: 'The voting window is scheduled to open later. Please return when the official start time has arrived.',
      }
    }

    return {
      title: 'VOTING HAS OFFICIALLY ENDED',
      description: 'The scheduled election time has elapsed. Any unsubmitted ballots have been locked.',
    }
  }, [configError, electionConfig, time])

  useEffect(() => {
    if (!configLoading && electionConfig && !isVotingOpen && !submitted) {
      setShowEndedModal(true)
    }
  }, [configLoading, isVotingOpen, submitted, electionConfig])


  useEffect(() => {
    let active = true
    if (!ctx?.studentId) {
      setReceipt(null)
      return
    }
    getVoteSubmission(ctx.studentId).then((submission) => {
      if (active) setReceipt(submission)
    })
    return () => { active = false }
  }, [ctx?.studentId])



  if (!ctx) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <GlassCard className="max-w-md w-full p-8 text-center group">
           <div className="absolute top-0 right-0 p-4 opacity-5">
            <ShieldAlert className="h-16 w-16 text-[var(--cetso-orange)]" />
          </div>
          <div
            className="mx-auto grid h-16 w-16 place-items-center rounded-2xl"
            style={{ background: 'rgba(255,122,24,0.1)', border: '1.5px solid rgba(255,122,24,0.3)' }}
          >
            <LockKeyhole className="h-8 w-8 text-[var(--cetso-orange)]" />
          </div>
          <div className="mt-6 text-2xl font-black text-[var(--cetso-text)] italic uppercase tracking-tighter">Access Required</div>
          <div className="mt-2 text-sm font-medium text-[var(--cetso-text-2)]">
            Please log in with your student credentials to continue.
          </div>
          <Button variant="primary" size="lg" className="mt-8 w-full" onClick={() => navigate('/login')}>
            <Terminal className="h-4 w-4" /> Log In
          </Button>
        </GlassCard>
      </div>
    )
  }

  const initials = ctx.studentName.split(' ').slice(0, 2).map((p: string) => p[0]).join('').toUpperCase()

  const quickActions = [
    {
      icon: Vote,
      title: 'Your Vote',
      sub: submitted ? 'Vote Secured' : (configLoading ? 'Checking Status' : configError ? 'Status Error' : !isVotingOpen ? 'Voting Closed' : 'Action Required'),
      onClick: () => navigate('/student/vote'),
      highlight: !submitted && isVotingOpen,
      status: submitted ? 'complete' : (configLoading ? 'checking' : !isVotingOpen ? 'closed' : 'pending')
    },
    {
      icon: FileText,
      title: 'Candidates',
      sub: 'View candidate profiles',
      onClick: () => navigate('/student/candidates'),
      highlight: false,
    },
    {
      icon: User,
      title: 'My Profile',
      sub: 'View your account details',
      onClick: () => navigate('/student/profile'),
      highlight: false,
    },
    ...(submitted && receipt ? [{
      icon: Download,
      title: 'Vote Receipt',
      sub: `ID: ${receipt.receipt.verificationCode}`,
      onClick: () => navigate('/student/receipt'),
      highlight: true,
      status: 'verified'
    }] : []),
  ]

  return (
    <div className="space-y-4 pb-10 sm:space-y-6 sm:pb-12">
      {/* ─── Header Section ──────────────────────── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
        <div className="min-w-0">
           <div className="flex items-center gap-2 mb-2">
            <div className="h-1.5 w-6 rounded-full bg-[var(--cetso-orange)]" />
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--cetso-orange)]">
              Student Dashboard
            </div>
          </div>
          <h1 
            className="italic tracking-tighter uppercase break-words"
            style={{ fontFamily: 'var(--font-h1)', fontSize: 'clamp(28px, 8vw, 64px)', lineHeight: 0.9 }}
          >
            STUDENT <span className="text-[var(--cetso-text)] opacity-40">PORTAL</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="text-right">
            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--cetso-text-3)]">Current Time</div>
            <div className="text-sm font-black text-[var(--cetso-text)] italic">{time.toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* ─── Profile Overlay Card ────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl border border-[var(--cetso-card-border-default)] bg-[var(--cetso-card-bg-default)] p-4 shadow-[var(--cetso-card-shadow-default)] sm:rounded-[40px] sm:p-8"
        style={{ backdropFilter: 'blur(30px)' }}
      >
        {/* Animated Background Elements */}
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[var(--cetso-orange)]/5 blur-[100px]" />
        <div className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-blue-500/5 blur-[100px]" />
        
        {/* Tactical Overlay */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--cetso-border)] to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--cetso-border)] to-transparent" />

        <div className="relative flex flex-col items-stretch gap-6 lg:flex-row lg:items-center lg:gap-8">
          <div className="flex min-w-0 flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <div className="relative">
              <div
                className="grid h-20 w-20 place-items-center rounded-3xl text-2xl font-black rotate-3 transition-transform hover:rotate-6 sm:h-24 sm:w-24 sm:rounded-[32px] sm:text-3xl"
                style={{
                  background: 'rgba(255,122,24,0.08)',
                  border: '2px solid rgba(255,122,24,0.4)',
                  color: 'var(--cetso-orange)',
                  boxShadow: '0 0 40px rgba(255,122,24,0.15)',
                }}
              >
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-xl bg-[var(--cetso-card-bg)] border border-[var(--cetso-border)] flex items-center justify-center">
                 <Activity className="h-4 w-4 text-[var(--cetso-orange)]" />
              </div>
            </div>

            <div className="text-center sm:text-left">
              <h2 className="break-words text-2xl font-black italic uppercase tracking-tighter text-[var(--cetso-text)] sm:text-3xl">
                {ctx.studentName}
              </h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
                <span className="px-3 py-1 rounded-lg bg-[var(--cetso-card-bg-inset)] border border-[var(--cetso-border)] text-[10px] font-black uppercase tracking-widest text-[var(--cetso-text-2)]">
                  {ctx.studentId}
                </span>
                <span className="px-3 py-1 rounded-lg bg-[var(--cetso-orange)]/10 border border-[var(--cetso-orange)]/20 text-[10px] font-black uppercase tracking-widest text-[var(--cetso-orange)]">
                  {ctx.programCode}
                </span>
                <span className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  Year {ctx.yearLevel}
                </span>
              </div>
            </div>
          </div>

        </div>
      </motion.div>

      <div className="grid grid-cols-12 gap-6">
        {/* ─── Main Content Nodes ─────────────────── */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* Status Monitor Card */}
          <GlassCard className="group relative overflow-hidden p-4 sm:p-8">
             {/* Tactical Decoration */}
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Activity className="h-24 w-24 text-[var(--cetso-text)]" />
             </div>

             <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                   <h3 className="text-xl font-black text-[var(--cetso-text)] italic uppercase tracking-tight">Voting Status</h3>
                   <p className="text-xs font-medium text-[var(--cetso-text-3)]">Check if you have voted yet</p>
                </div>
                <div className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-3 py-2 sm:w-auto sm:gap-3 sm:px-4 ${
                  submitted 
                    ? 'bg-green-500/10 border-green-500/30 text-green-500 dark:text-green-400' 
                    : (!isVotingOpen 
                        ? 'bg-red-500/10 border-red-500/30 text-red-500 dark:text-red-400' 
                        : 'bg-orange-500/10 border-orange-500/30 text-[var(--cetso-orange)]')
                }`}>
                   {submitted ? <CheckCircle2 className="h-4 w-4" /> : (!isVotingOpen ? <LockKeyhole className="h-4 w-4" /> : <Clock className="h-4 w-4" />)}
                   <span className="text-center text-[10px] font-black uppercase tracking-[0.16em] sm:tracking-[0.2em]">{
                     submitted 
                       ? 'VOTED SUCCESSFULLY' 
                       : configLoading
                           ? 'CHECKING VOTING STATUS'
                           : configError
                           ? 'STATUS CHECK FAILED'
                           : (!isVotingOpen 
                           ? 'VOTING IS CLOSED' 
                           : 'VOTE PENDING')
                   }</span>
                </div>
             </div>

             <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 md:grid-cols-2 md:gap-4">
                <div className="group/item relative rounded-2xl border border-[var(--cetso-card-border-inset)] bg-[var(--cetso-card-bg-inset)] p-4 sm:rounded-3xl sm:p-5">
                   <div className="text-[10px] font-black uppercase tracking-widest text-[var(--cetso-text-3)] mb-2">Account Hash</div>
                   <div className="text-xs font-mono text-[var(--cetso-text-2)] truncate">0x{ctx.studentId}F92E10B3A4</div>
                </div>
                <div className="group/item relative rounded-2xl border border-[var(--cetso-card-border-inset)] bg-[var(--cetso-card-bg-inset)] p-4 sm:rounded-3xl sm:p-5">
                   <div className="text-[10px] font-black uppercase tracking-widest text-[var(--cetso-text-3)] mb-2">Vote Weight</div>
                   <div className="text-xs font-black text-[var(--cetso-orange)] italic uppercase">25% Program Share</div>
                </div>
             </div>

             {configError ? (
               <div className="mb-6 rounded-2xl border border-[var(--cetso-error-border)] bg-[var(--cetso-error-bg)] p-4 text-xs font-bold text-[var(--cetso-error-text)]">
                 Could not fetch live voting status: {configError}
               </div>
             ) : null}

             <div className="flex flex-row gap-3 sm:gap-4">
                {!submitted ? (
                  <Button 
                    variant={isVotingOpen ? "primary" : "secondary"}
                    size="lg" 
                    className="flex-1 group/btn" 
                    onClick={() => navigate('/student/vote')}
                  >
                    <Vote className="h-5 w-5 group-hover/btn:rotate-12 transition-transform" /> 
                    <span className="italic tracking-tighter">{isVotingOpen ? 'START VOTING' : 'VIEW BALLOT STATUS'}</span>
                  </Button>
                ) : (
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="flex-1 group/btn" 
                    onClick={() => navigate('/student/receipt')}
                  >
                    <Download className="h-5 w-5 group-hover/btn:-translate-y-1 transition-transform" /> 
                    <span className="italic tracking-tighter">VIEW RECEIPT</span>
                  </Button>
                )}
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="flex-1" 
                  onClick={() => navigate('/student/candidates')}
                >
                  <Users className="h-5 w-5" />
                  <span className="italic tracking-tighter">VIEW CANDIDATES</span>
                </Button>
             </div>
          </GlassCard>

          {/* Announcements Ticker */}
          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                   <Bell className="h-4 w-4 text-[var(--cetso-orange)]" />
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--cetso-text-3)]">Announcements</h4>
                </div>
                <button className="text-[9px] font-black uppercase tracking-widest text-[var(--cetso-orange)] hover:underline">Clear</button>
             </div>
             
             <div className="space-y-3">
                {[
                  { time: '10:42 AM', type: 'System', msg: 'Voting system is running smoothly.' },
                  { time: '09:15 AM', type: 'Election', msg: 'Live counting begins in 72 hours.' },
                ].map((log, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="group flex flex-col gap-2 rounded-2xl border border-[var(--cetso-card-border-inset)] bg-[var(--cetso-card-bg-inset)] p-4 transition-colors hover:bg-[var(--cetso-card-bg-default)] sm:flex-row sm:items-center sm:gap-4 sm:rounded-3xl"
                  >
                    <div className="flex items-center gap-3 sm:contents">
                    <div className="shrink-0 text-[9px] font-mono text-[var(--cetso-text-3)]">{log.time}</div>
                    <div className="h-1 w-1 rounded-full bg-[var(--cetso-orange)]/40" />
                    <div className="w-16 text-[9px] font-black uppercase text-[var(--cetso-orange)]/60">{log.type}</div>
                    </div>
                    <div className="text-xs font-medium text-[var(--cetso-text-2)]">{log.msg}</div>
                  </motion.div>
                ))}
             </div>
          </div>
        </div>

        {/* ─── Sidebar Nodes ─────────────────────── */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Quick Access Nodes */}
          <div className="space-y-4">
             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--cetso-text-3)] px-2">Quick Links</div>
             <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {quickActions.map((action, i) => {
                  const Icon = action.icon
                  return (
                    <motion.button
                      key={action.title}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      onClick={action.onClick}
                      className={`group relative flex items-center gap-3 overflow-hidden rounded-3xl p-3 text-left transition-all hover:scale-[1.02] active:scale-[0.98] sm:gap-4 sm:p-4 sm:rounded-[28px] border ${
                        action.highlight 
                          ? 'bg-[var(--cetso-orange)]/10 border-[var(--cetso-orange)]/30' 
                          : 'bg-[var(--cetso-card-bg-inset)] border-[var(--cetso-card-border-inset)] hover:bg-[var(--cetso-card-bg-default)]'
                      }`}
                    >
                      {/* Selection Glow */}
                      {action.highlight && (
                        <div className="absolute -right-4 -bottom-4 h-16 w-16 bg-[var(--cetso-orange)]/20 blur-xl" />
                      )}

                      <div 
                        className={`grid h-12 w-12 place-items-center rounded-2xl shrink-0 transition-transform group-hover:rotate-6 border ${
                          action.highlight 
                            ? 'bg-[var(--cetso-orange)]/20 border-[var(--cetso-orange)]/40 text-[var(--cetso-orange)]' 
                            : 'bg-[var(--cetso-card-bg-default)] border-[var(--cetso-card-border-default)] text-[var(--cetso-text-2)]'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-black text-[var(--cetso-text)] italic uppercase tracking-tighter group-hover:text-[var(--cetso-orange)] transition-colors">
                          {action.title}
                        </div>
                        <div className="text-[10px] font-medium text-[var(--cetso-text-3)] truncate uppercase tracking-widest mt-0.5">
                          {action.sub}
                        </div>
                      </div>
                      
                      <ChevronRight className="h-4 w-4 text-[var(--cetso-text-3)] group-hover:text-[var(--cetso-orange)] group-hover:translate-x-1 transition-all" />
                    </motion.button>
                  )
                })}
             </div>
          </div>

          {/* Voting Rules Summary */}
          <GlassCard variant="orange" className="p-6 relative overflow-hidden group">
             <Terminal className="absolute -right-4 -bottom-4 h-24 w-24 text-[var(--cetso-text)]/5 -rotate-12" />
             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--cetso-orange)] mb-4">Voting Rules</div>
             <h4 className="mb-3 text-base font-black uppercase italic leading-tight text-[var(--cetso-text)] sm:text-lg sm:leading-none">Weighting Distribution</h4>
             <div className="space-y-3">
                {['BSIT', 'BLIS', 'BSCpE', 'BSECE'].map((prog) => (
                  <div key={prog} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                       <span className="text-[var(--cetso-text-3)]">{prog}</span>
                       <span className="text-[var(--cetso-orange)]">25%</span>
                    </div>
                    <div className="h-1 w-full bg-[var(--cetso-border)] rounded-full overflow-hidden">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '25%' }}
                          transition={{ duration: 1, delay: 0.8 }}
                          className="h-full bg-[var(--cetso-orange)]"
                       />
                    </div>
                  </div>
                ))}
             </div>
             <p className="mt-6 text-[10px] font-medium text-[var(--cetso-text-3)] leading-relaxed italic">
               *All programs have an equal 25% share in the final result.
             </p>
          </GlassCard>
        </div>
       </div>
      
      {/* Election Ended Transition Modal */}
      <Modal 
        isOpen={showEndedModal} 
        onClose={() => setShowEndedModal(false)} 
        title="BALLOT LOCKOUT DETECTED" 
        maxWidth="max-w-md"
        showClose={true}
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

          <div className="rounded-2xl border border-[var(--cetso-card-border-inset)] bg-[var(--cetso-card-bg-inset)] p-4 space-y-2 text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[var(--cetso-text-3)] uppercase">STATUS</span>
              <span className="font-black text-red-500 uppercase tracking-wider">LOCKED OUT</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[var(--cetso-text-3)] uppercase">VOTER HASH</span>
              <span className="font-mono text-[var(--cetso-text-2)]">0x{ctx?.studentId}</span>
            </div>
          </div>

          <Button 
            variant="primary" 
            size="lg" 
            className="w-full bg-red-600 hover:bg-red-700 border-red-500 text-white" 
            onClick={() => setShowEndedModal(false)}
          >
            Acknowledge & Exit
          </Button>
        </div>
      </Modal>
    </div>
  )
}
