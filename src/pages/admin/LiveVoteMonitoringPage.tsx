import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Activity, TrendingUp, Users, Zap } from 'lucide-react'
import { Bar, BarChart, Cell, Line, LineChart as ReLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import AdminLayout from '../../components/layout/AdminLayout'
import GlassCard from '../../components/ui/GlassCard'
import { MOCK_STUDENTS } from '../../mocks/mockStudents'
import { POSITIONS, PROGRAMS } from '../../mocks/mockElection'
import { getMockVoteSubmission, isVoteAlreadySubmitted } from '../../mocks/mockVotes'

const PROGRAM_COLORS = ['#ff7a18', '#a78bfa', '#2dd4bf', '#60a5fa']

const tooltipStyle = {
  backgroundColor: 'rgba(10,10,18,0.95)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 16,
  color: 'white',
  fontFamily: 'var(--font-ui)',
  fontSize: 12,
  boxShadow: '0 16px 48px rgba(0,0,0,0.60)',
}

export default function LiveVoteMonitoringPage() {
  const data = useMemo(() => {
    const submissions = MOCK_STUDENTS
      .map((s) => (isVoteAlreadySubmitted(s.studentId) ? getMockVoteSubmission(s.studentId) : null))
      .filter(Boolean)

    const totalVoters = MOCK_STUDENTS.length
    const votesSubmitted = submissions.length
    const participationRate = totalVoters ? (votesSubmitted / totalVoters) * 100 : 0

    const byProgram = PROGRAMS.map((p, i) => ({
      programCode: p,
      votes: submissions.filter((s) => s!.receipt.programCode === p).length,
      color: PROGRAM_COLORS[i % PROGRAM_COLORS.length],
    }))

    const timeline = [
      { t: '-60m', v: Math.max(0, votesSubmitted - 2) },
      { t: '-30m', v: Math.max(0, votesSubmitted - 1) },
      { t: 'Now', v: votesSubmitted },
    ]

    const byPosition = POSITIONS.map((pos) => {
      let count = 0
      for (const sub of submissions) {
        if (sub!.selections.some((sel) => sel.positionCode === pos.positionCode)) count++
      }
      return { position: pos.title, votes: count }
    }).sort((a, b) => b.votes - a.votes).slice(0, 8)

    return { submissions, totalVoters, votesSubmitted, participationRate, byProgram, timeline, byPosition }
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-5">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[32px] p-6"
          style={{
            background: 'rgba(255,122,24,0.07)',
            border: '1px solid rgba(255,122,24,0.24)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.50)',
          }}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className="grid h-12 w-12 place-items-center rounded-2xl"
                style={{ background: 'rgba(255,122,24,0.18)', border: '1px solid rgba(255,122,24,0.38)' }}
              >
                <Activity className="h-6 w-6 text-[var(--cetso-orange)]" />
              </div>
              <span
                className="absolute -right-1 -top-1 h-3 w-3 rounded-full live-dot"
                style={{ background: 'var(--cetso-orange)', border: '2px solid var(--cetso-bg)' }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full live-dot" style={{ background: 'var(--cetso-orange)' }} />
                <div className="text-[10px] font-bold uppercase tracking-widest text-[rgba(255,178,74,0.85)]">Live</div>
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-h1)',
                  fontSize: 'clamp(30px, 4vw, 44px)',
                  lineHeight: 0.93,
                  letterSpacing: '0.01em',
                  color: 'var(--cetso-text)',
                  marginTop: 4,
                }}
              >
                LIVE VOTE MONITORING
              </h1>
              <div className="mt-0.5 text-sm font-medium text-[var(--cetso-text-2)]">
                Real-time charts and live counters (MVP demo).
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold">
              <span className="text-[var(--cetso-text-2)]">Participation</span>
              <span className="font-bold text-white">{data.participationRate.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #ff7a18, #ffb24a)', boxShadow: '0 0 14px rgba(255,122,24,0.50)' }}
                initial={{ width: '0%' }}
                animate={{ width: `${data.participationRate}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: Users, label: 'Total Voters', value: data.totalVoters, sub: 'Registered CET students' },
            { icon: TrendingUp, label: 'Votes Submitted', value: data.votesSubmitted, sub: 'One vote per student' },
            { icon: Zap, label: 'Rule', value: '25%', sub: 'Per program weighting' },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.05 }}
              >
                <GlassCard className="p-5">
                  <div className="flex items-start justify-between">
                    <div
                      className="grid h-10 w-10 place-items-center rounded-2xl"
                      style={{ background: 'rgba(255,122,24,0.12)', border: '1px solid rgba(255,122,24,0.28)' }}
                    >
                      <Icon className="h-5 w-5 text-[var(--cetso-orange)]" />
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)] text-right">{item.label}</div>
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-h1)',
                      fontSize: 'clamp(28px, 3.5vw, 40px)',
                      lineHeight: 0.95,
                      letterSpacing: '0.01em',
                      color: 'var(--cetso-text)',
                      marginTop: 16,
                    }}
                  >
                    {item.value}
                  </div>
                  <div className="mt-1.5 text-xs font-medium text-[var(--cetso-text-2)]">{item.sub}</div>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.20 }} className="lg:col-span-7">
            <GlassCard className="p-5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)] mb-1">Votes Timeline (Demo)</div>
              <div className="text-xl font-black text-white mb-4">Activity over time</div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ReLine data={data.timeline}>
                    <XAxis dataKey="t" stroke="rgba(234,234,242,0.30)" tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="rgba(234,234,242,0.30)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'rgba(255,122,24,0.20)', strokeWidth: 1 }} />
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke="#ff7a18"
                      strokeWidth={2.5}
                      dot={{ r: 5, fill: '#ff7a18', strokeWidth: 2, stroke: 'rgba(255,122,24,0.30)' }}
                      activeDot={{ r: 7, fill: '#ffb24a' }}
                    />
                  </ReLine>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="lg:col-span-5">
            <GlassCard className="p-5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)] mb-1">By Program</div>
              <div className="text-xl font-black text-white mb-4">Votes distribution</div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.byProgram} margin={{ top: 6, right: 6, bottom: 6, left: -16 }}>
                    <XAxis dataKey="programCode" stroke="rgba(234,234,242,0.30)" tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="rgba(234,234,242,0.30)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                    <Bar dataKey="votes" radius={[10, 10, 0, 0]}>
                      {data.byProgram.map((entry, idx) => <Cell key={idx} fill={entry.color} fillOpacity={0.80} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Position grid */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.30 }}>
          <GlassCard className="p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)] mb-1">Position Analytics</div>
            <div className="text-xl font-black text-white mb-5">Top positions</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {data.byPosition.map((p, i) => (
                <motion.div
                  key={p.position}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.30 + i * 0.04 }}
                  className="rounded-2xl p-4"
                  style={{ background: 'rgba(0,0,0,0.22)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div
                    className="font-[var(--font-heading)] text-3xl tracking-wide"
                    style={{
                      background: 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.70))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {p.votes}
                  </div>
                  <div className="mt-1.5 text-xs font-semibold text-[var(--cetso-text-2)] line-clamp-2">{p.position}</div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AdminLayout>
  )
}
