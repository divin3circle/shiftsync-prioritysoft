-- No two active assignments for the same person may overlap in time,
-- across any location. Enforced by the database, so it holds under
-- concurrent writes regardless of application logic.
alter table assignments
  add constraint assignments_no_overlap
  exclude using gist (
    staff_id with =,
    tstzrange (starts_at, ends_at) with &&
  )
  where (status = 'active');

-- Assign a staff member to a shift. Serializes concurrent attempts for the
-- same person with a transaction-level advisory lock, then relies on the
-- overlap exclusion constraint as the final guarantee.
create or replace function assign_staff(p_shift_id uuid, p_staff_id uuid, p_actor uuid)
returns assignments
language plpgsql
as $$
declare
  v_shift shifts;
  v_assignment assignments;
begin
  perform pg_advisory_xact_lock(hashtext(p_staff_id::text));

  select * into v_shift from shifts where id = p_shift_id;
  if not found then
    raise exception 'Shift not found' using errcode = 'no_data_found';
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

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger shifts_set_updated_at
  before update on shifts
  for each row execute function set_updated_at();

create trigger swap_requests_set_updated_at
  before update on swap_requests
  for each row execute function set_updated_at();

-- Record every change to schedule-critical tables with before/after state.
create or replace function log_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid;
begin
  begin
    v_actor := coalesce(nullif(current_setting('app.actor_id', true), '')::uuid, auth.uid());
  exception when others then
    v_actor := null;
  end;

  insert into audit_log (entity, entity_id, action, actor_id, before, after)
  values (
    tg_table_name,
    case when tg_op = 'DELETE' then old.id else new.id end,
    tg_op,
    v_actor,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger audit_shifts
  after insert or update or delete on shifts
  for each row execute function log_audit();

create trigger audit_assignments
  after insert or update or delete on assignments
  for each row execute function log_audit();

create trigger audit_swap_requests
  after insert or update or delete on swap_requests
  for each row execute function log_audit();
