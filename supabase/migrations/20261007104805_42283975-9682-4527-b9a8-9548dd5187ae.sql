create type public.app_role as enum ('admin','user');
create type public.app_kind as enum ('website','apk');

create table public.profiles (id uuid primary key references auth.users(id) on delete cascade, email text, display_name text, avatar_url text, is_blocked boolean not null default false, created_at timestamptz not null default now());
grant select, insert, update on public.profiles to authenticated; grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated; grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());

create table public.admin_accounts (user_id uuid primary key references auth.users(id) on delete cascade, username text unique not null, created_at timestamptz not null default now());
grant all on public.admin_accounts to service_role;
alter table public.admin_accounts enable row level security;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id,email,display_name) values (new.id,new.email,coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  insert into public.user_roles(user_id,role) values (new.id,'user');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.categories (id uuid primary key default gen_random_uuid(), name text not null, slug text unique not null, icon text, sort_order int not null default 0, created_at timestamptz not null default now());
grant select on public.categories to anon, authenticated; grant insert, update, delete on public.categories to authenticated; grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "cat read" on public.categories for select using (true);
create policy "cat admin" on public.categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.apps (
  id uuid primary key default gen_random_uuid(), kind app_kind not null, name text not null, slug text unique not null,
  icon_url text, banner_url text, short_description text, full_description text, website_url text,
  apk_path text, version_name text, version_code int, package_name text, file_size bigint, min_android text,
  developer text, category_id uuid references public.categories(id) on delete set null, tags text[] not null default '{}',
  screenshots text[] not null default '{}', release_date date, changelog text, sha256 text,
  scan_status text not null default 'pending', approval_status text not null default 'pending',
  is_featured boolean not null default false, is_published boolean not null default false,
  download_count int not null default 0, open_count int not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());
grant select on public.apps to anon, authenticated; grant insert, update, delete on public.apps to authenticated; grant all on public.apps to service_role;
alter table public.apps enable row level security;
create policy "apps public read" on public.apps for select using ((is_published and (kind='website' or approval_status='approved')) or public.has_role(auth.uid(),'admin'));
create policy "apps admin" on public.apps for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.favorites (user_id uuid not null references auth.users(id) on delete cascade, app_id uuid not null references public.apps(id) on delete cascade, created_at timestamptz not null default now(), primary key(user_id, app_id));
grant select, insert, delete on public.favorites to authenticated; grant all on public.favorites to service_role;
alter table public.favorites enable row level security;
create policy "fav own" on public.favorites for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());

create table public.downloads (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete set null, app_id uuid not null references public.apps(id) on delete cascade, version_name text, created_at timestamptz not null default now());
grant select on public.downloads to authenticated; grant all on public.downloads to service_role;
alter table public.downloads enable row level security;
create policy "dl own" on public.downloads for select to authenticated using (user_id=auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.website_opens (id uuid primary key default gen_random_uuid(), user_id uuid, app_id uuid not null references public.apps(id) on delete cascade, created_at timestamptz not null default now());
grant select on public.website_opens to authenticated; grant all on public.website_opens to service_role;
alter table public.website_opens enable row level security;
create policy "opens admin" on public.website_opens for select to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.reviews (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, app_id uuid not null references public.apps(id) on delete cascade, rating int not null check (rating between 1 and 5), body text check (char_length(body) <= 1000), author_name text, is_hidden boolean not null default false, created_at timestamptz not null default now(), unique(user_id, app_id));
grant select on public.reviews to anon, authenticated; grant insert, update, delete on public.reviews to authenticated; grant all on public.reviews to service_role;
alter table public.reviews enable row level security;
create policy "rev read" on public.reviews for select using (not is_hidden or user_id=auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "rev insert" on public.reviews for insert to authenticated with check (user_id=auth.uid());
create policy "rev update" on public.reviews for update to authenticated using (user_id=auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "rev delete" on public.reviews for delete to authenticated using (user_id=auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.audit_log (id uuid primary key default gen_random_uuid(), admin_id uuid, action text not null, target text, details jsonb, created_at timestamptz not null default now());
grant select, insert on public.audit_log to authenticated; grant all on public.audit_log to service_role;
alter table public.audit_log enable row level security;
create policy "audit admin read" on public.audit_log for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "audit admin insert" on public.audit_log for insert to authenticated with check (public.has_role(auth.uid(),'admin') and admin_id=auth.uid());

create table public.site_settings (id int primary key default 1 check (id=1), site_name text not null default 'Rivnexo', tagline text default 'The marketplace for apps that run anywhere.', primary_color text default '#0f8a70', support_email text, maintenance_mode boolean not null default false, updated_at timestamptz not null default now());
grant select on public.site_settings to anon, authenticated; grant update on public.site_settings to authenticated; grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "settings read" on public.site_settings for select using (true);
create policy "settings admin" on public.site_settings for update to authenticated using (public.has_role(auth.uid(),'admin'));
insert into public.site_settings(id) values (1);

insert into public.categories(name,slug,icon,sort_order) values
('Productivity','productivity','Briefcase',1),('Health & Fitness','health-fitness','HeartPulse',2),('Developer Tools','developer-tools','Code2',3),('Finance','finance','Wallet',4),('Music','music','Music',5),('Games','games','Gamepad2',6),('Education','education','GraduationCap',7),('Social','social','Users',8);