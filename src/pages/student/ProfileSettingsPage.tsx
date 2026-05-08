import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react'
import Button from '../../components/ui/Button'
import GlassCard from '../../components/ui/GlassCard'
import TextField from '../../components/ui/TextField'
import { getStudentContext } from '../../lib/studentContext'

export default function ProfileSettingsPage() {
  const navigate = useNavigate()
  const ctx = getStudentContext()
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [saved, setSaved] = useState(false)

  const status = useMemo(() => ctx ? 'CET Verified' : null, [ctx])
  const initials = ctx?.studentName.split(' ').slice(0, 2).map((p: string) => p[0]).join('').toUpperCase() ?? '?'

  if (!ctx) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <div className="text-xl font-black text-white">Login required</div>
          <div className="mt-2 text-sm font-medium text-[var(--cetso-text-2)]">Please login to update your profile.</div>
          <Button variant="primary" size="lg" className="mt-6 w-full" onClick={() => navigate('/login')}>Go to Login</Button>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* Header banner */}
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
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 500px 280px at 0% 0%, rgba(255,122,24,0.16), transparent 65%)' }}
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-xl font-black"
              style={{
                background: 'linear-gradient(135deg, rgba(255,122,24,0.22), rgba(255,178,74,0.12))',
                border: '1px solid rgba(255,122,24,0.38)',
                color: 'var(--cetso-orange)',
                boxShadow: '0 0 28px rgba(255,122,24,0.18)',
              }}
            >
              {initials}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]">Profile Settings</div>
              <div className="mt-1 text-2xl font-black text-white">{ctx.studentName}</div>
              <div className="mt-0.5 text-xs font-semibold text-[var(--cetso-text-2)]">
                {ctx.studentId} • {ctx.programCode} • Year {ctx.yearLevel}
              </div>
            </div>
          </div>

          <div
            className="self-start sm:self-auto flex items-center gap-2 rounded-2xl px-4 py-3"
            style={{ background: 'rgba(255,122,24,0.08)', border: '1px solid rgba(255,122,24,0.25)' }}
          >
            <ShieldCheck className="h-4 w-4 text-[var(--cetso-orange)] shrink-0" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[rgba(255,178,74,0.90)]">{status}</div>
              <div className="mt-0.5 text-[11px] font-medium text-[var(--cetso-text-2)]">CETSO Elections 2026</div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-12 gap-4">

        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="col-span-12 lg:col-span-4"
        >
          <GlassCard className="p-6 h-full">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]">Profile Photo</div>

            <div className="mt-5 flex flex-col items-center gap-4">
              <div
                className="grid h-24 w-24 place-items-center rounded-3xl text-3xl font-black"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,122,24,0.22), rgba(255,178,74,0.14))',
                  border: '2px solid rgba(255,122,24,0.35)',
                  color: 'var(--cetso-orange)',
                  boxShadow: '0 0 40px rgba(255,122,24,0.20)',
                }}
              >
                {initials}
              </div>

              <div className="text-center">
                <div className="text-sm font-bold text-white">{ctx.studentName}</div>
                <div className="mt-0.5 text-xs font-medium text-[var(--cetso-text-2)]">{ctx.programCode}</div>
              </div>
            </div>

            <div className="mt-5">
              <label
                className="block text-sm font-semibold text-[var(--cetso-text)] mb-2"
                htmlFor="photo-upload"
              >
                <Camera className="inline h-4 w-4 mr-1.5 opacity-70" />
                Upload Photo
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="w-full cursor-pointer rounded-2xl border border-[var(--cetso-border)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[var(--cetso-text-2)] file:mr-3 file:rounded-lg file:border-0 file:bg-[rgba(255,122,24,0.14)] file:text-xs file:font-bold file:text-[rgba(255,178,74,0.90)] file:px-3 file:py-1.5 transition hover:border-[rgba(255,255,255,0.18)]"
              />
              <div className="mt-2 text-xs font-medium text-[var(--cetso-text-3)]">
                Preview only (MVP demo). Backend upload coming soon.
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Password */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.10 }}
          className="col-span-12 lg:col-span-8"
        >
          <GlassCard className="p-6 h-full">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]">Security</div>
            <div className="mt-1.5 text-xl font-black text-white">Update Password</div>
            <p className="mt-1 text-sm font-medium text-[var(--cetso-text-2)]">Keep your voting session secure.</p>

            <div className="mt-5 space-y-4">
              <TextField
                label="Current Password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                type="password"
                placeholder="Enter current password"
              />
              <TextField
                label="New Password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                type="password"
                placeholder="Enter new password"
                hint="MVP UI demo — no backend update yet."
              />
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => { setCurrentPass(''); setNewPass(''); setSaved(false) }}
              >
                Reset Fields
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setSaved(true)}
              >
                Save Changes
              </Button>
            </div>

            <AnimatePresence>
              {saved ? (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 flex items-center gap-3 rounded-2xl p-4"
                  style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[rgba(134,239,172,0.90)]" />
                  <div className="text-sm font-semibold text-[rgba(134,239,172,0.90)]">
                    Changes saved (demo). Connect Supabase to persist updates.
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="divider-orange mt-5 mb-4" />

            {/* Account info */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { label: 'Student ID', value: ctx.studentId },
                { label: 'Program', value: ctx.programCode },
                { label: 'Year Level', value: `Year ${ctx.yearLevel}` },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl p-3"
                  style={{ background: 'rgba(0,0,0,0.20)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--cetso-text-3)]">{item.label}</div>
                  <div className="mt-1 text-sm font-bold text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <div>
        <Button variant="ghost" size="lg" onClick={() => navigate('/student/dashboard')}>
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
      </div>
    </div>
  )
}
