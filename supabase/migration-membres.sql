-- À lancer UNE fois si tu as déjà exécuté l’ancienne version de schema.sql
alter table public.profiles add column if not exists vlink text;
revoke update on public.profiles from authenticated;
grant update (name, genre, city, more, specialties, bio, phone, instagram, snapchat, tiktok, site,
              h24, hours, trips, photos, video, paused, vlink) on public.profiles to authenticated;

create table if not exists public.members (
  id uuid primary key references auth.users(id) on delete cascade,
  pseudo text not null check (char_length(pseudo) between 2 and 30),
  created_at timestamptz not null default now()
);
alter table public.members enable row level security;
create policy "voir son profil membre" on public.members for select to authenticated using (id = auth.uid());
create policy "créer son profil membre" on public.members for insert to authenticated with check (id = auth.uid());
create policy "modifier son profil membre" on public.members for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create table if not exists public.comments (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists comments_profile on public.comments (profile_id, created_at);
alter table public.comments enable row level security;
create policy "lecture publique des commentaires" on public.comments for select using (true);
create policy "commenter" on public.comments for insert to authenticated with check (author_id = auth.uid());
create policy "supprimer son commentaire ou ceux de son profil" on public.comments for delete to authenticated
  using (author_id = auth.uid() or profile_id = auth.uid());
