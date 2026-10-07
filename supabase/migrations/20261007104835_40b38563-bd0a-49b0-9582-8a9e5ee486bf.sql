revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.has_role(uuid, app_role) from public, anon;
create policy "no direct access" on public.admin_accounts for select to authenticated using (false);