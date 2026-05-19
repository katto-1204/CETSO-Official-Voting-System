import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import GlassCard from '../components/ui/GlassCard'
import { ensureHcdcGoogleSession, HCDC_EMAIL_ERROR } from '../lib/hcdcGoogleAuth'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    let active = true

    async function finishLogin() {
      try {
        const result = await ensureHcdcGoogleSession()
        if (!active) return

        if (!result.ok) {
          if (result.reason === 'PROFILE_REQUIRED') {
            navigate('/student/complete-profile', { replace: true })
            return
          }
          if (result.reason === 'INVALID_EMAIL') {
            sessionStorage.setItem('cetso_login_error', HCDC_EMAIL_ERROR)
          }
          navigate('/login', { replace: true })
          return
        }

        navigate(result.alreadyVoted ? '/student/receipt' : '/student/dashboard', { replace: true })
      } catch (error) {
        console.error('Google auth callback failed:', error)
        if (!active) return
        sessionStorage.setItem('cetso_login_error', 'Google login could not be completed. Please try again.')
        navigate('/login', { replace: true })
      }
    }

    finishLogin()

    return () => {
      active = false
    }
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--cetso-bg)' }}>
      <GlassCard className="w-full max-w-md p-8 text-center">
        <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[var(--cetso-orange)]" />
        <div className="text-xl font-black text-[var(--cetso-text)] uppercase italic tracking-tighter">
          Completing Google Login
        </div>
        <div className="mt-2 text-sm font-medium text-[var(--cetso-text-2)]">
          Verifying your HCDC email before opening the voting portal.
        </div>
      </GlassCard>
    </div>
  )
}
