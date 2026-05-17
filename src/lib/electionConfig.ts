import { supabase } from './supabase'

export interface ElectionConfig {
  enabled: boolean
  startDate: string
  endDate: string
}

const DEFAULT_CONFIG: ElectionConfig = {
  enabled: true,
  startDate: new Date().toISOString().slice(0, 16),
  endDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().slice(0, 16)
}

// Memory cache to return immediately
let cachedConfig: ElectionConfig | null = null

export async function fetchElectionConfig(): Promise<ElectionConfig> {
  try {
    // 1. Try to read from the election_config table in Supabase
    const { data, error } = await supabase
      .from('election_config')
      .select('*')

    if (error) {
      throw error
    }

    if (data && data.length > 0) {
      const configMap: Record<string, string> = {}
      data.forEach((row: any) => {
        configMap[row.key] = row.value
      })

      const config: ElectionConfig = {
        enabled: configMap['enabled'] !== 'false',
        startDate: configMap['start_date'] || DEFAULT_CONFIG.startDate,
        endDate: configMap['end_date'] || DEFAULT_CONFIG.endDate
      }
      
      // Update localStorage to sync local state
      localStorage.setItem('cetso_election_enabled', config.enabled ? 'true' : 'false')
      localStorage.setItem('cetso_election_start_date', config.startDate)
      localStorage.setItem('cetso_election_end_date', config.endDate)
      
      cachedConfig = config
      return config
    }
  } catch (err: any) {
    // Table might not exist yet, fallback to localStorage
    console.warn('election_config table not found or not accessible. Falling back to localStorage.', err.message)
  }

  // Fallback to localStorage
  const enabled = localStorage.getItem('cetso_election_enabled') !== 'false'
  const startDate = localStorage.getItem('cetso_election_start_date') || DEFAULT_CONFIG.startDate
  const endDate = localStorage.getItem('cetso_election_end_date') || DEFAULT_CONFIG.endDate

  const config = { enabled, startDate, endDate }
  cachedConfig = config
  return config
}

export async function updateElectionConfig(config: Partial<ElectionConfig>): Promise<void> {
  const current = cachedConfig || {
    enabled: localStorage.getItem('cetso_election_enabled') !== 'false',
    startDate: localStorage.getItem('cetso_election_start_date') || DEFAULT_CONFIG.startDate,
    endDate: localStorage.getItem('cetso_election_end_date') || DEFAULT_CONFIG.endDate
  }

  const next = { ...current, ...config }
  
  // 1. Update localStorage first (instant local response)
  localStorage.setItem('cetso_election_enabled', next.enabled ? 'true' : 'false')
  localStorage.setItem('cetso_election_start_date', next.startDate)
  localStorage.setItem('cetso_election_end_date', next.endDate)
  window.dispatchEvent(new Event('storage'))

  cachedConfig = next

  // 2. Try to write to Supabase
  try {
    const rows = [
      { key: 'enabled', value: next.enabled ? 'true' : 'false' },
      { key: 'start_date', value: next.startDate },
      { key: 'end_date', value: next.endDate }
    ]

    for (const row of rows) {
      await supabase
        .from('election_config')
        .upsert(row, { onConflict: 'key' })
    }
  } catch (err: any) {
    console.error('Failed to update election_config table in Supabase:', err.message)
  }
}

// Set up a real-time subscription for live sync!
export function subscribeToElectionConfig(onUpdate: (config: ElectionConfig) => void) {
  // Initial fetch
  fetchElectionConfig().then(onUpdate)

  // Real-time channel subscription
  const channel = supabase
    .channel('public:election_config')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'election_config' },
      () => {
        fetchElectionConfig().then(onUpdate)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
