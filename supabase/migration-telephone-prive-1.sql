-- ===== Telephone des profils : plus lisible directement, affiche seulement apres un clic limite par visiteur =====
-- ETAPE 1 (sans risque) : cree la table privee, copie les numeros existants, ajoute les fonctions. Le site actuel continue de marcher.
-- ETAPE 2 (migration-telephone-prive-2.sql) : a lancer APRES le deploiement du nouveau site, supprime l ancienne colonne publique.
create table if not exists public.profile_phones (
  profile_id uuid primary key references auth.users(id) on delete cascade,
  phone text not null check (length(regexp_replace(phone, '\D', '', 'g')) between 8 and 15)
);
create table if not exists public.phone_reveals (
  id bigint generated always as identity primary key,
  k text not null,
  ip text not null,
  at timestamptz not null default now()
);
create index if not exists phone_reveals_k on public.phone_reveals (k, at);
create index if not exists phone_reveals_ip on public.phone_reveals (ip, at);
alter table public.profile_phones enable row level security;
alter table public.phone_reveals enable row level security;
revoke all on public.profile_phones, public.phone_reveals from anon, authenticated;
grant select on public.profile_phones to authenticated;
drop policy if exists phones_own on public.profile_phones;
create policy phones_own on public.profile_phones for select to authenticated using (profile_id = auth.uid() or public.is_admin());

-- Copie des numeros existants
insert into public.profile_phones (profile_id, phone)
select id, phone from public.profiles
where phone is not null and length(regexp_replace(phone, '\D', '', 'g')) between 8 and 15
on conflict (profile_id) do nothing;

-- Enregistrer son numero (le profil ne le stocke plus)
create or replace function public.set_my_phone(p_phone text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Connecte-toi'; end if;
  if length(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')) < 8 or length(p_phone) > 20 then raise exception 'Numéro de téléphone obligatoire.'; end if;
  insert into public.profile_phones (profile_id, phone) values (auth.uid(), trim(p_phone))
  on conflict (profile_id) do update set phone = excluded.phone;
end $$;

-- Afficher le numero d un profil : limite par visiteur (12/heure sans compte, 30/heure connecte) et par adresse IP (40/heure)
create or replace function public.reveal_phone(p_id uuid) returns text
language plpgsql security definer set search_path = public as $$
declare ip text; me uuid := auth.uid(); key text; lim int; n int; ph text;
begin
  if me is not null and me = p_id then
    select phone into ph from public.profile_phones where profile_id = p_id; return ph;
  end if;
  if not exists (select 1 from public.profiles where id = p_id and paused = false) then return null; end if;
  begin ip := split_part(coalesce((current_setting('request.headers', true)::json)->>'x-forwarded-for', 'inconnue'), ',', 1); exception when others then ip := 'inconnue'; end;
  ip := trim(ip);
  key := coalesce(me::text, ip); lim := case when me is null then 12 else 30 end;
  select count(*) into n from public.phone_reveals r where r.k = key and r.at > now() - interval '1 hour';
  if n >= lim then raise exception 'Trop de demandes. Réessaie dans un moment.'; end if;
  select count(*) into n from public.phone_reveals r where r.ip = reveal_phone.ip and r.at > now() - interval '1 hour';
  if n >= 40 then raise exception 'Trop de demandes. Réessaie dans un moment.'; end if;
  insert into public.phone_reveals (k, ip) values (key, ip);
  if random() < 0.02 then delete from public.phone_reveals where at < now() - interval '2 days'; end if;
  select phone into ph from public.profile_phones where profile_id = p_id;
  return ph;
end $$;

-- La verification "profil complet" lit le numero ou dans la nouvelle table ou dans l ancienne colonne (compatible avant et apres l etape 2)
create or replace function public.check_profil_complet() returns trigger
language plpgsql as $$
declare ok boolean;
begin
  if auth.uid() is null then return new; end if;
  if tg_op = 'INSERT' or new.photos is distinct from old.photos then
    if cardinality(new.photos) < 3 then raise exception 'Au moins 3 photos sont obligatoires.'; end if;
  end if;
  if tg_op = 'INSERT' then
    select exists (select 1 from public.profile_phones where profile_id = new.id) or length(regexp_replace(coalesce(to_jsonb(new)->>'phone', ''), '\D', '', 'g')) >= 8 into ok;
    if not ok then raise exception 'Numéro de téléphone obligatoire.'; end if;
  end if;
  return new;
end $$;

revoke all on function public.set_my_phone(text), public.reveal_phone(uuid) from public;
grant execute on function public.set_my_phone(text) to authenticated;
grant execute on function public.reveal_phone(uuid) to anon, authenticated;
