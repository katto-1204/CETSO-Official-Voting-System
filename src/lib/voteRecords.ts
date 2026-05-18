import { ELECTION } from './electionData'
import { supabase } from './supabase'
import type { ProgramCode, YearLevel } from './studentTypes'

export type VoteSelection = {
  positionCode: string
  candidateId: string
}

export type VoteReceipt = {
  studentName: string
  studentId: string
  programCode: ProgramCode
  timestamp: string
  verificationCode: string
  electionYear: number
  selections: VoteSelection[]
  yearLevel: YearLevel
}

export type VoteSubmission = {
  electionId: string
  studentId: string
  submittedAt: string
  receipt: VoteReceipt
  selections: VoteSelection[]
}

type VoteSubmissionRow = {
  student_id: string
  receipt_id: string
  program_code: ProgramCode
  selections: unknown
  created_at: string
  student_full_name?: string | null
  year_level?: number | null
}

type StudentLookupRow = {
  student_id: string
  full_name: string
  year_level: number
}

function generateVerificationCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const chunk = () =>
    Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
  return `${chunk()}-${chunk()}-${chunk()}-${chunk()}`
}

export function buildVoteSubmission(params: {
  studentName: string
  studentId: string
  programCode: ProgramCode
  yearLevel: YearLevel
  selections: VoteSelection[]
}): VoteSubmission {
  const submittedAt = new Date().toISOString()
  const verificationCode = generateVerificationCode()
  return {
    electionId: ELECTION.electionId,
    studentId: params.studentId,
    submittedAt,
    selections: params.selections,
    receipt: {
      studentName: params.studentName,
      studentId: params.studentId,
      programCode: params.programCode,
      yearLevel: params.yearLevel,
      timestamp: submittedAt,
      verificationCode,
      electionYear: ELECTION.electionYear,
      selections: params.selections,
    },
  }
}

function mapVoteSubmissionRow(row: VoteSubmissionRow): VoteSubmission {
  const selections = Array.isArray(row.selections) ? (row.selections as VoteSelection[]) : []
  const submittedAt = row.created_at
  const yearLevel = (row.year_level ?? 1) as YearLevel
  const studentName = row.student_full_name ?? row.student_id

  return {
    electionId: ELECTION.electionId,
    studentId: row.student_id,
    submittedAt,
    selections,
    receipt: {
      studentName,
      studentId: row.student_id,
      programCode: row.program_code,
      yearLevel,
      timestamp: submittedAt,
      verificationCode: row.receipt_id,
      electionYear: ELECTION.electionYear,
      selections,
    },
  }
}

function isMissingRpcFunction(error: { code?: string; message?: string }) {
  const code = String(error.code ?? '')
  const message = String(error.message ?? '').toLowerCase()
  return code === 'PGRST202' || code === '42883' || message.includes('function') && message.includes('does not exist')
}

async function fetchVoteSubmissionRow(studentId: string): Promise<VoteSubmissionRow | null> {
  const rpcResponse = await supabase.rpc('get_vote_submission_by_student_id', {
    p_student_id: studentId,
  })

  if (rpcResponse.error) {
    console.warn('RPC get_vote_submission_by_student_id failed, attempting fallback table query:', rpcResponse.error)
  } else {
    const raw = rpcResponse.data as VoteSubmissionRow[] | VoteSubmissionRow | null
    if (Array.isArray(raw)) return raw[0] ?? null
    if (raw) return raw
    return null
  }

  const fallback = await supabase
    .from('votes')
    .select('student_id, receipt_id, program_code, selections, created_at')
    .eq('student_id', studentId)
    .maybeSingle()

  if (fallback.error) {
    throw new Error(fallback.error.message)
  }

  if (!fallback.data) return null

  const row = fallback.data as VoteSubmissionRow

  if (!row.student_full_name || !row.year_level) {
    const studentResponse = await supabase.rpc('get_student_by_id', {
      p_student_id: studentId,
    })

    if (!studentResponse.error) {
      const studentRaw = studentResponse.data as StudentLookupRow[] | StudentLookupRow | null
      const student = Array.isArray(studentRaw) ? studentRaw[0] ?? null : studentRaw
      if (student) {
        row.student_full_name = student.full_name
        row.year_level = student.year_level
      }
    }
  }

  return row
}

export async function getVoteSubmission(studentId: string): Promise<VoteSubmission | null> {
  const row = await fetchVoteSubmissionRow(studentId)
  return row ? mapVoteSubmissionRow(row) : null
}

export async function hasVoteSubmission(studentId: string): Promise<boolean> {
  try {
    return Boolean(await getVoteSubmission(studentId))
  } catch (error) {
    console.error('Error checking vote submission:', error)
    return false
  }
}
