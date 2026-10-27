-- ===== Spécialités : 5 maximum (profil normal), 30 (VIP) ===== à lancer UNE fois
-- 1) réduit à 5 les profils normaux qui en ont plus
update public.profiles set specialties = specialties[1:5] where not vip and cardinality(specialties) > 5;
-- 2) remplace l'ancienne limite (6) par la nouvelle
alter table public.profiles drop constraint if exists profiles_specialties_check;
alter table public.profiles drop constraint if exists profiles_specialties_max;
alter table public.profiles add constraint profiles_specialties_max check (cardinality(specialties) <= case when vip then 30 else 5 end);
