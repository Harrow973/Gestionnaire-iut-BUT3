import { db } from "@/lib/database";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT * FROM salle ORDER BY id");
    return NextResponse.json(rows);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Une erreur est survenue lors de la récupération des salles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const [result] = await db.query("INSERT INTO salle (nom, capacite, type, batiment) VALUES (?, ?, ?, ?)", [
      body.nom,
      body.capacite,
      body.type,
      body.batiment,
    ]);

    const insertId = (result as any).insertId;
    const [newRow] = await db.query("SELECT * FROM salle WHERE id = ?", [insertId]);

    return NextResponse.json((newRow as any)[0], { status: 201 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Une erreur est survenue lors de la création de la salle" }, { status: 500 });
  }
}
