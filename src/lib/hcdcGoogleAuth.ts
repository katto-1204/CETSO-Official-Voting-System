import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { clearMockSession, setMockSession } from './mockSession'
import { hasVoteSubmission } from './voteRecords'
import { normalizeProgramCode, type ProgramCode, type YearLevel } from './studentTypes'

export const HCDC_EMAIL_DOMAIN = '@hcdc.edu.ph'
export const HCDC_EMAIL_ERROR = 'Only official HCDC emails are allowed to access the CETSO Voting System.'

export type InAppBrowserInfo = {
  blocked: boolean
  name: string
}

export function isHcdcEmail(email: string | null | undefined) {
  return String(email ?? '').trim().toLowerCase().endsWith(HCDC_EMAIL_DOMAIN)
}

export function getInAppBrowserInfo(): InAppBrowserInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { blocked: false, name: 'Browser' }
  }

  const ua = navigator.userAgent || navigator.vendor || ''
  const rules: Array<[RegExp, string]> = [
    [/FB_IAB|FBAN|FBAV|Messenger|FB4A|FBIOS/i, 'Messenger or Facebook'],
    [/Instagram/i, 'Instagram'],
    [/Line/i, 'LINE'],
    [/TikTok|BytedanceWebview|musical_ly/i, 'TikTok'],
    [/Twitter|X-WebView/i, 'Twitter/X'],
    [/MicroMessenger/i, 'WeChat'],
    [/\bwv\b/i, 'Android WebView'],
  ]

  const matched = rules.find(([pattern]) => pattern.test(ua))
  if (matched) return { blocked: true, name: matched[1] }

  const isAndroidWebView =
    /Android/i.test(ua) &&
    /Version\/[\d.]+/i.test(ua) &&
    /Chrome\/[\d.]+ Mobile/i.test(ua) &&
    !/SamsungBrowser|EdgA|OPR|Firefox|DuckDuckGo/i.test(ua)

  if (isAndroidWebView) return { blocked: true, name: 'Android WebView' }

  const isIosWebView = /iPhone|iPad|iPod/i.test(ua) && !/Safari/i.test(ua)
  if (isIosWebView) return { blocked: true, name: 'iOS in-app browser' }

  return { blocked: false, name: 'Browser' }
}

export function isInAppBrowser() {
  return getInAppBrowserInfo().blocked
}

export function getGoogleFullName(user: User) {
  const metadata = user.user_metadata ?? {}
  return (
    metadata.full_name ||
    metadata.name ||
    metadata.display_name ||
    user.email?.split('@')[0] ||
    'HCDC Student'
  )
}

function looksLikeUuid(value: string | null | undefined) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value ?? ''))
}

type GoogleStudentProfile = {
  student_id: string
  auth_user_id?: string | null
  google_email?: string | null
  email?: string | null
  full_name: string
  program_code: string
  year_level: number
}

async function upsertUserProfile(user: User) {
  const email = user.email?.trim().toLowerCase() ?? ''
  const fullName = getGoogleFullName(user)
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
}

async function findGoogleProfile(user: User): Promise<GoogleStudentProfile | null> {
  const email = user.email?.trim().toLowerCase() ?? ''

  const rpc = await supabase.rpc('get_student_by_id', { p_student_id: email })
  if (!rpc.error) {
    const rpcRaw = rpc.data as GoogleStudentProfile[] | GoogleStudentProfile | null
    const rpcRow = Array.isArray(rpcRaw) ? rpcRaw[0] ?? null : rpcRaw
    if (rpcRow) return rpcRow
  } else if (rpc.error.code !== '42883') {
    console.error('Google profile RPC lookup failed:', rpc.error)
  }

  let query = await supabase
    .from('students')
    .select('student_id, auth_user_id, google_email, email, full_name, program_code, year_level')
    .or(`auth_user_id.eq.${user.id},google_email.eq.${email},email.eq.${email}`)
    .maybeSingle()

  if (query.error?.code === 'PGRST204') {
    query = await supabase
      .from('students')
      .select('student_id, email, full_name, program_code, year_level')
      .eq('email', email)
      .maybeSingle()
  }

  if (query.error) throw query.error
  return (query.data as GoogleStudentProfile | null) ?? null
}

