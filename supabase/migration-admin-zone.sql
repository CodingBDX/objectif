-- ===== Admin : bloquer / debloquer la carte de zone d'un profil de rue ===== a lancer UNE fois (relancable)
-- zone_map_blocked : decision de l'admin, l'escorte ne peut PAS la modifier (pas dans ses droits d'ecriture)
alter table public.profiles add column if not exists zone_map_blocked boolean not null default false;

create or replace function public.admin_block_zone_map(p_id uuid, p_blocked boolean) returns void
language plpgsql security definer set search_path = public as $q$
begin
  if not public.is_admin() then raise exception 'Accès réservé'; end if;
  update public.profiles set zone_map_blocked = p_blocked where id = p_id;
end $q$;
revoke all on function public.admin_block_zone_map(uuid, boolean) from public;
grant execute on function public.admin_block_zone_map(uuid, boolean) to authenticated;
drop function if exists public.admin_set_zone_map(uuid, boolean);
