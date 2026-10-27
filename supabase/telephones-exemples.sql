-- Numéros FICTIFS pour les 60 profils d'exemple (plage 06 39 98 XX XX réservée à la fiction par l'ARCEP)
update public.profiles
set phone = format('06 39 98 %s %s',
                   lpad((right(id::text, 12)::int / 100)::text, 2, '0'),
                   lpad((right(id::text, 12)::int % 100)::text, 2, '0'))
where id::text like '00000000-0000-4000-8000-%';
