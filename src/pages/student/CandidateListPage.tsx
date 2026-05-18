import { Fragment, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, X, Filter, Crosshair, Zap } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import TextField from '../../components/ui/TextField'
import Button from '../../components/ui/Button'
import { getStudentContext } from '../../lib/studentContext'
import { POSITIONS, getPositionGroupLabel, mergeCandidatesWithOfficialSeed } from '../../lib/electionData'
import type { Candidate, Position } from '../../lib/electionData'
import { useCandidates } from '../../lib/queries'
import Modal from '../../components/ui/Modal'

const ZZZ_COLORS = [
  { bg: '#ff3131', accent: '#ff8a8a', text: 'text-white' }, // Red (Lucifer style)
  { bg: '#e032d9', accent: '#f07bf0', text: 'text-white' }, // Pink (Gracy style)
  { bg: '#00d2ff', accent: '#8ce6ff', text: 'text-black' }, // Cyan
  { bg: '#ffb800', accent: '#ffd252', text: 'text-black' }, // Yellow
  { bg: '#00ff66', accent: '#8affb8', text: 'text-black' }, // Green
]

function CandidateCard({ c, index, onClick }: { c: Candidate; index: number, onClick?: () => void }) {
  const theme = ZZZ_COLORS[index % ZZZ_COLORS.length]

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="group relative w-full aspect-[3/4] outline-none text-left"
    >
      {/* Skewed Container */}
      <div 
        className="absolute inset-0 overflow-hidden transition-all duration-300 ring-2 ring-transparent group-hover:ring-white/40 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
        style={{ 
          transform: 'skew(-8deg)',
          background: theme.bg,
          borderRadius: '1.5rem',
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
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <Zap className="w-32 h-32" />
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
        </div>
      </div>
    </motion.button>
  )
}

export default function CandidateListPage() {
  const ctx = getStudentContext()
  const [query, setQuery] = useState('')
  const [positionCode, setPositionCode] = useState<string>('all')
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  const displayPositions: Position[] = POSITIONS

  const { data: dbCandidates, isLoading, isError } = useCandidates()
  const sourceCandidates = useMemo(
    () => mergeCandidatesWithOfficialSeed(dbCandidates),
    [dbCandidates]
  )

  const candidates: Candidate[] = useMemo(() => {
    if (!ctx) return []
    const allowedPositionCodes = new Set(displayPositions.map((p) => p.positionCode))
    const filtered = sourceCandidates.filter((c) => allowedPositionCodes.has(c.positionCode))
    const q = query.trim().toLowerCase()
    return filtered.filter((c) => {
      const matchQuery =
        !q ||
        c.fullName.toLowerCase().includes(q)
      const matchPosition = positionCode === 'all' || c.positionCode === positionCode
      return matchQuery && matchPosition
    })
  }, [ctx, displayPositions, positionCode, query, sourceCandidates])

  const candidatesByPosition = useMemo(() => {
    return displayPositions
      .map((position) => ({
        position,
        candidates: candidates.filter((candidate) => candidate.positionCode === position.positionCode),
      }))
      .filter((group) => positionCode === 'all' || group.position.positionCode === positionCode)
  }, [candidates, displayPositions, positionCode])

  if (!ctx) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <Crosshair className="mx-auto h-10 w-10 text-[var(--cetso-orange)] mb-4" />
          <div
            className="text-3xl font-black uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-h1)', color: 'var(--cetso-text)' }}
          >
            PLEASE LOG IN
          </div>
          <div className="mt-2 text-sm font-medium" style={{ color: 'var(--cetso-text-2)' }}>
            Log in as a CET student to view eligible candidates.
          </div>
        </GlassCard>
      </div>
    )
  }

  const posOptions = [
    { value: 'all', label: 'All positions' },
    ...displayPositions.map((p) => ({ value: p.positionCode, label: p.title })),
  ]

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--cetso-orange)] mb-4" />
          <div className="text-xl font-bold text-[var(--cetso-text)]">Loading candidates...</div>
        </GlassCard>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <GlassCard className="max-w-md w-full p-8 text-center border-red-500/50">
          <X className="mx-auto h-10 w-10 text-red-500 mb-4" />
          <div className="text-xl font-bold text-red-500">Failed to load candidates</div>
          <p className="mt-2 text-sm text-[var(--cetso-text-2)]">Please check your database connection.</p>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Candidate Info Modal */}
      <Modal
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        title="CANDIDATE INFORMATION"
        maxWidth="max-w-4xl"
      >
        {selectedCandidate && (
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-stretch">
            {/* Left: Image */}
            <div className="w-full md:w-1/2 flex-shrink-0">
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black/40">
                {selectedCandidate.imageUrl ? (
                  <img
                    src={selectedCandidate.imageUrl}
                    alt={selectedCandidate.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <Zap className="w-32 h-32 text-white" />
                  </div>
                )}
                {/* Overlay gradient for styling */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Right: Information */}
            <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[var(--cetso-orange)] mb-2">
                  {selectedCandidate.positionCode.replace(/_/g, ' ')}
                </div>
                <h2 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter text-white leading-[0.9]">
                  {selectedCandidate.fullName}
                </h2>
              </div>

              {selectedCandidate.bio && (
                <div className="bg-white/5 p-5 rounded-xl border border-white/10">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">
                    Biography / Platform
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed font-medium whitespace-pre-wrap">
                    {selectedCandidate.bio}
                  </p>
                </div>
              )}

              <div className="pt-4">
                <Button variant="secondary" className="w-full" onClick={() => setSelectedCandidate(null)}>
                  Close Information
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div
          className="text-[11px] font-bold uppercase tracking-widest mb-1"
          style={{ color: 'var(--cetso-text-3)', fontFamily: 'var(--font-h2)' }}
        >
          Candidate Directory — {ctx.programCode} · Year {ctx.yearLevel}
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-h1)',
            fontSize: 'clamp(26px, 5vw, 56px)',
            lineHeight: 0.95,
            color: 'var(--cetso-text)',
            letterSpacing: '0.01em',
          }}
        >
          CANDIDATE LIST
        </h1>
        <p className="mt-2 text-sm font-medium" style={{ color: 'var(--cetso-text-2)' }}>
          Review all official candidates grouped by position.
        </p>
      </motion.div>

      {/* Filters */}
      <GlassCard className="p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end">
          <div className="sm:col-span-6 relative">
            <TextField
              label="Search Candidates"
              name="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, partylist, tagline…"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-[38px] transition"
                style={{ color: 'var(--cetso-text-2)' }}
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <Search className="pointer-events-none absolute right-3 top-[38px] h-4 w-4" style={{ color: 'var(--cetso-text-3)' }} />
            )}
          </div>
          <div className="sm:col-span-4">
            <label className="mb-2 block text-sm font-semibold" style={{ color: 'var(--cetso-text)' }}>
              <Filter className="inline h-3.5 w-3.5 mr-1.5 opacity-70" />
              Position
            </label>
            <select
              value={positionCode}
              onChange={(e) => setPositionCode(e.target.value)}
              className="w-full rounded-2xl border px-4 py-3 text-sm transition focus:outline-none"
              style={{
                background: 'var(--cetso-input-bg)',
                border: '1px solid var(--cetso-border)',
                color: 'var(--cetso-text)',
              }}
            >
              {posOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => { setQuery(''); setPositionCode('all') }}
            >
              Reset
            </Button>
          </div>
        </div>
        <div className="mt-3 text-xs font-semibold" style={{ color: 'var(--cetso-text-2)' }}>
          {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} found
        </div>
      </GlassCard>

      {/* Candidates grouped by position */}
      <div className="space-y-8">
        {candidatesByPosition.map(({ position, candidates: groupCandidates }, index) => {
          const groupLabel = getPositionGroupLabel(position.positionCode)
          const previousGroupLabel = index > 0 ? getPositionGroupLabel(candidatesByPosition[index - 1].position.positionCode) : ''
          const showGroupHeader = index === 0 || groupLabel !== previousGroupLabel

          return (
            <Fragment key={position.positionCode}>
              {showGroupHeader ? (
                <div className={index === 0 ? 'pt-1' : 'pt-6'}>
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <div className="mt-5 text-xs font-black uppercase tracking-[0.3em] text-white/35">
                    {groupLabel}
                  </div>
                </div>
              ) : null}
              <section className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: 'var(--cetso-orange)' }}>
                      {groupCandidates.length} candidate{groupCandidates.length !== 1 ? 's' : ''}
                    </div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                      {position.title}
                    </h2>
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/35">
                    {groupLabel}
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                  {groupCandidates.map((c, i) => (
                    <div key={c.candidateId} className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.666rem)] lg:w-[calc(25%-0.75rem)] xl:w-[calc(20%-0.8rem)]">
                      <CandidateCard c={c} index={i} onClick={() => {
                        console.log('Candidate clicked:', c.fullName);
                        setSelectedCandidate(c);
                      }} />
                    </div>
                  ))}
                </div>
              </section>
            </Fragment>
          )
        })}
        {candidates.length === 0 ? (
          <GlassCard className="p-10 text-center">
            <Search className="mx-auto h-10 w-10 text-[var(--cetso-text-3)] mb-3" />
            <div
              className="text-3xl font-black uppercase"
              style={{ fontFamily: 'var(--font-h1)', color: 'var(--cetso-text)' }}
            >
              NO RESULTS
            </div>
            <div className="mt-2 text-sm font-medium" style={{ color: 'var(--cetso-text-2)' }}>
              Try clearing your filters or search query.
            </div>
            <Button
              variant="secondary"
              size="md"
              className="mt-5"
              onClick={() => { setQuery(''); setPositionCode('all') }}
            >
              Clear Filters
            </Button>
          </GlassCard>
        ) : null}
      </div>
    </div>
  )
}
