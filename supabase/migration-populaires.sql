-- ===== Tri « Plus vus » ===== à lancer UNE fois dans le SQL Editor
-- Donne à l'annuaire le total de vues des 30 derniers jours (chiffre agrégé, public).
create or replace function public.popular_views() returns table(profile_id uuid, views bigint)
language sql security definer set search_path = public stable as $$
  select profile_id, sum(views)::bigint from public.profile_stats
  where day >= (now() at time zone 'Europe/Paris')::date - 29 group by profile_id
$$;
revoke all on function public.popular_views() from public;
grant execute on function public.popular_views() to anon, authenticated;
