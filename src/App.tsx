import { useCallback, useEffect, useState } from 'react'
import { Toaster } from 'sonner'
import { JobsTable } from '@/components/JobsTable'
import { TokenGate } from '@/components/TokenGate'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { clearToken, fetchJobs, getToken, UnauthorizedError } from '@/lib/api'
import type { Job } from '@/lib/types'

const POLL_INTERVAL_MS = 30_000

function App() {
  const [authed, setAuthed] = useState(() => getToken() !== null)
  const [jobs, setJobs] = useState<Job[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUnauthorized = useCallback(() => {
    clearToken()
    setAuthed(false)
    setJobs(null)
  }, [])

  const load = useCallback(async () => {
    try {
      const data = await fetchJobs()
      setJobs(data)
      setError(null)
    } catch (err) {
      if (err instanceof UnauthorizedError) return handleUnauthorized()
      setError(err instanceof Error ? err.message : 'Failed to load jobs')
    }
  }, [handleUnauthorized])

  useEffect(() => {
    if (!authed) return
    load()
    const id = setInterval(load, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [authed, load])

  if (!authed) {
    return <TokenGate onSubmit={() => setAuthed(true)} />
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <Toaster richColors position="top-right" />
      <Card>
        <CardHeader>
          <CardTitle>Cron Orchestrator</CardTitle>
          <CardDescription>
            Toggle and reschedule the Cloudflare-triggered GitHub Actions jobs across your projects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-destructive mb-4 text-sm">{error}</p>}
          {jobs === null ? (
            error ? null : <p className="text-muted-foreground text-sm">Loading…</p>
          ) : jobs.length === 0 ? (
            <p className="text-muted-foreground text-sm">No jobs configured.</p>
          ) : (
            <JobsTable
              jobs={jobs}
              onChange={(updated) =>
                setJobs((prev) => prev?.map((j) => (j.id === updated.id ? updated : j)) ?? null)
              }
              onUnauthorized={handleUnauthorized}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default App
