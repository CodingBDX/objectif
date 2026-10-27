-- ===== Administration ===== à lancer UNE fois dans le SQL Editor
create table if not exists public.admins (id uuid primary key references auth.users(id) on delete cascade);
alter table public.admins enable row level security;
drop policy if exists "chacun voit s'il est admin" on public.admins;
create policy "chacun voit s'il est admin" on public.admins for select to authenticated using (id = auth.uid());

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.admins where id = auth.uid()) $$;

-- Lecture / gestion réservées aux admins
drop policy if exists "admin voit tous les profils" on public.profiles;
create policy "admin voit tous les profils" on public.profiles for select to authenticated using (public.is_admin());
drop policy if exists "admin lit les signalements" on public.reports;
create policy "admin lit les signalements" on public.reports for select to authenticated using (public.is_admin());
drop policy if exists "admin traite les signalements" on public.reports;
create policy "admin traite les signalements" on public.reports for update to authenticated using (public.is_admin()) with check (public.is_admin());
alter table public.messages add column if not exists done boolean not null default false;
drop policy if exists "admin lit les messages" on public.messages;
create policy "admin lit les messages" on public.messages for select to authenticated using (public.is_admin());
drop policy if exists "admin traite les messages" on public.messages;
create policy "admin traite les messages" on public.messages for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Actions sur un profil (VIP, vérifié, masqué) : seul un admin peut les appeler
create or replace function public.admin_set_profile(p_id uuid, p_vip boolean, p_verified boolean, p_paused boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Accès réservé'; end if;
  update public.profiles set vip = p_vip, verified = p_verified, paused = p_paused where id = p_id;
end $$;
create or replace function public.admin_delete_profile(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Accès réservé'; end if;
  delete from public.profiles where id = p_id;
end $$;
revoke all on function public.admin_set_profile(uuid, boolean, boolean, boolean) from public, anon;
revoke all on function public.admin_delete_profile(uuid) from public, anon;
grant execute on function public.admin_set_profile(uuid, boolean, boolean, boolean) to authenticated;
grant execute on function public.admin_delete_profile(uuid) to authenticated;

-- TON COMPTE : remplace l'e-mail par celui avec lequel tu te connectes au site, puis lance :
-- insert into public.admins (id) select id from auth.users where email = 'ton-email@exemple.fr';
