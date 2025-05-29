import { db } from "@/lib/database";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT g.*, 
             p.id as parcours_id, p.nom as parcours_nom,
             m.id as maquette_id, m.nom as maquette_nom
      FROM groupe g
      LEFT JOIN parcours p ON g.parcours_id = p.id
      LEFT JOIN maquette_pedagogique m ON g.maquette_id = m.id
      ORDER BY g.id
    `);

    // Restructurer les données pour correspondre au format attendu
    const formattedData = (rows as any[]).map((row) => ({
      ...row,
      parcours: { id: row.parcours_id, nom: row.parcours_nom },
      maquette: { id: row.maquette_id, nom: row.maquette_nom },
    }));

    return NextResponse.json(formattedData);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Une erreur est survenue lors de la récupération des groupes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validation des données requises
    if (!body.nom || !body.effectif) {
      return NextResponse.json({ error: "Le nom et l'effectif du groupe sont requis" }, { status: 400 });
    }

    const [result] = await db.query(
      "INSERT INTO groupe (nom, effectif, parcours_id, maquette_id) VALUES (?, ?, ?, ?)",
      [body.nom, body.effectif, body.parcours_id || null, body.maquette_id || null]
    );

    const insertId = (result as any).insertId;
    const [newRow] = await db.query(
      `
      SELECT g.*, 
             p.id as parcours_id, p.nom as parcours_nom,
             m.id as maquette_id, m.nom as maquette_nom
      FROM groupe g
      LEFT JOIN parcours p ON g.parcours_id = p.id
      LEFT JOIN maquette_pedagogique m ON g.maquette_id = m.id
      WHERE g.id = ?
    `,
      [insertId]
    );

    const formattedData = (newRow as any[])[0];
    return NextResponse.json(
      {
        ...formattedData,
        parcours: { id: formattedData.parcours_id, nom: formattedData.parcours_nom },
        maquette: { id: formattedData.maquette_id, nom: formattedData.maquette_nom },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Une erreur est survenue lors de la création du groupe" }, { status: 500 });
  }
}
