
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { type ReactNode, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CalendarRange, Users, GraduationCap,
  Activity, BarChart3, ScrollText, LogOut, ShieldCheck,
  Terminal, Wifi, Database, Cpu, User, AlertTriangle
} from 'lucide-react'
import { goeyToast } from 'goey-toast'

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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const role = localStorage.getItem('cetso_role')

  useEffect(() => {
    if (role !== 'admin') {
      goeyToast.error('Access Denied: Administrator clearance required.')
      navigate('/login', { replace: true })
    }
  }, [role, navigate])

  if (role !== 'admin') {
    return null
  }

  function handleLogoutClick() {
    setShowLogoutConfirm(true)
  }

  function handleLogoutConfirm() {
    localStorage.removeItem('cetso_session')
    localStorage.removeItem('cetso_role')
    localStorage.removeItem('cetso_student_id')
    localStorage.removeItem('cetso_student_name')
    navigate('/')
  }

  return (
    <div className="flex min-h-screen relative overflow-hidden" style={{ background: 'var(--cetso-bg)' }}>

      {/* Background Cyberpunk decoration */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,122,24,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,122,24,0.1) 1px, transparent 1px)`,
            backgroundSize: '100px 100px'
          }}
        />
      </div>

      {/* ── Admin Sidebar ─────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col w-72 shrink-0 sticky top-0 h-screen overflow-hidden group"
        style={{
          background: 'var(--cetso-sidebar-bg)',
          borderRight: '1px solid var(--cetso-border)',
          backdropFilter: 'blur(32px)',
        }}
      >
        {/* Animated Scanline Sidebar */}
        <motion.div
          className="absolute left-0 right-0 h-[1px] bg-[var(--cetso-orange)]/10 z-10"
          animate={{ y: ['0%', '1000%'] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />

        {/* Logo Section */}
        <div className="px-6 py-6 relative">
          <Link to="/" className="flex items-center gap-3 group/logo">
            <img
              src="/Copy of CET Logotype (White).png"
              alt="CET Logotype"
              className="h-15 w-auto object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.08)]"
            />
            <div>
              <div
                className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2"
                style={{ color: 'rgba(255,178,74,0.85)', fontFamily: 'var(--font-h2)' }}
              >
                <div className="h-1 w-1 rounded-full bg-orange-500 animate-pulse" />
                Admin Dashboard
              </div>
            </div>
          </Link>
        </div>

        {/* System Health / Admin Info */}
        <div className="px-5 mb-6">
          <div
            className="relative rounded-2xl p-4 overflow-hidden group/card"
            style={{
              background: 'rgba(255,122,24,0.04)',
              border: '1px solid rgba(255,122,24,0.15)',
            }}
          >
            <div className="flex items-center gap-3 relative z-10">
              <div
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-transform group-hover/card:scale-110"
                style={{ background: 'rgba(255,122,24,0.1)', border: '1px solid rgba(255,122,24,0.2)' }}
              >
                <ShieldCheck className="h-5 w-5" style={{ color: 'var(--cetso-orange)' }} />
              </div>
              <div>
                <div
                  className="text-xs font-black uppercase tracking-widest italic"
                  style={{ color: 'var(--cetso-text)', fontFamily: 'var(--font-h2)' }}
                >
                  Admin Access
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map(i => <div key={i} className="h-1 w-2 rounded-full bg-orange-500" />)}
                    <div className="h-1 w-2 rounded-full bg-[var(--cetso-border)]" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--cetso-text-3)]">Secure</span>
                </div>
              </div>
            </div>

            {/* Background pattern */}
            <div className="absolute top-0 right-0 p-2 opacity-[0.03]">
              <Terminal className="h-12 w-12" />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div
            className="px-3 pb-3 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3"
            style={{ color: 'var(--cetso-text-3)', fontFamily: 'var(--font-h2)' }}
          >
            <div className="h-px flex-1 bg-[var(--cetso-border)]" />
            Navigation
            <div className="h-px flex-1 bg-[var(--cetso-border)]" />
          </div>

          {navItems.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className="relative flex items-center gap-4 rounded-2xl px-4 py-3.5 text-[13px] font-black uppercase tracking-widest transition-all duration-300 group/nav"
                style={
                  active
                    ? {
                      background: 'rgba(255,122,24,0.08)',
                      border: '1px solid rgba(255,122,24,0.25)',
                      color: 'var(--cetso-text)',
                      boxShadow: 'inset 0 0 20px rgba(255,122,24,0.05)'
                    }
                    : {
                      border: '1px solid transparent',
                      color: 'var(--cetso-text-2)',
                    }
                }
              >
                <div
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-xl transition-all duration-500"
                  style={
                    active
                      ? { background: 'rgba(255,122,24,0.2)', color: 'var(--cetso-orange)', transform: 'rotate(-4deg)' }
                      : { background: 'var(--cetso-surface-3)', color: 'var(--cetso-text-3)' }
                  }
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`transition-transform duration-300 ${active ? 'translate-x-1' : 'group-hover/nav:translate-x-1'}`}>
                  {item.label}
                </span>

                {active && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute left-0 w-1 h-6 bg-orange-500 rounded-r-full"
                    style={{ boxShadow: '0 0 15px var(--cetso-orange)' }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* System Status */}
        <div className="p-5 mt-auto">
          <div className="rounded-2xl bg-[var(--cetso-surface-2)] border border-[var(--cetso-border)] p-4 space-y-3">
            <div className="flex justify-between items-end">
              <div className="text-[9px] font-black uppercase tracking-widest text-[var(--cetso-text-3)]">System Load</div>
              <div className="text-[10px] font-mono text-orange-500">24.2ms</div>
            </div>
            <div className="h-1 w-full bg-[var(--cetso-border)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-orange-500/50"
                initial={{ width: '0%' }}
                animate={{ width: '45%' }}
                transition={{ duration: 1 }}
              />
            </div>
            <div className="flex gap-2 text-[8px] font-black uppercase tracking-widest text-[var(--cetso-text-3)] opacity-60">
              <span className="flex items-center gap-1"><Wifi className="h-2 w-2" /> Encrypted</span>
              <span className="flex items-center gap-1"><Database className="h-2 w-2" /> Sync</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-6 border-t border-[var(--cetso-border)] bg-[var(--cetso-surface-2)]/50">
          <button
            type="button"
            onClick={handleLogoutClick}
            className="w-full h-12 flex items-center justify-center gap-3 rounded-2xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors text-red-500 font-black uppercase tracking-widest text-[11px]"
          >
            <LogOut className="h-4 w-4" /> Exit Console
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">

        {/* Mobile Header */}
        <header
          className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 lg:hidden"
          style={{
            background: 'var(--cetso-header-bg)',
            borderBottom: '1px solid var(--cetso-border)',
            backdropFilter: 'blur(32px)',
          }}
        >
          <Link to="/" className="flex items-center">
            <img
              src="/Copy of CET Logotype (White).png"
              alt="CET Logotype"
              className="h-12 w-auto object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.08)]"
            />
          </Link>

          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={handleLogoutClick}
              className="grid h-10 w-10 place-items-center rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Admin Header for Desktop */}
        <div
          className="hidden lg:flex items-center justify-between px-8 py-4 border-b sticky top-0 z-30 backdrop-blur-md"
          style={{
            background: 'var(--cetso-header-bg)',
            borderColor: 'var(--cetso-border)'
          }}
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--cetso-text-3)]">Server 01</span>
            </div>
            <div className="h-4 w-px bg-[var(--cetso-border)]" />
            <div className="flex items-center gap-2 text-green-500">
              <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Stream Active</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: 'var(--cetso-text)' }}>Admin</div>
              <div className="text-[11px] font-bold text-[var(--cetso-orange)] uppercase italic tracking-tighter">ADMIN</div>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-[var(--cetso-orange)]/10 border border-[var(--cetso-orange)]/20 grid place-items-center">
              <User className="h-5 w-5 text-[var(--cetso-orange)]" />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 px-4 py-8 pb-24 lg:px-12 lg:py-10 max-w-[1600px] mx-auto w-full">
          {children ?? <Outlet />}
        </main>
      </div>

      {/* ── Mobile bottom nav ──────────────────────── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 lg:hidden overflow-x-auto custom-scrollbar"
        style={{
          background: 'var(--cetso-header-bg)',
          borderTop: '1px solid var(--cetso-border)',
          backdropFilter: 'blur(28px)',
        }}
      >
        <div className="flex gap-1 px-1.5 py-1.5 min-w-max">
          {navItems.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex-1 min-w-[72px] rounded-xl px-1.5 py-2 text-center text-[9px] font-bold uppercase tracking-wide transition-all"
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
                  Exit <span className="text-red-500">Console</span>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--cetso-text-3)] max-w-xs">
                  Are you sure you want to exit the Administrative Console? Your secure session will be closed.
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
                    Yes, Exit
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
