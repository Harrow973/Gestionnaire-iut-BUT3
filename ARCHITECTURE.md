# Architecture Technique - Manager IUT

## Vue d'ensemble

Manager IUT est une application web moderne construite avec Next.js 15.3.0 et React 19. L'application suit l'architecture App Router de Next.js, qui utilise un système de routage basé sur les fichiers et les dossiers. La base de données est hébergée sur Supabase, qui fournit également des services d'authentification.

## Stack technologique

### Frontend
- **Framework** : Next.js 15.3.0
- **Bibliothèque UI** : React 19
- **Styling** : TailwindCSS 4
- **Composants UI** : ShadCN UI
- **Animations** : Framer Motion
- **Icônes** : Lucide React, Tabler Icons
- **Graphiques** : Recharts

### Backend
- **API Routes** : Next.js API Routes
- **Base de données** : PostgreSQL (via Supabase)
- **ORM** : Supabase Client
- **Authentification** : Supabase Auth

### Outils de développement
- **Langage** : TypeScript
- **Linting** : ESLint
- **Build** : Next.js build system
- **Package Manager** : npm

## Structure des fichiers

```
manager-iut/
├── .git/                   # Git repository
├── .next/                  # Next.js build output
├── node_modules/           # Node.js dependencies
├── public/                 # Static files
├── src/                    # Source code
│   ├── app/                # Next.js App Router pages
│   │   ├── admin/          # Admin pages
│   │   ├── api/            # API routes
│   │   ├── cours/          # Cours pages
│   │   ├── departements/   # Départements pages
│   │   ├── enseignants/    # Enseignants pages
│   │   ├── interventions/  # Interventions pages
│   │   ├── maquettes/      # Maquettes pages
│   │   ├── planning/       # Planning pages
│   │   ├── rapports/       # Rapports pages
│   │   ├── test-connection/# Test de connexion
│   │   ├── globals.css     # Global CSS
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   │   ├── dashboard/      # Dashboard components
│   │   └── ui/             # UI components
│   ├── lib/                # Utility functions
│   │   ├── api-helpers.ts  # API helpers
│   │   ├── auth.ts         # Auth utilities
│   │   ├── supabase.ts     # Supabase client
│   │   └── utils.ts        # General utilities
│   └── types/              # TypeScript type definitions
├── .gitignore              # Git ignore file
├── components.json         # ShadCN UI configuration
├── eslint.config.mjs       # ESLint configuration
├── middleware.ts           # Next.js middleware
├── next.config.ts          # Next.js configuration
├── next-env.d.ts           # Next.js TypeScript declarations
├── package.json            # Project metadata and dependencies
├── package-lock.json       # Dependency lock file
├── postcss.config.mjs      # PostCSS configuration
├── supabase-schema-corrected.sql # Corrected Supabase schema
└── tsconfig.json           # TypeScript configuration
```

## Architecture des données

### Modèle de données

Le modèle de données est défini dans le fichier `supabase-schema-corrected.sql`. Voici les principales entités et leurs relations :

```
departement (1) --- (*) parcours
departement (1) --- (*) enseignant
enseignant (1) --- (*) enseignant_statut (*) --- (1) statut_enseignant
parcours (1) --- (*) maquette_pedagogique (*) --- (1) departement
maquette_pedagogique (1) --- (*) cours (*) --- (1) type_cours
cours (1) --- (*) allocation_horaire
cours (1) --- (*) intervention (*) --- (1) enseignant
intervention (1) --- (*) planning (*) --- (1) salle
intervention (1) --- (*) historique_intervention
```

### Schéma de base de données

Le schéma de base de données comprend les tables suivantes :

- `departement` : Informations sur les départements de l'IUT
- `parcours` : Parcours pédagogiques associés aux départements
- `statut_enseignant` : Types de statuts pour les enseignants
- `enseignant` : Informations sur les enseignants
- `enseignant_statut` : Relation entre enseignants et leurs statuts
- `maquette_pedagogique` : Maquettes pédagogiques par année et parcours
- `type_cours` : Types de cours (CM, TD, TP)
- `cours` : Informations sur les cours
- `allocation_horaire` : Allocation d'heures par cours
- `groupe` : Groupes d'étudiants
- `intervention` : Interventions des enseignants
- `salle` : Informations sur les salles
- `planning` : Planification des interventions
- `historique_intervention` : Historique des modifications d'interventions

