-- Virement sécurisé : IBAN verrouillé (plus lisible directement), nom de l'expéditrice, expiration 2 h.
-- A lancer APRÈS migration-vip-virement.sql. Relançable.
alter table public.vip_orders add column if not exists payer_first text;
alter table public.vip_orders add column if not exists payer_last text;
alter table public.vip_orders add column if not exists bank_shown_at timestamptz;

-- L'IBAN n'est plus lisible par tous les comptes connectés : seul l'admin lit site_settings.
drop policy if exists "settings lecture" on public.site_settings;

-- Délai de 2 h : une commande non déclarée plus de 2 h après sa création est périmée.
create or replace function public.vip_order_declare(p_id uuid) returns void
language plpgsql security definer set search_path = public as $q$
begin
  update public.vip_orders set status = 'declared', declared_at = now()
   where id = p_id and profile_id = auth.uid() and status = 'pending' and created_at > now() - interval '2 hours';
  if not found then raise exception 'commande_introuvable_ou_expiree'; end if;
end $q$;

-- Coordonnées bancaires : uniquement pour SA commande en attente, non expirée, avec le nom de l'expéditrice.
-- Le nom est enregistré une seule fois (ensuite il ne change plus).
create or replace function public.vip_order_bank(p_id uuid, p_first text default '', p_last text default '') returns json
language plpgsql security definer set search_path = public as $q$
declare o public.vip_orders; f text := btrim(coalesce(p_first, '')); l text := btrim(coalesce(p_last, '')); r json;
begin
  if auth.uid() is null then raise exception 'connexion_requise'; end if;
  select * into o from public.vip_orders where id = p_id and profile_id = auth.uid() and status = 'pending' for update;
  if o.id is null then raise exception 'commande_introuvable'; end if;
  if o.created_at <= now() - interval '2 hours' then raise exception 'commande_expiree'; end if;
  if o.bank_shown_at is null then
    if char_length(f) not between 2 and 60 or char_length(l) not between 2 and 60 then raise exception 'noms_requis'; end if;
    update public.vip_orders set payer_first = f, payer_last = l, bank_shown_at = now() where id = o.id;
  end if;
  select json_build_object(
    'iban', coalesce((select value from public.site_settings where key = 'vip_iban'), ''),
    'bic', coalesce((select value from public.site_settings where key = 'vip_bic'), ''),
    'holder', coalesce((select value from public.site_settings where key = 'vip_holder'), '')) into r;
  return r;
end $q$;

revoke all on function public.vip_order_bank(uuid, text, text), public.vip_order_declare(uuid) from public, anon;
grant execute on function public.vip_order_bank(uuid, text, text), public.vip_order_declare(uuid) to authenticated;
