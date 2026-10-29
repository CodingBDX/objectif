-- ===== OFFRE : 1 mois de VIP offert aux escortes qui s'inscrivent avant une date =====
-- Prerequis : migration-vip-expiration.sql deja lancee (table vip_until + retour automatique en standard).
-- Le VIP des FAUX profils (@objectif.invalid) n'est pas touche.

-- 1) AUTOMATIQUE : tout nouveau profil cree jusqu'a la date limite recoit 30 jours de VIP.
--    Change la date ci-dessous (ici : 7 jours a partir de maintenant, au moment ou tu lances le script).
create or replace function public.offre_vip_bienvenue() returns trigger
language plpgsql security definer set search_path = public as $q$
declare fin constant timestamptz := timestamptz '2026-11-05 23:59:59+01';   -- <== date limite de l'offre
begin
  if now() <= fin and not new.vip then
    update public.profiles set vip = true where id = new.id;
    insert into public.vip_until (profile_id, until) values (new.id, now() + interval '30 days')
    on conflict (profile_id) do nothing;
  end if;
  return null;
end $q$;
drop trigger if exists profiles_offre_vip on public.profiles;
create trigger profiles_offre_vip after insert on public.profiles
for each row execute function public.offre_vip_bienvenue();

-- 2) A LA MAIN : offrir 30 jours a une escorte deja inscrite (remplace PSEUDO)
--    update public.profiles set vip = true where name = 'PSEUDO';
--    insert into public.vip_until (profile_id, until) select id, now() + interval '30 days' from public.profiles where name = 'PSEUDO'
--    on conflict (profile_id) do update set until = greatest(public.vip_until.until, now()) + interval '30 days';

-- 3) Verifier qui a l'offre et jusqu'a quand
select p.name as pseudo, p.city as ville, v.until as vip_jusquau
from public.vip_until v join public.profiles p on p.id = v.profile_id order by v.until;

-- 4) Arreter l'offre quand tu veux (les VIP deja donnes restent jusqu'a leur date) :
--    drop trigger if exists profiles_offre_vip on public.profiles;
