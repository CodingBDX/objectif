-- Coordonnées du virement (IBAN, BIC, titulaire) modifiables depuis l'admin (onglet Paiements).
-- Visibles uniquement par les personnes connectées (pas par les visiteurs anonymes).
create table if not exists public.site_settings (
  key text primary key,
  value text not null default ''
);
alter table public.site_settings enable row level security;
drop policy if exists "settings lecture" on public.site_settings;
create policy "settings lecture" on public.site_settings for select to authenticated using (key in ('vip_iban','vip_bic','vip_holder'));
drop policy if exists "settings admin" on public.site_settings;
create policy "settings admin" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant select, insert, update, delete on public.site_settings to authenticated;
