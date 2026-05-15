import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Users, Activity, Zap, Terminal, ArrowUpRight, Cpu, Clock, Activity as ActivityIcon } from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import { MOCK_STUDENTS } from '../../mocks/mockStudents'
import { PROGRAMS, POSITIONS } from '../../mocks/mockElection'
import { getMockVoteSubmission, isVoteAlreadySubmitted } from '../../mocks/mockVotes'

function getSubmissions() {
  return MOCK_STUDENTS.map((s) => {
    if (!isVoteAlreadySubmitted(s.studentId)) return null
    return getMockVoteSubmission(s.studentId)
  }).filter(Boolean)
}

const PROGRAM_COLORS = ['#ff7a18', '#a78bfa', '#2dd4bf', '#60a5fa']

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  delay = 0,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub: string
  trend?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group"
    >
      <GlassCard className="p-6 relative overflow-hidden h-full">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
          <Icon className="h-16 w-16" />
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          <div
            className="grid h-10 w-10 place-items-center rounded-xl transition-transform group-hover:scale-110"
            style={{ background: 'rgba(255,122,24,0.1)', border: '1px solid rgba(255,122,24,0.2)' }}
          >
            <Icon className="h-5 w-5 text-[var(--cetso-orange)]" />
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--cetso-text-3)' }}>
            {label}
          </div>
        </div>

        <div className="flex items-end gap-3">
          <div
            className="italic tracking-tighter"
            style={{
              fontFamily: 'var(--font-h1)',
              fontSize: '44px',
              lineHeight: 0.8,
              color: 'var(--cetso-text)',
            }}
          >
            {value}
          </div>
          {trend && (
             <div className="flex items-center gap-1 text-green-500 text-[10px] font-black mb-1">
                <ArrowUpRight className="h-3 w-3" />
                {trend}
             </div>
          )}
        </div>
        
        <div className="mt-4 flex items-center gap-2">
           <div className="h-px flex-1 bg-current opacity-5" />
           <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>{sub}</div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

