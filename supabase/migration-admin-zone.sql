-- ===== Admin : masquer / reafficher la carte de zone d'un profil de rue ===== a lancer UNE fois (relancable)
create or replace function public.admin_set_zone_map(p_id uuid, p_on boolean) returns void
language plpgsql security definer set search_path = public as $q$
begin
  if not public.is_admin() then raise exception 'Accès réservé'; end if;
  update public.profiles set zone_map = p_on where id = p_id;
end $q$;
revoke all on function public.admin_set_zone_map(uuid, boolean) from public;
grant execute on function public.admin_set_zone_map(uuid, boolean) to authenticated;
