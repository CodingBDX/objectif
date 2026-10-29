-- Retire seulement les 40 faux profils de Bordeaux (comptes demo401 a demo440). Les vrais comptes ne sont pas touches.
delete from auth.users where email in (select 'demo' || g || '@objectif.invalid' from generate_series(401, 440) g);
-- Verification : doit renvoyer 0
select count(1) as restants from auth.users where email in (select 'demo' || g || '@objectif.invalid' from generate_series(401, 440) g);
