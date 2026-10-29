-- ===== Acceder aux 30 profils crees aujourd'hui : un meme mot de passe pour les comptes SANS mot de passe =====
-- Ne touche QUE les comptes crees aujourd'hui (heure de Paris) qui n'ont pas de mot de passe. Les inscriptions reelles (qui ont un mot de passe) ne sont jamais modifiees.

-- 1) Apercu : les comptes concernes, avec l'email a utiliser pour se connecter
select u.email, p.name, p.city, u.created_at
from auth.users u left join public.profiles p on p.id = u.id
where (u.created_at at time zone 'Europe/Paris')::date = (now() at time zone 'Europe/Paris')::date
  and coalesce(u.encrypted_password, '') = ''
order by u.created_at;

-- 2) Mot de passe commun : remplace CHOISIS-UN-MOT-DE-PASSE-8+ (8 caracteres minimum, garde les guillemets simples)
update auth.users
set encrypted_password = extensions.crypt('CHOISIS-UN-MOT-DE-PASSE-8+', extensions.gen_salt('bf')),
    email_confirmed_at = coalesce(email_confirmed_at, now())
where (created_at at time zone 'Europe/Paris')::date = (now() at time zone 'Europe/Paris')::date
  and coalesce(encrypted_password, '') = '';

-- 3) Controle : nombre de comptes d'aujourd'hui maintenant utilisables, et leurs emails
select count(1) as comptes_prets from auth.users
where (created_at at time zone 'Europe/Paris')::date = (now() at time zone 'Europe/Paris')::date and encrypted_password <> '';
