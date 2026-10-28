-- ===== DEMO 1/5 : supprime les profils et associations D'EXEMPLE (jamais les vrais comptes) =====
-- Les profils d'exemple sont les comptes demo...@objectif.invalid ; leurs logements, stats et favoris partent avec eux.
delete from auth.users where email like 'demo%@objectif.invalid';
-- Les associations d'exemple ont un identifiant qui commence par demo- ; la liste officielle (STRASS, Cabiria...) n'est pas touchee.
delete from public.associations where slug like 'demo-%';
