-- ===== Plusieurs tarifs par profil (VIP) ===== a lancer UNE fois
alter table public.profiles add column if not exists rates jsonb not null default '[]'::jsonb;
alter table public.profiles drop constraint if exists profiles_rates_check;
alter table public.profiles add constraint profiles_rates_check check (jsonb_typeof(rates) = 'array' and jsonb_array_length(rates) <= 8);
grant update (rates) on public.profiles to authenticated;
