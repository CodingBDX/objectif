-- ===== VIP : le decompte s'arrete quand le profil est en pause (masque) ===== a lancer UNE fois
-- Bloc 1
alter table public.vip_until add column if not exists paused_at timestamptz;

-- Bloc 2 : trigger pause / reprise / fin du VIP
create or replace function public.vip_follow_pause() returns trigger
language plpgsql security definer set search_path = public as $q$
begin
  if new.paused is distinct from old.paused then
    if new.paused then
      update public.vip_until set paused_at = now() where profile_id = new.id and paused_at is null;
    else
      update public.vip_until set until = until + (now() - paused_at), paused_at = null where profile_id = new.id and paused_at is not null;
    end if;
  end if;
  if old.vip and not new.vip then
    delete from public.vip_until where profile_id = new.id;
  end if;
  return new;
end $q$;
drop trigger if exists vip_follow_pause on public.profiles;
create trigger vip_follow_pause after update of paused, vip on public.profiles for each row execute function public.vip_follow_pause();

-- Bloc 3 : expiration (ignore les profils en pause) + activation par l'admin
create or replace function public.expire_vip() returns int
language sql security definer set search_path = public as $q$
  with gone as (delete from public.vip_until where until < now() and paused_at is null returning profile_id),
       upd as (update public.profiles set vip = false where id in (select profile_id from gone) returning 1)
  select count(*)::int from upd
$q$;
revoke all on function public.expire_vip() from public, anon, authenticated;

create or replace function public.admin_set_vip(p_id uuid, p_days int)
returns void language plpgsql security definer set search_path = public as $q$
begin
  if not public.is_admin() then raise exception 'Acces reserve'; end if;
  update public.profiles set vip = true where id = p_id;
  if p_days is null or p_days <= 0 then
    delete from public.vip_until where profile_id = p_id;
  else
    insert into public.vip_until (profile_id, until, paused_at)
    values (p_id, now() + make_interval(days => p_days), case when (select paused from public.profiles where id = p_id) then now() end)
    on conflict (profile_id) do update set until = (case when public.vip_until.paused_at is not null then public.vip_until.until else greatest(public.vip_until.until, now()) end) + make_interval(days => p_days);
  end if;
end $q$;
revoke all on function public.admin_set_vip(uuid, int) from public, anon;
grant execute on function public.admin_set_vip(uuid, int) to authenticated;
