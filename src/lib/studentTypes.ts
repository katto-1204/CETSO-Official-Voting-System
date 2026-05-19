export type ProgramCode = 'BSIT' | 'BLIS' | 'BSCpE' | 'BSECE'
export type YearLevel = 1 | 2 | 3 | 4

export const CET_PROGRAM_CODES: ProgramCode[] = ['BSIT', 'BLIS', 'BSCpE', 'BSECE']

export function parseProgramCode(value: unknown): ProgramCode | null {
  const normalized = String(value ?? '').trim().toUpperCase()
  if (normalized === 'BSIT') return 'BSIT'
  if (normalized === 'BSCPE') return 'BSCpE'
  if (normalized === 'BLIS') return 'BLIS'
  if (normalized === 'BSECE') return 'BSECE'
  return null
}

export function isCETProgramCode(value: unknown): value is ProgramCode {
  return parseProgramCode(value) !== null
}

export function normalizeProgramCode(value: unknown): ProgramCode {
  return parseProgramCode(value) ?? 'BSIT'
}

export type StudentRecord = {
  studentId: string
  fullName: string
  email?: string | null
  programCode: ProgramCode
  yearLevel: YearLevel
}

export function isValidStudentId(studentId: string): boolean {
  return /^598\d{5}$/.test(studentId)
}

export function generatePassword(studentId: string, fullName: string): string {
  const suffix = studentId.startsWith('598') ? studentId.slice(3) : studentId
  const parts = fullName.trim().split(/\s+/)
  const lastName = parts[parts.length - 1]?.toUpperCase() ?? ''
  return `${suffix}${lastName}`
}

export function mapDbStudent(row: any): StudentRecord {
  return {
    studentId: row.student_id,
    fullName: row.full_name,
    email: row.email,
    programCode: normalizeProgramCode(row.program_code),
    yearLevel: row.year_level,
  }
}
