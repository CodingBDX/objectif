# Objectif — Next.js + Supabase

## 1. Base de données
Supabase → **SQL Editor** → colle tout `supabase/schema.sql` → **Run**.
Supabase → **Authentication → Providers → Email** : laisse « Confirm email » activé.
Supabase → **Authentication → URL Configuration** : mets l'adresse de ton site dans « Site URL ».

## 2. Clés
Copie `.env.example` en `.env.local` et remplis URL + clé anon (Project Settings → API).

## 3. Lancer chez toi
    npm install
    npm run dev      # http://localhost:3000

## 4. Mettre en ligne
Envoie le dossier sur GitHub, puis Vercel → New Project → importe le dépôt →
ajoute les 3 variables de `.env.example` → Deploy.

## Passer un profil VIP / vérifié (toi seul)
SQL Editor : `update public.profiles set vip = true where id = '...';`
Les messages du formulaire de contact se lisent dans Table Editor → messages.
