-- ===== Description du profil, suite : cheveux, yeux, bonnet, fume, boit ===== a lancer UNE fois
alter table public.profiles add column if not exists hair text check (hair is null or char_length(hair) <= 30);
alter table public.profiles add column if not exists eyes text check (eyes is null or char_length(eyes) <= 30);
alter table public.profiles add column if not exists bra text check (bra is null or char_length(bra) <= 10);
alter table public.profiles add column if not exists smoker text check (smoker is null or smoker in ('non','parfois','oui'));
alter table public.profiles add column if not exists drinker text check (drinker is null or drinker in ('non','parfois','oui'));
grant update (hair, eyes, bra, smoker, drinker) on public.profiles to authenticated;
alter table public.profiles add column if not exists receives boolean not null default false;
alter table public.profiles add column if not exists travels boolean not null default false;
grant update (receives, travels) on public.profiles to authenticated;
