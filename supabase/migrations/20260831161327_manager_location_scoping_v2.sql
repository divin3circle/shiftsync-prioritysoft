-- Scope managers to the locations they actually run. Admins stay unrestricted.
-- Reads remain broad (a manager can view any schedule); only writes are gated.

drop policy shifts_ops on shifts;
create policy shifts_ops on shifts for all to authenticated
  using (
    auth_role() = 'admin'
    or (auth_role() = 'manager' and exists (
      select 1 from manager_locations ml
      where ml.profile_id = auth.uid() and ml.location_id = shifts.location_id
    ))
  )
  with check (
    auth_role() = 'admin'
    or (auth_role() = 'manager' and exists (
      select 1 from manager_locations ml
      where ml.profile_id = auth.uid() and ml.location_id = shifts.location_id
    ))
  );

drop policy assignments_ops on assignments;
create policy assignments_ops on assignments for all to authenticated
  using (
    auth_role() = 'admin'
    or (auth_role() = 'manager' and exists (
      select 1 from shifts s
      join manager_locations ml on ml.location_id = s.location_id
      where s.id = assignments.shift_id and ml.profile_id = auth.uid()
    ))
  )
  with check (
    auth_role() = 'admin'
    or (auth_role() = 'manager' and exists (
      select 1 from shifts s
      join manager_locations ml on ml.location_id = s.location_id
      where s.id = assignments.shift_id and ml.profile_id = auth.uid()
    ))
  );

-- Enforce the same scope inside assign_staff, which runs with elevated rights.
create or replace function assign_staff(p_shift_id uuid, p_staff_id uuid, p_actor uuid)
returns assignments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_shift shifts;
  v_assignment assignments;
  v_role user_role;
  v_filled integer;
begin
  perform pg_advisory_xact_lock(hashtext(p_staff_id::text));

  select * into v_shift from shifts where id = p_shift_id;
  if not found then
    raise exception 'Shift not found' using errcode = 'no_data_found';
  end if;

  select role into v_role from profiles where id = auth.uid();

  if v_role = 'admin' then
    null; -- admins can assign anyone, anywhere
  elsif v_role = 'manager' then
    if not exists (
      select 1 from manager_locations
      where profile_id = auth.uid() and location_id = v_shift.location_id
    ) then
      raise exception 'You do not manage this location.' using errcode = '42501';
    end if;
  else
    if p_staff_id is distinct from auth.uid() then
      raise exception 'You can only pick up shifts for yourself.' using errcode = '42501';
    end if;
    if not v_shift.published then
      raise exception 'This shift is not open for pickup.' using errcode = '42501';
    end if;
    select count(*) into v_filled from assignments where shift_id = p_shift_id and status = 'active';
    if v_filled >= v_shift.headcount then
      raise exception 'This shift is already fully staffed.' using errcode = '42501';
    end if;
    if not exists (
      select 1 from staff_locations
      where profile_id = p_staff_id and location_id = v_shift.location_id and certified
    ) then
      raise exception 'You are not certified to work at this location.' using errcode = '42501';
    end if;
    if v_shift.required_skill_id is not null and not exists (
      select 1 from staff_skills
      where profile_id = p_staff_id and skill_id = v_shift.required_skill_id
    ) then
      raise exception 'You are not trained for this role.' using errcode = '42501';
    end if;
  end if;

  insert into assignments (shift_id, staff_id, starts_at, ends_at, created_by)
  values (p_shift_id, p_staff_id, v_shift.starts_at, v_shift.ends_at, p_actor)
  returning * into v_assignment;

  return v_assignment;
exception
  when exclusion_violation then
    raise exception 'This staff member is already booked for an overlapping shift.'
      using errcode = 'exclusion_violation';
  when unique_violation then
    raise exception 'This staff member is already assigned to this shift.'
      using errcode = 'unique_violation';
end;
$$;
