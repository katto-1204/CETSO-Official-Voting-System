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

export async function getVoteSubmission(studentId: string): Promise<VoteSubmission | null> {
  const { data, error } = await supabase
    .from('votes')
    .select('student_id, receipt_id, program_code, selections, created_at, students(full_name, year_level)')
    .eq('student_id', studentId)
    .maybeSingle()

  if (error) {
    console.error('Error loading vote submission:', error)
    return null
  }
  if (!data) return null

  const student = Array.isArray((data as any).students) ? (data as any).students[0] : (data as any).students
  const selections = ((data as any).selections ?? []) as VoteSelection[]
  const submittedAt = (data as any).created_at
  const programCode = (data as any).program_code as ProgramCode
  const yearLevel = (student?.year_level ?? 1) as YearLevel
  const studentName = student?.full_name ?? (data as any).student_id

  return {
    electionId: ELECTION.electionId,
    studentId: (data as any).student_id,
    submittedAt,
    selections,
    receipt: {
      studentName,
      studentId: (data as any).student_id,
      programCode,
      yearLevel,
      timestamp: submittedAt,
      verificationCode: (data as any).receipt_id,
      electionYear: ELECTION.electionYear,
      selections,
    },
  }
}

export async function hasVoteSubmission(studentId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('votes')
    .select('student_id')
    .eq('student_id', studentId)
    .maybeSingle()

  if (error) {
    console.error('Error checking vote submission:', error)
    return false
  }
  return Boolean(data)
}
