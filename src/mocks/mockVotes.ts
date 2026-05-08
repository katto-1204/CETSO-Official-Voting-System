import type { ProgramCode, YearLevel } from './mockStudents'
import { ELECTION } from './mockElection'

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
  // For system verification later (receipt page never renders candidate identities).
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

function storageKeyForStudent(studentId: string) {
  return `cetso_mock_vote_${studentId}`
}

function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function writeJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

function generateVerificationCode() {
  // Readable-ish code: 4 groups of 4 alphanumerics.
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const chunk = () =>
    Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join(
      ''
    )
  return `${chunk()}-${chunk()}-${chunk()}-${chunk()}`
}

export function getMockVoteSubmission(studentId: string) {
  return readJSON<VoteSubmission>(storageKeyForStudent(studentId))
}

export function isVoteAlreadySubmitted(studentId: string) {
  return Boolean(getMockVoteSubmission(studentId))
}

export function submitMockVote(params: {
  studentName: string
  studentId: string
  programCode: ProgramCode
  yearLevel: YearLevel
  selections: VoteSelection[]
}) {
  const existing = getMockVoteSubmission(params.studentId)
  if (existing) return { ok: false as const, reason: 'already_submitted' }

  const submittedAt = new Date().toISOString()
  const verificationCode = generateVerificationCode()

  const receipt: VoteReceipt = {
    studentName: params.studentName,
    studentId: params.studentId,
    programCode: params.programCode,
    yearLevel: params.yearLevel,
    timestamp: submittedAt,
    verificationCode,
    electionYear: ELECTION.electionYear,
    selections: params.selections,
  }

  const submission: VoteSubmission = {
    electionId: ELECTION.electionId,
    studentId: params.studentId,
    submittedAt,
    receipt,
    selections: params.selections,
  }

  writeJSON(storageKeyForStudent(params.studentId), submission)
  return { ok: true as const, submission }
}

