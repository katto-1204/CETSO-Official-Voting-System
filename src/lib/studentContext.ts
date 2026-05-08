import { getMockSession } from './mockSession'
import type { ProgramCode, YearLevel } from '../mocks/mockStudents'

export type StudentContext = {
  studentId: string
  studentName: string
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
    studentName: session.studentName,
    programCode: session.programCode,
    yearLevel: session.yearLevel,
  }
}

