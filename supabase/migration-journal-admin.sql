-- ===== Journal des actions admin + suppression récupérable ===== à lancer UNE fois
create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  admin_id uuid default auth.uid(),
  action text not null,
  profile_id uuid,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists audit_log_date on public.audit_log (created_at desc);
create index if not exists audit_log_profile on public.audit_log (profile_id, created_at desc);
alter table public.audit_log enable row level security;
drop policy if exists "journal: admin" on public.audit_log;
create policy "journal: admin" on public.audit_log for select to authenticated using (public.is_admin());
-- aucune policy d'écriture : on n'écrit que par les fonctions ci-dessous

-- Même fonction qu'avant (VIP / vérifié / masqué), qui note maintenant ce qui a changé
create or replace function public.admin_set_profile(p_id uuid, p_vip boolean, p_verified boolean, p_paused boolean)
returns void language plpgsql security definer set search_path = public as $$
declare old record;
begin
  if not public.is_admin() then raise exception 'Accès réservé'; end if;
  select vip, verified, paused, name into old from public.profiles where id = p_id;
  update public.profiles set vip = p_vip, verified = p_verified, paused = p_paused where id = p_id;
  insert into public.audit_log (action, profile_id, details)
  values ('modification', p_id, jsonb_build_object('nom', old.name,
    'avant', jsonb_build_object('vip', old.vip, 'verifie', old.verified, 'masque', old.paused),
    'apres', jsonb_build_object('vip', p_vip, 'verifie', p_verified, 'masque', p_paused)));
end $$;

-- Suppression : on garde une copie complète du profil dans le journal (récupérable)
create or replace function public.admin_delete_profile(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Accès réservé'; end if;
  insert into public.audit_log (action, profile_id, details)
  select 'suppression', id, to_jsonb(p) from public.profiles p where id = p_id;
  delete from public.profiles where id = p_id;
end $$;

-- Récupération d'un profil supprimé (le compte de connexion existe toujours) : select public.admin_restore_profile(<id du journal>);
create or replace function public.admin_restore_profile(p_log bigint)
returns void language plpgsql security definer set search_path = public as $$
declare snap jsonb; pid uuid;
begin
  if not public.is_admin() then raise exception 'Accès réservé'; end if;
  select details, profile_id into snap, pid from public.audit_log where id = p_log and action = 'suppression';
  if snap is null then raise exception 'Entrée introuvable'; end if;
  if exists (select 1 from public.profiles where id = pid) then raise exception 'Ce profil existe déjà'; end if;
  insert into public.profiles select * from jsonb_populate_record(null::public.profiles, snap);
  insert into public.audit_log (action, profile_id, details) values ('restauration', pid, jsonb_build_object('depuis', p_log));
end $$;

revoke all on function public.admin_set_profile(uuid, boolean, boolean, boolean), public.admin_delete_profile(uuid), public.admin_restore_profile(bigint) from public, anon;
grant execute on function public.admin_set_profile(uuid, boolean, boolean, boolean), public.admin_delete_profile(uuid), public.admin_restore_profile(bigint) to authenticated;

-- Voir le journal :  select created_at, action, coalesce(details->>'nom', details->>'name') as nom, profile_id from public.audit_log order by id desc limit 50;
