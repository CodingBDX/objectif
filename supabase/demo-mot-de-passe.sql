-- ===== Se connecter a un FAUX profil (les faux comptes n'ont pas de mot de passe) =====
-- 1) Remplace  CHOISIS-UN-MOT-DE-PASSE-8+  par ton mot de passe (8 caracteres minimum), garde les guillemets simples.
-- 2) Change l'email si tu veux un autre faux profil : demo401@objectif.invalid ... demo440@objectif.invalid, demo901@objectif.invalid (Camille Demo)
-- 3) Sur le site : Se connecter -> email + ce mot de passe.
update auth.users
set encrypted_password = extensions.crypt('CHOISIS-UN-MOT-DE-PASSE-8+', extensions.gen_salt('bf')),
    email_confirmed_at = coalesce(email_confirmed_at, now())
where email = 'demo901@objectif.invalid';

-- Verification : doit renvoyer 1 ligne
select id, email, email_confirmed_at is not null as confirme from auth.users where email = 'demo901@objectif.invalid';
