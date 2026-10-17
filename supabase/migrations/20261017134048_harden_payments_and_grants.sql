-- Fixes from ticket 05's review.

-- Lock the Member while deleting, like record_payment does, so a delete and a record running at the same
-- time cannot leave a gap in the Member's Paid Months.
create or replace function public.delete_latest_payment(p_member_id uuid)
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

  perform 1 from public.members where id = p_member_id for update;

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

-- Helpers are for policies and the functions above, not for the public API.
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
revoke execute on function public.kyiv_today() from public, anon, authenticated;

-- Uploading with `upsert` and listing need SELECT on storage objects; public URLs work without it.
create policy "Admin lists avatars" on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (select public.is_admin()));

-- Nothing kept it current.
alter table public.groups drop column updated_at;
