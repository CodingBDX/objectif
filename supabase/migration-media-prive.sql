-- Photos et vidéos privées : à lancer dans Supabase → SQL Editor, APRÈS avoir vérifié que la version du site
-- avec la route /media est en ligne ET que la variable SUPABASE_SERVICE_ROLE_KEY est bien définie dans Vercel.
-- Effet : les adresses publiques https://….supabase.co/storage/v1/object/public/media/… ne marchent plus ;
-- les photos ne sont visibles que via sex-escorte.com/media/… (liens temporaires d'1 h).

-- 1. Le bucket « media » devient privé.
update storage.buckets set public = false where id = 'media';

-- 2. Plus de lecture ouverte à tout le monde (sinon n'importe qui pourrait encore créer un lien avec la clé publique).
drop policy if exists "lecture publique des médias" on storage.objects;

-- 3. Chaque profil peut encore lister et supprimer ses propres fichiers depuis « Mon profil ».
drop policy if exists "lecture de ses propres médias" on storage.objects;
create policy "lecture de ses propres médias" on storage.objects for select
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

-- Pour revenir en arrière en cas de souci :
-- update storage.buckets set public = true where id = 'media';
-- create policy "lecture publique des médias" on storage.objects for select using (bucket_id = 'media');
