import { db } from "@/lib/database";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Vérifier les tables principales avec les noms exacts en snake_case
    const tables = [
      "departement",
      "parcours",
      "statut_enseignant",
      "enseignant",
      "enseignant_statut",
      "maquette_pedagogique",
      "cours",
      "type_cours",
      "allocation_horaire",
      "groupe",
      "intervention",
      "salle",
      "planning",
      "historique_intervention",
    ];

    // Tester chaque table
    const results = await Promise.all(
      tables.map(async (tableName) => {
        try {
          // Vérifier si la table existe et compter les enregistrements
          const [tableCheck] = await db.query(
            `SELECT COUNT(*) as count FROM information_schema.tables 
             WHERE table_schema = DATABASE() AND table_name = ?`,
            [tableName]
          );

          const exists = (tableCheck as any[])[0].count > 0;
          let count = 0;

          if (exists) {
            const [countResult] = await db.query(`SELECT COUNT(*) as count FROM ${tableName}`);
            count = (countResult as any[])[0].count;
          }

          return {
            tableName,
            exists,
            count,
            error: null,
          };
        } catch (e) {
          return {
            tableName,
            exists: false,
            count: 0,
            error: e instanceof Error ? e.message : `Table ${tableName} non accessible`,
          };
        }
      })
    );

    // Vérifier si au moins une table existe
    const hasExistingTables = results.some((result) => result.exists);

    if (!hasExistingTables) {
      return NextResponse.json({
        connected: true,
        message: "Connexion à MySQL réussie, mais aucune table trouvée",
        suggestion: "Assurez-vous de créer les tables en exécutant le script SQL fourni.",
        tablesStatus: results,
      });
    }

    // Connexion réussie et certaines tables trouvées
    return NextResponse.json({
      connected: true,
      message: "Connexion à MySQL réussie!",
      tablesStatus: results,
      availableTables: results.filter((r) => r.exists).map((r) => r.tableName),
    });
  } catch (error) {
    console.error("Error testing MySQL connection:", error);
    return NextResponse.json(
      {
        connected: false,
        error: error instanceof Error ? error.message : "Une erreur inconnue est survenue",
      },
      { status: 500 }
    );
  }
}
