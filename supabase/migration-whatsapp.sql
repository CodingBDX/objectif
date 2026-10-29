-- ===== Bouton WhatsApp : le profil indique qu il est joignable sur WhatsApp ===== a lancer UNE fois
alter table public.profiles add column if not exists whatsapp boolean not null default false;
grant update (whatsapp) on public.profiles to authenticated;
