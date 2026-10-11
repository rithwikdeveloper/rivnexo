-- App icons, banners and screenshots are intentionally public because they are
-- displayed to visitors who are not signed in. APK files remain private.
insert into storage.buckets (id, name, public)
values ('app-media', 'app-media', true)
on conflict (id) do update set public = true;
