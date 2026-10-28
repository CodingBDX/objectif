-- ===== Specialites modifiables depuis l'admin (renommer, ajouter, supprimer, ordre) ===== a lancer UNE fois
create table if not exists public.specialties (
  name text primary key check (char_length(name) between 1 and 40),
  position int not null default 0
);
alter table public.specialties enable row level security;
drop policy if exists specialites_lecture on public.specialties;
create policy specialites_lecture on public.specialties for select to anon, authenticated using (true);
-- aucune policy d'ecriture : on ne modifie que par les fonctions admin ci-dessous

-- Liste de depart (celle du site actuellement)
insert into public.specialties (name, position)
select x, o from unnest(array['Girlfriend experience','Accompagnement','Dîner','Soirée','Week-end','Voyage','Massage','Massage tantrique','Relaxation','Sensuel','Câlin','Duo','Couple','Rôle play','Lingerie','Tenues sur demande','Strip-tease','Danse','Glamour','Élégante','Naturelle','Discrète','Complice','Fétichisme','Domination','Soumission','Pieds','Livecam','Sortie culturelle','Langues & conversation']) with ordinality as t(x, o)
on conflict (name) do nothing;

-- Renommer : change le mot partout, y compris dans les profils qui l'avaient coche
create or replace function public.admin_rename_specialty(p_old text, p_new text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Acces reserve'; end if;
  p_new := btrim(p_new);
  if p_new = '' or char_length(p_new) > 40 then raise exception 'Nom invalide (1 a 40 caracteres)'; end if;
  if p_new = p_old then return; end if;
  if exists (select 1 from public.specialties where lower(name) = lower(p_new) and name <> p_old) then raise exception 'Cette specialite existe deja'; end if;
  update public.specialties set name = p_new where name = p_old;
  update public.profiles set specialties = array_replace(specialties, p_old, p_new) where p_old = any(specialties);
  begin
    insert into public.audit_log (action, details) values ('specialite renommee', jsonb_build_object('nom', p_old || ' -> ' || p_new));
  exception when undefined_table then null; end;
end $$;

-- Ajouter (en fin de liste)
create or replace function public.admin_add_specialty(p_name text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Acces reserve'; end if;
  p_name := btrim(p_name);
  if p_name = '' or char_length(p_name) > 40 then raise exception 'Nom invalide (1 a 40 caracteres)'; end if;
  if exists (select 1 from public.specialties where lower(name) = lower(p_name)) then raise exception 'Cette specialite existe deja'; end if;
  insert into public.specialties (name, position) values (p_name, coalesce((select max(position) from public.specialties), 0) + 1);
  begin
    insert into public.audit_log (action, details) values ('specialite ajoutee', jsonb_build_object('nom', p_name));
  exception when undefined_table then null; end;
end $$;

-- Supprimer : retire aussi le mot des profils
create or replace function public.admin_delete_specialty(p_name text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Acces reserve'; end if;
  delete from public.specialties where name = p_name;
  update public.profiles set specialties = array_remove(specialties, p_name) where p_name = any(specialties);
  begin
    insert into public.audit_log (action, details) values ('specialite supprimee', jsonb_build_object('nom', p_name));
  exception when undefined_table then null; end;
end $$;

-- Monter / descendre dans la liste (echange avec la voisine)
create or replace function public.admin_move_specialty(p_name text, p_dir int)
returns void language plpgsql security definer set search_path = public as $$
declare i int; j int; other text;
begin
  if not public.is_admin() then raise exception 'Acces reserve'; end if;
  -- renumerote 1, 2, 3... puis echange avec la voisine
  update public.specialties s set position = r.n from (select name, row_number() over (order by position, name) as n from public.specialties) r where s.name = r.name;
  select position into i from public.specialties where name = p_name;
  if i is null then return; end if;
  j := i + case when p_dir < 0 then -1 else 1 end;
  select name into other from public.specialties where position = j;
  if other is null then return; end if;
  update public.specialties set position = i where name = other;
  update public.specialties set position = j where name = p_name;
end $$;

revoke all on function public.admin_rename_specialty(text, text) from public, anon;
revoke all on function public.admin_add_specialty(text) from public, anon;
revoke all on function public.admin_delete_specialty(text) from public, anon;
revoke all on function public.admin_move_specialty(text, int) from public, anon;
grant execute on function public.admin_rename_specialty(text, text) to authenticated;
grant execute on function public.admin_add_specialty(text) to authenticated;
grant execute on function public.admin_delete_specialty(text) to authenticated;
grant execute on function public.admin_move_specialty(text, int) to authenticated;
