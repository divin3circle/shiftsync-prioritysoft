import { afterAll, describe, expect, test } from "bun:test"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// These hit a real Supabase project and are skipped unless credentials are in
// the environment. Run with:
//   NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
//   SUPABASE_SERVICE_ROLE_KEY=... bun test
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY
const service = process.env.SUPABASE_SERVICE_ROLE_KEY
const ready = Boolean(url && anon && service)

const ids = {
  harbor: "c0000000-0000-0000-0000-000000000001",
  lighthouse: "c0000000-0000-0000-0000-000000000003",
  liam: "b0000000-0000-0000-0000-000000000008",
  sofia: "b0000000-0000-0000-0000-000000000001",
  maria: "b0000000-0000-0000-0000-000000000003",
  lighthouseHost: "e0000000-0000-0000-0000-0000000000a3",
  harborLineCook: "e0000000-0000-0000-0000-0000000000c1",
}

const suite = ready ? describe : describe.skip

// Fallbacks keep createClient from throwing while the suite is being collected
// but skipped; the clients are only used when credentials are present.
const safeUrl = url ?? "https://placeholder.supabase.co"
const safeAnon = anon ?? "placeholder"
const safeService = service ?? "placeholder"

suite("database guarantees", () => {
  const svc = createClient(safeUrl, safeService)
  const createdShifts: string[] = []

  async function newShift(location: string, startsAt: string, endsAt: string) {
    const { data } = await svc
      .from("shifts")
      .insert({ location_id: location, starts_at: startsAt, ends_at: endsAt, headcount: 1, published: true })
      .select("id")
      .single()
    createdShifts.push(data!.id)
    return data!.id as string
  }

  async function signedIn(email: string): Promise<SupabaseClient> {
    const client = createClient(safeUrl, safeAnon)
    await client.auth.signInWithPassword({ email, password: "coastaleats" })
    return client
  }

  afterAll(async () => {
    for (const id of createdShifts) await svc.from("shifts").delete().eq("id", id)
  })

  test("the exclusion constraint rejects an overlapping assignment", async () => {
    const shift = await newShift(ids.harbor, "2026-12-01T09:00:00-08", "2026-12-01T17:00:00-08")
    await svc.from("assignments").insert({
      shift_id: shift,
      staff_id: ids.liam,
      starts_at: "2026-12-01T09:00:00-08",
      ends_at: "2026-12-01T17:00:00-08",
    })
    const overlap = await svc.from("assignments").insert({
      shift_id: shift,
      staff_id: ids.liam,
      starts_at: "2026-12-01T10:00:00-08",
      ends_at: "2026-12-01T12:00:00-08",
    })
    expect(overlap.error).not.toBeNull()
  })

  test("concurrent assignment to the same person lets exactly one win", async () => {
    const a = await newShift(ids.harbor, "2026-12-02T09:00:00-08", "2026-12-02T17:00:00-08")
    const b = await newShift(ids.harbor, "2026-12-02T12:00:00-08", "2026-12-02T20:00:00-08")
    const manager = await signedIn("manager@coastaleats.com")
    const actor = "a0000000-0000-0000-0000-000000000002"

    const results = await Promise.allSettled([
      manager.rpc("assign_staff", { p_shift_id: a, p_staff_id: ids.liam, p_actor: actor }),
      manager.rpc("assign_staff", { p_shift_id: b, p_staff_id: ids.liam, p_actor: actor }),
    ])
    const wins = results.filter((r) => r.status === "fulfilled" && !r.value.error).length
    expect(wins).toBe(1)
  })

  test("row level security hides profiles from anonymous clients", async () => {
    const anonClient = createClient(safeUrl, safeAnon)
    const { data } = await anonClient.from("profiles").select("id")
    expect(data ?? []).toHaveLength(0)
  })

  test("staff cannot read another person's notifications", async () => {
    const sofia = await signedIn("staff@coastaleats.com")
    const { data } = await sofia.from("notifications").select("id").eq("user_id", ids.maria)
    expect(data ?? []).toHaveLength(0)
  })

  test("self-service pickup is blocked for the wrong skill", async () => {
    const sofia = await signedIn("staff@coastaleats.com")
    const { error } = await sofia.rpc("assign_staff", {
      p_shift_id: ids.harborLineCook,
      p_staff_id: ids.sofia,
      p_actor: ids.sofia,
    })
    expect(error?.message).toContain("not trained")
  })

  test("a manager cannot assign at a location they do not run", async () => {
    const manager = await signedIn("manager@coastaleats.com")
    const { error } = await manager.rpc("assign_staff", {
      p_shift_id: ids.lighthouseHost,
      p_staff_id: "b0000000-0000-0000-0000-000000000005",
      p_actor: "a0000000-0000-0000-0000-000000000002",
    })
    expect(error?.message).toContain("do not manage")
  })
})
