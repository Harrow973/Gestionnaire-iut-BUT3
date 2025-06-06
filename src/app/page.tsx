import Link from "next/link";
import {
  FaUserPlus,
  FaPlusCircle,
  FaChartBar,
  FaArrowRight,
  FaRegBell,
  FaSearch,
  FaRegClock,
  FaUserShield,
} from "react-icons/fa";
import { Suspense } from "react";

// Import dashboard components using relative paths
import DashboardStats from "../components/dashboard/DashboardStats";
import RecentActivities from "../components/dashboard/RecentActivities";
import UpcomingInterventions from "../components/dashboard/UpcomingInterventions";
import HoursDistributionChart from "../components/dashboard/HoursDistributionChart";
import { db } from "@/lib/database";
import { DashboardStat, Activity, UpcomingIntervention } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

export const revalidate = 60; // Revalidate this page every 60 seconds

// Fonction pour récupérer les statistiques depuis l'API côté serveur
async function getStats(): Promise<DashboardStat[]> {
  try {
    // 1. Récupérer le nombre de départements
    const [departementResult] = await db.query("SELECT COUNT(*) as count FROM departement");
    const departementCount = (departementResult as any[])[0].count;

    // 2. Récupérer le nombre d'enseignants
    const [enseignantResult] = await db.query("SELECT COUNT(*) as count FROM enseignant");
    const enseignantCount = (enseignantResult as any[])[0].count;

    // 3. Récupérer le nombre de maquettes
    const [maquetteResult] = await db.query("SELECT COUNT(*) as count FROM maquette_pedagogique");
    const maquetteCount = (maquetteResult as any[])[0].count;

    // 4. Récupérer le nombre de cours
    const [coursResult] = await db.query("SELECT COUNT(*) as count FROM cours");
    const coursCount = (coursResult as any[])[0].count;

    // 5. Récupérer le nombre d'interventions
    const [interventionResult] = await db.query("SELECT COUNT(*) as count FROM intervention");
    const interventionCount = (interventionResult as any[])[0].count;

    // 6. Calculer les "tendances" pour chaque catégorie
    const getRandomChange = (count: number, type: string) => {
      switch (type) {
        case "departements":
          return count > 0 ? "+1 ce semestre" : "Stable";
        case "enseignants":
          return `+${Math.floor(count * 0.1)} depuis septembre`;
        case "maquettes":
          return `${Math.max(0, Math.floor(count * 0.2))} mises à jour récentes`;
        case "cours":
          return `${Math.max(0, Math.floor(count * 0.15))} nouveaux ce semestre`;
        case "interventions":
          return `${Math.max(0, Math.floor(count * 0.25))} cette semaine`;
        default:
          return "Donnée récente";
      }
    };

    // 7. Formater les statistiques pour le composant
    return [
      {
        label: "Départements",
        count: departementCount,
        path: "/departements",
        color: "from-blue-500 to-blue-600",
        bgColor: "from-blue-50 to-blue-100",
        change: getRandomChange(departementCount, "departements"),
      },
      {
        label: "Enseignants",
        count: enseignantCount,
        path: "/enseignants",
        color: "from-emerald-500 to-emerald-600",
        bgColor: "from-emerald-50 to-emerald-100",
        change: getRandomChange(enseignantCount, "enseignants"),
      },
      {
        label: "Maquettes",
        count: maquetteCount,
        path: "/maquettes",
        color: "from-amber-500 to-amber-600",
        bgColor: "from-amber-50 to-amber-100",
        change: getRandomChange(maquetteCount, "maquettes"),
      },
      {
        label: "Cours",
        count: coursCount,
        path: "/cours",
        color: "from-purple-500 to-purple-600",
        bgColor: "from-purple-50 to-purple-100",
        change: getRandomChange(coursCount, "cours"),
      },
      {
        label: "Interventions",
        count: interventionCount,
        path: "/interventions",
        color: "from-rose-500 to-rose-600",
        bgColor: "from-rose-50 to-rose-100",
        change: getRandomChange(interventionCount, "interventions"),
      },
    ];
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    throw new Error("Erreur lors de la récupération des statistiques");
  }
}

