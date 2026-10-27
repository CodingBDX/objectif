-- ===== Limites : 10 photos / 3 villes supplémentaires (profil normal), 20 photos / 6 villes (VIP) ===== à lancer UNE fois
alter table public.profiles drop constraint if exists profiles_photos_check;
alter table public.profiles drop constraint if exists profiles_more_check;
create or replace function public.profiles_limits() returns trigger language plpgsql as $$
begin
  if cardinality(new.photos) > case when new.vip then 20 else 10 end then
    raise exception 'Maximum % photos', case when new.vip then 20 else 10 end;
  end if;
  if cardinality(new.more) > case when new.vip then 6 else 3 end then
    raise exception 'Maximum % villes supplémentaires', case when new.vip then 6 else 3 end;
  end if;
  return new;
end $$;
drop trigger if exists profiles_limits on public.profiles;
create trigger profiles_limits before insert or update on public.profiles for each row execute function public.profiles_limits();
