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
          'bg-[var(--cetso-orange)] text-black font-bold',
          'shadow-[0_0_0_1px_rgba(255,122,24,0.32),0_4px_24px_rgba(255,122,24,0.30),0_1px_0_rgba(255,255,255,0.15)_inset]',
          'hover:bg-[#ff8c2e] hover:shadow-[0_0_0_1px_rgba(255,122,24,0.50),0_4px_32px_rgba(255,122,24,0.45),0_1px_0_rgba(255,255,255,0.20)_inset]',
          'hover:scale-[1.02]',
        ].join(' '),
        variant === 'secondary' && [
          'bg-[rgba(255,255,255,0.05)] text-[var(--cetso-text)]',
          'border border-[var(--cetso-border)] backdrop-blur-sm',
          'shadow-[0_2px_8px_rgba(0,0,0,0.30),inset_0_1px_0_rgba(255,255,255,0.07)]',
          'hover:bg-[rgba(255,255,255,0.09)] hover:border-[rgba(255,255,255,0.20)] hover:scale-[1.02]',
        ].join(' '),
        variant === 'ghost' && [
          'bg-transparent text-[var(--cetso-text-2)]',
          'border border-transparent',
          'hover:bg-[rgba(255,255,255,0.07)] hover:text-[var(--cetso-text)] hover:border-[rgba(255,255,255,0.12)]',
        ].join(' '),
        variant === 'danger' && [
          'bg-[rgba(220,38,38,0.12)] text-[rgba(252,165,165,0.95)]',
          'border border-[rgba(220,38,38,0.32)]',
          'shadow-[0_2px_8px_rgba(0,0,0,0.25)]',
          'hover:bg-[rgba(220,38,38,0.20)] hover:border-[rgba(220,38,38,0.50)] hover:scale-[1.02]',
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
