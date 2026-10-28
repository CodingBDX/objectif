# Sex-Escorte Shield (Android)

Application qui affiche, par-dessus l'écran d'un appel entrant, si le numéro a été signalé par d'autres profils Sex-Escorte
(🟢 aucun signalement · 🟠 attention · 🔴 danger). L'appel sonne toujours normalement : l'application n'en bloque aucun.

## Préparer
1. Dans Supabase (SQL Editor), lance `supabase/migration-clients-signales.sql` puis `supabase/migration-clients-appel.sql`.
2. Installe **Android Studio**, puis `File > Open` et choisis ce dossier `android/`.
3. Copie `local.properties.example` en `local.properties` et remplis `SUPABASE_URL` et `SUPABASE_KEY` (clé **publishable/anon**, jamais `service_role`).
4. Branche un téléphone Android 10 ou plus (mode développeur) et clique sur ▶ Run.

## Utiliser
1. Ouvre l'application, connecte-toi avec ton compte Sex-Escorte (celui qui a un profil).
2. Touche « Autoriser l'affichage », puis « Activer le filtrage d'appels » et accepte.
3. Fais-toi appeler : le bandeau apparaît en haut de l'écran d'appel.

## Notes importantes
- Android 10 minimum. Le code n'a pas encore été compilé ni testé sur un téléphone : prévois des petits ajustements.
- Certains constructeurs (Xiaomi, Huawei, Samsung…) ont des réglages d'économie de batterie ou de « fenêtres flottantes » qui cachent le bandeau : autorise-les pour l'application.
- Publication sur le Play Store : compte développeur (25 $) et déclaration de l'usage du rôle « filtrage d'appels » ; Google contrôle ces applications. En attendant, tu peux partager l'APK directement aux profils.
- iPhone : Apple n'autorise pas ce type d'affichage pendant un appel. Utiliser la page web `/verifier`.
