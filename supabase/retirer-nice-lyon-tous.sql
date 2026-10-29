-- ===== Supprimer TOUS les comptes dont la ville de base est Nice ou Lyon (faux ET vrais) =====
-- IRREVERSIBLE pour les comptes de connexion. Une copie des lignes de profil est gardee dans la table profiles_supprimes_nice_lyon (au cas ou).

-- 1) Apercu : tous les comptes concernes
select p.name as pseudo, p.city as ville, u.email,
       (u.email like '%@objectif.invalid') as faux_compte,
       u.created_at at time zone 'Europe/Paris' as cree_le
from public.profiles p join auth.users u on u.id = p.id
where lower(p.city) in ('nice', 'lyon')
order by faux_compte desc, p.city, p.name;

-- 2) Copie de securite des profils (a garder au moins quelques jours)
create table if not exists public.profiles_supprimes_nice_lyon as
select p.*, u.email as email_compte, now() as supprime_le
from public.profiles p join auth.users u on u.id = p.id
where lower(p.city) in ('nice', 'lyon');
alter table public.profiles_supprimes_nice_lyon enable row level security; -- aucune policy : invisible depuis le site

-- 3) Suppression des comptes (profil, telephone, favoris, stats partent avec)
delete from auth.users
where id in (select id from public.profiles where lower(city) in ('nice', 'lyon'));

-- 4) Controle : doit renvoyer 0
select count(1) as restants from public.profiles where lower(city) in ('nice', 'lyon');
