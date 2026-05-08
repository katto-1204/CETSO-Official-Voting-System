import { MOCK_STUDENTS, generatePassword } from '../mocks/mockStudents'
import type { Student, ProgramCode, YearLevel } from '../mocks/mockStudents'

const REGISTRY_KEY = 'cetso_student_registry'

/** Student ID must start with "598" */
const ID_PREFIX = '598'

function load(): Student[] {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY)
    if (!raw) return [...MOCK_STUDENTS]
    const stored = JSON.parse(raw) as Student[]
    return stored.length ? stored : [...MOCK_STUDENTS]
  } catch {
    return [...MOCK_STUDENTS]
  }
}

function save(list: Student[]) {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(list))
}

/** Return all students (mock + manually registered) */
export function getAllStudents(): Student[] {
  return load()
}

/** Find a student by ID */
export function findStudentById(studentId: string): Student | undefined {
  return load().find((s) => s.studentId === studentId)
}

/** Validate that a student ID starts with the mandatory prefix */
export function isValidStudentId(studentId: string): boolean {
  return studentId.startsWith(ID_PREFIX) && studentId.length > ID_PREFIX.length
}

/**
 * Register a new student.
 * - The ID MUST start with "598".
 * - Password is auto-generated: digits-after-598 + LASTNAME (uppercase).
 *   If a manual password is supplied it is ignored in favour of the rule.
 */
export function registerStudent(data: {
  studentId: string
  fullName: string
  programCode: ProgramCode
  yearLevel: YearLevel
  password?: string
}): { ok: boolean; error?: string; generatedPassword?: string } {
  if (!isValidStudentId(data.studentId)) {
    return { ok: false, error: `Student ID must start with "${ID_PREFIX}".` }
  }

  const list = load()
  if (list.some((s) => s.studentId === data.studentId)) {
    return { ok: false, error: 'Student ID already exists.' }
  }

  const autoPassword = generatePassword(data.studentId, data.fullName)

  list.push({
    studentId: data.studentId,
    fullName: data.fullName,
    programCode: data.programCode,
    yearLevel: data.yearLevel,
    password: autoPassword,
  })
  save(list)
  return { ok: true, generatedPassword: autoPassword }
}
