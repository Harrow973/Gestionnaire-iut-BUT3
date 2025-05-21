"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PlanningPage() {
  const [plannings, setPlannings] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [salles, setSalles] = useState([]);
  const [selectedEnseignant, setSelectedEnseignant] = useState('');
  const [selectedSalle, setSelectedSalle] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnseignants = async () => {
      try {
        const response = await fetch('/api/enseignants');
        if (response.ok) {
          const data = await response.json();
          setEnseignants(data);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des enseignants:', err);
      }
    };

    const fetchSalles = async () => {
      try {
        const response = await fetch('/api/salles');
        if (response.ok) {
          const data = await response.json();
          setSalles(data);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des salles:', err);
      }
    };

    const fetchPlannings = async () => {
      try {
        const response = await fetch('/api/planning');
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement du planning');
        }
        
        const data = await response.json();
        setPlannings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnseignants();
    fetchSalles();
    fetchPlannings();
  }, []);

  const handleFilterApply = () => {
    // Cette fonction pourrait faire un appel API avec les filtres
    // Pour l'instant, on filtre côté client
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const filteredPlannings = plannings.filter((planning: any) => {
    // Filtre par enseignant
    if (selectedEnseignant && planning.intervention?.enseignant?.id.toString() !== selectedEnseignant) {
      return false;
    }
    
    // Filtre par salle
    if (selectedSalle && planning.salle?.id.toString() !== selectedSalle) {
      return false;
    }
    
    // Filtre par date de début
    if (dateDebut && new Date(planning.date) < new Date(dateDebut)) {
      return false;
    }
    
    // Filtre par date de fin
    if (dateFin && new Date(planning.date) > new Date(dateFin)) {
      return false;
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-blue-100 rounded w-72 mx-auto"></div>
          <div className="h-64 bg-blue-50 rounded-lg w-full max-w-4xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg max-w-xl">
          <h2 className="text-red-600 font-semibold text-lg mb-2">Erreur</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-blue-600">
            Planning des enseignements
          </h1>
          <p className="mt-2 text-gray-600">
            Consultez et gérez le planning des interventions
          </p>
        </div>
        <Link
          href="/planning/nouvelle-seance"
          className="px-4 py-2 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-lg hover:from-blue-800 hover:to-blue-700 transition-all duration-300 shadow-sm flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nouvelle séance
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filtres</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date début
            </label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="w-full rounded-lg border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date fin
            </label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="w-full rounded-lg border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enseignant
            </label>
            <select
              value={selectedEnseignant}
              onChange={(e) => setSelectedEnseignant(e.target.value)}
              className="w-full rounded-lg border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Tous les enseignants</option>
              {enseignants.map((enseignant: any) => (
                <option key={enseignant.id} value={enseignant.id}>
                  {enseignant.nom} {enseignant.prenom}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salle
            </label>
            <select
              value={selectedSalle}
              onChange={(e) => setSelectedSalle(e.target.value)}
              className="w-full rounded-lg border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Toutes les salles</option>
              {salles.map((salle: any) => (
                <option key={salle.id} value={salle.id}>
                  {salle.nom} {salle.batiment ? `(${salle.batiment})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleFilterApply}
            className="px-5 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-300"
          >
            Appliquer les filtres
          </button>
        </div>
      </div>
      
      {/* Planning */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Planning</h2>
        
        {filteredPlannings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune séance planifiée correspond aux critères.</p>
            <Link 
              href="/planning/nouvelle-seance" 
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Créer une séance
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horaire</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enseignant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Groupe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salle</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlannings.map((planning: any) => (
                  <tr key={planning.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(planning.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {planning.debut?.substring(0, 5)} - {planning.fin?.substring(0, 5)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-800">
                      {planning.intervention?.enseignant ? 
                        `${planning.intervention.enseignant.nom} ${planning.intervention.enseignant.prenom}` : 
                        "-"
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {planning.intervention?.cours?.nom || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {planning.intervention?.groupe?.nom || "Tous"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-2 py-1 bg-blue-50 text-blue-800 rounded text-xs font-medium">
                        {planning.salle?.nom || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <Link href={`/planning/${planning.id}/edit`} className="text-blue-600 hover:text-blue-900">
                          Modifier
                        </Link>
                        <button className="text-red-600 hover:text-red-900">
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 