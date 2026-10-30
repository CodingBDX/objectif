-- ===== Paiement VIP : forfait choisi -> alerte avec Wero / PayPal -> « J'ai paye » -> validation par l'admin ===== a lancer UNE fois (relancable)
-- Apres migration-vip-expiration.sql (admin_set_vip).
create table if not exists public.vip_orders (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  plan text not null,
  days int not null,
  amount int not null,
  ref text not null,
  status text not null default 'pending' check (status in ('pending','declared','validated','refused','cancelled')),
  created_at timestamptz not null default now(),
  declared_at timestamptz,
  decided_at timestamptz
);
create index if not exists vip_orders_status_idx on public.vip_orders (status, created_at desc);
alter table public.vip_orders enable row level security;
drop policy if exists "mes commandes vip: lire" on public.vip_orders;
drop policy if exists "admin lit les commandes vip" on public.vip_orders;
create policy "mes commandes vip: lire" on public.vip_orders for select to authenticated using (profile_id = auth.uid());
create policy "admin lit les commandes vip" on public.vip_orders for select to authenticated using (public.is_admin());
-- aucune ecriture directe : tout passe par les fonctions ci-dessous

-- l'escorte choisit un forfait (les prix sont verifies ici, pas cote navigateur)
create or replace function public.vip_order_create(p_plan text) returns public.vip_orders
language plpgsql security definer set search_path = public as $q$
declare d int; a int; o public.vip_orders;
begin
  if auth.uid() is null or not exists (select 1 from public.profiles where id = auth.uid()) then raise exception 'profil_requis'; end if;
  case p_plan when '2 jours' then d := 2; a := 20; when '5 jours' then d := 5; a := 35; when '1 mois' then d := 30; a := 150; else raise exception 'forfait_inconnu'; end case;
  update public.vip_orders set status = 'cancelled', decided_at = now() where profile_id = auth.uid() and status = 'pending';
  insert into public.vip_orders (profile_id, plan, days, amount, ref) values (auth.uid(), p_plan, d, a, upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6))) returning * into o;
  return o;
end $q$;

-- « J'ai paye » : passe la commande en attente de verification par l'admin
create or replace function public.vip_order_declare(p_id uuid) returns void
language plpgsql security definer set search_path = public as $q$
begin
  update public.vip_orders set status = 'declared', declared_at = now() where id = p_id and profile_id = auth.uid() and status = 'pending';
  if not found then raise exception 'commande_introuvable'; end if;
end $q$;

-- Annuler une commande pas encore declaree
create or replace function public.vip_order_cancel(p_id uuid) returns void
language plpgsql security definer set search_path = public as $q$
begin
  update public.vip_orders set status = 'cancelled', decided_at = now() where id = p_id and profile_id = auth.uid() and status in ('pending','declared');
end $q$;

-- Admin : valider (active le VIP, prolonge a partir de la fin actuelle) ou refuser
create or replace function public.admin_vip_order_decide(p_id uuid, p_ok boolean) returns void
language plpgsql security definer set search_path = public as $q$
declare o public.vip_orders;
begin
  if not public.is_admin() then raise exception 'Accès réservé'; end if;
  select * into o from public.vip_orders where id = p_id for update;
  if o.id is null or o.status <> 'declared' then raise exception 'deja_traitee'; end if;
  if p_ok then
    perform public.admin_set_vip(o.profile_id, o.days);
    update public.vip_orders set status = 'validated', decided_at = now() where id = p_id;
  else
    update public.vip_orders set status = 'refused', decided_at = now() where id = p_id;
  end if;
end $q$;

revoke all on function public.vip_order_create(text), public.vip_order_declare(uuid), public.vip_order_cancel(uuid), public.admin_vip_order_decide(uuid, boolean) from public, anon;
grant execute on function public.vip_order_create(text), public.vip_order_declare(uuid), public.vip_order_cancel(uuid), public.admin_vip_order_decide(uuid, boolean) to authenticated;
