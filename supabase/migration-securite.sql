-- ===== Journal de securite : champ piege (robots), connexions echouees ===== a lancer UNE fois
-- Les visiteurs peuvent ECRIRE un evenement (limite en taille), seul l'admin peut LIRE.
create table if not exists public.security_events (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('piege_contact','piege_signalement','piege_commentaire','connexion_echec','trop_rapide')),
  detail text not null default '' check (char_length(detail) <= 200),
  created_at timestamptz not null default now()
);
create index if not exists security_events_date on public.security_events (created_at desc);
alter table public.security_events enable row level security;
drop policy if exists "security_events: ecrire" on public.security_events;
create policy "security_events: ecrire" on public.security_events for insert to anon, authenticated with check (true);
drop policy if exists "security_events: admin lit" on public.security_events;
create policy "security_events: admin lit" on public.security_events for select to authenticated using (public.is_admin());
drop policy if exists "security_events: admin supprime" on public.security_events;
create policy "security_events: admin supprime" on public.security_events for delete to authenticated using (public.is_admin());
grant insert on public.security_events to anon, authenticated;
grant select, delete on public.security_events to authenticated;

-- nettoyage automatique : on garde 60 jours
-- select cron.schedule('purge-security', '30 3 * * *', $$ delete from public.security_events where created_at < now() - interval '60 days' $$);
