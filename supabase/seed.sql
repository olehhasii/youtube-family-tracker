-- Development data: the prototype's mock Group and Members, with Payments relative to the current month
-- so every Status shows up. Load it into an EMPTY database only (re-running it in a later month would overlap
-- Payments). Wiped before the real data is imported (ticket 16).

insert into public.groups (name, monthly_price, currency) values ('Family Premium', 299, 'UAH')
on conflict (id) do nothing;

insert into public.members (name, slug, exempt, position) values
  ('Oleh', 'oleh', true, 0),
  ('Sasha', 'sasha', false, 1),
  ('Dima', 'dima', false, 2),
  ('Ira', 'ira', false, 3),
  ('Max', 'max', false, 4),
  ('Kate', 'kate', false, 5)
on conflict (slug) do nothing;

-- (slug, months from the current month, months paid): one unbroken run per Member
with this_month as (select date_trunc('month', public.kyiv_today())::date as m),
runs (slug, offset_months, months) as (
  values
    ('sasha', -8, 3), ('sasha', -5, 3),  -- paid through 3 months ago: Overdue
    ('dima', -5, 6),                     -- paid through this month: Paid, Due Soon near month end
    ('ira', -4, 6), ('ira', 2, 2),       -- paid well ahead
    ('max', -2, 1), ('max', -1, 2)       -- paid through this month
)
insert into public.payments (member_id, first_month, months, received_on)
select mb.id,
       (tm.m + make_interval(months => r.offset_months))::date,
       r.months,
       least((tm.m + make_interval(months => r.offset_months))::date, public.kyiv_today()) -- never received in the future
from runs r
join public.members mb on mb.slug = r.slug
cross join this_month tm
on conflict (member_id, first_month) do nothing;
