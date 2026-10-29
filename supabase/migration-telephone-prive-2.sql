-- ===== ETAPE 2 : a lancer APRES avoir deploye le nouveau site et verifie qu un numero s affiche bien (bouton Afficher le numero) =====
-- Supprime l ancienne colonne publique : plus personne ne peut lire les numeros directement avec la cle publique.
-- Les anciens fichiers demo-*.sql / profils-exemples*.sql qui inserent "phone" dans profiles ne fonctionneront plus.
alter table public.profiles drop column if exists phone;
