-- Retire le profil fictif « Camille Demo » (le profil et son telephone partent avec le compte)
delete from auth.users where id = '00000000-0000-4000-8000-000000000901';
