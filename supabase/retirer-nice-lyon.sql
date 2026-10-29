-- ===== Retirer les profils de Nice et de Lyon =====
-- Concerne : les FAUX comptes (@objectif.invalid) + les comptes crees AUJOURD'HUI qui ne se sont jamais connectes (profils crees par SQL).
-- Les vrais profils de Nice / Lyon (inscrits par eux-memes) ne sont PAS supprimes : ils sont seulement listes a l'etape 3.

-- 1) Apercu : ce qui va etre supprime
select u.email, p.name as pseudo, p.city as ville, u.created_at at time zone 'Europe/Paris' as cree_le
from auth.users u join public.profiles p on p.id = u.id
where lower(p.city) in ('nice', 'lyon')
  and ( u.email like '%@objectif.invalid'
        or ((u.created_at at time zone 'Europe/Paris')::date = (now() at time zone 'Europe/Paris')::date and u.last_sign_in_at is null) )
order by p.city, p.name;

-- 2) Suppression (le profil, le telephone, les favoris et les stats partent avec le compte)
delete from auth.users u
using public.profiles p
where p.id = u.id
  and lower(p.city) in ('nice', 'lyon')
  and ( u.email like '%@objectif.invalid'
        or ((u.created_at at time zone 'Europe/Paris')::date = (now() at time zone 'Europe/Paris')::date and u.last_sign_in_at is null) );

-- 3) Ce qui reste a Nice / Lyon (vrais profils, intacts)
select p.name as pseudo, p.city as ville, u.email, u.created_at at time zone 'Europe/Paris' as cree_le
from public.profiles p join auth.users u on u.id = p.id
where lower(p.city) in ('nice', 'lyon') order by p.city, p.name;
