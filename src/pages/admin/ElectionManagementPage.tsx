import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CalendarRange, CalendarDays, LockKeyhole, Unlock, Zap, CheckCircle2 } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import { ELECTION } from '../../lib/electionData'
import { updateElectionConfig, subscribeToElectionConfig } from '../../lib/electionConfig'
import type { ElectionConfig } from '../../lib/electionConfig'
import { goeyToast } from 'goey-toast'

function toDateTimeLocal(value: Date) {
  const offsetMs = value.getTimezoneOffset() * 60_000
  return new Date(value.getTime() - offsetMs).toISOString().slice(0, 16)
}

function isNowInsideWindow(startDate: string, endDate: string) {
  const now = Date.now()
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  return Number.isFinite(start) && Number.isFinite(end) && now >= start && now < end
}

export default function ElectionManagementPage() {
  const [enabled, setEnabled] = useState(() => localStorage.getItem('cetso_election_enabled') !== 'false')
  const [startDate, setStartDate] = useState(() => localStorage.getItem('cetso_election_start_date') || new Date().toISOString().slice(0, 16))
  const [endDate, setEndDate] = useState(() =>
    localStorage.getItem('cetso_election_end_date') || new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().slice(0, 16)
  )
  const [saved, setSaved] = useState(false)
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [configError, setConfigError] = useState('')
  const [savingConfig, setSavingConfig] = useState(false)
  const votingEffectiveOpen = enabled && isNowInsideWindow(startDate, endDate)

  useEffect(() => {
    // Subscribe to database changes for real-time admin sync across tabs/devices
    const unsubscribe = subscribeToElectionConfig((config) => {
      setEnabled(config.enabled)
      setStartDate(config.startDate)
      setEndDate(config.endDate)
      setConfigError('')
      setLoadingConfig(false)
    }, (error) => {
      setConfigError(error.message)
      setLoadingConfig(false)
    })
    return () => unsubscribe()
  }, [])

  async function handleToggleEnabled() {
    const nextVal = !enabled
    const previousVal = enabled
    const previousStartDate = startDate
    const previousEndDate = endDate
    setSavingConfig(true)
    setEnabled(nextVal)
    try {
      let nextConfig: Partial<ElectionConfig> = { enabled: nextVal }
      if (nextVal && !isNowInsideWindow(startDate, endDate)) {
        const activeStartDate = toDateTimeLocal(new Date())
        const activeEndDate = toDateTimeLocal(new Date(Date.now() + 24 * 60 * 60 * 1000))
        nextConfig = { enabled: true, startDate: activeStartDate, endDate: activeEndDate }
        setStartDate(activeStartDate)
        setEndDate(activeEndDate)
      }

      await updateElectionConfig(nextConfig)
      setConfigError('')
      goeyToast.success(nextVal ? 'Voting is now open for students.' : 'Voting is now closed.')
    } catch (error: any) {
      setEnabled(previousVal)
      setStartDate(previousStartDate)
      setEndDate(previousEndDate)
      setConfigError(error.message || 'Could not update voting status.')
      goeyToast.error(error.message || 'Could not update voting status.')
    } finally {
      setSavingConfig(false)
    }
  }

  async function saveSchedule() {
    setSavingConfig(true)
    try {
      await updateElectionConfig({ startDate, endDate })
      setConfigError('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (error: any) {
      setConfigError(error.message || 'Could not save schedule.')
      goeyToast.error(error.message || 'Could not save schedule.')
    } finally {
      setSavingConfig(false)
    }
  }

  async function resetSchedule() {
    const defaultStart = new Date().toISOString().slice(0, 16)
    const defaultEnd = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().slice(0, 16)
    setStartDate(defaultStart)
    setEndDate(defaultEnd)
    setSavingConfig(true)
    try {
      await updateElectionConfig({ startDate: defaultStart, endDate: defaultEnd })
      setConfigError('')
    } catch (error: any) {
      setConfigError(error.message || 'Could not reset schedule.')
      goeyToast.error(error.message || 'Could not reset schedule.')
    } finally {
      setSavingConfig(false)
    }
  }


  return (
    <div className="space-y-5">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[32px] p-6 border transition-colors duration-300"
          style={{
            background: 'var(--cetso-surface-1)',
            borderColor: 'var(--cetso-border)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'var(--cetso-card-shadow)',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
              style={{ background: 'rgba(255,122,24,0.12)', border: '1px solid rgba(255,122,24,0.28)' }}
            >
              <CalendarRange className="h-6 w-6 text-[var(--cetso-orange)]" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]">Admin</div>
              <h1
                style={{
                  fontFamily: 'var(--font-h1)',
                  fontSize: 'clamp(24px, 4vw, 44px)',
                  lineHeight: 0.93,
                  letterSpacing: '0.01em',
                  color: 'var(--cetso-text)',
                  marginTop: 4,
                }}
              >
                ELECTION MANAGEMENT
              </h1>
              <div className="mt-0.5 text-sm font-medium text-[var(--cetso-text-2)]">
                Create elections, schedule dates, and toggle voting availability.
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">

          {/* Election overview */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="lg:col-span-7"
          >
            <GlassCard className="p-5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]">Current Election</div>
              <div className="mt-1.5 text-xl font-black text-[var(--cetso-text)]">{ELECTION.name}</div>

              {/* Status banner */}
              <div
                className="mt-4 flex items-center justify-between gap-4 rounded-2xl p-4"
                style={enabled ? {
                  background: 'rgba(34,197,94,0.08)',
                  border: '1px solid rgba(34,197,94,0.28)',
                } : {
                  background: 'rgba(239,68,68,0.07)',
                  border: '1px solid rgba(239,68,68,0.25)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="grid h-9 w-9 place-items-center rounded-xl"
                    style={enabled ? {
                      background: 'rgba(34,197,94,0.16)',
                      border: '1px solid rgba(34,197,94,0.35)',
                    } : {
                      background: 'rgba(239,68,68,0.14)',
                      border: '1px solid rgba(239,68,68,0.30)',
                    }}
                  >
                    {enabled
                      ? <Unlock className="h-4 w-4 text-[rgba(134,239,172,0.90)]" />
                      : <LockKeyhole className="h-4 w-4 text-[rgba(252,165,165,0.80)]" />
                    }
                  </div>
                <div>
                  <div className="text-sm font-bold text-[var(--cetso-text)]">
                      {loadingConfig ? 'Checking voting status...' : `Voting is ${votingEffectiveOpen ? 'Open' : 'Closed'}`}
                  </div>
                  <div className="text-xs font-medium text-[var(--cetso-text-2)]">
                      {loadingConfig
                        ? 'Reading latest status from Supabase.'
                        : votingEffectiveOpen
                        ? 'Students can submit votes now.'
                        : enabled
                        ? 'Voting is enabled, but the schedule window is not active.'
                        : 'Voting has been disabled.'}
                  </div>
                </div>
                </div>

                {/* Toggle */}
                <button
                  type="button"
                  onClick={handleToggleEnabled}
                  disabled={loadingConfig || savingConfig}
                  className="relative flex items-center"
                  aria-label={enabled ? 'Close voting' : 'Open voting'}
                >
                  <div
                    className="h-7 w-12 rounded-full border transition-all duration-300"
                    style={enabled ? {
                      background: 'rgba(34,197,94,0.25)',
                      borderColor: 'rgba(34,197,94,0.50)',
                    } : {
                      background: 'var(--cetso-surface-3)',
                      borderColor: 'var(--cetso-border)',
                    }}
                  >
                    <div
                      className="absolute top-1 h-5 w-5 rounded-full transition-all duration-300"
                      style={{ left: enabled ? '26px' : '2px', background: 'var(--cetso-text)', boxShadow: '0 1px 4px rgba(0,0,0,0.30)' }}
                    />
                  </div>
                </button>
              </div>

              {/* Info table */}
              <div
                className="mt-4 overflow-hidden rounded-2xl"
                style={{ border: '1px solid var(--cetso-border)' }}
              >
                <table className="w-full border-collapse">
                  <thead>
                    <tr style={{ background: 'var(--cetso-surface-2)' }}>
                      {['Election', 'Status', 'Toggle Voting'].map((h) => (
                        <th
                          key={h}
                          className="p-3 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderTop: '1px solid var(--cetso-border)' }}>
                      <td className="p-3 text-sm font-bold text-[var(--cetso-text)]">{ELECTION.name}</td>
                      <td className="p-3">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold"
                          style={enabled ? {
                            background: 'rgba(34,197,94,0.10)',
                            border: '1px solid rgba(34,197,94,0.28)',
                            color: 'rgba(134,239,172,0.90)',
                          } : {
                            background: 'rgba(239,68,68,0.09)',
                            border: '1px solid rgba(239,68,68,0.25)',
                            color: 'rgba(252,165,165,0.80)',
                          }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {votingEffectiveOpen ? 'Open' : 'Closed'}
                        </span>
                      </td>
                      <td className="p-3">
                        <Button
                          variant={enabled ? 'danger' : 'primary'}
                          size="sm"
                          onClick={handleToggleEnabled}
                          disabled={loadingConfig || savingConfig}
                        >
                          {enabled ? <LockKeyhole className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                          {enabled ? 'Close' : 'Open'} Voting
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {configError ? (
                <div
                  className="mt-4 rounded-2xl p-4 text-xs font-bold text-red-200"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
                >
                  Supabase election status error: {configError}
                </div>
              ) : null}

              {/* Rule */}
              <div
                className="mt-4 rounded-2xl p-4"
                style={{ background: 'rgba(255,122,24,0.07)', border: '1px solid rgba(255,122,24,0.22)' }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Zap className="h-4 w-4 text-[var(--cetso-orange)]" />
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-orange)] opacity-80">
                    Program Weighting Rule
                  </div>
                </div>
                <div className="text-sm font-bold text-[var(--cetso-text)]">
                  25% contribution per academic program.
                </div>
                <div className="mt-0.5 text-xs font-medium text-[var(--cetso-text-2)]">
                  Applied to all final election results for fairness.
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Scheduling */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.10 }}
            className="lg:col-span-5"
          >
            <GlassCard className="p-5 h-full">
              <div className="flex items-center gap-2 mb-1.5">
                <CalendarDays className="h-4 w-4 text-[var(--cetso-orange)]" />
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]">
                  Schedule
                </div>
              </div>
              <div className="text-xl font-black text-[var(--cetso-text)] mb-5">Voting Window</div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--cetso-text)]">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-2xl border border-[var(--cetso-border)] bg-[var(--cetso-surface-2)] px-4 py-3 text-sm text-[var(--cetso-text)] transition focus:border-[var(--cetso-border-strong)] focus:outline-none hover:border-[var(--cetso-border-strong)]"
                    style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.1)' }}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--cetso-text)]">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-2xl border border-[var(--cetso-border)] bg-[var(--cetso-surface-2)] px-4 py-3 text-sm text-[var(--cetso-text)] transition focus:border-[var(--cetso-border-strong)] focus:outline-none hover:border-[var(--cetso-border-strong)]"
                    style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.1)' }}
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="primary" size="lg" className="flex-1" onClick={saveSchedule} disabled={loadingConfig || savingConfig}>
                    Save Schedule
                  </Button>
                  <Button variant="secondary" size="lg" className="flex-1" onClick={resetSchedule} disabled={loadingConfig || savingConfig}>
                    Reset
                  </Button>
                </div>

                {saved ? (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 rounded-2xl p-3"
                    style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}
                  >
                    <CheckCircle2 className="h-4 w-4 text-[rgba(134,239,172,0.90)]" />
                    <div className="text-xs font-semibold text-[rgba(134,239,172,0.90)]">
                      Schedule saved and synced with database!
                    </div>
                  </motion.div>
                ) : null}

                <div className="divider-orange" />
                <div className="text-xs font-medium text-[rgba(134,239,172,0.90)] flex items-center gap-1.5 justify-center">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Synced with Supabase Live Production config.
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
    </div>
  )
}
