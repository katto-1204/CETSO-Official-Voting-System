import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, FileText, LockKeyhole, Vote, CheckCircle2, Clock, User, ShieldAlert, Activity, Bell, Terminal, ChevronRight, Users } from 'lucide-react'
import Button from '../../components/ui/Button'
import GlassCard from '../../components/ui/GlassCard'
import { getMockVoteSubmission, isVoteAlreadySubmitted } from '../../mocks/mockVotes'
import { getStudentContext } from '../../lib/studentContext'

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
          <div className="mt-6 text-2xl font-black text-white italic uppercase tracking-tighter">Access Required</div>
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
      sub: submitted ? 'Vote Secured' : 'Action Required',
      onClick: () => navigate('/student/vote'),
      highlight: !submitted,
      status: submitted ? 'complete' : 'pending'
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
    <div className="space-y-6 pb-12">
      {/* ─── Header Section ──────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
            <div className="h-1.5 w-6 rounded-full bg-[var(--cetso-orange)]" />
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--cetso-orange)]">
              Student Dashboard
            </div>
          </div>
          <h1 
            className="italic tracking-tighter uppercase"
            style={{ fontFamily: 'var(--font-h1)', fontSize: 'clamp(40px, 6vw, 64px)', lineHeight: 0.8 }}
          >
            STUDENT <span className="text-white/40">PORTAL</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/30">Current Time</div>
            <div className="text-sm font-black text-white italic">{new Date().toLocaleTimeString()}</div>
          </div>
          <div className="h-10 w-[1px] bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 px-4">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">System: Online</span>
          </div>
        </div>
      </div>

      {/* ─── Profile Overlay Card ────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-[40px] p-8 border border-white/5 shadow-2xl"
        style={{ background: 'rgba(20,20,25,0.4)', backdropFilter: 'blur(30px)' }}
      >
        {/* Animated Background Elements */}
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[var(--cetso-orange)]/5 blur-[100px]" />
        <div className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-blue-500/5 blur-[100px]" />
        
        {/* Tactical Overlay */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div
                className="grid h-24 w-24 place-items-center rounded-[32px] text-3xl font-black rotate-3 transition-transform hover:rotate-6"
                style={{
                  background: 'rgba(255,122,24,0.08)',
                  border: '2px solid rgba(255,122,24,0.4)',
                  color: 'var(--cetso-orange)',
                  boxShadow: '0 0 40px rgba(255,122,24,0.15)',
                }}
              >
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-xl bg-[rgb(15,15,20)] border border-white/10 flex items-center justify-center">
                 <Activity className="h-4 w-4 text-[var(--cetso-orange)]" />
              </div>
            </div>

            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
                {ctx.studentName}
              </h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
                <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/50">
                  {ctx.studentId}
                </span>
                <span className="px-3 py-1 rounded-lg bg-[var(--cetso-orange)]/10 border border-[var(--cetso-orange)]/20 text-[10px] font-black uppercase tracking-widest text-[var(--cetso-orange)]">
                  {ctx.programCode}
                </span>
                <span className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-400">
                  Year {ctx.yearLevel}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-auto grid grid-cols-2 gap-4">
             <div className="p-4 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center">
                <div className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Status</div>
                <div className="text-sm font-black text-white uppercase italic">Active</div>
             </div>
             <div className="p-4 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center">
                <div className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Session</div>
                <div className="text-sm font-black text-green-500 uppercase italic">Active</div>
             </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-12 gap-6">
        {/* ─── Main Content Nodes ─────────────────── */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* Status Monitor Card */}
          <GlassCard className="p-8 relative group overflow-hidden">
             {/* Tactical Decoration */}
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Activity className="h-24 w-24 text-white" />
             </div>

             <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Voting Status</h3>
                   <p className="text-xs font-medium text-white/40">Check if you have voted yet</p>
                </div>
                <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border ${submitted ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'}`}>
                   {submitted ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                   <span className="text-[10px] font-black uppercase tracking-[0.2em]">{submitted ? 'VOTED SUCCESSFULLY' : 'VOTE PENDING'}</span>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="p-5 rounded-3xl bg-black/40 border border-white/5 relative group/item">
                   <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Account Hash</div>
                   <div className="text-xs font-mono text-white/60 truncate">0x{ctx.studentId}F92E10B3A4</div>
                </div>
                <div className="p-5 rounded-3xl bg-black/40 border border-white/5 relative group/item">
                   <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Vote Weight</div>
                   <div className="text-xs font-black text-[var(--cetso-orange)] italic uppercase">25% Program Share</div>
                </div>
             </div>

             <div className="flex flex-col sm:flex-row gap-4">
                {!submitted ? (
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="flex-1 group/btn" 
                    onClick={() => navigate('/student/vote')}
                  >
                    <Vote className="h-5 w-5 group-hover/btn:rotate-12 transition-transform" /> 
                    <span className="italic tracking-tighter">START VOTING</span>
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
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Announcements</h4>
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
                    className="flex items-center gap-4 p-4 rounded-3xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.05] transition-colors"
                  >
                    <div className="text-[9px] font-mono text-white/20 shrink-0">{log.time}</div>
                    <div className="h-1 w-1 rounded-full bg-[var(--cetso-orange)]/40" />
                    <div className="text-[9px] font-black uppercase text-[var(--cetso-orange)]/60 w-16">{log.type}</div>
                    <div className="text-xs font-medium text-white/60">{log.msg}</div>
                  </motion.div>
                ))}
             </div>
          </div>
        </div>

        {/* ─── Sidebar Nodes ─────────────────────── */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Quick Access Nodes */}
          <div className="space-y-4">
             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 px-2">Quick Links</div>
             <div className="grid grid-cols-1 gap-3">
                {quickActions.map((action, i) => {
                  const Icon = action.icon
                  return (
                    <motion.button
                      key={action.title}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      onClick={action.onClick}
                      className="group relative flex items-center gap-4 p-4 rounded-[28px] text-left transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                      style={{
                        background: action.highlight ? 'rgba(255,122,24,0.08)' : 'rgba(255,255,255,0.03)',
                        border: action.highlight ? '1.5px solid rgba(255,122,24,0.3)' : '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {/* Selection Glow */}
                      {action.highlight && (
                        <div className="absolute -right-4 -bottom-4 h-16 w-16 bg-[var(--cetso-orange)]/20 blur-xl" />
                      )}

                      <div 
                        className="grid h-12 w-12 place-items-center rounded-2xl shrink-0 transition-transform group-hover:rotate-6"
                        style={{
                          background: action.highlight ? 'rgba(255,122,24,0.15)' : 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: action.highlight ? 'var(--cetso-orange)' : 'white/40'
                        }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-black text-white italic uppercase tracking-tighter group-hover:text-[var(--cetso-orange)] transition-colors">
                          {action.title}
                        </div>
                        <div className="text-[10px] font-medium text-white/40 truncate uppercase tracking-widest mt-0.5">
                          {action.sub}
                        </div>
                      </div>
                      
                      <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-[var(--cetso-orange)] group-hover:translate-x-1 transition-all" />
                    </motion.button>
                  )
                })}
             </div>
          </div>

          {/* Voting Rules Summary */}
          <GlassCard variant="orange" className="p-6 relative overflow-hidden group">
             <Terminal className="absolute -right-4 -bottom-4 h-24 w-24 text-white/[0.03] -rotate-12" />
             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--cetso-orange)] mb-4">Voting Rules</div>
             <h4 className="text-lg font-black text-white uppercase italic leading-none mb-3">Weighting Distribution</h4>
             <div className="space-y-3">
                {['BSIT', 'BLIS', 'BSCpE', 'BSECE'].map((prog) => (
                  <div key={prog} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                       <span className="text-white/60">{prog}</span>
                       <span className="text-[var(--cetso-orange)]">25%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
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
             <p className="mt-6 text-[10px] font-medium text-white/40 leading-relaxed italic">
               *All programs have an equal 25% share in the final result.
             </p>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
