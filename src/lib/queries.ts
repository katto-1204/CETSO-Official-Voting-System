import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase'
import { CANDIDATES } from './electionData'

export type SupabaseCandidate = {
  id: string
  position_code: string
  full_name: string
  partylist: string
  tagline: string
  bio: string
  image_url?: string | null
}

// Map from DB snake_case to Frontend camelCase
export function mapCandidate(dbCandidate: SupabaseCandidate) {
  // Find matching candidate in the official seed list to grab fallback image_url if empty/null
  const cleanDbName = dbCandidate.full_name.trim().toUpperCase().replace('JHON', 'JOHN')
  const seedMatch = CANDIDATES.find(
    (c) => c.fullName.trim().toUpperCase().replace('JHON', 'JOHN') === cleanDbName
  )

  let finalImageUrl = dbCandidate.image_url
  if (!finalImageUrl || finalImageUrl === 'null' || finalImageUrl === 'NULL') {
    finalImageUrl = seedMatch ? seedMatch.imageUrl : ''
  }

  return {
    candidateId: dbCandidate.id,
    positionCode: dbCandidate.position_code,
    fullName: dbCandidate.full_name,
    partylist: dbCandidate.partylist || '',
    tagline: dbCandidate.tagline || '',
    bio: dbCandidate.bio || '',
    imageUrl: finalImageUrl || '',
  }
}

export function useCandidates() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel('public:candidates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'candidates' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['candidates'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')

      if (error) {
        console.error('Supabase fetch error:', error)
        throw new Error(error.message)
      }

      return (data as SupabaseCandidate[]).map(mapCandidate)
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

export function useCreateCandidate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (candidate: Omit<SupabaseCandidate, 'id'>) => {
      const { data, error } = await supabase
        .from('candidates')
        .insert(candidate)
        .select()
        .single()
      if (error) {
        console.error('Error creating candidate:', error)
        throw new Error(error.message)
      }
      return mapCandidate(data as SupabaseCandidate)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    }
  })
}

export function useUpdateCandidate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (candidate: SupabaseCandidate) => {
      const { data, error } = await supabase
        .from('candidates')
        .update({
          position_code: candidate.position_code,
          full_name: candidate.full_name,
          partylist: candidate.partylist,
          tagline: candidate.tagline,
          bio: candidate.bio,
          image_url: candidate.image_url || null
        })
        .eq('id', candidate.id)
        .select()
        .single()
      if (error) {
        console.error('Error updating candidate:', error)
        throw new Error(error.message)
      }
      return mapCandidate(data as SupabaseCandidate)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    }
  })
}

export function useDeleteCandidate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id)
      if (error) {
        console.error('Error deleting candidate:', error)
        throw new Error(error.message)
      }
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    }
  })
}
