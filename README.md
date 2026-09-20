# Cron Orchestrator

A small control panel for the Cloudflare Workers that stand in for GitHub
Actions' unreliable `schedule:` trigger (see `transit-mesh/cron-trigger`).
Toggle a job on/off or change how often it fires, without redeploying
anything.

**Stack:** Vite + React + TypeScript · Tailwind CSS v4 · shadcn/ui (Nova) · Cloudflare Pages + Pages Functions + KV

## How it fits together

```
cron-trigger Worker (transit-mesh)          cron-orchestrator (this repo)
  fires every 5 min, the finest        <->    reads/writes the same
  Cloudflare Cron Trigger allows              KV namespace (CRON_STATE)
  reads CRON_STATE, dispatches               React UI + Pages Functions API
  any job whose interval is due
```

Job frequency isn't a Cloudflare Cron Trigger per job — that would mean a
`wrangler deploy` every time you wanted a different interval. Instead
`cron-trigger` ticks every 5 minutes (the base heartbeat) and checks, per
job, whether enough time has passed since it last fired. Changing a job's
`intervalMinutes` or `enabled` flag here in KV takes effect on the very
next tick.

## Running locally

```bash
npm install
npm run dev        # frontend only, calling the deployed /api/* — see below
```

The frontend talks to `/api/jobs` etc., which only exist as Cloudflare
Pages Functions. For a fully local loop (functions + KV emulated):

```bash
npm run build
npx wrangler pages dev dist --kv CRON_STATE
```

## Deploying

One-time setup:

```bash
npx wrangler pages secret put ADMIN_TOKEN --project-name cron-orchestrator
npx wrangler pages secret put GITHUB_DISPATCH_TOKEN --project-name cron-orchestrator
```

`GITHUB_DISPATCH_TOKEN` should be the same classic PAT (`public_repo`
scope) used by `cron-trigger` — see `transit-mesh/cron-trigger/README.md`
for why it has to be classic, not fine-grained. `ADMIN_TOKEN` is whatever
password you want to gate this app's UI/API with — the frontend prompts
for it once and stores it in `localStorage`.

```bash
npm run build
npx wrangler pages deploy dist --project-name cron-orchestrator
```

For auto-deploy on push (like `portfolio`), connect this repo to the
`cron-orchestrator` Pages project on the Cloudflare dashboard — Pages →
`cron-orchestrator` → Settings → Builds → connect to Git, build command
`npm run build`, output directory `dist`.

## Adding a new job

Jobs live entirely in KV, not in code here. Add an entry to the `jobs`
array (`wrangler kv key get/put --namespace-id <id> jobs`) with the shape:

```json
{
  "id": "unique-id",
  "name": "Human name",
  "description": "What it does",
  "repo": "owner/repo",
  "eventType": "the-repository_dispatch-type-that-repo's-workflow-listens-for",
  "enabled": true,
  "intervalMinutes": 5,
  "lastTriggeredAt": null
}
```

The target repo's workflow needs `on: repository_dispatch: types: [<eventType>]`
already wired up — this app only controls *when* to fire it, not the
workflow itself.
