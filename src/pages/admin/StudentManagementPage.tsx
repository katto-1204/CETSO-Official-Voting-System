import { useEffect, useState, useMemo } from 'react'
import type { ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, GraduationCap, Plus, CheckCircle2, Search, X, UserCheck, UserX, Trash2, Loader2, Clock3 } from 'lucide-react'
import * as XLSX from 'xlsx'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import TextField from '../../components/ui/TextField'
import Modal from '../../components/ui/Modal'
import { supabase } from '../../lib/supabase'
import { expectedHcdcEmailFromName, isValidHcdcEmail, normalizeHcdcEmail } from '../../lib/hcdcEmail'
import { isValidStudentId } from '../../lib/studentTypes'
import type { ProgramCode, YearLevel } from '../../lib/studentTypes'

const PROGRAM_COLORS: Record<string, string> = { BSIT: 'rgba(255,122,24,0.14)', BLIS: 'rgba(167,139,250,0.14)', BSCpE: 'rgba(45,212,191,0.14)', BSECE: 'rgba(96,165,250,0.14)' }
const PROGRAM_BORDERS: Record<string, string> = { BSIT: 'rgba(255,122,24,0.30)', BLIS: 'rgba(167,139,250,0.30)', BSCpE: 'rgba(45,212,191,0.30)', BSECE: 'rgba(96,165,250,0.30)' }
const PROGRAM_TEXT: Record<string, string> = { BSIT: '#ff7a18', BLIS: '#a78bfa', BSCpE: '#2dd4bf', BSECE: '#60a5fa' }

type VoteFilter = 'all' | 'voted' | 'not-voted' | 'pending'
type VoteStatus = Exclude<VoteFilter, 'all'>

type AdminStudent = {
  studentId: string
  email: string
  authUserId: string
  googleEmail: string
  fullName: string
  programCode: ProgramCode
  yearLevel: YearLevel
}

type VoteRecord = {
  studentId: string
  authUserId: string
  googleEmail: string
}

function mapDbStudent(row: any): AdminStudent {
  return {
    studentId: row.student_id,
    email: row.email ?? '',
    authUserId: row.auth_user_id ?? '',
    googleEmail: row.google_email ?? '',
    fullName: row.full_name,
    programCode: row.program_code,
    yearLevel: row.year_level,
  }
}

function mapDbVote(row: any): VoteRecord {
  return {
    studentId: row.student_id ?? '',
    authUserId: row.auth_user_id ?? '',
    googleEmail: row.google_email ?? '',
  }
}

function normalizeLookup(value: string) {
  return value.trim().toLowerCase()
}

function hasCompleteVotingProfile(student: AdminStudent) {
  return Boolean(
    isValidStudentId(student.studentId) &&
    student.fullName.trim() &&
    student.programCode &&
    student.yearLevel
  )
}

function getVoteStatus(student: AdminStudent, votedStudentIds: Set<string>, votedAuthUserIds: Set<string>, votedEmails: Set<string>): VoteStatus {
  const studentId = normalizeLookup(student.studentId)
  const authUserId = normalizeLookup(student.authUserId)
  const googleEmail = normalizeLookup(student.googleEmail)
  const email = normalizeLookup(student.email)

  if (
    votedStudentIds.has(studentId) ||
    (authUserId && votedStudentIds.has(authUserId)) ||
    (googleEmail && votedStudentIds.has(googleEmail)) ||
    (email && votedStudentIds.has(email)) ||
    (authUserId && votedAuthUserIds.has(authUserId)) ||
    (googleEmail && votedEmails.has(googleEmail)) ||
    (email && votedEmails.has(email))
  ) {
    return 'voted'
  }

  return hasCompleteVotingProfile(student) ? 'not-voted' : 'pending'
}

const VOTE_STATUS_LABELS: Record<VoteStatus, string> = {
  voted: 'Voted',
  'not-voted': 'Not Voted',
  pending: 'Pending',
}

