-- ===== Arrondissement ou quartier sous la ville de base ===== a lancer UNE fois
alter table public.profiles add column if not exists district text check (district is null or char_length(district) <= 40);
grant update (district) on public.profiles to authenticated;
