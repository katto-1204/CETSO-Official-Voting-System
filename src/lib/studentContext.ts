import { getMockSession } from './mockSession'
import type { ProgramCode, YearLevel } from './studentTypes'

export type StudentContext = {
  authUserId: string | null
  studentId: string
  studentName: string
  email: string | null
  programCode: ProgramCode
  yearLevel: YearLevel
}

export function getStudentContext(): StudentContext | null {
  const session = getMockSession()
  if (session.role !== 'student') return null
  if (!session.studentId || !session.studentName || !session.programCode || !session.yearLevel) {
    return null
  }
  return {
    studentId: session.studentId,
    authUserId: session.authUserId ?? null,
    studentName: session.studentName,
    email: session.email ?? null,
    programCode: session.programCode,
    yearLevel: session.yearLevel,
  }
}
