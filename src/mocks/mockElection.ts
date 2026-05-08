import type { ProgramCode, YearLevel } from './mockStudents'

export type PositionType = 'executive' | 'representative'

export type PositionEligibility = {
  programCode?: ProgramCode
  yearLevel?: YearLevel
}

export type Position = {
  positionCode: string
  title: string
  positionType: PositionType
  eligibility?: PositionEligibility
  sortOrder: number
}

export type Candidate = {
  candidateId: string
  positionCode: string
  fullName: string
  partylist: string
  tagline: string
  bio: string
}

export const ELECTION = {
  electionId: 'election-2026-mock',
  electionYear: 2026,
  name: 'CETSO Elections 2026',
} as const

export const PROGRAMS: ProgramCode[] = ['BSIT', 'BLIS', 'BSCpE', 'BSECE']

const POSITIONS_UNSORTED: Position[] = [
  // Executive
  { positionCode: 'PRESIDENT', title: 'President', positionType: 'executive', sortOrder: 1 },
  { positionCode: 'EXT_VICE_PRESIDENT', title: 'External Vice President', positionType: 'executive', sortOrder: 2 },
  { positionCode: 'INT_VICE_PRESIDENT', title: 'Internal Vice President', positionType: 'executive', sortOrder: 3 },
  { positionCode: 'SECRETARY', title: 'Secretary', positionType: 'executive', sortOrder: 4 },
  { positionCode: 'ASSISTANT_SECRETARY', title: 'Assistant Secretary', positionType: 'executive', sortOrder: 5 },
  { positionCode: 'TREASURER', title: 'Treasurer', positionType: 'executive', sortOrder: 6 },
  { positionCode: 'ASSISTANT_TREASURER', title: 'Assistant Treasurer', positionType: 'executive', sortOrder: 7 },
  { positionCode: 'AUDITOR', title: 'Auditor', positionType: 'executive', sortOrder: 8 },
  { positionCode: 'BUSINESS_MANAGER_1', title: 'Business Manager', positionType: 'executive', sortOrder: 9 },
  { positionCode: 'BUSINESS_MANAGER_2', title: 'Business Manager', positionType: 'executive', sortOrder: 10 },

  // PIO (program-restricted)
  {
    positionCode: 'PIO_BSIT',
    title: 'Public Information Officer (BSIT)',
    positionType: 'executive',
    eligibility: { programCode: 'BSIT' },
    sortOrder: 11,
  },
  {
    positionCode: 'PIO_BLIS',
    title: 'Public Information Officer (BLIS)',
    positionType: 'executive',
    eligibility: { programCode: 'BLIS' },
    sortOrder: 12,
  },
  {
    positionCode: 'PIO_BSCpE',
    title: 'Public Information Officer (BSCpE)',
    positionType: 'executive',
    eligibility: { programCode: 'BSCpE' },
    sortOrder: 13,
  },

  // Year-level Representatives
  // BSIT
  { positionCode: 'BSIT_REP_1', title: 'Representative for BSIT 1', positionType: 'representative', eligibility: { programCode: 'BSIT', yearLevel: 1 }, sortOrder: 14 },
  { positionCode: 'BSIT_REP_2', title: 'Representative for BSIT 2', positionType: 'representative', eligibility: { programCode: 'BSIT', yearLevel: 2 }, sortOrder: 15 },
  { positionCode: 'BSIT_REP_3', title: 'Representative for BSIT 3', positionType: 'representative', eligibility: { programCode: 'BSIT', yearLevel: 3 }, sortOrder: 16 },
  { positionCode: 'BSIT_REP_4', title: 'Representative for BSIT 4', positionType: 'representative', eligibility: { programCode: 'BSIT', yearLevel: 4 }, sortOrder: 17 },

  // BLIS
  { positionCode: 'BLIS_REP_1', title: 'Representative for BLIS 1', positionType: 'representative', eligibility: { programCode: 'BLIS', yearLevel: 1 }, sortOrder: 18 },
  { positionCode: 'BLIS_REP_2', title: 'Representative for BLIS 2', positionType: 'representative', eligibility: { programCode: 'BLIS', yearLevel: 2 }, sortOrder: 19 },
  { positionCode: 'BLIS_REP_3', title: 'Representative for BLIS 3', positionType: 'representative', eligibility: { programCode: 'BLIS', yearLevel: 3 }, sortOrder: 20 },
  { positionCode: 'BLIS_REP_4', title: 'Representative for BLIS 4', positionType: 'representative', eligibility: { programCode: 'BLIS', yearLevel: 4 }, sortOrder: 21 },

  // BSCpE
  { positionCode: 'BSCpE_REP_1', title: 'Representative for BSCpE 1', positionType: 'representative', eligibility: { programCode: 'BSCpE', yearLevel: 1 }, sortOrder: 22 },
  { positionCode: 'BSCpE_REP_2', title: 'Representative for BSCpE 2', positionType: 'representative', eligibility: { programCode: 'BSCpE', yearLevel: 2 }, sortOrder: 23 },
  { positionCode: 'BSCpE_REP_3', title: 'Representative for BSCpE 3', positionType: 'representative', eligibility: { programCode: 'BSCpE', yearLevel: 3 }, sortOrder: 24 },
  { positionCode: 'BSCpE_REP_4', title: 'Representative for BSCpE 4', positionType: 'representative', eligibility: { programCode: 'BSCpE', yearLevel: 4 }, sortOrder: 25 },

  // BSEcE
  { positionCode: 'BSEcE_REP_1', title: 'Representative for BSEcE 1', positionType: 'representative', eligibility: { programCode: 'BSECE', yearLevel: 1 }, sortOrder: 26 },
  { positionCode: 'BSEcE_REP_2', title: 'Representative for BSEcE 2', positionType: 'representative', eligibility: { programCode: 'BSECE', yearLevel: 2 }, sortOrder: 27 },
  { positionCode: 'BSEcE_REP_3', title: 'Representative for BSEcE 3', positionType: 'representative', eligibility: { programCode: 'BSECE', yearLevel: 3 }, sortOrder: 28 },
  { positionCode: 'BSEcE_REP_4', title: 'Representative for BSEcE 4', positionType: 'representative', eligibility: { programCode: 'BSECE', yearLevel: 4 }, sortOrder: 29 },
]

