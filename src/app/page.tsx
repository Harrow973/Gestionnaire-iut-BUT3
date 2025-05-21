import Link from "next/link";
import { 
  FaUserPlus,
  FaPlusCircle,
  FaChartBar,
  FaArrowRight,
  FaRegBell,
  FaSearch,
  FaRegClock,
  FaUserShield
} from "react-icons/fa";
import { Suspense } from "react";

// Import dashboard components using relative paths
import DashboardStats from "../components/dashboard/DashboardStats";
import RecentActivities from "../components/dashboard/RecentActivities";
import UpcomingInterventions from "../components/dashboard/UpcomingInterventions";
import HoursDistributionChart from "../components/dashboard/HoursDistributionChart";
import { supabase } from "@/lib/supabase";
import { DashboardStat, Activity, UpcomingIntervention } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

export const revalidate = 60; // Revalidate this page every 60 seconds

// Fonction pour récupérer les statistiques depuis l'API côté serveur
async function getStats(): Promise<DashboardStat[]> {
  // 1. Récupérer le nombre de départements
  const { count: departementCount, error: departementError } = await supabase
    .from('departement')
    .select('*', { count: 'exact', head: true });
  
  if (departementError) {
    console.error('Erreur lors de la récupération des départements:', departementError);
    throw new Error('Erreur lors de la récupération des statistiques');
  }
  
  // 2. Récupérer le nombre d'enseignants
  const { count: enseignantCount, error: enseignantError } = await supabase
    .from('enseignant')
    .select('*', { count: 'exact', head: true });
  
  // 3. Récupérer le nombre de maquettes
  const { count: maquetteCount, error: maquetteError } = await supabase
    .from('maquette_pedagogique')
    .select('*', { count: 'exact', head: true });
  
  // 4. Récupérer le nombre de cours
  const { count: coursCount, error: coursError } = await supabase
    .from('cours')
    .select('*', { count: 'exact', head: true });
  
  // 5. Récupérer le nombre d'interventions
  const { count: interventionCount, error: interventionError } = await supabase
    .from('intervention')
    .select('*', { count: 'exact', head: true });
  
  // 6. Calculer les "tendances" pour chaque catégorie
  const getRandomChange = (count: number, type: string) => {
    switch (type) {
      case 'departements':
        return count > 0 ? '+1 ce semestre' : 'Stable';
      case 'enseignants':
        return `+${Math.floor(count * 0.1)} depuis septembre`;
      case 'maquettes':
        return `${Math.max(0, Math.floor(count * 0.2))} mises à jour récentes`;
      case 'cours':
        return `${Math.max(0, Math.floor(count * 0.15))} nouveaux ce semestre`;
      case 'interventions':
        return `${Math.max(0, Math.floor(count * 0.25))} cette semaine`;
      default:
        return 'Donnée récente';
    }
  };
  
  // 7. Formater les statistiques pour le composant
  return [
    {
      label: 'Départements',
      count: departementCount || 0,
      path: '/departements',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      change: getRandomChange(departementCount || 0, 'departements')
    },
    {
      label: 'Enseignants',
      count: enseignantCount || 0,
      path: '/enseignants',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'from-emerald-50 to-emerald-100',
      change: getRandomChange(enseignantCount || 0, 'enseignants')
    },
    {
      label: 'Maquettes',
      count: maquetteCount || 0,
      path: '/maquettes',
      color: 'from-amber-500 to-amber-600',
      bgColor: 'from-amber-50 to-amber-100',
      change: getRandomChange(maquetteCount || 0, 'maquettes')
    },
    {
      label: 'Cours',
      count: coursCount || 0,
      path: '/cours',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      change: getRandomChange(coursCount || 0, 'cours')
    },
    {
      label: 'Interventions',
      count: interventionCount || 0,
      path: '/interventions',
      color: 'from-rose-500 to-rose-600',
      bgColor: 'from-rose-50 to-rose-100',
      change: getRandomChange(interventionCount || 0, 'interventions')
    }
  ];
}

