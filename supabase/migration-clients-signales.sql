-- ===== Signalement et vérification de numéros de clients (sécurité des profils) ===== à lancer UNE fois
create extension if not exists pgcrypto with schema extensions;

-- Clé secrète privée (jamais accessible depuis le site). SAUVEGARDE-LA : sans elle, les anciens signalements ne sont plus retrouvables.
create schema if not exists private;
create table if not exists private.secrets (k text primary key, v text not null);
insert into private.secrets (k, v) values ('client_pepper', gen_random_uuid()::text || gen_random_uuid()::text) on conflict do nothing;
revoke all on schema private from public, anon, authenticated;
revoke all on private.secrets from public, anon, authenticated;

create table if not exists public.client_reports (
  id bigint generated always as identity primary key,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  phone_hash text not null,
  category text not null check (category in ('harcelement','menaces','impaye','faux_rdv','non_respect','autre')),
  note text not null default '' check (char_length(note) <= 300),
  created_at timestamptz not null default now(),
  unique (reporter_id, phone_hash)
);
create index if not exists client_reports_hash on public.client_reports (phone_hash);
create table if not exists public.client_lookups (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  created_at timestamptz not null default now()
);
create index if not exists client_lookups_user on public.client_lookups (user_id, created_at desc);
alter table public.client_reports enable row level security;
alter table public.client_lookups enable row level security;
drop policy if exists "client_reports: admin" on public.client_reports;
create policy "client_reports: admin" on public.client_reports for select to authenticated using (public.is_admin());
drop policy if exists "client_reports: supprimer les siens" on public.client_reports;
create policy "client_reports: supprimer les siens" on public.client_reports for delete to authenticated using (reporter_id = auth.uid() or public.is_admin());
-- aucune autre policy : on n'écrit et on ne lit que par les fonctions ci-dessous

-- Empreinte d'un numéro (06 12 34 56 78 = +33 6 12 34 56 78 = 0033612345678)
create or replace function private.phone_hash(p text) returns text
language plpgsql stable security definer set search_path = private, extensions as $$
declare d text := regexp_replace(coalesce(p,''), '\D', '', 'g'); pep text;
begin
  if d like '0033%' then d := substr(d, 5);
  elsif d like '33%' and length(d) = 11 then d := substr(d, 3);
  elsif d like '0%' then d := substr(d, 2);
  end if;
  if length(d) < 8 or length(d) > 15 then raise exception 'Numéro invalide'; end if;
  select s.v into pep from private.secrets s where s.k = 'client_pepper';
  return encode(hmac(d, pep, 'sha256'), 'hex');
end $$;

-- Signaler un client (réservé aux profils inscrits et visibles, 20 signalements max par jour)
create or replace function public.report_client(p_phone text, p_category text, p_note text default '')
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not exists (select 1 from public.profiles where id = auth.uid() and paused = false) then raise exception 'Réservé aux profils inscrits'; end if;
  if (select count(*) from public.client_reports where reporter_id = auth.uid() and created_at > now() - interval '1 day') >= 20 then raise exception 'Limite de signalements atteinte pour aujourd’hui'; end if;
  insert into public.client_reports (reporter_id, phone_hash, category, note)
  values (auth.uid(), private.phone_hash(p_phone), p_category, left(coalesce(p_note,''), 300))
  on conflict (reporter_id, phone_hash) do update set category = excluded.category, note = excluded.note, created_at = now();
end $$;

-- Vérifier un numéro (réservé aux profils inscrits, 30 vérifications max par jour)
create or replace function public.check_client(p_phone text)
returns table(niveau text, signalements int, dernier date, categories text[])
language plpgsql security definer set search_path = public as $$
declare h text; n int; last date; cats text[];
begin
  if auth.uid() is null or not exists (select 1 from public.profiles where id = auth.uid() and paused = false) then raise exception 'Réservé aux profils inscrits'; end if;
  if (select count(*) from public.client_lookups where user_id = auth.uid() and created_at > now() - interval '1 day') >= 30 then raise exception 'Limite de vérifications atteinte pour aujourd’hui'; end if;
  h := private.phone_hash(p_phone);
  insert into public.client_lookups (user_id) values (auth.uid());
  select count(distinct reporter_id)::int, max(created_at)::date, array_agg(distinct category) into n, last, cats
  from public.client_reports where phone_hash = h and reporter_id <> auth.uid();   -- on ne compte pas ses propres signalements
  return query select case when n >= 2 then 'danger' when n = 1 then 'attention' else 'aucun' end, n, last, coalesce(cats, '{}');
end $$;

revoke all on function public.report_client(text, text, text), public.check_client(text) from public, anon;
grant execute on function public.report_client(text, text, text), public.check_client(text) to authenticated;
-- Pas d'accès direct à private.phone_hash : fonction interne uniquement.
revoke all on function private.phone_hash(text) from public, anon, authenticated;
