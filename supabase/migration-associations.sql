-- ===== Annuaire des associations par ville ===== à lancer UNE fois dans le SQL Editor
-- Une association = un compte = une fiche. La fiche n'est visible du public qu'après validation par un admin.
-- Toute modification par l'association la remet « en attente » (évite qu'une fiche validée soit détournée ensuite).

create table if not exists public.associations (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid not null unique references auth.users(id) on delete cascade,
  slug        text not null unique,
  name        text not null check (char_length(name) between 2 and 80),
  city        text not null check (char_length(city) between 2 and 80),
  more        text[] not null default '{}' check (cardinality(more) <= 10),
  region      text,
  description text not null default '' check (char_length(description) <= 1500),
  services    text[] not null default '{}' check (cardinality(services) <= 12),
  phone       text check (phone is null or char_length(phone) <= 30),
  email       text check (email is null or (char_length(email) <= 120 and email like '%_@_%._%')),
  site        text check (site is null or (char_length(site) <= 200 and site ~* '^https?://')),
  address     text check (address is null or char_length(address) <= 200),
  hours       text check (hours is null or char_length(hours) <= 200),
  status      text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_note  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists associations_status_city_idx on public.associations (status, city);

alter table public.associations enable row level security;

drop policy if exists "associations validées visibles" on public.associations;
create policy "associations validées visibles" on public.associations for select to anon, authenticated using (status = 'approved');
drop policy if exists "association voit sa fiche" on public.associations;
create policy "association voit sa fiche" on public.associations for select to authenticated using (owner = auth.uid());
drop policy if exists "admin voit les associations" on public.associations;
create policy "admin voit les associations" on public.associations for select to authenticated using (public.is_admin());

drop policy if exists "association crée sa fiche" on public.associations;
create policy "association crée sa fiche" on public.associations for insert to authenticated with check (owner = auth.uid());
drop policy if exists "association modifie sa fiche" on public.associations;
create policy "association modifie sa fiche" on public.associations for update to authenticated using (owner = auth.uid() or public.is_admin()) with check (owner = auth.uid() or public.is_admin());
drop policy if exists "association supprime sa fiche" on public.associations;
create policy "association supprime sa fiche" on public.associations for delete to authenticated using (owner = auth.uid() or public.is_admin());

-- Verrouille ce que l'association ne peut pas décider elle-même (statut, note, adresse web de la fiche, propriétaire).
create or replace function public.associations_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  if public.is_admin() then return new; end if;
  if tg_op = 'INSERT' then
    new.status := 'pending'; new.admin_note := null;
  else
    new.owner := old.owner; new.slug := old.slug; new.admin_note := old.admin_note;
    new.status := 'pending';              -- toute modification est revalidée
  end if;
  return new;
end $$;
drop trigger if exists associations_guard on public.associations;
create trigger associations_guard before insert or update on public.associations
  for each row execute function public.associations_guard();

-- Lecture publique : seules les colonnes utiles (pas de propriétaire, pas de note interne)
revoke select on public.associations from anon;
grant select (id, slug, name, city, more, region, description, services, phone, email, site, address, hours, status, created_at) on public.associations to anon;
