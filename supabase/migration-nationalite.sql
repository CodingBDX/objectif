-- ===== Nationalite dans la description du profil ===== a lancer UNE fois
alter table public.profiles add column if not exists nationality text check (nationality is null or char_length(nationality) <= 40);
grant update (nationality) on public.profiles to authenticated;
