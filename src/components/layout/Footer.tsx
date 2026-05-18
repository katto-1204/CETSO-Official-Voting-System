import { Link } from 'react-router-dom'
import { ShieldCheck, Terminal, Cpu, Globe, MessageCircle, Share2, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../lib/theme'

interface FooterProps {
  variant?: 'full' | 'compact'
}

export default function Footer({ variant = 'full' }: FooterProps) {
  const { theme, toggle } = useTheme()

  if (variant === 'compact') {
    return (
      <footer className="mt-auto py-10 border-t border-[var(--cetso-border)]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 opacity-30">
          <div className="flex items-center gap-3">
            <div className="h-0.5 w-8 bg-[var(--cetso-text-3)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text)]">
              CETSO Voting System
            </span>
            <div className="h-0.5 w-8 bg-[var(--cetso-text-3)]" />
          </div>

          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--cetso-text-2)]">
            Hash: 0x82C7...A1F2 • Version 2.4.0
          </div>

          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text)]">
            <span>v2.4.0</span>
            <div className="flex items-center gap-1.5 text-green-500">
              <div className="h-1 w-1 rounded-full bg-current animate-pulse" />
              System Active
            </div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer
      className="relative z-10 border-t px-6 py-16 sm:px-10 overflow-hidden"
      style={{
        borderColor: 'rgba(255,122,24,0.15)',
        background: 'linear-gradient(to bottom, var(--cetso-bg), var(--cetso-bg))',
      }}
    >
      {/* Decorative Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,122,24,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,122,24,0.2) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="mx-auto max-w-7xl relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand Section */}
          <div className="md:col-span-5 space-y-8">
            <div className="flex items-center gap-4">
              <div
                className="grid h-12 w-12 place-items-center rounded-[18px] font-black text-[var(--cetso-text)] text-xl"
                style={{
                  background: 'var(--cetso-orange)',
                  boxShadow: '0 0 30px rgba(255,122,24,0.4)',
                  border: '2px solid rgba(255,255,255,0.1)',
                }}
              >
                C
              </div>
              <div>
                <div className="text-2xl font-black uppercase tracking-widest text-[var(--cetso-text)] italic" style={{ fontFamily: 'var(--font-h1)', lineHeight: 0.9 }}>
                  CETSO<br /><span className="text-[11px] not-italic tracking-[0.4em] text-[var(--cetso-orange)] opacity-80">Official Portal</span>
                </div>
              </div>
            </div>
            
            <p className="text-sm font-medium leading-relaxed max-w-sm text-[var(--cetso-text-3)] italic">
              "The premier organization for Computer Engineering Technology students, dedicated to engineering a future built on faith, code, and action."
            </p>

            <div className="flex items-center gap-4">
              {[MessageCircle, Share2, Globe].map((Icon, i) => (
                <button
                  key={i}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 border border-[var(--cetso-border)] text-[var(--cetso-text-3)] hover:text-[var(--cetso-orange)] hover:border-[var(--cetso-orange)]/30 hover:bg-[var(--cetso-orange)]/5 transition-all"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-6">
            <div className="flex items-center gap-2">
              <Terminal className="h-3 w-3 text-[var(--cetso-orange)]" />
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--cetso-text-3)]">Navigation</div>
            </div>
            <ul className="space-y-4">
              {[
                { label: 'Login Terminal', to: '/login' },
                { label: 'Create Account', to: '/register' },
                { label: 'Admin Dashboard', to: '/admin/dashboard' },
                { label: 'Voter Dashboard', to: '/student/dashboard' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="group flex items-center gap-3 text-sm font-bold text-[var(--cetso-text-2)] hover:text-[var(--cetso-text)] transition-colors"
                  >
                    <div className="h-1 w-1 rounded-full bg-white/20 group-hover:bg-[var(--cetso-orange)] group-hover:scale-150 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* System Info */}
          <div className="md:col-span-4 space-y-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3 w-3 text-[var(--cetso-orange)]" />
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--cetso-text-3)]">System Security</div>
            </div>
            
            <div
              className="rounded-3xl p-6 space-y-4 relative overflow-hidden group"
              style={{ background: 'var(--cetso-card-bg-inset)', border: '1px solid var(--cetso-border)' }}
            >
              {/* Subtle tech background */}
              <Cpu className="absolute -right-4 -bottom-4 h-24 w-24 text-[var(--cetso-text)]/[0.02] rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-green-500/80">Network Active</span>
                </div>
                <div className="text-[9px] font-black px-2 py-0.5 rounded bg-white/5 text-[var(--cetso-text-3)] uppercase">Secure</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-medium">
                  <span className="text-[var(--cetso-text-3)] italic">Integrity:</span>
                  <span className="text-[var(--cetso-text)]/80">SHA-256 Verified</span>
                </div>
                <div className="flex justify-between text-[11px] font-medium">
                  <span className="text-[var(--cetso-text-3)] italic">Uptime:</span>
                  <span className="text-[var(--cetso-text)]/80">99.9%</span>
                </div>
                <div className="flex justify-between text-[11px] font-medium">
                  <span className="text-[var(--cetso-text-3)] italic">Location:</span>
                  <span className="text-[var(--cetso-text)]/80">CET Main Server</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--cetso-border)] flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggle}
              className="flex items-center gap-3 px-5 py-2.5 rounded-2xl border border-[var(--cetso-border)] bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--cetso-text-3)] hover:border-white/20 hover:text-[var(--cetso-text)] transition-all active:scale-95"
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              {theme === 'dark' ? 'Enable Light Mode' : 'Enable Dark Mode'}
            </button>
          </div>

          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--cetso-text-3)] text-center italic">
            © 2026 CETSO — BRIDGING FAITH & INNOVATION — ALL SYSTEMS GO
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-white/20" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--cetso-text-3)]">
                v2.4.0
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
