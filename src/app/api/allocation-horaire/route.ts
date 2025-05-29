import { db } from "@/lib/database";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT ah.*, 
             c.id as cours_id, c.nom as cours_nom,
             tc.id as type_cours_id, tc.nom as type_cours_nom
      FROM allocation_horaire ah
      LEFT JOIN cours c ON ah.cours_id = c.id
      LEFT JOIN type_cours tc ON ah.type_cours_id = tc.id
      ORDER BY ah.id
    `);

    // Restructurer les données pour correspondre au format attendu
    const formattedData = (rows as any[]).map((row) => ({
      ...row,
      cours: { id: row.cours_id, nom: row.cours_nom },
      type_cours: { id: row.type_cours_id, nom: row.type_cours_nom },
    }));

    return NextResponse.json(formattedData);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des allocations horaires" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validation des données requises
    if (!body.cours_id || !body.type_cours_id || !body.nb_heures) {
      return NextResponse.json(
        { error: "Le cours, le type de cours et le nombre d'heures sont requis" },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      "INSERT INTO allocation_horaire (cours_id, type_cours_id, nb_heures) VALUES (?, ?, ?)",
      [body.cours_id, body.type_cours_id, body.nb_heures]
    );

    const insertId = (result as any).insertId;
    const [newRow] = await db.query(
      `
      SELECT ah.*, 
             c.id as cours_id, c.nom as cours_nom,
             tc.id as type_cours_id, tc.nom as type_cours_nom
      FROM allocation_horaire ah
      LEFT JOIN cours c ON ah.cours_id = c.id
      LEFT JOIN type_cours tc ON ah.type_cours_id = tc.id
      WHERE ah.id = ?
    `,
      [insertId]
    );

    const formattedData = (newRow as any[])[0];
    return NextResponse.json(
      {
        ...formattedData,
        cours: { id: formattedData.cours_id, nom: formattedData.cours_nom },
        type_cours: { id: formattedData.type_cours_id, nom: formattedData.type_cours_nom },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de l'allocation horaire" },
      { status: 500 }
    );
  }
}
