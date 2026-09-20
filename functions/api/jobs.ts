import { authorized, readJobs, type Env } from '../types'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!authorized(request, env)) return new Response('Unauthorized', { status: 401 })

  const jobs = await readJobs(env)
  return Response.json(jobs)
}
