import { db } from "@/lib/database";
import { NextResponse } from "next/server";

// GET - Récupérer un département par son ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const [rows] = await db.query("SELECT * FROM departement WHERE id = ?", [params.id]);

    if (!(rows as any[]).length) {
      return NextResponse.json({ error: "Département non trouvé" }, { status: 404 });
    }

    return NextResponse.json((rows as any[])[0]);
  } catch (error) {
    console.error("Exception lors de la récupération du département:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

// PUT - Mettre à jour un département
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const updateData = await request.json();

    // Validation des données requises
    if (!updateData.nom || !updateData.code) {
      return NextResponse.json({ error: "Le nom et le code du département sont requis" }, { status: 400 });
    }

    await db.query("UPDATE departement SET nom = ?, code = ?, description = ?, updated_at = NOW() WHERE id = ?", [
      updateData.nom,
      updateData.code,
      updateData.description || null,
      params.id,
    ]);

    const [updatedRow] = await db.query("SELECT * FROM departement WHERE id = ?", [params.id]);

    if (!(updatedRow as any[]).length) {
      return NextResponse.json({ error: "Département non trouvé" }, { status: 404 });
    }

    return NextResponse.json((updatedRow as any[])[0]);
  } catch (error) {
    console.error("Exception lors de la mise à jour du département:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

// DELETE - Supprimer un département
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const [result] = await db.query("DELETE FROM departement WHERE id = ?", [params.id]);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Département non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Exception lors de la suppression du département:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
