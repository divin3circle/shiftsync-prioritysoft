-- Approve a swap or drop request atomically. A drop frees the shift by
-- cancelling the requester's assignment. A swap cancels the requester's
-- assignment and hands the shift to the target, which re-runs every
-- constraint check via assign_staff. Because it all happens in one
-- transaction, a target who cannot take the shift rolls the whole thing back
-- and the requester keeps their shift.
create or replace function approve_request(p_request_id uuid, p_actor uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req swap_requests;
  v_role user_role;
begin
  select role into v_role from profiles where id = p_actor;
  if v_role is null or v_role not in ('admin', 'manager') then
    raise exception 'Only managers can approve requests.' using errcode = '42501';
  end if;

  select * into v_req from swap_requests where id = p_request_id;
  if not found then
    raise exception 'Request not found' using errcode = 'no_data_found';
  end if;

  if v_req.type = 'drop' then
    update assignments set status = 'cancelled' where id = v_req.assignment_id;
  elsif v_req.type = 'swap' then
    if v_req.target_id is null then
      raise exception 'This swap has no one to hand the shift to.';
    end if;
    update assignments set status = 'cancelled' where id = v_req.assignment_id;
    perform assign_staff(v_req.shift_id, v_req.target_id, p_actor);
  end if;

  update swap_requests set status = 'approved' where id = p_request_id;
end;
$$;
