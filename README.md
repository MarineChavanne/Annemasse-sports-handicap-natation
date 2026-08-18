# Annemasse Sports Handicap — Site de gestion

Site simple pour gérer les nageurs/participants, l'appel des présences,
les statistiques et le calendrier du club.

## Déploiement

1. Uploader tous ces fichiers dans le dépôt GitHub du projet (en conservant la structure des dossiers).
2. Le fichier `annemasse-handisport-schema.sql` doit être exécuté une seule fois dans Supabase (SQL Editor).
3. Le fichier `src/lib/supabase.js` contient déjà les clés du projet Supabase — pas besoin d'y retoucher.
4. Déployer sur Vercel en connectant le dépôt GitHub (aucune configuration spéciale nécessaire).
5. Créer les 3 comptes utilisateurs manuellement dans Supabase :
   Authentication → Users → Add user (cocher "Auto Confirm User").
6. À la première connexion, chaque personne complète son profil (nom + rôle).
