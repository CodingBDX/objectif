-- ===== Nettoyage automatique des statistiques (pg_cron) ===== à lancer UNE fois
-- Si l'extension est refusée : Supabase → Database → Extensions → activer « pg_cron », puis relancer.
create extension if not exists pg_cron with schema pg_catalog;

-- Chaque dimanche à 03h30 (heure du serveur, UTC) : supprime les statistiques de plus d'un an
select cron.schedule('nettoyage-stats', '30 3 * * 0',
  $$ delete from public.profile_stats where day < current_date - 365 $$);

-- Pour vérifier :  select jobname, schedule, active from cron.job;
-- Pour arrêter  :  select cron.unschedule('nettoyage-stats');
