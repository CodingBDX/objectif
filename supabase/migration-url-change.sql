-- ===== Changer son adresse VIP quand on change de pseudo ===== a lancer UNE fois (apres migration-url-vip.sql)
-- L'ancienne adresse est gardee (redirection) et reste reservee. 1 changement max par 30 jours.
alter table public.profiles add column if not exists url_slug_at timestamptz;

create table if not exists public.profile_old_slugs (
  slug text primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.profile_old_slugs enable row level security;
drop policy if exists old_slugs_read on public.profile_old_slugs;
create policy old_slugs_read on public.profile_old_slugs for select using (true);

-- la creation initiale tient aussi compte des anciennes adresses reservees
create or replace function public.make_url_slug() returns trigger
language plpgsql security definer set search_path = public as $q$
declare base text; cand text; n int := 0;
begin
  if new.vip and new.friendly_url and new.url_slug is null then
    base := trim(both '-' from regexp_replace(
      translate(lower(new.name), 'àâäáãåçéèêëíìîïñóòôöõúùûüýÿ', 'aaaaaaceeeeiiiinooooouuuuyy'),
      '[^a-z0-9]+', '-', 'g'));
    if base is null or base = '' then base := 'profil'; end if;
    base := left(base, 40); cand := base;
    while exists (select 1 from public.profiles where url_slug = cand and id <> new.id)
       or exists (select 1 from public.profile_old_slugs where slug = cand and profile_id <> new.id) loop
      n := n + 1; cand := base || '-' || n;
    end loop;
    new.url_slug := cand;
  end if;
  return new;
end $q$;

-- appelee par l'escorte : recalcule son adresse depuis son pseudo enregistre
create or replace function public.change_url_slug() returns text
language plpgsql security definer set search_path = public as $q$
declare p public.profiles; base text; cand text; n int := 0;
begin
  select * into p from public.profiles where id = auth.uid();
  if p.id is null or not p.vip or not p.friendly_url or p.url_slug is null then raise exception 'non_eligible'; end if;
  if p.url_slug_at is not null and p.url_slug_at > now() - interval '30 days' then raise exception 'trop_tot'; end if;
  base := trim(both '-' from regexp_replace(
    translate(lower(p.name), 'àâäáãåçéèêëíìîïñóòôöõúùûüýÿ', 'aaaaaaceeeeiiiinooooouuuuyy'),
    '[^a-z0-9]+', '-', 'g'));
  if base is null or base = '' then base := 'profil'; end if;
  base := left(base, 40); cand := base;
  while cand <> p.url_slug and (exists (select 1 from public.profiles where url_slug = cand and id <> p.id)
     or exists (select 1 from public.profile_old_slugs where slug = cand and profile_id <> p.id)) loop
    n := n + 1; cand := base || '-' || n;
  end loop;
  if cand = p.url_slug then return cand; end if;
  insert into public.profile_old_slugs(slug, profile_id) values (p.url_slug, p.id) on conflict do nothing;
  delete from public.profile_old_slugs where slug = cand and profile_id = p.id;
  update public.profiles set url_slug = cand, url_slug_at = now() where id = p.id;
  return cand;
end $q$;
revoke all on function public.change_url_slug() from public;
grant execute on function public.change_url_slug() to authenticated;
