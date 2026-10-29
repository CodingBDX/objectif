-- ===== Adresse /fille/bordeaux/camille (option VIP) + slogan ===== a lancer UNE fois
-- friendly_url : la case cochee par l'escorte (conservee meme si elle repasse en standard)
-- url_slug     : son pseudo d'adresse, unique, reserve a vie (si la case est decochee, l'ancien lien redirige)
-- slogan       : courte phrase d'accroche (affichee seulement pour les VIP)
alter table public.profiles add column if not exists friendly_url boolean not null default false;
alter table public.profiles add column if not exists url_slug text;
alter table public.profiles add column if not exists slogan text;
alter table public.profiles drop constraint if exists profiles_slogan_len;
alter table public.profiles add constraint profiles_slogan_len check (slogan is null or char_length(slogan) <= 80);
create unique index if not exists profiles_url_slug_uniq on public.profiles (url_slug) where url_slug is not null;

-- l'escorte coche / ecrit son slogan ; url_slug n'est PAS modifiable par elle (rempli par le declencheur ci-dessous)
grant update (friendly_url, slogan) on public.profiles to authenticated;

create or replace function public.make_url_slug() returns trigger
language plpgsql security definer set search_path = public as $q$
declare
  base text; cand text; n int := 1;
begin
  if new.vip and new.friendly_url and new.url_slug is null then
    base := trim(both '-' from regexp_replace(
      translate(lower(new.name), 'àâäáãåçéèêëíìîïñóòôöõúùûüýÿ', 'aaaaaaceeeeiiiinooooouuuuyy'),
      '[^a-z0-9]+', '-', 'g'));
    if base is null or base = '' then base := 'profil'; end if;
    base := left(base, 40);
    cand := base;
    while exists (select 1 from public.profiles where url_slug = cand and id <> new.id) loop
      n := n + 1; cand := base || '-' || n;
    end loop;
    new.url_slug := cand;
  end if;
  return new;
end $q$;

drop trigger if exists profiles_make_url_slug on public.profiles;
create trigger profiles_make_url_slug before insert or update on public.profiles
for each row execute function public.make_url_slug();
