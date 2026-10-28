-- Les logements ne sont visibles que par les profils VIP ET verifies (et admins / proprietaire)
drop policy if exists "logements: lecture" on public.lodgings;
create policy "logements: lecture" on public.lodgings for select to anon, authenticated using (
  (status = 'approved'
    and exists (select 1 from public.profiles p where p.id = profile_id and p.vip and p.verified and not p.paused)
    and exists (select 1 from public.profiles v where v.id = auth.uid() and v.vip and v.verified))
  or profile_id = auth.uid() or public.is_admin());
