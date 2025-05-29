import { db } from "@/lib/database";
import { NextResponse } from "next/server";

/**
 * GET /api/departements
 * Récupère tous les départements
 */
export async function GET() {
  try {
    const [rows] = await db.query("SELECT * FROM departement ORDER BY nom");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Exception lors de la récupération des départements:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

/**
 * POST /api/departements
 * Crée un nouveau département
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validation des données requises
    if (!body.nom || !body.code) {
      return NextResponse.json({ error: "Le nom et le code du département sont requis" }, { status: 400 });
    }

    const [result] = await db.query("INSERT INTO departement (nom, code, description) VALUES (?, ?, ?)", [
      body.nom,
      body.code,
      body.description || null,
    ]);

    const insertId = (result as any).insertId;
    const [newRow] = await db.query("SELECT * FROM departement WHERE id = ?", [insertId]);

    return NextResponse.json((newRow as any)[0], { status: 201 });
  } catch (error) {
    console.error("Exception lors de la création du département:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
