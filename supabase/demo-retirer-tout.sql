-- Retire TOUS les faux profils / faux membres / fausses associations (jamais les vrais comptes).
-- Les faux comptes ont une adresse en @objectif.invalid (domaine qui ne peut pas exister) :
-- profils, telephones, logements, stats, favoris et commentaires partent avec eux.
delete from auth.users where email like '%@objectif.invalid';
-- Fausses associations (identifiant demo-...) ; la liste officielle n'est pas touchee.
delete from public.associations where slug like 'demo-%';
-- Verification : doit renvoyer 0 et 0
select (select count(1) from auth.users where email like '%@objectif.invalid') as faux_comptes,
       (select count(1) from public.associations where slug like 'demo-%') as fausses_assos;
