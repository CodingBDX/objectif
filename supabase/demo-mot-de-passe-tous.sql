-- ===== Meme mot de passe pour TOUS les faux comptes (@objectif.invalid : profils de Bordeaux, Camille Demo, etc.) =====
-- 1) Remplace  CHOISIS-UN-MOT-DE-PASSE-8+  par ton mot de passe (8 caracteres minimum), garde les guillemets simples.
-- 2) Lance. Connexion sur le site : email demo401@objectif.invalid ... demo440@objectif.invalid, demo901@objectif.invalid + ce mot de passe.
update auth.users
set encrypted_password = extensions.crypt('CHOISIS-UN-MOT-DE-PASSE-8+', extensions.gen_salt('bf')),
    email_confirmed_at = coalesce(email_confirmed_at, now())
where email like '%@objectif.invalid';

-- Verification : nombre de faux comptes prets (41 attendus si les 40 de Bordeaux + Camille sont la)
select count(1) as faux_comptes_prets from auth.users where email like '%@objectif.invalid' and encrypted_password <> '';
-- Liste (le nom du profil et l'email a utiliser pour se connecter)
select u.email, p.name, p.city from auth.users u join public.profiles p on p.id = u.id where u.email like '%@objectif.invalid' order by u.email;
