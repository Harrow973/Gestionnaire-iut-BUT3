# Documentation Manager IUT

## Table des matières

1. [Introduction](#introduction)
2. [Architecture du projet](#architecture-du-projet)
3. [Installation et configuration](#installation-et-configuration)
4. [Structure des dossiers](#structure-des-dossiers)
5. [Base de données](#base-de-données)
6. [Authentification](#authentification)
7. [Composants principaux](#composants-principaux)
8. [Routes et pages](#routes-et-pages)
9. [API](#api)
10. [Déploiement](#déploiement)
11. [Bonnes pratiques et conventions](#bonnes-pratiques-et-conventions)
12. [Contribution](#contribution)

## Introduction

Manager IUT est une application web développée avec Next.js pour gérer les ressources pédagogiques d'un département d'IUT. L'application permet de gérer les enseignants, les cours, les plannings, les interventions et les maquettes pédagogiques.

### Technologies utilisées

- **Frontend** : Next.js 15.3.0, React 19, TailwindCSS 4
- **Backend** : API Routes de Next.js
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth
- **UI** : ShadCN UI, Tailwind CSS

## Architecture du projet

Le projet suit l'architecture App Router de Next.js, qui est basée sur les conventions de fichiers et de dossiers. Les composants React sont utilisés pour construire l'interface utilisateur, et les API Routes de Next.js sont utilisées pour les appels API.

```
manager-iut/
├── src/
│   ├── app/            # Pages et routes de l'application
│   ├── components/     # Composants React réutilisables
│   ├── lib/            # Utilitaires et configuration
│   └── types/          # Types TypeScript
├── public/             # Fichiers statiques
└── middleware.ts       # Middleware pour l'authentification
```

## Installation et configuration

### Prérequis

- Node.js (version recommandée : 18.x ou supérieure)
- npm ou yarn
- Compte Supabase

### Installation

1. Cloner le dépôt :
```bash
git clone [URL_DU_REPO]
cd manager-iut
```

2. Installer les dépendances :
```bash
npm install
# ou
yarn install
```

3. Configurer les variables d'environnement :
Créer un fichier `.env.local` à la racine du projet avec les variables suivantes :
```
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase
```

4. Initialiser la base de données :
Exécuter le script SQL `supabase-schema-corrected.sql` dans votre projet Supabase.

5. Lancer le serveur de développement :
```bash
npm run dev
# ou
yarn dev
```

## Structure des dossiers

### `/src/app`

Contient les pages et les routes de l'application selon la convention App Router de Next.js :

- `/admin` : Espace d'administration protégé
- `/planning` : Gestion des plannings
- `/cours` : Gestion des cours
- `/enseignants` : Gestion des enseignants
- `/departements` : Gestion des départements
- `/maquettes` : Gestion des maquettes pédagogiques
- `/interventions` : Gestion des interventions
- `/rapports` : Génération de rapports

### `/src/components`

Contient les composants React réutilisables :

- `/ui` : Composants d'interface utilisateur (boutons, formulaires, tableaux, etc.)
- `/dashboard` : Composants spécifiques au tableau de bord

### `/src/lib`

Contient les utilitaires et la configuration :

- `supabase.ts` : Configuration du client Supabase
- `utils.ts` : Fonctions utilitaires
- `api-helpers.ts` : Fonctions d'aide pour les appels API
- `auth.ts` : Fonctions liées à l'authentification

## Base de données

L'application utilise Supabase comme base de données PostgreSQL. Le schéma de la base de données est défini dans le fichier `supabase-schema-corrected.sql`.

### Principales tables

- `departement` : Départements de l'IUT
- `parcours` : Parcours pédagogiques
- `enseignant` : Enseignants
- `statut_enseignant` : Statuts des enseignants (Professeur, Maître de conférences, etc.)
- `maquette_pedagogique` : Maquettes pédagogiques
- `cours` : Cours
- `intervention` : Interventions des enseignants
- `planning` : Planification des interventions
- `salle` : Salles disponibles

### Relations

- Un département peut avoir plusieurs parcours
- Un enseignant appartient à un département et peut avoir un statut
- Une maquette pédagogique est associée à un parcours et à un département
- Un cours appartient à une maquette pédagogique
- Une intervention est associée à un enseignant et à un cours
- Un planning est associé à une intervention et à une salle

## Authentification

L'authentification est gérée par Supabase Auth. Le middleware (`middleware.ts`) protège les routes `/admin/*` en vérifiant si l'utilisateur est connecté.

### Configuration de l'authentification

Pour configurer l'authentification :

1. Dans l'interface Supabase, aller dans "Authentication" > "Users"
2. Créer un utilisateur administrateur
3. Utiliser les identifiants pour se connecter à l'application

## Composants principaux

### Composants UI

- `DataTable.tsx` : Tableau de données avec fonctionnalités de tri, filtrage et pagination
- `Form.tsx` : Composant de formulaire réutilisable
- `Navbar.tsx` : Barre de navigation
- `Button.tsx` : Bouton stylisé
- `Card.tsx` : Carte pour afficher des informations
- `Alert.tsx` : Composant d'alerte

## Routes et pages

### Page d'accueil
- `/` : Page d'accueil avec tableau de bord

### Pages d'administration
- `/admin` : Tableau de bord d'administration
- `/admin/[entity]` : Pages de gestion des entités (enseignants, cours, etc.)

### Pages de gestion
- `/enseignants` : Liste des enseignants
- `/cours` : Liste des cours
- `/planning` : Planning des interventions
- `/maquettes` : Maquettes pédagogiques
- `/departements` : Départements de l'IUT
- `/interventions` : Interventions des enseignants
- `/rapports` : Génération de rapports

## API

L'API est construite avec les API Routes de Next.js, situées dans le dossier `/src/app/api`.

### Points d'entrée API

- `/api/enseignants` : CRUD pour les enseignants
- `/api/cours` : CRUD pour les cours
- `/api/planning` : CRUD pour le planning
- `/api/maquettes` : CRUD pour les maquettes pédagogiques
- `/api/departements` : CRUD pour les départements
- `/api/interventions` : CRUD pour les interventions

## Déploiement

L'application peut être déployée sur diverses plateformes comme Vercel, Netlify ou un serveur personnalisé.

### Déploiement sur Vercel

1. Connecter votre dépôt GitHub à Vercel
2. Configurer les variables d'environnement dans l'interface Vercel
3. Déployer l'application

## Bonnes pratiques et conventions

### Conventions de code

- Utiliser TypeScript pour le typage statique
- Suivre les conventions de nommage camelCase pour les variables et fonctions
- Utiliser PascalCase pour les composants React
- Commenter le code pour expliquer les parties complexes

### Structure des composants

- Créer des composants réutilisables et modulaires
- Utiliser les props pour passer des données aux composants
- Utiliser les hooks React pour la gestion d'état

## Contribution

Pour contribuer au projet :

1. Forker le dépôt
2. Créer une branche pour votre fonctionnalité
3. Implémenter vos modifications
4. Soumettre une pull request

### Processus de développement

1. Identifier une fonctionnalité ou un bug à corriger
2. Créer une branche dédiée
3. Développer et tester localement
4. Soumettre une pull request pour révision
5. Après approbation, fusionner avec la branche principale 