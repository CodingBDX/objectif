-- ===== Tarifs : réservés aux VIP, avec option « afficher / masquer » ===== à lancer UNE fois
alter table public.profiles add column if not exists tarif_visible boolean not null default true;
revoke update on public.profiles from authenticated;
grant update (name, genre, city, more, specialties, bio, phone, instagram, snapchat, tiktok, site,
              h24, hours, trips, photos, video, paused, vlink, tarif_30, tarif_60, tarif_visible) on public.profiles to authenticated;
