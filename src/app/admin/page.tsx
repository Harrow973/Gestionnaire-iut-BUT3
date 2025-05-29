"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  FaClipboardList,
} from "react-icons/fa";
import { FaServer, FaFileAlt } from "react-icons/fa";

// Define types for the app
interface HistoryItem {
  id: string;
  created_at: string;
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

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Statistics>({
    departments: 0,
    teachers: 0,
    courses: 0,
    interventions: 0,
    users: 0,
  });
  const [recentChanges, setRecentChanges] = useState<HistoryItem[]>([]);

  // Load initial data
  useEffect(() => {
    loadStats();
    loadRecentChanges();
    setIsLoading(false);
  }, []);

  // Function to fetch database statistics
  async function loadStats() {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques :", error);
    }
  }

  // Function to fetch recent changes
  async function loadRecentChanges() {
    try {
      const response = await fetch("/api/admin/recent-changes");
      const data = await response.json();
      setRecentChanges(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des modifications récentes :", error);
    }
  }

  const adminModules = [
    {
      title: "Gestion des utilisateurs",
      description: "Gérer les comptes administrateurs et les droits d'accès",
      icon: <FaUsersCog className="text-3xl" />,
      path: "/admin/utilisateurs",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      count: stats.users,
    },
    {
      title: "Gestion des départements",
      description: "Ajouter, modifier ou supprimer des départements",
      icon: <FaSchool className="text-3xl" />,
      path: "/admin/departements",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      count: stats.departments,
    },
    {
      title: "Gestion des enseignants",
      description: "Administrer les comptes enseignants et leurs attributions",
      icon: <FaChalkboardTeacher className="text-3xl" />,
      path: "/admin/enseignants",
      color: "bg-gradient-to-br from-green-500 to-green-600",
      count: stats.teachers,
    },
    {
      title: "Gestion du planning",
      description: "Configurer les périodes d'enseignement et les créneaux",
      icon: <FaCalendarAlt className="text-3xl" />,
      path: "/admin/planning",
      color: "bg-gradient-to-br from-amber-500 to-amber-600",
      count: stats.interventions,
    },
    {
      title: "Paramètres du système",
      description: "Configurer les paramètres globaux de l'application",
      icon: <FaCog className="text-3xl" />,
      path: "/admin/parametres",
      color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
      count: 0,
    },
    {
      title: "Logs et audit",
      description: "Consulter les journaux et l'historique des actions",
      icon: <FaClipboardList className="text-3xl" />,
      path: "/admin/logs",
      color: "bg-gradient-to-br from-red-500 to-red-600",
      count: 0,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminModules.map((module, index) => (
          <Link key={index} href={module.path}>
            <div
              className={`p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow ${module.color} text-white`}
            >
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
                      {change.commentaire}
                      {change.intervention?.cours && ` pour ${change.intervention.cours.code}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(change.created_at).toLocaleString("fr-FR")}</p>
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
