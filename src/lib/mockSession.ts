import type { ProgramCode, YearLevel } from '../mocks/mockStudents'
import { findStudentById } from './studentRegistry'

export type MockSession = {
  role: 'student' | 'admin'
  studentId: string | null
  studentName: string | null
  programCode: ProgramCode | null
  yearLevel: YearLevel | null
}

const KEYS = {
  role: 'cetso_role',
  studentId: 'cetso_student_id',
  studentName: 'cetso_student_name',
  programCode: 'cetso_program_code',
  yearLevel: 'cetso_year_level',
} as const

export function getMockSession(): MockSession {
  const role = (localStorage.getItem(KEYS.role) as MockSession['role'] | null) ?? 'student'
  const studentId = localStorage.getItem(KEYS.studentId)
  const studentName = localStorage.getItem(KEYS.studentName)
  const programCode = localStorage.getItem(KEYS.programCode) as ProgramCode | null
  const yearLevelRaw = localStorage.getItem(KEYS.yearLevel)
  const yearLevel = (yearLevelRaw ? (Number(yearLevelRaw) as YearLevel) : null) as YearLevel | null

  return {
    role,
    studentId: studentId ?? null,
    studentName: studentName ?? null,
    programCode: programCode ?? null,
    yearLevel,
  }
}

export function setMockSession(session: Omit<MockSession, never>) {
  localStorage.setItem(KEYS.role, session.role)
  if (session.studentId) localStorage.setItem(KEYS.studentId, session.studentId)
  else localStorage.removeItem(KEYS.studentId)

  if (session.studentName) localStorage.setItem(KEYS.studentName, session.studentName)
  else localStorage.removeItem(KEYS.studentName)

  if (session.programCode) localStorage.setItem(KEYS.programCode, session.programCode)
  else localStorage.removeItem(KEYS.programCode)

  if (session.yearLevel) localStorage.setItem(KEYS.yearLevel, String(session.yearLevel))
  else localStorage.removeItem(KEYS.yearLevel)
}

export function clearMockSession() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
}

/* ═══════════════════════════════════════════════
   LOGIN HELPERS
   ═══════════════════════════════════════════════ */

type LoginResult =
  | { ok: true; role: 'student' | 'admin'; studentId: string; studentName: string; programCode: ProgramCode; yearLevel: YearLevel; error?: undefined }
  | { ok: false; error: string; role?: undefined; studentId?: undefined; studentName?: undefined; programCode?: undefined; yearLevel?: undefined }

/** Hard-coded admin credentials */
const ADMIN_ID = '598ADMIN'
const ADMIN_PW = 'CETSO2026'

/**
 * Authenticate a student (or admin) by ID + password.
 * Returns an enriched object on success that can be fed to `setSession`.
 */
export function login(studentId: string, password: string): LoginResult {
  // Admin shortcut
  if (studentId.toUpperCase() === ADMIN_ID && password === ADMIN_PW) {
    return {
      ok: true,
      role: 'admin',
      studentId: ADMIN_ID,
      studentName: 'CETSO Admin',
      programCode: 'BSIT' as ProgramCode,
      yearLevel: 1 as YearLevel,
    }
  }

  const student = findStudentById(studentId)
  if (!student) return { ok: false, error: 'Student ID not found.' }
  if (student.password !== password) return { ok: false, error: 'Incorrect password.' }

  return {
    ok: true,
    role: 'student',
    studentId: student.studentId,
    studentName: student.fullName,
    programCode: student.programCode,
    yearLevel: student.yearLevel,
  }
}

/** Convenience alias: persist a successful login result into the session. */
export function setSession(result: LoginResult) {
  if (!result.ok) return
  setMockSession({
    role: result.role,
    studentId: result.studentId,
    studentName: result.studentName,
    programCode: result.programCode,
    yearLevel: result.yearLevel,
  })
}
