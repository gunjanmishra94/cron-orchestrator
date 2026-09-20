import { authorized, readJobs, writeJobs, type Env } from '../../../types'

export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!authorized(request, env)) return new Response('Unauthorized', { status: 401 })

  const id = params.id as string
  const jobs = await readJobs(env)
  const job = jobs.find((j) => j.id === id)
  if (!job) return new Response('Not found', { status: 404 })

  const dispatchRes = await fetch(`https://api.github.com/repos/${job.repo}/dispatches`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GITHUB_DISPATCH_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'cron-orchestrator',
    },
    body: JSON.stringify({ event_type: job.eventType }),
  })

  if (!dispatchRes.ok) {
    const body = await dispatchRes.text()
    return new Response(`GitHub dispatch failed: ${dispatchRes.status} ${body}`, { status: 502 })
  }

  job.lastTriggeredAt = new Date().toISOString()
  await writeJobs(env, jobs)
  return Response.json(job)
}
