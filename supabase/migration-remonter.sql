-- ===== « Remonter mon annonce » : l'escorte remonte son profil en tete de liste ===== a lancer UNE fois
-- Standard : 1 fois toutes les 24 h. VIP : 1 fois toutes les 12 h (avantage VIP).
alter table public.profiles add column if not exists bumped_at timestamptz;

create or replace function public.bump_my_profile() returns timestamptz
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); last timestamptz; v boolean; wait interval; nxt timestamptz;
begin
  if me is null then raise exception 'Non connecté'; end if;
  select bumped_at, vip into last, v from public.profiles where id = me;
  if not found then raise exception 'Profil introuvable'; end if;
  wait := case when v then interval '12 hours' else interval '24 hours' end;
  if last is not null and last + wait > now() then
    raise exception 'Déjà remontée. Prochaine remontée possible le %', to_char((last + wait) at time zone 'Europe/Paris', 'DD/MM à HH24:MI');
  end if;
  update public.profiles set bumped_at = now() where id = me;
  return now();
end $$;
revoke all on function public.bump_my_profile() from public, anon;
grant execute on function public.bump_my_profile() to authenticated;
