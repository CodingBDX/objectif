/** Guides pratiques pour les escortes (contenu éditorial). Format : « ## titre », « - liste », **gras**. */
export type Guide = { slug: string; title: string; desc: string; emoji: string; date: string; body: string };

export const GUIDES: Guide[] = [
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
  }
];

export const guideBySlug = (s: string) => GUIDES.find((g) => g.slug === s);
