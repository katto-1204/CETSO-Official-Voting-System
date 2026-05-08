import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, PieChart, TrendingUp, Users, Activity, Zap } from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import AdminLayout from '../../components/layout/AdminLayout'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import { MOCK_STUDENTS } from '../../mocks/mockStudents'
import { ELECTION, PROGRAMS, POSITIONS } from '../../mocks/mockElection'
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
  delay = 0,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <GlassCard className="p-5">
        <div className="flex items-start justify-between">
          <div
            className="grid h-10 w-10 place-items-center rounded-2xl"
            style={{ background: 'rgba(255,122,24,0.12)', border: '1px solid rgba(255,122,24,0.28)' }}
          >
            <Icon className="h-5 w-5 text-[var(--cetso-orange)]" />
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)] text-right">
            {label}
          </div>
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
          {value}
        </div>
        <div className="mt-1.5 text-xs font-medium text-[var(--cetso-text-2)]">{sub}</div>
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
      .slice(0, 6)
      .map(([positionCode, count]) => ({
        positionCode,
        count,
        title: POSITIONS.find((p) => p.positionCode === positionCode)?.title ?? positionCode,
      }))

    return { totalVoters, votesSubmitted, participationRate, byProgram, topPositions }
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-5">

        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-[32px] p-6"
          style={{
            background: 'rgba(255,122,24,0.07)',
            border: '1px solid rgba(255,122,24,0.24)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.50), 0 0 60px rgba(255,122,24,0.06)',
          }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 700px 350px at 0% 0%, rgba(255,122,24,0.20), transparent 65%)' }}
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full live-dot"
                  style={{ background: 'var(--cetso-orange)' }}
                />
                <div className="text-[10px] font-bold uppercase tracking-widest text-[rgba(255,178,74,0.85)]">
                  Live Election Status
                </div>
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-h1)',
                  fontSize: 'clamp(28px, 4vw, 44px)',
                  lineHeight: 0.93,
                  letterSpacing: '0.01em',
                  color: 'var(--cetso-text)',
                  marginTop: 8,
                }}
              >
                {ELECTION.name.toUpperCase()}
              </h1>
              <div className="mt-1.5 text-sm font-medium text-[var(--cetso-text-2)]">
                Voting is currently open (MVP demo). Connect Supabase for real-time sync.
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
              <Button variant="primary" size="md">
                <Activity className="h-4 w-4" />
                Start/Stop Voting
              </Button>
              <Button variant="secondary" size="md">
                <Zap className="h-4 w-4" />
                Export Results
              </Button>
            </div>
          </div>

          {/* Participation bar */}
          <div className="relative mt-5">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold">
              <span className="text-[var(--cetso-text-2)]">Overall Participation</span>
              <span className="font-bold text-white">{stats.participationRate.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #ff7a18, #ffb24a)', boxShadow: '0 0 14px rgba(255,122,24,0.50)' }}
                initial={{ width: '0%' }}
                animate={{ width: `${stats.participationRate}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={Users} label="Total Voters" value={stats.totalVoters} sub="Imported CET students" delay={0.05} />
          <StatCard icon={TrendingUp} label="Votes Submitted" value={stats.votesSubmitted} sub="One vote per student" delay={0.10} />
          <StatCard icon={PieChart} label="Participation" value={`${stats.participationRate.toFixed(1)}%`} sub="Real-time sync planned" delay={0.15} />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">

          {/* Bar chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.20 }}
            className="lg:col-span-7"
          >
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]">
                    Program Statistics
                  </div>
                  <div className="mt-1.5 text-xl font-black text-white">Votes by program</div>
                </div>
                <div
                  className="grid h-9 w-9 place-items-center rounded-xl"
                  style={{ background: 'rgba(255,122,24,0.10)', border: '1px solid rgba(255,122,24,0.22)' }}
                >
                  <BarChart3 className="h-4 w-4 text-[var(--cetso-orange)]" />
                </div>
              </div>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.byProgram} margin={{ top: 6, right: 6, bottom: 6, left: -16 }}>
                    <XAxis
                      dataKey="programCode"
                      stroke="rgba(234,234,242,0.35)"
                      tick={{ fontSize: 11, fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="rgba(234,234,242,0.35)"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(10,10,18,0.95)',
                        border: '1px solid rgba(255,255,255,0.10)',
                        borderRadius: 16,
                        color: 'white',
                        fontFamily: 'var(--font-ui)',
                        fontSize: 12,
                        boxShadow: '0 16px 48px rgba(0,0,0,0.60)',
                      }}
                      cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 12, color: 'rgba(234,234,242,0.65)', paddingTop: 8 }}
                    />
                    <Bar dataKey="votes" radius={[10, 10, 0, 0]} name="Votes">
                      {stats.byProgram.map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={entry.color}
                          fillOpacity={0.80}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>

          {/* Top positions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="lg:col-span-5"
          >
            <GlassCard className="p-5 h-full">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]">
                Top Positions
              </div>
              <div className="mt-1.5 text-xl font-black text-white">Most selected</div>

              <div className="mt-4 space-y-2.5">
                {stats.topPositions.map((p, i) => {
                  const maxCount = stats.topPositions[0]?.count || 1
                  const pct = maxCount ? (p.count / maxCount) * 100 : 0
                  return (
                    <div
                      key={p.positionCode}
                      className="rounded-2xl p-3"
                      style={{ background: 'rgba(0,0,0,0.20)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold text-white">{p.title}</div>
                          <div className="mt-0.5 text-[10px] font-semibold text-[var(--cetso-text-3)]">{p.positionCode}</div>
                        </div>
                        <div
                          className="shrink-0 rounded-xl px-2.5 py-1 text-xs font-black"
                          style={{
                            background: 'rgba(255,122,24,0.12)',
                            border: '1px solid rgba(255,122,24,0.28)',
                            color: 'rgba(255,178,74,0.95)',
                          }}
                        >
                          {p.count}
                        </div>
                      </div>
                      <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: PROGRAM_COLORS[i % PROGRAM_COLORS.length] }}
                          initial={{ width: '0%' }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.3 + i * 0.06, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  )
                })}
                {stats.topPositions.length === 0 ? (
                  <div className="py-6 text-center text-sm font-medium text-[var(--cetso-text-2)]">
                    No votes yet in this demo.
                  </div>
                ) : null}
              </div>

              <div className="mt-4 text-xs font-medium text-[var(--cetso-text-3)]">
                Live vote monitoring powered by Supabase Realtime (planned).
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  )
}
