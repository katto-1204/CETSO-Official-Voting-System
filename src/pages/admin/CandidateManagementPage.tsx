import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Search, X, UserPlus, Filter, ShieldCheck, Terminal, Fingerprint, Activity, User, Edit2, ChevronRight } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import TextField from '../../components/ui/TextField'
import { CANDIDATES, POSITIONS } from '../../mocks/mockElection'
import { goeyToast } from 'goey-toast'

const AVATAR_COLORS = [
  ['rgba(255,122,24,0.16)', 'rgba(255,122,24,0.35)', '#ff7a18'],
  ['rgba(139,92,246,0.16)', 'rgba(139,92,246,0.35)', '#a78bfa'],
  ['rgba(20,184,166,0.16)', 'rgba(20,184,166,0.35)', '#2dd4bf'],
  ['rgba(59,130,246,0.16)', 'rgba(59,130,246,0.35)', '#60a5fa'],
  ['rgba(236,72,153,0.16)', 'rgba(236,72,153,0.35)', '#f472b6'],
]

function initialsOf(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('')
}

export default function CandidateManagementPage() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState(POSITIONS[0]?.positionCode ?? '')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return CANDIDATES
    return CANDIDATES.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.partylist.toLowerCase().includes(q) ||
        c.positionCode.toLowerCase().includes(q)
    )
  }, [query])

  return (
    <div className="space-y-8">
      
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Candidate Management</span>
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
            CANDIDATE<br /><span style={{ color: 'var(--cetso-text-3)' }}>REGISTRY</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
           <GlassCard className="px-5 py-3 flex items-center gap-4">
              <div className="text-right">
                 <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>Total Candidates</div>
                 <div className="text-xl font-black italic leading-none mt-1" style={{ color: 'var(--cetso-text)' }}>{CANDIDATES.length}</div>
              </div>
           </GlassCard>
           
           <Button variant="primary" size="lg" className="h-14 px-8 shadow-orange-500/20" onClick={() => setOpen(true)}>
              <UserPlus className="h-5 w-5" />
              <span className="italic tracking-tighter uppercase text-[13px]">REGISTER NEW CANDIDATE</span>
           </Button>
        </div>
      </motion.div>

      {/* Control Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard className="p-6">
           <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 group">
                 <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-orange-500" style={{ color: 'var(--cetso-text-3)' }}>
                    <Search className="h-5 w-5" />
                 </div>
                 <input 
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="SEARCH REGISTRY (NAME, POSITION, PARTY...)"
                    className="w-full border rounded-2xl py-4 pl-12 pr-12 text-sm font-bold uppercase tracking-widest placeholder:opacity-50 focus:outline-none transition-all"
                    style={{
                      background: 'var(--cetso-input-bg)',
                      border: '1px solid var(--cetso-border)',
                      color: 'var(--cetso-text)'
                    }}
                 />
                 {query && (
                    <button 
                      onClick={() => setQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                       <X className="h-4 w-4 text-white/40" />
                    </button>
                 )}
              </div>
              
              <div className="flex gap-2">
                 <Button variant="ghost" className="h-14 w-14 bg-white/5 border-white/5 p-0">
                    <Filter className="h-5 w-5 text-white/40" />
                 </Button>
                 <div className="h-14 px-5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                    <Activity className="h-4 w-4 text-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{filtered.length} CANDIDATES FOUND</span>
                 </div>
              </div>
           </div>
        </GlassCard>
      </motion.div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-12">
            <GlassCard className="overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                           {['Identity', 'Position', 'Party', 'Actions'].map((h, i) => (
                              <th key={i} className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic">
                                 {h}
                              </th>
                           ))}
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {filtered.map((c, i) => {
                           const [bg, border, text] = AVATAR_COLORS[i % AVATAR_COLORS.length]
                           return (
                              <motion.tr 
                                 key={c.candidateId}
                                 initial={{ opacity: 0, x: -10 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 transition={{ delay: 0.2 + i * 0.05 }}
                                 className="group hover:bg-white/[0.02] transition-colors"
                              >
                                 <td className="px-8 py-6">
                                    <div className="flex items-center gap-5">
                                       <div 
                                          className="h-12 w-12 rounded-2xl grid place-items-center font-black text-sm relative group-hover:scale-110 transition-transform duration-500"
                                          style={{ background: bg, border: `1.5px solid ${border}`, color: text }}
                                       >
                                          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                          {initialsOf(c.fullName)}
                                       </div>
                                       <div>
                                          <div className="text-base font-black italic uppercase tracking-tighter text-white">{c.fullName}</div>
                                          <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em] mt-0.5">{c.tagline || 'No Campaign Profile Recorded'}</div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-8 py-6">
                                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/5 group-hover:border-orange-500/20 transition-colors">
                                       <Terminal className="h-3 w-3 text-orange-500" />
                                       <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/60">{c.positionCode.replaceAll('_', ' ')}</span>
                                    </div>
                                 </td>
                                 <td className="px-8 py-6">
                                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-orange-500/5 border border-orange-500/10">
                                       <ShieldCheck className="h-3 w-3 text-orange-500" />
                                       <span className="text-[10px] font-black uppercase tracking-[0.15em] text-orange-500/80">{c.partylist}</span>
                                    </div>
                                 </td>
                                 <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                       <Button variant="ghost" size="sm" className="bg-white/5 h-10 w-10 p-0 border-white/5 hover:bg-white/10">
                                          <Edit2 className="h-4 w-4 text-white/40" />
                                       </Button>
                                       <Button 
                                          variant="danger" 
                                          size="sm" 
                                          className="bg-red-500/10 border-red-500/20 text-red-500 h-10 px-4 group/del"
                                          onClick={() => goeyToast.error('Encryption Lock: System write-access disabled in demo.')}
                                       >
                                          <Trash2 className="h-4 w-4 group-hover/del:scale-110 transition-transform" />
                                          <span className="text-[10px] font-black uppercase">Purge</span>
                                       </Button>
                                    </div>
                                 </td>
                              </motion.tr>
                           )
                        })}
                     </tbody>
                  </table>
               </div>
               
               {filtered.length === 0 && (
                  <div className="p-20 text-center flex flex-col items-center justify-center">
                     <div className="h-16 w-16 rounded-full bg-white/5 grid place-items-center mb-4">
                        <Search className="h-8 w-8 text-white/10" />
                     </div>
                     <div className="text-xl font-black italic uppercase tracking-tighter text-white/20">No matching registry entries</div>
                  </div>
               )}
               
               <div className="p-6 border-t border-white/5 bg-black/20 flex items-center justify-between">
                  <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
                     Registry Segment 01 of 01 • Live Updates Active
                  </div>
                  <div className="flex gap-2">
                     {[1,2].map(i => (
                        <div key={i} className={`h-1.5 w-${i === 1 ? '8' : '4'} rounded-full bg-${i === 1 ? 'orange-500' : 'white/10'}`} />
                     ))}
                  </div>
               </div>
            </GlassCard>
         </div>
      </div>

      {/* Add Candidate Slide-over */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md" />
          <Dialog.Content className="fixed right-0 top-0 h-full w-full max-w-[560px] z-[70] flex flex-col bg-[#07070c] border-l border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden">
            {/* Header */}
            <div className="p-8 md:p-12 border-b border-white/5 bg-black/20 relative">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <UserPlus className="h-32 w-32" />
               </div>
               
               <div className="flex items-center justify-between relative z-10">
                  <div>
                     <div className="flex items-center gap-3 mb-2">
                        <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Candidate Details</span>
                     </div>
                     <Dialog.Title className="text-4xl font-black italic uppercase tracking-tighter text-white">
                        REGISTER<br /><span className="text-orange-500">NEW CANDIDATE</span>
                     </Dialog.Title>
                  </div>
                  <Dialog.Close asChild>
                     <button className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 grid place-items-center hover:bg-white/10 transition-colors">
                        <X className="h-6 w-6 text-white/60" />
                     </button>
                  </Dialog.Close>
               </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-8 custom-scrollbar">
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Clearance Designation (Position)</label>
                     <div className="relative group">
                        <select 
                           value={selectedPosition}
                           onChange={(e) => setSelectedPosition(e.target.value)}
                           className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold uppercase tracking-widest text-white focus:outline-none focus:border-orange-500/30 transition-all appearance-none"
                        >
                           {POSITIONS.map((p) => (
                              <option key={p.positionCode} value={p.positionCode} className="bg-[#0b0b10]">
                                 {p.title}
                              </option>
                           ))}
                        </select>
                        <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-hover:text-orange-500 transition-colors rotate-90" />
                     </div>
                  </div>

                  <TextField label="Full Operational Identity (Name)" placeholder="LASTNAME, FIRSTNAME M." />
                  <TextField label="Combat Group (Partylist)" placeholder="e.g. ALPHA_VANGUARD" />
                  <TextField label="Campaign Tagline" placeholder="Campaign strategy summary..." />

                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Candidate Photo</label>
                     <div className="aspect-square w-40 rounded-3xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 hover:border-orange-500/30 transition-colors cursor-pointer group">
                        <div className="h-12 w-12 rounded-2xl bg-white/5 grid place-items-center group-hover:bg-orange-500/10 transition-colors">
                           <User className="h-6 w-6 text-white/20 group-hover:text-orange-500" />
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Upload Identity</span>
                     </div>
                  </div>
               </div>
               
               <div className="rounded-2xl p-6 bg-blue-500/5 border border-blue-500/10">
                  <div className="flex items-center gap-3 mb-3">
                     <Fingerprint className="h-4 w-4 text-blue-500" />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Protocol Verification</span>
                  </div>
                  <p className="text-[10px] font-medium leading-relaxed text-white/30 uppercase tracking-widest">
                     Registering a new candidate will update the system. Ensure all details are accurate before saving.
                  </p>
               </div>
            </div>

            {/* Footer */}
            <div className="p-8 md:p-12 border-t border-white/5 bg-black/20 flex gap-4">
               <Dialog.Close asChild>
                  <Button variant="secondary" className="flex-1 h-14 bg-white/5 border-white/10 uppercase italic tracking-tighter">Abort</Button>
               </Dialog.Close>
               <Button 
                  variant="primary" 
                  className="flex-[2] h-14 shadow-orange-500/20 uppercase italic tracking-tighter"
                  onClick={() => {
                     goeyToast.success('Candidate registration initiated.')
                     setOpen(false)
                  }}
               >
                  Authorize Entry
               </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  )
}