function isCompleteStudentProfile(profile: GoogleStudentProfile | null): profile is GoogleStudentProfile {
  return Boolean(
    profile &&
    profile.student_id &&
    !looksLikeUuid(profile.student_id) &&
    profile.full_name &&
    profile.program_code &&
    profile.year_level
  )
}

async function claimExistingProfile(user: User, profile: GoogleStudentProfile) {
  const email = user.email?.trim().toLowerCase() ?? ''

  if (profile.auth_user_id === user.id && (profile.google_email || profile.email)) return

  const payload = {
    auth_user_id: user.id,
    google_email: email,
    email: profile.email || email,
  }

  const { error } = await supabase
    .from('students')
    .update(payload)
    .eq('student_id', profile.student_id)

  if (error) {
    console.error('Could not link existing student profile to Google account:', error)
  }
}

function syncCompletedProfileSession(user: User, profile: GoogleStudentProfile) {
  const email = user.email?.trim().toLowerCase() ?? profile.google_email ?? profile.email ?? ''
  const fullName = profile.full_name || getGoogleFullName(user)
  setMockSession({
    role: 'student',
    authUserId: user.id,
    studentId: profile.student_id,
    studentName: fullName,
    email,
    programCode: normalizeProgramCode(profile.program_code),
    yearLevel: (profile.year_level || 1) as YearLevel,
  })
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

  await upsertUserProfile(data.user)
  const profile = await findGoogleProfile(data.user)

  if (!isCompleteStudentProfile(profile)) {
    clearMockSession()
    const alreadyVoted = await hasVoteSubmission(data.user.id)
    return {
      ok: false as const,
      reason: 'PROFILE_REQUIRED' as const,
      user: data.user,
      alreadyVoted,
      email: data.user.email?.trim().toLowerCase() ?? '',
      suggestedName: getGoogleFullName(data.user),
      profile,
    }
  }

  await claimExistingProfile(data.user, profile)
  syncCompletedProfileSession(data.user, profile)
  const alreadyVoted = (await hasVoteSubmission(data.user.id)) || (await hasVoteSubmission(profile.student_id))

  return {
    ok: true as const,
    user: data.user,
    alreadyVoted,
    email: data.user.email?.trim().toLowerCase() ?? '',
  }
}

export async function saveGoogleStudentProfile(params: {
  studentId: string
  fullName: string
  programCode: ProgramCode
  yearLevel: YearLevel
}) {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) throw new Error('Google login is required.')
  if (!isHcdcEmail(data.user.email)) {
    await supabase.auth.signOut()
    clearMockSession()
    throw new Error(HCDC_EMAIL_ERROR)
  }

  const user = data.user
  const email = user.email?.trim().toLowerCase() ?? ''
  const studentId = params.studentId.trim()
  const fullName = params.fullName.trim()
  if (!studentId) throw new Error('Student ID number is required.')
  if (!fullName) throw new Error('Full name is required.')

  const existing = await findGoogleProfile(user)
  const payload = {
    student_id: studentId,
    auth_user_id: user.id,
    google_email: email,
    email,
    full_name: fullName,
    program_code: params.programCode,
    year_level: params.yearLevel,
  }

  const response = existing
    ? await supabase.from('students').update(payload).eq('auth_user_id', user.id)
    : await supabase.from('students').insert(payload)

  if (response.error?.code === '23505') {
    throw new Error('This Student ID is already registered.')
  }

  if (response.error) {
    throw response.error
  }

  syncCompletedProfileSession(user, payload)
  return payload
}

export async function signInWithHcdcGoogle() {
  if (isInAppBrowser()) {
    throw new Error('Google login is blocked inside this in-app browser. Open this page in Chrome, Safari, or your default browser to continue.')
  }

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
