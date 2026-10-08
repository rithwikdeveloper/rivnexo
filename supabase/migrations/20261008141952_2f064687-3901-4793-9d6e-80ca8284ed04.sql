drop policy if exists "apps public read" on public.apps;
create policy "apps public read" on public.apps for select to anon, authenticated using (is_published and (kind='website' or approval_status='approved'));
create policy "apps admin read" on public.apps for select to authenticated using (public.has_role(auth.uid(),'admin'));
drop policy if exists "rev read" on public.reviews;
create policy "rev public read" on public.reviews for select to anon, authenticated using (not is_hidden);
create policy "rev own or admin read" on public.reviews for select to authenticated using (user_id=auth.uid() or public.has_role(auth.uid(),'admin'));