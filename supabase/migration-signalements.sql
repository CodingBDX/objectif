-- Signalements de profils — à lancer UNE fois dans le SQL Editor
create table if not exists public.reports (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  reporter_id uuid default auth.uid(),
  reason text not null check (char_length(reason) <= 80),
  details text not null default '' check (char_length(details) <= 1000),
  contact text not null default '' check (char_length(contact) <= 120),
  status text not null default 'nouveau',
  created_at timestamptz not null default now()
);
create index if not exists reports_profile on public.reports (profile_id, created_at);
alter table public.reports enable row level security;
create policy "tout le monde peut signaler" on public.reports for insert with check (true);
-- aucune policy de lecture : seuls toi (Table Editor) voient les signalements

-- Pour masquer un profil signalé : update public.profiles set paused = true where id = '...';
