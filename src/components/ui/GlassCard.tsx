import clsx from 'clsx'
import type { CSSProperties, ReactNode } from 'react'

type Variant = 'default' | 'elevated' | 'orange' | 'inset'

type Props = {
  children: ReactNode
  className?: string
  variant?: Variant
  style?: CSSProperties
  onClick?: () => void
}

export default function GlassCard({ children, className, variant = 'default', style, onClick }: Props) {
  const base = 'rounded-[28px] border backdrop-blur-xl transition-all duration-200'

  const variants: Record<Variant, string> = {
    default:
      'bg-[var(--cetso-surface)] border-[var(--cetso-border)] shadow-[0_24px_64px_rgba(0,0,0,0.55),0_4px_16px_rgba(0,0,0,0.30),inset_0_1px_0_rgba(255,255,255,0.07)]',
    elevated:
      'bg-[rgba(255,255,255,0.07)] border-[var(--cetso-border-2)] shadow-[0_32px_80px_rgba(0,0,0,0.65),0_8px_24px_rgba(0,0,0,0.40),inset_0_1px_0_rgba(255,255,255,0.10)]',
    orange:
      'bg-[rgba(255,122,24,0.08)] border-[rgba(255,122,24,0.30)] shadow-[0_24px_64px_rgba(0,0,0,0.50),0_0_48px_rgba(255,122,24,0.08),inset_0_1px_0_rgba(255,178,74,0.12)]',
    inset:
      'bg-[rgba(0,0,0,0.22)] border-[rgba(255,255,255,0.06)] shadow-[inset_0_2px_8px_rgba(0,0,0,0.35),0_4px_16px_rgba(0,0,0,0.25)]',
  }

  return (
    <div
      className={clsx(base, variants[variant], onClick && 'cursor-pointer', className)}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
