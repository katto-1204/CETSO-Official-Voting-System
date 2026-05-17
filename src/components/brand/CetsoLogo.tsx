export default function CetsoLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        aria-hidden="true"
        className="relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255,122,24,0.22) 0%, rgba(255,178,74,0.12) 100%)',
          border: '1px solid rgba(255,122,24,0.40)',
          boxShadow: '0 0 0 1px rgba(255,122,24,0.12), 0 0 32px rgba(255,122,24,0.28), 0 4px 16px rgba(0,0,0,0.35)',
        }}
      >
        <img
          src="/CETLOGO.png"
          alt="CET Logo"
          className="h-7 w-7 object-contain relative z-10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background: 'radial-gradient(circle at 30% 25%, rgba(255,178,74,0.18), transparent 65%)',
          }}
        />
      </div>
      {!compact ? (
        <div className="leading-tight">
          <div
            className="font-[var(--font-heading)] tracking-wide text-2xl"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.82) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            CETSO
          </div>
          <div className="text-[11px] font-semibold text-[var(--cetso-text-2)] tracking-widest uppercase">
            Elections 2026
          </div>
        </div>
      ) : null}
    </div>
  )
}
