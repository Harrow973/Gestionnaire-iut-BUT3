import { db } from "@/lib/database";
import { NextResponse } from "next/server";

/**
 * GET /api/dashboard/stats
 * Récupère les statistiques pour le dashboard
 */
export async function GET() {
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
    // Dans une app réelle, vous utiliseriez des données historiques
    // ici on simule avec des données aléatoires qui font sens
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
    const stats = [
      {
        label: "Départements",
        count: departementCount || 0,
        path: "/departements",
        color: "from-blue-500 to-blue-600",
        bgColor: "from-blue-50 to-blue-100",
        change: getRandomChange(departementCount || 0, "departements"),
      },
      {
        label: "Enseignants",
        count: enseignantCount || 0,
        path: "/enseignants",
        color: "from-emerald-500 to-emerald-600",
        bgColor: "from-emerald-50 to-emerald-100",
        change: getRandomChange(enseignantCount || 0, "enseignants"),
      },
      {
        label: "Maquettes",
        count: maquetteCount || 0,
        path: "/maquettes",
        color: "from-amber-500 to-amber-600",
        bgColor: "from-amber-50 to-amber-100",
        change: getRandomChange(maquetteCount || 0, "maquettes"),
      },
      {
        label: "Cours",
        count: coursCount || 0,
        path: "/cours",
        color: "from-purple-500 to-purple-600",
        bgColor: "from-purple-50 to-purple-100",
        change: getRandomChange(coursCount || 0, "cours"),
      },
      {
        label: "Interventions",
        count: interventionCount || 0,
        path: "/interventions",
        color: "from-rose-500 to-rose-600",
        bgColor: "from-rose-50 to-rose-100",
        change: getRandomChange(interventionCount || 0, "interventions"),
      },
    ];

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Exception lors de la récupération des statistiques:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
