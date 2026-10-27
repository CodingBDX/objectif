-- ===== Vérification pour l'application Android (appels entrants) ===== à lancer UNE fois, après migration-clients-signales.sql
-- Même résultat que check_client, mais avec une limite plus haute (300 par jour) car chaque appel entrant déclenche une vérification.
create or replace function public.check_client_call(p_phone text)
returns table(niveau text, signalements int, dernier date, categories text[])
language plpgsql security definer set search_path = public as $$
declare h text; n int; last date; cats text[];
begin
  if auth.uid() is null or not exists (select 1 from public.profiles where id = auth.uid() and paused = false) then raise exception 'Réservé aux profils inscrits'; end if;
  if (select count(*) from public.client_lookups where user_id = auth.uid() and created_at > now() - interval '1 day') >= 300 then raise exception 'Limite de vérifications atteinte pour aujourd’hui'; end if;
  h := private.phone_hash(p_phone);
  insert into public.client_lookups (user_id) values (auth.uid());
  select count(distinct reporter_id)::int, max(created_at)::date, array_agg(distinct category) into n, last, cats
  from public.client_reports where phone_hash = h and reporter_id <> auth.uid();
  return query select case when n >= 2 then 'danger' when n = 1 then 'attention' else 'aucun' end, n, last, coalesce(cats, '{}');
end $$;
revoke all on function public.check_client_call(text) from public, anon;
grant execute on function public.check_client_call(text) to authenticated;

-- Nettoie le journal des vérifications (garde 7 jours)
delete from public.client_lookups where created_at < now() - interval '7 days';
