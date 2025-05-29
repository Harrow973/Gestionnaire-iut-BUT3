import { db } from "@/lib/database";
import { NextResponse } from "next/server";
import { formatDate } from "@/lib/utils";

/**
 * GET /api/dashboard/upcoming-interventions
 * Récupère les interventions à venir pour le dashboard
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit") as string) : 5;

    // Obtenir la date d'aujourd'hui
    const today = new Date().toISOString().split("T")[0];

    // Récupérer les interventions avec planification à venir
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
    const formattedData = (rows as any[]).map((item) => {
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

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Exception lors de la récupération des interventions à venir:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
