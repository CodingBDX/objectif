-- À coller dans Supabase → SQL Editor → Run
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 40),
  genre text not null check (genre in ('fille','homme','trans','livecam')),
  city text not null,
  more text[] not null default '{}' check (cardinality(more) <= 3),
  specialties text[] not null default '{}' check (cardinality(specialties) <= 6),
  bio text not null default '' check (char_length(bio) <= 2000),
  phone text, instagram text, snapchat text, tiktok text, site text,
  h24 boolean not null default false,
  hours jsonb not null default '{}',
  trips jsonb not null default '[]',
  photos text[] not null default '{}' check (cardinality(photos) <= 6),
  video text,
  vip boolean not null default false,
  verified boolean not null default false,
  paused boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.profiles (genre, city);
create index on public.profiles (vip desc, created_at desc);

alter table public.profiles enable row level security;
create policy "lecture publique des profils actifs" on public.profiles
  for select using (paused = false or id = auth.uid());
create policy "créer son profil" on public.profiles
  for insert to authenticated with check (id = auth.uid());
create policy "modifier son profil" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "supprimer son profil" on public.profiles
  for delete to authenticated using (id = auth.uid());

-- Un membre ne peut JAMAIS s'attribuer vip / verified : colonnes réservées à l'admin
revoke update on public.profiles from authenticated;
grant update (name, genre, city, more, specialties, bio, phone, instagram, snapchat, tiktok, site,
              h24, hours, trips, photos, video, paused) on public.profiles to authenticated;

create table public.messages (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) <= 80),
  contact text not null check (char_length(contact) <= 120),
  subject text not null,
  body text not null check (char_length(body) <= 3000),
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;
create policy "tout le monde peut écrire" on public.messages for insert with check (true);
-- pas de policy select : seuls toi (dashboard) lisent les messages

-- Stockage des médias (photos filigranées + vidéos 15 Mo max)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 15728640, array['image/jpeg','image/webp','image/png','video/mp4','video/webm','video/quicktime'])
on conflict (id) do nothing;
create policy "lecture publique des médias" on storage.objects for select using (bucket_id = 'media');
create policy "envoyer dans son dossier" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "supprimer dans son dossier" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

-- Pour passer quelqu'un VIP / vérifié (toi seul, depuis le SQL Editor) :
-- update public.profiles set vip = true where id = '...';

-- ===== Profils membres, commentaires, lien de live =====
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
-- ===== Signalements =====
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
