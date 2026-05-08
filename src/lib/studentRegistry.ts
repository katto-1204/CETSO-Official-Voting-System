import { MOCK_STUDENTS, type MockStudent, type ProgramCode, type YearLevel } from '../mocks/mockStudents'

const STORAGE_KEY = 'cetso_students_registry'

function readRegistry(): MockStudent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [...MOCK_STUDENTS]
    const parsed = JSON.parse(raw) as MockStudent[]
    return Array.isArray(parsed) ? parsed : [...MOCK_STUDENTS]
  } catch {
    return [...MOCK_STUDENTS]
  }
}

function writeRegistry(students: MockStudent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students))
}

export function getAllStudents() {
  return readRegistry().sort((a, b) => a.studentId.localeCompare(b.studentId))
}

export function findStudentById(studentId: string) {
  const id = studentId.trim()
  return getAllStudents().find((s) => s.studentId === id) ?? null
}

export function upsertStudent(student: MockStudent) {
  const all = readRegistry()
  const idx = all.findIndex((s) => s.studentId === student.studentId)
  if (idx >= 0) all[idx] = student
  else all.push(student)
  writeRegistry(all)
}

export function registerStudent(params: {
  studentId: string
  fullName: string
  programCode: ProgramCode
  yearLevel: YearLevel
  password: string
}) {
  const payload: MockStudent = {
    studentId: params.studentId.trim(),
    fullName: params.fullName.trim(),
    programCode: params.programCode,
    yearLevel: params.yearLevel,
    password: params.password,
  }
  upsertStudent(payload)
  return payload
}

