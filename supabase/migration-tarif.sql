-- ===== Tarif « à partir de » ===== à lancer UNE fois dans le SQL Editor
alter table public.profiles add column if not exists tarif int check (tarif is null or (tarif >= 0 and tarif <= 10000));
revoke update on public.profiles from authenticated;
grant update (name, genre, city, more, specialties, bio, phone, instagram, snapchat, tiktok, site,
              h24, hours, trips, photos, video, paused, vlink, tarif) on public.profiles to authenticated;
