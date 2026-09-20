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
    if (patch.intervalMinutes < 5 || patch.intervalMinutes % 5 !== 0) {
      return new Response('intervalMinutes must be a multiple of 5', { status: 400 })
    }
    job.intervalMinutes = patch.intervalMinutes
  }

  await writeJobs(env, jobs)
  return Response.json(job)
}
