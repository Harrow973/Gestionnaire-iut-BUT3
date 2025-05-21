'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaUsers, 
  FaSchool, 
  FaUserShield, 
  FaLock, 
  FaDatabase, 
  FaCog, 
  FaUsersCog,
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaClipboardList
} from 'react-icons/fa';
import { FaServer, FaFileAlt } from "react-icons/fa";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

// Define types for the app
interface HistoryItem {
  id: string;
  created_at: string;
  statut: string;
  commentaire: string;
  intervention: {
    id: string;
    cours: {
      code: string;
      nom: string;
    };
  };
}

interface Statistics {
  departments: number;
  teachers: number;
  courses: number;
  interventions: number;
  users: number;
}

// Admin authentication using Supabase
export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState<Statistics>({
    departments: 0,
    teachers: 0,
    courses: 0,
    interventions: 0,
    users: 0,
  });
  const [recentChanges, setRecentChanges] = useState<HistoryItem[]>([]);
  
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Check if the user is already authenticated
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setIsAuthenticated(true);
        loadStats();
        loadRecentChanges();
      }
      
      setIsLoading(false);
    }
    
    checkAuth();
  }, [supabase.auth]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }
      
      if (data?.session) {
        setIsAuthenticated(true);
        setError('');
        loadStats();
        loadRecentChanges();
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError('Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour récupérer les statistiques de la base de données
  async function loadStats() {
    try {
      // Récupérer le nombre de lignes dans les tables principales
      const [
        { count: depCount }, 
        { count: ensCount }, 
        { count: courseCount },
        { count: interventionCount }
      ] = await Promise.all([
        supabase.from('departement').select('*', { count: 'exact', head: true }),
        supabase.from('enseignant').select('*', { count: 'exact', head: true }),
        supabase.from('cours').select('*', { count: 'exact', head: true }),
        supabase.from('intervention').select('*', { count: 'exact', head: true })
      ]);

      // Get user count or default to 0 if table doesn't exist
      let userCount = 0;
      try {
        const { count } = await supabase.from('users').select('*', { count: 'exact', head: true });
        if (count !== null) userCount = count;
      } catch {
        // Table doesn't exist, leave count at 0
      }

      setStats({
        departments: depCount || 0,
        teachers: ensCount || 0,
        courses: courseCount || 0,
        interventions: interventionCount || 0,
        users: userCount,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques :", error);
    }
  }

  // Fonction pour récupérer les 5 dernières modifications
  async function loadRecentChanges() {
    try {
      const { data } = await supabase
        .from('historique_intervention')
        .select(`
          id,
          created_at,
          statut,
          commentaire,
          intervention:intervention_id(
            id,
            cours:cours_id(code, nom)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        setRecentChanges(data as HistoryItem[]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des modifications récentes :", error);
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    router.refresh();
  };

  const adminModules = [
    {
      title: "Gestion des utilisateurs",
      description: "Gérer les comptes administrateurs et les droits d'accès",
      icon: <FaUsersCog className="text-3xl" />,
      path: "/admin/utilisateurs",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      count: stats.users
    },
    {
      title: "Gestion des départements",
      description: "Ajouter, modifier ou supprimer des départements",
      icon: <FaSchool className="text-3xl" />,
      path: "/admin/departements",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      count: stats.departments
    },
    {
      title: "Gestion des enseignants",
      description: "Administrer les comptes enseignants et leurs attributions",
      icon: <FaChalkboardTeacher className="text-3xl" />,
      path: "/admin/enseignants",
      color: "bg-gradient-to-br from-green-500 to-green-600",
      count: stats.teachers
    },
    {
      title: "Gestion du planning",
      description: "Configurer les périodes d'enseignement et les créneaux",
      icon: <FaCalendarAlt className="text-3xl" />,
      path: "/admin/planning",
      color: "bg-gradient-to-br from-amber-500 to-amber-600",
      count: stats.interventions
    },
    {
      title: "Paramètres du système",
      description: "Configurer les paramètres globaux de l'application",
      icon: <FaCog className="text-3xl" />,
      path: "/admin/parametres",
      color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
      count: 0
    },
    {
      title: "Logs et audit",
      description: "Consulter les journaux et l'historique des actions",
      icon: <FaClipboardList className="text-3xl" />,
      path: "/admin/logs",
      color: "bg-gradient-to-br from-red-500 to-red-600",
      count: 0
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100">
              <FaUserShield className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Espace administrateur
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Veuillez vous authentifier pour accéder au panneau d'administration
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Mot de passe</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <FaLock className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
                </span>
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </button>
            </div>
          </form>
          <div className="text-sm text-center text-gray-500">
            <p>Pour tester: email "admin@example.com", mot de passe "password"</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord d'administration</h1>
          <p className="mt-1 text-gray-500">Gestion du système de maquettes pédagogiques IUT</p>
        </div>
        <button 
          onClick={handleSignOut}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Déconnexion
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminModules.map((module, index) => (
          <Link key={index} href={module.path}>
            <div className={`p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow ${module.color} text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-lg font-medium">{module.title}</span>
                  <span className="text-3xl font-bold mt-2">{module.count}</span>
                  <span className="text-sm opacity-80 mt-1">{module.description}</span>
                </div>
                {module.icon}
              </div>
            </div>
          </Link>
        ))}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Activités récentes</h2>
          <div className="space-y-4">
            {recentChanges && recentChanges.length > 0 ? (
              recentChanges.map((change: any) => (
                <div key={change.id} className="flex items-start pb-4 border-b border-gray-100 last:border-0">
                  <div className="h-2 w-2 mt-2 rounded-full bg-blue-500 mr-3"></div>
                  <div>
                    <p className="text-gray-700">
                      {change.statut === 'créée' && 'Nouvelle intervention créée'}
                      {change.statut === 'modifiée' && 'Intervention modifiée'}
                      {change.statut === 'annulée' && 'Intervention annulée'}
                      {change.statut === 'validée' && 'Intervention validée'}
                      {!['créée', 'modifiée', 'annulée', 'validée'].includes(change.statut) && change.commentaire}
                      {change.intervention?.cours && ` pour ${change.intervention.cours.code}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(change.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Aucune activité récente</p>
            )}
          </div>
        </section>

        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 gap-3">
            <Link href="/admin/departements/nouveau">
              <div className="flex items-center p-3 rounded border border-gray-200 hover:bg-gray-50 transition-colors">
                <FaDatabase className="text-blue-500 mr-3" />
                <span>Ajouter un département</span>
              </div>
            </Link>
            <Link href="/admin/enseignants/nouveau">
              <div className="flex items-center p-3 rounded border border-gray-200 hover:bg-gray-50 transition-colors">
                <FaUsers className="text-green-500 mr-3" />
                <span>Ajouter un enseignant</span>
              </div>
            </Link>
            <Link href="/admin/maquettes/nouvelle">
              <div className="flex items-center p-3 rounded border border-gray-200 hover:bg-gray-50 transition-colors">
                <FaFileAlt className="text-yellow-500 mr-3" />
                <span>Créer une maquette</span>
              </div>
            </Link>
            <Link href="/admin/interventions/nouvelle">
              <div className="flex items-center p-3 rounded border border-gray-200 hover:bg-gray-50 transition-colors">
                <FaServer className="text-purple-500 mr-3" />
                <span>Planifier une intervention</span>
              </div>
            </Link>
            <Link href="/admin/database/backup">
              <div className="flex items-center p-3 rounded border border-gray-200 hover:bg-gray-50 transition-colors">
                <FaDatabase className="text-red-500 mr-3" />
                <span>Sauvegarder la base de données</span>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
} 