export const POSITIONS = POSITIONS_UNSORTED.slice().sort((a, b) => a.sortOrder - b.sortOrder)

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

const CANDIDATE_PARTY = ['CETSO', 'CETSO Unite', 'CETSO Vision']

function makeCandidateName(positionTitle: string, variant: 'A' | 'B') {
  const suffix = variant === 'A' ? 'I' : 'II'
  return `${positionTitle.split(' ')[0]} Candidate ${suffix}`
}

export const CANDIDATES: Candidate[] = POSITIONS.flatMap((pos) => {
  const baseName = pos.title
  const partylist = CANDIDATE_PARTY[pos.sortOrder % CANDIDATE_PARTY.length]
  const bio = `Committed to campus excellence and transparent leadership for ${baseName}.`
  return [
    {
      candidateId: `${pos.positionCode}-A`,
      positionCode: pos.positionCode,
      fullName: makeCandidateName(baseName, 'A'),
      partylist,
      tagline: `Deliver. Lead. Serve.`,
      bio,
    },
    {
      candidateId: `${pos.positionCode}-B`,
      positionCode: pos.positionCode,
      fullName: makeCandidateName(baseName, 'B'),
      partylist,
      tagline: `Better governance, stronger students.`,
      bio,
    },
  ]
})

export function getCandidatesForPosition(positionCode: string) {
  return CANDIDATES.filter((c) => c.positionCode === positionCode)
}

export function getCandidateById(candidateId: string) {
  return CANDIDATES.find((c) => c.candidateId === candidateId)
}

export function getFeaturedCandidates() {
  const featured = ['PRESIDENT', 'SECRETARY', 'PIO_BSIT']
  return CANDIDATES.filter((c) => featured.includes(c.positionCode)).slice(0, 6)
}