// Fonction pour récupérer les activités récentes depuis l'API côté serveur
async function getRecentActivities(limit: number = 5): Promise<Activity[]> {
  // Récupérer l'historique des interventions
  const { data: historyData, error: historyError } = await supabase
    .from('historique_intervention')
    .select(`
      id,
      created_at,
      statut,
      commentaire,
      intervention:intervention_id(
        id,
        cours:cours_id(id, code, nom)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (historyError) {
    console.error('Erreur lors de la récupération de l\'historique:', historyError);
    throw new Error('Erreur lors de la récupération des activités récentes');
  }
  
  // Formater les données pour le composant RecentActivities
  return historyData.map((item) => {
    let text = '';
    let link = '';
    
    // Déterminer le texte et le lien en fonction du statut
    switch (item.statut.toLowerCase()) {
      case 'créée':
        text = `Nouvelle intervention créée pour ${item.intervention.cours.code}`;
        link = `/interventions/${item.intervention.id}`;
        break;
      case 'modifiée':
        text = `Intervention ${item.intervention.cours.code} modifiée`;
        link = `/interventions/${item.intervention.id}`;
        break;
      case 'annulée':
        text = `Intervention ${item.intervention.cours.code} annulée`;
        link = `/interventions/${item.intervention.id}`;
        break;
      case 'validée':
        text = `Intervention ${item.intervention.cours.code} validée`;
        link = `/interventions/${item.intervention.id}`;
        break;
      default:
        text = item.commentaire || `Activité sur ${item.intervention.cours.code}`;
        link = `/interventions/${item.intervention.id}`;
    }
    
    return {
      id: item.id,
      text,
      time: formatRelativeTime(item.created_at),
      link
    };
  });
}

// Fonction pour récupérer les interventions à venir depuis l'API côté serveur
async function getUpcomingInterventions(limit: number = 3): Promise<UpcomingIntervention[]> {
  // Obtenir la date d'aujourd'hui
  const today = new Date().toISOString().split('T')[0];
  
  // Récupérer les interventions avec planification à venir
  const { data, error } = await supabase
    .from('planning')
    .select(`
      id,
      date,
      debut,
      fin,
      intervention:intervention_id(
        id,
        heures,
        enseignant:enseignant_id(id, nom, prenom),
        cours:cours_id(
          id,
          code,
          nom,
          maquette_pedagogique:maquette_pedagogique_id(
            departement:departement_id(code)
          )
        )
      ),
      salle:salle_id(id, nom, batiment)
    `)
    .gte('date', today)
    .order('date', { ascending: true })
    .order('debut', { ascending: true })
    .limit(limit);
  
  if (error) {
    console.error('Erreur lors de la récupération des interventions à venir:', error);
    throw new Error('Erreur lors de la récupération des interventions');
  }
  
  // Formater les données pour le composant UpcomingInterventions
  return data.map((item) => {
    const date = new Date(`${item.date}T${item.debut}`);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    // Calculer la durée en heures
    const debut = new Date(`${item.date}T${item.debut}`);
    const fin = new Date(`${item.date}T${item.fin}`);
    const dureeMs = fin.getTime() - debut.getTime();
    const duree = Math.round((dureeMs / (1000 * 60 * 60)) * 10) / 10; // Arrondi à 1 décimale
    
    return {
      id: item.intervention.id,
      titre: item.intervention.cours.nom,
      date: date.toLocaleDateString('fr-FR', options),
      enseignant: `${item.intervention.enseignant.prenom} ${item.intervention.enseignant.nom}`,
      salle: item.salle ? `${item.salle.nom}${item.salle.batiment ? ` (${item.salle.batiment})` : ''}` : 'Non définie',
      cours: item.intervention.cours.code,
      departement: item.intervention.cours.maquette_pedagogique.departement.code,
      duree: duree
    };
  });
}

export default async function Home() {
  // Récupérer les données pour les composants
  const statsPromise = getStats();
  const activitiesPromise = getRecentActivities(5);
  const interventionsPromise = getUpcomingInterventions(3);
  
  // Récupérer les résultats des promesses
  const [stats, activities, interventions] = await Promise.all([
    statsPromise,
    activitiesPromise,
    interventionsPromise
  ]);
  
  const quickActions = [
    {
      title: "Nouvel enseignant",
      description: "Ajouter un nouveau professeur au système",
      icon: <FaUserPlus className="text-2xl" />,
      path: "/enseignants/nouveau",
      color: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      title: "Nouvelle intervention",
      description: "Programmer un nouveau cours",
      icon: <FaPlusCircle className="text-2xl" />,
      path: "/interventions/nouvelle",
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600"
    },
    {
      title: "Générer un rapport",
      description: "Créer des rapports personnalisés",
      icon: <FaChartBar className="text-2xl" />,
      path: "/rapports",
      color: "bg-gradient-to-br from-purple-500 to-purple-600"
    },
    {
      title: "Administration",
      description: "Accéder aux fonctions administrateur",
      icon: <FaUserShield className="text-2xl" />,
      path: "/admin",
      color: "bg-gradient-to-br from-amber-500 to-amber-600"
    }
  ];
  
  return (
    <div className="space-y-8">
      {/* Header with search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
            Tableau de bord
          </h1>
          <p className="mt-2 text-gray-600">
            Bienvenue sur le gestionnaire de maquette pédagogique de l'IUT
          </p>
        </div>
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Rechercher..."
          />
        </div>
      </div>
      
      {/* Stats Grid */}
      <Suspense fallback={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse">
              <div className="h-8 w-8 bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-7 w-16 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      }>
        <DashboardStats fallbackData={stats} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Actions rapides</h2>
          <div className="space-y-4">
            {quickActions.map((action, index) => (
              <Link 
                key={index} 
                href={action.path} 
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className={`${action.color} p-3 rounded-lg text-white shrink-0`}>
                  {action.icon}
                </div>
                <div className="ml-4 flex-grow">
                  <h3 className="font-medium text-gray-800">{action.title}</h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
                <FaArrowRight className="text-gray-300 group-hover:text-gray-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Charts and Data */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Répartition des heures</h2>
          <Suspense fallback={
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-10 rounded-lg flex items-center justify-center min-h-[250px] shadow-inner">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          }>
            <HoursDistributionChart />
          </Suspense>
        </div>
      </div>

      {/* Recent Activity & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Activité récente</h2>
            <FaRegBell className="text-gray-400" />
          </div>
          <Suspense fallback={
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-start animate-pulse">
                  <div className="h-2 w-2 mt-2 rounded-full bg-gray-200 mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          }>
            <RecentActivities limit={5} fallbackData={activities} />
          </Suspense>
        </div>

        {/* Upcoming Interventions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Interventions à venir</h2>
          <Suspense fallback={
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white border border-gray-100 rounded-lg p-4 animate-pulse">
                  <div className="flex justify-between items-start mb-2">
                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-5 w-16 bg-blue-100 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          }>
            <UpcomingInterventions limit={3} fallbackData={interventions} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
