import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, Copy, ImageDown, CheckCircle2, ArrowLeft } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import Button from '../../components/ui/Button'
import GlassCard from '../../components/ui/GlassCard'
import { getStudentContext } from '../../lib/studentContext'
import { getMockVoteSubmission } from '../../mocks/mockVotes'

export default function ReceiptPage() {
  const navigate = useNavigate()
  const ctx = getStudentContext()
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  const submission = useMemo(() => {
    if (!ctx) return null
    return getMockVoteSubmission(ctx.studentId)
  }, [ctx])

  if (!ctx) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <div
            className="text-4xl font-black"
            style={{ fontFamily: 'var(--font-h1)', color: 'var(--cetso-text)' }}
          >
            LOGIN REQUIRED
          </div>
          <div className="mt-2 text-sm font-medium" style={{ color: 'var(--cetso-text-2)' }}>
            Please login to view your receipt.
          </div>
          <Button variant="primary" size="lg" className="mt-6 w-full" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </GlassCard>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <div
            className="text-4xl font-black"
            style={{ fontFamily: 'var(--font-h1)', color: 'var(--cetso-text)' }}
          >
            NO RECEIPT YET
          </div>
          <div className="mt-2 text-sm font-medium" style={{ color: 'var(--cetso-text-2)' }}>
            Submit your vote first to generate a receipt.
          </div>
          <Button variant="primary" size="lg" className="mt-6 w-full" onClick={() => navigate('/student/vote')}>
            Start Voting
          </Button>
        </GlassCard>
      </div>
    )
  }

  const receipt = submission.receipt

  async function downloadPDF() {
    if (busy) return
    setBusy(true)
    try {
      const el = document.getElementById('receipt-ticket')
      if (!el) throw new Error('Element not found')
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' })
      const img = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      pdf.addImage(img, 'PNG', 20, 20, 170, 240, undefined, 'FAST')
      pdf.save(`CETSO_Receipt_${receipt.verificationCode}.pdf`)
    } catch { alert('Could not generate PDF. Please try again.') }
    finally { setBusy(false) }
  }

  async function saveAsImage() {
    if (busy) return
    setBusy(true)
    try {
      const el = document.getElementById('receipt-ticket')
      if (!el) throw new Error('Element not found')
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' })
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = `CETSO_Receipt_${receipt.verificationCode}.png`
      a.click()
    } catch { alert('Could not save image.') }
    finally { setBusy(false) }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(receipt.verificationCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { alert('Could not copy. Please copy manually.') }
  }

  const ts = new Date(receipt.timestamp)
  const dateStr = ts.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeStr = ts.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Page heading */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          className="text-[11px] font-bold uppercase tracking-widest mb-1"
          style={{ color: 'var(--cetso-text-3)', fontFamily: 'var(--font-h2)' }}
        >
          Voting Complete
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-h1)',
            fontSize: 'clamp(36px, 6vw, 56px)',
            lineHeight: 0.95,
            color: 'var(--cetso-text)',
            letterSpacing: '0.01em',
          }}
        >
          YOUR RECEIPT
        </h1>
      </motion.div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">

        {/* ── Ticket ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="lg:col-span-7"
        >
          {/* Printable ticket */}
          <div
            id="receipt-ticket"
            className="rounded-[28px] overflow-hidden"
            style={{
              background: '#ffffff',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              maxWidth: 420,
            }}
          >
            {/* Top section */}
            <div className="px-8 pt-8 pb-6 text-center">
              {/* Confetti emoji */}
              <div className="text-5xl mb-3">🎉</div>

              <div
                className="text-2xl font-black"
                style={{ fontFamily: 'var(--font-h2)', color: '#111', letterSpacing: '-0.01em' }}
              >
                Vote Submitted!
              </div>
              <p className="mt-1 text-sm" style={{ color: '#888', fontFamily: 'var(--font-h2)' }}>
                Your ballot has been recorded successfully
              </p>
            </div>

            {/* Dashed ticket tear */}
            <div className="relative flex items-center px-0" style={{ margin: '0' }}>
              {/* Left notch */}
              <div
                className="absolute -left-4 h-8 w-8 rounded-full"
                style={{ background: 'var(--cetso-bg)', zIndex: 2 }}
              />
              {/* Right notch */}
              <div
                className="absolute -right-4 h-8 w-8 rounded-full"
                style={{ background: 'var(--cetso-bg)', zIndex: 2 }}
              />
              {/* Dashed line */}
              <div
                className="w-full"
                style={{
                  borderTop: '2px dashed #e0e0e0',
                  marginLeft: 16,
                  marginRight: 16,
                }}
              />
            </div>

            {/* Body section */}
            <div className="px-8 pt-6 pb-2 space-y-5">

              {/* Vote ID */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div
                    className="text-[10px] font-bold uppercase tracking-widest mb-1"
                    style={{ color: '#aaa', fontFamily: 'var(--font-h2)' }}
                  >
                    Vote ID
                  </div>
                  <div
                    className="text-base font-black"
                    style={{ fontFamily: 'var(--font-mono)', color: '#111', letterSpacing: '0.04em' }}
                  >
                    {receipt.verificationCode}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="text-[10px] font-bold uppercase tracking-widest mb-1"
                    style={{ color: '#aaa', fontFamily: 'var(--font-h2)' }}
                  >
                    Status
                  </div>
                  <div
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold"
                    style={{ background: '#dcfce7', color: '#16a34a' }}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </div>
                </div>
              </div>

              {/* Date & time */}
              <div>
                <div
                  className="text-[10px] font-bold uppercase tracking-widest mb-1"
                  style={{ color: '#aaa', fontFamily: 'var(--font-h2)' }}
                >
                  Date &amp; Time
                </div>
                <div className="text-base font-bold" style={{ color: '#111', fontFamily: 'var(--font-h2)' }}>
                  {dateStr} • {timeStr}
                </div>
              </div>

              {/* Student row */}
              <div
                className="flex items-center gap-3 rounded-2xl p-4"
                style={{ background: '#f8f8fb', border: '1px solid #ebebf0' }}
              >
                <div
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-black"
                  style={{ background: 'rgba(255,122,24,0.12)', color: '#e06300' }}
                >
                  {receipt.studentName.split(' ').slice(0, 2).map((p: string) => p[0]).join('').toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-sm" style={{ color: '#111', fontFamily: 'var(--font-h2)' }}>
                    {receipt.studentName}
                  </div>
                  <div className="text-[11px]" style={{ color: '#999', fontFamily: 'var(--font-h2)' }}>
                    {receipt.studentId} &bull; {receipt.programCode}
                  </div>
                </div>
              </div>
            </div>

            {/* Dashed ticket tear bottom */}
            <div className="relative flex items-center px-0 mt-4">
              <div
                className="absolute -left-4 h-8 w-8 rounded-full"
                style={{ background: 'var(--cetso-bg)', zIndex: 2 }}
              />
              <div
                className="absolute -right-4 h-8 w-8 rounded-full"
                style={{ background: 'var(--cetso-bg)', zIndex: 2 }}
              />
              <div
                className="w-full"
                style={{
                  borderTop: '2px dashed #e0e0e0',
                  marginLeft: 16,
                  marginRight: 16,
                }}
              />
            </div>

            {/* Barcode section */}
            <div className="px-8 py-6 flex flex-col items-center gap-3">
              <div className="flex items-center justify-center">
                <div
                  className="rounded-2xl p-3"
                  style={{ background: 'white', border: '2px solid #f0f0f0' }}
                >
                  <QRCodeSVG
                    value={receipt.verificationCode}
                    size={90}
                    fgColor="#111111"
                    bgColor="transparent"
                  />
                </div>
              </div>

              {/* Barcode visual */}
              <div className="flex items-end gap-px mt-1">
                {Array.from({ length: 52 }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      width: i % 3 === 0 ? 3 : i % 5 === 0 ? 2 : 1,
                      height: i % 4 === 0 ? 36 : i % 3 === 0 ? 28 : 22,
                      background: '#222',
                      borderRadius: 1,
                    }}
                  />
                ))}
              </div>
              <div
                className="text-[11px] tracking-[0.25em] font-mono"
                style={{ color: '#555' }}
              >
                {receipt.verificationCode.replace(/-/g, ' ')}
              </div>

              {/* CETSO badge */}
              <div
                className="mt-1 flex items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{ background: 'rgba(224,99,0,0.08)', border: '1px solid rgba(224,99,0,0.18)' }}
              >
                <div
                  className="grid h-4 w-4 place-items-center rounded text-[9px] font-black text-white"
                  style={{ background: '#e06300' }}
                >
                  C
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: '#e06300', fontFamily: 'var(--font-h2)' }}
                >
                  CETSO Elections {receipt.electionYear}
                </span>
              </div>
            </div>

            {/* Scalloped bottom edge */}
            <div
              className="flex justify-around pb-1 pt-0"
              style={{ background: '#f8f8fb' }}
            >
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="h-4 w-8 rounded-b-full"
                  style={{ background: 'white', marginBottom: -2 }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Actions sidebar ──────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="lg:col-span-5 space-y-4"
        >

          {/* Copy code */}
          <GlassCard className="p-5">
            <div
              className="text-[10px] font-bold uppercase tracking-widest mb-1"
              style={{ color: 'var(--cetso-text-3)', fontFamily: 'var(--font-h2)' }}
            >
              Verification Code
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div
                className="flex-1 min-w-0 rounded-xl px-3 py-2 text-xs font-black font-mono"
                style={{
                  background: 'rgba(255,122,24,0.08)',
                  border: '1px solid rgba(255,122,24,0.22)',
                  color: 'var(--cetso-text)',
                }}
              >
                {receipt.verificationCode}
              </div>
              <button
                type="button"
                onClick={copyCode}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl transition"
                style={{
                  background: 'var(--cetso-badge-bg)',
                  border: '1px solid var(--cetso-border)',
                  color: 'var(--cetso-text-2)',
                }}
              >
                {copied
                  ? <CheckCircle2 className="h-4 w-4" style={{ color: '#4ade80' }} />
                  : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </GlassCard>

          {/* Download actions */}
          <GlassCard className="p-5 space-y-3">
            <h2
              className="text-xl font-black"
              style={{ fontFamily: 'var(--font-h2)', color: 'var(--cetso-text)', letterSpacing: '-0.01em' }}
            >
              Download &amp; Save
            </h2>
            <Button variant="primary" size="lg" className="w-full" onClick={downloadPDF} disabled={busy}>
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="secondary" size="lg" className="w-full" onClick={saveAsImage} disabled={busy}>
              <ImageDown className="h-4 w-4" />
              Save as Image
            </Button>
            <Button variant="ghost" size="lg" className="w-full" onClick={() => navigate('/student/dashboard')}>
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Button>
          </GlassCard>

          {/* Privacy notice */}
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(255,122,24,0.06)', border: '1px solid rgba(255,122,24,0.18)' }}
          >
            <div
              className="text-[10px] font-bold uppercase tracking-widest mb-2"
              style={{ color: 'rgba(255,178,74,0.85)', fontFamily: 'var(--font-h2)' }}
            >
              Privacy Protected
            </div>
            <div className="text-xs font-medium leading-relaxed" style={{ color: 'var(--cetso-text-2)' }}>
              This receipt does not reveal who you voted for — it provides an auditable verification code only.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
