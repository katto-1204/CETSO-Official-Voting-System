export type ProgramCode = 'BSIT' | 'BLIS' | 'BSCpE' | 'BSECE'
export type YearLevel = 1 | 2 | 3 | 4

export function normalizeProgramCode(value: unknown): ProgramCode {
  const normalized = String(value ?? '').trim().toUpperCase()
  if (normalized === 'BSCPE' || normalized === 'BSCpE'.toUpperCase()) return 'BSCpE'
  if (normalized === 'BLIS') return 'BLIS'
  if (normalized === 'BSECE') return 'BSECE'
  return 'BSIT'
}

export type StudentRecord = {
  studentId: string
  fullName: string
  email?: string | null
  programCode: ProgramCode
  yearLevel: YearLevel
}

export function isValidStudentId(studentId: string): boolean {
  return studentId.startsWith('598') && studentId.length > 3
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
