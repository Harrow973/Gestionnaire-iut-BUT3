import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';

export const metadata = {
  title: 'Nouvelle Intervention - Admin Manager IUT',
  description: 'Créer une nouvelle intervention',
};

async function createIntervention(formData: FormData) {
  'use server';
  
  // Récupérer les données du formulaire
  const enseignant_id = Number(formData.get('enseignant_id'));
  const cours_id = Number(formData.get('cours_id'));
  const groupe_id = Number(formData.get('groupe_id') || null);
  const heures = Number(formData.get('heures'));
  const annee = formData.get('annee') as string;
  
  // Données optionnelles pour le planning
  const date = formData.get('date') as string || null;
  const debut = formData.get('debut') as string || null;
  const fin = formData.get('fin') as string || null;
  const salle_id = Number(formData.get('salle_id') || null);

  // Vérifier que les champs obligatoires sont remplis
  if (!enseignant_id || !cours_id || !heures || !annee) {
    throw new Error('Les champs obligatoires doivent être remplis');
  }

  try {
    // 1. Créer l'intervention
    const { data: interventionData, error: interventionError } = await supabase
      .from('intervention')
      .insert([{ 
        enseignant_id, 
        cours_id, 
        groupe_id: groupe_id || null,
        heures,
        annee
      }])
      .select();

    if (interventionError) throw interventionError;

    // Récupérer l'ID de l'intervention créée
    const intervention_id = interventionData[0].id;

    // 2. Créer un enregistrement dans l'historique
    const { error: historyError } = await supabase
      .from('historique_intervention')
      .insert([{
        intervention_id,
        statut: 'Créée',
        commentaire: 'Intervention créée dans le système'
      }]);

    if (historyError) {
      console.error('Erreur lors de la création de l\'historique:', historyError);
    }

    // 3. Si des informations de planning sont fournies, créer une entrée dans le planning
    if (date && debut && fin && salle_id) {
      const { error: planningError } = await supabase
        .from('planning')
        .insert([{
          intervention_id,
          salle_id,
          date,
          debut,
          fin
        }]);

      if (planningError) {
        console.error('Erreur lors de la création du planning:', planningError);
      }
    }

    // Rediriger vers la liste des interventions
    redirect('/admin/interventions');
  } catch (error) {
    console.error('Erreur lors de la création de l\'intervention:', error);
    throw new Error('Erreur lors de la création de l\'intervention');
  }
}

export default async function NewInterventionPage() {
  // Récupérer la liste des enseignants
  const { data: enseignants, error: enseignantError } = await supabase
    .from('enseignant')
    .select(`
      id,
      nom,
      prenom,
      departement:departement_id(code)
    `)
    .order('nom');

  // Récupérer la liste des cours
  const { data: cours, error: coursError } = await supabase
    .from('cours')
    .select(`
      id,
      code,
      nom,
      maquette_pedagogique:maquette_pedagogique_id(
        departement:departement_id(code)
      )
    `)
    .order('code');

  // Récupérer la liste des groupes
  const { data: groupes, error: groupeError } = await supabase
    .from('groupe')
    .select('id, nom, code')
    .order('nom');

  // Récupérer la liste des salles
  const { data: salles, error: salleError } = await supabase
    .from('salle')
    .select('id, nom, batiment, capacite')
    .order('nom');

  // Gérer les erreurs
  if (enseignantError) {
    console.error('Erreur lors de la récupération des enseignants:', enseignantError);
  }

  if (coursError) {
    console.error('Erreur lors de la récupération des cours:', coursError);
  }

  if (groupeError) {
    console.error('Erreur lors de la récupération des groupes:', groupeError);
  }

  if (salleError) {
    console.error('Erreur lors de la récupération des salles:', salleError);
  }

  // Calculer les années universitaires pour les 3 prochaines années
  const currentYear = new Date().getFullYear();
  const academicYears = [];
  
  for (let i = 0; i < 3; i++) {
    const startYear = currentYear + i;
    const endYear = startYear + 1;
    academicYears.push(`${startYear}-${endYear}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Créer une nouvelle intervention</h1>
        <Link 
          href="/admin/interventions" 
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Retour
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <form action={createIntervention} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="enseignant_id" className="text-sm font-medium text-gray-700">
                Enseignant <span className="text-red-500">*</span>
              </label>
              <select
                id="enseignant_id"
                name="enseignant_id"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner un enseignant</option>
                {enseignants?.map((enseignant) => (
                  <option key={enseignant.id} value={enseignant.id}>
                    {enseignant.prenom} {enseignant.nom} ({enseignant.departement.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="cours_id" className="text-sm font-medium text-gray-700">
                Cours <span className="text-red-500">*</span>
              </label>
              <select
                id="cours_id"
                name="cours_id"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner un cours</option>
                {cours?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.nom} ({c.maquette_pedagogique.departement.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label htmlFor="groupe_id" className="text-sm font-medium text-gray-700">
                Groupe
              </label>
              <select
                id="groupe_id"
                name="groupe_id"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner un groupe</option>
                {groupes?.map((groupe) => (
                  <option key={groupe.id} value={groupe.id}>
                    {groupe.nom} {groupe.code ? `(${groupe.code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="heures" className="text-sm font-medium text-gray-700">
                Nombre d'heures <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="heures"
                name="heures"
                min="0.5"
                step="0.5"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ex: 4.5"
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

          <hr className="my-6 border-gray-200" />
          
          <h3 className="text-lg font-medium text-gray-700 mb-4">Planning (optionnel)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="salle_id" className="text-sm font-medium text-gray-700">
                Salle
              </label>
              <select
                id="salle_id"
                name="salle_id"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner une salle</option>
                {salles?.map((salle) => (
                  <option key={salle.id} value={salle.id}>
                    {salle.nom} {salle.batiment ? `(${salle.batiment})` : ''} - {salle.capacite} places
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="debut" className="text-sm font-medium text-gray-700">
                Heure de début
              </label>
              <input
                type="time"
                id="debut"
                name="debut"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="fin" className="text-sm font-medium text-gray-700">
                Heure de fin
              </label>
              <input
                type="time"
                id="fin"
                name="fin"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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