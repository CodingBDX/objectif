-- ===== Compte de test : profil standard (ni VIP ni vérifié) =====
-- Connexion : test@sex-escorte.com  /  Test-Escorte-2026
-- À coller dans Supabase > SQL Editor > Run. Re-exécutable sans doublon.
do $$
declare uid uuid := '00000000-0000-4000-8000-0000000000a1';
begin
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    confirmation_token, recovery_token, email_change, email_change_token_new)
  values (uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'test@sex-escorte.com', crypt('Test-Escorte-2026', gen_salt('bf')), now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}', '', '', '', '')
  on conflict (id) do update set encrypted_password = excluded.encrypted_password;

  insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), uid, uid::text, 'email',
    jsonb_build_object('sub', uid::text, 'email', 'test@sex-escorte.com', 'email_verified', true),
    now(), now(), now())
  on conflict do nothing;

  insert into public.profiles (id, name, genre, city, specialties, bio, phone, vip, verified)
  values (uid, 'Test Profil', 'fille', 'Paris', array['Massage','Dîner'],
    'Profil de test (compte fictif).', '06 39 98 00 00', false, false)
  on conflict (id) do nothing;
end $$;

-- Pour le passer VIP + vérifié (tester les logements) :
-- update public.profiles set vip = true, verified = true where id = '00000000-0000-4000-8000-0000000000a1';
