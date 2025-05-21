import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';

export const metadata = {
  title: 'Nouveau Cours - Admin Manager IUT',
  description: 'Ajouter un nouveau cours',
};

async function createCours(formData: FormData) {
  'use server';
  
  // Récupérer les données du formulaire
  const code = formData.get('code') as string;
  const nom = formData.get('nom') as string;
  const description = formData.get('description') as string;
  const maquette_pedagogique_id = Number(formData.get('maquette_pedagogique_id'));
  const type_cours_id = Number(formData.get('type_cours_id'));
  
  // Récupérer les données pour l'allocation horaire
  const nb_heures = Number(formData.get('nb_heures'));
  const nb_groupes = Number(formData.get('nb_groupes'));

  // Vérifier que les champs obligatoires sont remplis
  if (!code || !nom || !maquette_pedagogique_id || !type_cours_id || !nb_heures) {
    throw new Error('Tous les champs obligatoires doivent être remplis');
  }

  try {
    // Créer le cours dans la base de données
    const { data: coursData, error: coursError } = await supabase
      .from('cours')
      .insert([{ 
        code, 
        nom, 
        description,
        maquette_pedagogique_id,
        type_cours_id
      }])
      .select();

    if (coursError) throw coursError;

    // Récupérer l'ID du cours créé
    const cours_id = coursData[0].id;

    // Créer l'allocation horaire pour ce cours
    const { error: allocError } = await supabase
      .from('allocation_horaire')
      .insert([{
        cours_id,
        nb_heures,
        nb_groupes: nb_groupes || 1
      }]);

    if (allocError) throw allocError;

    // Rediriger vers la liste des cours
    redirect('/admin/cours');
  } catch (error) {
    console.error('Erreur lors de la création du cours:', error);
    throw new Error('Erreur lors de la création du cours');
  }
}

export default async function NewCoursPage() {
  // Récupérer la liste des maquettes pédagogiques
  const { data: maquettes, error: maquetteError } = await supabase
    .from('maquette_pedagogique')
    .select(`
      id, 
      nom, 
      annee,
      departement:departement_id(code, nom)
    `)
    .order('nom');

  // Récupérer la liste des types de cours
  const { data: typesCours, error: typeCoursError } = await supabase
    .from('type_cours')
    .select('id, nom')
    .order('nom');

  if (maquetteError) {
    console.error('Erreur lors de la récupération des maquettes:', maquetteError);
  }

  if (typeCoursError) {
    console.error('Erreur lors de la récupération des types de cours:', typeCoursError);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Ajouter un nouveau cours</h1>
        <Link 
          href="/admin/cours" 
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Retour
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <form action={createCours} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium text-gray-700">
                Code du cours <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="code"
                name="code"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ex: R1.01"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="nom" className="text-sm font-medium text-gray-700">
                Nom du cours <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ex: Développement Web"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Description du cours..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="maquette_pedagogique_id" className="text-sm font-medium text-gray-700">
                Maquette pédagogique <span className="text-red-500">*</span>
              </label>
              <select
                id="maquette_pedagogique_id"
                name="maquette_pedagogique_id"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner une maquette</option>
                {maquettes?.map((maquette) => (
                  <option key={maquette.id} value={maquette.id}>
                    {maquette.departement.code} - {maquette.nom} ({maquette.annee})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="type_cours_id" className="text-sm font-medium text-gray-700">
                Type de cours <span className="text-red-500">*</span>
              </label>
              <select
                id="type_cours_id"
                name="type_cours_id"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner un type</option>
                {typesCours?.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <hr className="my-6 border-gray-200" />
          
          <h3 className="text-lg font-medium text-gray-700 mb-4">Allocation horaire</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="nb_heures" className="text-sm font-medium text-gray-700">
                Nombre d'heures <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="nb_heures"
                name="nb_heures"
                min="1"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ex: 30"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="nb_groupes" className="text-sm font-medium text-gray-700">
                Nombre de groupes
              </label>
              <input
                type="number"
                id="nb_groupes"
                name="nb_groupes"
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ex: 4"
                defaultValue="1"
              />
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