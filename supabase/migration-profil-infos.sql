-- ===== Infos publiques du profil : vues totales, vues du jour, derniere connexion (jour seulement) ===== a lancer UNE fois
create table if not exists public.profile_presence (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  last_seen timestamptz not null default now()
);
alter table public.profile_presence enable row level security;

create or replace function public.touch_last_seen() returns void
language sql security definer set search_path = public as $q$
  insert into public.profile_presence (profile_id, last_seen)
  select id, now() from public.profiles where id = auth.uid()
  on conflict (profile_id) do update set last_seen = now()
  where public.profile_presence.last_seen < now() - interval '10 minutes'
$q$;
revoke all on function public.touch_last_seen() from public;
grant execute on function public.touch_last_seen() to authenticated;

create or replace function public.profile_public_stats(p_id uuid)
returns table (views_total bigint, views_today bigint, last_seen_day date)
language sql stable security definer set search_path = public as $q$
  select coalesce(sum(s.views), 0)::bigint,
         coalesce(sum(s.views) filter (where s.day = (now() at time zone 'Europe/Paris')::date), 0)::bigint,
         (select (pr.last_seen at time zone 'Europe/Paris')::date from public.profile_presence pr where pr.profile_id = p_id)
  from public.profile_stats s where s.profile_id = p_id
$q$;
revoke all on function public.profile_public_stats(uuid) from public;
grant execute on function public.profile_public_stats(uuid) to anon, authenticated;
