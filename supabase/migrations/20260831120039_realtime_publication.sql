-- Broadcast changes on the schedule-critical tables so open browsers update
-- without a refresh. Row-level security still applies to what each client sees.
alter publication supabase_realtime add table shifts;
alter publication supabase_realtime add table assignments;
alter publication supabase_realtime add table swap_requests;
alter publication supabase_realtime add table notifications;
