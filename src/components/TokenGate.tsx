import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { setToken } from '@/lib/api'

export function TokenGate({ onSubmit }: { onSubmit: () => void }) {
  const [value, setValue] = useState('')

  function submit() {
    if (!value.trim()) return
    setToken(value.trim())
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