export default function AdminDashboardPage() {
  const stats = useMemo(() => {
    const totalVoters = MOCK_STUDENTS.length
    const submissions = getSubmissions()
    const votesSubmitted = submissions.length
    const participationRate = totalVoters ? (votesSubmitted / totalVoters) * 100 : 0

    const byProgram = PROGRAMS.map((p, i) => ({
      programCode: p,
      votes: submissions.filter((sub) => sub!.receipt.programCode === p).length,
      color: PROGRAM_COLORS[i % PROGRAM_COLORS.length],
    }))

    const byPosition = POSITIONS.reduce<Record<string, number>>((acc, pos) => {
      acc[pos.positionCode] = 0
      return acc
    }, {})
    for (const sub of submissions) {
      for (const sel of sub!.selections) {
        byPosition[sel.positionCode] = (byPosition[sel.positionCode] ?? 0) + 1
      }
    }

    const topPositions = Object.entries(byPosition)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([positionCode, count]) => ({
        positionCode,
        count,
        title: POSITIONS.find((p) => p.positionCode === positionCode)?.title ?? positionCode,
      }))

    return { totalVoters, votesSubmitted, participationRate, byProgram, topPositions }
  }, [])

  return (
    <div className="space-y-8">
      
      {/* Tactical Status Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Live Voting Status</span>
          </div>
          <h1
            className="italic uppercase tracking-tighter"
            style={{
              fontFamily: 'var(--font-h1)',
              fontSize: 'clamp(40px, 6vw, 64px)',
              lineHeight: 0.8,
              color: 'var(--cetso-text)',
            }}
          >
            ADMIN<br /><span style={{ color: 'var(--cetso-text-3)' }} className="group-hover:text-[var(--cetso-orange)] transition-colors">DASHBOARD</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
           <GlassCard className="px-5 py-3 flex items-center gap-4">
              <div className="text-right">
                 <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>System Time</div>
                 <div className="text-xs font-mono" style={{ color: 'var(--cetso-text-2)' }}>12:44:02 UTC</div>
              </div>
              <div className="h-8 w-px bg-current opacity-10" />
              <div className="text-right">
                 <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>Latency</div>
                 <div className="text-xs font-mono text-green-500">14ms</div>
              </div>
           </GlassCard>
           
           <Button variant="primary" size="lg" className="h-14 px-8 shadow-orange-500/20">
              <Activity className="h-5 w-5" />
              <span className="italic tracking-tighter uppercase">MANAGE ELECTION</span>
           </Button>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Stat Cards - Top Row */}
        <div className="xl:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={Users} label="Total Voters" value={stats.totalVoters} sub="Registered Students" trend="+12.4%" delay={0.1} />
          <StatCard icon={TrendingUp} label="Votes Cast" value={stats.votesSubmitted} sub="Votes Submitted" trend="+8.2%" delay={0.2} />
          <StatCard icon={ActivityIcon} label="Participation" value={`${stats.participationRate.toFixed(1)}%`} sub="Participation Rate" trend="+2.1%" delay={0.3} />
        </div>

        {/* Participation Visualization */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="xl:col-span-12"
        >
          <GlassCard className="p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Zap className="h-32 w-32" />
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
               <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-2">Live Progress</div>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--cetso-text)' }}>Overall Participation</h3>
               </div>
               <div className="flex gap-4">
                  <div className="text-right">
                     <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>Target</div>
                     <div className="text-xl font-black italic" style={{ color: 'var(--cetso-text-3)' }}>85.0%</div>
                  </div>
                  <div className="h-10 w-px bg-current opacity-10" />
                  <div className="text-right">
                     <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>Status</div>
                     <div className="text-xl font-black text-green-500 italic">GOOD</div>
                  </div>
               </div>
            </div>

            <div className="relative h-4 w-full bg-white/5 rounded-full overflow-hidden mb-4 border border-white/5">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-600 to-orange-400"
                style={{ boxShadow: '0 0 30px rgba(249,115,22,0.4)' }}
                initial={{ width: '0%' }}
                animate={{ width: `${stats.participationRate}%` }}
                transition={{ duration: 1.5, ease: 'circOut' }}
              />
              {/* Animated scanning highlight */}
              <motion.div 
                className="absolute inset-y-0 w-20 bg-white/20 skew-x-12 z-10"
                animate={{ x: ['-200%', '1500%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
            </div>
            
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>
               <span>0% Startup</span>
               <span>{stats.participationRate.toFixed(1)}% Current</span>
               <span>100% Completion</span>
            </div>
          </GlassCard>
        </motion.div>

        {/* Charts Row */}
        <div className="xl:col-span-7 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassCard className="p-8">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 flex items-center gap-2">
                    <BarChart3 className="h-3 w-3 text-orange-500" />
                    Program Breakdown
                  </div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Votes by Program</h3>
                </div>
                <div className="flex gap-2">
                   <Button variant="ghost" size="sm" className="bg-white/5 h-8 px-3 text-[9px] font-black uppercase tracking-widest">Day</Button>
                   <Button variant="ghost" size="sm" className="bg-orange-500/10 border-orange-500/20 text-orange-500 h-8 px-3 text-[9px] font-black uppercase tracking-widest">Total</Button>
                </div>
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.byProgram} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                    <defs>
                       {stats.byProgram.map((entry, idx) => (
                         <linearGradient key={`grad-${idx}`} id={`colorBar-${idx}`} x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor={entry.color} stopOpacity={0.8}/>
                           <stop offset="95%" stopColor={entry.color} stopOpacity={0.1}/>
                         </linearGradient>
                       ))}
                    </defs>
                    <XAxis
                      dataKey="programCode"
                      stroke="rgba(255,255,255,0.2)"
                      tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(255,255,255,0.4)' }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.2)"
                      tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(255,255,255,0.4)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(10,10,18,0.95)',
                        border: '1px solid rgba(255,255,255,0.10)',
                        borderRadius: 16,
                        color: 'white',
                        fontFamily: 'var(--font-h2)',
                        fontSize: 10,
                        boxShadow: '0 16px 48px rgba(0,0,0,0.60)',
                      }}
                      itemStyle={{ color: 'var(--cetso-orange)', fontWeight: 900, textTransform: 'uppercase' }}
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    />
                    <Bar dataKey="votes" radius={[8, 8, 0, 0]} barSize={40}>
                      {stats.byProgram.map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={`url(#colorBar-${idx})`}
                          stroke={entry.color}
                          strokeWidth={1}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Top Positions Leaderboard */}
        <div className="xl:col-span-5 space-y-6">
           <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="h-full"
          >
            <GlassCard className="p-8 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 flex items-center gap-2">
                       <Terminal className="h-3 w-3 text-orange-500" />
                       Live Updates
                    </div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Current Leaders</h3>
                 </div>
              </div>

              <div className="space-y-4 flex-1">
                 {stats.topPositions.map((p, i) => {
                    const maxCount = stats.topPositions[0]?.count || 1
                    const pct = (p.count / maxCount) * 100
                    return (
                       <div 
                        key={p.positionCode}
                        className="group/item rounded-2xl p-4 bg-white/5 border border-white/5 hover:border-orange-500/30 transition-all duration-300"
                       >
                          <div className="flex items-start justify-between mb-3">
                             <div className="flex items-center gap-3">
                                <div className="text-[10px] font-black text-orange-500/50 italic">0{i+1}</div>
                                <div>
                                   <div className="text-sm font-black uppercase italic tracking-tighter text-white group-hover/item:text-orange-500 transition-colors">{p.title}</div>
                                   <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">{p.positionCode}</div>
                                </div>
                             </div>
                             <div className="text-right">
                                <div className="text-xl font-black italic text-white leading-none">{p.count}</div>
                                <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">Votes</div>
                             </div>
                          </div>
                          
                          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                             <motion.div 
                                className="h-full bg-orange-500/40"
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 1, delay: 0.8 + i * 0.1 }}
                             />
                          </div>
                       </div>
                    )
                 })}
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-white/20">
                 <div className="flex items-center gap-1.5"><Cpu className="h-3 w-3" /> System Active</div>
                 <div className="flex items-center gap-1.5 text-green-500"><Clock className="h-3 w-3" /> Live Data</div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

      </div>
    </div>
  )
}
