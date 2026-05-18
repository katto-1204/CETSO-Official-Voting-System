import { Link } from 'react-router-dom'
import { Globe, MessageCircle, Share2, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../lib/theme'

interface FooterProps {
  variant?: 'full' | 'compact'
}

export default function Footer({ variant = 'full' }: FooterProps) {
  const { theme, toggle } = useTheme()

  if (variant === 'compact') {
    return (
      <footer className="mt-auto py-8 border-t border-white/[0.06] bg-black/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-white/40">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--cetso-orange)]">
              CET Voting Portal
            </span>
          </div>

          <div className="text-[9px] font-semibold tracking-[0.15em] uppercase">
            © 2026 College of Engineering and Technology
          </div>

          <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.15em]">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              Secure
            </div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer
      className="relative z-10 border-t px-6 pt-20 pb-12 sm:px-10 overflow-hidden"
      style={{
        borderColor: 'var(--cetso-border)',
        background: 'var(--cetso-bg)',
      }}
    >
      <div className="mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          {/* Brand Section */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex flex-col gap-4">
              <img
                src="/Copy of CET Logotype (White).png"
                alt="CET Logotype"
                className="h-12 w-auto object-contain self-start filter invert dark:invert-0 transition-all duration-300"
              />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--cetso-orange)] opacity-80">
                Official Voting Portal
              </span>
            </div>
            
            <p className="text-sm font-medium leading-relaxed max-w-sm text-[var(--cetso-text-3)]">
              Dedicated to engineering a future built on digital innovation, technical excellence, and progressive academic leadership.
            </p>

            <div className="space-y-3">
              <div className="text-[10px] font-black uppercase tracking-wider text-[var(--cetso-text-3)]">Follow us on</div>
              <div className="flex items-center gap-3">
                {[MessageCircle, Share2, Globe].map((Icon, i) => (
                  <button
                    key={i}
                    className="grid h-10 w-10 place-items-center rounded-full bg-white/5 border border-[var(--cetso-border)] text-[var(--cetso-text-3)] hover:text-[var(--cetso-orange)] hover:border-[var(--cetso-orange)]/30 hover:bg-[var(--cetso-orange)]/5 transition-all"
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-6">
            <div className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--cetso-text-2)]">Navigation</div>
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
                    className="text-sm font-bold text-[var(--cetso-text-3)] hover:text-[var(--cetso-orange)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* System Info */}
          <div className="md:col-span-4 space-y-6">
            <div className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--cetso-text-2)]">System Security</div>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                <span className="text-xs font-black uppercase tracking-[0.15em] text-emerald-500/80">Network Active</span>
              </div>
              <div className="space-y-2 text-[var(--cetso-text-3)] font-medium">
                <div className="flex justify-between">
                  <span>Integrity:</span>
                  <span className="text-[var(--cetso-text)]/80">SHA-256 Verified</span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="text-[var(--cetso-text)]/80">99.9%</span>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="text-[var(--cetso-text)]/80">CET Main Server</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--cetso-border)] flex flex-col sm:flex-row items-center justify-between gap-8 text-[var(--cetso-text-3)] font-medium text-xs">
          <div>
            © 2026 College of Engineering and Technology. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={toggle}
              className="flex items-center gap-2 hover:text-[var(--cetso-orange)] transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="text-[10px] font-black uppercase tracking-wider">
                {theme === 'dark' ? 'Light' : 'Dark'}
              </span>
            </button>
            <div className="h-3 w-px bg-[var(--cetso-border)]" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              v2.4.0
            </span>
          </div>
        </div>
      </div>

      {/* Massive Low-Opacity Background Watermark */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none select-none z-0 h-[16vw] flex items-end justify-center select-none">
        <div 
          className="text-[20vw] font-black uppercase tracking-[0.1em] leading-none text-white/[0.02] dark:text-white/[0.015] select-none font-sans"
          style={{ 
            fontFamily: 'var(--font-h1)',
            transform: 'translateY(32%)',
          }}
        >
          CETSO
        </div>
      </div>
    </footer>
  )
}
