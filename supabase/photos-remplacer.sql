-- ===== Profils sans images : remplacement par les illustrations du site (sans vraie personne) =====

-- 1/3 : FAUX profils (@objectif.invalid) dont les photos ne sont ni du site ni des illustrations -> 5 illustrations
update public.profiles p
set photos = array(
  select '/api/demo/' || (abs(hashtext(p.id::text)) % 900 + 100) || '-' || n
  from generate_series(0, 4) n
)
where p.id in (select id from auth.users where email like '%@objectif.invalid')
  and (cardinality(p.photos) < 3
       or exists (select 1 from unnest(p.photos) u
                  where u not like '/api/demo/%' and u not like '%/storage/v1/object/public/media/%'));

-- 2/3 : VRAIS profils ayant des photos hebergees ailleurs (liste seulement, rien n'est modifie)
select p.name, p.city, split_part(u, '/', 3) as site, u as lien, p.id
from public.profiles p, unnest(p.photos) u
where p.id not in (select id from auth.users where email like '%@objectif.invalid')
  and u not like '/api/demo/%' and u not like '%/storage/v1/object/public/media/%'
order by site, p.name;

-- 3/3 : controle -> nombre de faux profils encore sans bonnes photos (doit etre 0)
select count(1) as faux_sans_images
from public.profiles p
where p.id in (select id from auth.users where email like '%@objectif.invalid')
  and (cardinality(p.photos) < 3
       or exists (select 1 from unnest(p.photos) u
                  where u not like '/api/demo/%' and u not like '%/storage/v1/object/public/media/%'));
