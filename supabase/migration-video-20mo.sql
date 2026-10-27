-- ===== Vidéos de profil : 20 Mo maximum ===== à lancer UNE fois
update storage.buckets set file_size_limit = 20971520 where id = 'media';
