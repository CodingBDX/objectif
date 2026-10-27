-- ===== Protection contre les abus (limites par heure / par jour) ===== à lancer UNE fois
-- Principe : des règles "restrictive" qui s'ajoutent aux règles existantes (elles ne les remplacent pas).

-- Fonctions de comptage (security definer : elles voient aussi les tables sans lecture publique)
create or replace function public.n_comments(uid uuid, mins int) returns int
language sql stable security definer set search_path = public as $$
  select count(*)::int from public.comments where author_id = uid and created_at > now() - make_interval(mins => mins)
$$;
create or replace function public.n_reports(uid uuid, mins int) returns int
language sql stable security definer set search_path = public as $$
  select count(*)::int from public.reports where reporter_id is not distinct from uid and created_at > now() - make_interval(mins => mins)
$$;
create or replace function public.n_reports_all(mins int) returns int
language sql stable security definer set search_path = public as $$
  select count(*)::int from public.reports where created_at > now() - make_interval(mins => mins)
$$;
revoke all on function public.n_comments(uuid, int), public.n_reports(uuid, int), public.n_reports_all(int) from public;
grant execute on function public.n_comments(uuid, int), public.n_reports(uuid, int), public.n_reports_all(int) to anon, authenticated;

-- Commentaires : 10 par heure et 40 par jour et par membre
drop policy if exists "limite commentaires" on public.comments;
create policy "limite commentaires" on public.comments as restrictive for insert to authenticated
  with check (public.n_comments(auth.uid(), 60) < 10 and public.n_comments(auth.uid(), 1440) < 40);

-- Signalements : 5 par jour et par compte connecté, et 100 par heure en tout (pour les visiteurs non connectés)
drop policy if exists "limite signalements" on public.reports;
create policy "limite signalements" on public.reports as restrictive for insert
  with check (
    public.n_reports_all(60) < 100
    and (auth.uid() is null or public.n_reports(auth.uid(), 1440) < 5)
  );

-- Pour voir les plus gros émetteurs :
--   select author_name, count(*) from public.comments where created_at > now() - interval '1 day' group by 1 order by 2 desc limit 10;
