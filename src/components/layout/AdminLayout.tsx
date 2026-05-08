import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import {
  LayoutDashboard, CalendarRange, Users, GraduationCap,
  Activity, BarChart3, ScrollText, LogOut, ShieldCheck, Sun, Moon,
} from 'lucide-react'
import { useTheme } from '../../lib/theme'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/elections', label: 'Elections', icon: CalendarRange },
  { to: '/admin/candidates', label: 'Candidates', icon: Users },
  { to: '/admin/students', label: 'Students', icon: GraduationCap },
  { to: '/admin/live', label: 'Live Monitor', icon: Activity },
  { to: '/admin/results', label: 'Results', icon: BarChart3 },
  { to: '/admin/audit', label: 'Audit Logs', icon: ScrollText },
] as const

export default function AdminLayout({ children }: { children?: ReactNode }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  function handleLogout() {
    localStorage.removeItem('cetso_session')
    localStorage.removeItem('cetso_role')
    localStorage.removeItem('cetso_student_id')
    localStorage.removeItem('cetso_student_name')
    navigate('/')
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--cetso-bg)' }}>

      {/* ── Admin Sidebar ─────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col w-64 shrink-0 sticky top-0 h-screen overflow-y-auto"
        style={{
          background: 'var(--cetso-sidebar-bg)',
          borderRight: '1px solid var(--cetso-border)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid var(--cetso-border)' }}>
          <Link to="/" className="flex items-center gap-2.5">
            <div
              className="grid h-9 w-9 place-items-center rounded-xl font-black text-white text-sm"
              style={{ background: 'var(--cetso-orange)', boxShadow: '0 0 20px rgba(255,122,24,0.30)' }}
            >
              C
            </div>
            <div>
              <div
                className="font-black uppercase tracking-widest leading-none"
                style={{ fontFamily: 'var(--font-h1)', fontSize: 16, color: 'var(--cetso-text)' }}
              >
                CETSO
              </div>
              <div
                className="text-[9px] font-bold uppercase tracking-widest mt-0.5"
                style={{ color: 'rgba(255,178,74,0.75)', fontFamily: 'var(--font-h2)' }}
              >
                Admin Console
              </div>
            </div>
          </Link>
        </div>

        {/* Admin badge */}
        <div className="px-4 py-4">
          <div
            className="flex items-center gap-2.5 rounded-2xl p-3"
            style={{
              background: 'rgba(255,122,24,0.08)',
              border: '1px solid rgba(255,122,24,0.24)',
            }}
          >
            <div
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
              style={{ background: 'rgba(255,122,24,0.15)', border: '1px solid rgba(255,122,24,0.30)' }}
            >
              <ShieldCheck className="h-4 w-4" style={{ color: 'var(--cetso-orange)' }} />
            </div>
            <div>
              <div
                className="text-xs font-bold"
                style={{ color: 'rgba(255,178,74,0.95)', fontFamily: 'var(--font-h2)' }}
              >
                Secure Admin
              </div>
              <div className="text-[10px] font-medium" style={{ color: 'var(--cetso-text-3)' }}>
                Live analytics
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          <div
            className="px-2 pb-2 text-[9px] font-bold uppercase tracking-widest"
            style={{ color: 'var(--cetso-text-3)', fontFamily: 'var(--font-h2)' }}
          >
            Management
          </div>
          {navItems.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150"
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

        {/* Footer */}
        <div className="px-3 py-4 space-y-1.5" style={{ borderTop: '1px solid var(--cetso-border)' }}>
          <button
            type="button"
            onClick={toggle}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all"
            style={{ color: 'var(--cetso-text-2)', border: '1px solid transparent' }}
          >
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ background: 'var(--cetso-badge-bg)' }}>
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </div>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all"
            style={{ color: 'var(--cetso-text-2)', border: '1px solid transparent' }}
          >
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ background: 'var(--cetso-badge-bg)' }}>
              <LogOut className="h-3.5 w-3.5" />
            </div>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top header */}
        <header
          className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 lg:px-6"
          style={{
            background: 'var(--cetso-header-bg)',
            borderBottom: '1px solid var(--cetso-border)',
            backdropFilter: 'blur(24px)',
          }}
        >
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <div
              className="grid h-8 w-8 place-items-center rounded-lg font-black text-white text-xs"
              style={{ background: 'var(--cetso-orange)' }}
            >
              C
            </div>
            <span
              className="font-black uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-h1)', fontSize: 15, color: 'var(--cetso-text)' }}
            >
              CETSO
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" style={{ color: 'var(--cetso-orange)' }} />
            <span
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--cetso-text-3)', fontFamily: 'var(--font-h2)' }}
            >
              Admin Console
            </span>
          </div>

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
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="lg:hidden grid h-9 w-9 place-items-center rounded-xl transition"
              style={{
                background: 'var(--cetso-badge-bg)',
                border: '1px solid var(--cetso-border)',
                color: 'var(--cetso-text-2)',
              }}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  )
}
