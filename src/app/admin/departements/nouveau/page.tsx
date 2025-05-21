import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';

export const metadata = {
  title: 'Nouvel Département - Admin Manager IUT',
  description: 'Créer un nouveau département',
};

async function createDepartement(formData: FormData) {
  'use server';
  
  // Récupérer les données du formulaire
  const nom = formData.get('nom') as string;
  const code = formData.get('code') as string;
  const description = formData.get('description') as string;

  // Vérifier que les champs obligatoires sont remplis
  if (!nom || !code) {
    throw new Error('Le nom et le code sont obligatoires');
  }

  try {
    // Insérer le nouveau département dans la base de données
    const { data, error } = await supabase
      .from('departement')
      .insert([{ nom, code, description }])
      .select();

    if (error) throw error;

    // Rediriger vers la liste des départements
    redirect('/admin/departements');
  } catch (error) {
    console.error('Erreur lors de la création du département:', error);
    throw new Error('Erreur lors de la création du département');
  }
}

export default function NewDepartementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Créer un nouveau département</h1>
        <Link 
          href="/admin/departements" 
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Retour
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <form action={createDepartement} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium text-gray-700">
                Code du département <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="code"
                name="code"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ex: INFO"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="nom" className="text-sm font-medium text-gray-700">
                Nom du département <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ex: Informatique"
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
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Description du département..."
            ></textarea>
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