import { redirect } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import { db } from "@/lib/database";
import { RowDataPacket } from "mysql2";

interface Departement extends RowDataPacket {
  id: number;
  nom: string;
  code: string;
}

interface Statut extends RowDataPacket {
  id: number;
  nom: string;
}

export const metadata = {
  title: "Nouvel Enseignant - Admin Manager IUT",
  description: "Ajouter un nouvel enseignant",
};

async function createEnseignant(formData: FormData) {
  "use server";

  // Récupérer les données du formulaire
  const nom = formData.get("nom") as string;
  const prenom = formData.get("prenom") as string;
  const email = formData.get("email") as string;
  const departement_id = Number(formData.get("departement_id"));
  const statut_id = Number(formData.get("statut_id"));

  // Vérifier que les champs obligatoires sont remplis
  if (!nom || !prenom || !email || !departement_id) {
    throw new Error("Tous les champs obligatoires doivent être remplis");
  }

  try {
    // Insérer le nouvel enseignant dans la base de données
    const [result] = await db.query("INSERT INTO enseignant (nom, prenom, email, departement_id) VALUES (?, ?, ?, ?)", [
      nom,
      prenom,
      email,
      departement_id,
    ]);

    const enseignantId = (result as any).insertId;

    // Si un statut est fourni, créer le lien enseignant-statut
    if (statut_id) {
      await db.query("INSERT INTO enseignant_statut (enseignant_id, statut_id, date_debut) VALUES (?, ?, ?)", [
        enseignantId,
        statut_id,
        new Date().toISOString().split("T")[0],
      ]);
    }

    // Rediriger vers la liste des enseignants
  } catch (error) {
    console.error("Erreur lors de la création de l'enseignant:", error);
    throw new Error("Erreur lors de la création de l'enseignant");
  }
  redirect("/admin/enseignants");
}

export default async function NewEnseignantPage() {
  // Récupérer la liste des départements pour le formulaire
  const [departements] = await db.query<Departement[]>("SELECT id, nom, code FROM departement ORDER BY nom");

  // Récupérer la liste des statuts d'enseignant
  const [statuts] = await db.query<Statut[]>("SELECT id, nom FROM statut_enseignant ORDER BY nom");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Ajouter un nouvel enseignant</h1>
        <Link
          href="/admin/enseignants"
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Retour
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <form action={createEnseignant} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="nom" className="text-sm font-medium text-gray-700">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nom de l'enseignant"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="prenom" className="text-sm font-medium text-gray-700">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Prénom de l'enseignant"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="adresse@example.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="departement_id" className="text-sm font-medium text-gray-700">
                Département <span className="text-red-500">*</span>
              </label>
              <select
                id="departement_id"
                name="departement_id"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner un département</option>
                {departements.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.code} - {dept.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="statut_id" className="text-sm font-medium text-gray-700">
                Statut
              </label>
              <select
                id="statut_id"
                name="statut_id"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner un statut</option>
                {statuts.map((statut) => (
                  <option key={statut.id} value={statut.id}>
                    {statut.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FaSave className="mr-2" />
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
