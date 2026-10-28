-- ===== Demo membres : 1 membre au numero signale (commentaire rouge) + 1 membre normal =====
-- A lancer APRES compte-test.sql et migration-membres-telephone.sql. Re-executable.
-- Connexions : membre-rouge@sex-escorte.com et membre-ok@sex-escorte.com / mot de passe Test-Membre-2026
-- Les commentaires apparaissent sur le profil de test : /profil/00000000-0000-4000-8000-0000000000a1

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change, email_change_token_new) values
 ('00000000-0000-4000-8000-0000000000b1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'membre-rouge@sex-escorte.com', crypt('Test-Membre-2026', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', '', '', '', ''),
 ('00000000-0000-4000-8000-0000000000b2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'membre-ok@sex-escorte.com', crypt('Test-Membre-2026', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', '', '', '', '')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at) values
 (gen_random_uuid(), '00000000-0000-4000-8000-0000000000b1', '00000000-0000-4000-8000-0000000000b1', 'email', '{"sub":"00000000-0000-4000-8000-0000000000b1","email":"membre-rouge@sex-escorte.com","email_verified":true}', now(), now(), now()),
 (gen_random_uuid(), '00000000-0000-4000-8000-0000000000b2', '00000000-0000-4000-8000-0000000000b2', 'email', '{"sub":"00000000-0000-4000-8000-0000000000b2","email":"membre-ok@sex-escorte.com","email_verified":true}', now(), now(), now())
on conflict do nothing;

insert into public.members (id, pseudo, phone_hash) values
 ('00000000-0000-4000-8000-0000000000b1', 'Marc_Test', private.phone_hash('06 39 98 11 11')),
 ('00000000-0000-4000-8000-0000000000b2', 'Paul_Test', private.phone_hash('06 39 98 22 22'))
on conflict (id) do update set pseudo = excluded.pseudo, phone_hash = excluded.phone_hash;

-- Le profil de test signale le numero de Marc_Test
insert into public.client_reports (reporter_id, phone_hash, category, note)
values ('00000000-0000-4000-8000-0000000000a1', private.phone_hash('06 39 98 11 11'), 'harcelement', 'demo')
on conflict (reporter_id, phone_hash) do nothing;

delete from public.comments where author_id in ('00000000-0000-4000-8000-0000000000b1', '00000000-0000-4000-8000-0000000000b2');
insert into public.comments (profile_id, author_id, author_name, body) values
 ('00000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-0000000000b2', 'Paul_Test', 'Merci pour l’échange, très agréable et respectueuse.'),
 ('00000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-0000000000b1', 'Marc_Test', 'Commentaire de test : ce membre a un numéro signalé, il doit s’afficher en rouge.');