export default function StudentManagementPage() {
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const [students, setStudents] = useState<AdminStudent[]>([])
  const [votedStudentIds, setVotedStudentIds] = useState<Set<string>>(() => new Set())
  const [votedAuthUserIds, setVotedAuthUserIds] = useState<Set<string>>(() => new Set())
  const [votedEmails, setVotedEmails] = useState<Set<string>>(() => new Set())
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    type: 'single' | 'bulk' | 'all'
    title: string
    message: string
    confirmText: string
    doubleConfirmPhrase?: string
    onConfirm: () => Promise<void>
  }>({
    isOpen: false,
    type: 'single',
    title: '',
    message: '',
    confirmText: 'Purge Record',
    onConfirm: async () => {},
  })
  const [typedPhrase, setTypedPhrase] = useState('')
  const [pendingFileName, setPendingFileName] = useState('')
  const [pendingStudents, setPendingStudents] = useState<AdminStudent[]>([])
  const [loadConfirmOpen, setLoadConfirmOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [fileLoading, setFileLoading] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [programFilter, setProgramFilter] = useState<string>('all')
  const [voteFilter, setVoteFilter] = useState<VoteFilter>('all')

  // Manual add
  const [manualId, setManualId] = useState('')
  const [manualEmail, setManualEmail] = useState('')
  const [manualName, setManualName] = useState('')
  const [manualProgram, setManualProgram] = useState<ProgramCode>('BSIT')
  const [manualYear, setManualYear] = useState<YearLevel>(1)
  const [manualSuccess, setManualSuccess] = useState(false)
  const [manualError, setManualError] = useState<string | null>(null)

  async function loadStudents() {
    setLoadingStudents(true)
    setMessage(null)

    // Try with email column first, fall back without it if column doesn't exist
    let studentRows: any[] | null = null
    let studentError: any = null

    const result1 = await supabase
      .from('students')
      .select('student_id, email, auth_user_id, google_email, full_name, program_code, year_level')
      .order('student_id', { ascending: true })
    studentRows = result1.data
    studentError = result1.error

    if (studentError?.code === '42703' || studentError?.code === 'PGRST204') {
      // email column doesn't exist — query without it
      const result2 = await supabase
        .from('students')
        .select('student_id, email, full_name, program_code, year_level')
        .order('student_id', { ascending: true })
      studentRows = result2.data
      studentError = result2.error
    }

    if (studentError?.code === '42703' || studentError?.code === 'PGRST204') {
      const result3 = await supabase
        .from('students')
        .select('student_id, full_name, program_code, year_level')
        .order('student_id', { ascending: true })
      studentRows = result3.data
      studentError = result3.error
    }

    if (studentError) {
      console.error('Error loading students:', studentError)
      setMessage(studentError.code === '42501'
        ? 'Supabase blocked student roster access. Run supabase/fix-live-database.sql.'
        : studentError.message)
      setStudents([])
      setLoadingStudents(false)
      return
    }

    let voteRows: any[] | null = null
    let voteError: any = null

    const voteResult1 = await supabase
      .from('votes')
      .select('student_id, auth_user_id, google_email')
    voteRows = voteResult1.data
    voteError = voteResult1.error

    if (voteError?.code === '42703' || voteError?.code === 'PGRST204') {
      const voteResult2 = await supabase
        .from('votes')
        .select('student_id')
      voteRows = voteResult2.data
      voteError = voteResult2.error
    }

    if (voteError) {
      console.error('Error loading votes:', voteError)
      setVotedStudentIds(new Set())
      setVotedAuthUserIds(new Set())
      setVotedEmails(new Set())
    } else {
      const votes = (voteRows ?? []).map(mapDbVote)
      setVotedStudentIds(new Set(votes.map((vote) => normalizeLookup(vote.studentId)).filter(Boolean)))
      setVotedAuthUserIds(new Set(votes.map((vote) => normalizeLookup(vote.authUserId)).filter(Boolean)))
      setVotedEmails(new Set(votes.map((vote) => normalizeLookup(vote.googleEmail)).filter(Boolean)))
    }

    setStudents((studentRows ?? []).map(mapDbStudent))
    setLoadingStudents(false)
  }

  useEffect(() => {
    loadStudents()
  }, [])

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return students.filter((s) => {
      const matchQuery = !q || s.studentId.toLowerCase().includes(q) || s.fullName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
      const matchProgram = programFilter === 'all' || s.programCode === programFilter
      const status = getVoteStatus(s, votedStudentIds, votedAuthUserIds, votedEmails)
      const matchVote = voteFilter === 'all' || voteFilter === status
      return matchQuery && matchProgram && matchVote
    })
  }, [students, searchQuery, programFilter, voteFilter, votedStudentIds, votedAuthUserIds, votedEmails])

  const statusCounts = useMemo(() => {
    return students.reduce(
      (counts, student) => {
        counts[getVoteStatus(student, votedStudentIds, votedAuthUserIds, votedEmails)] += 1
        return counts
      },
      { voted: 0, 'not-voted': 0, pending: 0 } as Record<VoteStatus, number>
    )
  }, [students, votedStudentIds, votedAuthUserIds, votedEmails])
  const votedCount = statusCounts.voted
  const notVotedCount = statusCounts['not-voted']
  const pendingCount = statusCounts.pending
  const statusFilters: Array<{ value: VoteFilter; label: string; count: number; color: string }> = [
    { value: 'all', label: 'All', count: students.length, color: 'var(--cetso-orange)' },
    { value: 'voted', label: 'Voted', count: votedCount, color: '#22c55e' },
    { value: 'not-voted', label: 'Not Voted', count: notVotedCount, color: '#ef4444' },
    { value: 'pending', label: 'Pending', count: pendingCount, color: '#f59e0b' },
  ]

  function normalizeProgram(value: unknown): ProgramCode | null {
    const raw = String(value ?? '').trim()
    if (!raw) return null
    const normalized = raw.replace(/\s+/g, '').toUpperCase()
    const lower = raw.toLowerCase()

    // Direct abbreviation match
    if (normalized === 'BSIT') return 'BSIT'
    if (normalized === 'BLIS') return 'BLIS'
    if (normalized === 'BSCPE' || normalized === 'BSPE') return 'BSCpE'
    if (normalized === 'BSECE') return 'BSECE'

    // Full program name keyword match
    if (lower.includes('information technology')) return 'BSIT'
    if (lower.includes('library') && lower.includes('information science')) return 'BLIS'
    if (lower.includes('computer engineering') || lower.includes('computer eng')) return 'BSCpE'
    if (lower.includes('electronics') && lower.includes('communication')) return 'BSECE'
    if (lower.includes('electronics engineering')) return 'BSECE'

    // Partial abbreviation match
    if (normalized.includes('BSIT')) return 'BSIT'
    if (normalized.includes('BLIS')) return 'BLIS'
    if (normalized.includes('BSCPE') || normalized.includes('CPE')) return 'BSCpE'
    if (normalized.includes('BSECE') || normalized.includes('ECE')) return 'BSECE'

    return null
  }

  function normalizeYear(value: unknown): YearLevel | null {
    const match = String(value ?? '').match(/[1-4]/)
    if (!match) return null
    return Number(match[0]) as YearLevel
  }

  /**
   * Find the actual column key in headers that matches one of our aliases.
   * Uses exact normalized match first, then substring containment as fallback.
   * Returns the ORIGINAL key string (for use with row[key]).
   */
  function findColumnKey(headers: string[], ...aliases: string[]): string | null {
    // Pass 1: exact normalized match
    for (const alias of aliases) {
      const aliasNorm = alias.toLowerCase().replace(/[^a-z0-9]/g, '')
      const found = headers.find((h) => h.toLowerCase().replace(/[^a-z0-9]/g, '') === aliasNorm)
      if (found) return found
    }
    // Pass 2: containment match, only for aliases >= 5 chars and similar-length headers
    for (const alias of aliases) {
      const aliasNorm = alias.toLowerCase().replace(/[^a-z0-9]/g, '')
      if (aliasNorm.length < 5) continue
      const found = headers.find((h) => {
        const hNorm = h.toLowerCase().replace(/[^a-z0-9]/g, '')
        // Only allow containment if lengths are similar (within 2x)
        const ratio = Math.max(hNorm.length, aliasNorm.length) / Math.max(1, Math.min(hNorm.length, aliasNorm.length))
        if (ratio > 2) return false
        return hNorm.includes(aliasNorm) || aliasNorm.includes(hNorm)
      })
      if (found) return found
    }
    return null
  }

  /** Read a cell value as a trimmed string, given the original column key */
  function cellStr(row: Record<string, unknown>, key: string | null): string {
    if (!key) return ''
    return String(row[key] ?? '').trim()
  }

  /** Check if column headers look like student data (at least 2 of 3 field groups present) */
  function looksLikeStudentRow(cols: string[]): boolean {
    const joined = cols.map((c) => c.toLowerCase()).join(' ')
    const hasId = /id|control|number|student/.test(joined)
    const hasName = /name|first|last|surname/.test(joined)
    const hasProgram = /program|course|dept/.test(joined)
    return (hasId ? 1 : 0) + (hasName ? 1 : 0) + (hasProgram ? 1 : 0) >= 2
  }

  async function parseStudentFile(file: File): Promise<AdminStudent[]> {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]

    // Auto-detect header row (some files have title/merged rows before the real headers)
    let rows: Record<string, unknown>[] = []
    let allHeaders: string[] = []

    for (const skip of [0, 1, 2, 3, 4, 5]) {
      const range = XLSX.utils.decode_range(firstSheet['!ref'] || 'A1')
      range.s.r = skip
      const parsed = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '', range })
      if (!parsed.length) continue

      const cols = Object.keys(parsed[0])
      if (looksLikeStudentRow(cols)) {
        rows = parsed
        allHeaders = cols
        break
      }
      if (skip === 0) {
        rows = parsed
        allHeaders = cols
      }
    }

    if (!rows.length) throw new Error('No data rows found in the file.')

    // Filter out __EMPTY columns generated by xlsx for blank headers
    const headers = allHeaders.filter((h) => !h.startsWith('__EMPTY'))

    console.log('Detected Excel columns:', headers)

    // ── Pre-map columns ONCE ──────────────────────────────────────────
    const idCol        = findColumnKey(headers, 'ID Number', 'Student ID', 'Student Number', 'ID No', 'Student ID No')
    const firstNameCol = findColumnKey(headers, 'First Name', '1st Name', 'Given Name')
    const lastNameCol  = findColumnKey(headers, 'Last Name', 'Surname', 'Family Name')
    const middleCol    = findColumnKey(headers, 'Middle Name', 'Middle Initial', 'MI', 'M.I.')
    const fullNameCol  = findColumnKey(headers, 'Full Name', 'Student Name')
    const emailCol     = findColumnKey(headers, 'HCDC Email', 'Email Address', 'Student Email', 'School Email', 'Email')
    const programCol   = findColumnKey(headers, 'Program', 'Program Code', 'Course', 'Department')
    const yearCol      = findColumnKey(headers, 'Year Level', 'Year', 'Yr Level')

    console.log('Column mapping:', { idCol, firstNameCol, lastNameCol, middleCol, fullNameCol, emailCol, programCol, yearCol })

    // ── Parse each row using the pre-mapped keys ─────────────────────
    return rows.map((row, index) => {
      const studentId = cellStr(row, idCol)

      // Build full name: prefer "Full Name" column, else combine first + middle + last
      let fullName = cellStr(row, fullNameCol)
      if (!fullName) {
        const first  = cellStr(row, firstNameCol)
        const middle = cellStr(row, middleCol)
        const last   = cellStr(row, lastNameCol)
        fullName = [first, middle, last].filter(Boolean).join(' ')
      }

      const providedEmail = cellStr(row, emailCol)
      const programCode   = normalizeProgram(programCol ? row[programCol] : '')
      const yearLevel     = normalizeYear(yearCol ? row[yearCol] : '')

      // Generate email from name if none provided — but don't require it
      let email = ''
      if (providedEmail) {
        email = normalizeHcdcEmail(providedEmail)
      } else {
        const generated = expectedHcdcEmailFromName(fullName)
        if (generated && isValidHcdcEmail(generated)) email = generated
      }

      if (!studentId || !fullName || !programCode || !yearLevel) {
        const missing = [
          !studentId && 'Student ID',
          !fullName && 'Name',
          !programCode && 'Program',
          !yearLevel && 'Year Level',
        ].filter(Boolean).join(', ')
        throw new Error(
          `Row ${index + 2} is missing: ${missing}.\n\nDetected columns: ${headers.join(', ')}\nMapped → ID: ${idCol ?? '✗'}, Name: ${fullNameCol ?? (firstNameCol ? firstNameCol + '+' : '✗')}, Program: ${programCol ?? '✗'}, Year: ${yearCol ?? '✗'}\n\nRaw row values: ID="${cellStr(row, idCol)}", Program="${cellStr(row, programCol)}", Year="${cellStr(row, yearCol)}"`
        )
      }
      if (!isValidStudentId(studentId)) {
        throw new Error(`Row ${index + 2} has invalid student ID "${studentId}" (must be 8 numbers and start with "598").`)
      }

      return { studentId, email, authUserId: '', googleEmail: '', fullName, programCode, yearLevel }
    })
  }

  async function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setMessage(null)
    setProgress(0)
    setFileLoading(true)
    try {
      const parsed = await parseStudentFile(file)
      if (!parsed.length) {
        setUploadError('No student rows found in the selected file.')
        return
      }
      setPendingFileName(file.name)
      setPendingStudents(parsed)
      setLoadConfirmOpen(true)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Could not read the selected file.')
    } finally {
      setFileLoading(false)
      e.target.value = ''
    }
  }

  async function loadPendingStudents() {
    if (!pendingStudents.length) return
    setImporting(true)
    setProgress(25)
    setUploadError(null)

    const rowsWithEmail = pendingStudents.map((student) => ({
      student_id: student.studentId,
      email: student.email || null,
      full_name: student.fullName,
      program_code: student.programCode,
      year_level: student.yearLevel,
    }))

    setProgress(60)
    let { error } = await supabase.from('students').upsert(rowsWithEmail, { onConflict: 'student_id' })

    // If email column doesn't exist, retry without it
    if (error && (error.code === 'PGRST204' || error.code === '42703') && String(error.message).includes('email')) {
      const rowsNoEmail = pendingStudents.map((student) => ({
        student_id: student.studentId,
        full_name: student.fullName,
        program_code: student.programCode,
        year_level: student.yearLevel,
      }))
      const retry = await supabase.from('students').upsert(rowsNoEmail, { onConflict: 'student_id' })
      error = retry.error
    }

    if (error) {
      console.error('Error loading student file:', error)
      setUploadError(error.code === '42501'
        ? 'Supabase blocked student loading. Run supabase/fix-live-database.sql.'
        : error.message || 'Students could not be loaded.')
      setImporting(false)
      return
    }

    setProgress(100)
    await loadStudents()
    setImporting(false)
    setPreviewOpen(false)
    setPendingFileName('')
    setPendingStudents([])
    setMessage('Students loaded.')
  }

  async function addStudentManually() {
    setManualError(null)
    const email = manualEmail.trim() ? normalizeHcdcEmail(manualEmail) : ''
    if (!manualId.trim() || !manualName.trim()) { setManualError('Student ID and name are required.'); return }
    if (!isValidStudentId(manualId.trim())) { setManualError('Student ID must be 8 numbers and start with "598".'); return }
    if (email && !isValidHcdcEmail(email)) { setManualError('Use a valid HCDC email (firstname.lastname@hcdc.edu.ph) or leave blank.'); return }

    const studentData: Record<string, unknown> = {
      student_id: manualId.trim(),
      full_name: manualName.trim(),
      program_code: manualProgram,
      year_level: manualYear,
    }
    if (email) studentData.email = email

    let { error } = await supabase.from('students').insert(studentData)

    // If email column doesn't exist, retry without it
    if (error && (error.code === 'PGRST204' || error.code === '42703') && String(error.message).includes('email')) {
      delete studentData.email
      const retry = await supabase.from('students').insert(studentData)
      error = retry.error
    }

    if (error) {
      console.error('Error adding student:', error)
      setManualError(error.code === '42501'
        ? 'Supabase blocked student creation. Run supabase/fix-live-database.sql.'
        : error.message || 'Failed.')
      return
    }

    await loadStudents()
    setManualId(''); setManualEmail(''); setManualName(''); setManualProgram('BSIT'); setManualYear(1)
    setManualSuccess(true)
    setTimeout(() => setManualSuccess(false), 3000)
  }

  async function executeDeleteStudent(student: AdminStudent) {
    setDeletingId(student.studentId)
    setMessage(null)

    const { error: voteError } = await supabase
      .from('votes')
      .delete()
      .eq('student_id', student.studentId)

    if (voteError) {
      console.error('Error deleting student vote:', voteError)
      setMessage(voteError.code === '42501'
        ? 'Supabase blocked vote deletion. Run supabase/fix-live-database.sql.'
        : voteError.message)
      setDeletingId(null)
      return
    }

    const { error: studentError } = await supabase
      .from('students')
      .delete()
      .eq('student_id', student.studentId)

    if (studentError) {
      console.error('Error deleting student:', studentError)
      setMessage(studentError.code === '42501'
        ? 'Supabase blocked student deletion. Run supabase/fix-live-database.sql.'
        : studentError.message)
      setDeletingId(null)
      return
    }

    setStudents((current) => current.filter((item) => item.studentId !== student.studentId))
    setVotedStudentIds((current) => {
      const next = new Set(current)
      next.delete(normalizeLookup(student.studentId))
      return next
    })
    setVotedAuthUserIds((current) => {
      const next = new Set(current)
      next.delete(normalizeLookup(student.authUserId))
      return next
    })
    setVotedEmails((current) => {
      const next = new Set(current)
      next.delete(normalizeLookup(student.googleEmail))
      next.delete(normalizeLookup(student.email))
      return next
    })
    setMessage('Student deleted.')
    setDeletingId(null)
  }

  function deleteStudent(student: AdminStudent) {
    setDeleteConfirm({
      isOpen: true,
      type: 'single',
      title: 'DELETE STUDENT RECORD',
      message: `Delete ${student.fullName} (${student.studentId})? This also removes their vote record if one exists.`,
      confirmText: 'Purge Student',
      onConfirm: async () => {
        await executeDeleteStudent(student)
      }
    })
  }

  return (
    <div className="space-y-5">
        <Modal 
          isOpen={deleteConfirm.isOpen} 
          onClose={() => {
            setDeleteConfirm(prev => ({ ...prev, isOpen: false }))
            setTypedPhrase('')
          }} 
          title={deleteConfirm.title} 
          maxWidth="max-w-md"
        >
          <div className="space-y-6">
            <div className="flex items-start gap-4 bg-red-500/5 border border-red-500/10 rounded-2xl p-5">
              <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold uppercase tracking-wider text-red-400">Irreversible Action</h4>
                <p className="text-xs font-semibold text-white/70 leading-relaxed">
                  {deleteConfirm.message}
                </p>
              </div>
            </div>

            {deleteConfirm.doubleConfirmPhrase && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 block">
                  Type "<span className="text-red-400 font-mono select-none">{deleteConfirm.doubleConfirmPhrase}</span>" to confirm:
                </label>
                <input
                  type="text"
                  value={typedPhrase}
                  onChange={(e) => setTypedPhrase(e.target.value)}
                  placeholder="TYPE CONFIRMATION PHRASE..."
                  className="w-full border rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-widest placeholder:opacity-40 focus:outline-none transition-all"
                  style={{
                    background: 'var(--cetso-input-bg)',
                    border: '1px solid var(--cetso-border)',
                    color: 'var(--cetso-text)'
                  }}
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                className="flex-1 h-12" 
                onClick={() => {
                  setDeleteConfirm(prev => ({ ...prev, isOpen: false }))
                  setTypedPhrase('')
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                className="flex-1 h-12" 
                disabled={deleteConfirm.doubleConfirmPhrase ? typedPhrase !== deleteConfirm.doubleConfirmPhrase : false}
                onClick={async () => {
                  await deleteConfirm.onConfirm()
                  setDeleteConfirm(prev => ({ ...prev, isOpen: false }))
                  setTypedPhrase('')
                }}
              >
                {deleteConfirm.confirmText}
              </Button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={loadConfirmOpen} onClose={() => setLoadConfirmOpen(false)} title="LOAD STUDENTS" maxWidth="max-w-lg">
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-white">Load students from this file?</p>
              <p className="mt-2 text-sm text-white/60">{pendingFileName} contains {pendingStudents.length} student{pendingStudents.length === 1 ? '' : 's'} ready for preview.</p>
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setLoadConfirmOpen(false)}>No</Button>
              <Button variant="primary" onClick={() => { setLoadConfirmOpen(false); setPreviewOpen(true) }}>Yes</Button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} title="Students Preview" maxWidth="max-w-5xl">
          <div className="space-y-5">
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr className="bg-white/5">
                    {['Control / ID Number', 'HCDC Email', 'Full Name', 'Program', 'Year Level'].map((heading) => (
                      <th key={heading} className="p-3 text-left text-[10px] font-bold uppercase tracking-widest text-white/50">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pendingStudents.map((student) => (
                    <tr key={student.studentId} className="border-t border-white/10">
                      <td className="p-3 font-mono text-xs font-bold text-white">{student.studentId}</td>
                      <td className="p-3 text-xs font-semibold text-white/75">{student.email}</td>
                      <td className="p-3 text-sm font-semibold text-white">{student.fullName}</td>
                      <td className="p-3 text-xs font-bold text-white/75">{student.programCode}</td>
                      <td className="p-3 text-xs font-bold text-white/75">Year {student.yearLevel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {uploadError && (
              <div className="rounded-2xl border border-[var(--cetso-error-border)] bg-[var(--cetso-error-bg)] p-3 text-xs font-semibold text-[var(--cetso-error-text)]">
                {uploadError}
              </div>
            )}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setPreviewOpen(false)} disabled={importing}>Cancel</Button>
              <Button variant="primary" onClick={loadPendingStudents} loading={importing}>Load Students</Button>
            </div>
          </div>
        </Modal>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[32px] p-6 border transition-colors duration-300"
          style={{ background: 'var(--cetso-surface-1)', borderColor: 'var(--cetso-border)', backdropFilter: 'blur(20px)', boxShadow: 'var(--cetso-card-shadow)' }}
        >
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl" style={{ background: 'rgba(255,122,24,0.12)', border: '1px solid rgba(255,122,24,0.28)' }}>
              <GraduationCap className="h-6 w-6 text-[var(--cetso-orange)]" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>Admin</div>
              <h1 style={{ fontFamily: 'var(--font-h1)', fontSize: 'clamp(24px, 4vw, 44px)', lineHeight: 0.93, letterSpacing: '0.01em', color: 'var(--cetso-text)', marginTop: 4 }}>
                STUDENT MANAGEMENT
              </h1>
            </div>
          </div>
          {/* Stats row */}
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { label: 'All', value: students.length, color: 'var(--cetso-orange)' },
              { label: 'Voted', value: votedCount, color: '#22c55e' },
              { label: 'Not Voted', value: notVotedCount, color: '#ef4444' },
              { label: 'Pending', value: pendingCount, color: '#f59e0b' },
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
            {/* Student file import */}
            <GlassCard className="p-5">
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>Excel / CSV Import</div>
              <div className="mt-1.5 text-xl font-black" style={{ color: 'var(--cetso-text)' }}>Bulk Upload</div>
              <div className="mt-4 rounded-2xl p-4" style={{ background: 'rgba(255,122,24,0.06)', border: '1px solid rgba(255,122,24,0.20)' }}>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[rgba(255,178,74,0.80)] mb-2">Required Columns</div>
                <div className="text-xs font-medium" style={{ color: 'var(--cetso-text-2)' }}>
                  <span className="font-bold" style={{ color: 'var(--cetso-text)' }}>ID Number</span>{' / Control Number, '}
                  <span className="font-bold" style={{ color: 'var(--cetso-text)' }}>Full Name</span>{' (or 1st Name + Last Name + Middle Name), '}
                  <span className="font-bold" style={{ color: 'var(--cetso-text)' }}>Program</span>,{' '}
                  <span className="font-bold" style={{ color: 'var(--cetso-text)' }}>Year Level</span>
                </div>
                <div className="text-[10px] font-medium mt-1" style={{ color: 'var(--cetso-text-3)' }}>Optional: HCDC Email</div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--cetso-text)' }}>
                  <UploadCloud className="inline h-4 w-4 mr-1.5 opacity-70" /> Upload Excel / CSV
                </label>
                <div className="relative flex items-center gap-3 rounded-2xl p-4" style={{ background: 'var(--cetso-input-bg)', border: '1px solid var(--cetso-border)' }}>
                  {fileLoading ? (
                    <Loader2 className="h-5 w-5 shrink-0 text-[var(--cetso-orange)] animate-spin" />
                  ) : (
                    <UploadCloud className="h-5 w-5 shrink-0 text-[var(--cetso-orange)]" />
                  )}
                  <input type="file" accept=".xlsx,.xls,.csv,text/csv" onChange={onFileChange} disabled={importing || fileLoading} className="text-xs" style={{ color: 'var(--cetso-text-2)' }} />
                </div>
                {fileLoading && (
                  <div className="mt-2 flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--cetso-orange)]" />
                    <span className="text-xs font-semibold" style={{ color: 'var(--cetso-text-2)' }}>Reading file…</span>
                  </div>
                )}
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
                {!importing && uploadError && (
                  <motion.div key="upload-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="mt-4 rounded-2xl p-3"
                    style={{ background: 'var(--cetso-error-bg)', border: '1px solid var(--cetso-error-border)' }}
                  >
                    <div className="text-xs font-semibold" style={{ color: 'var(--cetso-error-text)' }}>{uploadError}</div>
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
                <TextField label="HCDC Email" type="email" value={manualEmail} onChange={(e) => setManualEmail(e.target.value)} placeholder="firstname.lastname@hcdc.edu.ph" error={manualError && manualError.includes('email') ? manualError : undefined} />
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
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.10 }} className="min-w-0 max-w-full lg:col-span-8">
            <GlassCard className="min-w-0 max-w-full p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>Roster</div>
              <div className="mt-1 text-xl font-black" style={{ color: 'var(--cetso-text)' }}>{loadingStudents ? 'Loading students...' : `Students (${filteredStudents.length})`}</div>
                </div>
              </div>

              {/* Search & Filters */}
              <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-[minmax(0,1fr)_180px_180px] xl:grid-cols-[minmax(0,1fr)_180px_200px]">
                <div className="relative">
                  <TextField name="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search ID, email, or name..." />
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
                  <option value="all">All Vote Status</option>
                  <option value="voted">Voted</option>
                  <option value="not-voted">Not Voted</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {statusFilters.map((filter) => {
                  const active = voteFilter === filter.value
                  return (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => setVoteFilter(filter.value)}
                      className="rounded-2xl border px-3 py-2 text-left transition-all"
                      style={{
                        background: active ? 'rgba(255,122,24,0.12)' : 'var(--cetso-input-bg)',
                        borderColor: active ? 'rgba(255,122,24,0.35)' : 'var(--cetso-border)',
                        color: 'var(--cetso-text)',
                      }}
                    >
                      <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>
                        {filter.label}
                      </div>
                      <div className="text-lg font-black" style={{ color: filter.color }}>
                        {filter.count}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Table */}
              <div className="w-full max-w-full overflow-x-auto overflow-y-visible rounded-2xl custom-scrollbar" style={{ border: '1px solid var(--cetso-border)' }}>
                <table className="w-full min-w-[1000px] border-collapse">
                  <thead>
                    <tr style={{ background: 'var(--cetso-input-bg)' }}>
                      <th className="w-[120px] p-3 text-left text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>Student ID</th>
                      <th className="min-w-[220px] p-3 text-left text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>Full Name</th>
                      <th className="min-w-[240px] p-3 text-left text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>Email</th>
                      <th className="w-[100px] p-3 text-left text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>Program</th>
                      <th className="w-[80px] p-3 text-left text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>Year</th>
                      <th className="w-[140px] p-3 text-left text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>Vote Status</th>
                      <th
                        className="sticky right-0 z-10 w-[130px] min-w-[130px] p-3 text-left text-[10px] font-bold uppercase tracking-widest"
                        style={{
                          color: 'var(--cetso-text-3)',
                          background: 'var(--cetso-input-bg)',
                          boxShadow: '-12px 0 18px rgba(0,0,0,0.18)',
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s, i) => {
                      const inits = s.fullName.split(' ').slice(0, 2).map((p) => p[0]).join('')
                      const status = getVoteStatus(s, votedStudentIds, votedAuthUserIds, votedEmails)
                      const badgeStyle =
                        status === 'voted'
                          ? {
                              background: 'var(--cetso-success-bg)',
                              border: '1px solid var(--cetso-success-border)',
                              color: 'var(--cetso-success-text)',
                            }
                          : status === 'pending'
                            ? {
                                background: 'rgba(245,158,11,0.10)',
                                border: '1px solid rgba(245,158,11,0.28)',
                                color: '#f59e0b',
                              }
                            : {
                                background: 'rgba(239,68,68,0.10)',
                                border: '1px solid rgba(239,68,68,0.28)',
                                color: '#f87171',
                              }
                      const StatusIcon = status === 'voted' ? UserCheck : status === 'pending' ? Clock3 : UserX
                      return (
                        <motion.tr key={s.studentId} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 + i * 0.02 }}
                          style={{ borderTop: '1px solid var(--cetso-border)' }}
                          className="group transition hover:bg-black/5 focus-within:bg-black/5 dark:hover:bg-white/5 dark:focus-within:bg-white/5"
                        >
                          <td className="p-3 font-mono text-xs font-bold" style={{ color: 'var(--cetso-text)' }}>{s.studentId}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[10px] font-black"
                                style={{ background: PROGRAM_COLORS[s.programCode] ?? 'var(--cetso-surface-3)', border: `1px solid ${PROGRAM_BORDERS[s.programCode] ?? 'var(--cetso-border)'}`, color: PROGRAM_TEXT[s.programCode] ?? 'var(--cetso-text)' }}
                              >{inits}</div>
                              <span className="text-sm font-semibold" style={{ color: 'var(--cetso-text)' }}>{s.fullName}</span>
                            </div>
                          </td>
                          <td className="p-3 text-xs font-semibold" style={{ color: 'var(--cetso-text-2)' }}>{s.email}</td>
                          <td className="p-3">
                            <span className="rounded-lg px-2.5 py-1 text-[10px] font-bold"
                              style={{ background: PROGRAM_COLORS[s.programCode], border: `1px solid ${PROGRAM_BORDERS[s.programCode]}`, color: PROGRAM_TEXT[s.programCode] }}
                            >{s.programCode}</span>
                          </td>
                          <td className="p-3 text-sm font-semibold" style={{ color: 'var(--cetso-text-2)' }}>{s.yearLevel}</td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold"
                              style={badgeStyle}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {VOTE_STATUS_LABELS[status]}
                            </span>
                          </td>
                          <td
                            className="sticky right-0 z-[1] p-3"
                            style={{
                              background: 'var(--cetso-surface-1)',
                              boxShadow: '-12px 0 18px rgba(0,0,0,0.18)',
                            }}
                          >
                            <div className="opacity-100 transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                              <Button
                                variant="danger"
                                size="sm"
                                className="whitespace-nowrap"
                                onClick={() => deleteStudent(s)}
                                loading={deletingId === s.studentId}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </Button>
                            </div>
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
