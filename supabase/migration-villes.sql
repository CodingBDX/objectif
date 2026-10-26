-- À lancer UNE fois si tu as déjà exécuté schema.sql avant cette version
alter table public.profiles add column if not exists more text[] not null default '{}' check (cardinality(more) <= 3);
revoke update on public.profiles from authenticated;
grant update (name, genre, city, more, specialties, bio, phone, instagram, snapchat, tiktok, site,
              h24, hours, trips, photos, video, paused) on public.profiles to authenticated;
