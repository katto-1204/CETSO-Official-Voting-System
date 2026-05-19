import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Users, Vote, FileCheck, UserCircle, LogOut, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { goeyToast } from 'goey-toast'
import { supabase } from '../../lib/supabase'
import { clearMockSession } from '../../lib/mockSession'
import { ensureHcdcGoogleSession, HCDC_EMAIL_ERROR } from '../../lib/hcdcGoogleAuth'

const navItems = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/candidates', label: 'Candidates', icon: Users },
  { to: '/student/vote', label: 'Vote', icon: Vote },
  { to: '/student/receipt', label: 'Receipt', icon: FileCheck },
  { to: '/student/profile', label: 'Profile', icon: UserCircle },
] as const

function isActive(pathname: string, to: string) {
  if (to === '/student/dashboard') return pathname === to
  return pathname.startsWith(to)
}

export default function AppShell() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  const role = localStorage.getItem('cetso_role')
  const studentId = localStorage.getItem('cetso_student_id')

  useEffect(() => {
    let active = true
    setAuthChecked(false)

    ensureHcdcGoogleSession()
      .then((result) => {
        if (!active) return
        if (!result.ok) {
          if (result.reason === 'INVALID_EMAIL') {
            sessionStorage.setItem('cetso_login_error', HCDC_EMAIL_ERROR)
            goeyToast.error(HCDC_EMAIL_ERROR)
          } else {
            goeyToast.error('Access Denied: HCDC Google login required.')
          }
          navigate('/login', { replace: true })
          return
        }
        setAuthChecked(true)
      })
      .catch((error) => {
        if (!active) return
        console.error('Student auth check failed:', error)
        goeyToast.error('Access Denied: HCDC Google login required.')
        navigate('/login', { replace: true })
      })

    return () => {
      active = false
    }
  }, [pathname, navigate])

  if (!authChecked || role !== 'student' || !studentId) {
    return null
  }

  const studentName = localStorage.getItem('cetso_student_name') ?? 'Student'
  const programCode = localStorage.getItem('cetso_program_code') ?? ''
  const initials = studentName.split(' ').slice(0, 2).map((p: string) => p[0]).join('').toUpperCase()

  function handleLogoutClick() {
    setShowLogoutConfirm(true)
  }

  async function handleLogoutConfirm() {
    await supabase.auth.signOut()
    clearMockSession()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--cetso-bg)' }}>

      {/* ── Desktop Sidebar ──────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col w-64 shrink-0 sticky top-0 h-screen overflow-y-auto"
        style={{
          background: 'var(--cetso-sidebar-bg)',
          borderRight: '1px solid var(--cetso-border)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Logo area */}
        <div className="px-5 py-5 flex items-center" style={{ borderBottom: '1px solid var(--cetso-border)' }}>
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/Copy of CET Logotype (White).png"
              alt="CET Logotype"
              className="h-12 w-auto object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.08)]"
            />
            <div>
              <div
                className="text-[9px] font-bold uppercase tracking-widest"
                style={{ color: 'var(--cetso-text-3)', fontFamily: 'var(--font-h2)' }}
              >
                Student Portal
              </div>
            </div>
          </Link>
        </div>

        {/* Student profile chip */}
        <div className="px-4 py-4">
          <div
            className="flex items-center gap-3 rounded-2xl p-3"
            style={{ background: 'var(--cetso-badge-bg)', border: '1px solid var(--cetso-border)' }}
          >
            <div
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-black"
              style={{
                background: 'linear-gradient(135deg, rgba(255,122,24,0.22), rgba(255,178,74,0.12))',
                border: '1px solid rgba(255,122,24,0.38)',
                color: 'var(--cetso-orange)',
              }}
            >
              {initials || '?'}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-bold" style={{ color: 'var(--cetso-text)' }}>{studentName}</div>
              {programCode ? (
                <div
                  className="mt-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: 'var(--cetso-text-3)', fontFamily: 'var(--font-h2)' }}
                >
                  {programCode}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 space-y-0.5">
          <div
            className="px-2 pb-2 text-[9px] font-bold uppercase tracking-widest"
            style={{ color: 'var(--cetso-text-3)', fontFamily: 'var(--font-h2)' }}
          >
            Navigation
          </div>
          {navItems.map((item) => {
            const active = isActive(pathname, item.to)
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 group"
                style={
                  active
                    ? {
                        background: 'rgba(255,122,24,0.12)',
                        border: '1px solid rgba(255,122,24,0.28)',
                        color: 'var(--cetso-text)',
                      }
                    : {
                        border: '1px solid transparent',
                        color: 'var(--cetso-text-2)',
                      }
                }
              >
                <div
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-lg transition"
                  style={
                    active
                      ? { background: 'rgba(255,122,24,0.18)', color: 'var(--cetso-orange)' }
                      : { background: 'var(--cetso-badge-bg)', color: 'var(--cetso-text-3)' }
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                {item.label}
                {active ? (
                  <span
                    className="ml-auto h-1.5 w-1.5 rounded-full"
                    style={{ background: 'var(--cetso-orange)', boxShadow: '0 0 8px rgba(255,122,24,0.7)' }}
                  />
                ) : null}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="px-3 py-4 space-y-2" style={{ borderTop: '1px solid var(--cetso-border)' }}>
          <div
            className="rounded-2xl p-3 mx-0"
            style={{
              background: 'rgba(255,122,24,0.07)',
              border: '1px solid rgba(255,122,24,0.18)',
            }}
          >
            <div
              className="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: 'rgba(255,178,74,0.80)', fontFamily: 'var(--font-h2)' }}
            >
              Election Rule
            </div>
            <div className="mt-1 text-[11px] font-medium leading-relaxed" style={{ color: 'var(--cetso-text-2)' }}>
              25% vote contribution per academic program.
            </div>
          </div>



          <button
            type="button"
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all"
            style={{
              color: 'var(--cetso-text-2)',
              border: '1px solid transparent',
            }}
          >
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ background: 'var(--cetso-badge-bg)' }}>
              <LogOut className="h-3.5 w-3.5" />
            </div>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main content area ──────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar (mobile + desktop supplemental) */}
        <header
          className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 lg:px-6"
          style={{
            background: 'var(--cetso-header-bg)',
            borderBottom: '1px solid var(--cetso-border)',
            backdropFilter: 'blur(24px)',
          }}
        >
          {/* Mobile: logo */}
          <Link to="/" className="flex items-center lg:hidden">
            <img
              src="/Copy of CET Logotype (White).png"
              alt="CET Logotype"
              className="h-11 w-auto object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.08)]"
            />
          </Link>

          {/* Desktop: page breadcrumb area */}
          <div className="hidden lg:block">
            <div
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--cetso-text-3)', fontFamily: 'var(--font-h2)' }}
            >
              Student Portal
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">


            {/* Mobile avatar */}
            <div className="lg:hidden flex items-center gap-2">
              <div
                className="grid h-9 w-9 place-items-center rounded-xl text-sm font-black"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,122,24,0.22), rgba(255,178,74,0.12))',
                  border: '1px solid rgba(255,122,24,0.38)',
                  color: 'var(--cetso-orange)',
                }}
              >
                {initials || '?'}
              </div>
              <button
                type="button"
                onClick={handleLogoutClick}
                className="grid h-9 w-9 place-items-center rounded-xl transition"
                style={{
                  background: 'var(--cetso-badge-bg)',
                  border: '1px solid var(--cetso-border)',
                  color: 'var(--cetso-text-2)',
                }}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-3 py-4 pb-24 sm:px-4 sm:py-6 lg:px-8 lg:pb-0">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile bottom nav ──────────────────────── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 lg:hidden"
        style={{
          background: 'var(--cetso-header-bg)',
          borderTop: '1px solid var(--cetso-border)',
          backdropFilter: 'blur(28px)',
        }}
      >
        <div className="grid grid-cols-5 gap-1 px-1.5 py-1.5">
          {navItems.map((item) => {
            const active = isActive(pathname, item.to)
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className="min-w-0 rounded-xl px-1.5 py-2 text-center text-[8px] font-bold uppercase tracking-normal transition-all min-[380px]:px-2 min-[380px]:text-[9px] min-[380px]:tracking-wide"
                style={
                  active
                    ? { background: 'rgba(255,122,24,0.12)', border: '1px solid rgba(255,122,24,0.28)', color: 'var(--cetso-text)' }
                    : { border: '1px solid transparent', color: 'var(--cetso-text-3)' }
                }
              >
                <Icon className="mx-auto h-5 w-5" style={{ color: active ? 'var(--cetso-orange)' : undefined }} />
                <span className="mt-1 block truncate">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* ── Logout Confirmation Modal ──────────────── */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0e0f14]/90 p-6 shadow-2xl backdrop-blur-2xl"
            >
              {/* Top accent light */}
              <div className="absolute -top-24 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-red-500/20 blur-[40px] pointer-events-none" />

              {/* Modal content */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 animate-pulse">
                  <AlertTriangle className="h-6 w-6" />
                </div>

                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">
                  Confirm <span className="text-red-500">Logout</span>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--cetso-text-3)] max-w-xs">
                  Are you sure you want to log out of your secure CET student session? Any unsaved voting progress will be lost.
                </p>

                <div className="mt-6 flex w-full gap-3">
                  <button
                    type="button"
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-xs font-black uppercase tracking-widest text-[var(--cetso-text-2)] transition-all hover:bg-white/10 hover:text-white active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleLogoutConfirm}
                    className="flex-1 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 py-3 text-xs font-black uppercase tracking-widest text-white shadow-[0_4px_20px_rgba(239,68,68,0.3)] transition-all hover:from-red-500 hover:to-red-400 active:scale-[0.98] border border-red-500/30"
                  >
                    Yes, Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
