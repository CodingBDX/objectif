-- ===== Alertes e-mail : "je cherche un logement a Lyon, previens-moi quand il y en a un" =====
create table if not exists public.lodging_alerts (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  city text not null check (char_length(city) between 2 and 60),
  created_at timestamptz not null default now()
);
create unique index if not exists lodging_alerts_uniq on public.lodging_alerts (profile_id, lower(city));
create table if not exists public.lodging_alert_sent (
  lodging_id uuid not null references public.lodgings(profile_id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  primary key (lodging_id, profile_id)
);
alter table public.lodging_alerts enable row level security;
alter table public.lodging_alert_sent enable row level security;
revoke all on public.lodging_alerts, public.lodging_alert_sent from anon, authenticated;
-- aucune policy : tout passe par les fonctions ci-dessous

-- Mes alertes
create or replace function public.my_lodging_alerts() returns table(city text)
language sql stable security definer set search_path = public as $$
  select city from public.lodging_alerts where profile_id = auth.uid() order by created_at;
$$;

-- Activer / desactiver une alerte (reserve aux profils VIP verifies, comme les logements), 5 villes max
create or replace function public.set_lodging_alert(p_city text, p_on boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not exists (select 1 from public.profiles where id = auth.uid() and vip and verified) then raise exception 'Réservé aux profils VIP vérifiés'; end if;
  if p_city is null or length(trim(p_city)) < 2 then raise exception 'Ville invalide'; end if;
  if p_on then
    if (select count(*) from public.lodging_alerts where profile_id = auth.uid()) >= 5 then raise exception '5 alertes maximum : désactive-en une.'; end if;
    insert into public.lodging_alerts (profile_id, city) values (auth.uid(), left(trim(p_city), 60)) on conflict do nothing;
  else
    delete from public.lodging_alerts where profile_id = auth.uid() and lower(city) = lower(trim(p_city));
  end if;
end $$;

-- Destinataires d une alerte pour un logement qui vient d etre valide (admin seulement). Les marque comme prevenus.
create or replace function public.lodging_alert_recipients(p_lodging uuid) returns table(email text, city text)
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Accès réservé'; end if;
  return query
  with l as (select profile_id, lodgings.city from public.lodgings where profile_id = p_lodging and status = 'approved'),
  t as (
    select a.profile_id as pid, l.city as lcity
    from public.lodging_alerts a join l on lower(a.city) = lower(l.city)
    join public.profiles p on p.id = a.profile_id and p.vip and p.verified and not p.paused
    where a.profile_id <> p_lodging
      and not exists (select 1 from public.lodging_alert_sent s where s.lodging_id = p_lodging and s.profile_id = a.profile_id)
  ), ins as (
    insert into public.lodging_alert_sent (lodging_id, profile_id) select p_lodging, pid from t on conflict do nothing returning profile_id
  )
  select u.email::text, t.lcity from t join auth.users u on u.id = t.pid where u.email is not null;
end $$;

revoke all on function public.my_lodging_alerts(), public.set_lodging_alert(text, boolean), public.lodging_alert_recipients(uuid) from public, anon;
grant execute on function public.my_lodging_alerts(), public.set_lodging_alert(text, boolean) to authenticated;
grant execute on function public.lodging_alert_recipients(uuid) to authenticated;
