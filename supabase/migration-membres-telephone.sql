-- ===== Profils membres : numero de telephone obligatoire + commentaires marques si le numero est signale =====
-- On ne stocke JAMAIS le numero en clair : uniquement son empreinte (la meme que celle des clients signales).
-- A lancer APRES migration-clients-signales.sql.
alter table public.members add column if not exists phone_hash text;
create unique index if not exists members_phone_hash on public.members (phone_hash) where phone_hash is not null;

-- Les membres ne s inscrivent plus qu avec leur numero (par la fonction ci-dessous)
drop policy if exists "créer son profil membre" on public.members;
revoke insert on public.members from authenticated;

create or replace function public.register_member(p_pseudo text, p_phone text) returns void
language plpgsql security definer set search_path = public as $$
declare h text;
begin
  if auth.uid() is null then raise exception 'Connecte-toi'; end if;
  if length(trim(coalesce(p_pseudo, ''))) < 2 or length(trim(p_pseudo)) > 30 then raise exception 'Pseudo invalide (2 à 30 caractères).'; end if;
  begin h := private.phone_hash(p_phone); exception when others then raise exception 'Numéro de téléphone invalide.'; end;
  if exists (select 1 from public.members where phone_hash = h and id <> auth.uid()) then raise exception 'Ce numéro est déjà utilisé par un autre profil membre.'; end if;
  insert into public.members (id, pseudo, phone_hash) values (auth.uid(), trim(p_pseudo), h)
  on conflict (id) do update set phone_hash = excluded.phone_hash;
end $$;

-- Pour les membres deja inscrits sans numero
create or replace function public.set_member_phone(p_phone text) returns void
language plpgsql security definer set search_path = public as $$
declare h text;
begin
  if not exists (select 1 from public.members where id = auth.uid()) then raise exception 'Réservé aux profils membres'; end if;
  begin h := private.phone_hash(p_phone); exception when others then raise exception 'Numéro de téléphone invalide.'; end;
  if exists (select 1 from public.members where phone_hash = h and id <> auth.uid()) then raise exception 'Ce numéro est déjà utilisé par un autre profil membre.'; end if;
  update public.members set phone_hash = h where id = auth.uid();
end $$;

-- Un membre ne peut commenter que s il a donne son numero (les profils escortes restent libres de commenter)
drop policy if exists "commenter" on public.comments;
create policy "commenter" on public.comments for insert to authenticated with check (
  author_id = auth.uid()
  and (exists (select 1 from public.profiles where id = auth.uid())
       or exists (select 1 from public.members where id = auth.uid() and phone_hash is not null)));

-- Quels auteurs de commentaires ont un numero signale ? (ne renvoie que l id et le nombre, jamais le numero)
create or replace function public.flagged_authors(p_ids uuid[]) returns table(author_id uuid, signalements int)
language sql stable security definer set search_path = public as $$
  select m.id, count(distinct r.reporter_id)::int
  from public.members m
  join public.client_reports r on r.phone_hash = m.phone_hash and r.reporter_id <> m.id
  where m.id = any(p_ids)
  group by m.id;
$$;

revoke all on function public.register_member(text, text), public.set_member_phone(text) from public, anon;
grant execute on function public.register_member(text, text), public.set_member_phone(text) to authenticated;
revoke all on function public.flagged_authors(uuid[]) from public;
grant execute on function public.flagged_authors(uuid[]) to anon, authenticated;
