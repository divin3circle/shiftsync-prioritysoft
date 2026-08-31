// Sends an email when a notification row is inserted, if the recipient has
// email delivery turned on. Wired as a Supabase Database Webhook on
// `notifications` (insert). It no-ops gracefully until RESEND_API_KEY is set,
// so it is safe to deploy before an email provider is configured.
import { createClient } from "jsr:@supabase/supabase-js@2"

type NotificationRecord = {
  user_id: string
  title: string
  body: string | null
}

Deno.serve(async (req) => {
  const payload = await req.json().catch(() => null)
  const record: NotificationRecord | undefined = payload?.record
  if (!record) {
    return Response.json({ error: "no record" }, { status: 400 })
  }

  const resendKey = Deno.env.get("RESEND_API_KEY")
  const from = Deno.env.get("NOTIFY_FROM") ?? "ShiftSync <notifications@coastaleats.example>"

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  )

  const [{ data: prefs }, { data: user }] = await Promise.all([
    supabase.from("notification_prefs").select("email_enabled").eq("profile_id", record.user_id).single(),
    supabase.auth.admin.getUserById(record.user_id),
  ])

  const email = user?.user?.email
  if (!prefs?.email_enabled || !email) {
    return Response.json({ skipped: true, reason: "email delivery off or no address" })
  }
  if (!resendKey) {
    return Response.json({ skipped: true, reason: "RESEND_API_KEY not set" })
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: email,
      subject: record.title,
      text: record.body ?? record.title,
    }),
  })

  return Response.json({ sent: res.ok }, { status: res.ok ? 200 : 502 })
})
