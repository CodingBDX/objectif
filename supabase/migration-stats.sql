-- ===== Statistiques des profils ===== à lancer UNE fois dans le SQL Editor
create table if not exists public.profile_stats (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  views int not null default 0,
  calls int not null default 0,
  copies int not null default 0,
  socials int not null default 0,
  primary key (profile_id, day)
);
alter table public.profile_stats enable row level security;
drop policy if exists "chacun voit ses statistiques" on public.profile_stats;
create policy "chacun voit ses statistiques" on public.profile_stats for select to authenticated using (profile_id = auth.uid() or public.is_admin());
-- pas de policy d'écriture : on n'écrit que par la fonction ci-dessous

create or replace function public.track_event(p_profile uuid, p_kind text) returns void
language plpgsql security definer set search_path = public as $$
declare d date := (now() at time zone 'Europe/Paris')::date;
begin
  if p_kind not in ('view','call','copy','social') then return; end if;
  if auth.uid() = p_profile then return; end if;                                   -- on ne compte pas ses propres visites
  if not exists (select 1 from public.profiles where id = p_profile and paused = false) then return; end if;
  insert into public.profile_stats (profile_id, day, views, calls, copies, socials)
  values (p_profile, d, (p_kind = 'view')::int, (p_kind = 'call')::int, (p_kind = 'copy')::int, (p_kind = 'social')::int)
  on conflict (profile_id, day) do update set
    views = public.profile_stats.views + excluded.views, calls = public.profile_stats.calls + excluded.calls,
    copies = public.profile_stats.copies + excluded.copies, socials = public.profile_stats.socials + excluded.socials;
end $$;
revoke all on function public.track_event(uuid, text) from public;
grant execute on function public.track_event(uuid, text) to anon, authenticated;
