-- ===== Reparer la connexion des comptes crees par SQL (faux profils, profils importes) =====
-- Un compte insere directement en SQL manque de petites valeurs que le systeme de connexion attend : le mot de passe est bon mais la connexion echoue.
-- Ce fichier complete ces valeurs. Il ne change aucun mot de passe et ne touche pas aux comptes normaux (deja complets).

-- 1) Jetons vides au lieu de NULL (la cause la plus frequente : « Database error querying schema » / identifiants invalides)
do $q$
declare c text;
begin
  foreach c in array array['confirmation_token','recovery_token','email_change_token_new','email_change','email_change_token_current','phone_change','phone_change_token','reauthentication_token'] loop
    if exists (select 1 from information_schema.columns where table_schema = 'auth' and table_name = 'users' and column_name = c) then
      execute format('update auth.users set %I = %L where %I is null', c, '', c);
    end if;
  end loop;
end $q$;

-- 2) Identite « email » manquante (liaison entre le compte et la connexion par email + mot de passe)
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id, u.id::text,
       jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true, 'phone_verified', false),
       'email', now(), now(), now()
from auth.users u
where u.email is not null
  and not exists (select 1 from auth.identities i where i.user_id = u.id and i.provider = 'email');

-- 3) Compte confirme et sans blocage
update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now()), banned_until = null
where email like '%@objectif.invalid';

-- 4) Controle avec le PSEUDO : faux comptes + comptes crees aujourd'hui (mot de passe, confirme, identite : tout doit etre vrai)
select u.email,
       coalesce(p.name, m.pseudo) as pseudo,
       p.city as ville,
       (coalesce(u.encrypted_password, '') <> '') as mot_de_passe,
       (u.email_confirmed_at is not null) as confirme,
       exists (select 1 from auth.identities i where i.user_id = u.id and i.provider = 'email') as identite
from auth.users u
left join public.profiles p on p.id = u.id
left join public.members  m on m.id = u.id
where u.email like '%@objectif.invalid'
   or (u.created_at at time zone 'Europe/Paris')::date = (now() at time zone 'Europe/Paris')::date
order by u.email;
