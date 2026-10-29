-- ===== Escorte de rue : zone (quartier) + creneaux. A lancer UNE fois. =====
-- On ne stocke QUE le nom du quartier (jamais de coordonnees precises).
alter table public.profiles add column if not exists street boolean not null default false;
alter table public.profiles add column if not exists zone text;
alter table public.profiles add column if not exists zone_map boolean not null default false;
alter table public.profiles add column if not exists street_hours text;
-- Le site n'autorise la modification que de certaines colonnes (droits par colonne) : on ajoute celles-ci.
grant update (street, zone, zone_map, street_hours) on public.profiles to authenticated;

-- Garde-fous : longueur limitee, et la carte n'est jamais active sans zone.
create or replace function public.zone_guard() returns trigger
language plpgsql set search_path = public as $q$
begin
  if new.zone is not null then new.zone := left(btrim(new.zone), 40); end if;
  if new.street_hours is not null then new.street_hours := left(btrim(new.street_hours), 40); end if;
  if new.zone is null or new.zone = '' then new.zone_map := false; end if;
  if not new.street then new.zone_map := false; end if;
  return new;
end $q$;
drop trigger if exists profiles_zone_guard on public.profiles;
create trigger profiles_zone_guard before insert or update on public.profiles
for each row execute function public.zone_guard();

-- Pour masquer la carte d'un profil (moderation) :
--   update public.profiles set zone_map = false where id = '<id du profil>';
