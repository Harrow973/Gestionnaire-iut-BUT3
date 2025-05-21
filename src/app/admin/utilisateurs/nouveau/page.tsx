import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';

export const metadata = {
  title: 'Nouvel Utilisateur - Admin Manager IUT',
  description: 'Ajouter un nouvel utilisateur',
};

async function createUser(formData: FormData) {
  'use server';
  
  // Récupérer les données du formulaire
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirm_password = formData.get('confirm_password') as string;
  const nom = formData.get('nom') as string;
  const prenom = formData.get('prenom') as string;
  const role = formData.get('role') as string;
  const departement_id = Number(formData.get('departement_id') || null);

  // Vérifier que les champs obligatoires sont remplis
  if (!email || !password || !nom || !prenom || !role) {
    throw new Error('Tous les champs obligatoires doivent être remplis');
  }

  // Vérifier que les mots de passe correspondent
  if (password !== confirm_password) {
    throw new Error('Les mots de passe ne correspondent pas');
  }

  try {
    // 1. Créer l'utilisateur avec Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nom,
          prenom,
          role,
          departement_id
        }
      }
    });

    if (authError) throw authError;

    // 2. Stocker les informations complémentaires dans la table utilisateurs
    const { error: profileError } = await supabase
      .from('utilisateur')
      .insert([{
        id: authData.user?.id,
        email,
        nom,
        prenom,
        role,
        departement_id: departement_id || null
      }]);

    if (profileError) throw profileError;

    // Rediriger vers la liste des utilisateurs
    redirect('/admin/utilisateurs');
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    throw new Error('Erreur lors de la création de l\'utilisateur');
  }
}

export default async function NewUserPage() {
  // Récupérer la liste des départements
  const { data: departements, error: deptError } = await supabase
    .from('departement')
    .select('id, nom, code')
    .order('nom');

  if (deptError) {
    console.error('Erreur lors de la récupération des départements:', deptError);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Ajouter un nouvel utilisateur</h1>
        <Link 
          href="/admin/utilisateurs" 
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Retour
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <form action={createUser} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                placeholder="Prénom de l'utilisateur"
              />
            </div>

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
                placeholder="Nom de l'utilisateur"
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
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="********"
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm_password" className="text-sm font-medium text-gray-700">
                Confirmer le mot de passe <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="********"
                minLength={8}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium text-gray-700">
                Rôle <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner un rôle</option>
                <option value="admin">Administrateur</option>
                <option value="manager">Gestionnaire</option>
                <option value="user">Utilisateur standard</option>
                <option value="viewer">Lecteur seul</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="departement_id" className="text-sm font-medium text-gray-700">
                Département associé
              </label>
              <select
                id="departement_id"
                name="departement_id"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Aucun département</option>
                {departements?.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.code} - {dept.nom}
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