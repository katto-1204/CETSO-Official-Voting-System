/**
 * Mock student dataset — all IDs must start with "598".
 * Password rule:  digits-after-598 + LASTNAME (uppercase)
 *   e.g.  598‑10001  "Juan Cruz"  →  password = "10001CRUZ"
 */

export type ProgramCode = 'BSIT' | 'BLIS' | 'BSCpE' | 'BSECE'
export type YearLevel = 1 | 2 | 3 | 4

export interface Student {
  studentId: string
  fullName: string
  programCode: ProgramCode
  yearLevel: YearLevel
  password: string
}

/** Derive the auto-generated password from an ID + full name */
export function generatePassword(studentId: string, fullName: string): string {
  const suffix = studentId.startsWith('598') ? studentId.slice(3) : studentId
  const parts = fullName.trim().split(/\s+/)
  const lastName = parts[parts.length - 1].toUpperCase()
  return `${suffix}${lastName}`
}

export const MOCK_STUDENTS: Student[] = [
  // ── BSIT ───────────────────────────────────
  {
    studentId: '59810001',
    fullName: 'Juan Cruz',
    programCode: 'BSIT',
    yearLevel: 1,
    password: generatePassword('59810001', 'Juan Cruz'),
  },
  {
    studentId: '59810002',
    fullName: 'Maria Santos',
    programCode: 'BSIT',
    yearLevel: 2,
    password: generatePassword('59810002', 'Maria Santos'),
  },
  {
    studentId: '59810003',
    fullName: 'Carlos Reyes',
    programCode: 'BSIT',
    yearLevel: 3,
    password: generatePassword('59810003', 'Carlos Reyes'),
  },
  {
    studentId: '59810004',
    fullName: 'Angela Garcia',
    programCode: 'BSIT',
    yearLevel: 4,
    password: generatePassword('59810004', 'Angela Garcia'),
  },

  // ── BLIS ───────────────────────────────────
  {
    studentId: '59820001',
    fullName: 'Paolo Mendoza',
    programCode: 'BLIS',
    yearLevel: 1,
    password: generatePassword('59820001', 'Paolo Mendoza'),
  },
  {
    studentId: '59820002',
    fullName: 'Rica Flores',
    programCode: 'BLIS',
    yearLevel: 2,
    password: generatePassword('59820002', 'Rica Flores'),
  },
  {
    studentId: '59820003',
    fullName: 'Daniel Torres',
    programCode: 'BLIS',
    yearLevel: 3,
    password: generatePassword('59820003', 'Daniel Torres'),
  },

  // ── BSCpE ──────────────────────────────────
  {
    studentId: '59830001',
    fullName: 'Jose Villanueva',
    programCode: 'BSCpE',
    yearLevel: 1,
    password: generatePassword('59830001', 'Jose Villanueva'),
  },
  {
    studentId: '59830002',
    fullName: 'Anna Ramos',
    programCode: 'BSCpE',
    yearLevel: 2,
    password: generatePassword('59830002', 'Anna Ramos'),
  },
  {
    studentId: '59830003',
    fullName: 'Mark Bautista',
    programCode: 'BSCpE',
    yearLevel: 3,
    password: generatePassword('59830003', 'Mark Bautista'),
  },

  // ── BSECE ──────────────────────────────────
  {
    studentId: '59840001',
    fullName: 'Luis Aquino',
    programCode: 'BSECE',
    yearLevel: 1,
    password: generatePassword('59840001', 'Luis Aquino'),
  },
  {
    studentId: '59840002',
    fullName: 'Christine Navarro',
    programCode: 'BSECE',
    yearLevel: 2,
    password: generatePassword('59840002', 'Christine Navarro'),
  },
  {
    studentId: '59840003',
    fullName: 'Rafael Dela Cruz',
    programCode: 'BSECE',
    yearLevel: 3,
    password: generatePassword('59840003', 'Rafael Dela Cruz'),
  },
]
