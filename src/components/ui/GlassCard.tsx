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
      'bg-[var(--cetso-card-bg-default)] border-[var(--cetso-card-border-default)] shadow-[var(--cetso-card-shadow-default)]',
    elevated:
      'bg-[var(--cetso-card-bg-elevated)] border-[var(--cetso-card-border-elevated)] shadow-[var(--cetso-card-shadow-elevated)]',
    orange:
      'bg-[var(--cetso-card-bg-orange)] border-[var(--cetso-card-border-orange)] shadow-[var(--cetso-card-shadow-orange)]',
    inset:
      'bg-[var(--cetso-card-bg-inset)] border-[var(--cetso-card-border-inset)] shadow-[var(--cetso-card-shadow-inset)]',
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
