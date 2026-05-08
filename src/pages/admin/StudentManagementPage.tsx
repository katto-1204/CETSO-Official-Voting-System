import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, GraduationCap, Plus, CheckCircle2 } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import TextField from '../../components/ui/TextField'
import { getAllStudents, registerStudent } from '../../lib/studentRegistry'
import type { ProgramCode, YearLevel } from '../../mocks/mockStudents'

const PROGRAM_COLORS: Record<string, string> = {
  BSIT: 'rgba(255,122,24,0.14)',
  BLIS: 'rgba(167,139,250,0.14)',
  BSCpE: 'rgba(45,212,191,0.14)',
  BSECE: 'rgba(96,165,250,0.14)',
}
const PROGRAM_BORDERS: Record<string, string> = {
  BSIT: 'rgba(255,122,24,0.30)',
  BLIS: 'rgba(167,139,250,0.30)',
  BSCpE: 'rgba(45,212,191,0.30)',
  BSECE: 'rgba(96,165,250,0.30)',
}
const PROGRAM_TEXT: Record<string, string> = {
  BSIT: '#ff7a18',
  BLIS: '#a78bfa',
  BSCpE: '#2dd4bf',
  BSECE: '#60a5fa',
}

export default function StudentManagementPage() {
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const [students, setStudents] = useState(() => getAllStudents())

  const [manualId, setManualId] = useState('')
  const [manualName, setManualName] = useState('')
  const [manualProgram, setManualProgram] = useState<ProgramCode>('BSIT')
  const [manualYear, setManualYear] = useState<YearLevel>(1)
  const [manualPassword, setManualPassword] = useState('CETSO2026')
  const [manualSuccess, setManualSuccess] = useState(false)

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setProgress(0)
    setMessage(null)
    window.setTimeout(() => setProgress(25), 400)
    window.setTimeout(() => setProgress(58), 900)
    window.setTimeout(() => setProgress(84), 1300)
    window.setTimeout(() => {
      setProgress(100)
      setMessage('Import complete. Validation passed (demo).')
      setStudents(getAllStudents())
      setImporting(false)
    }, 1800)
  }

  function addStudentManually() {
    if (!manualId.trim() || !manualName.trim()) {
      setMessage('Student ID and Full Name are required.')
      return
    }
    registerStudent({
      studentId: manualId.trim(),
      fullName: manualName.trim(),
      programCode: manualProgram,
      yearLevel: manualYear,
      password: manualPassword || 'CETSO2026',
    })
    setStudents(getAllStudents())
    setManualId('')
    setManualName('')
    setManualProgram('BSIT')
    setManualYear(1)
    setManualPassword('CETSO2026')
    setManualSuccess(true)
    setMessage(null)
    setTimeout(() => setManualSuccess(false), 3000)
  }

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
          <div className="flex items-center gap-4">
            <div
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
              style={{ background: 'rgba(255,122,24,0.12)', border: '1px solid rgba(255,122,24,0.28)' }}
            >
              <GraduationCap className="h-6 w-6 text-[var(--cetso-orange)]" />
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
                STUDENT MANAGEMENT
              </h1>
              <div className="mt-0.5 text-sm font-medium text-[var(--cetso-text-2)]">
                CSV bulk import + manual add + access activation.
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">

          {/* Left: Import + Manual add */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="lg:col-span-4 space-y-4"
          >
            {/* CSV Import */}
            <GlassCard className="p-5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]">CSV Import</div>
              <div className="mt-1.5 text-xl font-black text-white">Bulk Upload</div>

              <div
                className="mt-4 rounded-2xl p-4"
                style={{ background: 'rgba(255,122,24,0.06)', border: '1px solid rgba(255,122,24,0.20)' }}
              >
                <div className="text-[10px] font-bold uppercase tracking-widest text-[rgba(255,178,74,0.80)] mb-2">
                  Required Columns
                </div>
                <div className="text-xs font-medium text-[var(--cetso-text-2)] leading-relaxed">
                  <span className="font-bold text-white">Student ID</span>,{' '}
                  <span className="font-bold text-white">Full Name</span>,{' '}
                  <span className="font-bold text-white">Program</span>,{' '}
                  <span className="font-bold text-white">Year Level</span>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-[var(--cetso-text)] mb-2">
                  <UploadCloud className="inline h-4 w-4 mr-1.5 opacity-70" />
                  Upload CSV File
                </label>
                <div
                  className="relative flex items-center gap-3 rounded-2xl p-4"
                  style={{ background: 'rgba(0,0,0,0.20)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <UploadCloud className="h-5 w-5 shrink-0 text-[var(--cetso-orange)]" />
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={onFileChange}
                    disabled={importing}
                    className="text-xs text-[var(--cetso-text-2)]"
                  />
                </div>
              </div>

              <AnimatePresence>
                {importing ? (
                  <motion.div
                    key="progress"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4"
                  >
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                      <span className="text-[var(--cetso-text-2)]">Importing…</span>
                      <span className="font-bold text-white">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <div
                        className="h-full rounded-full transition-[width] duration-500"
                        style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #ff7a18, #ffb24a)', boxShadow: '0 0 12px rgba(255,122,24,0.50)' }}
                      />
                    </div>
                  </motion.div>
                ) : message ? (
                  <motion.div
                    key="message"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 flex items-center gap-2 rounded-2xl p-3"
                    style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[rgba(134,239,172,0.90)]" />
                    <div className="text-xs font-semibold text-[rgba(134,239,172,0.90)]">{message}</div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div className="mt-3 text-xs font-medium text-[var(--cetso-text-3)]">
                Demo only — connect Supabase Storage + server-side parsing for production.
              </div>
            </GlassCard>

            {/* Manual add */}
            <GlassCard className="p-5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]">Manual Entry</div>
              <div className="mt-1.5 text-xl font-black text-white">Add Student</div>
              <div className="mt-1 text-xs font-medium text-[var(--cetso-text-2)]">
                For students not included in bulk import.
              </div>

              <div className="mt-4 space-y-3">
                <TextField
                  label="Student ID"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  placeholder="e.g. 603_____"
                />
                <TextField
                  label="Full Name"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g. Jose Rizal"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[var(--cetso-text)]">Program</label>
                    <select
                      value={manualProgram}
                      onChange={(e) => setManualProgram(e.target.value as ProgramCode)}
                      className="w-full rounded-2xl border border-[var(--cetso-border)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[var(--cetso-text)] focus:border-[var(--cetso-border-strong)] focus:outline-none"
                    >
                      {(['BSIT', 'BLIS', 'BSCpE', 'BSECE'] as ProgramCode[]).map((p) => (
                        <option key={p} value={p} className="bg-[#0b0b10]">{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[var(--cetso-text)]">Year</label>
                    <select
                      value={String(manualYear)}
                      onChange={(e) => setManualYear(Number(e.target.value) as YearLevel)}
                      className="w-full rounded-2xl border border-[var(--cetso-border)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[var(--cetso-text)] focus:border-[var(--cetso-border-strong)] focus:outline-none"
                    >
                      {[1, 2, 3, 4].map((y) => (
                        <option key={y} value={y} className="bg-[#0b0b10]">Year {y}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <TextField
                  label="Temporary Password"
                  value={manualPassword}
                  onChange={(e) => setManualPassword(e.target.value)}
                />
                <Button variant="primary" size="lg" className="w-full" onClick={addStudentManually}>
                  <Plus className="h-4 w-4" /> Add Student
                </Button>
              </div>

              <AnimatePresence>
                {manualSuccess ? (
                  <motion.div
                    key="manual-success"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 flex items-center gap-2 rounded-2xl p-3"
                    style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}
                  >
                    <CheckCircle2 className="h-4 w-4 text-[rgba(134,239,172,0.90)]" />
                    <div className="text-xs font-semibold text-[rgba(134,239,172,0.90)]">Student added successfully.</div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </GlassCard>
          </motion.div>

          {/* Right: Students table */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.10 }}
            className="lg:col-span-8"
          >
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]">Roster</div>
                  <div className="mt-1 text-xl font-black text-white">
                    Students ({students.length})
                  </div>
                </div>
                <div
                  className="rounded-xl px-3 py-1.5 text-xs font-bold"
                  style={{ background: 'rgba(255,122,24,0.10)', border: '1px solid rgba(255,122,24,0.22)', color: 'rgba(255,178,74,0.90)' }}
                >
                  Demo dataset
                </div>
              </div>

              <div
                className="overflow-hidden rounded-2xl"
                style={{ border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <table className="w-full border-collapse min-w-[480px]">
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                      {['Student ID', 'Full Name', 'Program', 'Year', 'Access'].map((h) => (
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
                    {students.map((s, i) => {
                      const initials = s.fullName.split(' ').slice(0, 2).map((p) => p[0]).join('')
                      return (
                        <motion.tr
                          key={s.studentId}
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.10 + i * 0.03 }}
                          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                          className="transition hover:bg-[rgba(255,255,255,0.02)]"
                        >
                          <td className="p-3 font-mono text-xs font-bold text-white">{s.studentId}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[10px] font-black"
                                style={{
                                  background: PROGRAM_COLORS[s.programCode] ?? 'rgba(255,255,255,0.06)',
                                  border: `1px solid ${PROGRAM_BORDERS[s.programCode] ?? 'rgba(255,255,255,0.12)'}`,
                                  color: PROGRAM_TEXT[s.programCode] ?? 'white',
                                }}
                              >
                                {initials}
                              </div>
                              <span className="text-sm font-semibold text-white">{s.fullName}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className="rounded-lg px-2.5 py-1 text-[10px] font-bold"
                              style={{
                                background: PROGRAM_COLORS[s.programCode] ?? 'rgba(255,255,255,0.05)',
                                border: `1px solid ${PROGRAM_BORDERS[s.programCode] ?? 'rgba(255,255,255,0.10)'}`,
                                color: PROGRAM_TEXT[s.programCode] ?? 'white',
                              }}
                            >
                              {s.programCode}
                            </span>
                          </td>
                          <td className="p-3 text-sm font-semibold text-[var(--cetso-text-2)]">{s.yearLevel}</td>
                          <td className="p-3">
                            <span
                              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold"
                              style={{
                                background: 'rgba(34,197,94,0.10)',
                                border: '1px solid rgba(34,197,94,0.28)',
                                color: 'rgba(134,239,172,0.90)',
                              }}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              Active
                            </span>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 text-xs font-medium text-[var(--cetso-text-3)]">
                In production, this syncs from the Supabase <code className="font-mono">students</code> table.
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  )
}
