-- Verifier un numero : indique aussi si TU l as deja signale (a lancer une fois)
drop function if exists public.check_client(text);
create or replace function public.check_client(p_phone text)
returns table(niveau text, signalements int, dernier date, categories text[], moi boolean)
language plpgsql security definer set search_path = public as $$
declare h text; n int; last date; cats text[]; mine boolean;
begin
  if auth.uid() is null or not exists (select 1 from public.profiles where id = auth.uid() and paused = false) then raise exception 'Réservé aux profils inscrits'; end if;
  if (select count(*) from public.client_lookups where user_id = auth.uid() and created_at > now() - interval '1 day') >= 30 then raise exception 'Limite de vérifications atteinte pour ce jour'; end if;
  h := private.phone_hash(p_phone);
  insert into public.client_lookups (user_id) values (auth.uid());
  select count(distinct reporter_id)::int, max(created_at)::date, array_agg(distinct category) into n, last, cats
  from public.client_reports where phone_hash = h and reporter_id <> auth.uid();
  select exists (select 1 from public.client_reports where phone_hash = h and reporter_id = auth.uid()) into mine;
  return query select case when n >= 2 then 'danger' when n = 1 then 'attention' else 'aucun' end, n, last, coalesce(cats, '{}'), mine;
end $$;
revoke all on function public.check_client(text) from public, anon;
grant execute on function public.check_client(text) to authenticated;
