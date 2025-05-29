import { NextResponse } from "next/server";
import { db } from "@/lib/database";

export async function GET() {
  try {
    // Requête pour récupérer tous les statuts
    const [rows] = await db.execute("SELECT id, nom, heures_min, heures_max FROM statut_enseignant ORDER BY nom");

    // Retour des données
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des statuts:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des statuts" }, { status: 500 });
  }
}
