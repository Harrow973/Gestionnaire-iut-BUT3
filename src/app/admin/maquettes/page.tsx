'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaFileAlt, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaArrowLeft, 
  FaCalendarAlt,
  FaUniversity,
  FaEye
} from 'react-icons/fa';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Maquette {
  id: number;
  nom: string;
  code: string;
  annee: string;
  departement: {
    id: number;
    nom: string;
    code: string;
  };
  semestres: number;
  description?: string;
  date_creation: string;
}

interface Departement {
  id: number;
  nom: string;
  code: string;
}

export default function MaquetteManagement() {
  const [maquettes, setMaquettes] = useState<Maquette[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedMaquette, setSelectedMaquette] = useState<Partial<Maquette> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const supabase = createClientComponentClient();

  // Charger les données
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Charger les maquettes
        const maqResponse = await fetch('/api/maquettes');
        if (!maqResponse.ok) throw new Error('Erreur lors du chargement des maquettes');
        const maqData = await maqResponse.json();
        setMaquettes(maqData);
        
        // Charger les départements
        const depResponse = await fetch('/api/departements');
        if (!depResponse.ok) throw new Error('Erreur lors du chargement des départements');
        const depData = await depResponse.json();
        setDepartements(depData);
      } catch (err) {
        console.error('Erreur:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);

  const openEditModal = (maquette: Maquette) => {
    setSelectedMaquette({...maquette});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMaquette(null);
    setIsModalOpen(false);
  };

  const handleNewMaquette = () => {
    setSelectedMaquette({
      nom: '',
      code: '',
      annee: new Date().getFullYear().toString(),
      departement_id: undefined,
      semestres: 2,
      description: '',
      date_creation: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const deleteMaquette = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette maquette ?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/maquettes/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }
      
      setMaquettes(maquettes.filter(maq => maq.id !== id));
    } catch (err) {
      console.error('Erreur de suppression:', err);
      alert('Erreur lors de la suppression de la maquette');
    }
  };

  const handleSaveMaquette = async () => {
    if (!selectedMaquette || !selectedMaquette.nom || !selectedMaquette.code || !selectedMaquette.departement_id) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    try {
      // Déterminer si c'est une création ou une mise à jour
      const isUpdate = selectedMaquette.id !== undefined;
      const url = isUpdate ? `/api/maquettes/${selectedMaquette.id}` : '/api/maquettes';
      const method = isUpdate ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedMaquette),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement');
      }
      
      const savedMaquette = await response.json();
      
      if (isUpdate) {
        setMaquettes(maquettes.map(maq => 
          maq.id === savedMaquette.id ? savedMaquette : maq
        ));
      } else {
        setMaquettes([...maquettes, savedMaquette]);
      }
      
      closeModal();
    } catch (err) {
      console.error('Erreur d\'enregistrement:', err);
      alert('Erreur lors de l\'enregistrement de la maquette');
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
            Gestion des maquettes pédagogiques
          </h1>
        </div>
        <button
          onClick={handleNewMaquette}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <FaPlus className="h-4 w-4" />
          <span>Nouvelle maquette</span>
        </button>
      </div>

      {/* Maquettes Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {maquettes.map((maquette) => (
          <div key={maquette.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FaFileAlt className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{maquette.nom}</h3>
                    <p className="text-sm text-gray-500">Code: {maquette.code}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link href={`/admin/maquettes/${maquette.id}`} className="p-1.5 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors">
                    <FaEye />
                  </Link>
                  <button 
                    onClick={() => openEditModal(maquette)}
                    className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => deleteMaquette(maquette.id)}
                    className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-5 space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <FaUniversity className="text-gray-400" />
                <div>
                  <span className="text-gray-600">Département:</span> 
                  <span className="ml-1 font-medium">{maquette.departement?.code || '-'}</span>
                  <span className="ml-1 text-gray-500">({maquette.departement?.nom || '-'})</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <FaCalendarAlt className="text-gray-400" />
                <div>
                  <span className="text-gray-600">Année:</span>
                  <span className="ml-1">{maquette.annee}</span>
                </div>
              </div>
              
              <div className="mt-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Semestres: {maquette.semestres}</span>
                  <span>Créée le: {new Date(maquette.date_creation).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
              
              {maquette.description && (
                <p className="mt-3 text-sm text-gray-600 border-t border-gray-100 pt-3">
                  {maquette.description.length > 100 
                    ? `${maquette.description.substring(0, 100)}...` 
                    : maquette.description}
                </p>
              )}
            </div>
          </div>
        ))}
        
        {maquettes.length === 0 && (
          <div className="col-span-3 bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">Aucune maquette trouvée</p>
          </div>
        )}
      </div>

      {/* Modal Formulaire Maquette */}
      {isModalOpen && selectedMaquette && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedMaquette.id ? 'Modifier la maquette' : 'Créer une maquette'}
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
                    value={selectedMaquette.code || ''}
                    onChange={(e) => setSelectedMaquette({...selectedMaquette, code: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="annee" className="block text-sm font-medium text-gray-700">Année</label>
                  <input
                    type="text"
                    id="annee"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={selectedMaquette.annee || ''}
                    onChange={(e) => setSelectedMaquette({...selectedMaquette, annee: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  id="nom"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedMaquette.nom || ''}
                  onChange={(e) => setSelectedMaquette({...selectedMaquette, nom: e.target.value})}
                />
              </div>
              
              <div>
                <label htmlFor="departement" className="block text-sm font-medium text-gray-700">Département</label>
                <select
                  id="departement"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedMaquette.departement_id || ''}
                  onChange={(e) => setSelectedMaquette({...selectedMaquette, departement_id: Number(e.target.value) || undefined})}
                >
                  <option value="">Sélectionnez un département</option>
                  {departements.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.code} - {dept.nom}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="semestres" className="block text-sm font-medium text-gray-700">Nombre de semestres</label>
                <input
                  type="number"
                  id="semestres"
                  min="1"
                  max="6"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedMaquette.semestres || 2}
                  onChange={(e) => setSelectedMaquette({...selectedMaquette, semestres: Number(e.target.value)})}
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedMaquette.description || ''}
                  onChange={(e) => setSelectedMaquette({...selectedMaquette, description: e.target.value})}
                ></textarea>
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
                onClick={handleSaveMaquette}
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