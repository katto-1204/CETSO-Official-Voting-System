import { Fragment, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Search, X, UserPlus, Filter, Terminal, Fingerprint, Activity, User, Edit2, ChevronRight, RefreshCw } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import TextField from '../../components/ui/TextField'
import Modal from '../../components/ui/Modal'
import { POSITIONS, CANDIDATES, POSITION_GROUP_LABELS, getPositionGroupLabel } from '../../lib/electionData'
import { useCandidates, useCreateCandidate, useUpdateCandidate, useDeleteCandidate } from '../../lib/queries'
import { supabase } from '../../lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { goeyToast } from 'goey-toast'
import imageCompression from 'browser-image-compression'

const AVATAR_COLORS = [
  ['rgba(255,122,24,0.16)', 'rgba(255,122,24,0.35)', '#ff7a18'],
  ['rgba(139,92,246,0.16)', 'rgba(139,92,246,0.35)', '#a78bfa'],
  ['rgba(20,184,166,0.16)', 'rgba(20,184,166,0.35)', '#2dd4bf'],
  ['rgba(59,130,246,0.16)', 'rgba(59,130,246,0.35)', '#60a5fa'],
  ['rgba(236,72,153,0.16)', 'rgba(236,72,153,0.35)', '#f472b6'],
]

const positionByCode = new Map(POSITIONS.map((position) => [position.positionCode, position]))
const executivePositions = POSITIONS.filter((position) => position.positionGroup === 'executive_officers')
const representativePositions = POSITIONS.filter((position) => position.positionGroup === 'year_level_representatives')
const pioPositions = POSITIONS.filter((position) => position.positionGroup === 'public_information_officers')

function getPositionLabel(positionCode: string) {
  return positionByCode.get(positionCode)?.title ?? positionCode.replaceAll('_', ' ')
}

function getPositionSortOrder(positionCode: string) {
  return positionByCode.get(positionCode)?.sortOrder ?? Number.MAX_SAFE_INTEGER
}

function getCandidateCategory(positionCode: string) {
  return getPositionGroupLabel(positionCode)
}

