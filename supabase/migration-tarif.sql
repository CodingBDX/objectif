-- ===== Tarifs 30 minutes / 1 heure ===== à lancer UNE fois dans le SQL Editor
alter table public.profiles add column if not exists tarif_30 int check (tarif_30 is null or (tarif_30 >= 0 and tarif_30 <= 10000));
alter table public.profiles add column if not exists tarif_60 int check (tarif_60 is null or (tarif_60 >= 0 and tarif_60 <= 10000));
revoke update on public.profiles from authenticated;
grant update (name, genre, city, more, specialties, bio, phone, instagram, snapchat, tiktok, site,
              h24, hours, trips, photos, video, paused, vlink, tarif_30, tarif_60) on public.profiles to authenticated;
