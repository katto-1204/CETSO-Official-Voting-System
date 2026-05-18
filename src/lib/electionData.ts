import type { ProgramCode, YearLevel } from './studentTypes'

export type PositionType = 'executive' | 'representative'
export type PositionGroup = 'executive_officers' | 'year_level_representatives' | 'public_information_officers'

export type PositionEligibility = {
  programCode?: ProgramCode
  yearLevel?: YearLevel
}

export type Position = {
  positionCode: string
  title: string
  positionType: PositionType
  positionGroup: PositionGroup
  eligibility?: PositionEligibility
  selectionLimit?: number
  sortOrder: number
}

export type Candidate = {
  candidateId: string
  positionCode: string
  fullName: string
  partylist: string
  tagline: string
  bio: string
  imageUrl?: string
}

export const ELECTION = {
  electionId: 'election-2026-mock',
  electionYear: 2026,
  name: 'CETSO Elections 2026',
} as const

export const PROGRAMS: ProgramCode[] = ['BSIT', 'BLIS', 'BSCpE', 'BSECE']

export const POSITION_GROUP_LABELS: Record<PositionGroup, string> = {
  executive_officers: 'Executive Officers',
  year_level_representatives: 'Year Level Representatives',
  public_information_officers: 'Public Information Officers',
}

const POSITIONS_UNSORTED: Position[] = [
  // Executive Officers
  { positionCode: 'PRESIDENT', title: 'President', positionType: 'executive', positionGroup: 'executive_officers', sortOrder: 1 },
  { positionCode: 'INT_VICE_PRESIDENT', title: 'Internal Vice President', positionType: 'executive', positionGroup: 'executive_officers', sortOrder: 2 },
  { positionCode: 'EXT_VICE_PRESIDENT', title: 'External Vice President', positionType: 'executive', positionGroup: 'executive_officers', sortOrder: 3 },
  { positionCode: 'SECRETARY', title: 'Secretary', positionType: 'executive', positionGroup: 'executive_officers', sortOrder: 4 },
  { positionCode: 'ASSISTANT_SECRETARY', title: 'Assistant Secretary', positionType: 'executive', positionGroup: 'executive_officers', sortOrder: 5 },
  { positionCode: 'TREASURER', title: 'Treasurer', positionType: 'executive', positionGroup: 'executive_officers', sortOrder: 6 },
  { positionCode: 'ASSISTANT_TREASURER', title: 'Assistant Treasurer', positionType: 'executive', positionGroup: 'executive_officers', sortOrder: 7 },
  { positionCode: 'AUDITOR', title: 'Auditor', positionType: 'executive', positionGroup: 'executive_officers', sortOrder: 8 },
  { positionCode: 'BUSINESS_MANAGER', title: 'Business Managers', positionType: 'executive', positionGroup: 'executive_officers', selectionLimit: 2, sortOrder: 9 },

  // Year-level Representatives
  // BSCpE
  { positionCode: 'BSCpE_REP_2', title: 'BSCPE 2nd Year Representative', positionType: 'representative', positionGroup: 'year_level_representatives', eligibility: { programCode: 'BSCpE', yearLevel: 2 }, sortOrder: 10 },
  { positionCode: 'BSCpE_REP_3', title: 'BSCPE 3rd Year Representative', positionType: 'representative', positionGroup: 'year_level_representatives', eligibility: { programCode: 'BSCpE', yearLevel: 3 }, sortOrder: 11 },
  { positionCode: 'BSCpE_REP_4', title: 'BSCPE 4th Year Representative', positionType: 'representative', positionGroup: 'year_level_representatives', eligibility: { programCode: 'BSCpE', yearLevel: 4 }, sortOrder: 12 },

  // BSEcE
  { positionCode: 'BSECE_REP_2', title: 'BSECE 2nd Year Representative', positionType: 'representative', positionGroup: 'year_level_representatives', eligibility: { programCode: 'BSECE', yearLevel: 2 }, sortOrder: 13 },

  // BSIT
  { positionCode: 'BSIT_REP_2', title: 'BSIT 2nd Year Representative', positionType: 'representative', positionGroup: 'year_level_representatives', eligibility: { programCode: 'BSIT', yearLevel: 2 }, sortOrder: 14 },
  { positionCode: 'BSIT_REP_3', title: 'BSIT 3rd Year Representative', positionType: 'representative', positionGroup: 'year_level_representatives', eligibility: { programCode: 'BSIT', yearLevel: 3 }, sortOrder: 15 },
  { positionCode: 'BSIT_REP_4', title: 'BSIT 4th Year Representative', positionType: 'representative', positionGroup: 'year_level_representatives', eligibility: { programCode: 'BSIT', yearLevel: 4 }, sortOrder: 16 },

  // BLIS
  { positionCode: 'BLIS_REP_3', title: 'BLIS 3rd Year Representative', positionType: 'representative', positionGroup: 'year_level_representatives', eligibility: { programCode: 'BLIS', yearLevel: 3 }, sortOrder: 17 },

  // Public Information Officers
  {
    positionCode: 'PIO_BSIT',
    title: 'PIO BSIT',
    positionType: 'executive',
    positionGroup: 'public_information_officers',
    eligibility: { programCode: 'BSIT' },
    sortOrder: 18,
  },
  {
    positionCode: 'PIO_BSCpE',
    title: 'PIO BSCPE',
    positionType: 'executive',
    positionGroup: 'public_information_officers',
    eligibility: { programCode: 'BSCpE' },
    sortOrder: 19,
  },
]

