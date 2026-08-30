create extension if not exists btree_gist;

create type user_role as enum ('admin', 'manager', 'staff');
create type assignment_status as enum ('active', 'cancelled');
create type swap_type as enum ('swap', 'drop');
create type swap_status as enum (
  'pending_target',
  'pending_manager',
  'open',
  'approved',
  'rejected',
  'cancelled',
  'expired'
);
create type exception_kind as enum ('available', 'unavailable');

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null default 'staff',
  full_name text not null,
  home_tz text not null default 'America/Los_Angeles',
  desired_hours integer not null default 0,
  created_at timestamptz not null default now()
);

create table locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  timezone text not null,
  created_at timestamptz not null default now()
);

create table skills (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table staff_skills (
  profile_id uuid not null references profiles (id) on delete cascade,
  skill_id uuid not null references skills (id) on delete cascade,
  primary key (profile_id, skill_id)
);

create table staff_locations (
  profile_id uuid not null references profiles (id) on delete cascade,
  location_id uuid not null references locations (id) on delete cascade,
  certified boolean not null default true,
  primary key (profile_id, location_id)
);

create table manager_locations (
  profile_id uuid not null references profiles (id) on delete cascade,
  location_id uuid not null references locations (id) on delete cascade,
  primary key (profile_id, location_id)
);

create table availability_recurring (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  weekday integer not null check (weekday between 1 and 7),
  start_time time not null,
  end_time time not null,
  timezone text not null
);

create table availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  exception_date date not null,
  kind exception_kind not null,
  start_time time,
  end_time time,
  note text
);

create table shifts (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  required_skill_id uuid references skills (id) on delete set null,
  headcount integer not null default 1 check (headcount >= 1),
  is_premium boolean not null default false,
  published boolean not null default false,
  edit_cutoff_hours integer not null default 48,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table assignments (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid not null references shifts (id) on delete cascade,
  staff_id uuid not null references profiles (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status assignment_status not null default 'active',
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (shift_id, staff_id)
);

create table swap_requests (
  id uuid primary key default gen_random_uuid(),
  type swap_type not null,
  requester_id uuid not null references profiles (id) on delete cascade,
  target_id uuid references profiles (id) on delete cascade,
  shift_id uuid not null references shifts (id) on delete cascade,
  assignment_id uuid references assignments (id) on delete cascade,
  status swap_status not null,
  reason text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table overtime_overrides (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments (id) on delete cascade,
  approved_by uuid references profiles (id) on delete set null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table notification_prefs (
  profile_id uuid primary key references profiles (id) on delete cascade,
  email_enabled boolean not null default false,
  categories jsonb not null default '{}'::jsonb
);

create table audit_log (
  id bigint generated always as identity primary key,
  entity text not null,
  entity_id uuid,
  action text not null,
  actor_id uuid references profiles (id) on delete set null,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

create index staff_skills_skill_id_idx on staff_skills (skill_id);
create index staff_locations_location_id_idx on staff_locations (location_id);
create index manager_locations_location_id_idx on manager_locations (location_id);
create index availability_recurring_profile_id_idx on availability_recurring (profile_id);
create index availability_exceptions_profile_id_idx on availability_exceptions (profile_id);
create index shifts_location_id_idx on shifts (location_id);
create index shifts_required_skill_id_idx on shifts (required_skill_id);
create index shifts_starts_at_idx on shifts (starts_at);
create index assignments_shift_id_idx on assignments (shift_id);
create index assignments_staff_id_idx on assignments (staff_id);
create index swap_requests_shift_id_idx on swap_requests (shift_id);
create index swap_requests_requester_id_idx on swap_requests (requester_id);
create index swap_requests_target_id_idx on swap_requests (target_id);
create index notifications_user_id_idx on notifications (user_id);
create index audit_log_entity_idx on audit_log (entity, entity_id);
create index audit_log_created_at_idx on audit_log (created_at);
