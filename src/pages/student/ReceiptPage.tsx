import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, Copy, ImageDown, CheckCircle2, ArrowLeft, ShieldCheck, Terminal, Fingerprint, QrCode, Cpu, Share2 } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import Button from '../../components/ui/Button'
import GlassCard from '../../components/ui/GlassCard'
import { getStudentContext } from '../../lib/studentContext'
import { getMockVoteSubmission } from '../../mocks/mockVotes'
import { CANDIDATES, POSITIONS } from '../../mocks/mockElection'
import { goeyToast } from 'goey-toast'

export default function ReceiptPage() {
  const navigate = useNavigate()
  const ctx = getStudentContext()
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  const submission = useMemo(() => {
    if (!ctx) return null
    return getMockVoteSubmission(ctx.studentId)
  }, [ctx])

  const selectedCandidates = useMemo(() => {
    if (!submission) return []
    return submission.selections.map(sel => {
      const candidate = CANDIDATES.find(c => c.candidateId === sel.candidateId)
      const position = POSITIONS.find(p => p.positionCode === sel.positionCode)
      return { ...candidate, positionTitle: position?.title }
    }).filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate?.candidateId))
  }, [submission])

  if (!ctx) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <div className="text-4xl font-black italic uppercase tracking-tighter text-white">
            ACCESS<br /><span className="text-orange-500">DENIED</span>
          </div>
          <div className="mt-4 text-xs font-black uppercase tracking-widest text-white/40">
            Authentication node required.
          </div>
          <Button variant="primary" size="lg" className="mt-8 w-full shadow-orange-500/20" onClick={() => navigate('/login')}>
            RE-INITIATE SESSION
          </Button>
        </GlassCard>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <div className="text-4xl font-black italic uppercase tracking-tighter text-white">
            NO DATA<br /><span className="text-orange-500">FOUND</span>
          </div>
          <div className="mt-4 text-xs font-black uppercase tracking-widest text-white/40">
            No active ballot recorded for this identity.
          </div>
          <Button variant="primary" size="lg" className="mt-8 w-full shadow-orange-500/20" onClick={() => navigate('/student/vote')}>
            INITIALIZE BALLOT
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
      const el = document.getElementById('tactical-receipt')
      if (!el) throw new Error('Element not found')
      const canvas = await html2canvas(el, { 
        scale: 2, 
        backgroundColor: '#07070c',
        useCORS: true,
        logging: false
      })
      const img = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      pdf.addImage(img, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST')
      pdf.save(`CETSO_TACTICAL_RECEIPT_${receipt.verificationCode}.pdf`)
      goeyToast.success('Tactical PDF generated.')
    } catch { goeyToast.error('PDF Generation Failed.') }
    finally { setBusy(false) }
  }

  async function saveAsImage() {
    if (busy) return
    setBusy(true)
    try {
      const el = document.getElementById('tactical-receipt')
      if (!el) throw new Error('Element not found')
      const canvas = await html2canvas(el, { 
        scale: 2, 
        backgroundColor: '#07070c',
        useCORS: true,
        logging: false
      })
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = `CETSO_RECEIPT_${receipt.verificationCode}.png`
      a.click()
      goeyToast.success('Encrypted Image Saved.')
    } catch { goeyToast.error('Image Export Failed.') }
    finally { setBusy(false) }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(receipt.verificationCode)
      setCopied(true)
      goeyToast.success('Verification Code Copied.')
      setTimeout(() => setCopied(false), 2000)
    } catch { goeyToast.error('Clipboard Access Denied.') }
  }

  const ts = new Date(receipt.timestamp)
  const dateStr = ts.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeStr = ts.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">

      {/* Page heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-500">Operation: Deployment Successful</span>
          </div>
          <h1
            className="italic uppercase tracking-tighter"
            style={{
              fontFamily: 'var(--font-h1)',
              fontSize: 'clamp(40px, 6vw, 64px)',
              lineHeight: 0.8,
              color: 'var(--cetso-text)',
            }}
          >
            TACTICAL<br /><span className="text-orange-500">RECEIPT</span>
          </h1>
        </div>

        <div className="flex gap-3">
           <Button variant="secondary" size="lg" className="h-14 px-8 bg-white/5 border-white/10" onClick={() => navigate('/student/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
              <span className="italic tracking-tighter uppercase text-[13px]">RETURN TO COMMAND</span>
           </Button>
           <Button variant="primary" size="lg" className="h-14 px-8 shadow-orange-500/20" onClick={downloadPDF} loading={busy}>
              <Download className="h-5 w-5" />
              <span className="italic tracking-tighter uppercase text-[13px]">DOWNLOAD ARCHIVE</span>
           </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* ── Tactical Lineup (Left) ───────────────── */}
        <div className="xl:col-span-8 space-y-6">
           <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            id="tactical-receipt"
            className="rounded-[40px] p-8 md:p-12 relative overflow-hidden"
            style={{
              background: '#07070c',
              border: '1px solid rgba(255,122,24,0.15)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.8)'
            }}
           >
              {/* Decorative scanline */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
                 <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,122,24,0.1) 1px, transparent 1px)', backgroundSize: '100% 4px' }} />
              </div>

              {/* Header Info */}
              <div className="flex flex-col md:flex-row justify-between gap-8 mb-12 relative z-10">
                 <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-3xl bg-orange-500 grid place-items-center shadow-[0_0_30px_rgba(249,115,22,0.4)]">
                       <ShieldCheck className="h-10 w-10 text-white" />
                    </div>
                    <div>
                       <div className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 mb-1">Official Ballot Record</div>
                       <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Secure Verification</h2>
                       <div className="mt-2 flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
                          <span className="flex items-center gap-1.5"><Terminal className="h-3 w-3" /> Core: Nexus_01</span>
                          <span className="flex items-center gap-1.5"><Fingerprint className="h-3 w-3" /> Encrypted</span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex md:flex-col items-end justify-between md:justify-center gap-4">
                    <div className="text-right">
                       <div className="text-[9px] font-black uppercase tracking-widest text-white/30">Election Year</div>
                       <div className="text-xl font-black italic text-white leading-none mt-1">{receipt.electionYear}</div>
                    </div>
                    <div className="text-right">
                       <div className="text-[9px] font-black uppercase tracking-widest text-white/30">Node Timestamp</div>
                       <div className="text-sm font-mono text-orange-500 mt-1">{dateStr} • {timeStr}</div>
                    </div>
                 </div>
              </div>

              <div className="h-px w-full bg-white/5 mb-10" />

              {/* Tactical Lineup Grid */}
              <div className="mb-12">
                 <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-8 flex items-center gap-4">
                    <Cpu className="h-4 w-4 text-orange-500" />
                    Deployed Tactical Lineup
                    <div className="h-px flex-1 bg-white/5" />
                 </div>
                 
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedCandidates.map((can, i) => (
                       <div 
                        key={i} 
                        className="rounded-2xl p-4 bg-white/5 border border-white/5 flex flex-col gap-3 relative overflow-hidden group"
                       >
                          <div className="absolute -top-2 -right-2 opacity-[0.03] transition-opacity group-hover:opacity-[0.08]">
                             <Terminal className="h-16 w-16" />
                          </div>
                          <div className="text-[8px] font-black uppercase tracking-widest text-orange-500 truncate mb-1">
                             {can.positionTitle}
                          </div>
                          <div className="text-[11px] font-black uppercase italic tracking-tighter text-white leading-tight">
                             {can.fullName}
                          </div>
                          <div className="mt-auto pt-2 border-t border-white/5 flex items-center justify-between">
                             <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Confirmed</div>
                             <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Bottom Footer with QR and Verification */}
              <div className="flex flex-col md:flex-row items-center gap-10 mt-auto pt-10 border-t border-white/5">
                 <div className="p-4 rounded-3xl bg-white relative group">
                    <QRCodeSVG 
                       value={receipt.verificationCode}
                       size={140}
                       fgColor="#000"
                       bgColor="transparent"
                       level="H"
                    />
                    <div className="absolute inset-0 border-4 border-black/5 rounded-3xl pointer-events-none" />
                 </div>
                 
                 <div className="flex-1 space-y-6">
                    <div>
                       <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-3">Unique Verification Hash</div>
                       <div className="p-4 rounded-2xl bg-white/5 border border-white/10 font-mono text-sm font-black text-orange-500 tracking-wider flex items-center justify-between">
                          {receipt.verificationCode}
                          <QrCode className="h-5 w-5 opacity-20" />
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                       <div className="flex-1">
                          <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">Authenticated Operator</div>
                          <div className="text-sm font-black text-white italic uppercase tracking-tighter">{receipt.studentName}</div>
                       </div>
                       <div className="text-right">
                          <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">Status</div>
                          <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[9px] font-black uppercase tracking-widest">VERIFIED_SECURE</div>
                       </div>
                    </div>
                 </div>
              </div>
              
              {/* Branding subtle */}
              <div className="mt-12 text-center text-[8px] font-black uppercase tracking-[0.5em] text-white/10">
                 Nexus Protocol • CETSO Official Records • Phase 02
              </div>
           </motion.div>
        </div>

        {/* ── Actions sidebar (Right) ───────────────── */}
        <div className="xl:col-span-4 space-y-6">
           <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
           >
              <GlassCard className="p-8 space-y-8">
                 <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">Node Export</h3>
                    <p className="text-[11px] font-medium text-white/40 leading-relaxed uppercase tracking-widest">
                       Secure your ballot record. This document contains your unique verification hash for auditing purposes.
                    </p>
                 </div>
                 
                 <div className="space-y-3">
                    <Button variant="primary" size="lg" className="w-full h-14 shadow-orange-500/20" onClick={downloadPDF} loading={busy}>
                       <Download className="h-5 w-5" />
                       <span className="italic tracking-tighter uppercase text-[13px]">SAVE AS ARCHIVE (.PDF)</span>
                    </Button>
                    <Button variant="secondary" size="lg" className="w-full h-14 bg-white/5 border-white/10" onClick={saveAsImage} loading={busy}>
                       <ImageDown className="h-5 w-5" />
                       <span className="italic tracking-tighter uppercase text-[13px]">EXPORT DATA CRYSTAL (.PNG)</span>
                    </Button>
                 </div>
                 
                 <div className="pt-8 border-t border-white/5">
                    <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">Quick Share Hash</div>
                    <div className="flex items-center gap-2">
                       <div className="flex-1 p-4 rounded-2xl bg-black/40 border border-white/5 font-mono text-xs font-black text-white/60 overflow-hidden truncate">
                          {receipt.verificationCode}
                       </div>
                       <button 
                        onClick={copyCode}
                        className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--cetso-orange)] text-white shadow-lg transition-transform active:scale-90"
                       >
                          {copied ? <CheckCircle2 className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                       </button>
                    </div>
                 </div>
              </GlassCard>
           </motion.div>
           
           <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
           >
              <div className="rounded-3xl p-6 bg-orange-500/5 border border-orange-500/10">
                 <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="h-5 w-5 text-orange-500" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-500">Security Protocol</span>
                 </div>
                 <p className="text-[11px] font-medium leading-relaxed text-white/40 uppercase tracking-widest">
                    This receipt does not reveal your specific choices on the official blockchain. It only verifies your participation identity.
                 </p>
                 <div className="mt-4 flex items-center gap-3">
                    <Share2 className="h-3 w-3 text-white/20" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Audit-Ready Node</span>
                 </div>
              </div>
           </motion.div>
        </div>
      </div>
    </div>
  )
}
