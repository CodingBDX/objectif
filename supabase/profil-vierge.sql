-- ===== PROFIL VIERGE : un compte + un profil presque vide, avec email et mot de passe pour te connecter =====
-- 1) Modifie les 6 valeurs ci-dessous (entre guillemets simples) : email, mot de passe (8+ caracteres), pseudo, genre, ville, telephone.
-- 2) Lance. Puis sur le site : Se connecter avec cet email + ce mot de passe -> Mon profil : tout le reste se remplit depuis le formulaire (photos, presentation, tarifs...).
-- genre : fille, homme, trans ou livecam
do $q$
declare
  v_email    text := 'nouveau@objectif.invalid';
  v_password text := 'CHOISIS-UN-MOT-DE-PASSE-8+';
  v_name     text := 'Pseudo';
  v_genre    text := 'fille';
  v_city     text := 'Bordeaux';
  v_phone    text := '06 00 00 00 00';
  uid uuid := gen_random_uuid();
begin
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at,
                          raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
  values (uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', v_email,
          extensions.crypt(v_password, extensions.gen_salt('bf')), now(), now(), now(),
          '{"provider":"email","providers":["email"]}', '{}', '', '', '', '');

  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true), 'email', now(), now(), now());

  insert into public.profiles (id, name, genre, city, more, specialties, bio, photos, vip, verified, paused)
  values (uid, v_name, v_genre, v_city, '{}', '{}', '', '{}', false, false, false);

  insert into public.profile_phones (profile_id, phone) values (uid, v_phone);
end $q$;

-- Verification : le compte et le profil existent
select u.email, p.name as pseudo, p.genre, p.city from auth.users u join public.profiles p on p.id = u.id where u.email = 'nouveau@objectif.invalid';
