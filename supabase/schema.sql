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
