-- ===== Limites : 10 photos / 3 villes supplémentaires (profil normal), 20 photos / 6 villes (VIP) ===== à lancer UNE fois
alter table public.profiles drop constraint if exists profiles_photos_check;
alter table public.profiles drop constraint if exists profiles_more_check;
alter table public.profiles add constraint profiles_photos_max check (cardinality(photos) <= case when vip then 20 else 10 end);
alter table public.profiles add constraint profiles_more_max check (cardinality(more) <= case when vip then 6 else 3 end);
