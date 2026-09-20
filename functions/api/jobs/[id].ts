import { authorized, readJobs, writeJobs, type Env, type Job } from '../../types'

export const onRequestPatch: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!authorized(request, env)) return new Response('Unauthorized', { status: 401 })

  const id = params.id as string
  const patch = await request.json<Partial<Pick<Job, 'enabled' | 'intervalMinutes'>>>()

  const jobs = await readJobs(env)
  const job = jobs.find((j) => j.id === id)
  if (!job) return new Response('Not found', { status: 404 })

  if (typeof patch.enabled === 'boolean') {
    job.enabled = patch.enabled
  }
  if (typeof patch.intervalMinutes === 'number') {
    if (!Number.isInteger(patch.intervalMinutes) || patch.intervalMinutes < 1) {
      return new Response('intervalMinutes must be a positive integer', { status: 400 })
    }
    job.intervalMinutes = patch.intervalMinutes
  }

  await writeJobs(env, jobs)
  return Response.json(job)
}
