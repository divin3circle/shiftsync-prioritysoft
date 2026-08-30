-- Read the caller's role without tripping over RLS on profiles.
create or replace function auth_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid()
$$;

alter table profiles enable row level security;
alter table locations enable row level security;
alter table skills enable row level security;
alter table staff_skills enable row level security;
alter table staff_locations enable row level security;
alter table manager_locations enable row level security;
alter table availability_recurring enable row level security;
alter table availability_exceptions enable row level security;
alter table shifts enable row level security;
alter table assignments enable row level security;
alter table swap_requests enable row level security;
alter table overtime_overrides enable row level security;
alter table notifications enable row level security;
alter table notification_prefs enable row level security;
alter table audit_log enable row level security;

-- Profiles
create policy profiles_select on profiles for select to authenticated using (true);
create policy profiles_update_self on profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin_write on profiles for all to authenticated
  using (auth_role() = 'admin') with check (auth_role() = 'admin');

-- Reference data
create policy locations_select on locations for select to authenticated using (true);
create policy locations_ops on locations for all to authenticated
  using (auth_role() in ('admin', 'manager')) with check (auth_role() in ('admin', 'manager'));
create policy skills_select on skills for select to authenticated using (true);
create policy skills_ops on skills for all to authenticated
  using (auth_role() in ('admin', 'manager')) with check (auth_role() in ('admin', 'manager'));

-- Skill and certification links
create policy staff_skills_select on staff_skills for select to authenticated using (true);
create policy staff_skills_ops on staff_skills for all to authenticated
  using (auth_role() in ('admin', 'manager')) with check (auth_role() in ('admin', 'manager'));
create policy staff_locations_select on staff_locations for select to authenticated using (true);
create policy staff_locations_ops on staff_locations for all to authenticated
  using (auth_role() in ('admin', 'manager')) with check (auth_role() in ('admin', 'manager'));
create policy manager_locations_select on manager_locations for select to authenticated using (true);
create policy manager_locations_ops on manager_locations for all to authenticated
  using (auth_role() = 'admin') with check (auth_role() = 'admin');

-- Availability: staff manage their own, managers can read and adjust
create policy availability_recurring_select on availability_recurring for select to authenticated using (true);
create policy availability_recurring_self on availability_recurring for all to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy availability_recurring_ops on availability_recurring for all to authenticated
  using (auth_role() in ('admin', 'manager')) with check (auth_role() in ('admin', 'manager'));
create policy availability_exceptions_select on availability_exceptions for select to authenticated using (true);
create policy availability_exceptions_self on availability_exceptions for all to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy availability_exceptions_ops on availability_exceptions for all to authenticated
  using (auth_role() in ('admin', 'manager')) with check (auth_role() in ('admin', 'manager'));

-- Shifts: staff only see published ones, managers see everything
create policy shifts_select on shifts for select to authenticated
  using (published or auth_role() in ('admin', 'manager'));
create policy shifts_ops on shifts for all to authenticated
  using (auth_role() in ('admin', 'manager')) with check (auth_role() in ('admin', 'manager'));

-- Assignments
create policy assignments_select on assignments for select to authenticated using (true);
create policy assignments_ops on assignments for all to authenticated
  using (auth_role() in ('admin', 'manager')) with check (auth_role() in ('admin', 'manager'));

-- Swap requests: parties involved plus managers
create policy swap_requests_select on swap_requests for select to authenticated
  using (requester_id = auth.uid() or target_id = auth.uid() or auth_role() in ('admin', 'manager'));
create policy swap_requests_insert on swap_requests for insert to authenticated
  with check (requester_id = auth.uid() or auth_role() in ('admin', 'manager'));
create policy swap_requests_update on swap_requests for update to authenticated
  using (requester_id = auth.uid() or target_id = auth.uid() or auth_role() in ('admin', 'manager'));

-- Overtime overrides
create policy overtime_overrides_select on overtime_overrides for select to authenticated
  using (auth_role() in ('admin', 'manager'));
create policy overtime_overrides_ops on overtime_overrides for all to authenticated
  using (auth_role() in ('admin', 'manager')) with check (auth_role() in ('admin', 'manager'));

-- Notifications and preferences: users own their rows
create policy notifications_own on notifications for select to authenticated using (user_id = auth.uid());
create policy notifications_update_own on notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notification_prefs_own on notification_prefs for all to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- Audit log is read-only to managers; rows are written by the audit trigger
create policy audit_log_select on audit_log for select to authenticated
  using (auth_role() in ('admin', 'manager'));
