import { parseProgramCode, type ProgramCode, type YearLevel } from './studentTypes'

export type MockSession = {
  role: 'student' | 'admin'
  studentId: string | null
  studentName: string | null
  email?: string | null
  programCode: ProgramCode | null
  yearLevel: YearLevel | null
}

const KEYS = {
  role: 'cetso_role',
  studentId: 'cetso_student_id',
  studentName: 'cetso_student_name',
  email: 'cetso_student_email',
  programCode: 'cetso_program_code',
  yearLevel: 'cetso_year_level',
} as const

export function getMockSession(): MockSession {
  const role = (localStorage.getItem(KEYS.role) as MockSession['role'] | null) ?? 'student'
  const studentId = localStorage.getItem(KEYS.studentId)
  const studentName = localStorage.getItem(KEYS.studentName)
  const email = localStorage.getItem(KEYS.email)
  const programCodeRaw = localStorage.getItem(KEYS.programCode)
  const yearLevelRaw = localStorage.getItem(KEYS.yearLevel)
  const yearLevel = yearLevelRaw ? (Number(yearLevelRaw) as YearLevel) : null

  return {
    role,
    studentId: studentId ?? null,
    studentName: studentName ?? null,
    email: email ?? null,
    programCode: parseProgramCode(programCodeRaw),
    yearLevel,
  }
}

export function setMockSession(session: MockSession) {
  localStorage.setItem(KEYS.role, session.role)
  if (session.studentId) localStorage.setItem(KEYS.studentId, session.studentId)
  else localStorage.removeItem(KEYS.studentId)

  if (session.studentName) localStorage.setItem(KEYS.studentName, session.studentName)
  else localStorage.removeItem(KEYS.studentName)

  if (session.email) localStorage.setItem(KEYS.email, session.email)
  else localStorage.removeItem(KEYS.email)

  if (session.programCode) localStorage.setItem(KEYS.programCode, session.programCode)
  else localStorage.removeItem(KEYS.programCode)

  if (session.yearLevel) localStorage.setItem(KEYS.yearLevel, String(session.yearLevel))
  else localStorage.removeItem(KEYS.yearLevel)
}

export function clearMockSession() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key))
}
