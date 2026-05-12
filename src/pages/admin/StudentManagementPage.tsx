import { useState, useMemo } from 'react'
import type { ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, GraduationCap, Plus, CheckCircle2, Search, X, UserCheck, UserX } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import TextField from '../../components/ui/TextField'
import { getAllStudents, registerStudent, isValidStudentId } from '../../lib/studentRegistry'
import { isVoteAlreadySubmitted } from '../../mocks/mockVotes'
import type { ProgramCode, YearLevel } from '../../mocks/mockStudents'

const PROGRAM_COLORS: Record<string, string> = { BSIT: 'rgba(255,122,24,0.14)', BLIS: 'rgba(167,139,250,0.14)', BSCpE: 'rgba(45,212,191,0.14)', BSECE: 'rgba(96,165,250,0.14)' }
const PROGRAM_BORDERS: Record<string, string> = { BSIT: 'rgba(255,122,24,0.30)', BLIS: 'rgba(167,139,250,0.30)', BSCpE: 'rgba(45,212,191,0.30)', BSECE: 'rgba(96,165,250,0.30)' }
const PROGRAM_TEXT: Record<string, string> = { BSIT: '#ff7a18', BLIS: '#a78bfa', BSCpE: '#2dd4bf', BSECE: '#60a5fa' }

type VoteFilter = 'all' | 'voted' | 'not-voted'

