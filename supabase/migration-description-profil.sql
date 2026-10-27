-- ===== Description du profil : age, taille, poids, ethnie, langues ===== a lancer UNE fois
alter table public.profiles add column if not exists age int check (age is null or (age >= 18 and age <= 99));
alter table public.profiles add column if not exists height_cm int check (height_cm is null or (height_cm >= 120 and height_cm <= 230));
alter table public.profiles add column if not exists weight_kg int check (weight_kg is null or (weight_kg >= 30 and weight_kg <= 200));
alter table public.profiles add column if not exists ethnicity text check (ethnicity is null or char_length(ethnicity) <= 40);
alter table public.profiles add column if not exists languages text[] not null default '{}' check (cardinality(languages) <= 8);
grant update (age, height_cm, weight_kg, ethnicity, languages) on public.profiles to authenticated;
