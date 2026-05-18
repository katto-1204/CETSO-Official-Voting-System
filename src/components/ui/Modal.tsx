import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  maxWidth?: string
  showClose?: boolean
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-2xl',
  showClose = true
}: ModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full ${maxWidth} overflow-hidden rounded-[32px] bg-[var(--cetso-modal-bg)] border border-[var(--cetso-modal-border)] shadow-[var(--cetso-modal-shadow)]`}
            style={{ backdropFilter: 'blur(32px)' }}
          >
            {/* Header */}
            {(title || showClose) && (
              <div className="flex items-center justify-between border-b border-[var(--cetso-modal-header-border)] px-8 py-6">
                {title ? (
                  <h3 className="text-xl font-black text-[var(--cetso-modal-text)] uppercase tracking-wider">{title}</h3>
                ) : <div />}
                
                {showClose && (
                  <button
                    onClick={onClose}
                    className="group relative grid h-10 w-10 place-items-center rounded-xl bg-[var(--cetso-modal-close-bg)] transition-all hover:bg-[var(--cetso-modal-close-hover-bg)]"
                  >
                    <X className="h-5 w-5 text-[var(--cetso-modal-close-icon)] transition-colors group-hover:text-[var(--cetso-modal-close-icon-hover)]" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="max-h-[80vh] overflow-y-auto px-8 py-8 custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
