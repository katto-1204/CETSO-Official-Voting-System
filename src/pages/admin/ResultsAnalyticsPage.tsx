import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, PieChart as PieIcon, Trophy, Crown, Zap, Users, Award } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts'
import { ELECTION, POSITIONS, PROGRAMS, mergeCandidatesWithOfficialSeed } from '../../lib/electionData'
import { supabase } from '../../lib/supabase'
import type { VoteSelection } from '../../lib/voteRecords'
import { useCandidates } from '../../lib/queries'

const PROGRAM_COLORS = ['#ff7a18', '#a78bfa', '#2dd4bf', '#60a5fa']

const tooltipStyle = {
  backgroundColor: 'var(--cetso-surface-1)',
  border: '1.5px solid var(--cetso-border)',
  borderRadius: 16,
  color: 'var(--cetso-text)',
  fontFamily: 'var(--font-ui)',
  fontSize: 12,
  boxShadow: 'var(--cetso-card-shadow)',
}

function isAbstainSelection(selection: VoteSelection) {
  return selection.candidateId === 'ABSTAIN' || selection.candidateId.startsWith('ABSTAIN_')
}

export default function ResultsAnalyticsPage() {
  const [submissions, setSubmissions] = useState<Array<{ programCode: string; selections: VoteSelection[] }>>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboards'>('overview')
  const [activePositionCode, setActivePositionCode] = useState('PRESIDENT')

  const { data: dbCandidates } = useCandidates()

  const allCandidates = useMemo(() => {
    return mergeCandidatesWithOfficialSeed(dbCandidates)
  }, [dbCandidates])

  useEffect(() => {
    supabase
      .from('votes')
      .select('program_code, selections')
      .then(({ data, error }) => {
        if (error) {
          console.error('Error loading results:', error)
          setSubmissions([])
          return
        }
        setSubmissions((data ?? []).map((row: any) => ({
          programCode: row.program_code,
          selections: row.selections ?? [],
        })))
      })
  }, [])

  const data = useMemo(() => {
    const byProgram = PROGRAMS.map((p, i) => ({
      programCode: p,
      votes: submissions.filter((s) => s.programCode === p).length,
      color: PROGRAM_COLORS[i],
    }))

    const byPosition = POSITIONS.map((pos) => {
      let votes = 0
      let abstains = 0
      for (const sub of submissions) {
        const positionSelections = sub.selections.filter((sel) => sel.positionCode === pos.positionCode)
        if (positionSelections.length > 0) votes++
        if (positionSelections.some(isAbstainSelection)) abstains++
      }
      return { positionCode: pos.positionCode, title: pos.title, votes, abstains }
    }).sort((a, b) => b.votes - a.votes)

    return { submissions, byProgram, byPosition }
  }, [submissions])

  const positionsWithCandidates = useMemo(() => {
    return POSITIONS.filter((pos) => {
      return allCandidates.some((c) => c.positionCode === pos.positionCode)
    })
  }, [allCandidates])

  useEffect(() => {
    if (positionsWithCandidates.length > 0 && !positionsWithCandidates.some(p => p.positionCode === activePositionCode)) {
      setActivePositionCode(positionsWithCandidates[0].positionCode)
    }
  }, [positionsWithCandidates, activePositionCode])

  const positionCandidates = useMemo(() => {
    return allCandidates
      .filter((c) => c.positionCode === activePositionCode)
      .map((c) => {
        const votes = submissions.filter((sub) =>
          sub.selections.some((sel) => sel.candidateId === c.candidateId)
        ).length
        return { ...c, votes }
      })
      .sort((a, b) => b.votes - a.votes)
  }, [allCandidates, activePositionCode, submissions])

  const topBreakdown = data.byPosition.slice(0, 8)
  const activePositionStats = data.byPosition.find((pos) => pos.positionCode === activePositionCode)

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[32px] p-6 border transition-colors duration-300"
        style={{
          background: 'var(--cetso-surface-1)',
          borderColor: 'var(--cetso-border)',
          backdropFilter: 'blur(20px)',
          boxShadow: 'var(--cetso-card-shadow)',
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

      {/* Tab Switcher */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="flex items-center gap-2 border-b border-white/5 pb-2"
      >
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-300 rounded-xl border ${
            activeTab === 'overview'
              ? 'bg-[var(--cetso-orange)]/10 border-[var(--cetso-orange)]/45 text-[var(--cetso-orange)] shadow-[0_4px_20px_rgba(255,122,24,0.15)]'
              : 'border-transparent text-[var(--cetso-text-2)] hover:text-white hover:bg-white/5'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('leaderboards')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-300 rounded-xl border ${
            activeTab === 'leaderboards'
              ? 'bg-[var(--cetso-orange)]/10 border-[var(--cetso-orange)]/45 text-[var(--cetso-orange)] shadow-[0_4px_20px_rgba(255,122,24,0.15)]'
              : 'border-transparent text-[var(--cetso-text-2)] hover:text-white hover:bg-white/5'
          }`}
        >
          <Trophy className="h-4 w-4" />
          Leaderboards
        </button>
      </motion.div>

      {activeTab === 'overview' ? (
        <>
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
            <div className="mt-1.5 text-xl font-black text-[var(--cetso-text)]">
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
                    <div className="mt-1 text-xl font-black text-[var(--cetso-text)]">Votes by Position</div>
                  </div>
                  <div
                    className="grid h-9 w-9 place-items-center rounded-xl"
                    style={{ background: 'rgba(255,122,24,0.10)', border: '1px solid rgba(255,122,24,0.22)' }}
                  >
                    <BarChart3 className="h-4 w-4 text-[var(--cetso-orange)]" />
                  </div>
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={topBreakdown} margin={{ top: 6, right: 6, bottom: 6, left: -16 }}>
                      <XAxis
                        dataKey="title"
                        stroke="var(--cetso-border)"
                        tick={{ fontSize: 9, fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        angle={-25}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis stroke="var(--cetso-border)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--cetso-surface-2)' }} />
                      <Legend wrapperStyle={{ fontSize: 11, color: 'var(--cetso-text-3)' }} />
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
                    <div className="mt-1 text-xl font-black text-[var(--cetso-text)]">Equal Split (25%)</div>
                  </div>
                  <div
                    className="grid h-9 w-9 place-items-center rounded-xl"
                    style={{ background: 'rgba(255,122,24,0.10)', border: '1px solid rgba(255,122,24,0.22)' }}
                  >
                    <PieIcon className="h-4 w-4 text-[var(--cetso-orange)]" />
                  </div>
                </div>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <PieChart>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 11, color: 'var(--cetso-text-3)', paddingTop: 8 }} />
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
              <div className="text-xl font-black text-[var(--cetso-text)] mb-5">Full results breakdown</div>
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
                          <div className="truncate text-sm font-bold text-[var(--cetso-text)]">{p.title}</div>
                          <div
                            className="shrink-0 rounded-lg px-2 py-0.5 text-[11px] font-black"
                            style={{
                              background: 'rgba(255,122,24,0.12)',
                              border: '1px solid rgba(255,122,24,0.28)',
                              color: 'rgba(255,178,74,0.95)',
                            }}
                          >
                            {p.votes} votes
                          </div>
                          <div
                            className="shrink-0 rounded-lg px-2 py-0.5 text-[11px] font-black"
                            style={{
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.10)',
                              color: 'var(--cetso-text-2)',
                            }}
                          >
                            {p.abstains} abstain{p.abstains === 1 ? '' : 's'}
                          </div>
                        </div>
                        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--cetso-surface-3)' }}>
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
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Live Standings Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                Live Standings
              </h2>
              <p className="text-sm font-medium text-[var(--cetso-text-2)] mt-0.5">
                Real-time position-by-position voting standings and visual leaderboards.
              </p>
              {activePositionStats ? (
                <div className="mt-2 text-xs font-black uppercase tracking-wider text-[var(--cetso-text-3)]">
                  {activePositionStats.title}: {activePositionStats.abstains} abstain{activePositionStats.abstains === 1 ? '' : 's'}
                </div>
              ) : null}
            </div>
          </div>

          {/* Position Selector Horizontal Scroll */}
          <div className="flex gap-2 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {positionsWithCandidates.map((pos) => {
              const isActive = activePositionCode === pos.positionCode
              return (
                <button
                  key={pos.positionCode}
                  type="button"
                  onClick={() => setActivePositionCode(pos.positionCode)}
                  className={`shrink-0 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl border transition-all duration-300 ${
                    isActive
                      ? 'bg-white border-white text-black shadow-lg shadow-white/5 font-extrabold'
                      : 'bg-black/30 border-white/10 text-white/60 hover:text-white hover:border-white/20'
                  }`}
                >
                  {pos.title}
                </button>
              )
            })}
          </div>

          {/* Leaderboard Detail Grid */}
          {positionCandidates.length === 0 ? (
            <GlassCard className="p-10 text-center">
              <Award className="mx-auto h-12 w-12 text-white/20 mb-3" />
              <div className="text-xl font-bold text-white uppercase">No Candidates Registered</div>
              <p className="text-sm text-[var(--cetso-text-2)] mt-1">There are no candidates currently registered for this position.</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* Left: 1st Place Hero Card */}
              {(() => {
                const leader = positionCandidates[0]
                const challengers = positionCandidates.slice(1)
                const totalPositionVotes = positionCandidates.reduce((acc, c) => acc + c.votes, 0)
                const leaderPct = totalPositionVotes > 0 ? Math.round((leader.votes / totalPositionVotes) * 100) : 0
                
                return (
                  <>
                    <div className="lg:col-span-7 relative overflow-hidden rounded-[32px] border p-8 flex flex-col justify-between min-h-[380px] shadow-[0_15px_35px_rgba(0,0,0,0.65)]"
                         style={{ 
                           background: 'linear-gradient(135deg, rgba(255, 122, 24, 0.18) 0%, rgba(255, 122, 24, 0.05) 50%, rgba(0,0,0,0.4) 100%)',
                           borderColor: 'rgba(255, 122, 24, 0.3)' 
                         }}>
                      {/* Giant Background Number "01" */}
                      <div className="absolute right-6 top-6 text-[150px] font-black italic tracking-tighter text-white/[0.03] select-none pointer-events-none leading-none">
                        01
                      </div>

                      {/* Glowing Slanted Cyber-Shape Decoration */}
                      <div className="absolute top-0 right-0 bottom-0 w-[45%] bg-gradient-to-l from-[rgba(255,122,24,0.12)] via-[rgba(255,122,24,0.05)] to-transparent transform skew-x-[-12deg] origin-top pointer-events-none border-l border-white/5" />

                      {/* Candidate Cutout Portrait */}
                      <div className="absolute right-0 bottom-0 w-[42%] h-[90%] flex items-end justify-center pointer-events-none overflow-hidden z-10">
                        {leader.imageUrl ? (
                          <img
                            src={leader.imageUrl}
                            alt={leader.fullName}
                            className="h-[105%] object-contain object-bottom filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.8)] transition-all duration-700 hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <Zap className="w-20 h-20 text-white/10" />
                        )}
                      </div>

                      {/* Top Label & Info */}
                      <div className="relative z-20 space-y-4">
                        <div className="inline-flex items-center gap-1.5 bg-[var(--cetso-orange)]/15 border border-[var(--cetso-orange)]/45 text-[var(--cetso-orange)] rounded-lg px-3 py-1">
                          <Crown className="w-3.5 h-3.5 fill-[var(--cetso-orange)] animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-wider italic">
                            1st Place Leader
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-4xl sm:text-5xl font-black italic tracking-tighter uppercase leading-[0.95] text-white break-words max-w-[55%]">
                            {leader.fullName.split(' ')[0]}
                            {leader.fullName.split(' ').length > 1 && (
                              <span className="block text-xl sm:text-2xl opacity-90 tracking-tight mt-1 text-white/95">
                                {leader.fullName.split(' ').slice(1).join(' ')}
                              </span>
                            )}
                          </h3>
                          
                          <div className="text-[11px] font-bold text-white/40 tracking-wider uppercase">
                            {leader.partylist} • {leader.tagline}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Vote Score */}
                      <div className="relative z-20 mt-8 max-w-[55%]">
                        <div className="flex items-end gap-3">
                          <div className="bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 px-5 py-3 shadow-lg flex items-baseline gap-2">
                            <span className="text-3xl font-black italic tracking-tighter text-[var(--cetso-orange)]">
                              {leader.votes}
                            </span>
                            <span className="text-xs font-bold text-white/60 uppercase">
                              Votes
                            </span>
                          </div>

                          {totalPositionVotes > 0 && (
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/5 text-[10px] font-black text-white/60 uppercase tracking-wider">
                              {leaderPct}% Share
                            </div>
                          )}
                        </div>

                        <p className="text-[10px] font-semibold text-white/40 mt-3 line-clamp-2 italic pr-4">
                          "{leader.bio}"
                        </p>
                      </div>
                    </div>

                    {/* Right: Challengers list */}
                    <div className="lg:col-span-5 flex flex-col justify-between">
                      <GlassCard className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)] mb-1">
                            Challenger Standing
                          </div>
                          <div className="text-base font-black text-white uppercase mb-4">
                            Subsequent Candidates
                          </div>

                          {challengers.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-40">
                              <Users className="w-10 h-10 text-white mb-2" />
                              <div className="text-xs font-bold uppercase">No other candidates</div>
                              <p className="text-[10px] mt-1 text-center">There are no other runners for this position.</p>
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              {challengers.map((cand, idx) => {
                                const rank = idx + 2
                                const diff = cand.votes - leader.votes
                                const pct = totalPositionVotes > 0 ? Math.round((cand.votes / totalPositionVotes) * 100) : 0
                                
                                return (
                                  <div
                                    key={cand.candidateId}
                                    className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black italic bg-white/10 text-white/80">
                                        {rank}
                                      </div>

                                      <div className="relative w-9 h-9 rounded-xl border border-white/10 overflow-hidden bg-black/40 flex-shrink-0 flex items-center justify-center">
                                        {cand.imageUrl ? (
                                          <img
                                            src={cand.imageUrl}
                                            alt={cand.fullName}
                                            className="w-full h-full object-cover object-center"
                                          />
                                        ) : (
                                          <span className="text-[10px] font-black text-white/40">
                                            {cand.fullName.slice(0, 2).toUpperCase()}
                                          </span>
                                        )}
                                      </div>

                                      <div className="min-w-0">
                                        <div className="text-xs font-bold text-white truncate">
                                          {cand.fullName}
                                        </div>
                                        <div className="text-[9px] font-semibold text-white/45 truncate uppercase">
                                          {cand.partylist}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2.5 pl-3">
                                      <div className="text-right">
                                        <div className="text-xs font-black text-white">
                                          {cand.votes} <span className="text-[9px] font-normal text-white/50">V</span>
                                        </div>
                                        <div className="text-[9px] font-bold text-white/40">
                                          {pct}%
                                        </div>
                                      </div>

                                      <div className="bg-red-500/10 border border-red-500/25 text-red-400 rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-wider">
                                        -{Math.abs(diff)}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>

                        {(totalPositionVotes > 0 || (activePositionStats?.abstains ?? 0) > 0) && (
                          <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-white/40 uppercase">
                            <span>Total Standings votes</span>
                            <span className="text-white/80">
                              {totalPositionVotes} candidate votes | {activePositionStats?.abstains ?? 0} abstains
                            </span>
                          </div>
                        )}
                      </GlassCard>
                    </div>
                  </>
                )
              })()}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
