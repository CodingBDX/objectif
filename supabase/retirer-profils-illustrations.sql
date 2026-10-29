-- ===== Supprime les profils qui utilisent les illustrations du site (/api/demo/...) =====
-- Ce sont uniquement des profils fictifs : aucune vraie photo ne contient /api/demo/.

-- 1) Apercu : ce qui va etre supprime
select p.name as pseudo, p.city as ville, u.email, cardinality(p.photos) as nb_photos
from public.profiles p join auth.users u on u.id = p.id
where exists (select 1 from unnest(p.photos) x where x like '/api/demo/%')
order by p.city, p.name;

-- 2) Suppression (profil, telephone, favoris, stats partent avec le compte)
delete from auth.users
where id in (select id from public.profiles p where exists (select 1 from unnest(p.photos) x where x like '/api/demo/%'));

-- 3) Controle : doit renvoyer 0
select count(1) as restants from public.profiles p where exists (select 1 from unnest(p.photos) x where x like '/api/demo/%');
