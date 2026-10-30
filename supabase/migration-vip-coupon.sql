-- Paiement VIP par coupon PCS : code + montant + photo du ticket, validé à la main par l'admin. Relançable.
-- A lancer APRÈS migration-vip-virement-v2.sql.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('coupons', 'coupons', false, 8388608, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false;

drop policy if exists "coupons envoyer" on storage.objects;
create policy "coupons envoyer" on storage.objects for insert to authenticated
  with check (bucket_id = 'coupons' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "coupons lire" on storage.objects;
create policy "coupons lire" on storage.objects for select to authenticated
  using (bucket_id = 'coupons' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
drop policy if exists "coupons supprimer" on storage.objects;
create policy "coupons supprimer" on storage.objects for delete to authenticated
  using (bucket_id = 'coupons' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

alter table public.vip_orders add column if not exists pay_method text;
alter table public.vip_orders add column if not exists coupon_brand text;
alter table public.vip_orders add column if not exists coupon_code text;
alter table public.vip_orders add column if not exists coupon_amount int;
alter table public.vip_orders add column if not exists coupon_path text;

-- Envoi du coupon : passe la commande en « à vérifier » (declared). Le montant doit couvrir le forfait.
create or replace function public.vip_order_coupon(p_id uuid, p_brand text, p_code text, p_amount int, p_path text) returns void
language plpgsql security definer set search_path = public as $q$
declare o public.vip_orders; c text := btrim(coalesce(p_code, ''));
begin
  if auth.uid() is null then raise exception 'connexion_requise'; end if;
  select * into o from public.vip_orders where id = p_id and profile_id = auth.uid() and status = 'pending' for update;
  if o.id is null then raise exception 'commande_introuvable'; end if;
  if o.created_at <= now() - interval '2 hours' then raise exception 'commande_expiree'; end if;
  if p_brand <> 'PCS' then raise exception 'marque_inconnue'; end if;
  if c !~ '^[A-Za-z0-9 -]{6,40}$' then raise exception 'code_invalide'; end if;
  if p_amount is null or p_amount < o.amount or p_amount > 1000 then raise exception 'montant_invalide'; end if;
  if p_path is null or split_part(p_path, '/', 1) <> auth.uid()::text then raise exception 'photo_requise'; end if;
  update public.vip_orders set status = 'declared', declared_at = now(), pay_method = 'coupon',
    coupon_brand = p_brand, coupon_code = c, coupon_amount = p_amount, coupon_path = p_path where id = o.id;
end $q$;
revoke all on function public.vip_order_coupon(uuid, text, text, int, text) from public, anon;
grant execute on function public.vip_order_coupon(uuid, text, text, int, text) to authenticated;
