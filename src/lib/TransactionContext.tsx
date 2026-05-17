import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Activity } from 'lucide-react'

type TransactionContextType = {
  isTransactionActive: boolean
  transactionLabel: string
  setTransactionActive: (active: boolean, label?: string) => void
  runTransaction: <T>(fn: () => Promise<T>, label?: string) => Promise<T>
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export function useTransaction() {
  const context = useContext(TransactionContext)
  if (!context) {
    throw new Error('useTransaction must be used within a TransactionProvider')
  }
  return context
}

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [isTransactionActive, setIsActive] = useState(false)
  const [transactionLabel, setLabel] = useState('TRANSACTION IN PROGRESS')

  const setTransactionActive = (active: boolean, label?: string) => {
    setIsActive(active)
    if (label) setLabel(label)
  }

  const runTransaction = async <T,>(fn: () => Promise<T>, label?: string): Promise<T> => {
    setIsActive(true)
    if (label) setLabel(label)
    try {
      return await fn()
    } finally {
      setIsActive(false)
    }
  }

  return (
    <TransactionContext.Provider
      value={{
        isTransactionActive,
        transactionLabel,
        setTransactionActive,
        runTransaction,
      }}
    >
      {children}

      <AnimatePresence>
        {isTransactionActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md select-none pointer-events-auto"
          >
            {/* Holographic scanner background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:100%_8px]" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:8px_100%]" />
              <motion.div 
                animate={{ y: ['0%', '100%'] }} 
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute top-0 left-0 right-0 h-0.5 bg-orange-500 shadow-[0_0_20px_#ff7a18]" 
              />
            </div>

            <div className="relative max-w-sm w-full mx-4 p-8 rounded-3xl border border-orange-500/20 bg-[#07070c]/80 shadow-[0_0_50px_rgba(255,122,24,0.15)] text-center space-y-6">
              {/* Spinner ring & icons */}
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                {/* Glowing orbital ring */}
                <div className="absolute inset-0 rounded-full border-2 border-orange-500/10" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-orange-500 border-r-orange-500 shadow-[0_0_15px_rgba(255,122,24,0.4)]"
                />
                
                {/* Micro-animating core icons */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative z-10"
                >
                  <ShieldCheck className="h-10 w-10 text-orange-500 drop-shadow-[0_0_8px_rgba(255,122,24,0.5)]" />
                </motion.div>
              </div>

              {/* Transaction Labels */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-orange-500/80">
                  <Activity className="h-3 w-3 animate-pulse text-orange-500" />
                  <span>SECURE CONNECTIVITY</span>
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                  {transactionLabel}
                </h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                  WRITING RECORD TO LEDGER • DO NOT REFRESH
                </p>
              </div>

              {/* Status monitor logs */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 font-mono text-[9px] text-left text-white/50 space-y-1.5 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span className="text-orange-500 font-bold">[SYS]</span>
                  <span>INITIATING CRYPTO HANDSHAKE</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">[OK]</span>
                  <span>COMMITTING RELATIONAL TRANSACTION</span>
                </div>
                <div className="flex items-center gap-2 animate-pulse">
                  <span className="text-orange-500 font-bold">[...]</span>
                  <span>WAITING FOR SUPABASE CONFIRMATION</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </TransactionContext.Provider>
  )
}
