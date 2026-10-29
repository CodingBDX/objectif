-- ===== Comptes dont le mot de passe vient d'etre defini / modifie (aujourd'hui, heure de Paris) =====
-- Supabase ne garde pas la date exacte du changement de mot de passe : on utilise la date de mise a jour du compte (updated_at).
select u.email,
       p.name,
       p.city,
       u.created_at  at time zone 'Europe/Paris' as cree_le,
       u.updated_at  at time zone 'Europe/Paris' as modifie_le,
       u.last_sign_in_at is not null as deja_connecte
from auth.users u
left join public.profiles p on p.id = u.id
where coalesce(u.encrypted_password, '') <> ''
  and (u.updated_at at time zone 'Europe/Paris')::date = (now() at time zone 'Europe/Paris')::date
  and u.updated_at > u.created_at + interval '1 minute'
order by u.updated_at desc;
