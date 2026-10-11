create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  app_id uuid references public.apps(id) on delete cascade,
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.notifications(user_id, created_at desc);
grant select, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "notif own read" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "notif own update" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notif own delete" on public.notifications for delete to authenticated using (user_id = auth.uid());

create or replace function public.notify_app_update()
returns trigger language plpgsql security definer set search_path = public as $$
declare msg text;
begin
  if not new.is_published then return new; end if;
  if new.kind = 'apk' and (new.version_name is distinct from old.version_name or new.version_code is distinct from old.version_code) and new.apk_path is not null then
    msg := 'Version ' || coalesce(new.version_name, '?') || ' is now available.';
  elsif new.kind = 'website' and new.website_url is distinct from old.website_url then
    msg := 'The website link has been updated.';
  else
    return new;
  end if;
  insert into public.notifications(user_id, app_id, title, body)
  select distinct u, new.id, new.name || ' was updated', msg from (
    select user_id u from public.favorites where app_id = new.id
    union select user_id from public.downloads where app_id = new.id and user_id is not null
    union select user_id from public.website_opens where app_id = new.id and user_id is not null
  ) s;
  return new;
end $$;
revoke execute on function public.notify_app_update() from public, anon, authenticated;
create trigger apps_notify_update after update on public.apps for each row execute function public.notify_app_update();