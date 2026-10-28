-- ===== Logements (profils VIP + verifies) ===== a lancer en 4 blocs, un par un
-- Bloc 1 : tables
create table if not exists public.lodgings (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 60),
  description text not null default '' check (char_length(description) <= 800),
  city text not null check (char_length(city) between 2 and 60),
  area text check (area is null or char_length(area) <= 60),
  lat double precision,
  lon double precision,
  photos text[] not null default '{}' check (cardinality(photos) <= 3),
  price_day int check (price_day is null or price_day between 0 and 100000),
  price_week int check (price_week is null or price_week between 0 and 100000),
  price_month int check (price_month is null or price_month between 0 and 100000),
  busy jsonb not null default '[]'::jsonb check (jsonb_typeof(busy) = 'array' and jsonb_array_length(busy) <= 24),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.lodging_private (
  profile_id uuid primary key references public.lodgings(profile_id) on delete cascade,
  address text not null check (char_length(address) between 5 and 200)
);
alter table public.lodgings enable row level security;
alter table public.lodging_private enable row level security;
revoke all on public.lodgings from anon, authenticated;
revoke all on public.lodging_private from anon, authenticated;
grant select on public.lodgings to anon, authenticated;
grant insert (profile_id, title, description, city, area, lat, lon, photos, price_day, price_week, price_month, busy) on public.lodgings to authenticated;
grant update (title, description, city, area, lat, lon, photos, price_day, price_week, price_month, busy) on public.lodgings to authenticated;
grant delete on public.lodgings to authenticated;
grant select, insert, update, delete on public.lodging_private to authenticated;

-- Bloc 2 : regles d'acces
drop policy if exists "logements: lecture" on public.lodgings;
create policy "logements: lecture" on public.lodgings for select to anon, authenticated using (
  (status = 'approved' and exists (select 1 from public.profiles p where p.id = profile_id and p.vip and p.verified and not p.paused))
  or profile_id = auth.uid() or public.is_admin());
drop policy if exists "logements: creation" on public.lodgings;
create policy "logements: creation" on public.lodgings for insert to authenticated with check (
  profile_id = auth.uid() and exists (select 1 from public.profiles p where p.id = auth.uid() and p.vip and p.verified));
drop policy if exists "logements: modification" on public.lodgings;
create policy "logements: modification" on public.lodgings for update to authenticated
  using (profile_id = auth.uid() and exists (select 1 from public.profiles p where p.id = auth.uid() and p.vip and p.verified))
  with check (profile_id = auth.uid());
drop policy if exists "logements: suppression" on public.lodgings;
create policy "logements: suppression" on public.lodgings for delete to authenticated using (profile_id = auth.uid() or public.is_admin());
drop policy if exists "adresse: proprietaire" on public.lodging_private;
create policy "adresse: proprietaire" on public.lodging_private for all to authenticated
  using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() and exists (select 1 from public.profiles p where p.id = auth.uid() and p.vip and p.verified));

-- Bloc 3 : toute modification par le proprietaire repasse en validation
create or replace function public.lodging_revalidate() returns trigger
language plpgsql security definer set search_path = public as $q$
begin
  new.updated_at := now();
  if not public.is_admin() and (new.title, new.description, new.city, new.area, new.photos, new.price_day, new.price_week, new.price_month)
     is distinct from (old.title, old.description, old.city, old.area, old.photos, old.price_day, old.price_week, old.price_month) then
    new.status := 'pending';
  end if;
  return new;
end $q$;
drop trigger if exists lodging_revalidate on public.lodgings;
create trigger lodging_revalidate before update on public.lodgings for each row execute function public.lodging_revalidate();

-- Bloc 4 : validation par l'admin
create or replace function public.admin_set_lodging(p_id uuid, p_status text) returns void
language plpgsql security definer set search_path = public as $q$
begin
  if not public.is_admin() then raise exception 'Acces reserve'; end if;
  if p_status not in ('pending','approved','rejected') then raise exception 'Statut invalide'; end if;
  update public.lodgings set status = p_status where profile_id = p_id;
end $q$;
revoke all on function public.admin_set_lodging(uuid, text) from public, anon;
grant execute on function public.admin_set_lodging(uuid, text) to authenticated;
