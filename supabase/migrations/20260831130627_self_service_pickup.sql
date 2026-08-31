-- Let staff claim open shifts themselves without opening up the assignments
-- table to everyone. The function runs with elevated rights, so it re-checks
-- the rules that matter for self-service: managers may assign anyone, but a
-- staff member can only take an open, published shift they are certified and
-- trained for. Overlap is still caught by the exclusion constraint below it.
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

  if v_role is distinct from 'admin' and v_role is distinct from 'manager' then
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
