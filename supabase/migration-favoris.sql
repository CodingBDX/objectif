-- ===== Favoris en base + classement « Mis en avant » ===== à lancer UNE fois dans le SQL Editor
create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, profile_id)
);
alter table public.favorites enable row level security;
drop policy if exists "mes favoris: lire" on public.favorites;
drop policy if exists "mes favoris: ajouter" on public.favorites;
drop policy if exists "mes favoris: supprimer" on public.favorites;
create policy "mes favoris: lire" on public.favorites for select to authenticated using (user_id = auth.uid());
create policy "mes favoris: ajouter" on public.favorites for insert to authenticated with check (user_id = auth.uid());
create policy "mes favoris: supprimer" on public.favorites for delete to authenticated using (user_id = auth.uid());

-- total de cœurs par profil (chiffre agrégé, public)
create or replace function public.popular_favs() returns table(profile_id uuid, favs bigint)
language sql security definer set search_path = public stable as $$
  select profile_id, count(*)::bigint from public.favorites group by profile_id
$$;
revoke all on function public.popular_favs() from public;
grant execute on function public.popular_favs() to anon, authenticated;
