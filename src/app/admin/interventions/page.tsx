'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaCalendarAlt, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaArrowLeft, 
  FaBook,
  FaChalkboardTeacher,
  FaUserFriends,
  FaClock,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaFilter
} from 'react-icons/fa';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Intervention {
  id: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  cours_id: number;
  enseignant_id: number;
  salle_id: number;
  groupe_id?: number;
  statut: string;
  cours: {
    id: number;
    code: string;
    nom: string;
  };
  enseignant: {
    id: number;
    nom: string;
    prenom: string;
  };
  salle?: {
    id: number;
    nom: string;
    capacite: number;
  };
  groupe?: {
    id: number;
    nom: string;
  };
}

interface Cours {
  id: number;
  code: string;
  nom: string;
}

interface Enseignant {
  id: number;
  nom: string;
  prenom: string;
}

interface Salle {
  id: number;
  nom: string;
  capacite: number;
}

interface Groupe {
  id: number;
  nom: string;
}

export default function InterventionManagement() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [cours, setCours] = useState<Cours[]>([]);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedIntervention, setSelectedIntervention] = useState<Partial<Intervention> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [selectedEnseignant, setSelectedEnseignant] = useState<string>('');
  const [selectedCours, setSelectedCours] = useState<string>('');
  const [selectedStatut, setSelectedStatut] = useState<string>('');
  
  const supabase = createClientComponentClient();

  // Charger les données
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Charger les interventions
        const interventionsResponse = await fetch('/api/interventions');
        if (!interventionsResponse.ok) throw new Error('Erreur lors du chargement des interventions');
        const interventionsData = await interventionsResponse.json();
        setInterventions(interventionsData);
        
        // Charger les cours
        const coursResponse = await fetch('/api/cours');
        if (!coursResponse.ok) throw new Error('Erreur lors du chargement des cours');
        const coursData = await coursResponse.json();
        setCours(coursData);
        
        // Charger les enseignants
        const enseignantsResponse = await fetch('/api/enseignants');
        if (!enseignantsResponse.ok) throw new Error('Erreur lors du chargement des enseignants');
        const enseignantsData = await enseignantsResponse.json();
        setEnseignants(enseignantsData);
        
        // Charger les salles
        const sallesResponse = await fetch('/api/salles');
        if (!sallesResponse.ok) throw new Error('Erreur lors du chargement des salles');
        const sallesData = await sallesResponse.json();
        setSalles(sallesData);
        
        // Charger les groupes
        const groupesResponse = await fetch('/api/groupes');
        if (!groupesResponse.ok) throw new Error('Erreur lors du chargement des groupes');
        const groupesData = await groupesResponse.json();
        setGroupes(groupesData);
      } catch (err) {
        console.error('Erreur:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);

  const openEditModal = (intervention: Intervention) => {
    setSelectedIntervention({...intervention});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedIntervention(null);
    setIsModalOpen(false);
  };

  const handleNewIntervention = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    setSelectedIntervention({
      date: formattedDate,
      heure_debut: '08:00',
      heure_fin: '10:00',
      cours_id: undefined,
      enseignant_id: undefined,
      salle_id: undefined,
      groupe_id: undefined,
      statut: 'planifiée'
    });
    setIsModalOpen(true);
  };

  const deleteIntervention = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette intervention ?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/interventions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }
      
      setInterventions(interventions.filter(i => i.id !== id));
    } catch (err) {
      console.error('Erreur de suppression:', err);
      alert('Erreur lors de la suppression de l\'intervention');
    }
  };

  const handleSaveIntervention = async () => {
    if (!selectedIntervention || !selectedIntervention.date || !selectedIntervention.heure_debut || 
        !selectedIntervention.heure_fin || !selectedIntervention.cours_id || !selectedIntervention.enseignant_id ||
        !selectedIntervention.statut) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    try {
      // Déterminer si c'est une création ou une mise à jour
      const isUpdate = selectedIntervention.id !== undefined;
      const url = isUpdate ? `/api/interventions/${selectedIntervention.id}` : '/api/interventions';
      const method = isUpdate ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedIntervention),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement');
      }
      
      const savedIntervention = await response.json();
      
      if (isUpdate) {
        setInterventions(interventions.map(i => 
          i.id === savedIntervention.id ? savedIntervention : i
        ));
      } else {
        // Récupérer les données complètes pour afficher correctement
        const newResponse = await fetch('/api/interventions');
        if (newResponse.ok) {
          const newData = await newResponse.json();
          setInterventions(newData);
        }
      }
      
      closeModal();
    } catch (err) {
      console.error('Erreur d\'enregistrement:', err);
      alert('Erreur lors de l\'enregistrement de l\'intervention');
    }
  };

  // Filtrer les interventions
  const filteredInterventions = interventions.filter(i => {
    let matches = true;
    
    if (selectedEnseignant && i.enseignant_id.toString() !== selectedEnseignant) {
      matches = false;
    }
    
    if (selectedCours && i.cours_id.toString() !== selectedCours) {
      matches = false;
    }
    
    if (selectedStatut && i.statut !== selectedStatut) {
      matches = false;
    }
    
    return matches;
  });

  // Formatter la date et l'heure pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const formatTimeRange = (start: string, end: string) => {
    return `${start} - ${end}`;
  };

  const getStatusClassName = (status: string) => {
    switch (status) {
      case 'planifiée':
        return 'bg-blue-100 text-blue-800';
      case 'confirmée':
        return 'bg-green-100 text-green-800';
      case 'annulée':
        return 'bg-red-100 text-red-800';
      case 'terminée':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-600">
        <p>Erreur: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 transition-colors">
            <FaArrowLeft />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            Gestion des interventions
          </h1>
        </div>
        <button
          onClick={handleNewIntervention}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <FaPlus className="h-4 w-4" />
          <span>Nouvelle intervention</span>
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center">
            <FaFilter className="text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Filtres:</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
            <div>
              <label htmlFor="enseignant-filter" className="block text-sm font-medium text-gray-700">Enseignant</label>
              <select
                id="enseignant-filter"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedEnseignant}
                onChange={(e) => setSelectedEnseignant(e.target.value)}
              >
                <option value="">Tous les enseignants</option>
                {enseignants.map(ens => (
                  <option key={ens.id} value={ens.id}>
                    {ens.prenom} {ens.nom}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="cours-filter" className="block text-sm font-medium text-gray-700">Cours</label>
              <select
                id="cours-filter"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedCours}
                onChange={(e) => setSelectedCours(e.target.value)}
              >
                <option value="">Tous les cours</option>
                {cours.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.nom}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="statut-filter" className="block text-sm font-medium text-gray-700">Statut</label>
              <select
                id="statut-filter"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedStatut}
                onChange={(e) => setSelectedStatut(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                <option value="planifiée">Planifiée</option>
                <option value="confirmée">Confirmée</option>
                <option value="annulée">Annulée</option>
                <option value="terminée">Terminée</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={() => { setSelectedEnseignant(''); setSelectedCours(''); setSelectedStatut(''); }}
            className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Interventions Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horaire</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enseignant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInterventions.map((intervention) => (
                <tr key={intervention.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaCalendarAlt className="text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(intervention.date)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaClock className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">
                        {formatTimeRange(intervention.heure_debut, intervention.heure_fin)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaBook className="text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{intervention.cours?.code}</span>
                      <span className="ml-2 text-xs text-gray-500">{intervention.cours?.nom}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaChalkboardTeacher className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {intervention.enseignant?.prenom} {intervention.enseignant?.nom}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">
                        {intervention.salle?.nom || '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClassName(intervention.statut)}`}>
                      {intervention.statut === 'confirmée' && <FaCheckCircle className="mr-1" />}
                      {intervention.statut === 'annulée' && <FaTimesCircle className="mr-1" />}
                      {intervention.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(intervention)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteIntervention(intervention.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredInterventions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucune intervention trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Formulaire Intervention */}
      {isModalOpen && selectedIntervention && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedIntervention.id ? 'Modifier l\'intervention' : 'Ajouter une intervention'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    id="date"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={selectedIntervention.date || ''}
                    onChange={(e) => setSelectedIntervention({...selectedIntervention, date: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="statut" className="block text-sm font-medium text-gray-700">Statut</label>
                  <select
                    id="statut"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={selectedIntervention.statut || ''}
                    onChange={(e) => setSelectedIntervention({...selectedIntervention, statut: e.target.value})}
                  >
                    <option value="planifiée">Planifiée</option>
                    <option value="confirmée">Confirmée</option>
                    <option value="annulée">Annulée</option>
                    <option value="terminée">Terminée</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="heure_debut" className="block text-sm font-medium text-gray-700">Heure de début</label>
                  <input
                    type="time"
                    id="heure_debut"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={selectedIntervention.heure_debut || ''}
                    onChange={(e) => setSelectedIntervention({...selectedIntervention, heure_debut: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="heure_fin" className="block text-sm font-medium text-gray-700">Heure de fin</label>
                  <input
                    type="time"
                    id="heure_fin"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={selectedIntervention.heure_fin || ''}
                    onChange={(e) => setSelectedIntervention({...selectedIntervention, heure_fin: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="cours" className="block text-sm font-medium text-gray-700">Cours</label>
                <select
                  id="cours"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedIntervention.cours_id || ''}
                  onChange={(e) => setSelectedIntervention({...selectedIntervention, cours_id: Number(e.target.value) || undefined})}
                >
                  <option value="">Sélectionnez un cours</option>
                  {cours.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.nom}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="enseignant" className="block text-sm font-medium text-gray-700">Enseignant</label>
                <select
                  id="enseignant"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedIntervention.enseignant_id || ''}
                  onChange={(e) => setSelectedIntervention({...selectedIntervention, enseignant_id: Number(e.target.value) || undefined})}
                >
                  <option value="">Sélectionnez un enseignant</option>
                  {enseignants.map(ens => (
                    <option key={ens.id} value={ens.id}>
                      {ens.prenom} {ens.nom}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="salle" className="block text-sm font-medium text-gray-700">Salle</label>
                <select
                  id="salle"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedIntervention.salle_id || ''}
                  onChange={(e) => setSelectedIntervention({...selectedIntervention, salle_id: Number(e.target.value) || undefined})}
                >
                  <option value="">Sélectionnez une salle</option>
                  {salles.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nom} (capacité: {s.capacite})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="groupe" className="block text-sm font-medium text-gray-700">Groupe</label>
                <select
                  id="groupe"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedIntervention.groupe_id || ''}
                  onChange={(e) => setSelectedIntervention({...selectedIntervention, groupe_id: Number(e.target.value) || undefined})}
                >
                  <option value="">Sélectionnez un groupe</option>
                  {groupes.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={closeModal}
              >
                Annuler
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleSaveIntervention}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 