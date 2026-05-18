import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envFile = fs.readFileSync('.env', 'utf-8')
const env = {}
envFile.split('\n').forEach(line => {
  const parts = line.split('=')
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim()
  }
})

const supabaseUrl = env['VITE_SUPABASE_URL']
const supabaseKey = env['VITE_SUPABASE_ANON_KEY']

const supabase = createClient(supabaseUrl, supabaseKey)

// Exact copy of CANDIDATES array definition for node.js test
function makeCandidate(positionCode, fullName) {
  const candidateId = `${positionCode}-${fullName.replace(/[^A-Z0-9]+/gi, '-').replace(/^-|-$/g, '').toUpperCase()}`
  return {
    candidateId,
    positionCode,
    fullName,
    partylist: 'Independent',
    tagline: 'Official CETSO Candidate',
    bio: `Official candidate for ${positionCode}.`,
    imageUrl: `/CANDIDATES/${fullName}.png`,
  }
}

const CANDIDATES = [
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

async function run() {
  const { data: dbCandidates } = await supabase.from('candidates').select('*')
  console.log("Mapping simulation for all candidates:")
  dbCandidates.forEach(dbCandidate => {
    const cleanDbName = dbCandidate.full_name.trim().toUpperCase().replace('JHON', 'JOHN')
    const seedMatch = CANDIDATES.find(
      (c) => c.fullName.trim().toUpperCase().replace('JHON', 'JOHN') === cleanDbName
    )

    let finalImageUrl = dbCandidate.image_url
    if (!finalImageUrl || finalImageUrl === 'null' || finalImageUrl === 'NULL') {
      finalImageUrl = seedMatch ? seedMatch.imageUrl : ''
    }

    console.log(`- DB: "${dbCandidate.full_name}" -> Matched Seed: "${seedMatch ? seedMatch.fullName : 'NONE'}" -> Resulting URL: "${finalImageUrl}"`)
  })
}

run()
