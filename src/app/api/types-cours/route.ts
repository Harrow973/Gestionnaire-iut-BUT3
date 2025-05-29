import { db } from "@/lib/database";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT * FROM type_cours ORDER BY nom");
    return NextResponse.json(rows);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des types de cours" },
      { status: 500 }
    );
  }
}
