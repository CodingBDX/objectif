-- ===== Associations : visibles uniquement par les profils escortes connectés + liste de départ =====
-- À lancer UNE fois, APRÈS migration-associations.sql.

-- 1) Qui est « profil escorte » : un compte connecté avec un profil (hors livecam). Membres et visiteurs sont exclus.
create or replace function public.is_escort() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.profiles where id = auth.uid() and genre <> 'livecam') $$;
revoke all on function public.is_escort() from public, anon;
grant execute on function public.is_escort() to authenticated;

-- 2) Fiches de départ sans propriétaire, mises en avant, « nationales » = montrées dans toutes les villes
alter table public.associations alter column owner drop not null;
alter table public.associations add column if not exists featured boolean not null default false;
alter table public.associations add column if not exists national boolean not null default false;
alter table public.associations add column if not exists source text;

-- 3) Lecture : plus de lecture anonyme ; fiches validées visibles seulement des profils escortes (et admins / propriétaire via leurs règles)
drop policy if exists "associations validées visibles" on public.associations;
drop policy if exists "associations visibles des escortes" on public.associations;
create policy "associations visibles des escortes" on public.associations
  for select to authenticated using (status = 'approved' and public.is_escort());
revoke select on public.associations from anon;

-- 4) Le garde ne s'applique pas aux opérations faites depuis le SQL Editor (pas d'utilisateur connecté)
create or replace function public.associations_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  if auth.uid() is null or public.is_admin() then return new; end if;
  if tg_op = 'INSERT' then
    new.status := 'pending'; new.admin_note := null; new.featured := false; new.national := false; new.source := null;
  else
    new.owner := old.owner; new.slug := old.slug; new.admin_note := old.admin_note;
    new.featured := old.featured; new.national := old.national; new.source := old.source;
    new.status := 'pending';
  end if;
  return new;
end $$;

-- 4 bis) Une association ne peut pas s'attribuer une fiche de départ ; l'admin la rattache à son compte (colonne owner)

-- 5) Liste de départ : seulement des informations vérifiées (nom, ville, site, contact officiel de la Fédération).
insert into public.associations (owner, slug, name, city, more, description, site, email, phone, status, featured, national, source) values
 (null,'strass-syndicat-du-travail-sexuel','STRASS · Syndicat du travail sexuel','France','{}','Syndicat des travailleur·ses du sexe : défense des droits et soutien, partout en France.','https://strass-syndicat.org',null,null,'approved',true,true,'https://strass-syndicat.org'),
 (null,'federation-parapluie-rouge','Fédération Parapluie Rouge','France','{}','Fédération d’associations de santé communautaire et de défense des droits des travailleur·ses du sexe. Coordonnées de la fédération ; elle peut t’orienter vers l’association la plus proche.','https://parapluierouge.org','contact@parapluierouge.org','+33 6 70 16 28 58','approved',true,true,'https://parapluierouge.org'),
 (null,'cabiria-lyon','Cabiria','Lyon','{}','Association de santé communautaire et de défense des droits des travailleur·ses du sexe, membre de la Fédération Parapluie Rouge.','https://cabiria.asso.fr',null,null,'approved',true,false,'https://parapluierouge.org'),
 (null,'griselidis-toulouse','Grisélidis','Toulouse','{}','Association de santé communautaire et de défense des droits des travailleur·ses du sexe, membre de la Fédération Parapluie Rouge.','https://www.griselidis.com',null,null,'approved',true,false,'https://parapluierouge.org'),
 (null,'autres-regards-marseille','Autres Regards','Marseille','{}','Association de santé communautaire et de défense des droits des travailleur·ses du sexe, membre de la Fédération Parapluie Rouge.','https://autresregards.org',null,null,'approved',true,false,'https://parapluierouge.org'),
 (null,'acceptess-t-paris','Acceptess-T','Paris','{}','Association pour les personnes trans, membre de la Fédération Parapluie Rouge.','https://www.acceptess-t.com',null,null,'approved',true,false,'https://parapluierouge.org'),
 (null,'pastt-paris','PASTT','Paris','{}','Association de santé communautaire, membre de la Fédération Parapluie Rouge.',null,null,null,'approved',true,false,'https://parapluierouge.org'),
 (null,'roses-d-acier-paris','Les Roses d’Acier','Paris','{}','Association de travailleuses du sexe, membre de la Fédération Parapluie Rouge.',null,null,null,'approved',true,false,'https://parapluierouge.org'),
 (null,'bad-boys-paris-marseille','Bad Boys','Paris','{Marseille}','Association de santé communautaire, membre de la Fédération Parapluie Rouge.',null,null,null,'approved',true,false,'https://parapluierouge.org'),
 (null,'bus-des-femmes-paris','Le Bus des Femmes','Paris','{}','Maraudes et accompagnement des personnes prostituées en Île-de-France.',null,null,null,'approved',true,false,'https://www.jeveuxaider.gouv.fr/organisations/15064-le-bus-des-femmes'),
 (null,'paloma-nantes','Paloma','Nantes','{}','Association de santé communautaire, membre de la Fédération Parapluie Rouge.',null,null,null,'approved',true,false,'https://parapluierouge.org'),
 (null,'petrolettes-rennes-brest','Les Pétrolettes','Rennes','{Brest}','Collectif de travailleur·ses du sexe, membre de la Fédération Parapluie Rouge.',null,null,null,'approved',true,false,'https://parapluierouge.org'),
 (null,'chardon-ardent-caen','Chardon Ardent','Caen','{}','Association membre de la Fédération Parapluie Rouge.',null,null,null,'approved',true,false,'https://parapluierouge.org'),
 (null,'prisme-tours','Prisme','Tours','{}','Association membre de la Fédération Parapluie Rouge.',null,null,null,'approved',true,false,'https://parapluierouge.org'),
 (null,'pda-besancon','PDA','Besançon','{}','Association membre de la Fédération Parapluie Rouge.',null,null,null,'approved',true,false,'https://parapluierouge.org'),
 (null,'queer-auvergne-clermont-ferrand','Queer Auvergne','Clermont-Ferrand','{}','Association membre de la Fédération Parapluie Rouge.',null,null,null,'approved',true,false,'https://parapluierouge.org')
on conflict (slug) do nothing;
