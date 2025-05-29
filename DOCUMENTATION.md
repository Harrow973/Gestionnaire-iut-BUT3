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
- **Base de données** : MySQL
- **Authentification** : NextAuth.js
- **UI** : ShadCN UI, Tailwind CSS

### Note sur la migration de la base de données

Initialement, le projet a été développé avec Supabase (PostgreSQL) comme système de base de données. Une migration vers MySQL a été effectuée pour répondre à de nouveaux besoins. Cette migration a nécessité :

1. La conversion du schéma de base de données de PostgreSQL vers MySQL
2. La modification des requêtes SQL pour être compatible avec MySQL
3. L'adaptation des API Routes pour utiliser le client MySQL au lieu de Supabase

Il est possible de trouver dans certains fichiers, notamment dans les routes API, des structures de données ou des formats qui correspondent à l'ancienne implémentation Supabase. Ces éléments sont maintenus pour assurer la compatibilité avec le code existant et faciliter la maintenance.

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
- Serveur MySQL

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
MYSQL_HOST=votre_host_mysql
MYSQL_USER=votre_utilisateur_mysql
MYSQL_PASSWORD=votre_mot_de_passe_mysql
MYSQL_DATABASE=votre_base_de_donnees
```

4. Initialiser la base de données :
   Exécuter le script SQL `iut-management.sql` dans votre serveur MySQL.

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

- `database.ts` : Configuration de la connexion MySQL
- `utils.ts` : Fonctions utilitaires
- `api-helpers.ts` : Fonctions d'aide pour les appels API
- `auth.ts` : Fonctions liées à l'authentification

## Base de données

L'application utilise MySQL comme système de gestion de base de données. Le schéma de la base de données est défini dans le fichier `iut-management.sql`.

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

L'authentification est gérée par NextAuth.js. Le middleware (`middleware.ts`) protège les routes `/admin/*` en vérifiant si l'utilisateur est connecté.

### Configuration de l'authentification

Pour configurer l'authentification :

1. Configurer NextAuth.js dans votre application
2. Créer un utilisateur administrateur dans la base de données
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

L'API est construite avec les API Routes de Next.js, situées dans le dossier `/src/app/api`. Les routes API ont été adaptées pour utiliser MySQL au lieu de Supabase, tout en maintenant une structure de réponse similaire pour assurer la compatibilité avec le frontend existant.

### Points d'entrée API

- `/api/enseignants` : CRUD pour les enseignants
- `/api/cours` : CRUD pour les cours
- `/api/planning` : CRUD pour le planning
- `/api/maquettes` : CRUD pour les maquettes pédagogiques
- `/api/departements` : CRUD pour les départements
- `/api/interventions` : CRUD pour les interventions

### Format des réponses API

Les réponses API suivent un format standardisé pour maintenir la compatibilité avec le code existant :

```typescript
{
  data?: any;           // Données de la réponse
  error?: string;       // Message d'erreur si applicable
  status?: number;      // Code de statut HTTP
}
```

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
