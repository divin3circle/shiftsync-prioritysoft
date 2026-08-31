"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Store01Icon } from "@hugeicons/core-free-icons"

import { createClient } from "@/lib/supabase/client"
import { demoUsers } from "@/lib/mock/users"
import { ROLES, ROLE_LABELS, type Role } from "@/lib/roles"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const demoPassword = "coastaleats"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = React.useState("manager@coastaleats.com")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  async function signIn(withEmail: string, withPassword: string) {
    setPending(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: withEmail,
      password: withPassword,
    })

    if (error) {
      setError(error.message)
      setPending(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    signIn(email, password)
  }

  function signInAs(role: Role) {
    setEmail(demoUsers[role].email)
    setPassword(demoPassword)
    signIn(demoUsers[role].email, demoPassword)
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center text-center">
        <div className="bg-foreground text-background mx-auto flex size-10 items-center justify-center rounded-xl">
          <HugeiconsIcon icon={Store01Icon} className="size-5" />
        </div>
        <CardTitle className="mt-3 text-lg">Welcome to ShiftSync</CardTitle>
        <CardDescription>Sign in to manage shifts at Coastal Eats.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          <Button type="submit" className="mt-1 w-full" disabled={pending}>
            {pending ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="bg-border h-px flex-1" />
            <span className="text-muted-foreground text-xs">Demo accounts</span>
            <span className="bg-border h-px flex-1" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map((role) => (
              <Button
                key={role}
                type="button"
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() => signInAs(role)}
              >
                {ROLE_LABELS[role]}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
