-- 40001 (serialization failure) makes PostgREST retry the call until it times out; PT409 answers HTTP 409 Conflict.
create or replace function public.delete_latest_payment(p_member_id uuid, p_payment_id uuid default null)
returns public.payments
language plpgsql
security definer
set search_path = ''
as $$
declare
  latest uuid;
  removed public.payments;
begin
  if not public.is_admin() then
    raise exception 'Only the Admin can delete Payments' using errcode = '42501';
  end if;

  perform 1 from public.members where id = p_member_id for update;

  select p.id into latest from public.payments p
  where p.member_id = p_member_id
  order by p.first_month desc
  limit 1;

  if p_payment_id is not null and latest is distinct from p_payment_id then
    raise exception 'That Payment is no longer the latest' using errcode = 'PT409';
  end if;

  delete from public.payments where id = latest returning * into removed;
  return removed;
end;
$$;

