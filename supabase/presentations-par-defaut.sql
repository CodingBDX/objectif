-- ===== Presentation par defaut pour les FAUX profils (et profils crees par SQL, jamais connectes) qui n'en ont pas =====
-- Remplit seulement les presentations vides ou de moins de 150 caracteres. Les vraies escortes (qui se sont deja connectees) ne sont JAMAIS modifiees :
-- on n'ecrit pas a leur place. Plusieurs modeles, choisis au hasard mais de facon stable pour chaque profil.

-- 1) Apercu : profils concernes
select p.name as pseudo, p.city as ville, length(coalesce(p.bio, '')) as longueur, u.email
from public.profiles p join auth.users u on u.id = p.id
where length(coalesce(p.bio, '')) < 150
  and (u.email like '%@objectif.invalid' or u.last_sign_in_at is null)
order by p.city, p.name;

-- 2) Remplissage
update public.profiles p
set bio = replace(replace(
  case when p.genre = 'livecam'
    then (array[
    $q$Bonjour, je suis {n} et je vous retrouve en direct sur mon live. Bonne humeur, échanges sympas et respect de chacun sont au rendez-vous. Rejoignez-moi via le lien de mon profil et dites-moi bonjour dans le chat.$q$,
    $q$Bienvenue sur mon profil, moi c’est {n}. Je propose des lives détendus et conviviaux, dans le respect de tous. Cliquez sur le lien du live pour me rejoindre, et n’hésitez pas à m’écrire pour me donner vos envies de contenu.$q$
    ])[1 + abs(hashtext(p.id::text)) % 2]
    else (array[
    $q$Bonjour, moi c’est {n}. Je vous accueille à {v} dans un cadre calme et soigné. Les rencontres se font sur rendez-vous, avec respect, discrétion et sans précipitation. Message courtois et présentation souhaités, je réponds dès que possible.$q$,
    $q$Je m’appelle {n} et je suis basé(e) à {v}. J’aime les échanges sincères, la bonne humeur et prendre le temps de faire connaissance. Hygiène irréprochable, ponctualité appréciée. Écrivez-moi avec quelques mots de présentation.$q$,
    $q$Bienvenue sur mon profil. Je suis {n}, disponible à {v} et dans les environs. Je privilégie la discrétion, l’écoute et le respect mutuel, pour un moment agréable et naturel. N’hésitez pas à me contacter par message en début de journée.$q$,
    $q$Bonjour, c’est {n}. À {v}, je vous reçois ou je me déplace, selon vos envies et mes disponibilités. Courtoisie et ponctualité sont importantes pour moi. Un petit message de présentation est toujours le bienvenu.$q$,
    $q$Salut, je suis {n}. Souriant(e), curieux(se) et attentionné(e), je vous propose une rencontre détendue à {v}, dans la bonne humeur et la discrétion. Merci de me contacter avec respect et de préciser vos disponibilités.$q$,
    $q$Moi c’est {n}, à {v}. Je cultive l’art de la parenthèse agréable : conversation, complicité et simplicité. Les rendez-vous se prennent à l’avance, dans le respect de chacun. Au plaisir de vous lire.$q$
    ])[1 + abs(hashtext(p.id::text)) % 6]
  end, '{n}', p.name), '{v}', p.city)
from auth.users u
where u.id = p.id
  and length(coalesce(p.bio, '')) < 150
  and (u.email like '%@objectif.invalid' or u.last_sign_in_at is null);

-- 3) Controle : vraies escortes encore sans presentation (non modifiees, a elles de la rediger) -> liste
select p.name as pseudo, p.city as ville, u.email
from public.profiles p join auth.users u on u.id = p.id
where length(coalesce(p.bio, '')) < 150 order by p.city, p.name;
