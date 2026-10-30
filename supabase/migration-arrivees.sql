-- ===== « Arrivent bientôt » : l'escorte choisit d'afficher son arrivée dans une ville (J-3) ===== a lancer UNE fois (relancable)
alter table public.profiles add column if not exists trip_public boolean not null default false;
grant update (trip_public) on public.profiles to authenticated;
