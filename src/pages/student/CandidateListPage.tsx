import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, X, Filter } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import TextField from '../../components/ui/TextField'
import Button from '../../components/ui/Button'
import { getStudentContext } from '../../lib/studentContext'
import { getCandidatesForPosition, getEligiblePositions } from '../../mocks/mockElection'
import type { Candidate, Position } from '../../mocks/mockElection'

function initialsOf(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('')
}

const CARD_GRADIENTS = [
  ['#ff7a18', '#ff4400', '#3d0800'],
  ['#7c3aed', '#4c1d95', '#0f051f'],
  ['#0d9488', '#0f766e', '#022c22'],
  ['#2563eb', '#1e40af', '#0a0d2e'],
  ['#db2777', '#9d174d', '#2a0018'],
]

const RARITY_LABELS = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']

function CandidateCard({ c, index }: { c: Candidate; index: number }) {
  const inits = initialsOf(c.fullName)
  const [colorA, colorB, colorDark] = CARD_GRADIENTS[index % CARD_GRADIENTS.length]
  const rarity = RARITY_LABELS[index % RARITY_LABELS.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      whileHover={{ y: -4, scale: 1.015 }}
      className="cursor-default"
      style={{ perspective: 800 }}
    >
      <div
        className="rounded-[24px] overflow-hidden"
        style={{
          background: '#16161e',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.50)',
        }}
      >
        {/* ── Image / Avatar area ─────────────────── */}
        <div
          className="relative h-44 flex items-center justify-center overflow-hidden"
          style={{
            background: `radial-gradient(ellipse at 60% 40%, ${colorA}cc, ${colorB}99, ${colorDark})`,
          }}
        >
          {/* Rarity badge */}
          <div
            className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest"
            style={{
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: 'rgba(255,255,255,0.92)',
              fontFamily: 'var(--font-h2)',
            }}
          >
            {rarity}
          </div>

          {/* CETSO icon top-right */}
          <div
            className="absolute top-3 right-3 grid h-7 w-7 place-items-center rounded-xl text-[10px] font-black text-white"
            style={{
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            C
          </div>

          {/* Big initials / avatar */}
          <div
            className="relative z-10 grid h-24 w-24 place-items-center rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${colorA}40, ${colorB}30)`,
              border: `2px solid ${colorA}60`,
              backdropFilter: 'blur(8px)',
              boxShadow: `0 0 40px ${colorA}50`,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-h1)',
                fontSize: 42,
                color: 'white',
                lineHeight: 1,
                textShadow: `0 0 24px ${colorA}`,
              }}
            >
              {inits}
            </span>
          </div>

          {/* Decorative dots */}
          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5"
          >
            {[0, 1, 2].map((d) => (
              <div
                key={d}
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: d === 0 ? colorA : 'rgba(255,255,255,0.25)' }}
              />
            ))}
          </div>
        </div>

        {/* ── Price / position row ─────────────────── */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ background: '#1e1e2a', borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            className="text-sm font-black text-white"
            style={{ fontFamily: 'var(--font-h2)' }}
          >
            {c.positionCode.replaceAll('_', ' ')}
          </div>
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
            style={{
              background: `${colorA}18`,
              border: `1px solid ${colorA}40`,
              color: colorA,
              fontFamily: 'var(--font-h2)',
            }}
          >
            {c.partylist.split(' ').slice(0, 2).join(' ')}
          </div>
        </div>

        {/* ── Info section ─────────────────────────── */}
        <div className="px-4 pb-4 pt-2" style={{ background: '#16161e' }}>
          <div
            className="text-base font-black text-white"
            style={{ fontFamily: 'var(--font-h2)', letterSpacing: '-0.01em' }}
          >
            {c.fullName}
          </div>
          <div
            className="mt-0.5 flex items-center gap-1.5"
          >
            <div
              className="grid h-4 w-4 place-items-center rounded-md text-[8px] font-black text-white"
              style={{ background: colorA }}
            >
              {c.partylist[0]}
            </div>
            <span
              className="text-[11px] font-semibold"
              style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-h2)' }}
            >
              {c.partylist}
            </span>
          </div>

          {/* Tagline */}
          <div
            className="mt-3 text-xs font-medium italic leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            "{c.tagline}"
          </div>

          {/* Stats row */}
          <div
            className="mt-3 grid grid-cols-2 gap-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}
          >
            <div>
              <div
                className="text-[9px] font-bold uppercase tracking-widest mb-0.5"
                style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-h2)' }}
              >
                Position
              </div>
              <div className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.75)' }}>
                {c.positionCode.replace(/_/g, ' ')}
              </div>
            </div>
            <div>
              <div
                className="text-[9px] font-bold uppercase tracking-widest mb-0.5 text-right"
                style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-h2)' }}
              >
                Vote Weight
              </div>
              <div
                className="flex items-center justify-end gap-1"
              >
                <div className="h-2 w-2 rounded-full" style={{ background: colorA }} />
                <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  25%
                </span>
                <div className="h-2 w-2 rounded-full" style={{ background: 'rgba(255,255,255,0.20)' }} />
              </div>
            </div>
          </div>
        </div>
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
          <div
            className="text-4xl font-black"
            style={{ fontFamily: 'var(--font-h1)', color: 'var(--cetso-text)' }}
          >
            LOGIN REQUIRED
          </div>
          <div className="mt-2 text-sm font-medium" style={{ color: 'var(--cetso-text-2)' }}>
            Please log in as a CET student to view eligible candidates.
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
          BROWSE & SELECT
        </h1>
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
              <div className="text-4xl mb-3">🔍</div>
              <div
                className="text-3xl font-black"
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
