-- ===== Boutons WhatsApp et SMS : le profil indique comment on peut le joindre ===== a lancer UNE fois
alter table public.profiles add column if not exists whatsapp boolean not null default false;
alter table public.profiles add column if not exists sms boolean not null default false;
grant update (whatsapp, sms) on public.profiles to authenticated;
