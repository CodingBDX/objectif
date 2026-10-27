-- ===== Réponses du profil aux commentaires ===== à lancer UNE fois dans le SQL Editor
alter table public.comments add column if not exists parent_id bigint references public.comments(id) on delete cascade;
create index if not exists comments_parent on public.comments (parent_id);
drop policy if exists "commenter" on public.comments;
create policy "commenter" on public.comments for insert to authenticated with check (
  author_id = auth.uid()
  and (parent_id is null
       or (profile_id = auth.uid()                                   -- seul le propriétaire du profil peut répondre
           and exists (select 1 from public.comments c where c.id = parent_id and c.profile_id = comments.profile_id and c.parent_id is null)))
);
