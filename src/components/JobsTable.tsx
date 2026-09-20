import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { runJobNow, updateJob, UnauthorizedError } from '@/lib/api'
import { relativeTime } from '@/lib/relative-time'
import { INTERVAL_PRESETS, type Job } from '@/lib/types'

export function JobsTable({ jobs, onChange, onUnauthorized }: {
  jobs: Job[]
  onChange: (job: Job) => void
  onUnauthorized: () => void
}) {
  const [pending, setPending] = useState<Set<string>>(new Set())

  function withPending<T>(id: string, fn: () => Promise<T>) {
    setPending((prev) => new Set(prev).add(id))
    return fn().finally(() => {
      setPending((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    })
  }

  async function toggle(job: Job, enabled: boolean) {
    try {
      const updated = await withPending(job.id, () => updateJob(job.id, { enabled }))
      onChange(updated)
      toast.success(`${job.name} ${enabled ? 'enabled' : 'disabled'}`)
    } catch (err) {
      if (err instanceof UnauthorizedError) return onUnauthorized()
      toast.error(`Failed to update ${job.name}`)
    }
  }

  async function changeInterval(job: Job, intervalMinutes: number) {
    try {
      const updated = await withPending(job.id, () => updateJob(job.id, { intervalMinutes }))
      onChange(updated)
      toast.success(`${job.name} interval updated`)
    } catch (err) {
      if (err instanceof UnauthorizedError) return onUnauthorized()
      toast.error(`Failed to update ${job.name}`)
    }
  }

  async function runNow(job: Job) {
    try {
      const updated = await withPending(job.id, () => runJobNow(job.id))
      onChange(updated)
      toast.success(`${job.name} triggered`)
    } catch (err) {
      if (err instanceof UnauthorizedError) return onUnauthorized()
      toast.error(`Failed to trigger ${job.name}`)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {jobs.map((job, i) => {
        const isPending = pending.has(job.id)
        return (
          <div key={job.id} className="flex flex-col gap-3">
            {i > 0 && <Separator />}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-medium break-words">{job.name}</div>
                <div className="text-muted-foreground text-sm break-words">{job.description}</div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Switch
                  checked={job.enabled}
                  disabled={isPending}
                  onCheckedChange={(checked) => toggle(job, checked)}
                />
                <Badge variant={job.enabled ? 'default' : 'secondary'}>
                  {job.enabled ? 'Active' : 'Paused'}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={String(job.intervalMinutes)}
                disabled={isPending}
                onValueChange={(value) => changeInterval(job, Number(value))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERVAL_PRESETS.map((preset) => (
                    <SelectItem key={preset.minutes} value={String(preset.minutes)}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-muted-foreground text-sm">Last run: {relativeTime(job.lastTriggeredAt)}</span>

              <Button
                size="sm"
                variant="outline"
                className="ml-auto"
                disabled={isPending}
                onClick={() => runNow(job)}
              >
                Run now
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
