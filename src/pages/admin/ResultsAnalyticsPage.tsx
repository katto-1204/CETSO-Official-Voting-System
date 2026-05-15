import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, PieChart as PieIcon } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts'
import { getMockVoteSubmission, isVoteAlreadySubmitted } from '../../mocks/mockVotes'
import { MOCK_STUDENTS } from '../../mocks/mockStudents'
import { ELECTION, POSITIONS, PROGRAMS } from '../../mocks/mockElection'

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

export default function ResultsAnalyticsPage() {
  const data = useMemo(() => {
    const submissions = MOCK_STUDENTS
      .map((s) => isVoteAlreadySubmitted(s.studentId) ? getMockVoteSubmission(s.studentId) : null)
      .filter(Boolean)

    const byProgram = PROGRAMS.map((p, i) => ({
      programCode: p,
      votes: submissions.filter((s) => s!.receipt.programCode === p).length,
      color: PROGRAM_COLORS[i],
    }))

    const byPosition = POSITIONS.map((pos) => {
      let votes = 0
      for (const sub of submissions) {
        if (sub!.selections.some((sel) => sel.positionCode === pos.positionCode)) votes++
      }
      return { positionCode: pos.positionCode, title: pos.title, votes }
    }).sort((a, b) => b.votes - a.votes)

    return { submissions, byProgram, byPosition }
  }, [])

  const topBreakdown = data.byPosition.slice(0, 8)

  return (
    <div className="space-y-5">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[32px] p-6"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.50)',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
              style={{ background: 'rgba(255,122,24,0.12)', border: '1px solid rgba(255,122,24,0.28)' }}
            >
              <BarChart3 className="h-6 w-6 text-[var(--cetso-orange)]" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]">Admin</div>
              <h1
                style={{
                  fontFamily: 'var(--font-h1)',
                  fontSize: 'clamp(24px, 4vw, 44px)',
                  lineHeight: 0.93,
                  letterSpacing: '0.01em',
                  color: 'var(--cetso-text)',
                  marginTop: 4,
                }}
              >
                RESULTS ANALYTICS
              </h1>
              <div className="mt-0.5 text-sm font-medium text-[var(--cetso-text-2)]">
                Breakdown of election results and student participation.
              </div>
            </div>
          </div>
        </motion.div>

        {/* Rule banner */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="rounded-[28px] p-5"
          style={{
            background: 'rgba(255,122,24,0.07)',
            border: '1px solid rgba(255,122,24,0.24)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="text-[10px] font-bold uppercase tracking-widest text-[rgba(255,178,74,0.85)]">
            Equal Program Share
          </div>
          <div className="mt-1.5 text-xl font-black text-white">
            Each academic program contributes equally (25%) to the final election result.
          </div>
          <div className="mt-1 text-sm font-medium text-[var(--cetso-text-2)]">
            {ELECTION.name} • {ELECTION.electionYear}
          </div>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.10 }}
            className="lg:col-span-7"
          >
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]">Top Positions</div>
                  <div className="mt-1 text-xl font-black text-white">Votes by Position</div>
                </div>
                <div
                  className="grid h-9 w-9 place-items-center rounded-xl"
                  style={{ background: 'rgba(255,122,24,0.10)', border: '1px solid rgba(255,122,24,0.22)' }}
                >
                  <BarChart3 className="h-4 w-4 text-[var(--cetso-orange)]" />
                </div>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topBreakdown} margin={{ top: 6, right: 6, bottom: 6, left: -16 }}>
                    <XAxis
                      dataKey="title"
                      stroke="rgba(234,234,242,0.30)"
                      tick={{ fontSize: 9, fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis stroke="rgba(234,234,242,0.30)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                    <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(234,234,242,0.55)' }} />
                    <Bar dataKey="votes" radius={[10, 10, 0, 0]} name="Votes">
                      {topBreakdown.map((_, idx) => (
                        <Cell key={idx} fill={PROGRAM_COLORS[idx % PROGRAM_COLORS.length]} fillOpacity={0.80} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-5"
          >
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]">Program Share</div>
                  <div className="mt-1 text-xl font-black text-white">Equal Split (25%)</div>
                </div>
                <div
                  className="grid h-9 w-9 place-items-center rounded-xl"
                  style={{ background: 'rgba(255,122,24,0.10)', border: '1px solid rgba(255,122,24,0.22)' }}
                >
                  <PieIcon className="h-4 w-4 text-[var(--cetso-orange)]" />
                </div>
              </div>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(234,234,242,0.55)', paddingTop: 8 }} />
                    <Pie
                      data={data.byProgram}
                      dataKey="votes"
                      nameKey="programCode"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {data.byProgram.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} fillOpacity={0.85} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-xs font-medium text-[var(--cetso-text-3)]">
                Each program contributes 25% to the final election result.
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* All positions list */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.20 }}
        >
          <GlassCard className="p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)] mb-1">All Positions</div>
            <div className="text-xl font-black text-white mb-5">Full results breakdown</div>
            <div className="space-y-2.5">
              {data.byPosition.map((p, i) => {
                const maxVotes = data.byPosition[0]?.votes || 1
                const pct = (p.votes / maxVotes) * 100
                return (
                  <motion.div
                    key={p.positionCode}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.20 + i * 0.03 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-6 text-right text-[10px] font-bold text-[var(--cetso-text-3)]">#{i + 1}</div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <div className="truncate text-sm font-bold text-white">{p.title}</div>
                        <div
                          className="shrink-0 rounded-lg px-2 py-0.5 text-[11px] font-black"
                          style={{
                            background: 'rgba(255,122,24,0.12)',
                            border: '1px solid rgba(255,122,24,0.28)',
                            color: 'rgba(255,178,74,0.95)',
                          }}
                        >
                          {p.votes}
                        </div>
                      </div>
                      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: PROGRAM_COLORS[i % PROGRAM_COLORS.length] }}
                          initial={{ width: '0%' }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.20 + i * 0.03, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </GlassCard>
        </motion.div>
      </div>
  )
}
