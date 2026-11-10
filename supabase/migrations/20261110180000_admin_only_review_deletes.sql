drop policy if exists "rev delete" on public.reviews;

create policy "rev delete admin only"
on public.reviews
for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));
