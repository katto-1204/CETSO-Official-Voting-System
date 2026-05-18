import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Download,
  ImageDown,
  QrCode,
  ShieldCheck,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import jsPDF from 'jspdf'
import { goeyToast } from 'goey-toast'
import Button from '../../components/ui/Button'
import GlassCard from '../../components/ui/GlassCard'
import { getStudentContext } from '../../lib/studentContext'
import { getVoteSubmission } from '../../lib/voteRecords'
import type { VoteSubmission } from '../../lib/voteRecords'
import { CANDIDATES, POSITIONS } from '../../lib/electionData'
import type { Candidate, Position } from '../../lib/electionData'
import { useCandidates } from '../../lib/queries'

export default function ReceiptPage() {
  const navigate = useNavigate()
  const ctx = getStudentContext()
  const { data: dbCandidates } = useCandidates()
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [submission, setSubmission] = useState<VoteSubmission | null>(null)
  const [loadingSubmission, setLoadingSubmission] = useState(true)
  const [submissionError, setSubmissionError] = useState('')

  useEffect(() => {
    let active = true
    if (!ctx) {
      setSubmission(null)
      setLoadingSubmission(false)
      return
    }
    setLoadingSubmission(true)
    setSubmissionError('')
    getVoteSubmission(ctx.studentId).then((nextSubmission) => {
      if (!active) return
      setSubmission(nextSubmission)
      setLoadingSubmission(false)
    }).catch((error) => {
      if (!active) return
      setSubmission(null)
      setSubmissionError(error instanceof Error ? error.message : 'Could not load the receipt from the database.')
      setLoadingSubmission(false)
    })
    return () => { active = false }
  }, [ctx?.studentId])

  const selectedCandidates = useMemo(() => {
    if (!submission) return []
    const sourceCandidates = (dbCandidates && dbCandidates.length > 0) ? dbCandidates : CANDIDATES
    return submission.selections
      .map((selection) => {
        let candidate = (sourceCandidates as Candidate[]).find((item: Candidate) => item.candidateId === selection.candidateId)
        const position = POSITIONS.find((item: Position) => item.positionCode === selection.positionCode)
        if (!candidate && (selection.candidateId.startsWith('ABSTAIN_') || selection.candidateId === 'ABSTAIN')) {
          candidate = {
            candidateId: selection.candidateId,
            positionCode: selection.positionCode,
            fullName: 'Abstain',
            partylist: 'None',
            tagline: 'No candidate selected',
            bio: 'Voted Abstain'
          }
        }
        if (!candidate) return null
        return { candidate, positionTitle: position?.title ?? selection.positionCode }
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
  }, [submission, dbCandidates])

  if (!ctx) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <GlassCard className="w-full max-w-md p-8 text-center">
          <div className="text-4xl font-black italic uppercase tracking-tighter text-[var(--cetso-text)]">
            ACCESS<br />
            <span className="text-orange-500">DENIED</span>
          </div>
          <div className="mt-4 text-xs font-black uppercase tracking-widest text-[var(--cetso-text-3)]">
            Please log in to view this.
          </div>
          <Button
            variant="primary"
            size="lg"
            className="mt-8 w-full shadow-orange-500/20"
            onClick={() => navigate('/login')}
          >
            LOG IN AGAIN
          </Button>
        </GlassCard>
      </div>
    )
  }

  if (loadingSubmission) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <GlassCard className="w-full max-w-md p-8 text-center">
          <div className="text-xl font-black text-[var(--cetso-text)]">Loading receipt...</div>
        </GlassCard>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <GlassCard className="w-full max-w-md p-8 text-center">
          <div className="text-4xl font-black italic uppercase tracking-tighter text-[var(--cetso-text)]">
            YOU HAVEN'T<br />
            <span className="text-orange-500">VOTED YET</span>
          </div>
          <div className="mt-4 text-xs font-black uppercase tracking-widest text-[var(--cetso-text-3)]">
            {submissionError ? `Sync Notice: ${submissionError}` : "You haven't cast your vote in the election yet."}
          </div>
          <Button
            variant="primary"
            size="lg"
            className="mt-8 w-full shadow-orange-500/20"
            onClick={() => submissionError ? window.location.reload() : navigate('/student/vote')}
          >
            {submissionError ? 'RETRY SYNC' : 'START VOTING'}
          </Button>
        </GlassCard>
      </div>
    )
  }

  const receipt = submission.receipt
  const trackingNumber = receipt.verificationCode
  const timestamp = new Date(receipt.timestamp)
  const dateStr = timestamp.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const timeStr = timestamp.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const qrPayload = JSON.stringify({
    system: 'CETSO Official Voting System',
    receiptType: 'vote_receipt',
    trackingNumber,
    studentName: receipt.studentName,
    studentId: receipt.studentId,
    programCode: receipt.programCode,
    yearLevel: receipt.yearLevel,
    electionYear: receipt.electionYear,
    timestamp: receipt.timestamp,
  })
  const receiptFileName = `CETSO_RECEIPT_${receipt.studentId}_${trackingNumber}`.replace(
    /[^a-z0-9_-]/gi,
    '_'
  )

  async function getQrImage() {
    const svg = document.querySelector('#receipt-qr svg')
    if (!svg) throw new Error('QR code not found')
    const source = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    try {
      const image = new Image()
      image.decoding = 'async'
      image.src = url
      await image.decode()
      return image
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  async function renderReceiptCanvas() {
    await document.fonts?.ready

    const paperWidth = 600;
    const padding = 80;
    const zigZagSize = 10;

    // Calculate height
    const itemHeight = 70;
    const contentHeight = 250 + 100 + 60 + (selectedCandidates.length * itemHeight) + 100 + 350;
    const paperHeight = contentHeight;
    const canvasWidth = paperWidth + (padding * 2);
    const canvasHeight = paperHeight + (padding * 2);

    const canvas = document.createElement('canvas')
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas is not available')
    const canvasCtx = ctx

    // White export background so PDF/image receipts are print-friendly.
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Draw paper with zig-zag edges
    const startX = padding;
    const startY = padding;
    const endX = startX + paperWidth;
    const endY = startY + paperHeight;

    ctx.beginPath();
    ctx.moveTo(startX, startY + zigZagSize);

    // Top zig-zag
    for (let x = startX; x < endX; x += zigZagSize * 2) {
      ctx.lineTo(Math.min(x + zigZagSize, endX), startY);
      ctx.lineTo(Math.min(x + zigZagSize * 2, endX), startY + zigZagSize);
    }

    // Right edge
    ctx.lineTo(endX, endY - zigZagSize);

    // Bottom zig-zag
    for (let x = endX; x > startX; x -= zigZagSize * 2) {
      ctx.lineTo(Math.max(x - zigZagSize, startX), endY);
      ctx.lineTo(Math.max(x - zigZagSize * 2, startX), endY - zigZagSize);
    }

    // Left edge
    ctx.lineTo(startX, startY + zigZagSize);
    ctx.closePath();

    // Keep a subtle edge without adding a dark page background.
    ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 15;

    ctx.fillStyle = '#f3f4f6';
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Setup Text Styles
    ctx.fillStyle = '#111827';

    const centerX = startX + paperWidth / 2;
    const leftX = startX + 60;
    const rightX = endX - 60;

    function drawDashedLine(y: number) {
      canvasCtx.font = 'bold 20px "Courier New", Courier, monospace';
      canvasCtx.textAlign = 'center';
      canvasCtx.fillText('-'.repeat(39), centerX, y);
      canvasCtx.textAlign = 'left';
    }

    // --- HEADER ---
    let currentY = startY + 120;
    ctx.font = 'bold 54px "Courier New", Courier, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CETSO', centerX, currentY);

    currentY += 50;
    ctx.font = '20px "Courier New", Courier, monospace';
    ctx.fillText('College of Engineering and Technology', centerX, currentY);
    currentY += 30;
    ctx.fillText('Student Organization', centerX, currentY);
    currentY += 30;
    ctx.fillText('cetso.official@gmail.com', centerX, currentY);

    currentY += 70;

    // --- ORDER INFO ---
    ctx.textAlign = 'left';
    ctx.font = 'bold 24px "Courier New", Courier, monospace';

    ctx.fillText('RECEIPT', leftX, currentY);
    ctx.textAlign = 'right';
    const shortTracking = trackingNumber.substring(0, 8).toUpperCase();
    ctx.fillText(`#${shortTracking}`, rightX, currentY);

    ctx.textAlign = 'left';
    currentY += 35;
    ctx.font = '20px "Courier New", Courier, monospace';

    const dateFormatted = `${dateStr.replace(/ /g, ' / ')} ${timeStr}`;
    ctx.fillText(dateFormatted, leftX, currentY);

    currentY += 50;

    // --- COLUMNS ---
    ctx.textAlign = 'left';
    ctx.font = 'bold 22px "Courier New", Courier, monospace';
    ctx.fillText('QTY', leftX, currentY);
    ctx.fillText('DESCR', leftX + 80, currentY);
    ctx.textAlign = 'right';
    ctx.fillText('STS', rightX, currentY);

    currentY += 30;
    drawDashedLine(currentY);
    currentY += 40;

    // --- ITEMS ---
    ctx.font = '20px "Courier New", Courier, monospace';
    selectedCandidates.forEach(({ candidate, positionTitle }) => {
      ctx.textAlign = 'left';
      ctx.fillText('1 x', leftX, currentY);

      ctx.fillText(positionTitle.substring(0, 24), leftX + 80, currentY);

      ctx.textAlign = 'right';
      ctx.fillText('OK', rightX, currentY);

      currentY += 30;

      ctx.textAlign = 'left';
      ctx.fillText(`  ${candidate.fullName}`, leftX + 80, currentY);

      currentY += 40;
    });

    currentY += 10;
    drawDashedLine(currentY);

    // --- TOTAL ---
    currentY += 60;
    ctx.textAlign = 'left';
    ctx.font = 'bold 32px "Courier New", Courier, monospace';
    ctx.fillText('TOTAL:', leftX, currentY);

    ctx.textAlign = 'right';
    ctx.fillText(selectedCandidates.length.toString(), rightX, currentY);

    currentY += 40;
    drawDashedLine(currentY);

    // --- FOOTER ---
    currentY += 60;
    ctx.textAlign = 'center';
    ctx.font = '14px "Courier New", Courier, monospace';
    ctx.fillText('Official voting receipt issued by CETSO - Elections.', centerX, currentY);
    currentY += 25;
    ctx.fillText('For verification purposes exclusively.', centerX, currentY);

    currentY += 60;
    ctx.font = 'bold 28px "Courier New", Courier, monospace';
    ctx.fillText('CETSO*', centerX, currentY);

    // Add QR Code at the bottom
    const qrImage = await getQrImage();
    const qrSize = 140;
    currentY += 40;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(centerX - qrSize / 2 - 10, currentY - 10, qrSize + 20, qrSize + 20);
    ctx.drawImage(qrImage, centerX - qrSize / 2, currentY, qrSize, qrSize);

    return canvas
  }

  async function downloadPDF() {
    if (busy) return
    setBusy(true)
    try {
      const canvas = await renderReceiptCanvas()
      const img = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 8
      const maxWidth = pageWidth - margin * 2
      const maxHeight = pageHeight - margin * 2
      const scale = Math.min(maxWidth / canvas.width, maxHeight / canvas.height)
      const imgWidth = canvas.width * scale
      const imgHeight = canvas.height * scale
      const x = (pageWidth - imgWidth) / 2
      const y = (pageHeight - imgHeight) / 2

      pdf.setFillColor(255, 255, 255)
      pdf.rect(0, 0, pageWidth, pageHeight, 'F')
      pdf.addImage(img, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST')

      pdf.save(`${receiptFileName}.pdf`)
      goeyToast.success('PDF receipt generated.')
    } catch {
      goeyToast.error('PDF generation failed.')
    } finally {
      setBusy(false)
    }
  }

  async function saveAsImage() {
    if (busy) return
    setBusy(true)
    try {
      const canvas = await renderReceiptCanvas()
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `${receiptFileName}.png`
      link.click()
      goeyToast.success('Receipt image saved.')
    } catch {
      goeyToast.error('Image export failed.')
    } finally {
      setBusy(false)
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(trackingNumber)
      setCopied(true)
      goeyToast.success('Tracking number copied.')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      goeyToast.error('Clipboard access denied.')
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col justify-between gap-6 md:flex-row md:items-end"
      >
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-500">
              Success: Vote Submitted
            </span>
          </div>
          <h1
            className="italic uppercase tracking-tighter"
            style={{
              fontFamily: 'var(--font-h1)',
              fontSize: 'clamp(28px, 5vw, 64px)',
              lineHeight: 0.8,
              color: 'var(--cetso-text)',
            }}
          >
            VOTING<br />
            <span className="text-orange-500">RECEIPT</span>
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            size="lg"
            className="h-14 bg-white/5 px-8"
            onClick={() => navigate('/student/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-[13px] italic uppercase tracking-tighter">BACK</span>
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="h-14 px-8 shadow-orange-500/20"
            onClick={downloadPDF}
            loading={busy}
          >
            <Download className="h-5 w-5" />
            <span className="text-[13px] italic uppercase tracking-tighter">DOWNLOAD PDF</span>
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <motion.div
            id="voting-receipt"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-[28px] border border-slate-300 bg-[#fffaf3] p-6 text-slate-950 shadow-2xl md:p-10"
          >
            <div className="absolute inset-x-0 top-0 h-2 bg-orange-500" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: 'linear-gradient(rgba(15,23,42,0.35) 1px, transparent 1px)',
                  backgroundSize: '100% 24px',
                }}
              />
            </div>

            <div className="relative z-10 mb-8 flex flex-col justify-between gap-8 border-b border-dashed border-slate-300 pb-8 md:flex-row">
              <div className="flex items-center gap-6">
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-orange-500">
                  <ShieldCheck className="h-10 w-10 text-white" />
                </div>
                <div>
                  <div className="mb-1 text-[10px] font-black uppercase tracking-[0.4em] text-orange-600">
                    Official Voting Receipt
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tight text-slate-950">
                    CETSO Receipt
                  </h2>
                  <div className="mt-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                    College of Engineering and Technology Student Organization
                  </div>
                </div>
              </div>

              <div className="text-left md:text-right">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                  Election Year
                </div>
                <div className="mt-1 text-xl font-black leading-none text-slate-950">
                  {receipt.electionYear}
                </div>
                <div className="mt-4 text-[9px] font-black uppercase tracking-widest text-slate-500">
                  Date & Time
                </div>
                <div className="mt-1 font-mono text-sm font-black text-orange-600">
                  {dateStr} - {timeStr}
                </div>
              </div>
            </div>

            <div className="relative z-10 mb-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
              {[
                ['Student Name', receipt.studentName],
                ['Student ID Number', receipt.studentId],
                ['Tracking Number', trackingNumber],
                ['Program / Year', `${receipt.programCode} - Year ${receipt.yearLevel}`],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-1 text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">
                    {label}
                  </div>
                  <div className="break-words font-mono text-sm font-black text-slate-950">
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div className="relative z-10 mb-8">
              <div className="mb-5 flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                Ballot Summary
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {selectedCandidates.map(({ candidate, positionTitle }) => (
                  <div
                    key={candidate.candidateId}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="mb-1 truncate text-[8px] font-black uppercase tracking-widest text-orange-600">
                      {positionTitle}
                    </div>
                    <div className="text-[12px] font-black uppercase leading-tight tracking-tight text-slate-950">
                      {candidate.fullName}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                      <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                        Confirmed
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-8 border-t border-dashed border-slate-300 pt-8 md:flex-row">
              <div id="receipt-qr" className="rounded-2xl border border-slate-200 bg-white p-4">
                <QRCodeSVG
                  value={qrPayload}
                  size={148}
                  fgColor="#000000"
                  bgColor="#ffffff"
                  level="H"
                  includeMargin
                />
              </div>

              <div className="min-w-0 flex-1 space-y-5">
                <div>
                  <div className="mb-2 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
                    QR Code / Tracking Number
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 font-mono text-sm font-black tracking-wider text-orange-600">
                    <span className="break-all">{trackingNumber}</span>
                    <QrCode className="h-5 w-5 shrink-0 text-slate-300" />
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="mb-1 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
                      Authenticated Student
                    </div>
                    <div className="text-sm font-black uppercase tracking-tight text-slate-950">
                      {receipt.studentName}
                    </div>
                    <div className="mt-1 font-mono text-xs font-black text-slate-500">
                      ID NO. {receipt.studentId}
                    </div>
                  </div>
                  <div className="w-fit rounded-full border border-green-500/30 bg-green-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-green-700">
                    Recorded
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-8 text-center text-[8px] font-black uppercase tracking-[0.35em] text-slate-400">
              CETSO Official Voting System - Receipt proves voting participation only
            </div>
          </motion.div>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <GlassCard className="space-y-8 p-8">
            <div>
              <h3 className="mb-2 text-2xl font-black italic uppercase tracking-tighter text-[var(--cetso-text)]">
                Save Receipt
              </h3>
              <p className="text-[11px] font-medium uppercase leading-relaxed tracking-widest text-[var(--cetso-text-3)]">
                Keep a copy of your voting receipt with the student name, ID number, tracking number,
                and QR code.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                variant="primary"
                size="lg"
                className="h-14 w-full shadow-orange-500/20"
                onClick={downloadPDF}
                loading={busy}
              >
                <Download className="h-5 w-5" />
                <span className="text-[13px] italic uppercase tracking-tighter">SAVE AS PDF</span>
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="h-14 w-full"
                onClick={saveAsImage}
                loading={busy}
              >
                <ImageDown className="h-5 w-5" />
                <span className="text-[13px] italic uppercase tracking-tighter">SAVE AS IMAGE</span>
              </Button>
            </div>

            <div className="border-t border-[var(--cetso-border)] pt-8">
              <div className="mb-4 text-[9px] font-black uppercase tracking-[0.3em] text-[var(--cetso-text-3)]">
                Tracking Number
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 overflow-hidden truncate rounded-2xl border border-[var(--cetso-card-border-inset)] bg-[var(--cetso-card-bg-inset)] p-4 font-mono text-xs font-black text-[var(--cetso-text-2)]">
                  {trackingNumber}
                </div>
                <button
                  type="button"
                  onClick={copyCode}
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--cetso-orange)] text-white shadow-lg transition-transform active:scale-90"
                  aria-label="Copy tracking number"
                >
                  {copied ? <CheckCircle2 className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </GlassCard>

          <div className="rounded-3xl border border-orange-500/20 bg-orange-500/10 p-6">
            <div className="mb-4 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-orange-500" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-500">
                Privacy Notice
              </span>
            </div>
            <p className="text-[11px] font-medium uppercase leading-relaxed tracking-widest text-[var(--cetso-text-3)]">
              Your vote is secret. This receipt only proves that your account submitted a ballot.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
