import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'

export type SupabaseCandidate = {
  id: string
  position_code: string
  full_name: string
  partylist: string
  tagline: string
  bio: string
}

// Map from DB snake_case to Frontend camelCase
export function mapCandidate(dbCandidate: SupabaseCandidate) {
  return {
    candidateId: dbCandidate.id,
    positionCode: dbCandidate.position_code,
    fullName: dbCandidate.full_name,
    partylist: dbCandidate.partylist,
    tagline: dbCandidate.tagline,
    bio: dbCandidate.bio,
  }
}

export function useCandidates() {
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
  })
}
