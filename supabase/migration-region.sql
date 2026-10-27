-- ===== Région enregistrée dans chaque profil (pages « Top région » instantanées) ===== à lancer UNE fois
alter table public.profiles add column if not exists region text check (region is null or char_length(region) <= 60);
revoke update on public.profiles from authenticated;
grant update (name, genre, city, more, specialties, bio, phone, instagram, snapchat, tiktok, site,
              h24, hours, trips, photos, video, paused, vlink, tarif_30, tarif_60, tarif_visible, region) on public.profiles to authenticated;

-- Région des profils d'exemple (les vrais profils l'enregistrent eux-mêmes en sauvegardant leur fiche)
update public.profiles p set region = v.region
from (values
  ('Ajaccio','Corse'),('Amiens','Hauts-de-France'),('Annecy','Auvergne-Rhône-Alpes'),('Besançon','Bourgogne-Franche-Comté'),
  ('Bordeaux','Nouvelle-Aquitaine'),('Chambéry','Auvergne-Rhône-Alpes'),('Clermont-Ferrand','Auvergne-Rhône-Alpes'),('Dijon','Bourgogne-Franche-Comté'),
  ('Grenoble','Auvergne-Rhône-Alpes'),('La Rochelle','Nouvelle-Aquitaine'),('Le Havre','Normandie'),('Lille','Hauts-de-France'),
  ('Limoges','Nouvelle-Aquitaine'),('Lyon','Auvergne-Rhône-Alpes'),('Marseille','Provence-Alpes-Côte d''Azur'),('Metz','Grand Est'),
  ('Montpellier','Occitanie'),('Nancy','Grand Est'),('Nantes','Pays de la Loire'),('Nice','Provence-Alpes-Côte d''Azur'),
  ('Nîmes','Occitanie'),('Paris','Île-de-France'),('Pau','Nouvelle-Aquitaine'),('Perpignan','Occitanie'),
  ('Poitiers','Nouvelle-Aquitaine'),('Rennes','Bretagne'),('Rouen','Normandie'),('Saint-Étienne','Auvergne-Rhône-Alpes'),
  ('Strasbourg','Grand Est'),('Toulouse','Occitanie'),('Tours','Centre-Val de Loire'),('Troyes','Grand Est'),('Valence','Auvergne-Rhône-Alpes')
) as v(city, region)
where p.city = v.city and p.region is null;
