import clsx from 'clsx'
import type { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
  error?: string
}

export default function TextField({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: Props) {
  const fieldId = id ?? props.name ?? label ?? 'field'

  return (
    <div className={clsx('w-full', className)}>
      {label ? (
        <label
          htmlFor={String(fieldId)}
          className="mb-2 block text-sm font-semibold text-[var(--cetso-text)] tracking-[-0.01em]"
        >
          {label}
        </label>
      ) : null}
      <input
        id={String(fieldId)}
        className={clsx(
          'w-full rounded-2xl px-4 py-3 text-sm text-[var(--cetso-text)]',
          'bg-[var(--cetso-input-bg)] backdrop-blur-sm',
          'border transition-all duration-200',
          'placeholder:text-[var(--cetso-text-3)]',
          'shadow-[var(--cetso-input-shadow)]',
          error
            ? 'border-[rgba(239,68,68,0.55)] bg-[rgba(239,68,68,0.05)] shadow-[var(--cetso-input-error-shadow)]'
            : [
                'border-[var(--cetso-border)]',
                'hover:border-[var(--cetso-input-border-hover)]',
                'focus:border-[var(--cetso-border-strong)] focus:bg-[rgba(255,122,24,0.04)]',
                'focus:shadow-[var(--cetso-input-focus-shadow)]',
                'focus:outline-none',
              ].join(' ')
        )}
        {...props}
      />
      {error ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[rgba(239,100,100,0.95)]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[rgba(239,68,68,0.8)]" />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-2 text-xs text-[var(--cetso-text-2)]">{hint}</p>
      ) : null}
    </div>
  )
}
