-- ===== Index (vitesse) + contraintes (sécurité des données) ===== à lancer UNE fois, sans risque pour les données existantes

-- 1) INDEX
create index if not exists profiles_city on public.profiles (city);
create index if not exists profiles_visible on public.profiles (paused, vip desc, created_at desc);
create index if not exists profiles_specialties_gin on public.profiles using gin (specialties);
create index if not exists profiles_trips_gin on public.profiles using gin (trips);
create index if not exists stats_day on public.profile_stats (day);
create index if not exists favorites_profile on public.favorites (profile_id);
create index if not exists favorites_user on public.favorites (user_id, created_at desc);

-- 2) CONTRAINTES (not valid = vérifiées pour toute nouvelle écriture, sans bloquer les lignes déjà présentes)
alter table public.profiles drop constraint if exists profiles_city_len;
alter table public.profiles add  constraint profiles_city_len check (char_length(city) between 2 and 80) not valid;

alter table public.profiles drop constraint if exists profiles_phone_fmt;
alter table public.profiles add  constraint profiles_phone_fmt check (phone is null or phone = '' or phone ~ '^[0-9 +().-]{6,20}$') not valid;

alter table public.profiles drop constraint if exists profiles_links_len;
alter table public.profiles add  constraint profiles_links_len check (
  coalesce(char_length(instagram),0) <= 100 and coalesce(char_length(snapchat),0) <= 100 and
  coalesce(char_length(tiktok),0) <= 100 and coalesce(char_length(site),0) <= 200 and coalesce(char_length(video),0) <= 500
) not valid;

alter table public.profiles drop constraint if exists profiles_tarif_order;
alter table public.profiles add  constraint profiles_tarif_order check (
  (tarif_30 is null or tarif_30 between 0 and 10000) and (tarif_60 is null or tarif_60 between 0 and 10000)
) not valid;

-- 3) NETTOYAGE des statistiques de plus d'un an (à relancer de temps en temps)
delete from public.profile_stats where day < current_date - 365;
