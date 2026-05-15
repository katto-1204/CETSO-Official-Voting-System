import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, X, Filter, Shield, Crosshair, Zap } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import TextField from '../../components/ui/TextField'
import Button from '../../components/ui/Button'
import { getStudentContext } from '../../lib/studentContext'
import { getCandidatesForPosition, getEligiblePositions } from '../../mocks/mockElection'
import type { Candidate, Position } from '../../mocks/mockElection'

function initialsOf(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('')
}

/* ── Cyberpunk / Valorant-style colour palettes per card ─── */
const CARD_THEMES = [
  { accent: '#ff4655', glow: 'rgba(255,70,85,0.5)', gradient: 'linear-gradient(135deg, #ff4655 0%, #0f1923 60%)', bg: '#0f1923' },
  { accent: '#00e5ff', glow: 'rgba(0,229,255,0.5)', gradient: 'linear-gradient(135deg, #00e5ff 0%, #0a1628 60%)', bg: '#0a1628' },
  { accent: '#bd00ff', glow: 'rgba(189,0,255,0.5)', gradient: 'linear-gradient(135deg, #bd00ff 0%, #12051f 60%)', bg: '#12051f' },
  { accent: '#ffe500', glow: 'rgba(255,229,0,0.5)', gradient: 'linear-gradient(135deg, #ffe500 0%, #1a1600 60%)', bg: '#1a1600' },
  { accent: '#00ff88', glow: 'rgba(0,255,136,0.5)', gradient: 'linear-gradient(135deg, #00ff88 0%, #041f10 60%)', bg: '#041f10' },
]

function CandidateCard({ c, index }: { c: Candidate; index: number }) {
  const inits = initialsOf(c.fullName)
  const theme = CARD_THEMES[index % CARD_THEMES.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="cursor-default group"
    >
      <div
        className="relative overflow-hidden rounded-lg"
        style={{
          background: theme.bg,
          border: `1px solid ${theme.accent}40`,
          boxShadow: `0 0 20px ${theme.accent}15, 0 20px 60px rgba(0,0,0,0.60)`,
          clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
        }}
      >
        {/* ── Scan-line overlay ───────────────── */}
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-[0.03]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
          }}
        />

        {/* ── Top accent bar ─────────────────── */}
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, ${theme.accent}, transparent)` }}
        />

        {/* ── Avatar area ────────────────────── */}
        <div
          className="relative flex items-center justify-center py-10 overflow-hidden"
          style={{ background: theme.gradient }}
        >
          {/* Hex grid decorative bg */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `radial-gradient(circle, ${theme.accent} 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
            }}
          />

          {/* Corner accent */}
          <div
            className="absolute top-3 right-3 flex items-center gap-1.5"
          >
            <Crosshair className="h-3 w-3" style={{ color: theme.accent, opacity: 0.7 }} />
            <span
              className="text-[9px] font-bold uppercase tracking-[0.2em] font-mono"
              style={{ color: `${theme.accent}99` }}
            >
              CET-{c.positionCode.slice(0, 4)}
            </span>
          </div>

          {/* CETSO badge top-left */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <div
              className="grid h-5 w-5 place-items-center rounded text-[8px] font-black text-black"
              style={{ background: theme.accent }}
            >
              C
            </div>
          </div>

          {/* Big initials */}
          <div className="relative z-10">
            <div
              className="grid h-24 w-24 place-items-center rounded-lg"
              style={{
                background: `${theme.accent}12`,
                border: `2px solid ${theme.accent}50`,
                boxShadow: `0 0 40px ${theme.glow}, inset 0 0 30px ${theme.accent}10`,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-h1)',
                  fontSize: 44,
                  color: theme.accent,
                  lineHeight: 1,
                  textShadow: `0 0 20px ${theme.glow}`,
                }}
              >
                {inits}
              </span>
            </div>
            {/* Glow ring on hover */}
            <div
              className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                boxShadow: `0 0 60px ${theme.glow}, 0 0 120px ${theme.accent}30`,
              }}
            />
          </div>
        </div>

        {/* ── Divider with accent ────────────── */}
        <div className="relative h-px" style={{ background: `${theme.accent}30` }}>
          <div
            className="absolute left-0 top-0 h-full w-1/3 transition-all duration-500 group-hover:w-2/3"
            style={{ background: theme.accent, boxShadow: `0 0 12px ${theme.glow}` }}
          />
        </div>

        {/* ── Info section ───────────────────── */}
        <div className="px-5 py-4" style={{ background: `${theme.bg}` }}>
          {/* Name */}
          <div
            className="text-lg font-black tracking-wide"
            style={{
              fontFamily: 'var(--font-h2)',
              color: '#ffffff',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {c.fullName}
          </div>

          {/* Partylist + Position row */}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <div
              className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: `${theme.accent}15`,
                border: `1px solid ${theme.accent}35`,
                color: theme.accent,
              }}
            >
              <Shield className="h-2.5 w-2.5" />
              {c.partylist}
            </div>
            <div
              className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              <Zap className="h-2.5 w-2.5" />
              {c.positionCode.replace(/_/g, ' ')}
            </div>
          </div>

          {/* Tagline */}
          <div
            className="mt-3 text-xs font-medium italic leading-relaxed line-clamp-2"
            style={{ color: `${theme.accent}90` }}
          >
            "{c.tagline}"
          </div>

          {/* Bio */}
          <div
            className="mt-2 text-xs font-medium leading-relaxed line-clamp-2"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            {c.bio}
          </div>

          {/* Bottom accent line */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-px" style={{ background: `${theme.accent}20` }} />
            <span
              className="text-[8px] font-bold uppercase tracking-[0.3em] font-mono"
              style={{ color: `${theme.accent}50` }}
            >
              CETSO 2026
            </span>
            <div className="flex-1 h-px" style={{ background: `${theme.accent}20` }} />
          </div>
        </div>

        {/* ── Bottom accent bar ──────────────── */}
        <div
          className="h-0.5 w-full"
          style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }}
        />
      </div>
    </motion.div>
  )
}

