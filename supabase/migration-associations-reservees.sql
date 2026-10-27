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

-- 5) Liste de départ (informations vérifiées uniquement)
insert into public.associations (owner, slug, name, city, more, description, site, email, phone, status, featured, national, source) values
 (null,$q$strass-syndicat-du-travail-sexuel$q$,$q$STRASS · Syndicat du travail sexuel$q$,$q$France$q$,'{}',$q$Syndicat des travailleur·ses du sexe : défense des droits et soutien, partout en France.$q$,$q$https://strass-syndicat.org$q$,null,null,$q$approved$q$,true,true,$q$https://strass-syndicat.org$q$),
 (null,$q$federation-parapluie-rouge$q$,$q$Fédération Parapluie Rouge$q$,$q$France$q$,'{}',$q$Fédération d’associations de santé communautaire et de droits des travailleur·ses du sexe. Elle peut t’orienter vers l’association la plus proche.$q$,$q$https://parapluierouge.org$q$,$q$contact@parapluierouge.org$q$,$q$+33 6 70 16 28 58$q$,$q$approved$q$,true,true,$q$https://parapluierouge.org$q$),
 (null,$q$cabiria-lyon$q$,$q$Cabiria$q$,$q$Lyon$q$,'{}',$q$Association de santé communautaire et de défense des droits des travailleur·ses du sexe, membre de la Fédération Parapluie Rouge.$q$,$q$https://cabiria.asso.fr$q$,null,null,$q$approved$q$,true,false,$q$https://parapluierouge.org$q$),
 (null,$q$griselidis-toulouse$q$,$q$Grisélidis$q$,$q$Toulouse$q$,'{}',$q$Association de santé communautaire et de défense des droits des travailleur·ses du sexe, membre de la Fédération Parapluie Rouge.$q$,$q$https://www.griselidis.com$q$,null,null,$q$approved$q$,true,false,$q$https://parapluierouge.org$q$),
 (null,$q$autres-regards-marseille$q$,$q$Autres Regards$q$,$q$Marseille$q$,'{}',$q$Association de santé communautaire et de défense des droits des travailleur·ses du sexe, membre de la Fédération Parapluie Rouge.$q$,$q$https://autresregards.org$q$,null,null,$q$approved$q$,true,false,$q$https://parapluierouge.org$q$),
 (null,$q$acceptess-t-paris$q$,$q$Acceptess-T$q$,$q$Paris$q$,'{}',$q$Association pour les personnes trans, membre de la Fédération Parapluie Rouge.$q$,$q$https://www.acceptess-t.com$q$,null,null,$q$approved$q$,true,false,$q$https://parapluierouge.org$q$),
 (null,$q$pastt-paris$q$,$q$PASTT$q$,$q$Paris$q$,'{}',$q$Association de santé communautaire, membre de la Fédération Parapluie Rouge.$q$,null,null,null,$q$approved$q$,true,false,$q$https://parapluierouge.org$q$),
 (null,$q$roses-d-acier-paris$q$,$q$Les Roses d’Acier$q$,$q$Paris$q$,'{}',$q$Association de travailleuses du sexe, membre de la Fédération Parapluie Rouge.$q$,null,null,null,$q$approved$q$,true,false,$q$https://parapluierouge.org$q$),
 (null,$q$bad-boys-paris-marseille$q$,$q$Bad Boys$q$,$q$Paris$q$,'{Marseille}',$q$Association de santé communautaire, membre de la Fédération Parapluie Rouge.$q$,null,null,null,$q$approved$q$,true,false,$q$https://parapluierouge.org$q$),
 (null,$q$bus-des-femmes-paris$q$,$q$Le Bus des Femmes$q$,$q$Paris$q$,'{}',$q$Maraudes et accompagnement des personnes prostituées en Île-de-France.$q$,null,null,null,$q$approved$q$,true,false,$q$https://www.jeveuxaider.gouv.fr/organisations/15064-le-bus-des-femmes$q$),
 (null,$q$paloma-nantes$q$,$q$Paloma$q$,$q$Nantes$q$,'{}',$q$Association de santé communautaire, membre de la Fédération Parapluie Rouge.$q$,null,null,null,$q$approved$q$,true,false,$q$https://parapluierouge.org$q$),
 (null,$q$petrolettes-rennes-brest$q$,$q$Les Pétrolettes$q$,$q$Rennes$q$,'{Brest}',$q$Collectif de travailleur·ses du sexe, membre de la Fédération Parapluie Rouge.$q$,null,null,null,$q$approved$q$,true,false,$q$https://parapluierouge.org$q$),
 (null,$q$chardon-ardent-caen$q$,$q$Chardon Ardent$q$,$q$Caen$q$,'{}',$q$Association membre de la Fédération Parapluie Rouge.$q$,null,null,null,$q$approved$q$,true,false,$q$https://parapluierouge.org$q$),
 (null,$q$prisme-tours$q$,$q$Prisme$q$,$q$Tours$q$,'{}',$q$Association membre de la Fédération Parapluie Rouge.$q$,null,null,null,$q$approved$q$,true,false,$q$https://parapluierouge.org$q$),
 (null,$q$pda-besancon$q$,$q$PDA$q$,$q$Besançon$q$,'{}',$q$Association membre de la Fédération Parapluie Rouge.$q$,null,null,null,$q$approved$q$,true,false,$q$https://parapluierouge.org$q$),
 (null,$q$queer-auvergne-clermont-ferrand$q$,$q$Queer Auvergne$q$,$q$Clermont-Ferrand$q$,'{}',$q$Association membre de la Fédération Parapluie Rouge.$q$,null,null,null,$q$approved$q$,true,false,$q$https://parapluierouge.org$q$)
on conflict (slug) do nothing;
