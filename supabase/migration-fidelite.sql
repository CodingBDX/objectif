-- ===== FIDELITE : points + temps de VIP cumule -> niveau (couronne Bronze / Argent / Or / Diamant) ===== a lancer UNE fois
-- Prerequis : migration-vip-expiration.sql, migration-parrainage.sql.
-- Points gagnes (a vie) : profil complet 50 (3 photos + presentation 150 car.) · profil verifie 100 · amie parrainee verifiee 150 (max 6)
--                         + 1 point par jour de connexion + 1 point par jour de VIP.
-- Niveaux : Bronze 250 · Argent 700 · Or 1500 · Diamant 3000 (le niveau ne baisse jamais ; depenser des points ne le fait pas baisser).
-- Classement : VIP d'abord, puis remontee de moins de 24 h, puis le plus de points, puis la date.
-- Depenses : remontee immediate 60 pts · 7 jours de VIP 400 pts.
alter table public.profiles add column if not exists crown smallint not null default 0;
alter table public.profiles add column if not exists points int not null default 0;  -- sert au classement : plus de points = plus haut dans la liste (apres le VIP)

create table if not exists public.loyalty (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  login_days int not null default 0,
  vip_days int not null default 0,
  last_login date,
  vip_credited date,
  spent int not null default 0,
  best_level smallint not null default 0
);
alter table public.loyalty enable row level security;  -- aucune regle : seules les fonctions ci-dessous y accedent

create or replace function public.loyalty_level(pts int) returns smallint
language sql immutable as $$ select (case when pts >= 3000 then 4 when pts >= 1500 then 3 when pts >= 700 then 2 when pts >= 250 then 1 else 0 end)::smallint $$;

-- Appelee a chaque visite (une fois par session) : credite la connexion du jour, les jours de VIP, et met a jour le niveau
create or replace function public.loyalty_sync() returns json
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); p public.profiles%rowtype; l public.loyalty%rowtype; today date := (now() at time zone 'Europe/Paris')::date;
        done boolean; refs int; earned int; lvl smallint;
begin
  if me is null then raise exception 'Non connecté'; end if;
  select * into p from public.profiles where id = me;
  if not found then raise exception 'Crée d''abord ton profil'; end if;
  insert into public.loyalty (profile_id) values (me) on conflict do nothing;
  select * into l from public.loyalty where profile_id = me;
  if l.last_login is null or l.last_login < today then l.login_days := l.login_days + 1; l.last_login := today; end if;
  if p.vip then
    if l.vip_credited is null then l.vip_days := l.vip_days + 1;
    else l.vip_days := l.vip_days + least(greatest(today - l.vip_credited, 0), 31); end if;
    l.vip_credited := today;
  else l.vip_credited := null; end if;
  done := coalesce(cardinality(p.photos), 0) >= 3 and char_length(coalesce(p.bio, '')) >= 150;
  select least(count(*) filter (where referral_rewarded), 6)::int into refs from public.profiles where referred_by = me;
  earned := (case when done then 50 else 0 end) + (case when p.verified then 100 else 0 end) + 150 * coalesce(refs, 0) + l.login_days + l.vip_days;
  lvl := greatest(public.loyalty_level(earned), l.best_level);
  update public.loyalty set login_days = l.login_days, vip_days = l.vip_days, last_login = l.last_login, vip_credited = l.vip_credited, best_level = lvl where profile_id = me;
  if p.crown is distinct from lvl or p.points is distinct from earned then update public.profiles set crown = lvl, points = earned where id = me; end if;
  return json_build_object('earned', earned, 'spent', l.spent, 'balance', earned - l.spent, 'level', lvl, 'login_days', l.login_days, 'vip_days', l.vip_days, 'done', done, 'verified', p.verified, 'refs', coalesce(refs, 0));
end $$;
revoke all on function public.loyalty_sync() from public, anon;
grant execute on function public.loyalty_sync() to authenticated;

-- Depenser des points : 'bump' (remontee immediate, 60) ou 'vip7' (7 jours de VIP, 400)
create or replace function public.loyalty_redeem(p_kind text) returns json
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); st json; bal int; cost int;
begin
  if me is null then raise exception 'Non connecté'; end if;
  st := public.loyalty_sync(); bal := (st->>'balance')::int;
  cost := case p_kind when 'bump' then 60 when 'vip7' then 400 else null end;
  if cost is null then raise exception 'Choix inconnu'; end if;
  if bal < cost then raise exception 'Il te manque % points', cost - bal; end if;
  if p_kind = 'bump' then
    update public.profiles set bumped_at = now() where id = me;
  else
    update public.profiles set vip = true where id = me;
    insert into public.vip_until (profile_id, until) values (me, now() + interval '7 days')
    on conflict (profile_id) do update set until = greatest(public.vip_until.until, now()) + interval '7 days';
  end if;
  update public.loyalty set spent = spent + cost where profile_id = me;
  return public.loyalty_sync();
end $$;
revoke all on function public.loyalty_redeem(text) from public, anon;
grant execute on function public.loyalty_redeem(text) to authenticated;