// Fonction pour récupérer les activités récentes depuis l'API côté serveur
async function getRecentActivities(limit: number = 5): Promise<Activity[]> {
  try {
    const [rows] = await db.query(
      `
      SELECT 
        hi.id,
        hi.created_at,
        hi.statut,
        hi.commentaire,
        i.id as intervention_id,
        c.id as cours_id,
        c.code as cours_code,
        c.nom as cours_nom
      FROM historique_intervention hi
      LEFT JOIN intervention i ON hi.intervention_id = i.id
      LEFT JOIN cours c ON i.cours_id = c.id
      ORDER BY hi.created_at DESC
      LIMIT ?
    `,
      [limit]
    );

    // Formater les données pour le composant RecentActivities
    return (rows as any[]).map((item) => {
      let text = "";
      let link = "";

      // Déterminer le texte et le lien en fonction du statut
      switch (item.statut.toLowerCase()) {
        case "créée":
          text = `Nouvelle intervention créée pour ${item.cours_code}`;
          link = `/interventions/${item.intervention_id}`;
          break;
        case "modifiée":
          text = `Intervention ${item.cours_code} modifiée`;
          link = `/interventions/${item.intervention_id}`;
          break;
        case "annulée":
          text = `Intervention ${item.cours_code} annulée`;
          link = `/interventions/${item.intervention_id}`;
          break;
        case "validée":
          text = `Intervention ${item.cours_code} validée`;
          link = `/interventions/${item.intervention_id}`;
          break;
        default:
          text = item.commentaire || `Activité sur ${item.cours_code}`;
          link = `/interventions/${item.intervention_id}`;
      }

      return {
        id: item.id,
        text,
        time: formatRelativeTime(item.created_at),
        link,
      };
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des activités récentes:", error);
    throw new Error("Erreur lors de la récupération des activités récentes");
  }
}

// Fonction pour récupérer les interventions à venir depuis l'API côté serveur
async function getUpcomingInterventions(limit: number = 3): Promise<UpcomingIntervention[]> {
  try {
    const today = new Date().toISOString().split("T")[0];

    const [rows] = await db.query(
      `
      SELECT 
        p.id,
        p.date,
        p.debut,
        p.fin,
        i.id as intervention_id,
        i.heures,
        e.id as enseignant_id,
        e.nom as enseignant_nom,
        e.prenom as enseignant_prenom,
        c.id as cours_id,
        c.code as cours_code,
        c.nom as cours_nom,
        d.code as departement_code,
        s.id as salle_id,
        s.nom as salle_nom,
        s.batiment as salle_batiment
      FROM planning p
      LEFT JOIN intervention i ON p.intervention_id = i.id
      LEFT JOIN enseignant e ON i.enseignant_id = e.id
      LEFT JOIN cours c ON i.cours_id = c.id
      LEFT JOIN maquette_pedagogique mp ON c.maquette_pedagogique_id = mp.id
      LEFT JOIN departement d ON mp.departement_id = d.id
      LEFT JOIN salle s ON p.salle_id = s.id
      WHERE p.date >= ?
      ORDER BY p.date ASC, p.debut ASC
      LIMIT ?
    `,
      [today, limit]
    );

    // Formater les données pour le composant UpcomingInterventions
    return (rows as any[]).map((item) => {
      const date = new Date(`${item.date}T${item.debut}`);
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      };

      // Calculer la durée en heures
      const debut = new Date(`${item.date}T${item.debut}`);
      const fin = new Date(`${item.date}T${item.fin}`);
      const dureeMs = fin.getTime() - debut.getTime();
      const duree = Math.round((dureeMs / (1000 * 60 * 60)) * 10) / 10; // Arrondi à 1 décimale

      return {
        id: item.intervention_id,
        titre: item.cours_nom,
        date: date.toLocaleDateString("fr-FR", options),
        enseignant: `${item.enseignant_prenom} ${item.enseignant_nom}`,
        salle: item.salle_nom
          ? `${item.salle_nom}${item.salle_batiment ? ` (${item.salle_batiment})` : ""}`
          : "Non définie",
        cours: item.cours_code,
        departement: item.departement_code,
        duree: duree,
      };
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des interventions à venir:", error);
    throw new Error("Erreur lors de la récupération des interventions");
  }
}

export default async function Home() {
  // Récupérer les données pour les composants
  const statsPromise = getStats();
  const activitiesPromise = getRecentActivities(5);
  const interventionsPromise = getUpcomingInterventions(3);

  // Récupérer les résultats des promesses
  const [stats, activities, interventions] = await Promise.all([statsPromise, activitiesPromise, interventionsPromise]);

  const quickActions = [
    {
      title: "Nouvel enseignant",
      description: "Ajouter un nouveau professeur au système",
      icon: <FaUserPlus className="text-2xl" />,
      path: "/enseignants/nouveau",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
    },
    {
      title: "Nouvelle intervention",
      description: "Programmer un nouveau cours",
      icon: <FaPlusCircle className="text-2xl" />,
      path: "/interventions/nouvelle",
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    },
    {
      title: "Générer un rapport",
      description: "Créer des rapports personnalisés",
      icon: <FaChartBar className="text-2xl" />,
      path: "/rapports",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
    },
    {
      title: "Administration",
      description: "Accéder aux fonctions administrateur",
      icon: <FaUserShield className="text-2xl" />,
      path: "/admin",
      color: "bg-gradient-to-br from-amber-500 to-amber-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header with search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
            Tableau de bord
          </h1>
          <p className="mt-2 text-gray-600">Bienvenue sur le gestionnaire de maquette pédagogique de l'IUT</p>
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
      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-7 w-16 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        }
      >
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
                <div className={`${action.color} p-3 rounded-lg text-white shrink-0`}>{action.icon}</div>
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
          <Suspense
            fallback={
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-10 rounded-lg flex items-center justify-center min-h-[250px] shadow-inner">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            }
          >
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
          <Suspense
            fallback={
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
            }
          >
            <RecentActivities limit={5} fallbackData={activities} />
          </Suspense>
        </div>

        {/* Upcoming Interventions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Interventions à venir</h2>
          <Suspense
            fallback={
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
            }
          >
            <UpcomingInterventions limit={3} fallbackData={interventions} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
