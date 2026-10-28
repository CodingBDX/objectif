-- ===== Verification de profil par photo (papier avec "sex-escorte.com" + date du jour) =====
-- Bucket PRIVE : seule la personne et l admin voient la photo. Elle est supprimee des que l admin a decide.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('verif', 'verif', false, 8388608, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false;

drop policy if exists "verif envoyer" on storage.objects;
create policy "verif envoyer" on storage.objects for insert to authenticated
  with check (bucket_id = 'verif' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "verif lire" on storage.objects;
create policy "verif lire" on storage.objects for select to authenticated
  using (bucket_id = 'verif' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
drop policy if exists "verif supprimer" on storage.objects;
create policy "verif supprimer" on storage.objects for delete to authenticated
  using (bucket_id = 'verif' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

create table if not exists public.verif_requests (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  path text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  note text not null default '' check (char_length(note) <= 300),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);
alter table public.verif_requests enable row level security;
drop policy if exists verif_select on public.verif_requests;
create policy verif_select on public.verif_requests for select to authenticated using (profile_id = auth.uid() or public.is_admin());

-- Envoyer (ou renvoyer) sa demande
create or replace function public.submit_verif(p_path text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not exists (select 1 from public.profiles where id = auth.uid()) then raise exception 'Réservé aux profils'; end if;
  if p_path is null or split_part(p_path, '/', 1) <> auth.uid()::text then raise exception 'Fichier invalide'; end if;
  insert into public.verif_requests (profile_id, path, status, note, created_at, decided_at)
  values (auth.uid(), p_path, 'pending', '', now(), null)
  on conflict (profile_id) do update set path = excluded.path, status = 'pending', note = '', created_at = now(), decided_at = null;
end $$;

-- Decision de l admin (accepter = profil verifie)
create or replace function public.admin_decide_verif(p_id uuid, p_ok boolean, p_note text default '') returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Accès réservé'; end if;
  if p_ok then
    perform public.admin_set_profile(p_id, (select vip from public.profiles where id = p_id), true, (select paused from public.profiles where id = p_id));
  end if;
  update public.verif_requests set status = case when p_ok then 'approved' else 'rejected' end,
    note = left(coalesce(p_note, ''), 300), decided_at = now() where profile_id = p_id;
end $$;

revoke all on function public.submit_verif(text), public.admin_decide_verif(uuid, boolean, text) from public, anon;
grant execute on function public.submit_verif(text), public.admin_decide_verif(uuid, boolean, text) to authenticated;

-- Garde-fou : on ne peut pas renvoyer une photo en boucle (1 envoi toutes les 2 minutes max)
create or replace function public.submit_verif(p_path text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not exists (select 1 from public.profiles where id = auth.uid()) then raise exception 'Réservé aux profils'; end if;
  if p_path is null or split_part(p_path, '/', 1) <> auth.uid()::text then raise exception 'Fichier invalide'; end if;
  if exists (select 1 from public.verif_requests where profile_id = auth.uid() and created_at > now() - interval '2 minutes') then raise exception 'Patiente un instant avant de renvoyer une photo.'; end if;
  insert into public.verif_requests (profile_id, path, status, note, created_at, decided_at)
  values (auth.uid(), p_path, 'pending', '', now(), null)
  on conflict (profile_id) do update set path = excluded.path, status = 'pending', note = '', created_at = now(), decided_at = null;
end $$;
