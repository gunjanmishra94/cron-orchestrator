export interface Env {
  CRON_STATE: KVNamespace
  ADMIN_TOKEN: string
  GITHUB_DISPATCH_TOKEN: string
}

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

export function authorized(request: Request, env: Env): boolean {
  const header = request.headers.get('Authorization') ?? ''
  return header === `Bearer ${env.ADMIN_TOKEN}`
}

export async function readJobs(env: Env): Promise<Job[]> {
  const raw = await env.CRON_STATE.get('jobs')
  return raw ? (JSON.parse(raw) as Job[]) : []
}

export function writeJobs(env: Env, jobs: Job[]): Promise<void> {
  return env.CRON_STATE.put('jobs', JSON.stringify(jobs))
}
