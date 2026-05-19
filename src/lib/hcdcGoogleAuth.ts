import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { clearMockSession, setMockSession } from './mockSession'
import { hasVoteSubmission } from './voteRecords'

export const HCDC_EMAIL_DOMAIN = '@hcdc.edu.ph'
export const HCDC_EMAIL_ERROR = 'Only official HCDC emails are allowed to access the CETSO Voting System.'

export function isHcdcEmail(email: string | null | undefined) {
  return String(email ?? '').trim().toLowerCase().endsWith(HCDC_EMAIL_DOMAIN)
}

function getGoogleFullName(user: User) {
  const metadata = user.user_metadata ?? {}
  return (
    metadata.full_name ||
    metadata.name ||
    metadata.display_name ||
    user.email?.split('@')[0] ||
    'HCDC Student'
  )
}

async function upsertGoogleProfile(user: User) {
  const email = user.email?.trim().toLowerCase() ?? ''
  const fullName = getGoogleFullName(user)

  const profileWithGoogleColumns = {
    student_id: user.id,
    auth_user_id: user.id,
    google_email: email,
    email,
    full_name: fullName,
    program_code: 'BSIT',
    year_level: 1,
  }

  const { error } = await supabase
    .from('students')
    .upsert(profileWithGoogleColumns, { onConflict: 'student_id' })

  if (error) {
    const fallback = {
      student_id: user.id,
      email,
      full_name: fullName,
      program_code: 'BSIT',
      year_level: 1,
    }
    const retry = await supabase.from('students').upsert(fallback, { onConflict: 'student_id' })
    if (retry.error) throw retry.error
  }

  const userProfile = {
    auth_uid: user.id,
    email,
    google_email: email,
    full_name: fullName,
    display_name: fullName,
    role: 'student',
  }

  const userUpsert = await supabase.from('users').upsert(userProfile, { onConflict: 'auth_uid' })
  if (userUpsert.error?.code === 'PGRST204') {
    await supabase.from('users').upsert({
      auth_uid: user.id,
      email,
      display_name: fullName,
      role: 'student',
    }, { onConflict: 'auth_uid' })
  } else if (userUpsert.error) {
    throw userUpsert.error
  }

  setMockSession({
    role: 'student',
    studentId: user.id,
    studentName: fullName,
    email,
    programCode: 'BSIT',
    yearLevel: 1,
  })

  return { email, fullName }
}

export async function ensureHcdcGoogleSession() {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    clearMockSession()
    return { ok: false as const, reason: 'NO_SESSION' as const }
  }

  if (!isHcdcEmail(data.user.email)) {
    await supabase.auth.signOut()
    clearMockSession()
    return { ok: false as const, reason: 'INVALID_EMAIL' as const }
  }

  await upsertGoogleProfile(data.user)
  const alreadyVoted = await hasVoteSubmission(data.user.id)

  return {
    ok: true as const,
    user: data.user,
    alreadyVoted,
    email: data.user.email?.trim().toLowerCase() ?? '',
  }
}

export async function signInWithHcdcGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        hd: 'hcdc.edu.ph',
      },
    },
  })

  if (error) throw error
}
