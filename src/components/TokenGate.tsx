import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { setToken } from '@/lib/api'

// HTTP header values must be ISO-8859-1; a stray smart quote or invisible
// Unicode character from a paste (clipboard managers, autocorrect) would
// otherwise crash every fetch() call with an opaque "non ISO-8859-1 code
// point" TypeError instead of just... not matching the real token.
function sanitizeToken(raw: string): string {
  // eslint-disable-next-line no-control-regex
  return raw.trim().replace(/[^\x20-\x7E]/g, '')
}

export function TokenGate({ onSubmit }: { onSubmit: () => void }) {
  const [value, setValue] = useState('')

  function submit() {
    const token = sanitizeToken(value)
    if (!token) return
    setToken(token)
    onSubmit()
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Cron Orchestrator</CardTitle>
          <CardDescription>Enter the admin token to manage scheduled jobs.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="token">Admin token</Label>
            <Input
              id="token"
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              autoFocus
            />
          </div>
          <CardAction className="w-full">
            <Button className="w-full" onClick={submit} disabled={!value.trim()}>
              Continue
            </Button>
          </CardAction>
        </CardContent>
      </Card>
    </div>
  )
}
