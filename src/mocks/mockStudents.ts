export type ProgramCode = 'BSIT' | 'BLIS' | 'BSCpE' | 'BSECE'
export type YearLevel = 1 | 2 | 3 | 4

export type MockStudent = {
  studentId: string
  fullName: string
  programCode: ProgramCode
  yearLevel: YearLevel
  password: string
}

// MVP demo dataset: in production this comes from the admin CSV import.
export const MOCK_STUDENTS: MockStudent[] = [
  {
    studentId: '598_____',
    fullName: 'Juan Dela Cruz',
    programCode: 'BSIT',
    yearLevel: 1,
    password: 'CETSO2026',
  },
  {
    studentId: '599_____',
    fullName: 'Maria Santos',
    programCode: 'BSIT',
    yearLevel: 3,
    password: 'CETSO2026',
  },
  {
    studentId: '600_____',
    fullName: 'Anne Reyes',
    programCode: 'BLIS',
    yearLevel: 2,
    password: 'CETSO2026',
  },
  {
    studentId: '601_____',
    fullName: 'Kevin Cruz',
    programCode: 'BSCpE',
    yearLevel: 4,
    password: 'CETSO2026',
  },
  {
    studentId: '602_____',
    fullName: 'Rina Bautista',
    programCode: 'BSECE',
    yearLevel: 1,
    password: 'CETSO2026',
  },
]

export function findStudentById(studentId: string) {
  return MOCK_STUDENTS.find((s) => s.studentId === studentId) ?? null
}

