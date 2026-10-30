-- Tarifs VIP modifiables depuis l'admin (onglet Paiements). A lancer APRES migration-vip-paiement.sql.
create table if not exists public.vip_plans (
  id text primary key,
  label text not null,
  days int not null check (days > 0),
  price int not null check (price >= 0),
  position int not null default 0,
  active boolean not null default true
);
alter table public.vip_plans enable row level security;
drop policy if exists "vip_plans lecture" on public.vip_plans;
create policy "vip_plans lecture" on public.vip_plans for select using (true);
drop policy if exists "vip_plans admin" on public.vip_plans;
create policy "vip_plans admin" on public.vip_plans for all using (public.is_admin()) with check (public.is_admin());
grant select on public.vip_plans to anon, authenticated;
grant insert, update, delete on public.vip_plans to authenticated;

insert into public.vip_plans (id, label, days, price, position) values
  ('2j', '2 jours', 2, 20, 1), ('5j', '5 jours', 5, 35, 2), ('1m', '1 mois', 30, 150, 3)
on conflict (id) do nothing;

-- Le prix est lu dans vip_plans (jamais envoye par le navigateur)
create or replace function public.vip_order_create(p_plan text) returns public.vip_orders
language plpgsql security definer set search_path = public as $q$
declare pl public.vip_plans; o public.vip_orders;
begin
  if auth.uid() is null or not exists (select 1 from public.profiles where id = auth.uid()) then raise exception 'profil_requis'; end if;
  select * into pl from public.vip_plans where active and (id = p_plan or label = p_plan) limit 1;
  if not found then raise exception 'forfait_inconnu'; end if;
  update public.vip_orders set status = 'cancelled', decided_at = now() where profile_id = auth.uid() and status = 'pending';
  insert into public.vip_orders (profile_id, plan, days, amount, ref) values (auth.uid(), pl.label, pl.days, pl.price, upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6))) returning * into o;
  return o;
end $q$;
