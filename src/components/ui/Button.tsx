import { type ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  type,
  loading,
  children,
  ...props
}: Props) {
  return (
    <button
      type={type ?? 'button'}
      disabled={loading || props.disabled}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 rounded-2xl relative',
        'focus-visible:outline-none active:scale-[0.97]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        size === 'sm' && 'h-9 px-4 text-xs tracking-wide',
        size === 'md' && 'h-11 px-5 text-sm',
        size === 'lg' && 'h-13 px-6 text-[15px]',
        variant === 'primary' && [
          'bg-[var(--cetso-btn-primary-bg)] text-[var(--cetso-btn-primary-text)] font-bold',
          'shadow-[var(--cetso-btn-primary-shadow)]',
          'hover:bg-[#ff8c2e] hover:shadow-[var(--cetso-btn-primary-hover-shadow)]',
          'hover:scale-[1.02]',
        ].join(' '),
        variant === 'secondary' && [
          'bg-[var(--cetso-btn-secondary-bg)] text-[var(--cetso-btn-secondary-text)]',
          'border border-[var(--cetso-border)] backdrop-blur-sm',
          'shadow-[var(--cetso-btn-secondary-shadow)]',
          'hover:bg-[var(--cetso-btn-secondary-hover-bg)] hover:border-[var(--cetso-border-2)] hover:scale-[1.02]',
        ].join(' '),
        variant === 'ghost' && [
          'bg-transparent text-[var(--cetso-text-2)]',
          'border border-transparent',
          'hover:bg-[var(--cetso-btn-ghost-hover-bg)] hover:text-[var(--cetso-text)]',
        ].join(' '),
        variant === 'danger' && [
          'bg-[var(--cetso-btn-danger-bg)] text-[var(--cetso-btn-danger-text)]',
          'border border-[var(--cetso-btn-danger-border)]',
          'shadow-[var(--cetso-btn-danger-shadow)]',
          'hover:bg-[var(--cetso-btn-danger-hover-bg)] hover:scale-[1.02]',
        ].join(' '),
        loading && 'text-transparent transition-none',
        className
      )}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </div>
      )}
      {children}
    </button>
  )
}