export default function CandidateListPage() {
  const ctx = getStudentContext()
  const [query, setQuery] = useState('')
  const [positionCode, setPositionCode] = useState<string>('all')

  const eligiblePositions: Position[] = useMemo(() => {
    if (!ctx) return []
    return getEligiblePositions({ programCode: ctx.programCode, yearLevel: ctx.yearLevel })
  }, [ctx])

  const candidates: Candidate[] = useMemo(() => {
    if (!ctx) return []
    const allowedPositionCodes = new Set(eligiblePositions.map((p) => p.positionCode))
    const base = eligiblePositions.flatMap((p) => getCandidatesForPosition(p.positionCode))
    const filtered = base.filter((c) => allowedPositionCodes.has(c.positionCode))
    const q = query.trim().toLowerCase()
    return filtered.filter((c) => {
      const matchQuery =
        !q ||
        c.fullName.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.partylist.toLowerCase().includes(q)
      const matchPosition = positionCode === 'all' || c.positionCode === positionCode
      return matchQuery && matchPosition
    })
  }, [ctx, eligiblePositions, positionCode, query])

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
    { value: 'all', label: 'All eligible positions' },
    ...eligiblePositions.map((p) => ({ value: p.positionCode, label: p.title })),
  ]

  return (
    <div className="space-y-6">

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
            fontSize: 'clamp(36px, 6vw, 56px)',
            lineHeight: 0.95,
            color: 'var(--cetso-text)',
            letterSpacing: '0.01em',
          }}
        >
          CANDIDATE LIST
        </h1>
        <p className="mt-2 text-sm font-medium" style={{ color: 'var(--cetso-text-2)' }}>
          Review all candidates running for your eligible positions.
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

      {/* Candidates grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {candidates.map((c, i) => (
          <CandidateCard key={c.candidateId} c={c} index={i} />
        ))}
        {candidates.length === 0 ? (
          <div className="col-span-full">
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
          </div>
        ) : null}
      </div>
    </div>
  )
}
