-- ===== Recherche tolérante aux fautes (pg_trgm) ===== à lancer UNE fois
create extension if not exists pg_trgm with schema extensions;

create index if not exists profiles_name_trgm on public.profiles using gin (lower(name) extensions.gin_trgm_ops);
create index if not exists profiles_city_trgm on public.profiles using gin (lower(city) extensions.gin_trgm_ops);

-- Renvoie les profils visibles dont le nom ou la ville ressemble à la recherche, du plus proche au moins proche
create or replace function public.search_profiles(q text, lim int default 20)
returns table(id uuid, name text, city text, genre text, score real)
language sql stable security invoker set search_path = public, extensions as $$
  select p.id, p.name, p.city, p.genre,
         greatest(similarity(lower(p.name), lower(q)), similarity(lower(p.city), lower(q))) as score
  from public.profiles p
  where p.paused = false
    and char_length(trim(q)) >= 2
    and (lower(p.name) % lower(q) or lower(p.city) % lower(q)
         or lower(p.name) like '%' || lower(trim(q)) || '%' or lower(p.city) like '%' || lower(trim(q)) || '%')
  order by score desc, p.vip desc
  limit least(coalesce(lim, 20), 50)
$$;
grant execute on function public.search_profiles(text, int) to anon, authenticated;
