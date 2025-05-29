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
```

3. Créer un fichier `.env.local` à la racine du projet avec les variables d'environnement suivantes :

```
MYSQL_HOST=votre_host_mysql
MYSQL_USER=votre_utilisateur_mysql
MYSQL_PASSWORD=votre_mot_de_passe_mysql
MYSQL_DATABASE=votre_base_de_donnees
```

4. Configurer la base de données MySQL :

   - Créer une base de données MySQL
   - Exécuter le script `iut-management.sql` pour initialiser le schéma

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
- `iut-management.sql` : Schéma de la base de données

### Points d'entrée importants

- `src/app/page.tsx` : Page d'accueil
- `src/app/layout.tsx` : Layout principal
- `src/lib/database.ts` : Configuration de la connexion MySQL
- `middleware.ts` : Middleware d'authentification

### Note sur la migration de la base de données

Le projet a été initialement développé avec Supabase (PostgreSQL) et a été migré vers MySQL. Cette migration a nécessité :

1. La modification de la logique d'interrogation de la base de données pour utiliser mysql2/promise au lieu de Supabase
2. La suppression de l'authentification administrateur initialement gérée par Supabase

Certains fichiers peuvent encore contenir des références à l'ancienne implémentation Supabase, notamment dans les structures de données retournées par les API. Ces éléments sont maintenus pour assurer la compatibilité avec le code existant.

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
import { FC } from "react";

interface IButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

const Button: FC<IButtonProps> = ({ label, onClick, variant = "primary" }) => {
  const baseClasses = "px-4 py-2 rounded";
  const variantClasses = variant === "primary" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800";

  return (
    <button className={`${baseClasses} ${variantClasses}`} onClick={onClick}>
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

La base de données utilise MySQL et suit un modèle relationnel. Les principales tables sont :

- `departement` : Départements de l'IUT
- `parcours` : Parcours pédagogiques
- `enseignant` : Enseignants
- `cours` : Cours
- `intervention` : Interventions des enseignants
- `planning` : Planification des interventions

### Accès aux données

L'accès aux données se fait via le client MySQL. Voici un exemple d'utilisation :

```typescript
import { db } from "@/lib/database";

// Récupérer tous les enseignants
async function getEnseignants() {
  try {
    const [rows] = await db.execute("SELECT * FROM enseignant");
    return rows;
  } catch (error) {
    console.error("Erreur lors de la récupération des enseignants:", error);
    return [];
  }
}

// Ajouter un enseignant
async function addEnseignant(enseignant) {
  try {
    const [result] = await db.execute("INSERT INTO enseignant (nom, prenom, email) VALUES (?, ?, ?)", [
      enseignant.nom,
      enseignant.prenom,
      enseignant.email,
    ]);
    return result.insertId;
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'enseignant:", error);
    return null;
  }
}
```

## Authentification

L'authentification est gérée par NextAuth.js. Le middleware (`middleware.ts`) protège les routes `/admin/*`.

### Connexion

```typescript
import { signIn } from "next-auth/react";

async function handleSignIn(email, password) {
  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      console.error("Erreur de connexion:", result.error);
      return null;
    }

    return result;
  } catch (error) {
    console.error("Erreur de connexion:", error);
    return null;
  }
}
```

### Déconnexion

```typescript
import { signOut } from "next-auth/react";

async function handleSignOut() {
  try {
    await signOut({ redirect: false });
  } catch (error) {
    console.error("Erreur de déconnexion:", error);
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
import { FC } from "react";

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
import { FC } from "react";

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
import { NextResponse } from "next/server";
import { db } from "@/lib/database";

export async function GET() {
  try {
    // Récupérer les statistiques depuis MySQL
    const [enseignants] = await db.execute("SELECT COUNT(*) as count FROM enseignant");
    const [cours] = await db.execute("SELECT COUNT(*) as count FROM cours");

    return NextResponse.json({
      enseignants: enseignants[0].count,
      cours: cours[0].count,
    });
  } catch (error) {
    console.error("Erreur API:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
```

## Tests

### Tests unitaires

Utiliser Jest et React Testing Library pour les tests unitaires.

Exemple de test pour un composant :

```tsx
// src/components/ui/Button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "./Button";

describe("Button", () => {
  it("renders correctly", () => {
    render(<Button label="Cliquez-moi" onClick={() => {}} />);
    expect(screen.getByText("Cliquez-moi")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(<Button label="Cliquez-moi" onClick={handleClick} />);
    fireEvent.click(screen.getByText("Cliquez-moi"));
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
3. Configurer les variables d'environnement MySQL
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
- [MySQL](https://dev.mysql.com/doc/)
- [TailwindCSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)
- [NextAuth.js](https://next-auth.js.org/getting-started/introduction)

### Tutoriels recommandés

- [Next.js App Router](https://nextjs.org/docs/app)
- [MySQL avec Node.js](https://www.npmjs.com/package/mysql2)
- [Authentification avec NextAuth.js](https://next-auth.js.org/getting-started/introduction)

### Outils de développement

- [VS Code](https://code.visualstudio.com/) avec les extensions :
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin
  - MySQL (pour la gestion de la base de données)
  - GitHub Copilot (optionnel)

### Communauté

- [Forum Next.js](https://github.com/vercel/next.js/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)
- [MySQL Forums](https://forums.mysql.com/)
