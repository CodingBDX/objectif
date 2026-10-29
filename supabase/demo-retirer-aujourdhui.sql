-- ===== Supprime les FAUX comptes (@objectif.invalid) crees AUJOURD'HUI (heure de Paris). Les vrais comptes ne sont jamais touches. =====

-- 1) Apercu : ce qui va etre supprime (lance d'abord seulement cette requete si tu veux verifier)
select u.email, p.name, p.city, u.created_at
from auth.users u left join public.profiles p on p.id = u.id
where u.email like '%@objectif.invalid'
  and (u.created_at at time zone 'Europe/Paris')::date = (now() at time zone 'Europe/Paris')::date
order by u.created_at;

-- 2) Suppression (le profil, le telephone, les photos de la base, favoris et stats partent avec le compte)
delete from auth.users
where email like '%@objectif.invalid'
  and (created_at at time zone 'Europe/Paris')::date = (now() at time zone 'Europe/Paris')::date;

-- 3) Controle : doit renvoyer 0
select count(1) as restants_aujourdhui from auth.users
where email like '%@objectif.invalid'
  and (created_at at time zone 'Europe/Paris')::date = (now() at time zone 'Europe/Paris')::date;
