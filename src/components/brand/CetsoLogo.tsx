export default function CetsoLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/Copy of CET Logotype (White).png"
        alt="CET Logotype"
        className="h-12 w-auto object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.08)]"
      />
      {!compact ? (
        <div className="leading-tight">
          <div className="text-[11px] font-semibold text-[var(--cetso-text-2)] tracking-widest uppercase">
            Elections 2026
          </div>
        </div>
      ) : null}
    </div>
  )
}
