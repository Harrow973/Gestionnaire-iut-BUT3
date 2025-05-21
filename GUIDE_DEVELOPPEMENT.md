# Guide de Développement - Manager IUT

Ce guide est destiné aux étudiants de 3ème année de BUT Informatique qui vont reprendre et améliorer ce projet dans le cadre du module "Amélioration d'application".

## Table des matières

1. [Mise en place de l'environnement](#mise-en-place-de-lenvironnement)
2. [Structure du projet](#structure-du-projet)
3. [Conventions de code](#conventions-de-code)
4. [Flux de travail](#flux-de-travail)
5. [Base de données](#base-de-données)
6. [Authentification](#authentification)
7. [Ajout de fonctionnalités](#ajout-de-fonctionnalités)
8. [Tests](#tests)
9. [Déploiement](#déploiement)
10. [Ressources utiles](#ressources-utiles)

## Mise en place de l'environnement

### Prérequis

- Node.js (version 18.x ou supérieure recommandée)
- npm ou yarn
- Git
- Éditeur de code (VS Code recommandé)
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
```

3. Créer un fichier `.env.local` à la racine du projet avec les variables d'environnement suivantes :
```
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase
```

4. Configurer la base de données Supabase :
   - Créer un projet sur [Supabase](https://supabase.com/)
   - Exécuter le script `supabase-schema-corrected.sql` dans l'éditeur SQL de Supabase

5. Lancer le serveur de développement :
```bash
npm run dev
```

6. Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur

## Structure du projet

Le projet suit l'architecture App Router de Next.js. Voici les principaux dossiers et fichiers :

- `/src/app` : Pages et routes de l'application
- `/src/components` : Composants React réutilisables
- `/src/lib` : Utilitaires et configuration
- `/src/types` : Types TypeScript
- `middleware.ts` : Middleware pour l'authentification
- `supabase-schema-corrected.sql` : Schéma de la base de données

### Points d'entrée importants

- `src/app/page.tsx` : Page d'accueil
- `src/app/layout.tsx` : Layout principal
- `src/lib/supabase.ts` : Configuration du client Supabase
- `middleware.ts` : Middleware d'authentification

## Conventions de code

### Nommage

- **Fichiers** : 
  - Composants React : PascalCase (ex: `Button.tsx`)
  - Utilitaires : camelCase (ex: `utils.ts`)
  - Pages : page.tsx (convention Next.js)

- **Variables et fonctions** : 
  - camelCase (ex: `getUserData`)
  - Noms descriptifs et en français

- **Composants** : 
  - PascalCase (ex: `DataTable`)

- **Types et interfaces** : 
  - PascalCase avec préfixe T pour les types (ex: `TUser`)
  - PascalCase avec préfixe I pour les interfaces (ex: `IUserProps`)

### Style de code

- Utiliser des fonctions fléchées pour les composants React
- Préférer les hooks React aux classes
- Utiliser TypeScript pour le typage statique
- Utiliser les classes utilitaires TailwindCSS pour le styling
- Commenter le code complexe

Exemple de composant :

```tsx
import { FC } from 'react';

interface IButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const Button: FC<IButtonProps> = ({ label, onClick, variant = 'primary' }) => {
  const baseClasses = 'px-4 py-2 rounded';
  const variantClasses = variant === 'primary' 
    ? 'bg-blue-500 text-white' 
    : 'bg-gray-200 text-gray-800';

  return (
    <button 
      className={`${baseClasses} ${variantClasses}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default Button;
```

## Flux de travail

### Branches Git

- `main` : Branche principale, contient le code de production
- `develop` : Branche de développement, intégration des fonctionnalités
- `feature/nom-de-la-fonctionnalité` : Branches pour les nouvelles fonctionnalités
- `fix/nom-du-bug` : Branches pour les corrections de bugs

### Processus de développement

1. Créer une branche à partir de `develop` :
```bash
git checkout develop
git pull
git checkout -b feature/ma-fonctionnalité
```

2. Développer la fonctionnalité

3. Commiter régulièrement :
```bash
git add .
git commit -m "Description claire de la modification"
```

4. Pousser la branche :
```bash
git push -u origin feature/ma-fonctionnalité
```

5. Créer une Pull Request vers `develop`

6. Après revue et validation, fusionner la Pull Request

## Base de données

### Structure

La base de données est hébergée sur Supabase et suit un modèle relationnel. Les principales tables sont :

- `departement` : Départements de l'IUT
- `parcours` : Parcours pédagogiques
- `enseignant` : Enseignants
- `cours` : Cours
- `intervention` : Interventions des enseignants
- `planning` : Planification des interventions

### Accès aux données

L'accès aux données se fait via le client Supabase. Voici un exemple d'utilisation :

```typescript
import { supabase } from '@/lib/supabase';

// Récupérer tous les enseignants
async function getEnseignants() {
  const { data, error } = await supabase
    .from('enseignant')
    .select('*');
  
  if (error) {
    console.error('Erreur lors de la récupération des enseignants:', error);
    return [];
  }
  
  return data;
}

// Ajouter un enseignant
async function addEnseignant(enseignant) {
  const { data, error } = await supabase
    .from('enseignant')
    .insert([enseignant])
    .select();
  
  if (error) {
    console.error('Erreur lors de l\'ajout de l\'enseignant:', error);
    return null;
  }
  
  return data[0];
}
```

## Authentification

L'authentification est gérée par Supabase Auth. Le middleware (`middleware.ts`) protège les routes `/admin/*`.

### Connexion

```typescript
import { supabase } from '@/lib/supabase';

async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error('Erreur de connexion:', error);
    return null;
  }
  
  return data.user;
}
```

### Déconnexion

```typescript
import { supabase } from '@/lib/supabase';

async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Erreur de déconnexion:', error);
  }
}
```

## Ajout de fonctionnalités

### Création d'une nouvelle page

1. Créer un dossier dans `src/app` correspondant à la route souhaitée
2. Ajouter un fichier `page.tsx` dans ce dossier
3. Créer le composant de page

Exemple pour une page de statistiques :

```tsx
// src/app/statistiques/page.tsx
import { FC } from 'react';

const StatistiquesPage: FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Statistiques</h1>
      {/* Contenu de la page */}
    </div>
  );
};

export default StatistiquesPage;
```

### Création d'un nouveau composant

1. Créer un fichier dans `src/components` ou un sous-dossier approprié
2. Définir et exporter le composant

Exemple :

```tsx
// src/components/ui/StatCard.tsx
import { FC } from 'react';

interface IStatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

const StatCard: FC<IStatCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-500 text-sm">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {icon && <div className="text-blue-500 text-2xl">{icon}</div>}
      </div>
    </div>
  );
};

export default StatCard;
```

### Création d'un point d'entrée API

1. Créer un dossier dans `src/app/api` correspondant à la ressource
2. Ajouter un fichier `route.ts` pour définir les méthodes HTTP

Exemple :

```typescript
// src/app/api/statistiques/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Récupérer les statistiques depuis Supabase
    const { data: enseignants, error: enseignantsError } = await supabase
      .from('enseignant')
      .select('count');
    
    const { data: cours, error: coursError } = await supabase
      .from('cours')
      .select('count');
    
    if (enseignantsError || coursError) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }
    
    return NextResponse.json({
      enseignants: enseignants[0].count,
      cours: cours[0].count
    });
  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
```

## Tests

### Tests unitaires

Utiliser Jest et React Testing Library pour les tests unitaires.

Exemple de test pour un composant :

```tsx
// src/components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button label="Cliquez-moi" onClick={() => {}} />);
    expect(screen.getByText('Cliquez-moi')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button label="Cliquez-moi" onClick={handleClick} />);
    fireEvent.click(screen.getByText('Cliquez-moi'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Tests d'intégration

Utiliser Cypress pour les tests d'intégration.

## Déploiement

### Déploiement sur Vercel

1. Créer un compte sur [Vercel](https://vercel.com/)
2. Connecter votre dépôt GitHub
3. Configurer les variables d'environnement
4. Déployer l'application

### Déploiement sur un serveur personnalisé

1. Construire l'application :
```bash
npm run build
```

2. Démarrer le serveur :
```bash
npm start
```

## Ressources utiles

### Documentation

- [Next.js](https://nextjs.org/docs)
- [React](https://reactjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [TailwindCSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

### Tutoriels recommandés

- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase avec Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Authentification avec Supabase](https://supabase.com/docs/guides/auth)

### Outils de développement

- [VS Code](https://code.visualstudio.com/) avec les extensions :
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin
  - GitHub Copilot (optionnel)

### Communauté

- [Forum Next.js](https://github.com/vercel/next.js/discussions)
- [Discord Supabase](https://discord.supabase.com/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js) 