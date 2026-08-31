# ShiftSync

Staff scheduling for Coastal Eats, a restaurant group with four locations across two US time zones. Managers build weekly schedules, the app checks each assignment against real labor rules, and staff see their shifts and pick up open ones. Changes show up live across open browsers.

- Live app: https://shiftsync-prioritysoft.vercel.app
- Source: https://github.com/divin3circle/shiftsync-prioritysoft

## Sign in

Every demo account uses the password `coastaleats`.

| Role | Email | What they can do |
| --- | --- | --- |
| Admin | admin@coastaleats.com | Everything, across all locations |
| Manager | manager@coastaleats.com | Build schedules, assign staff, publish weeks, review requests |
| Staff | staff@coastaleats.com | See their shifts, pick up open shifts, request drops and swaps |

The staff login is Sofia Alvarez. Every other staff member can sign in too, using their first name, for example `noah@coastaleats.com` or `priya@coastaleats.com`, all with the same password. Use the buttons on the login screen to jump straight into a role.

## How the scheduling rules work

When a manager assigns someone, the app checks the assignment against these rules and shows the result before anything is saved.

Hard stops. These block the assignment and cannot be overridden:

- No double-booking. A person cannot hold two overlapping shifts, even at different locations. This is enforced by the database itself, so it holds even if two managers assign at the exact same moment.
- Required skill. The person must be trained for the role the shift needs.
- Location certification. The person must be certified to work at that location.

Soft rules. These warn the manager, who can assign anyway with the reason recorded:

- Minimum rest. At least 10 hours between shifts.
- Stated availability. The shift should fall inside the hours the person said they can work. Someone with no stated availability is treated as available.
- Overtime. A warning starts at 35 hours in a week and the limit is 40. Going over records an overtime approval.
- Long streaks. A sixth straight day warns. A seventh needs a documented override.

Staff can pick up open shifts themselves. The same hard rules apply, and they are enforced in the database, so a staff member cannot claim a shift they are not trained or certified for even by calling the API directly.

## Under the hood

- Next.js App Router and TypeScript, with server components reading data and server actions writing it.
- Supabase for Postgres, Auth, and Realtime. Row level security scopes what each role can read and write.
- The rules engine is a set of pure functions in `lib/scheduling`, covered by unit tests. It runs the same way whether a manager assigns or a staff member picks up.
- Double-booking is prevented by a Postgres exclusion constraint. Concurrent assignments to the same person are serialized with an advisory lock, so the check and the write cannot race.
- Every change to shifts, assignments, and requests is written to an audit log by a database trigger.
- Times are stored with their time zone. Each location has its own zone, and availability is stored in each person's home zone, so a shift that crosses a daylight saving change counts the real hours worked.

Where things live:

- `lib/scheduling` rules engine and its tests
- `lib/data` queries and the assignment flow that bridges the database to the engine
- `supabase/migrations` schema, constraints, functions, triggers, row level security, realtime
- `supabase/seed.sql` demo data
- `app/(app)` the signed-in screens, `components` the UI

## Assumptions and decisions

- No stated availability means available. Most people did not fill in fixed hours, so the app does not treat a blank as "never available."
- Overtime is a warning, not a wall. Managers can approve it, which fits how real restaurants handle a short-staffed rush. The approval is recorded.
- The seed data is built for the current week, so the schedule board and dashboard show real shifts during review. Use the week arrows to move around.
- One shared password across the demo accounts keeps sign-in simple for review.
- Manager write access is by role. The data model can also scope managers to specific locations, which is a natural next step but not turned on.

## Known limitations

- The schedule board, dashboard, my shifts, and open shifts run on live data. Some secondary manager screens (overtime, fairness, on duty, audit, roster, notifications) still show representative sample data.
- The "New shift" dialog on the schedule board is a visual placeholder and does not create a shift yet.
- Staff can request a drop or a swap, and it reaches managers, but the manager approval screen is not fully wired.
- Email delivery is modeled as a preference only. No emails are actually sent.

## Running it locally

You need [Bun](https://bun.sh) and the [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
bun install

# point at a Supabase project
echo "NEXT_PUBLIC_SUPABASE_URL=your-project-url" >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key" >> .env.local

# apply the schema and load demo data
supabase link --project-ref your-project-ref
supabase db push
supabase db query --linked -f supabase/seed.sql

bun run dev      # http://localhost:3000
bun test         # run the rules engine tests
```
