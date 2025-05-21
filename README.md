# Manager IUT B3

Manager IUT est une application web développée avec Next.js pour gérer les ressources pédagogiques d'un département d'IUT. L'application permet de gérer les enseignants, les cours, les plannings, les interventions et les maquettes pédagogiques.

## Objectif du projet

L'application permet :
- La gestion d'un espace administrateur sécurisé
- L'authentification des utilisateurs via Supabase
- La gestion de rôles (admin, utilisateur, etc.)
- L'accès à différentes fonctionnalités selon le rôle

## Prérequis

- Node.js (version recommandée : 18 ou supérieure)
- Un compte [Supabase](https://supabase.com/) (pour la gestion de l'authentification et de la base de données)
- Un gestionnaire de paquets : npm, yarn, pnpm ou bun

## Installation

1. **Cloner le dépôt**
   ```bash
   git clone <url-du-dépôt>
   cd manager-iut-B3
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   # ou
   bun install
   ```

3. **Configurer les variables d'environnement**

   Créez un fichier `.env.local` à la racine du projet et ajoutez :
   ```
   NEXT_PUBLIC_SUPABASE_URL=Votre_URL_Supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=Votre_Clé_Anon_Supabase
   ```

   Ces informations sont disponibles dans l'interface de votre projet Supabase, rubrique "Project Settings" > "API".

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   # ou
   yarn dev
   # ou
   pnpm dev
   # ou
   bun dev
   ```

   Rendez-vous sur [http://localhost:3000](http://localhost:3000) pour accéder à l'application.

## Authentification et accès administrateur

- L'accès à l'espace `/admin` est protégé par un middleware de sécurité.
- Pour tester l'accès administrateur, créez un utilisateur dans Supabase avec le rôle `admin` (voir ci-dessous).
- Exemple d'identifiants de test :
  - Email : `admin@example.com`
  - Mot de passe : `password`

### Création d'un utilisateur administrateur dans Supabase

1. Dans Supabase, allez dans "Authentication" > "Users".
2. Cliquez sur "Add User".
3. Renseignez l'email et le mot de passe.
4. Ajoutez dans les métadonnées : `{"role": "admin"}`.

### Gestion avancée des rôles (optionnel)

- Créez une table `roles` dans Supabase pour gérer différents niveaux d'accès.
- Associez chaque utilisateur à un rôle spécifique.
- Modifiez le middleware pour vérifier le rôle lors de l'accès à `/admin`.

## Pour aller plus loin

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Supabase](https://supabase.com/docs)

## Ressources complémentaires

Pour mieux comprendre le fonctionnement du projet, son architecture et faciliter le développement, référez-vous également aux fichiers suivants présents dans le dépôt :

- `GUIDE_DEVELOPPEMENT.md` : pour les bonnes pratiques de développement et les consignes spécifiques au projet
- `DOCUMENTATION.md` : pour la documentation technique et fonctionnelle
- `ARCHITECTURE.md` : pour la description de l'architecture de l'application

