-- ===== EXEMPLE : 1 profil VIP FICTIF, tous les champs remplis (aucune vraie personne ; illustrations abstraites ; numero fictif 06 39 98 90 01) =====
-- A lancer APRES : migration-telephone-prive-1.sql, migration-nationalite.sql, migration-arrondissement.sql, migration-whatsapp.sql, migration-url-vip.sql
-- Pour le retirer : delete from auth.users where id = '00000000-0000-4000-8000-000000000901';  (le profil et le telephone partent avec)

-- 1/3 : compte
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
values ('00000000-0000-4000-8000-000000000901', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'demo901@objectif.invalid', '', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}')
on conflict (id) do nothing;

-- 2/3 : profil (le pseudo d'adresse « camille-demo » est cree tout seul par la base)
delete from public.profiles where id = '00000000-0000-4000-8000-000000000901';
insert into public.profiles (
  id, name, genre, city, region, district, more, specialties, bio, slogan,
  vip, verified, paused, friendly_url,
  h24, hours, trips,
  photos, video, vlink,
  tarif_visible, tarif_30, tarif_60, rates,
  age, height_cm, weight_kg, ethnicity, nationality, hair, eyes, bra, smoker, drinker, receives, travels, languages,
  instagram, snapchat, tiktok, site,
  whatsapp, sms, pay_wero, pay_paypal, created_at
) values (
  '00000000-0000-4000-8000-000000000901', $q$Camille Démo$q$, $q$fille$q$, $q$Bordeaux$q$, $q$Nouvelle-Aquitaine$q$, $q$Chartrons$q$,
  array[$q$Mérignac$q$, $q$Pessac$q$, $q$Bègles$q$, $q$Libourne$q$, $q$Arcachon$q$, $q$Langon$q$]::text[],
  array[$q$Girlfriend experience$q$, $q$Accompagnement$q$, $q$Dîner$q$, $q$Soirée$q$, $q$Week-end$q$, $q$Voyage$q$, $q$Massage$q$, $q$Relaxation$q$,
        $q$Sensuel$q$, $q$Élégante$q$, $q$Naturelle$q$, $q$Discrète$q$, $q$Complice$q$, $q$Lingerie$q$, $q$Sortie culturelle$q$, $q$Langues & conversation$q$]::text[],
  $q$## Bienvenue
Élégante, cultivée et attentionnée, je vous accueille à **Bordeaux** dans un appartement calme et soigné, au cœur des Chartrons.

## Ce que je propose
- Des **rencontres sur rendez-vous**, sans précipitation
- Dîners, soirées et escapades, avec plaisir pour la conversation
- Un cadre discret, une hygiène irréprochable

*Message courtois et présentation souhaités.* Je réponds de préférence en début d’après-midi.$q$,
  $q$Douce, élégante et attentionnée$q$,
  true, true, false, true,
  false,
  '{"1": ["12:00", "22:00"], "2": ["12:00", "22:00"], "3": ["12:00", "22:00"], "4": ["12:00", "23:30"], "5": ["14:00", "02:00"], "6": ["14:00", "02:00"]}'::jsonb,
  jsonb_build_array(
    jsonb_build_object('city', 'Paris', 'from', to_char(current_date + 6, 'YYYY-MM-DD'), 'to', to_char(current_date + 9, 'YYYY-MM-DD')),
    jsonb_build_object('city', 'Lyon',  'from', to_char(current_date + 20, 'YYYY-MM-DD'), 'to', to_char(current_date + 22, 'YYYY-MM-DD'))
  ),
  array['/api/demo/901-0','/api/demo/901-1','/api/demo/901-2','/api/demo/901-3','/api/demo/901-4','/api/demo/901-5']::text[], null, null,
  true, 90, 150,
  '[{"d": "30min", "p": 90}, {"d": "1h", "p": 150}, {"d": "2h", "p": 270}, {"d": "soiree", "p": 520}, {"d": "nuit", "p": 750}]'::jsonb,
  29, 168, 56, $q$Caucasienne$q$, $q$Française$q$, $q$Bruns$q$, $q$Verts$q$, $q$C$q$, $q$non$q$, $q$parfois$q$, true, true,
  array[$q$Français$q$, $q$Anglais$q$, $q$Espagnol$q$]::text[],
  $q$camille.demo$q$, $q$camille.demo$q$, $q$camille.demo$q$, $q$https://example.com$q$,
  true, true, null, null, now() - interval '40 days'
);

-- 3/3 : telephone fictif
insert into public.profile_phones (profile_id, phone) values ('00000000-0000-4000-8000-000000000901', $q$06 39 98 90 01$q$)
on conflict (profile_id) do update set phone = excluded.phone;

-- Resultat attendu : https://sex-escorte.com/fille/bordeaux/camille-demo
