-- ===== Telephone (8 chiffres min) et 3 photos minimum obligatoires, verifies par la base =====
-- Ne s applique qu aux ecritures faites depuis le site (utilisateur connecte). Le SQL Editor et les scripts admin ne sont pas bloques.
-- Sur une mise a jour, la regle ne joue que si le telephone ou les photos changent : les profils existants incomplets
-- ne sont pas bloques pour une pause, un VIP, etc.
create or replace function public.check_profil_complet() returns trigger
language plpgsql as $$
begin
  if auth.uid() is null then return new; end if;
  if tg_op = 'INSERT' or new.phone is distinct from old.phone or new.photos is distinct from old.photos then
    if length(regexp_replace(coalesce(new.phone, ''), '\D', '', 'g')) < 8 then
      raise exception 'Numéro de téléphone obligatoire.';
    end if;
    if cardinality(new.photos) < 3 then
      raise exception 'Au moins 3 photos sont obligatoires.';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists profil_complet on public.profiles;
create trigger profil_complet before insert or update on public.profiles
for each row execute function public.check_profil_complet();
