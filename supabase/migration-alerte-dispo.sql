-- ===== Alerte e-mail « un de tes favoris est disponible » ===== a lancer UNE fois (relancable)
-- fav_alerts : le choix de chaque visiteur connecte (desactive par defaut, il l'active lui-meme)
create table if not exists public.fav_alerts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.fav_alerts enable row level security;
drop policy if exists "mon alerte: lire" on public.fav_alerts;
drop policy if exists "mon alerte: ajouter" on public.fav_alerts;
drop policy if exists "mon alerte: modifier" on public.fav_alerts;
create policy "mon alerte: lire" on public.fav_alerts for select to authenticated using (user_id = auth.uid());
create policy "mon alerte: ajouter" on public.fav_alerts for insert to authenticated with check (user_id = auth.uid());
create policy "mon alerte: modifier" on public.fav_alerts for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- dispo_sent : evite d'envoyer deux fois la meme alerte le meme jour (acces reserve au serveur)
create table if not exists public.dispo_sent (
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null,
  day date not null,
  primary key (user_id, profile_id, day)
);
alter table public.dispo_sent enable row level security;
