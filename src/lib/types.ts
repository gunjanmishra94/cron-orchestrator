export interface Job {
  id: string
  name: string
  description: string
  repo: string
  eventType: string
  enabled: boolean
  intervalMinutes: number
  lastTriggeredAt: string | null
}

export const INTERVAL_PRESETS: { label: string; minutes: number }[] = [
  { label: 'Every 1 min', minutes: 1 },
  { label: 'Every 5 min', minutes: 5 },
  { label: 'Every 10 min', minutes: 10 },
  { label: 'Every 15 min', minutes: 15 },
  { label: 'Every 30 min', minutes: 30 },
  { label: 'Every hour', minutes: 60 },
  { label: 'Every 6 hours', minutes: 360 },
  { label: 'Every 12 hours', minutes: 720 },
  { label: 'Daily', minutes: 1440 },
]