## Architecture de l'application

### Routage

Next.js App Router est utilisé pour le routage. Les routes sont définies par la structure des dossiers dans `src/app`. Chaque dossier représente un segment de route, et les fichiers `page.tsx` définissent le contenu de la page.

### Authentification

L'authentification est gérée par Supabase Auth. Le middleware (`middleware.ts`) intercepte les requêtes vers les routes protégées (`/admin/*`) et vérifie si l'utilisateur est authentifié.

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  const { data: { session } } = await supabase.auth.getSession();
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  
  if (isAdminRoute && !session) {
    const redirectUrl = new URL('/', request.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  return res;
}
```

### Gestion d'état

L'état de l'application est géré principalement par :
1. Les props React pour passer des données entre composants
2. Les hooks React (`useState`, `useEffect`, etc.) pour l'état local
3. Le contexte React pour l'état global partagé

### Accès aux données

L'accès aux données est effectué via le client Supabase, configuré dans `src/lib/supabase.ts` :

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Erreur: Les variables d\'environnement Supabase ne sont pas définies.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### API

Les API Routes sont définies dans le dossier `src/app/api`. Chaque fichier ou dossier représente un point d'entrée API. Les API Routes suivent généralement le modèle RESTful avec des méthodes HTTP standard (GET, POST, PUT, DELETE).

## Composants

### Composants UI

Les composants UI sont définis dans `src/components/ui`. Ces composants sont réutilisables et constituent les blocs de construction de l'interface utilisateur.

#### DataTable

`DataTable.tsx` est un composant complexe qui gère l'affichage des données tabulaires avec des fonctionnalités de tri, filtrage et pagination.

#### Form

`Form.tsx` fournit des composants de formulaire réutilisables avec validation.

#### Navbar

`Navbar.tsx` est la barre de navigation principale de l'application.

### Composants Dashboard

Les composants spécifiques au tableau de bord sont définis dans `src/components/dashboard`.

## Styles

Les styles sont gérés principalement par TailwindCSS, avec des classes utilitaires appliquées directement aux éléments HTML. Les styles globaux sont définis dans `src/app/globals.css`.

## Bonnes pratiques

### Code

- Utilisation de TypeScript pour le typage statique
- Organisation du code par fonctionnalité
- Composants React modulaires et réutilisables
- Séparation des préoccupations (UI, logique métier, accès aux données)

### Performance

- Utilisation du rendu côté serveur (SSR) et de la génération statique (SSG) de Next.js
- Optimisation des images avec Next.js Image
- Chargement différé des composants avec `dynamic` de Next.js
- Mise en cache des requêtes API

### Sécurité

- Authentification via Supabase Auth
- Protection des routes administratives avec middleware
- Validation des entrées utilisateur
- Utilisation de variables d'environnement pour les informations sensibles

## Évolutivité

L'architecture est conçue pour être évolutive :

1. **Séparation des préoccupations** : UI, logique métier et accès aux données sont séparés
2. **Composants modulaires** : Les composants peuvent être réutilisés et composés
3. **TypeScript** : Le typage statique facilite la maintenance et l'évolution du code
4. **Architecture basée sur les fichiers** : Facilite l'ajout de nouvelles fonctionnalités

## Déploiement

L'application est conçue pour être déployée sur Vercel, qui s'intègre parfaitement avec Next.js. Le déploiement peut également être effectué sur d'autres plateformes comme Netlify ou un serveur personnalisé.

## Conclusion

L'architecture de Manager IUT est conçue pour être moderne, maintenable et évolutive. L'utilisation de Next.js avec l'App Router, React, TypeScript et Supabase offre une base solide pour développer une application web performante et sécurisée. 