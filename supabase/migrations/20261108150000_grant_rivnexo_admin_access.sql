-- Grant the existing Rivnexo admin role to the requested account.
-- The role is what both the UI guards and database RLS policies check.
insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from auth.users
where lower(email) = lower('rivnexo.app@gmail.com')
on conflict (user_id, role) do nothing;
