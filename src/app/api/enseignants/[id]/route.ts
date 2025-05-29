import { db } from "@/lib/database";
import { NextResponse } from "next/server";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/enseignants/[id]
 * Récupère les détails d'un enseignant spécifique
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const id = params.id;

    // Récupérer l'enseignant avec ses relations
    const [rows] = await db.query(
      `
      SELECT 
        e.*,
        d.id as departement_id,
        d.nom as departement_nom,
        d.code as departement_code,
        es.id as statut_id,
        es.date_debut,
        es.date_fin,
        s.nom as statut_nom,
        s.heures_min,
        s.heures_max,
        i.id as intervention_id,
        i.heures_attribuees,
        c.id as cours_id,
        c.code as cours_code,
        c.nom as cours_nom,
        mp.id as maquette_id,
        mp.nom as maquette_nom,
        tc.id as type_cours_id,
        tc.nom as type_cours_nom
      FROM enseignant e
      LEFT JOIN departement d ON e.departement_id = d.id
      LEFT JOIN enseignant_statut es ON e.id = es.enseignant_id AND es.date_fin IS NULL
      LEFT JOIN statut_enseignant s ON es.statut_id = s.id
      LEFT JOIN intervention i ON e.id = i.enseignant_id
      LEFT JOIN cours c ON i.cours_id = c.id
      LEFT JOIN maquette_pedagogique mp ON c.maquette_id = mp.id
      LEFT JOIN type_cours tc ON c.type_cours_id = tc.id
      WHERE e.id = ?
    `,
      [id]
    );

    if (!rows || (rows as any[]).length === 0) {
      return NextResponse.json({ error: "Enseignant non trouvé" }, { status: 404 });
    }

    // Formater les données pour correspondre à la structure Supabase
    const data = {
      ...(rows as any[])[0],
      departement: {
        id: (rows as any[])[0].departement_id,
        nom: (rows as any[])[0].departement_nom,
        code: (rows as any[])[0].departement_code,
      },
      enseignant_statut: (rows as any[])[0].statut_id
        ? [
            {
              id: (rows as any[])[0].statut_id,
              date_debut: (rows as any[])[0].date_debut,
              date_fin: (rows as any[])[0].date_fin,
              statut: {
                id: (rows as any[])[0].statut_id,
                nom: (rows as any[])[0].statut_nom,
                heures_min: (rows as any[])[0].heures_min,
                heures_max: (rows as any[])[0].heures_max,
              },
            },
          ]
        : [],
      intervention: (rows as any[])
        .filter((row) => row.intervention_id)
        .map((row) => ({
          id: row.intervention_id,
          heures_attribuees: row.heures_attribuees,
          cours: {
            id: row.cours_id,
            code: row.cours_code,
            nom: row.cours_nom,
            maquette_pedagogique: {
              id: row.maquette_id,
              nom: row.maquette_nom,
            },
            type_cours: {
              id: row.type_cours_id,
              nom: row.type_cours_nom,
            },
          },
        })),
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Exception lors de la récupération de l'enseignant:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

/**
 * PUT /api/enseignants/[id]
 * Mettre à jour un enseignant
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const id = params.id;
    const body = await request.json();

    // Vérifier les champs obligatoires
    if (!body.nom || !body.prenom || !body.email || !body.departement_id) {
      return NextResponse.json(
        {
          error: "Le nom, prénom, email et département sont requis",
        },
        { status: 400 }
      );
    }

    // Mise à jour de l'enseignant
    const [result] = await db.query(
      "UPDATE enseignant SET nom = ?, prenom = ?, email = ?, departement_id = ? WHERE id = ?",
      [body.nom, body.prenom, body.email, body.departement_id, id]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Enseignant non trouvé" }, { status: 404 });
    }

    // Mise à jour du statut si fourni
    if (body.statut_id) {
      // Vérifier s'il existe déjà un statut actif
      const [existingStatuts] = await db.query(
        "SELECT * FROM enseignant_statut WHERE enseignant_id = ? AND date_fin IS NULL",
        [id]
      );

      const existingStatut = (existingStatuts as any[])[0];

      if (existingStatut) {
        // Si le statut est différent, fermer l'ancien et en créer un nouveau
        if (existingStatut.statut_id !== body.statut_id) {
          // Fermer le statut existant
          await db.query("UPDATE enseignant_statut SET date_fin = ? WHERE id = ?", [
            new Date().toISOString().split("T")[0],
            existingStatut.id,
          ]);

          // Créer un nouveau statut
          await db.query("INSERT INTO enseignant_statut (enseignant_id, statut_id, date_debut) VALUES (?, ?, ?)", [
            id,
            body.statut_id,
            new Date().toISOString().split("T")[0],
          ]);
        }
      } else {
        // Créer un nouveau statut
        await db.query("INSERT INTO enseignant_statut (enseignant_id, statut_id, date_debut) VALUES (?, ?, ?)", [
          id,
          body.statut_id,
          new Date().toISOString().split("T")[0],
        ]);
      }
    }

    // Récupérer l'enseignant mis à jour
    const [updatedRows] = await db.query("SELECT * FROM enseignant WHERE id = ?", [id]);
    return NextResponse.json((updatedRows as any[])[0]);
  } catch (error) {
    console.error("Exception lors de la mise à jour de l'enseignant:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

/**
 * DELETE /api/enseignants/[id]
 * Supprimer un enseignant
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const id = params.id;

    // Vérifier si l'enseignant est référencé ailleurs
    const [references] = await db.query("SELECT COUNT(*) as count FROM intervention WHERE enseignant_id = ?", [id]);

    if ((references as any[])[0].count > 0) {
      return NextResponse.json(
        {
          error: "Impossible de supprimer cet enseignant car il est référencé par d'autres données",
        },
        { status: 409 }
      );
    }

    // Supprimer l'enseignant
    const [result] = await db.query("DELETE FROM enseignant WHERE id = ?", [id]);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Enseignant non trouvé" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Exception lors de la suppression de l'enseignant:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