function initialsOf(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('')
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export default function CandidateManagementPage() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  
  // CRUD Form States
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [selectedPosition, setSelectedPosition] = useState(POSITIONS[0]?.positionCode ?? '')
  const [bio, setBio] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const queryClient = useQueryClient()
  const { data: dbCandidates = [] } = useCandidates()
  const createCandidate = useCreateCandidate()
  const updateCandidate = useUpdateCandidate()
  const deleteCandidate = useDeleteCandidate()
  const [seeding, setSeeding] = useState(false)
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(() => new Set())
  const [deletingBulk, setDeletingBulk] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    type: 'single' | 'bulk' | 'all'
    title: string
    message: string
    confirmText: string
    doubleConfirmPhrase?: string
    onConfirm: () => Promise<void>
  }>({
    isOpen: false,
    type: 'single',
    title: '',
    message: '',
    confirmText: '',
    onConfirm: async () => {}
  })
  const [typedPhrase, setTypedPhrase] = useState('')

  async function executeDeleteSelectedCandidates() {
    setDeletingBulk(true)
    try {
      const candidateIdsArray = Array.from(selectedCandidateIds)

      // First delete associated vote selections to satisfy foreign key constraints
      const { error: voteSelError } = await supabase
        .from('vote_selections')
        .delete()
        .in('candidate_id', candidateIdsArray)

      if (voteSelError) throw voteSelError

      // Then delete candidates
      const { error } = await supabase
        .from('candidates')
        .delete()
        .in('id', candidateIdsArray)

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      setSelectedCandidateIds(new Set())
      goeyToast.success(`Successfully deleted ${selectedCandidateIds.size} candidate(s).`)
    } catch (err: any) {
      goeyToast.error('Bulk deletion failed: ' + err.message)
    } finally {
      setDeletingBulk(false)
    }
  }

  function deleteSelectedCandidates() {
    const count = selectedCandidateIds.size
    if (count === 0) return
    setDeleteConfirm({
      isOpen: true,
      type: 'bulk',
      title: 'CONFIRM BULK DELETION',
      message: `Are you absolutely sure you want to delete the ${count} selected candidate(s)? This action is irreversible.`,
      confirmText: 'Purge Selected',
      onConfirm: async () => {
        await executeDeleteSelectedCandidates()
      }
    })
  }

  async function executeDeleteAllCandidates() {
    setDeletingBulk(true)
    try {
      // First delete all vote selections to satisfy foreign key constraints
      const { error: voteSelError } = await supabase
        .from('vote_selections')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (voteSelError) throw voteSelError

      // Then delete all candidates
      const { error } = await supabase
        .from('candidates')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // delete all

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      setSelectedCandidateIds(new Set())
      goeyToast.success('All candidates successfully wiped.')
    } catch (err: any) {
      goeyToast.error('Wipe failed: ' + err.message)
    } finally {
      setDeletingBulk(false)
    }
  }

  function deleteAllCandidates() {
    setDeleteConfirm({
      isOpen: true,
      type: 'all',
      title: 'CRITICAL: PURGE ALL CANDIDATES',
      message: 'WARNING: Are you absolutely sure you want to delete ALL candidates? This will wipe the entire candidate registry. This cannot be undone.',
      confirmText: 'Wipe Candidates',
      doubleConfirmPhrase: 'DELETE ALL CANDIDATES',
      onConfirm: async () => {
        await executeDeleteAllCandidates()
      }
    })
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const candidates = q ? dbCandidates.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.positionCode.toLowerCase().includes(q) ||
        getPositionLabel(c.positionCode).toLowerCase().includes(q)
    ) : dbCandidates

    return candidates.slice().sort((a, b) => {
      const positionSort = getPositionSortOrder(a.positionCode) - getPositionSortOrder(b.positionCode)
      if (positionSort !== 0) return positionSort
      return a.fullName.localeCompare(b.fullName)
    })
  }, [query, dbCandidates])

  const groupedCandidates = useMemo(() => {
    return [
      {
        category: POSITION_GROUP_LABELS.executive_officers,
        description: 'President to Business Managers',
        candidates: filtered.filter((candidate) => getCandidateCategory(candidate.positionCode) === POSITION_GROUP_LABELS.executive_officers),
      },
      {
        category: POSITION_GROUP_LABELS.year_level_representatives,
        description: 'Program and year-level representatives',
        candidates: filtered.filter((candidate) => getCandidateCategory(candidate.positionCode) === POSITION_GROUP_LABELS.year_level_representatives),
      },
      {
        category: POSITION_GROUP_LABELS.public_information_officers,
        description: 'Program public information officers',
        candidates: filtered.filter((candidate) => getCandidateCategory(candidate.positionCode) === POSITION_GROUP_LABELS.public_information_officers),
      },
    ].filter((group) => group.candidates.length > 0)
  }, [filtered])

  const currentInitials = initialsOf(fullName)

  // Seed default candidates if the database is empty
  async function seedDefaults() {
    setSeeding(true)
    try {
      const { error } = await supabase.from('candidates').insert(
        CANDIDATES.map((c) => ({
          position_code: c.positionCode,
          full_name: c.fullName,
          partylist: '',
          tagline: '',
          bio: c.bio,
          image_url: c.imageUrl || null,
        }))
      )
      if (error) throw error
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      goeyToast.success('Database initialized with default candidates!')
    } catch (err: any) {
      goeyToast.error('Seeding failed: ' + err.message)
    } finally {
      setSeeding(false)
    }
  }

  function handleOpenCreate() {
    setIsEditing(false)
    setEditingId(null)
    setFullName('')
    setSelectedPosition(POSITIONS[0]?.positionCode ?? '')
    setBio('')
    setImageUrl('')
    setOpen(true)
  }

  function handleOpenEdit(candidate: any) {
    setIsEditing(true)
    setEditingId(candidate.candidateId)
    setFullName(candidate.fullName)
    setSelectedPosition(candidate.positionCode)
    setBio(candidate.bio)
    setImageUrl(candidate.imageUrl || '')
    setOpen(true)
  }

  async function handleImageUpload(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      goeyToast.error('Please upload an image file.')
      return
    }

    try {
      const options = {
        maxSizeMB: 0.9,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      }
      const compressedFile = await imageCompression(file, options)
      setImageUrl(await fileToDataUrl(compressedFile))
      goeyToast.success('Candidate photo loaded and compressed.')
    } catch {
      goeyToast.error('Could not read or compress image file.')
    }
  }

  async function handleSave() {
    if (!fullName.trim()) {
      goeyToast.error('Full Name is required')
      return
    }

    try {
      if (isEditing && editingId) {
        await updateCandidate.mutateAsync({
          id: editingId,
          position_code: selectedPosition,
          full_name: fullName.trim(),
          partylist: '',
          tagline: '',
          bio: bio.trim(),
          image_url: imageUrl || null,
        })
        goeyToast.success('Candidate updated successfully!')
      } else {
        await createCandidate.mutateAsync({
          position_code: selectedPosition,
          full_name: fullName.trim(),
          partylist: '',
          tagline: '',
          bio: bio.trim(),
          image_url: imageUrl || null,
        })
        goeyToast.success('Candidate added successfully!')
      }
      setOpen(false)
    } catch (err: any) {
      goeyToast.error(err.message || 'Operation failed')
    }
  }

  async function executeDeleteCandidate(id: string) {
    try {
      await deleteCandidate.mutateAsync(id)
      goeyToast.success('Candidate purged successfully.')
    } catch (err: any) {
      goeyToast.error(err.message || 'Deletion failed')
    }
  }

  function handleDelete(id: string, name: string) {
    setDeleteConfirm({
      isOpen: true,
      type: 'single',
      title: 'PURGE CANDIDATE',
      message: `Are you sure you want to delete ${name}? This action is irreversible.`,
      confirmText: 'Purge Candidate',
      onConfirm: async () => {
        await executeDeleteCandidate(id)
      }
    })
  }

  return (
    <div className="space-y-8">
      <Modal 
        isOpen={deleteConfirm.isOpen} 
        onClose={() => {
          setDeleteConfirm(prev => ({ ...prev, isOpen: false }))
          setTypedPhrase('')
        }} 
        title={deleteConfirm.title} 
        maxWidth="max-w-md"
      >
        <div className="space-y-6">
          <div className="flex items-start gap-4 bg-red-500/5 border border-red-500/10 rounded-2xl p-5">
            <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
              <Trash2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold uppercase tracking-wider text-red-400">Irreversible Action</h4>
              <p className="text-xs font-semibold text-white/70 leading-relaxed">
                {deleteConfirm.message}
              </p>
            </div>
          </div>

          {deleteConfirm.doubleConfirmPhrase && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 block">
                Type "<span className="text-red-400 font-mono select-none">{deleteConfirm.doubleConfirmPhrase}</span>" to confirm:
              </label>
              <input
                type="text"
                value={typedPhrase}
                onChange={(e) => setTypedPhrase(e.target.value)}
                placeholder="TYPE CONFIRMATION PHRASE..."
                className="w-full border rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-widest placeholder:opacity-40 focus:outline-none transition-all"
                style={{
                  background: 'var(--cetso-input-bg)',
                  border: '1px solid var(--cetso-border)',
                  color: 'var(--cetso-text)'
                }}
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              className="flex-1 h-12" 
              onClick={() => {
                setDeleteConfirm(prev => ({ ...prev, isOpen: false }))
                setTypedPhrase('')
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              className="flex-1 h-12" 
              disabled={deleteConfirm.doubleConfirmPhrase ? typedPhrase !== deleteConfirm.doubleConfirmPhrase : false}
              onClick={async () => {
                await deleteConfirm.onConfirm()
                setDeleteConfirm(prev => ({ ...prev, isOpen: false }))
                setTypedPhrase('')
              }}
            >
              {deleteConfirm.confirmText}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Candidate Directory</span>
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
            CANDIDATE<br /><span style={{ color: 'var(--cetso-text-3)' }}>MANAGEMENT</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
           <GlassCard className="px-5 py-3 flex items-center gap-4">
              <div className="text-right">
                 <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>Total Candidates</div>
                 <div className="text-xl font-black italic leading-none mt-1" style={{ color: 'var(--cetso-text)' }}>{dbCandidates.length}</div>
              </div>
           </GlassCard>
           
           {dbCandidates.length === 0 && (
             <Button 
               variant="secondary" 
               size="lg" 
               className="h-14 px-6 border-dashed"
               onClick={seedDefaults}
               disabled={seeding}
             >
                <RefreshCw className={`h-4 w-4 ${seeding ? 'animate-spin' : ''}`} />
                <span className="italic tracking-tighter uppercase text-[13px]">SEED DEFAULT CANDIDATES</span>
             </Button>
           )}

           <Button variant="primary" size="lg" className="h-14 px-8 shadow-orange-500/20" onClick={handleOpenCreate}>
              <UserPlus className="h-5 w-5" />
              <span className="italic tracking-tighter uppercase text-[13px]">ADD NEW CANDIDATE</span>
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
                     placeholder="SEARCH BY NAME OR POSITION..."
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
                       className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--cetso-surface-3)] rounded-lg transition-colors"
                     >
                        <X className="h-4 w-4" style={{ color: 'var(--cetso-text-3)' }} />
                     </button>
                  )}
              </div>
              
              <div className="flex gap-2">
                 <Button variant="ghost" className="h-14 w-14 p-0" style={{ background: 'var(--cetso-surface-2)', border: '1px solid var(--cetso-border)' }}>
                    <Filter className="h-5 w-5" style={{ color: 'var(--cetso-text-3)' }} />
                 </Button>
                 <div className="h-14 px-5 rounded-2xl flex items-center gap-3" style={{ background: 'var(--cetso-surface-2)', border: '1px solid var(--cetso-border)' }}>
                    <Activity className="h-4 w-4 text-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--cetso-text-3)' }}>{filtered.length} CANDIDATES FOUND</span>
                 </div>
              </div>
           </div>
        </GlassCard>
      </motion.div>

      {/* Bulk Actions Panel */}
      <AnimatePresence>
        {(selectedCandidateIds.size > 0 || dbCandidates.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border"
              style={{
                background: 'rgba(239, 68, 68, 0.03)',
                borderColor: 'rgba(239, 68, 68, 0.12)'
              }}
            >
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-red-400">
                  {selectedCandidateIds.size > 0 
                    ? `${selectedCandidateIds.size} candidate(s) selected` 
                    : 'Bulk Management System'}
                </span>
              </div>
              <div className="flex gap-2">
                {selectedCandidateIds.size > 0 && (
                  <>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => setSelectedCandidateIds(new Set())}
                    >
                      Clear Selection
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={deleteSelectedCandidates}
                      loading={deletingBulk}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Selected
                    </Button>
                  </>
                )}
                {dbCandidates.length > 0 && selectedCandidateIds.size === 0 && (
                  <Button 
                    variant="danger" 
                    size="sm" 
                    className="border-dashed"
                    onClick={deleteAllCandidates}
                    loading={deletingBulk}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Purge All Candidates ({dbCandidates.length})
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-12">
            <GlassCard className="overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr style={{ borderBottom: '1px solid var(--cetso-border)', background: 'var(--cetso-surface-2)' }}>
                           <th className="px-8 py-5 w-10">
                              <input
                                 type="checkbox"
                                 checked={filtered.length > 0 && filtered.every((c) => selectedCandidateIds.has(c.candidateId))}
                                 onChange={(e) => {
                                    if (e.target.checked) {
                                       setSelectedCandidateIds(new Set([...selectedCandidateIds, ...filtered.map((c) => c.candidateId)]))
                                    } else {
                                       const next = new Set(selectedCandidateIds)
                                       filtered.forEach((c) => next.delete(c.candidateId))
                                       setSelectedCandidateIds(next)
                                    }
                                 }}
                                 className="h-4 w-4 rounded border-white/15 bg-white/5 text-orange-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-orange-500"
                              />
                           </th>
                           {['Candidate', 'Position', 'Category', 'Actions'].map((h, i) => (
                              <th key={i} className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] italic" style={{ color: 'var(--cetso-text-3)' }}>
                                 {h}
                              </th>
                           ))}
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {groupedCandidates.map((group) => (
                           <Fragment key={group.category}>
                              <tr>
                                 <td colSpan={5} className="px-8 py-4" style={{ background: 'rgba(255,122,24,0.04)', borderTop: '1px solid var(--cetso-border)', borderBottom: '1px solid var(--cetso-border)' }}>
                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                       <div>
                                          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">{group.category}</div>
                                          <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--cetso-text-3)' }}>{group.description}</div>
                                       </div>
                                       <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--cetso-text-3)' }}>
                                          {group.candidates.length} candidate{group.candidates.length !== 1 ? 's' : ''}
                                       </div>
                                    </div>
                                 </td>
                              </tr>
                              {group.candidates.map((c, i) => {
                                 const [bg, border, text] = AVATAR_COLORS[(getPositionSortOrder(c.positionCode) + i) % AVATAR_COLORS.length]
                                 return (
                                    <motion.tr 
                                       key={c.candidateId}
                                       initial={{ opacity: 0, x: -10 }}
                                       animate={{ opacity: 1, x: 0 }}
                                       transition={{ delay: 0.2 + i * 0.04 }}
                                       className={`group hover:bg-[var(--cetso-surface-2)] transition-colors ${selectedCandidateIds.has(c.candidateId) ? 'bg-orange-500/5 hover:bg-orange-500/10' : ''}`}
                                    >
                                       <td className="px-8 py-6 w-10">
                                          <input
                                             type="checkbox"
                                             checked={selectedCandidateIds.has(c.candidateId)}
                                             onChange={(e) => {
                                                const next = new Set(selectedCandidateIds)
                                                if (e.target.checked) {
                                                   next.add(c.candidateId)
                                                } else {
                                                   next.delete(c.candidateId)
                                                }
                                                setSelectedCandidateIds(next)
                                             }}
                                             className="h-4 w-4 rounded border-white/15 bg-white/5 text-orange-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-orange-500"
                                          />
                                       </td>
                                       <td className="px-8 py-6">
                                          <div className="flex items-center gap-5">
                                             <div 
                                                className="h-12 w-12 rounded-2xl grid place-items-center font-black text-sm relative group-hover:scale-110 transition-transform duration-500 overflow-hidden"
                                                style={{ background: bg, border: `1.5px solid ${border}`, color: text }}
                                             >
                                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                {c.imageUrl ? (
                                                   <img src={c.imageUrl} alt={c.fullName} className="h-full w-full object-cover" />
                                                ) : (
                                                   initialsOf(c.fullName)
                                                )}
                                             </div>
                                             <div>
                                                <div className="text-base font-black italic uppercase tracking-tighter" style={{ color: 'var(--cetso-text)' }}>{c.fullName}</div>
                                             </div>
                                          </div>
                                       </td>
                                       <td className="px-8 py-6">
                                          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl group-hover:border-orange-500/20 transition-colors" style={{ background: 'var(--cetso-surface-2)', border: '1px solid var(--cetso-border)' }}>
                                             <Terminal className="h-3 w-3 text-orange-500" />
                                             <span className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: 'var(--cetso-text-2)' }}>{getPositionLabel(c.positionCode)}</span>
                                          </div>
                                       </td>
                                       <td className="px-8 py-6">
                                          <span
                                             className="inline-flex rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em]"
                                             style={{
                                    background: getCandidateCategory(c.positionCode) === POSITION_GROUP_LABELS.year_level_representatives ? 'rgba(20,184,166,0.12)' : 'rgba(255,122,24,0.10)',
                                    border: getCandidateCategory(c.positionCode) === POSITION_GROUP_LABELS.year_level_representatives ? '1px solid rgba(20,184,166,0.24)' : '1px solid rgba(255,122,24,0.22)',
                                    color: getCandidateCategory(c.positionCode) === POSITION_GROUP_LABELS.year_level_representatives ? '#2dd4bf' : 'var(--cetso-orange)',
                                             }}
                                          >
                                             {getCandidateCategory(c.positionCode)}
                                          </span>
                                       </td>
                                       <td className="px-8 py-6">
                                          <div className="flex items-center gap-3">
                                             <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-10 w-10 p-0 hover:bg-orange-500/10 hover:border-orange-500/20" 
                                                style={{ background: 'var(--cetso-surface-2)', border: '1px solid var(--cetso-border)' }}
                                                onClick={() => handleOpenEdit(c)}
                                             >
                                                <Edit2 className="h-4 w-4" style={{ color: 'var(--cetso-text-3)' }} />
                                             </Button>
                                             <Button 
                                                variant="danger" 
                                                size="sm" 
                                                className="bg-red-500/10 border-red-500/20 text-red-500 h-10 px-4 group/del"
                                                onClick={() => handleDelete(c.candidateId, c.fullName)}
                                             >
                                                <Trash2 className="h-4 w-4 group-hover/del:scale-110 transition-transform" />
                                                <span className="text-[10px] font-black uppercase">Purge</span>
                                             </Button>
                                          </div>
                                       </td>
                                    </motion.tr>
                                 )
                              })}
                           </Fragment>
                        ))}
                     </tbody>
                  </table>
               </div>
               
               {filtered.length === 0 && (
                  <div className="p-20 text-center flex flex-col items-center justify-center">
                     <div className="h-16 w-16 rounded-full grid place-items-center mb-4" style={{ background: 'var(--cetso-surface-2)' }}>
                        <Search className="h-8 w-8" style={{ color: 'var(--cetso-text-3)' }} />
                     </div>
                     <div className="text-xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--cetso-text-3)' }}>No candidates found</div>
                  </div>
               )}
               
               <div className="p-6 flex items-center justify-between" style={{ borderTop: '1px solid var(--cetso-border)', background: 'var(--cetso-surface-2)' }}>
                  <div className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--cetso-text-3)' }}>
                     Live Candidate RegistrySegment • Direct Database Sync
                  </div>
                  <div className="flex gap-2">
                     {[1,2].map(i => (
                        <div key={i} className="h-1.5 rounded-full" style={{ width: i === 1 ? 32 : 16, background: i === 1 ? 'var(--cetso-orange)' : 'var(--cetso-surface-3)' }} />
                     ))}
                  </div>
               </div>
            </GlassCard>
         </div>
      </div>

      {/* Add / Edit Candidate Slide-over */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md" />
          <Dialog.Content className="fixed right-0 top-0 h-full w-full max-w-[560px] z-[70] flex flex-col overflow-hidden" style={{ background: 'var(--cetso-surface-1)', borderLeft: '1px solid var(--cetso-border)', boxShadow: 'var(--cetso-card-shadow)' }}>
            {/* Header */}
            <div className="p-8 md:p-12 relative" style={{ borderBottom: '1px solid var(--cetso-border)', background: 'var(--cetso-surface-2)' }}>
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <UserPlus className="h-32 w-32" />
               </div>
               
               <div className="flex items-center justify-between relative z-10">
                  <div>
                     <div className="flex items-center gap-3 mb-2">
                        <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Candidate Details</span>
                     </div>
                     <Dialog.Title className="text-4xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--cetso-text)' }}>
                        {isEditing ? 'UPDATE' : 'REGISTER'}<br />
                        <span className="text-orange-500">{isEditing ? 'CANDIDATE' : 'NEW CANDIDATE'}</span>
                     </Dialog.Title>
                  </div>
                  <Dialog.Close asChild>
                     <button className="h-12 w-12 rounded-2xl grid place-items-center hover:bg-white/10 transition-colors" style={{ background: 'var(--cetso-surface-2)', border: '1px solid var(--cetso-border)' }}>
                        <X className="h-6 w-6" style={{ color: 'var(--cetso-text-2)' }} />
                     </button>
                  </Dialog.Close>
               </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-8 custom-scrollbar">
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--cetso-text-3)' }}>Position</label>
                     <div className="relative group">
                        <select 
                           value={selectedPosition}
                           onChange={(e) => setSelectedPosition(e.target.value)}
                           className="w-full rounded-2xl py-4 px-6 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-orange-500/30 transition-all appearance-none"
                           style={{ background: 'var(--cetso-surface-2)', border: '1px solid var(--cetso-border)', color: 'var(--cetso-text)' }}
                        >
                           <optgroup label="Executive Officers" className="bg-[#0b0b10]">
                              {executivePositions.map((p) => (
                                 <option key={p.positionCode} value={p.positionCode} className="bg-[#0b0b10]">
                                    {p.title}
                                 </option>
                              ))}
                           </optgroup>
                           <optgroup label="Year Level Representatives" className="bg-[#0b0b10]">
                              {representativePositions.map((p) => (
                                 <option key={p.positionCode} value={p.positionCode} className="bg-[#0b0b10]">
                                    {p.title}
                                 </option>
                              ))}
                           </optgroup>
                           <optgroup label="Public Information Officers" className="bg-[#0b0b10]">
                              {pioPositions.map((p) => (
                                 <option key={p.positionCode} value={p.positionCode} className="bg-[#0b0b10]">
                                    {p.title}
                                 </option>
                              ))}
                           </optgroup>
                        </select>
                        <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors rotate-90" style={{ color: 'var(--cetso-text-3)' }} />
                     </div>
                  </div>

                  <TextField 
                    label="Full Name" 
                    placeholder="Enter Candidate Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  
                  <div className="space-y-2">
                     <label className="mb-2 block text-sm font-semibold text-[var(--cetso-text)] tracking-[-0.01em]">Biography / Platform</label>
                     <textarea
                        rows={4}
                        placeholder="Enter Candidate biography, platform, or description..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full rounded-2xl px-4 py-3 text-sm text-[var(--cetso-text)] bg-[var(--cetso-input-bg)] shadow-[var(--cetso-input-shadow)] border border-[var(--cetso-border)] hover:border-[var(--cetso-input-border-hover)] focus:border-[var(--cetso-border-strong)] focus:bg-[rgba(255,122,24,0.04)] focus:shadow-[var(--cetso-input-focus-shadow)] focus:outline-none transition-all resize-none"
                     />
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--cetso-text-3)' }}>Candidate Photo</label>
                     <div className="flex items-center gap-4">
                        <div className="aspect-square w-28 rounded-3xl flex flex-col items-center justify-center gap-3 overflow-hidden" style={{ background: 'var(--cetso-surface-2)', border: '1px solid var(--cetso-border)' }}>
                           {imageUrl ? (
                              <img src={imageUrl} alt="Candidate preview" className="h-full w-full object-cover" />
                           ) : fullName ? (
                              <div className="h-16 w-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-500 grid place-items-center font-black text-xl">
                                 {currentInitials}
                              </div>
                           ) : (
                              <div className="h-16 w-16 rounded-2xl bg-[var(--cetso-surface-3)] grid place-items-center">
                                 <User className="h-8 w-8" style={{ color: 'var(--cetso-text-3)' }} />
                              </div>
                           )}
                        </div>
                        <div className="space-y-3">
                           <p className="text-[10px] font-medium leading-relaxed uppercase tracking-wider text-[var(--cetso-text-3)] max-w-xs">
                              Upload a square or portrait image. Students will see this photo in the candidate list and voting ballot.
                           </p>
                           <div className="flex flex-wrap gap-2">
                              <label className="inline-flex h-10 cursor-pointer items-center rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 text-[10px] font-black uppercase tracking-widest text-orange-400 transition hover:bg-orange-500/20">
                                 Upload Photo
                                 <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(event) => {
                                       void handleImageUpload(event.target.files?.[0])
                                       event.target.value = ''
                                    }}
                                 />
                              </label>
                              {imageUrl && (
                                 <button
                                    type="button"
                                    onClick={() => setImageUrl('')}
                                    className="h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-[10px] font-black uppercase tracking-widest text-white/50 transition hover:bg-white/10"
                                 >
                                    Remove
                                 </button>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="rounded-2xl p-6 bg-orange-500/5 border border-orange-500/10">
                  <div className="flex items-center gap-3 mb-3">
                     <Fingerprint className="h-4 w-4 text-orange-500" />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Security Verification</span>
                  </div>
                  <p className="text-[10px] font-medium leading-relaxed uppercase tracking-widest text-[var(--cetso-text-3)]">
                     Adding or updating a candidate is highly critical and will immediately sync with the student voting interface. Make sure details are accurate.
                  </p>
               </div>
            </div>

            {/* Footer */}
            <div className="p-8 md:p-12 flex gap-4" style={{ borderTop: '1px solid var(--cetso-border)', background: 'var(--cetso-surface-2)' }}>
               <Dialog.Close asChild>
                  <Button variant="secondary" className="flex-1 h-14 uppercase italic tracking-tighter" style={{ background: 'var(--cetso-surface-2)', border: '1px solid var(--cetso-border)', color: 'var(--cetso-text)' }}>Cancel</Button>
               </Dialog.Close>
               <Button 
                  variant="primary" 
                  className="flex-[2] h-14 shadow-orange-500/20 uppercase italic tracking-tighter"
                  onClick={handleSave}
               >
                  Save Candidate
               </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  )
}

