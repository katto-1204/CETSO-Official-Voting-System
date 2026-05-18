import { supabase } from './supabase'

export interface ElectionConfig {
  enabled: boolean
  startDate: string
  endDate: string
}

// Official CETSO Elections 2026 schedule
// May 19, 2026 8:00 AM PHT → May 20, 2026 8:00 AM PHT
// PHT = UTC+8, so 8:00 AM PHT = 00:00 UTC
const DEFAULT_CONFIG: ElectionConfig = {
  enabled: true,
  startDate: '2026-05-19T08:00',   // datetime-local format (browser interprets as local PHT)
  endDate:   '2026-05-20T08:00'
}

let cachedConfig: ElectionConfig | null = null

function normalizeConfigRows(data: Array<{ key: string; value: string }>): ElectionConfig {
  const configMap: Record<string, string> = {}
  data.forEach((row) => {
    configMap[row.key] = row.value
  })

  const missingKeys = ['enabled', 'start_date', 'end_date'].filter((key) => !(key in configMap))
  if (missingKeys.length > 0) {
    throw new Error(`Election config is incomplete. Missing: ${missingKeys.join(', ')}`)
  }

  return {
    enabled: configMap.enabled === 'true',
    startDate: configMap.start_date,
    endDate: configMap.end_date,
  }
}

function cacheConfig(config: ElectionConfig) {
  localStorage.setItem('cetso_election_enabled', config.enabled ? 'true' : 'false')
  localStorage.setItem('cetso_election_start_date', config.startDate)
  localStorage.setItem('cetso_election_end_date', config.endDate)
  cachedConfig = config
}

export async function fetchElectionConfig(): Promise<ElectionConfig> {
  const { data, error } = await supabase
    .from('election_config')
    .select('key, value')
    .in('key', ['enabled', 'start_date', 'end_date'])

  if (error) {
    throw new Error(`Could not fetch election status: ${error.message}`)
  }

  if (!data || data.length === 0) {
    throw new Error('Election status is not configured. Run supabase/add-election-config.sql in Supabase.')
  }

  const config = normalizeConfigRows(data)
  cacheConfig(config)
  return config
}

export async function updateElectionConfig(config: Partial<ElectionConfig>): Promise<void> {
  let current = cachedConfig
  if (!current) {
    try {
      current = await fetchElectionConfig()
    } catch {
      current = DEFAULT_CONFIG
    }
  }

  const next = { ...current, ...config }

  const rows = [
    { key: 'enabled', value: next.enabled ? 'true' : 'false' },
    { key: 'start_date', value: next.startDate },
    { key: 'end_date', value: next.endDate }
  ]

  for (const row of rows) {
    const { error } = await supabase
      .from('election_config')
      .upsert(row, { onConflict: 'key' })

    if (error) {
      throw new Error(`Could not update election status: ${error.message}`)
    }
  }

  cacheConfig(next)
  window.dispatchEvent(new CustomEvent('cetso-election-config-updated', { detail: next }))
}

export function subscribeToElectionConfig(
  onUpdate: (config: ElectionConfig) => void,
  onError?: (error: Error) => void
) {
  const refresh = () => {
    fetchElectionConfig()
      .then(onUpdate)
      .catch((error) => onError?.(error instanceof Error ? error : new Error(String(error))))
  }

  refresh()

  const handleLocalUpdate = () => refresh()
  window.addEventListener('cetso-election-config-updated', handleLocalUpdate)

  const channel = supabase
    .channel('public:election_config')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'election_config' },
      refresh
    )
    .subscribe()

  return () => {
    window.removeEventListener('cetso-election-config-updated', handleLocalUpdate)
    supabase.removeChannel(channel)
  }
}
