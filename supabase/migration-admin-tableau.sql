-- ===== Tableau de bord admin : vues et appels par jour ===== à lancer UNE fois
create or replace function public.admin_daily_stats(p_days int default 30)
returns table(day date, views bigint, calls bigint)
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Accès réservé'; end if;
  return query
    select s.day, sum(s.views)::bigint, sum(s.calls)::bigint
    from public.profile_stats s
    where s.day >= current_date - least(greatest(p_days, 1), 365)
    group by s.day order by s.day;
end $$;
revoke all on function public.admin_daily_stats(int) from public, anon;
grant execute on function public.admin_daily_stats(int) to authenticated;
