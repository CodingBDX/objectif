-- ===== Comptes crees aujourd'hui (heure de Paris) : email + pseudo =====
select u.email,
       coalesce(p.name, m.pseudo) as pseudo,
       case when p.id is not null then 'profil' when m.id is not null then 'membre' else 'sans profil' end as type,
       p.city as ville,
       (coalesce(u.encrypted_password, '') <> '') as a_un_mot_de_passe,
       u.created_at at time zone 'Europe/Paris' as cree_le
from auth.users u
left join public.profiles p on p.id = u.id
left join public.members  m on m.id = u.id
where (u.created_at at time zone 'Europe/Paris')::date = (now() at time zone 'Europe/Paris')::date
order by u.created_at desc;
