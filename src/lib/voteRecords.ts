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


async function fetchVoteSubmissionRow(studentId: string): Promise<VoteSubmissionRow | null> {
  const query = await supabase
    .from('votes')
    .select('student_id, receipt_id, program_code, selections, created_at')
    .eq('student_id', studentId)
    .maybeSingle()

  if (query.error) {
    console.error('Failed to fetch vote from votes table:', query.error)
    throw new Error(query.error.message)
  }

  if (!query.data) return null

  const row = query.data as VoteSubmissionRow

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
