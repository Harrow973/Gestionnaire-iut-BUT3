import { db } from "@/lib/database";
import { NextResponse } from "next/server";

/**
 * GET /api/enseignants
 * Récupère tous les enseignants
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const departementId = searchParams.get("departement_id");

    let query = `
      SELECT 
        e.*,
        d.id as departement_id,
        d.nom as departement_nom,
        d.code as departement_code,
        s.id as statut_id,
        s.nom as statut_nom,
        s.heures_min,
        s.heures_max
      FROM enseignant e
      LEFT JOIN departement d ON e.departement_id = d.id
      LEFT JOIN enseignant_statut es ON e.id = es.enseignant_id
      LEFT JOIN statut_enseignant s ON es.statut_id = s.id
    `;

    const params: any[] = [];

    // Filtrer par département si spécifié
    if (departementId) {
      query += " WHERE e.departement_id = ?";
      params.push(departementId);
    }

    query += " ORDER BY e.nom";

    const [rows] = await db.query(query, params);

    // Transformer les données pour obtenir un format plus propre
    const formattedData = (rows as any[]).map((row) => {
      const statut = row.statut_id
        ? {
            id: row.statut_id,
            nom: row.statut_nom,
            heures_min: row.heures_min,
            heures_max: row.heures_max,
          }
        : null;

      return {
        id: row.id,
        nom: row.nom,
        prenom: row.prenom,
        email: row.email,
        departement_id: row.departement_id,
        departement: {
          id: row.departement_id,
          nom: row.departement_nom,
          code: row.departement_code,
        },
        statut,
      };
    });

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Exception lors de la récupération des enseignants:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

/**
 * POST /api/enseignants
 * Crée un nouvel enseignant
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validation des données requises
    if (!body.nom || !body.prenom || !body.email || !body.departement_id) {
      return NextResponse.json(
        {
          error: "Le nom, prénom, email et département sont requis",
        },
        { status: 400 }
      );
    }

    // 1. Insérer l'enseignant
    const [result] = await db.query("INSERT INTO enseignant (nom, prenom, email, departement_id) VALUES (?, ?, ?, ?)", [
      body.nom,
      body.prenom,
      body.email,
      body.departement_id,
    ]);

    const enseignantId = (result as any).insertId;

    // Récupérer l'enseignant créé
    const [rows] = await db.query("SELECT * FROM enseignant WHERE id = ?", [enseignantId]);

    const enseignantData = (rows as any[])[0];

    // 2. Si un statut est fourni, créer le lien enseignant-statut
    if (body.statut_id) {
      try {
        await db.query("INSERT INTO enseignant_statut (enseignant_id, statut_id, date_debut) VALUES (?, ?, ?)", [
          enseignantId,
          body.statut_id,
          new Date().toISOString().split("T")[0],
        ]);
      } catch (error) {
        console.error("Erreur lors de l'association du statut:", error);
        // On continue même si l'association a échoué, l'enseignant a été créé
      }
    }

    return NextResponse.json(enseignantData, { status: 201 });
  } catch (error) {
    console.error("Exception lors de la création de l'enseignant:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
