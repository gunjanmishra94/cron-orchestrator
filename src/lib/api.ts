import type { Job } from './types'

const TOKEN_KEY = 'cron-orchestrator:admin-token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized')
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  let res: Response
  try {
    res = await fetch(path, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${token}`,
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    // A token saved before sanitizeToken() existed (TokenGate.tsx) can
    // still be sitting in localStorage with an invalid header character in
    // it — that's unusable the same way a wrong token is, so clear it and
    // send the user back to re-enter it instead of failing forever.
    if (message.includes('ISO-8859-1')) {
      clearToken()
      throw new UnauthorizedError()
    }
    throw new Error(`Network error calling ${path}: ${message}`)
  }

  if (res.status === 401) {
    clearToken()
    throw new UnauthorizedError()
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} from ${path}: ${await res.text()}`)
  }
  return res.json() as Promise<T>
}

export function fetchJobs(): Promise<Job[]> {
  return request<Job[]>('/api/jobs')
}

export function updateJob(id: string, patch: Partial<Pick<Job, 'enabled' | 'intervalMinutes'>>): Promise<Job> {
  return request<Job>(`/api/jobs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}

export function runJobNow(id: string): Promise<Job> {
  return request<Job>(`/api/jobs/${id}/run`, { method: 'POST' })
}
