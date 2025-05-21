'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaBook, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaArrowLeft, 
  FaFileAlt,
  FaClock,
  FaFilter
} from 'react-icons/fa';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Cours {
  id: number;
  code: string;
  nom: string;
  maquette_pedagogique_id: number;
  type_cours_id: number;
  maquette: {
    id: number;
    nom: string;
    code: string;
  };
  type: {
    id: number;
    nom: string;
  };
  allocations?: {
    id: number;
    heures: number;
    type: string;
  }[];
}

interface Maquette {
  id: number;
  nom: string;
  code: string;
}

interface TypeCours {
  id: number;
  nom: string;
}

export default function CoursManagement() {
  const [cours, setCours] = useState<Cours[]>([]);
  const [maquettes, setMaquettes] = useState<Maquette[]>([]);
  const [typesCours, setTypesCours] = useState<TypeCours[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedCours, setSelectedCours] = useState<Partial<Cours> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [selectedMaquette, setSelectedMaquette] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  
  const supabase = createClientComponentClient();

  // Charger les données
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Charger les cours
        const coursResponse = await fetch('/api/cours');
        if (!coursResponse.ok) throw new Error('Erreur lors du chargement des cours');
        const coursData = await coursResponse.json();
        setCours(coursData);
        
        // Charger les maquettes
        const maqResponse = await fetch('/api/maquettes');
        if (!maqResponse.ok) throw new Error('Erreur lors du chargement des maquettes');
        const maqData = await maqResponse.json();
        setMaquettes(maqData);
        
        // Charger les types de cours
        const { data: typesData, error: typesError } = await supabase
          .from('type_cours')
          .select('*')
          .order('nom');
          
        if (typesError) throw typesError;
        setTypesCours(typesData || []);
      } catch (err) {
        console.error('Erreur:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [supabase]);

  const openEditModal = (cours: Cours) => {
    setSelectedCours({...cours});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedCours(null);
    setIsModalOpen(false);
  };

  const handleNewCours = () => {
    setSelectedCours({
      code: '',
      nom: '',
      maquette_pedagogique_id: undefined,
      type_cours_id: undefined,
      allocations: [
        { heures: 0, type: 'CM' },
        { heures: 0, type: 'TD' },
        { heures: 0, type: 'TP' }
      ]
    });
    setIsModalOpen(true);
  };

  const deleteCours = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/cours/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }
      
      setCours(cours.filter(c => c.id !== id));
    } catch (err) {
      console.error('Erreur de suppression:', err);
      alert('Erreur lors de la suppression du cours');
    }
  };

  const handleSaveCours = async () => {
    if (!selectedCours || !selectedCours.code || !selectedCours.nom || !selectedCours.maquette_pedagogique_id || !selectedCours.type_cours_id) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    try {
      // Préparer l'objet à envoyer
      const coursToSave = {
        cours: {
          code: selectedCours.code,
          nom: selectedCours.nom,
          maquette_pedagogique_id: selectedCours.maquette_pedagogique_id,
          type_cours_id: selectedCours.type_cours_id
        },
        allocations: selectedCours.allocations?.filter(alloc => alloc.heures > 0)
      };
      
      // Déterminer si c'est une création ou une mise à jour
      const isUpdate = selectedCours.id !== undefined;
      const url = isUpdate ? `/api/cours/${selectedCours.id}` : '/api/cours';
      const method = isUpdate ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(isUpdate ? selectedCours : coursToSave),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement');
      }
      
      const savedCours = await response.json();
      
      if (isUpdate) {
        setCours(cours.map(c => 
          c.id === savedCours.id ? { ...savedCours, maquette: c.maquette, type: c.type } : c
        ));
      } else {
        // Récupérer les données complètes pour afficher correctement
        const newCoursResponse = await fetch('/api/cours');
        if (newCoursResponse.ok) {
          const newCoursData = await newCoursResponse.json();
          setCours(newCoursData);
        }
      }
      
      closeModal();
    } catch (err) {
      console.error('Erreur d\'enregistrement:', err);
      alert('Erreur lors de l\'enregistrement du cours');
    }
  };

  const updateAllocation = (index: number, heures: number) => {
    if (!selectedCours || !selectedCours.allocations) return;
    
    const newAllocations = [...selectedCours.allocations];
    newAllocations[index] = { ...newAllocations[index], heures };
    
    setSelectedCours({
      ...selectedCours,
      allocations: newAllocations
    });
  };

  const filteredCours = cours.filter(c => {
    let matches = true;
    
    if (selectedMaquette && c.maquette_pedagogique_id.toString() !== selectedMaquette) {
      matches = false;
    }
    
    if (selectedType && c.type_cours_id.toString() !== selectedType) {
      matches = false;
    }
    
    return matches;
  });

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
            Gestion des cours
          </h1>
        </div>
        <button
          onClick={handleNewCours}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <FaPlus className="h-4 w-4" />
          <span>Nouveau cours</span>
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center">
            <FaFilter className="text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Filtres:</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
            <div>
              <label htmlFor="maquette-filter" className="block text-sm font-medium text-gray-700">Maquette</label>
              <select
                id="maquette-filter"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedMaquette}
                onChange={(e) => setSelectedMaquette(e.target.value)}
              >
                <option value="">Toutes les maquettes</option>
                {maquettes.map(maq => (
                  <option key={maq.id} value={maq.id}>
                    {maq.code} - {maq.nom}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700">Type de cours</label>
              <select
                id="type-filter"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">Tous les types</option>
                {typesCours.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            onClick={() => { setSelectedMaquette(''); setSelectedType(''); }}
            className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Cours Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Maquette</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocations</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCours.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {c.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
                        <FaBook className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {c.nom}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaFileAlt className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{c.maquette?.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {c.type?.nom}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <FaClock className="text-gray-400" />
                      <div className="text-sm text-gray-500">
                        {c.allocations && c.allocations.length > 0 ? (
                          c.allocations.map((a, idx) => (
                            <span key={idx} className="mr-2">
                              {a.type}: {a.heures}h
                            </span>
                          ))
                        ) : (
                          "Aucune allocation"
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(c)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteCours(c.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCours.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucun cours trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Formulaire Cours */}
      {isModalOpen && selectedCours && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedCours.id ? 'Modifier le cours' : 'Ajouter un cours'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700">Code</label>
                  <input
                    type="text"
                    id="code"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={selectedCours.code || ''}
                    onChange={(e) => setSelectedCours({...selectedCours, code: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type de cours</label>
                  <select
                    id="type"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={selectedCours.type_cours_id || ''}
                    onChange={(e) => setSelectedCours({...selectedCours, type_cours_id: Number(e.target.value) || undefined})}
                  >
                    <option value="">Sélectionnez un type</option>
                    {typesCours.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  id="nom"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedCours.nom || ''}
                  onChange={(e) => setSelectedCours({...selectedCours, nom: e.target.value})}
                />
              </div>
              
              <div>
                <label htmlFor="maquette" className="block text-sm font-medium text-gray-700">Maquette</label>
                <select
                  id="maquette"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedCours.maquette_pedagogique_id || ''}
                  onChange={(e) => setSelectedCours({...selectedCours, maquette_pedagogique_id: Number(e.target.value) || undefined})}
                >
                  <option value="">Sélectionnez une maquette</option>
                  {maquettes.map(maq => (
                    <option key={maq.id} value={maq.id}>
                      {maq.code} - {maq.nom}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Allocations horaires</label>
                <div className="bg-gray-50 p-4 rounded-md space-y-3">
                  {selectedCours.allocations && selectedCours.allocations.map((alloc, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <span className="w-12 font-medium text-gray-700">{alloc.type}</span>
                      <input
                        type="number"
                        min="0"
                        className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={alloc.heures}
                        onChange={(e) => updateAllocation(idx, Number(e.target.value))}
                      />
                      <span className="text-sm text-gray-500">heures</span>
                    </div>
                  ))}
                </div>
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
                onClick={handleSaveCours}
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