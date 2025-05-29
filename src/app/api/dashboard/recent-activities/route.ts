import { db } from "@/lib/database";
import { NextResponse } from "next/server";
import { formatRelativeTime } from "@/lib/utils";

/**
 * GET /api/dashboard/recent-activities
 * Récupère les activités récentes pour le dashboard
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit") as string) : 5;

    // Récupérer l'historique des interventions avec les relations
    const [historyData] = await db.query(
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
    const formattedData = (historyData as any[]).map((item) => {
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

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Exception lors de la récupération des activités récentes:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
