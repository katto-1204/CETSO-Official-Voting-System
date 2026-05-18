import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Clock, Shield, ScrollText, Vote, LogIn, Upload, Settings } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'

type AuditEvent = {
  at: string
  actor: string
  eventType: string
  entity: string
  detail: string
  icon: React.ElementType
  color: string
  borderColor: string
  bgColor: string
}

const EVENT_ICONS: Record<string, { icon: React.ElementType; color: string; borderColor: string; bgColor: string }> = {
  ELECTION_SETTINGS: { icon: Settings, color: 'rgba(255,178,74,0.90)', borderColor: 'rgba(255,122,24,0.35)', bgColor: 'rgba(255,122,24,0.12)' },
  STUDENT_IMPORT: { icon: Upload, color: 'rgba(96,165,250,0.90)', borderColor: 'rgba(59,130,246,0.35)', bgColor: 'rgba(59,130,246,0.12)' },
  VOTE_SUBMITTED: { icon: Vote, color: 'rgba(134,239,172,0.90)', borderColor: 'rgba(34,197,94,0.35)', bgColor: 'rgba(34,197,94,0.12)' },
  LOGIN_SUCCESSFUL: { icon: LogIn, color: 'rgba(167,139,250,0.90)', borderColor: 'rgba(139,92,246,0.35)', bgColor: 'rgba(139,92,246,0.12)' },
}

function timeAgo(isoDate: string) {
  const ms = Date.now() - new Date(isoDate).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}

export default function AuditLogsPage() {
  const events: AuditEvent[] = useMemo(() => {
    const now = Date.now()
    const raw = [
      { at: new Date(now - 1000 * 60 * 30).toISOString(), actor: 'System', eventType: 'ELECTION_SETTINGS', entity: 'System', detail: 'Voting period opened.' },
      { at: new Date(now - 1000 * 60 * 22).toISOString(), actor: 'Admin', eventType: 'STUDENT_IMPORT', entity: 'System', detail: 'Student list added successfully.' },
      { at: new Date(now - 1000 * 60 * 12).toISOString(), actor: 'Juan Dela Cruz', eventType: 'VOTE_SUBMITTED', entity: 'Student', detail: 'Vote submitted and receipt created.' },
      { at: new Date(now - 1000 * 60 * 6).toISOString(), actor: 'Maria Santos', eventType: 'LOGIN_SUCCESSFUL', entity: 'Student', detail: 'Student logged in successfully.' },
    ]
    return raw.map((e) => ({
      ...e,
      ...(EVENT_ICONS[e.eventType] ?? { icon: Clock, color: 'rgba(234,234,242,0.70)', borderColor: 'rgba(255,255,255,0.15)', bgColor: 'rgba(255,255,255,0.06)' }),
    }))
  }, [])

  return (
    <div className="space-y-5">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[32px] p-6"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.50)',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
              style={{ background: 'rgba(255,122,24,0.12)', border: '1px solid rgba(255,122,24,0.28)' }}
            >
              <ScrollText className="h-6 w-6 text-[var(--cetso-orange)]" />
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
                AUDIT LOGS
              </h1>
              <div className="mt-0.5 text-sm font-medium text-[var(--cetso-text-2)]">
                History of all system activities and student logins.
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">

          {/* Sidebar info */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="lg:col-span-4"
          >
            <GlassCard className="p-5 h-full">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]">Overview</div>

              <div
                className="mt-4 flex items-start gap-3 rounded-2xl p-4"
                style={{ background: 'rgba(255,122,24,0.08)', border: '1px solid rgba(255,122,24,0.22)' }}
              >
                <Shield className="h-5 w-5 text-[var(--cetso-orange)] shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-[var(--cetso-text)]">System Logs</div>
                  <div className="mt-1 text-xs font-medium text-[var(--cetso-text-2)] leading-relaxed">
                    All actions are recorded to ensure the election is transparent.
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)] mb-3">Activity Types</div>
                {Object.entries(EVENT_ICONS).map(([type, config]) => {
                  const Icon = config.icon
                  return (
                    <div
                      key={type}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                      style={{ background: 'var(--cetso-surface-2)', border: '1px solid var(--cetso-border)' }}
                    >
                      <div
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg"
                        style={{ background: config.bgColor, border: `1px solid ${config.borderColor}` }}
                      >
                        <Icon className="h-3.5 w-3.5" style={{ color: config.color }} />
                      </div>
                      <span className="text-[11px] font-semibold text-[var(--cetso-text-2)]">
                        {type.replaceAll('_', ' ')}
                      </span>
                    </div>
                  )
                })}
              </div>

            <div className="mt-5 text-xs font-medium text-[var(--cetso-text-3)]">
              Current filters cover the live audit categories available in the system.
            </div>
            </GlassCard>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.10 }}
            className="lg:col-span-8"
          >
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-[var(--cetso-orange)]" />
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]">
                  Timeline Activity ({events.length} events)
                </div>
              </div>

              <div className="relative space-y-3">
                {/* Timeline line */}
                <div
                  className="absolute left-[19px] top-3 bottom-3 w-[1px]"
                  style={{ background: 'var(--cetso-border)' }}
                />

                {events.map((ev, idx) => {
                  const Icon = ev.icon
                  return (
                    <motion.div
                      key={`${ev.eventType}-${idx}`}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + idx * 0.06 }}
                      className="relative flex gap-4"
                    >
                      {/* Icon dot */}
                      <div
                        className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                        style={{ background: ev.bgColor, border: `1px solid ${ev.borderColor}` }}
                      >
                        <Icon className="h-4 w-4" style={{ color: ev.color }} />
                      </div>

                      {/* Card */}
                      <div
                        className="flex-1 rounded-2xl p-4 min-w-0"
                        style={{ background: 'var(--cetso-surface-2)', border: '1px solid var(--cetso-border)' }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-[var(--cetso-text)]">
                              {ev.eventType.replaceAll('_', ' ')}
                            </div>
                            <div className="mt-1 text-xs font-medium text-[var(--cetso-text-2)]">
                              User: <span className="font-bold text-[var(--cetso-text)]">{ev.actor}</span>
                              <span className="mx-1.5 text-[var(--cetso-text-3)]">•</span>
                              Role: <span className="text-[var(--cetso-text)]">{ev.entity}</span>
                            </div>
                            <div className="mt-1 text-xs font-medium text-[var(--cetso-text-2)]">{ev.detail}</div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div
                              className="rounded-lg px-2 py-1 text-[10px] font-bold whitespace-nowrap"
                              style={{ background: ev.bgColor, border: `1px solid ${ev.borderColor}`, color: ev.color }}
                            >
                              {timeAgo(ev.at)}
                            </div>
                            <div className="mt-1 text-[10px] text-[var(--cetso-text-3)] whitespace-nowrap">
                              {new Date(ev.at).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
  )
}
