-- ===== Badge « Client vérifié » sur les commentaires des membres ===== a lancer UNE fois
-- Table à part (écriture réservée à l'admin) : un membre ne peut PAS se donner le badge lui-même.
create table if not exists public.member_verified (
  member_id uuid primary key references public.members(id) on delete cascade,
  at timestamptz not null default now()
);
alter table public.member_verified enable row level security;
drop policy if exists "member_verified: admin" on public.member_verified;
create policy "member_verified: admin" on public.member_verified for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Quels auteurs de commentaires sont vérifiés ? (renvoie seulement l'id)
create or replace function public.verified_authors(p_ids uuid[]) returns table(author_id uuid)
language sql stable security definer set search_path = public as $$
  select member_id from public.member_verified where member_id = any(p_ids)
$$;
revoke all on function public.verified_authors(uuid[]) from public;
grant execute on function public.verified_authors(uuid[]) to anon, authenticated;

-- Donner / retirer le badge (depuis le SQL Editor, apres avoir verifie la personne toi-meme, par exemple par un appel ou un message) :
--   insert into public.member_verified (member_id) select id from public.members where pseudo = 'PSEUDO' on conflict do nothing;
--   delete from public.member_verified where member_id = (select id from public.members where pseudo = 'PSEUDO');
-- Voir les membres verifies :
--   select m.pseudo, v.at from public.member_verified v join public.members m on m.id = v.member_id order by v.at desc;