export const POSITIONS = POSITIONS_UNSORTED.slice().sort((a, b) => a.sortOrder - b.sortOrder)

export function getPositionGroupLabel(positionCode: string) {
  const position = POSITIONS.find((p) => p.positionCode === positionCode)
  return position ? POSITION_GROUP_LABELS[position.positionGroup] : 'Other Positions'
}

export function getPositionSelectionLimit(position: Position) {
  return position.selectionLimit ?? 1
}

export function getEligiblePositions(params: {
  programCode: ProgramCode
  yearLevel: YearLevel
}) {
  return POSITIONS.filter((p) => {
    if (!p.eligibility) return true
    if (p.eligibility.programCode && p.eligibility.programCode !== params.programCode)
      return false
    if (p.eligibility.yearLevel && p.eligibility.yearLevel !== params.yearLevel)
      return false
    return true
  })
}

const DEFAULT_PARTYLIST = 'Independent'
const DEFAULT_TAGLINE = 'Official CETSO Candidate'

function makeCandidate(positionCode: string, fullName: string): Candidate {
  const position = POSITIONS.find((p) => p.positionCode === positionCode)
  const candidateId = `${positionCode}-${fullName.replace(/[^A-Z0-9]+/gi, '-').replace(/^-|-$/g, '').toUpperCase()}`
  return {
    candidateId,
    positionCode,
    fullName,
    partylist: DEFAULT_PARTYLIST,
    tagline: DEFAULT_TAGLINE,
    bio: `Official candidate for ${position?.title ?? positionCode}.`,
    imageUrl: `/CANDIDATES/${fullName}.png`,
  }
}

export const CANDIDATES: Candidate[] = [
  makeCandidate('PRESIDENT', 'KYLLE KIAN GIMENA'),
  makeCandidate('INT_VICE_PRESIDENT', 'MICHELLE CAPITAN'),
  makeCandidate('EXT_VICE_PRESIDENT', 'CASSIEL FLORES'),
  makeCandidate('SECRETARY', 'KEAN JAYCEE D. GUTIERREZ'),
  makeCandidate('ASSISTANT_SECRETARY', 'KRISH KHINOBI BAYALAN'),
  makeCandidate('ASSISTANT_SECRETARY', 'SHELBY HANIEL G. CODILLA'),
  makeCandidate('TREASURER', 'RACHEL MAE PARAGAS'),
  makeCandidate('TREASURER', 'EDELJOEL R. MACABULOS'),
  makeCandidate('ASSISTANT_TREASURER', 'JIREH MAE D. TUMALA'),
  makeCandidate('ASSISTANT_TREASURER', 'JOHN TROY V. MAGHANOY'),
  makeCandidate('AUDITOR', 'DEXTER MAGUINSAY'),
  makeCandidate('BUSINESS_MANAGER', 'CARL JOSHUA D. BALCITA'),
  makeCandidate('BUSINESS_MANAGER', 'NATHANIEL DATAS'),
  makeCandidate('BUSINESS_MANAGER', 'NOEL IVAN CLAMOR'),
  makeCandidate('BSCpE_REP_2', 'JULYLYN C. GOREZ'),
  makeCandidate('BSCpE_REP_3', 'JOHN DALE M. CARIN'),
  makeCandidate('BSCpE_REP_4', 'VAL JOSEPH OLAVIDES ANDAL'),
  makeCandidate('BSCpE_REP_4', 'GLEZA MARIE GAMUTAN'),
  makeCandidate('BSECE_REP_2', 'NATHANIEL S. GUILLAMASO'),
  makeCandidate('BSIT_REP_2', 'NATHALIA MAE B. BAGNES'),
  makeCandidate('BSIT_REP_3', 'JUSTINE AUDREY P. ROLLENAS'),
  makeCandidate('BSIT_REP_4', 'RHONAN MADARANG'),
  makeCandidate('BLIS_REP_3', 'RISCIA LOYGI H. BURGOS'),
  makeCandidate('PIO_BSIT', 'JARED SETH R. LO'),
  makeCandidate('PIO_BSCpE', 'HINGPIT, MARY GRACE B.'),
  makeCandidate('PIO_BSCpE', 'EANNE MARKEISHA A. MORENO'),
]

export function getCandidatesForPosition(positionCode: string) {
  return CANDIDATES.filter((c) => c.positionCode === positionCode)
}

export function mergeCandidatesWithOfficialSeed(dbCandidates?: Candidate[] | null) {
  if (!dbCandidates?.length) return CANDIDATES

  const dbKeys = new Set(
    dbCandidates.map((candidate) =>
      `${candidate.positionCode}::${candidate.fullName.trim().toUpperCase()}`
    )
  )

  const missingOfficialCandidates = CANDIDATES.filter((candidate) => {
    const key = `${candidate.positionCode}::${candidate.fullName.trim().toUpperCase()}`
    return !dbKeys.has(key)
  })

  return [...dbCandidates, ...missingOfficialCandidates]
}

export function getCandidateById(candidateId: string) {
  return CANDIDATES.find((c) => c.candidateId === candidateId)
}

export function getFeaturedCandidates() {
  const featured = ['PRESIDENT', 'SECRETARY', 'PIO_BSIT']
  return CANDIDATES.filter((c) => featured.includes(c.positionCode)).slice(0, 6)
}
