-- ===== PARRAINAGE : 1 mois de VIP offert a l'escorte qui parraine, quand l'amie parrainee est VERIFIEE ===== a lancer UNE fois
-- Prerequis : migration-vip-expiration.sql (table vip_until).
-- Anti-triche : la recompense n'est donnee que lorsque l'admin VERIFIE le profil parraine (pas a l'inscription). Maximum 6 recompenses par escorte.
alter table public.profiles add column if not exists ref_code text;
alter table public.profiles add column if not exists referred_by uuid references public.profiles(id) on delete set null;
alter table public.profiles add column if not exists referral_rewarded boolean not null default false;
create unique index if not exists profiles_ref_code_uniq on public.profiles (ref_code) where ref_code is not null;

-- Mon lien de parrainage (code cree au premier appel)
create or replace function public.my_ref_code() returns text
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); c text;
begin
  if me is null then raise exception 'Non connecté'; end if;
  select ref_code into c from public.profiles where id = me;
  if not found then raise exception 'Crée d''abord ton profil'; end if;
  if c is null then
    loop
      c := substr(md5(random()::text || clock_timestamp()::text), 1, 7);
      exit when not exists (select 1 from public.profiles where ref_code = c);
    end loop;
    update public.profiles set ref_code = c where id = me;
  end if;
  return c;
end $$;

-- Appelee juste apres la creation du profil de l'amie : enregistre qui l'a parrainee (une seule fois, profil de moins de 2 jours, pas soi-meme)
create or replace function public.claim_referral(p_code text) returns boolean
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); ref uuid;
begin
  if me is null or p_code is null then return false; end if;
  select id into ref from public.profiles where ref_code = lower(trim(p_code));
  if ref is null or ref = me then return false; end if;
  update public.profiles set referred_by = ref where id = me and referred_by is null and created_at > now() - interval '2 days';
  return found;
end $$;

-- Mes chiffres : amies parrainees / recompenses obtenues
create or replace function public.my_referrals() returns table (invited int, rewarded int)
language sql security definer set search_path = public as $$
  select count(*)::int, count(*) filter (where referral_rewarded)::int from public.profiles where referred_by = auth.uid()
$$;

-- Recompense : quand un profil parraine passe « verifie », sa marraine gagne 30 jours de VIP (max 6)
create or replace function public.reward_referral() returns trigger
language plpgsql security definer set search_path = public as $$
declare n int; perm boolean;
begin
  if new.verified and not coalesce(old.verified, false) and new.referred_by is not null and not new.referral_rewarded then
    select count(*) into n from public.profiles where referred_by = new.referred_by and referral_rewarded;
    if n < 6 then
      select exists (select 1 from public.profiles p where p.id = new.referred_by and p.vip) and not exists (select 1 from public.vip_until v where v.profile_id = new.referred_by) into perm;
      if not perm then
        update public.profiles set vip = true where id = new.referred_by;
        insert into public.vip_until (profile_id, until) values (new.referred_by, now() + interval '30 days')
        on conflict (profile_id) do update set until = greatest(public.vip_until.until, now()) + interval '30 days';
      end if;
      update public.profiles set referral_rewarded = true where id = new.id;
    end if;
  end if;
  return null;
end $$;
drop trigger if exists profiles_reward_referral on public.profiles;
create trigger profiles_reward_referral after update of verified on public.profiles
for each row execute function public.reward_referral();

revoke all on function public.my_ref_code(), public.claim_referral(text), public.my_referrals() from public, anon;
grant execute on function public.my_ref_code(), public.claim_referral(text), public.my_referrals() to authenticated;
