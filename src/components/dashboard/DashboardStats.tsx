'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  FaUniversity, 
  FaChalkboardTeacher, 
  FaBook, 
  FaClipboardList, 
  FaCalendarCheck,
  FaArrowRight
} from "react-icons/fa";
import { DashboardStat } from "@/types";

// Type pour les props
interface DashboardStatsProps {
  fallbackData?: DashboardStat[];
}

// Map des icônes pour chaque type de statistique
const iconMap = {
  "Départements": <FaUniversity size={20} />,
  "Enseignants": <FaChalkboardTeacher size={20} />,
  "Maquettes": <FaBook size={20} />,
  "Cours": <FaClipboardList size={20} />,
  "Interventions": <FaCalendarCheck size={20} />
};

export default function DashboardStats({ fallbackData }: DashboardStatsProps) {
  const [stats, setStats] = useState<DashboardStat[]>(fallbackData || []);
  const [loading, setLoading] = useState(!fallbackData);

  // Fonction pour récupérer les statistiques depuis l'API
  async function fetchStats() {
    try {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Erreur lors de la récupération des statistiques');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erreur:', error);
      // En cas d'erreur, conserver les données de fallback si disponibles
      if (!fallbackData) {
        // Sinon, définir quelques données factices
        setStats([
          {
            label: 'Départements',
            count: 5,
            path: '/departements',
            color: 'from-blue-500 to-blue-600',
            bgColor: 'from-blue-50 to-blue-100',
            change: '+1 ce semestre'
          },
          // Autres données factices...
        ]);
      }
    } finally {
      setLoading(false);
    }
  }

  // Effet pour charger les données si pas de fallback
  useEffect(() => {
    if (!fallbackData) {
      fetchStats();
    }
  }, [fallbackData]);

  // Afficher un état de chargement si nécessaire
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse">
            <div className="h-8 w-8 bg-gray-200 rounded-lg mb-3"></div>
            <div className="h-7 w-16 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
      {stats.map((stat) => (
        <Link 
          key={stat.label} 
          href={stat.path}
          className="group relative overflow-hidden bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 transform hover:-translate-y-1"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-40 group-hover:opacity-60 transition-opacity duration-300`}></div>
          <div className="relative p-5">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                {iconMap[stat.label as keyof typeof iconMap]}
              </div>
              <div className="text-xs font-medium px-2 py-1 rounded-full bg-white/80 text-gray-700 shadow-sm">
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <span className="block text-3xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">{stat.count}</span>
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">{stat.label}</span>
            </div>
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <div className="flex items-center text-sm font-medium text-gray-600">
                <span className="mr-1">Voir tout</span>
                <FaArrowRight className="text-sm" />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 