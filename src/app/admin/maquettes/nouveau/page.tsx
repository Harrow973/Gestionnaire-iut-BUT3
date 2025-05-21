import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';

export const metadata = {
  title: 'Nouvelle Maquette - Admin Manager IUT',
  description: 'Créer une nouvelle maquette pédagogique',
};

async function createMaquette(formData: FormData) {
  'use server';
  
  // Récupérer les données du formulaire
  const nom = formData.get('nom') as string;
  const annee = formData.get('annee') as string;
  const departement_id = Number(formData.get('departement_id'));
  const parcours_id = Number(formData.get('parcours_id') || null);

  // Vérifier que les champs obligatoires sont remplis
  if (!nom || !annee || !departement_id) {
    throw new Error('Les champs obligatoires doivent être remplis');
  }

  try {
    // Insérer la nouvelle maquette dans la base de données
    const { data, error } = await supabase
      .from('maquette_pedagogique')
      .insert([{ 
        nom, 
        annee, 
        departement_id,
        parcours_id: parcours_id || null
      }])
      .select();

    if (error) throw error;

    // Rediriger vers la liste des maquettes
    redirect('/admin/maquettes');
  } catch (error) {
    console.error('Erreur lors de la création de la maquette:', error);
    throw new Error('Erreur lors de la création de la maquette');
  }
}

export default async function NewMaquettePage() {
  // Récupérer la liste des départements
  const { data: departements, error: deptError } = await supabase
    .from('departement')
    .select('id, nom, code')
    .order('nom');

  // Récupérer la liste des parcours
  const { data: parcours, error: parcoursError } = await supabase
    .from('parcours')
    .select('id, nom, code, departement_id')
    .order('nom');

  if (deptError) {
    console.error('Erreur lors de la récupération des départements:', deptError);
  }

  if (parcoursError) {
    console.error('Erreur lors de la récupération des parcours:', parcoursError);
  }

  // Calculer les années universitaires pour les 5 prochaines années
  const currentYear = new Date().getFullYear();
  const academicYears = [];
  
  for (let i = 0; i < 5; i++) {
    const startYear = currentYear + i;
    const endYear = startYear + 1;
    academicYears.push(`${startYear}-${endYear}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Créer une nouvelle maquette pédagogique</h1>
        <Link 
          href="/admin/maquettes" 
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Retour
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <form action={createMaquette} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="nom" className="text-sm font-medium text-gray-700">
                Nom de la maquette <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ex: BUT Informatique S3"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="annee" className="text-sm font-medium text-gray-700">
                Année universitaire <span className="text-red-500">*</span>
              </label>
              <select
                id="annee"
                name="annee"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner une année</option>
                {academicYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
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
                {departements?.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.code} - {dept.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="parcours_id" className="text-sm font-medium text-gray-700">
                Parcours
              </label>
              <select
                id="parcours_id"
                name="parcours_id"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner un parcours (optionnel)</option>
                {parcours?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.nom}
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