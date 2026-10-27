-- ===== VIP avec date de fin + retour automatique en profil normal ===== à lancer UNE fois
-- Les dates sont dans une table à part (privée) pour ne jamais être envoyées aux visiteurs.
create table if not exists public.vip_until (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  until timestamptz not null
);
alter table public.vip_until enable row level security;
drop policy if exists "vip_until: admin" on public.vip_until;
create policy "vip_until: admin" on public.vip_until for all to authenticated using (public.is_admin()) with check (public.is_admin());
create index if not exists vip_until_until on public.vip_until (until);

-- Admin : passe un profil en VIP pour N jours (ex. 30). Appeler avec 0 ou null = VIP sans fin.
create or replace function public.admin_set_vip(p_id uuid, p_days int)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Accès réservé'; end if;
  update public.profiles set vip = true where id = p_id;
  if p_days is null or p_days <= 0 then
    delete from public.vip_until where profile_id = p_id;
  else
    insert into public.vip_until (profile_id, until) values (p_id, now() + make_interval(days => p_days))
    on conflict (profile_id) do update set until = greatest(public.vip_until.until, now()) + make_interval(days => p_days);  -- prolonge à partir de la fin actuelle
  end if;
end $$;
revoke all on function public.admin_set_vip(uuid, int) from public, anon;
grant execute on function public.admin_set_vip(uuid, int) to authenticated;

-- Retire le VIP des profils dont la date est dépassée
create or replace function public.expire_vip() returns int
language sql security definer set search_path = public as $$
  with gone as (delete from public.vip_until where until < now() returning profile_id),
       upd as (update public.profiles set vip = false where id in (select profile_id from gone) returning 1)
  select count(*)::int from upd
$$;
revoke all on function public.expire_vip() from public, anon, authenticated;

-- Lance la vérification toutes les heures (nécessite pg_cron, voir migration-nettoyage-auto.sql)
select cron.schedule('expire-vip', '5 * * * *', $$ select public.expire_vip() $$);

-- Exemples :
--   (depuis le SQL Editor, la fonction admin_set_vip est refusée car tu n'es pas connecté en tant qu'admin du site ; utilise ces deux lignes à la place :)
--   update public.profiles set vip = true where id = '<id du profil>';
--   insert into public.vip_until values ('<id du profil>', now() + interval '30 days') on conflict (profile_id) do update set until = excluded.until;
--   select p.name, v.until from public.vip_until v join public.profiles p on p.id = v.profile_id order by v.until;  -- qui expire bientôt
