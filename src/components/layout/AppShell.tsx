import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Vote, FileCheck, UserCircle, LogOut, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../lib/theme'
import Footer from './Footer'

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
  const { theme, toggle } = useTheme()

  const studentName = localStorage.getItem('cetso_student_name') ?? 'Student'
  const programCode = localStorage.getItem('cetso_program_code') ?? ''
  const initials = studentName.split(' ').slice(0, 2).map((p: string) => p[0]).join('').toUpperCase()

  function handleLogout() {
    localStorage.removeItem('cetso_session')
    localStorage.removeItem('cetso_role')
    localStorage.removeItem('cetso_student_id')
    localStorage.removeItem('cetso_student_name')
    localStorage.removeItem('cetso_program_code')
    localStorage.removeItem('cetso_year_level')
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
        <div className="px-5 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid var(--cetso-border)' }}>
          <Link to="/" className="flex items-center gap-2.5">
            <div
              className="grid h-9 w-9 place-items-center rounded-xl font-black text-white text-sm"
              style={{ background: 'var(--cetso-orange)', boxShadow: '0 0 20px rgba(255,122,24,0.35)' }}
            >
              C
            </div>
            <div>
              <div
                className="text-xs font-black uppercase tracking-widest leading-none"
                style={{ fontFamily: 'var(--font-h1)', fontSize: 16, color: 'var(--cetso-text)' }}
              >
                CETSO
              </div>
              <div
                className="text-[9px] font-bold uppercase tracking-widest mt-0.5"
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
                        color: 'white',
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
            onClick={toggle}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all"
            style={{ color: 'var(--cetso-text-2)', border: '1px solid transparent' }}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>

          <button
            type="button"
            onClick={handleLogout}
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
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <div
              className="grid h-8 w-8 place-items-center rounded-lg font-black text-white text-xs"
              style={{ background: 'var(--cetso-orange)' }}
            >
              C
            </div>
            <span
              className="font-black uppercase tracking-widest text-xs"
              style={{ fontFamily: 'var(--font-h1)', fontSize: 15, color: 'var(--cetso-text)' }}
            >
              CETSO
            </span>
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
            <button
              type="button"
              onClick={toggle}
              className="lg:hidden grid h-9 w-9 place-items-center rounded-xl transition"
              style={{
                background: 'var(--cetso-badge-bg)',
                border: '1px solid var(--cetso-border)',
                color: 'var(--cetso-text-2)',
              }}
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

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
                onClick={handleLogout}
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

          <Footer variant="compact" />
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
                    ? { background: 'rgba(255,122,24,0.12)', border: '1px solid rgba(255,122,24,0.28)', color: 'white' }
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
    </div>
  )
}
