-- ===== Adresses vérifiées des associations (affichées sur la carte pour les escortes) =====
-- À lancer APRÈS migration-associations-reservees.sql. Sources : annuaires officiels / sites des associations.
update public.associations set address = $q$4 rue Désiré, Lyon$q$, phone = $q$04 78 30 02 65$q$ where slug = 'cabiria-lyon';
update public.associations set address = $q$4 rue Bernard Ortet, 31500 Toulouse$q$, phone = $q$09 53 33 97 13$q$ where slug = 'griselidis-toulouse';
update public.associations set address = $q$3 rue de Bône, 13005 Marseille$q$, phone = $q$04 91 42 42 90$q$, email = $q$contact@autresregards.org$q$, hours = $q$Bureaux ouverts le jeudi de 10h à 12h$q$ where slug = 'autres-regards-marseille';
update public.associations set address = $q$33 rue Fouré, 44000 Nantes$q$, phone = $q$09 54 40 97 43$q$, email = $q$contact@paloma-asso.org$q$, site = $q$https://www.paloma-asso.org$q$ where slug = 'paloma-nantes';
