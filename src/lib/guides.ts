/** Guides pratiques pour les escortes (contenu éditorial). Format : « ## titre », « - liste », **gras**. */
export type Guide = { slug: string; title: string; desc: string; emoji: string; date: string; body: string; video?: { src: string; poster: string; label: string; seconds: number } };

export const GUIDES: Guide[] = [
  {
    slug: "profil-vip-mode-d-emploi", emoji: "👑", date: "2026-10-30",
    video: { src: "/videos/vip.mp4", poster: "/videos/vip.jpg", label: "Vidéo : le profil VIP, quand, comment et ce que ça t’apporte (77 secondes, avec voix)", seconds: 77 },
    title: "Profil VIP : quand le prendre, comment faire et ce que ça t'apporte",
    desc: "Mode d'emploi du VIP : passer en premier dans les listes, 20 photos, tarifs détaillés, paiement par Wero ou PayPal, prolongation et VIP gratuit.",
    body: `Le **profil VIP** te donne plus de visibilité et plus de place pour te présenter. Regarde la vidéo ci-dessus (77 secondes), puis retrouve le détail.

## Ce que ça change dans les listes
- Les profils VIP sont affichés **en premier** dans la page de ta ville, avec la couronne 👑 et le badge VIP.
- Ton **slogan** s'affiche sous ton nom pour attirer l'œil.
- **Bénéfice :** les clients te voient avant les autres.

## Ce que ça change sur ton profil
- **Jusqu'à 20 photos** (au lieu de 10).
- **Tarifs détaillés** par durée (30 min, 1 h, 2 h, soirée, nuit).
- **Réseaux sociaux** visibles (Instagram, Snapchat, TikTok…).
- Plus de **villes proches** affichées.
- **Bénéfice :** un profil complet qui donne confiance et déclenche plus de demandes.

## Des outils en plus
- Une **adresse personnalisée** (par exemple /fille/lyon/ton-nom), plus facile à partager et meilleure pour le référencement. Tu peux la désactiver pour rester plus discrète.
- Une **remontée** dans la liste plus fréquente qu'avec un profil standard.
- Tes **statistiques** : vues, clics sur ton contact, favoris.
- **Bénéfice :** tu vois ce qui marche et tu ajustes.

## Quand le prendre ?
- Pour un **déplacement** : tes clients te trouvent dès ton arrivée.
- Pour un **week-end chargé** : tu veux plus de demandes sur une courte période.
- Pour **lancer ton profil** : tu te démarques dès le début.
Tu choisis la durée qui te convient (par exemple 2 jours, 5 jours ou 1 mois) : tu ne paies que quand tu en as besoin. Les tarifs sont affichés dans Modifier mon profil.

## Comment faire ?
- Ouvre **Modifier mon profil** et choisis ton **forfait**.
- Paie par **Wero ou PayPal** en suivant les indications affichées.
- Clique sur **« J'ai payé »**.
- Dès que le paiement est vérifié, ton **VIP est activé**.

## Prolonger, mettre en pause
- Si tu prolonges, les jours s'**ajoutent à la fin** de ton VIP en cours : aucun jour perdu.
- Si ton profil est **en pause**, le décompte **s'arrête**.

## Du VIP gratuit
- **1 mois offert** pour chaque amie que tu parraines et dont le profil est vérifié (6 mois maximum).
- **7 jours de VIP** contre **400 points** (voir l'article « Points et couronnes »).

## À la fin du VIP
Ton profil repasse **tout seul en profil gratuit**, sans démarche ni frais. Tes informations VIP sont conservées si tu reviens plus tard.

## Questions fréquentes
**Est-ce un abonnement ?**
Non : tu paies une durée précise, sans renouvellement automatique.

**Comment est vérifié mon paiement ?**
Tu cliques sur « J'ai payé » : le paiement est vérifié à la main, puis ton VIP est activé.

**Puis-je cacher mon adresse personnalisée ?**
Oui, tu peux la désactiver dans Modifier mon profil.`
  },
  {
    slug: "points-et-couronnes-mode-d-emploi", emoji: "⭐", date: "2026-10-30",
    video: { src: "/videos/points.mp4", poster: "/videos/points.jpg", label: "Vidéo : le système de points et ce que ça t’apporte (57 secondes, avec voix)", seconds: 57 },
    title: "Points et couronnes : gagne des avantages sur Sex-Escorte",
    desc: "Comment gagner des points, monter de couronne (Bronze, Argent, Or, Diamant) et les échanger contre une remontée ou des jours de VIP.",
    body: `Plus ton profil est complet et actif, plus tu gagnes de **points**. Ils débloquent des **couronnes** visibles sur ton profil et s'échangent contre des avantages. Tout se passe dans la carte **⭐ Mes points** de Modifier mon profil.

Regarde la vidéo ci-dessus (57 secondes), puis retrouve le détail.

## Comment gagner des points
- **+50** : profil complet (3 photos et une présentation d'au moins 150 caractères), une seule fois.
- **+100** : profil vérifié, une seule fois.
- **+150** : pour chaque amie que tu parraines, une fois son profil vérifié (6 amies maximum).
- **+1** : par jour de connexion.
- **+1** : par jour de VIP.

## Le parrainage, en plus
Chaque amie qui crée son profil avec ton lien et dont le profil est vérifié te donne aussi **1 mois de VIP offert** (6 mois au maximum). C'est une récompense à part, en plus des 150 points.

## Les couronnes
Ton niveau dépend du total de points **gagnés** :
- 🥉 **Bronze** à 250 points
- 🥈 **Argent** à 700 points
- 🥇 **Or** à 1 500 points
- 💎 **Diamant** à 3 000 points

La couronne s'affiche sur ton profil, à côté de tes badges. **Ton niveau ne baisse jamais**, même quand tu dépenses tes points.

## Dépenser ses points
- **Remonter maintenant** : 60 points. Ton profil passe en tête de liste tout de suite.
- **7 jours de VIP** : 400 points.

Le solde « à dépenser » baisse quand tu échanges, mais le total gagné (et donc ta couronne) reste le même.

## Ce que ça t'apporte
- **Plus de confiance** : un profil complet, vérifié et couronné rassure les clients.
- **Plus de visibilité** : tu peux remonter en tête de liste avec tes points.
- **Du VIP offert** : par le parrainage (1 mois par amie vérifiée) ou en échangeant 400 points contre 7 jours.
- **Aucun risque** : ton niveau ne baisse jamais.

## Pour monter vite
- Complète ton profil et fais-le **vérifier** : tu démarres à 150 points.
- **Parraine** tes amies : c'est la voie la plus rapide, 150 points chacune plus un mois de VIP.
- Connecte-toi régulièrement : le point du jour est petit, mais il s'additionne.

## Questions fréquentes
**Mes points expirent-ils ?**
Non : les points gagnés restent acquis. Seul ton solde à dépenser baisse quand tu échanges.

**Puis-je perdre ma couronne ?**
Non, ton niveau ne baisse jamais.

**Où voir mes points ?**
Dans Modifier mon profil, carte « ⭐ Mes points » : solde, niveau, progression et boutons d'échange.`
  },
  {
    slug: "trouver-un-profil-categories-villes-filtres", emoji: "🔎", date: "2026-10-30",
    video: { src: "/videos/trouver-un-profil.mp4", poster: "/videos/trouver-un-profil.jpg", label: "Vidéo : comment les clients te trouvent et ce que ça t’apporte (50 secondes, avec voix)", seconds: 50 },
    title: "Trouver un profil : catégories, villes, filtres, carte et favoris",
    desc: "Mode d'emploi de l'annuaire : choisir une catégorie et une ville, affiner avec les filtres, utiliser la carte et suivre ses favoris.",
    body: `L'annuaire Sex-Escorte se parcourt en quelques gestes. Voici comment retrouver le bon profil rapidement.

Regarde la vidéo ci-dessus (45 secondes), puis retrouve le détail.

## 1. Choisir une catégorie
Filles, hommes, trans ou livecam : chaque catégorie a sa **propre page**. Tu peux aussi voir tous les profils ensemble depuis l'accueil.

## 2. Choisir une ville
- Tape le nom d'une ville dans la recherche : une **suggestion** se propose.
- Ou utilise **« Près de moi »** pour voir les profils autour de toi.
- Chaque ville a **sa page**, avec les profils de la ville, ceux qui **arrivent bientôt** et les profils **à la une**.

## 3. Affiner avec les filtres
Tu peux filtrer par **spécialités**, **tarif maximum**, **durée**, **âge**, **taille**, **langue parlée**, et plus encore. Des interrupteurs te permettent de ne garder que :
- les profils **vérifiés** ;
- les profils **disponibles maintenant** ;
- les profils **avec vidéo de présentation** ;
- ceux qui **reçoivent** ou qui **se déplacent**.

Un bouton « Tout effacer » remet les filtres à zéro.

## 4. Utiliser la carte
La **carte** montre où se trouvent les profils. Pratique pour repérer une zone ou voir qui est proche de toi.

## 5. Garder ses favoris
Un clic sur le **cœur** ajoute un profil à tes favoris. Tu les retrouves ensuite dans l'onglet **Favoris**. Sur la page d'un profil, tu peux aussi choisir d'être **prévenu par e-mail** quand il redevient disponible.

## Pour les escortes : être bien trouvée
- Renseigne ta **ville** et tes **villes de passage** : c'est ce qui te fait apparaître sur chaque page de ville.
- Coche **Je reçois** et **Je me déplace** selon ta situation.
- Ajoute tes **spécialités**, tes **tarifs** et tes **horaires** : plus ton profil est complet, plus il ressort dans les filtres.
- Utilise le **calendrier de passages** pour apparaître avant ton arrivée dans une autre ville.`
  },
  {
    slug: "calendrier-de-passages-mode-d-emploi", emoji: "📅", date: "2026-10-30",
    video: { src: "/videos/calendrier.mp4", poster: "/videos/calendrier.jpg", label: "Vidéo : comment fonctionne le calendrier de passages (46 secondes, avec voix)", seconds: 46 },
    title: "Le calendrier de passages : annonce tes dates et sois attendue",
    desc: "Mode d'emploi du calendrier Sex-Escorte : ajouter tes déplacements, choisir ce qui est public et apparaître dans « Arrivent bientôt » avant ton arrivée.",
    body: `Tu voyages, tu passes quelques jours dans une autre ville ? Le **calendrier de passages** permet aux clients de savoir **où tu seras et quand**, avant même ton arrivée. Résultat : des demandes à l'avance et un planning déjà rempli à ton arrivée.

Regarde la vidéo ci-dessus (46 secondes), puis retrouve le détail étape par étape.

## En trois gestes
- **Ajoute** une ville et des dates dans Modifier mon profil.
- **Choisis** ce qui est public avec un simple interrupteur.
- **Laisse le site faire** : ton passage apparaît au bon moment, au bon endroit.

## 1. Ajouter un passage
- Ouvre **Modifier mon profil**, rubrique **Prochains déplacements**.
- Tape le nom de la ville : une **suggestion** se propose, il te suffit de la choisir.
- Renseigne la date d'**arrivée** et de **départ**.
- Tu pars dans plusieurs villes ? Le bouton **＋** ajoute **autant de dates que tu veux**. Tu peux aussi en supprimer une à tout moment.

## 2. Choisir ce qui est public
Un **interrupteur** te laisse décider si ton arrivée est annoncée dans la rubrique **« Arrivent bientôt »**. Il est éteint ? Personne ne voit tes dates sur cette rubrique. Il est allumé ? Les clients de la ville peuvent te trouver.

C'est **toi** qui décides, ville par ville et date par date : rien n'est publié sans ton accord.

## 3. Ce que voient les clients
- Sur ton profil, un slide **« Prochains passages »** s'affiche **au-dessus de ta présentation**, avec tes villes et tes dates.
- Dans l'annuaire d'une ville, juste sous **« À la une »**, l'encart **« Arrivent bientôt »** présente les profils qui arrivent **dans les 3 prochains jours**.
- Les clients des **villes voisines** (jusqu'à **50 km**) le voient aussi : c'est utile pour une agglomération.
- Un filtre **« Arrive bientôt (1 mois) »** leur permet de repérer à l'avance les passages du mois et de planifier.

## Pourquoi l'utiliser ?
- **Plus de visibilité** : tu es trouvée avant d'arriver, pas seulement une fois sur place.
- **Un planning déjà rempli** : les clients te contactent pour réserver un créneau.
- **Moins de questions répétées** : tes dates sont claires sur ton profil.
- **Aucune obligation** : tu gardes la main sur ce qui est affiché.

## Nos conseils
- **Mets à jour** tes dates dès qu'elles changent : une date dépassée disparaît toute seule.
- Précise dans ta **présentation** ta ville de passage, tes horaires et ton mode de contact.
- Pense à ta **sécurité** en déplacement : voir le guide « Préparer un déplacement ou une tournée ».
- Ajoute plusieurs dates à l'avance : un client qui planifie cherche souvent **un mois avant**.

## Questions fréquentes
**Puis-je cacher mes dates ?**
Oui. Éteins l'interrupteur : tes dates ne sont plus annoncées dans « Arrivent bientôt ». Tu peux le rallumer quand tu veux.

**À partir de quand mon arrivée est-elle annoncée ?**
Dans l'encart « Arrivent bientôt », elle apparaît **3 jours avant** ton arrivée. Le filtre « Arrive bientôt » permet, lui, de voir les passages du **mois** à venir.

**Combien de villes puis-je ajouter ?**
Autant que tu veux, avec le bouton **＋**.

**Est-ce payant ?**
Non : le calendrier est inclus dans ton profil.`
  },
  {
    slug: "creer-un-profil-qui-attire", emoji: "📸", date: "2026-10-29",
    title: "Créer un profil qui attire : photos, texte et tarifs",
    desc: "Les clés d'un profil clair et rassurant : choisir ses photos, écrire sa présentation, afficher ses tarifs et rester discrète.",
    body: `Un bon profil fait gagner du temps : les bons clients te contactent, les autres passent leur chemin. Voici comment le construire, pas à pas.

## Les photos
- **Une photo principale nette**, lumineuse, cadrée sur toi (visage visible ou non, c'est ton choix). C'est elle qui apparaît dans les listes.
- **3 à 6 photos** suffisent : portrait, silhouette, ambiance. Mieux vaut peu de belles photos que beaucoup de moyennes.
- **Des photos récentes** et fidèles : une personne qui ne ressemble pas à ses photos est la première cause de rendez-vous qui se passent mal.
- Évite les photos avec des éléments qui te localisent (numéro de rue, plaque, vue reconnaissable) ou qui révèlent ton identité (documents, tatouages très reconnaissables si tu veux rester discrète).
- Sur Sex-Escorte, tu peux ajouter ta photo en la téléversant ou en collant un lien d'image.

## Ta présentation
- Écris à la première personne, avec des phrases simples. Compte **150 caractères au minimum**, un peu plus si tu veux te démarquer.
- Parle de **ce que tu proposes**, de ton **ambiance** (douce, élégante, souriante…), de tes **conditions** (sur rendez-vous, prévenir à l'avance, hygiène, respect).
- Dis ce que tu **ne fais pas** : c'est la meilleure façon d'éviter les demandes déplacées.
- Termine par une consigne de contact claire : « message courtois avec présentation, je réponds en début d'après-midi ».
- Relis-toi : les fautes d'orthographe fatiguent et font fuir.

## Les tarifs
- Afficher ses tarifs filtre les curieux. Les profils VIP peuvent détailler plusieurs durées (30 min, 1 h, soirée, nuit).
- Reste **cohérente** : un tarif trop bas attire les profils à problèmes, un tarif trop haut sans justification reste sans réponse.
- Précise ce qui est inclus (déplacement, durée exacte) pour éviter les discussions sur place.

## Tes disponibilités
- Renseigne tes **horaires** : ton profil affiche « Dispo » pendant ces heures et peut être mis en avant avec le filtre « Disponibles maintenant ».
- Si tu voyages, ajoute tes **passages** : les clients de la ville le verront à l'avance.

## Le petit plus
Un **slogan court** (VIP), un profil **vérifié** et une présentation soignée donnent confiance. Prends dix minutes une fois par mois pour mettre à jour tes photos, tes horaires et tes tarifs.`
  },
  {
    slug: "securite-avant-pendant-apres-un-rendez-vous", emoji: "🛡️", date: "2026-10-29",
    title: "Sécurité : avant, pendant et après un rendez-vous",
    desc: "Une routine simple pour te protéger : filtrer les demandes, prévenir une amie, poser tes limites et réagir en cas de problème.",
    body: `La sécurité n'est pas de la méfiance : c'est une routine qui te permet de travailler l'esprit tranquille. Voici les réflexes les plus utiles.

## Avant le rendez-vous
- **Échange par écrit d'abord.** Un client sérieux sait écrire, se présenter et accepter tes conditions. Un client pressé, qui insiste ou négocie dès le premier message est un signal d'alerte.
- **Vérifie le numéro** : sur Sex-Escorte, l'outil « Vérifier un numéro » te dit si d'autres profils l'ont signalé.
- **Confirme les conditions** (durée, tarif, lieu) avant de te déplacer ou de recevoir.
- **Prévenir une amie** : envoie-lui le lieu, l'heure, la durée prévue et l'heure à laquelle tu lui confirmes que tout va bien. La carte « Ma sécurité » de ton espace prépare le message en un clic.
- Si tu reçois, **choisis un lieu où tu te sens en confiance** et dispose d'un moyen de prévenir facilement.

## Pendant le rendez-vous
- **Fais-toi confiance.** Si quelque chose te met mal à l'aise, tu peux arrêter. Tu n'as pas à te justifier.
- Garde ton téléphone à portée de main et **sache où se trouve la sortie**.
- **Pose tes limites dès le début**, calmement. Un client respectueux les accepte sans discuter.
- Règle ce qui doit l'être **au début** : un client qui refuse de payer avant ou qui change les règles en cours de route est un risque.
- Ne consomme pas d'alcool ou de produits qui t'ôtent ta vigilance si tu ne te sens pas en sécurité.

## Après le rendez-vous
- **Confirme à ton amie** que tout va bien (bouton « Tout va bien »).
- Si le client a eu un comportement dangereux, **signale son numéro** sur la page « Vérifier un client » : tu protèges toutes les autres.
- Note ce qui s'est passé tant que tu t'en souviens (date, heure, ce qui a été dit) : cela peut servir si tu portes plainte.

## En cas de danger
- En France, **17** (police) ou **112** (numéro d'urgence européen). Si tu ne peux pas parler, le **114** accepte les SMS.
- Tu peux aussi te rapprocher d'associations de soutien : la page « Associations » du site les liste par ville.
- Une agression est **toujours** de la responsabilité de l'agresseur, quelle que soit ton activité.`
  },
  {
    slug: "reperer-arnaques-et-mauvais-clients", emoji: "🚩", date: "2026-10-29",
    title: "Repérer les arnaques et les mauvais clients",
    desc: "Les signaux qui doivent t'alerter : faux rendez-vous, demandes d'avance, chantage, faux clients et faux profils.",
    body: `Quelques arnaques reviennent sans cesse. Les connaître te fait gagner du temps et de l'argent.

## Les arnaques les plus courantes
- **L'avance ou le « dépôt »** demandé par un faux intermédiaire : des tickets de paiement, des cartes prépayées, des virements « pour réserver ». Ne donne jamais de code de carte ni de numéro de compte à un inconnu.
- **Le faux paiement** : une capture d'écran de virement « effectué » alors que rien n'est arrivé. Vérifie sur ton propre compte, pas sur une image.
- **Le faux rendez-vous** : un client qui te fait déplacer puis disparaît, ou qui te fait attendre à un faux lieu.
- **Le chantage** : menace de montrer tes photos ou de révéler ton activité. Ne paie pas : garde les preuves (messages, numéros) et signale-le. Une association de soutien peut t'accompagner.
- **Le faux client « journaliste »** ou « enquêteur » qui te pose des questions trop précises sur ta vie privée.

## Les signaux d'alerte
- Un client qui **refuse d'envoyer un message** ou d'appeler, mais insiste pour que tu t'engages tout de suite.
- Quelqu'un qui **négocie agressivement** ou qui change les conditions au dernier moment.
- Un numéro **déjà signalé** par d'autres profils (outil « Vérifier un numéro »).
- Un message **copié-collé** identique à ceux que reçoivent d'autres profils.
- Un site ou un lien que l'on te demande de visiter pour « te vérifier » : ne saisis jamais tes identifiants ailleurs que sur le site officiel.

## Les faux profils et les usurpations
- Si **tes photos sont utilisées** sur un autre profil, utilise le bouton **« Signaler ce profil »** (motif « Usurpation d'identité » ou « Photos publiées sans mon accord »). L'équipe examine rapidement.
- Un profil **vérifié** (badge) rassure : la personne a prouvé qu'elle correspond à ses photos.

## Les bons réflexes
- Ne partage **jamais** ton adresse personnelle ni ton nom complet.
- Garde un **numéro dédié** à ton activité.
- **Écris, ne parle pas** si tu as un doute : les messages servent de preuve.
- Fais confiance à ton instinct : si tu hésites, la réponse est souvent non.`
  },
  {
    slug: "se-faire-verifier", emoji: "✔", date: "2026-10-29",
    title: "Se faire vérifier : pourquoi et comment",
    desc: "Le badge « profil vérifié » rassure les visiteurs et te protège contre l'usurpation. Voici comment l'obtenir en quelques minutes.",
    body: `Le badge **✔ vérifié** montre aux visiteurs que les photos sont bien les tiennes. C'est l'un des meilleurs moyens de gagner leur confiance, et de te protéger si quelqu'un utilise tes photos.

## Pourquoi se faire vérifier ?
- **Plus de messages sérieux** : les clients préfèrent les profils vérifiés.
- **Protection** contre l'usurpation : ton profil original se distingue d'une copie.
- Le filtre **« Profils vérifiés »** te met en avant.
- Avec le **parrainage**, une amie que tu as parrainée et qui est vérifiée te fait gagner 1 mois de VIP.

## Comment ça marche ?
- Dans **Mon espace**, ouvre la carte **« Faire vérifier mon profil »**.
- Prends une **photo de toi** en tenant un papier sur lequel tu écris à la main le texte indiqué (le nom du site et la date du jour).
- Ton visage et le papier doivent être bien visibles.
- L'équipe compare avec tes photos et valide ton profil.

## Ta vie privée
- **Seule l'équipe** voit cette photo.
- Elle n'est **jamais publiée** et elle est **supprimée dès qu'on a répondu**.
- Si tu préfères ne pas montrer ton visage sur ton profil, tu peux quand même être vérifiée : le badge atteste la correspondance, pas ton identité.

## Si ta demande est refusée
- Reprends la photo avec une meilleure lumière, le papier bien lisible et le visage dégagé.
- Si tu as un doute, écris-nous via la page **Contact** : on te répond avec plaisir.`
  },
  {
    slug: "proteger-sa-vie-privee", emoji: "🔒", date: "2026-10-29",
    title: "Protéger sa vie privée : numéro, photos et pseudo",
    desc: "Séparer ton activité de ta vie personnelle : numéro dédié, pseudo, photos, messages et paramètres utiles.",
    body: `Ta vie privée t'appartient. Quelques habitudes simples évitent la plupart des problèmes.

## Ton numéro de téléphone
- Utilise un **numéro dédié** (deuxième carte SIM, numéro internet, application de seconde ligne) plutôt que ton numéro personnel.
- Sur Sex-Escorte, ton numéro n'est **pas affiché directement** : le visiteur clique pour le révéler, avec une limite par heure qui empêche de collecter les numéros en masse.
- **Ne le publie pas** ailleurs en clair (réseaux sociaux ouverts) sans y réfléchir.

## Ton pseudo et ton identité
- Choisis un pseudo qui **n'a aucun lien** avec ton nom, ton quartier, ton employeur ou tes autres réseaux.
- Utilise une **adresse e-mail dédiée** pour ton compte.
- N'utilise pas le même mot de passe que sur d'autres sites : le site te propose une **suggestion de mot de passe sûr** à l'inscription.

## Tes photos
- Retire les **métadonnées** (lieu de prise de vue) : la plupart des réseaux le font, pas tous. Une capture d'écran de la photo supprime ces informations.
- Évite les **arrière-plans identifiables** (immeuble, vue, objets personnels).
- Une **recherche d'image inversée** (par exemple avec ton moteur de recherche) te montre où tes photos apparaissent. Signale les usages non autorisés.

## Tes messages
- Utilise **WhatsApp ou SMS** depuis ton numéro dédié, pas depuis ton compte personnel.
- Active la **double authentification** sur ton e-mail et sur tes comptes.
- Ne confie pas ton adresse avant d'avoir un échange sérieux.

## Au quotidien
- Si tu ne veux pas être référencée partout, **décoche** l'option « adresse personnalisée » dans Mon profil (VIP) : ton profil reste plus discret.
- Tu peux **mettre ton annonce en pause** à tout moment, et la réactiver quand tu veux.
- Tu peux **supprimer ton profil** définitivement depuis Mon profil.`
  },
  {
    slug: "debuter-checklist", emoji: "🌶️", date: "2026-10-29",
    title: "Débuter sereinement : la check-list de départ",
    desc: "Les premières étapes pour lancer ton activité : profil, sécurité, organisation et premiers rendez-vous.",
    body: `Si tu débutes, voici un ordre simple pour avancer sans te précipiter.

## Avant de publier
- Prends le temps de **réfléchir à tes limites** : ce que tu acceptes, ce que tu refuses, tes tarifs, tes horaires.
- Prépare un **numéro dédié** et une **adresse e-mail dédiée**.
- Parle à **une personne de confiance** de ton projet : elle pourra être ton contact de sécurité.
- Renseigne-toi sur le **cadre légal** (voir notre guide) et sur les **associations** près de chez toi.

## Créer ton profil
- Choisis tes **photos** et écris ta **présentation** (voir « Créer un profil qui attire »).
- Renseigne tes **horaires**, ta ville et les villes voisines.
- Demande la **vérification** : elle rassure dès le départ.
- Profite de l'**offre VIP** de bienvenue si elle est en cours.

## Tes premiers rendez-vous
- Commence par des **créneaux courts** et des clients qui écrivent bien.
- **Préviens ton contact de sécurité** avant chaque rendez-vous (carte « Ma sécurité »).
- Prévois de quoi te sentir en sécurité : lieu connu, sortie facile, téléphone chargé.
- Note ce qui s'est bien passé et ce que tu changerais.

## Prendre soin de toi
- Ton **bien-être** passe avant tout : repos, hygiène, suivi de santé régulier.
- N'hésite pas à te faire **accompagner** par une association : écoute, santé, démarches.
- Tu as le droit de **faire une pause** ou d'arrêter quand tu veux.

## Rester organisée
- Garde une **trace** de tes revenus : c'est utile pour tes démarches et ta tranquillité.
- Mets à jour ton profil **une fois par mois**.
- Utilise ton **espace statistiques** : tu verras quels jours et quelles photos fonctionnent le mieux.`
  },
  {
    slug: "cadre-legal-en-france", emoji: "⚖️", date: "2026-10-29",
    title: "Le cadre légal en France : repères généraux",
    desc: "Des repères simples sur la loi, les droits et les démarches, à titre informatif. Ce n'est pas un conseil juridique.",
    body: `**Cette page donne des repères généraux, pas un conseil juridique.** La loi évolue et chaque situation est différente : pour ton cas précis, adresse-toi à un avocat ou à une association spécialisée.

## Ce qu'il faut retenir
- En France, **vendre ses propres services sexuels n'est pas en soi interdit**, mais plusieurs activités qui l'entourent sont encadrées ou punies.
- Depuis la **loi de 2016**, c'est le **client** qui est pénalisé, et non la personne qui se prostitue. Les règles exactes (sanctions, stages) peuvent évoluer : vérifie-les à jour.
- Le **proxénétisme** (organiser, profiter ou contraindre l'activité d'autrui) est puni sévèrement. Tu restes **indépendante** : personne ne doit te contraindre, te prendre ton argent ni décider à ta place.
- Tu dois être **majeure**. Toute implication d'une personne mineure est interdite et signalée.

## Tes droits
- Tu peux **refuser** un client, une pratique ou un rendez-vous à tout moment.
- Tu peux **porter plainte** en cas de violence, de vol, de menace ou de harcèlement, quelle que soit ton activité.
- Tu peux demander l'**aide d'associations** : santé, écoute, accompagnement juridique, démarches administratives.

## Les démarches
- Les revenus d'une activité indépendante doivent en principe être **déclarés**. Le bon statut et la bonne façon de déclarer dépendent de ta situation : demande conseil à un professionnel (comptable, avocat) ou à une association.
- Garde une **trace** de tes revenus.
- Pour ta **protection sociale** et ta santé, des associations peuvent t'orienter.

## Où trouver de l'aide
- Ouvre la page **Associations** du site : elles sont classées par ville.
- Pour une urgence : **17** ou **112**. Pour une écoute, de nombreuses associations tiennent des permanences.

## Sur Sex-Escorte
Le site est **réservé aux adultes**, s'engage contre les **réseaux de proxénétisme** et la **traite**, et examine rapidement tout signalement (personne mineure, contrainte, usurpation). Si tu es en difficulté, écris-nous via **Contact** ou rapproche-toi d'une association.`
  },
  {
    slug: "profil-vip-ce-que-ca-change", emoji: "👑", date: "2026-10-29",
    title: "Profil VIP : ce que ça change concrètement",
    desc: "Photos en plus, tarifs détaillés, adresse personnalisée, remontée d'annonce : tout ce que le VIP apporte à ton profil.",
    body: `Le VIP est une option pour **gagner en visibilité** et en confort. Voici ce qu'il change.

## Plus de place pour te présenter
- **Jusqu'à 20 photos** (au lieu de 10).
- **Tarifs détaillés** par durée (30 min, 1 h, 2 h, soirée, nuit).
- **Réseaux sociaux** visibles (Instagram, Snapchat, TikTok, site).
- Plus de **villes proches** affichées.
- Un **slogan** d'accroche sous ton nom.

## Plus de visibilité
- Les profils VIP sont **affichés en premier** dans les listes.
- Le badge 👑 attire l'œil.
- Une **adresse personnalisée** (par exemple /fille/bordeaux/camille), plus facile à partager et meilleure pour le référencement. Tu peux la désactiver si tu préfères rester plus discrète.
- La **remontée d'annonce** : toutes les 12 h pour un profil VIP (24 h pour un profil standard).

## Plus de suivi
- Tes **statistiques** : vues, clics sur ton contact, copies, réseaux.

## Comment l'obtenir ?
- Pendant l'offre de lancement, **1 mois de VIP est offert** à l'inscription. Sans code, sans paiement.
- Tu peux aussi gagner **1 mois de VIP** pour chaque amie que tu parraines et dont le profil est vérifié (6 mois maximum).
- Sinon, écris-nous via la page **Contact** pour connaître les tarifs.

## Et après ?
À la fin de la période, ton profil repasse **tout seul en profil gratuit**, sans frais ni démarche. Tes informations VIP sont conservées si tu reviens plus tard.`
  },
  {
    slug: "fixer-ses-tarifs", emoji: "💶", date: "2026-10-30",
    title: "Fixer ses tarifs : comment trouver le bon prix",
    desc: "Comment choisir ses tarifs, les structurer par durée, éviter les négociations et les ajuster dans le temps.",
    body: `Un tarif bien pensé te protège des discussions interminables et attire des clients qui respectent ton temps. Voici une méthode simple.

## Partir de ta réalité
- Compte ce que tu dois couvrir : **déplacements, logement, tenues, entretien, publicité, impôts et cotisations** si tu es déclarée.
- Regarde **3 à 5 profils comparables** dans ta ville (même âge, même style, même niveau de services). Ne copie pas : situe-toi.
- Une ville touristique ou une grande métropole supporte des tarifs plus élevés qu'une petite ville.

## Structurer ses tarifs
- Propose **quelques durées claires** : 30 minutes, 1 heure, 2 heures, soirée, nuit. Trop d'options compliquent la lecture.
- Plus la durée est longue, plus le **prix par heure baisse** : c'est normal et ça encourage les rendez-vous plus longs.
- Indique ce qui est **inclus** (durée exacte, déplacement, accueil) et ce qui est **en supplément**.
- Affiche tes tarifs sur ton profil : cela filtre les curieux et évite les messages sans suite.

## Négociation et acompte
- **Ne négocie pas ta valeur.** Une phrase courte et aimable suffit : « Mes tarifs sont fixes. »
- Tu peux demander un **acompte raisonnable** pour un déplacement lointain ou une nuit entière. Évite les paiements par des moyens qui t'exposent (coordonnées bancaires complètes, liens suspects).
- Méfie-toi des clients qui offrent beaucoup plus que ton tarif pour un « petit service » à l'avance : c'est un schéma d'arnaque classique.

## Faire évoluer ses tarifs
- Augmente **un peu et régulièrement** plutôt qu'une grosse fois : par exemple après un profil vérifié, de nouvelles photos ou une hausse de demandes.
- Si tu reçois **trop** de demandes, c'est souvent le signe que tu peux monter. Si tu n'en reçois **aucune**, vérifie d'abord tes photos et ta présentation avant de baisser.
- Note tes rendez-vous du mois : tu verras vite quelles durées te conviennent le mieux.`
  },
  {
    slug: "bien-communiquer-avec-les-clients", emoji: "💬", date: "2026-10-30",
    title: "Bien communiquer avec les clients : messages types et limites",
    desc: "Des exemples de réponses courtes et polies pour filtrer les demandes, poser tes limites et rester maître de la conversation.",
    body: `La façon dont tu écris donne le ton de tout le rendez-vous. Quelques phrases préparées à l'avance te font gagner du temps et de la tranquillité.

## Les principes
- **Reste courte, claire et polie.** Tu n'as pas à te justifier.
- Réponds **quand ça te convient**. Un client sérieux sait attendre.
- Garde la conversation **écrite** au début : elle t'aide à repérer les profils problématiques.
- Ne donne **jamais** ton adresse avant d'avoir confirmé le rendez-vous et vérifié le client.

## Messages types
- **Première réponse** : « Bonjour, merci pour votre message. Je suis disponible [jour] à [heure]. Pour une durée de [durée], mon tarif est de [prix]. Pouvez-vous vous présenter en deux mots ? »
- **Tarif non négociable** : « Mes tarifs sont fixes, merci de votre compréhension. »
- **Demande hors de tes limites** : « Ce n'est pas quelque chose que je propose. Si le reste vous convient, je serai ravie de vous accueillir. »
- **Client insistant** : « Je préfère en rester là. Je vous souhaite une bonne journée. » Puis **bloque** si ça continue.
- **Annulation de ta part** : « Je dois malheureusement annuler pour raison personnelle. Je m'excuse pour la gêne. »

## Les signaux d'alerte
- Messages **flous**, pressants ou très insistants sur l'adresse dès le premier échange.
- Refus de te donner un **prénom** ou une façon de le joindre.
- Demande de **photos, vidéos ou documents** personnels avant toute rencontre.
- Offre de **payer à l'avance en trop** et de se faire rembourser la différence.
Dans ces cas, **ne réponds plus** et, si besoin, signale-le : tu n'as aucune obligation de continuer.

## Après le rendez-vous
Un message court et aimable (« Merci pour ce moment ») fidélise sans t'engager. Tu peux aussi signaler un client problématique pour protéger les autres escortes.`
  },
  {
    slug: "choisir-et-preparer-son-logement", emoji: "🏠", date: "2026-10-30",
    title: "Choisir et préparer son logement pour recevoir",
    desc: "Appartement, hôtel, location courte durée : comment choisir un lieu discret et sûr, et le préparer pour accueillir.",
    body: `Le lieu compte autant que ta présentation : il doit être **sûr, discret et agréable**. Voici les points à vérifier.

## Les options
- **Chez toi** : le plus simple, mais il expose ton adresse. À éviter si tu veux garder ta vie privée.
- **Un appartement dédié** : sépare ta vie privée et ton activité. Vérifie ce que dit ton **bail** et le règlement de copropriété.
- **Un hôtel** : discret et sans engagement, mais plus cher. Certains établissements n'acceptent pas les visites : renseigne-toi.
- **Une location courte durée** : pratique en déplacement, mais lis bien les **conditions de la plateforme et du propriétaire**. Beaucoup interdisent expressément cet usage et peuvent te bannir.

## Critères de choix
- **Discrétion** : entrée sans passage, pas de voisins curieux, pas de gardien trop présent.
- **Sécurité** : porte qui ferme bien, digicode ou interphone, bon éclairage, quartier calme.
- **Accès** : facile à trouver pour un client, avec un transport ou un parking à proximité.
- **Sortie** : sache toujours comment tu peux sortir rapidement.

## Préparer les lieux
- Un lieu **propre, rangé et aéré**, avec des draps et des serviettes propres.
- Une **salle de bains** accessible, avec savon, serviettes et papier.
- Un **éclairage doux** et une température agréable.
- Cache ou range tes **documents personnels** et tout ce qui révèle ton identité.
- Ne laisse pas d'**objets de valeur** visibles.

## Règles pratiques
- Ne donne l'adresse exacte qu'**après confirmation** du rendez-vous.
- Prévois un **moyen d'alerte** (téléphone chargé, personne de confiance prévenue).
- Reste attentive aux **voisins** : un va-et-vient régulier peut attirer l'attention et créer des conflits.

Sur Sex-Escorte, tu peux consulter la rubrique **logements** pour trouver des lieux adaptés dans ta ville.`
  },
  {
    slug: "preparer-un-deplacement-ou-une-tournee", emoji: "🧳", date: "2026-10-30",
    title: "Préparer un déplacement ou une tournée dans une autre ville",
    desc: "Annoncer son passage, organiser son voyage et rester en sécurité quand on travaille loin de chez soi.",
    body: `Se déplacer dans une autre ville peut augmenter tes rendez-vous, à condition d'être bien organisée.

## Avant de partir
- **Choisis tes dates** et annonce-les à l'avance : les clients de la ville peuvent ainsi planifier et te réserver.
- Sur Sex-Escorte, ajoute tes **prochains passages** dans ton profil : ils apparaissent dans la rubrique « Arrivent bientôt » et sur ta page.
- Réserve ton **logement** à l'avance et vérifie les conditions d'accueil.
- Prépare ta **présentation locale** : mentionne la ville, le quartier, les dates exactes.

## Sur place
- Garde une **personne de confiance** informée de ton adresse et de tes horaires.
- Repère le **quartier** (transports, pharmacie, sorties) avant l'arrivée du premier client.
- Évite de te déplacer seule la nuit dans un endroit que tu ne connais pas.
- Garde ton **rythme** : mieux vaut peu de rendez-vous bien choisis que beaucoup en enchaîné.

## Côté pratique
- Prévois ton **budget** : transport, logement, repas, imprévus. Fixe un nombre minimal de rendez-vous pour rentabiliser le voyage.
- Pense à ta **batterie**, ton chargeur, ton nécessaire d'hygiène et tes tenues.
- Garde sur toi ta **pièce d'identité** et tes documents importants, mais **ne les montre jamais** à un client.

## Après le déplacement
- Mets à jour ton profil (ville, disponibilités).
- Note ce qui a bien fonctionné pour ta prochaine tournée : ville, durée, tarifs, fréquentation.`
  },
  {
    slug: "sante-et-prevention", emoji: "🩺", date: "2026-10-30",
    title: "Santé et prévention : se protéger au quotidien",
    desc: "Protection, dépistage, suivi médical et ressources utiles : les repères essentiels pour prendre soin de soi.",
    body: `Ta santé est ton premier outil de travail. Quelques habitudes simples te protègent, toi et tes partenaires.

## La protection
- **Utilise toujours un préservatif**, pour toutes les pratiques à risque, et garde le tien : ne dépends pas de celui du client.
- Prévois des préservatifs de **plusieurs tailles** et du gel à base d'eau, compatible avec le latex.
- Tu as le droit de **refuser** toute pratique sans protection, quelle que soit la somme proposée.

## Le suivi médical
- Fais un **dépistage régulier** des IST (VIH, hépatites, syphilis, chlamydia, gonocoque) : en général tous les **3 mois** si tu as une activité régulière, ou selon l'avis de ton médecin.
- Le **dépistage** est possible dans un **CeGIDD** (centre gratuit et anonyme), en laboratoire ou chez un médecin.
- Demande à ton médecin des informations sur la **vaccination** (hépatite B, HPV) et sur la **PrEP** si elle est adaptée à ta situation.
- En cas d'accident de préservatif, un **traitement post-exposition (TPE)** doit être pris **le plus tôt possible**, idéalement dans les 4 heures et au plus tard dans les 48 heures : rends-toi aux urgences.

## Le bien-être
- Dors, mange et bois suffisamment. Une fatigue chronique se voit sur le visage et le moral.
- Accorde-toi des **jours sans rendez-vous**.
- Si ton moral baisse ou si tu te sens épuisée, **parle-en** à une personne de confiance, à ton médecin ou à une association : tu n'as pas à tout porter seule.

## Ressources
Des associations de santé communautaire accompagnent les travailleuses du sexe, de façon confidentielle et sans jugement. Tu peux consulter la rubrique **associations** de Sex-Escorte pour trouver un contact dans ta région.

Ces repères sont généraux et ne remplacent pas un avis médical.`
  },
  {
    slug: "revenus-impots-et-statut", emoji: "🧾", date: "2026-10-30",
    title: "Revenus, impôts et statut : les bases à connaître",
    desc: "Des repères généraux sur la déclaration des revenus, les statuts possibles et l'organisation de ses comptes. Ce n'est pas un conseil juridique ou fiscal.",
    body: `**Cette page donne des repères généraux, pas un conseil fiscal ou juridique.** Les règles changent et chaque situation est différente : pour ton cas, demande conseil à un comptable, à un avocat ou à une association spécialisée.

## Pourquoi s'en préoccuper
- Avoir des **comptes clairs** t'aide à prouver tes revenus (location, crédit, démarches), et à te protéger en cas de contrôle.
- Une activité non déclarée peut te rattraper des années plus tard. Mieux vaut savoir où tu en es.

## Garder une trace
- Note tes **revenus et tes dépenses** : une simple feuille de calcul suffit.
- Sépare si possible tes **comptes** (activité / personnel).
- Conserve les **justificatifs** de tes frais (logement, transport, publicité, matériel).

## Les statuts à étudier
- Selon ta situation, il existe des statuts indépendants (par exemple le régime de la micro-entreprise), mais **la façon dont l'activité peut ou non être déclarée dépend de règles précises** que tu dois vérifier avec un professionnel.
- Certaines personnes déclarent leurs revenus dans une catégorie adaptée, d'autres passent par un statut différent : **ne copie pas** ce que fait une amie sans vérifier.
- Si tu perçois d'autres revenus (salaire, aides), tiens-en compte.

## Protéger ton argent
- N'accepte pas qu'une personne **gère ton argent à ta place** ou te prenne une part sans ton accord : c'est un signe d'emprise.
- Garde l'accès à **tes comptes** et à **tes documents**.
- Épargne une petite **réserve** pour les périodes creuses ou les imprévus.

## Où demander de l'aide
Des associations accompagnent les travailleuses du sexe sur les démarches administratives et fiscales, de façon confidentielle. Consulte la rubrique **associations** pour trouver un contact près de chez toi.`
  },
  {
    slug: "pseudonyme-et-identite-numerique", emoji: "🎭", date: "2026-10-30",
    title: "Pseudonyme et identité numérique : séparer vie privée et activité",
    desc: "Choisir un nom d'artiste, créer des adresses et numéros dédiés et limiter les traces qui te relient à ta vie privée.",
    body: `Séparer ton activité de ta vie privée, c'est la meilleure protection contre le harcèlement et les fuites d'information.

## Choisir son pseudonyme
- Choisis un nom **facile à retenir** et sans lien avec ton vrai nom, ton quartier ou ta famille.
- Vérifie qu'il n'est pas **déjà utilisé** par quelqu'un d'autre dans ta ville.
- Garde le **même pseudonyme** partout : c'est ce qui construit ta réputation.

## Des outils dédiés
- Une **adresse e-mail** réservée à l'activité, avec un mot de passe unique et solide.
- Un **numéro de téléphone** séparé (seconde ligne, application ou carte prépayée).
- Des **comptes** distincts sur les réseaux : ne te connecte jamais aux deux avec les mêmes appareils si tu peux l'éviter.
- Active la **double authentification** partout où c'est possible.

## Limiter les traces
- Évite de publier des photos qui contiennent des **métadonnées** de localisation. Retire-les ou envoie la photo par une application qui les supprime.
- Ne reprends pas de **photos déjà publiées** ailleurs sous ton vrai nom.
- Fais une **recherche inversée** de tes photos de temps en temps pour voir où elles circulent.
- Sois prudente avec les **contacts synchronisés** : ton numéro pro peut apparaître dans les suggestions de tes proches.

## Si l'on te reconnaît
- Reste calme et **ne confirme rien**.
- Garde des **preuves** (captures d'écran, dates) en cas de harcèlement ou de menaces.
- Demande la **suppression** de tes photos auprès de la plateforme qui les héberge, et **signale** l'incident si besoin.
- Sur Sex-Escorte, tu peux masquer certaines informations et supprimer ton profil à tout moment depuis **Modifier mon profil**.

Pour aller plus loin, consulte aussi le guide **Protéger sa vie privée**.`
  }
];

export const guideBySlug = (s: string) => GUIDES.find((g) => g.slug === s);
