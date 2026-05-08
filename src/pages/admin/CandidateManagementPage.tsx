import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Search, Users, X } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import AdminLayout from '../../components/layout/AdminLayout'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import TextField from '../../components/ui/TextField'
import { CANDIDATES, POSITIONS } from '../../mocks/mockElection'

const AVATAR_COLORS = [
  ['rgba(255,122,24,0.16)', 'rgba(255,122,24,0.35)', '#ff7a18'],
  ['rgba(139,92,246,0.16)', 'rgba(139,92,246,0.35)', '#a78bfa'],
  ['rgba(20,184,166,0.16)', 'rgba(20,184,166,0.35)', '#2dd4bf'],
  ['rgba(59,130,246,0.16)', 'rgba(59,130,246,0.35)', '#60a5fa'],
  ['rgba(236,72,153,0.16)', 'rgba(236,72,153,0.35)', '#f472b6'],
]

function initialsOf(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('')
}

export default function CandidateManagementPage() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState(POSITIONS[0]?.positionCode ?? '')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return CANDIDATES
    return CANDIDATES.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.partylist.toLowerCase().includes(q) ||
        c.positionCode.toLowerCase().includes(q)
    )
  }, [query])

  return (
    <AdminLayout>
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
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
                style={{ background: 'rgba(255,122,24,0.12)', border: '1px solid rgba(255,122,24,0.28)' }}
              >
                <Users className="h-6 w-6 text-[var(--cetso-orange)]" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]">Admin</div>
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
                  CANDIDATE MANAGEMENT
                </h1>
                <div className="mt-0.5 text-sm font-medium text-[var(--cetso-text-2)]">
                  Add, edit, and remove election candidates.
                </div>
              </div>
            </div>
            <Button variant="primary" size="lg" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Add Candidate
            </Button>
          </div>
        </motion.div>

        {/* Filters + Table */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
        >
          <GlassCard className="p-5">
            {/* Search bar */}
            <div className="mb-5 flex gap-3 items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--cetso-text-3)]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-2xl border border-[var(--cetso-border)] bg-[rgba(255,255,255,0.04)] py-3 pl-10 pr-9 text-sm text-[var(--cetso-text)] transition focus:border-[var(--cetso-border-strong)] focus:outline-none hover:border-[rgba(255,255,255,0.18)]"
                  placeholder="Search candidates — name, position, partylist…"
                  style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.25)' }}
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--cetso-text-2)] hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
              <div
                className="shrink-0 rounded-xl px-3 py-2 text-xs font-bold"
                style={{ background: 'rgba(255,122,24,0.10)', border: '1px solid rgba(255,122,24,0.22)', color: 'rgba(255,178,74,0.90)' }}
              >
                {filtered.length} found
              </div>
            </div>

            {/* Table */}
            <div
              className="overflow-hidden rounded-2xl"
              style={{ border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[560px]">
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                      {['Candidate', 'Position', 'Party', 'Actions'].map((h) => (
                        <th
                          key={h}
                          className="p-3 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, 12).map((c, i) => {
                      const inits = initialsOf(c.fullName)
                      const [bg, border, text] = AVATAR_COLORS[i % AVATAR_COLORS.length]
                      return (
                        <motion.tr
                          key={c.candidateId}
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.06 + i * 0.03 }}
                          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                          className="transition hover:bg-[rgba(255,255,255,0.02)]"
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-black"
                                style={{ background: bg, border: `1px solid ${border}`, color: text }}
                              >
                                {inits}
                              </div>
                              <span className="text-sm font-bold text-white">{c.fullName}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className="rounded-lg px-2.5 py-1 text-[10px] font-bold"
                              style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.10)',
                                color: 'var(--cetso-text-2)',
                              }}
                            >
                              {c.positionCode.replaceAll('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className="rounded-lg px-2.5 py-1 text-[10px] font-bold"
                              style={{
                                background: 'rgba(255,178,74,0.08)',
                                border: '1px solid rgba(255,178,74,0.22)',
                                color: 'rgba(255,178,74,0.85)',
                              }}
                            >
                              {c.partylist}
                            </span>
                          </td>
                          <td className="p-3">
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => alert('Delete action demo (connect Supabase RPC).')}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </td>
                        </motion.tr>
                      )
                    })}
                    {filtered.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-8 text-center text-sm font-medium text-[var(--cetso-text-2)]"
                        >
                          No candidates found. Try clearing your search.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-3 text-xs font-medium text-[var(--cetso-text-3)]">
              Showing {Math.min(filtered.length, 12)} of {filtered.length} candidates. Wire to Supabase for full CRUD.
            </div>
          </GlassCard>
        </motion.div>

        {/* Add Candidate slide-over */}
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay
              className="fixed inset-0"
              style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
            />
            <Dialog.Content
              className="fixed right-0 top-0 h-full w-[92vw] max-w-[520px] overflow-y-auto border-l p-6"
              style={{
                background: 'rgba(10,10,18,0.97)',
                borderColor: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(28px)',
                boxShadow: '-32px 0 80px rgba(0,0,0,0.60)',
              }}
            >
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <Dialog.Title className="text-2xl font-black text-white">Add Candidate</Dialog.Title>
                  <Dialog.Description className="mt-1 text-sm font-medium text-[var(--cetso-text-2)]">
                    Slide-over form (demo). Connect to Supabase CRUD later.
                  </Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="grid h-9 w-9 place-items-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[var(--cetso-text-2)] transition hover:border-[rgba(255,255,255,0.18)] hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--cetso-text)]">Position</label>
                  <select
                    value={selectedPosition}
                    onChange={(e) => setSelectedPosition(e.target.value)}
                    className="w-full rounded-2xl border border-[var(--cetso-border)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[var(--cetso-text)] focus:border-[var(--cetso-border-strong)] focus:outline-none"
                  >
                    {POSITIONS.map((p) => (
                      <option key={p.positionCode} value={p.positionCode} className="bg-[#0b0b10]">
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <TextField label="Full Name" placeholder="Candidate's full name" />
                <TextField label="Partylist" placeholder="e.g. UNITE" />
                <TextField label="Tagline" placeholder="Campaign tagline (max 80 chars)" />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--cetso-text)]">Photo Upload</label>
                  <div
                    className="rounded-2xl p-4 text-sm font-medium text-[var(--cetso-text-2)]"
                    style={{ background: 'rgba(0,0,0,0.22)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    Candidate image upload is UI-only in MVP. Connect Supabase Storage later.
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Dialog.Close asChild>
                    <Button variant="secondary" size="lg" className="flex-1">Cancel</Button>
                  </Dialog.Close>
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    onClick={() => {
                      alert('Add candidate demo — connect to Supabase.')
                      setOpen(false)
                    }}
                  >
                    Save Candidate
                  </Button>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </AdminLayout>
  )
}
