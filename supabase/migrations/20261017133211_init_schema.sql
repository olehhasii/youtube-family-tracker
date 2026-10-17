-- Schema for the YouTube Family Tracker. Terms follow GLOSSARY.md; Payment rules follow docs/adr/0001.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- The single shared subscription. `id` is always true, so there can only be one row.
create table public.groups (
  id boolean primary key default true check (id),
  name text not null check (length(trim(name)) > 0),
  monthly_price numeric(10, 2) not null check (monthly_price >= 0),
  currency text not null default 'UAH' check (currency ~ '^[A-Z]{3}$'),
  updated_at timestamptz not null default now()
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  exempt boolean not null default false,
  avatar_path text,
  position integer not null default 0, -- manual sort hint within a Status
  created_at timestamptz not null default now()
);

-- A Member paid for `months` whole months starting at `first_month` (always the 1st of a month).
-- Rows are written only by record_payment() / delete_latest_payment(), which keep Paid Months one unbroken run.
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  first_month date not null check (extract(day from first_month) = 1),
  months integer not null check (months >= 1),
  received_on date not null,
  created_at timestamptz not null default now(),
  unique (member_id, first_month)
);

create index payments_member_latest on public.payments (member_id, first_month desc);

-- Users who may edit. Kept out of the API: no policies, read only through is_admin().
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- Who is the Admin
-- ---------------------------------------------------------------------------

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()))
$$;

-- ---------------------------------------------------------------------------
-- Row level security: everyone reads, only the Admin writes groups/members
-- ---------------------------------------------------------------------------

alter table public.groups enable row level security;
alter table public.members enable row level security;
alter table public.payments enable row level security;
alter table public.admins enable row level security;

create policy "Anyone can read the Group" on public.groups for select to anon, authenticated using (true);
create policy "Anyone can read Members" on public.members for select to anon, authenticated using (true);
create policy "Anyone can read Payments" on public.payments for select to anon, authenticated using (true);

create policy "Admin creates the Group" on public.groups for insert to authenticated with check ((select public.is_admin()));
create policy "Admin edits the Group" on public.groups for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Admin adds Members" on public.members for insert to authenticated with check ((select public.is_admin()));
create policy "Admin edits Members" on public.members for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin removes Members" on public.members for delete to authenticated using ((select public.is_admin()));

-- Payments: no write policies on purpose, and no table privileges either. Use the functions below.
revoke insert, update, delete, truncate on public.payments from anon, authenticated;
revoke all on public.admins from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Recording and deleting Payments (ADR 0001)
-- ---------------------------------------------------------------------------

-- Today's date in the Admin's timezone, so the "current month" never shifts at UTC midnight.
create function public.kyiv_today()
returns date
language sql
stable
set search_path = ''
as $$
  select (now() at time zone 'Europe/Kyiv')::date
$$;

-- Records `p_months` months for a Member, continuing from their first unpaid month
-- (or the current month for their first Payment).
create function public.record_payment(p_member_id uuid, p_months integer)
returns public.payments
language plpgsql
security definer
set search_path = ''
as $$
declare
  member public.members;
  next_month date;
  recorded public.payments;
begin
  if not public.is_admin() then
    raise exception 'Only the Admin can record Payments' using errcode = '42501';
  end if;
  if p_months is null or p_months < 1 then
    raise exception 'A Payment covers at least one whole month' using errcode = '22023';
  end if;

  -- lock the Member so two Payments recorded at once cannot both claim the same month
  select * into member from public.members where id = p_member_id for update;
  if not found then
    raise exception 'No such Member' using errcode = 'P0002';
  end if;
  if member.exempt then
    raise exception 'Exempt Members never pay' using errcode = '22023';
  end if;

  select (p.first_month + make_interval(months => p.months))::date into next_month
  from public.payments p
  where p.member_id = p_member_id
  order by p.first_month desc
  limit 1;

  insert into public.payments (member_id, first_month, months, received_on)
  values (
    p_member_id,
    coalesce(next_month, date_trunc('month', public.kyiv_today())::date),
    p_months,
    public.kyiv_today()
  )
  returning * into recorded;
  return recorded;
end;
$$;

-- Deletes the Member's latest Payment (the only one that can go without leaving a gap). Returns it, or null.
create function public.delete_latest_payment(p_member_id uuid)
returns public.payments
language plpgsql
security definer
set search_path = ''
as $$
declare
  removed public.payments;
begin
  if not public.is_admin() then
    raise exception 'Only the Admin can delete Payments' using errcode = '42501';
  end if;

  delete from public.payments
  where id = (
    select p.id from public.payments p
    where p.member_id = p_member_id
    order by p.first_month desc
    limit 1
  )
  returning * into removed;
  return removed;
end;
$$;

revoke execute on function public.record_payment(uuid, integer) from public, anon;
revoke execute on function public.delete_latest_payment(uuid) from public, anon;
grant execute on function public.record_payment(uuid, integer) to authenticated;
grant execute on function public.delete_latest_payment(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Avatars: public to read, only the Admin uploads or removes
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5 * 1024 * 1024, array['image/jpeg', 'image/png', 'image/webp']);

create policy "Admin uploads avatars" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (select public.is_admin()));
create policy "Admin replaces avatars" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (select public.is_admin()));
create policy "Admin removes avatars" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (select public.is_admin()));