export default function StudentManagementPage() {
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const [students, setStudents] = useState(() => getAllStudents())

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [programFilter, setProgramFilter] = useState<string>('all')
  const [voteFilter, setVoteFilter] = useState<VoteFilter>('all')

  // Manual add
  const [manualId, setManualId] = useState('')
  const [manualName, setManualName] = useState('')
  const [manualProgram, setManualProgram] = useState<ProgramCode>('BSIT')
  const [manualYear, setManualYear] = useState<YearLevel>(1)
  const [manualSuccess, setManualSuccess] = useState(false)
  const [manualError, setManualError] = useState<string | null>(null)

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return students.filter((s) => {
      const matchQuery = !q || s.studentId.toLowerCase().includes(q) || s.fullName.toLowerCase().includes(q)
      const matchProgram = programFilter === 'all' || s.programCode === programFilter
      const voted = isVoteAlreadySubmitted(s.studentId)
      const matchVote = voteFilter === 'all' || (voteFilter === 'voted' && voted) || (voteFilter === 'not-voted' && !voted)
      return matchQuery && matchProgram && matchVote
    })
  }, [students, searchQuery, programFilter, voteFilter])

  const votedCount = useMemo(() => students.filter((s) => isVoteAlreadySubmitted(s.studentId)).length, [students])

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true); setProgress(0); setMessage(null)
    setTimeout(() => setProgress(25), 400)
    setTimeout(() => setProgress(58), 900)
    setTimeout(() => setProgress(84), 1300)
    setTimeout(() => { setProgress(100); setMessage('Import complete.'); setStudents(getAllStudents()); setImporting(false) }, 1800)
  }

  function addStudentManually() {
    setManualError(null)
    if (!manualId.trim() || !manualName.trim()) { setManualError('ID and name are required.'); return }
    if (!isValidStudentId(manualId.trim())) { setManualError('Student ID must start with "598".'); return }
    const result = registerStudent({ studentId: manualId.trim(), fullName: manualName.trim(), programCode: manualProgram, yearLevel: manualYear })
    if (!result.ok) { setManualError(result.error ?? 'Failed.'); return }
    setStudents(getAllStudents())
    setManualId(''); setManualName(''); setManualProgram('BSIT'); setManualYear(1)
    setManualSuccess(true)
    setTimeout(() => setManualSuccess(false), 3000)
  }

  return (
    <div className="space-y-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[32px] p-6"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', boxShadow: '0 24px 64px rgba(0,0,0,0.50)' }}
        >
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl" style={{ background: 'rgba(255,122,24,0.12)', border: '1px solid rgba(255,122,24,0.28)' }}>
              <GraduationCap className="h-6 w-6 text-[var(--cetso-orange)]" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>Admin</div>
              <h1 style={{ fontFamily: 'var(--font-h1)', fontSize: 'clamp(30px, 4vw, 44px)', lineHeight: 0.93, letterSpacing: '0.01em', color: 'var(--cetso-text)', marginTop: 4 }}>
                STUDENT MANAGEMENT
              </h1>
            </div>
          </div>
          {/* Stats row */}
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { label: 'Total', value: students.length, color: 'var(--cetso-orange)' },
              { label: 'Voted', value: votedCount, color: '#22c55e' },
              { label: 'Pending', value: students.length - votedCount, color: '#f59e0b' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl px-3 py-2" style={{ background: 'var(--cetso-input-bg)', border: '1px solid var(--cetso-border)' }}>
                <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>{s.label}</div>
                <div className="text-lg font-black" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Left: Import + Manual add */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="lg:col-span-4 space-y-4">
            {/* CSV Import */}
            <GlassCard className="p-5">
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>CSV Import</div>
              <div className="mt-1.5 text-xl font-black" style={{ color: 'var(--cetso-text)' }}>Bulk Upload</div>
              <div className="mt-4 rounded-2xl p-4" style={{ background: 'rgba(255,122,24,0.06)', border: '1px solid rgba(255,122,24,0.20)' }}>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[rgba(255,178,74,0.80)] mb-2">Required Columns</div>
                <div className="text-xs font-medium" style={{ color: 'var(--cetso-text-2)' }}>
                  <span className="font-bold" style={{ color: 'var(--cetso-text)' }}>Student ID</span>,{' '}
                  <span className="font-bold" style={{ color: 'var(--cetso-text)' }}>Full Name</span>,{' '}
                  <span className="font-bold" style={{ color: 'var(--cetso-text)' }}>Program</span>,{' '}
                  <span className="font-bold" style={{ color: 'var(--cetso-text)' }}>Year Level</span>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--cetso-text)' }}>
                  <UploadCloud className="inline h-4 w-4 mr-1.5 opacity-70" /> Upload CSV
                </label>
                <div className="relative flex items-center gap-3 rounded-2xl p-4" style={{ background: 'var(--cetso-input-bg)', border: '1px solid var(--cetso-border)' }}>
                  <UploadCloud className="h-5 w-5 shrink-0 text-[var(--cetso-orange)]" />
                  <input type="file" accept=".csv,text/csv" onChange={onFileChange} disabled={importing} className="text-xs" style={{ color: 'var(--cetso-text-2)' }} />
                </div>
              </div>
              <AnimatePresence>
                {importing && (
                  <motion.div key="prog" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4">
                    <div className="mb-2 flex justify-between text-xs font-semibold">
                      <span style={{ color: 'var(--cetso-text-2)' }}>Importing…</span>
                      <span className="font-bold" style={{ color: 'var(--cetso-text)' }}>{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--cetso-input-bg)', border: '1px solid var(--cetso-border)' }}>
                      <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #ff7a18, #ffb24a)' }} />
                    </div>
                  </motion.div>
                )}
                {!importing && message && (
                  <motion.div key="msg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="mt-4 flex items-center gap-2 rounded-2xl p-3"
                    style={{ background: 'var(--cetso-success-bg)', border: '1px solid var(--cetso-success-border)' }}
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: 'var(--cetso-success-text)' }} />
                    <div className="text-xs font-semibold" style={{ color: 'var(--cetso-success-text)' }}>{message}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>

            {/* Manual add */}
            <GlassCard className="p-5">
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>Manual Entry</div>
              <div className="mt-1.5 text-xl font-black" style={{ color: 'var(--cetso-text)' }}>Add Student</div>
              <div className="mt-4 space-y-3">
                <TextField label="Student ID" value={manualId} onChange={(e) => setManualId(e.target.value)} placeholder="598XXXXX" error={manualError && manualError.includes('ID') ? manualError : undefined} />
                <TextField label="Full Name" value={manualName} onChange={(e) => setManualName(e.target.value)} placeholder="e.g. Jose Rizal" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold" style={{ color: 'var(--cetso-text)' }}>Program</label>
                    <select value={manualProgram} onChange={(e) => setManualProgram(e.target.value as ProgramCode)}
                      className="w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none"
                      style={{ background: 'var(--cetso-input-bg)', border: '1px solid var(--cetso-border)', color: 'var(--cetso-text)' }}
                    >
                      {(['BSIT', 'BLIS', 'BSCpE', 'BSECE'] as ProgramCode[]).map((p) => (<option key={p} value={p}>{p}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold" style={{ color: 'var(--cetso-text)' }}>Year</label>
                    <select value={String(manualYear)} onChange={(e) => setManualYear(Number(e.target.value) as YearLevel)}
                      className="w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none"
                      style={{ background: 'var(--cetso-input-bg)', border: '1px solid var(--cetso-border)', color: 'var(--cetso-text)' }}
                    >
                      {[1, 2, 3, 4].map((y) => (<option key={y} value={y}>Year {y}</option>))}
                    </select>
                  </div>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,122,24,0.06)', border: '1px solid rgba(255,122,24,0.18)' }}>
                  <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>Password</div>
                  <div className="text-xs font-medium mt-0.5" style={{ color: 'var(--cetso-text-2)' }}>Auto-generated: digits after 598 + LASTNAME</div>
                </div>
                <Button variant="primary" size="lg" className="w-full" onClick={addStudentManually}>
                  <Plus className="h-4 w-4" /> Add Student
                </Button>
              </div>
              <AnimatePresence>
                {manualError && !manualError.includes('ID') && (
                  <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="mt-3 flex items-center gap-2 rounded-2xl p-3" style={{ background: 'var(--cetso-error-bg)', border: '1px solid var(--cetso-error-border)' }}>
                    <span className="text-xs font-semibold" style={{ color: 'var(--cetso-error-text)' }}>{manualError}</span>
                  </motion.div>
                )}
                {manualSuccess && (
                  <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="mt-3 flex items-center gap-2 rounded-2xl p-3" style={{ background: 'var(--cetso-success-bg)', border: '1px solid var(--cetso-success-border)' }}>
                    <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--cetso-success-text)' }} />
                    <div className="text-xs font-semibold" style={{ color: 'var(--cetso-success-text)' }}>Student added.</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </motion.div>

          {/* Right: Students table with filters */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.10 }} className="lg:col-span-8">
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>Roster</div>
                  <div className="mt-1 text-xl font-black" style={{ color: 'var(--cetso-text)' }}>Students ({filteredStudents.length})</div>
                </div>
              </div>

              {/* Search & Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="relative">
                  <TextField name="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search ID or name…" />
                  {searchQuery ? (
                    <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 top-[10px]" style={{ color: 'var(--cetso-text-2)' }}>
                      <X className="h-4 w-4" />
                    </button>
                  ) : (
                    <Search className="pointer-events-none absolute right-3 top-[10px] h-4 w-4" style={{ color: 'var(--cetso-text-3)' }} />
                  )}
                </div>
                <select value={programFilter} onChange={(e) => setProgramFilter(e.target.value)}
                  className="rounded-2xl border px-4 py-3 text-sm focus:outline-none"
                  style={{ background: 'var(--cetso-input-bg)', border: '1px solid var(--cetso-border)', color: 'var(--cetso-text)' }}
                >
                  <option value="all">All Programs</option>
                  {['BSIT', 'BLIS', 'BSCpE', 'BSECE'].map((p) => (<option key={p} value={p}>{p}</option>))}
                </select>
                <select value={voteFilter} onChange={(e) => setVoteFilter(e.target.value as VoteFilter)}
                  className="rounded-2xl border px-4 py-3 text-sm focus:outline-none"
                  style={{ background: 'var(--cetso-input-bg)', border: '1px solid var(--cetso-border)', color: 'var(--cetso-text)' }}
                >
                  <option value="all">All Status</option>
                  <option value="voted">Voted</option>
                  <option value="not-voted">Not Voted</option>
                </select>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid var(--cetso-border)' }}>
                <table className="w-full border-collapse min-w-[540px]">
                  <thead>
                    <tr style={{ background: 'var(--cetso-input-bg)' }}>
                      {['Student ID', 'Full Name', 'Program', 'Year', 'Vote Status'].map((h) => (
                        <th key={h} className="p-3 text-left text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s, i) => {
                      const inits = s.fullName.split(' ').slice(0, 2).map((p) => p[0]).join('')
                      const voted = isVoteAlreadySubmitted(s.studentId)
                      return (
                        <motion.tr key={s.studentId} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 + i * 0.02 }}
                          style={{ borderTop: '1px solid var(--cetso-border)' }}
                          className="transition hover:bg-black/5 dark:hover:bg-white/5"
                        >
                          <td className="p-3 font-mono text-xs font-bold" style={{ color: 'var(--cetso-text)' }}>{s.studentId}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[10px] font-black"
                                style={{ background: PROGRAM_COLORS[s.programCode] ?? 'rgba(255,255,255,0.06)', border: `1px solid ${PROGRAM_BORDERS[s.programCode] ?? 'rgba(255,255,255,0.12)'}`, color: PROGRAM_TEXT[s.programCode] ?? 'white' }}
                              >{inits}</div>
                              <span className="text-sm font-semibold" style={{ color: 'var(--cetso-text)' }}>{s.fullName}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="rounded-lg px-2.5 py-1 text-[10px] font-bold"
                              style={{ background: PROGRAM_COLORS[s.programCode], border: `1px solid ${PROGRAM_BORDERS[s.programCode]}`, color: PROGRAM_TEXT[s.programCode] }}
                            >{s.programCode}</span>
                          </td>
                          <td className="p-3 text-sm font-semibold" style={{ color: 'var(--cetso-text-2)' }}>{s.yearLevel}</td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold"
                              style={voted ? {
                                background: 'var(--cetso-success-bg)', border: '1px solid var(--cetso-success-border)', color: 'var(--cetso-success-text)',
                              } : {
                                background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.28)', color: '#f59e0b',
                              }}
                            >
                              {voted ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                              {voted ? 'Voted' : 'Pending'}
                            </span>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {filteredStudents.length === 0 && (
                <div className="py-8 text-center text-sm font-medium" style={{ color: 'var(--cetso-text-3)' }}>No students match your filters.</div>
              )}
            </GlassCard>
          </motion.div>
        </div>
    </div>
  )
}
