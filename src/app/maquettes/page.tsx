"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DataTable from "@/components/ui/table/DataTable";

export default function MaquettesPage() {
  const [maquettes, setMaquettes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departements, setDepartements] = useState([]);
  const [departementFilter, setDepartementFilter] = useState('');
  const [anneeFilter, setAnneeFilter] = useState('');
  const [anneesUniversitaires, setAnneesUniversitaires] = useState<string[]>([]);

  useEffect(() => {
    const fetchDepartements = async () => {
      try {
        const response = await fetch('/api/departements');
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des départements');
        }
        
        const data = await response.json();
        setDepartements(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDepartements();
    fetchMaquettes();
  }, []);

  const fetchMaquettes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/maquettes');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des maquettes');
      }
      
      const data = await response.json();
      
      // Extraire les années universitaires uniques
      const annees = [...new Set(data.map((m: any) => m.annee as string))].sort().reverse() as string[];
      if (annees.length > 0) {
        setAnneesUniversitaires(annees);
        setAnneeFilter(annees[0]);
      }
      
      setMaquettes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les maquettes en fonction des critères sélectionnés
  const filteredMaquettes = maquettes.filter((maquette: any) => {
    const matchDepartement = 
      departementFilter === '' || 
      maquette.departement?.id.toString() === departementFilter;
    
    const matchAnnee = 
      anneeFilter === '' || 
      maquette.annee === anneeFilter;
    
    return matchDepartement && matchAnnee;
  });

  const handleFilter = () => {
    fetchMaquettes();
  };

  const columns = [
    { key: "id", header: "ID" },
    { key: "nom", header: "Nom", 
      render: (value: string) => (
        <span className="font-medium text-blue-800">{value}</span>
      )
    },
    { key: "annee", header: "Année universitaire" },
    { 
      key: "parcours", 
      header: "Parcours",
      render: (value: any) => value?.nom || "-"
    },
    { 
      key: "departement", 
      header: "Département",
      render: (value: any) => value?.nom || "-"
    }
  ];

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
            Maquettes pédagogiques
          </h1>
          <p className="mt-2 text-gray-600">
            Gérez les maquettes pédagogiques des différents parcours
          </p>
        </div>
        <Link
          href="/maquettes/nouvelle"
          className="px-4 py-2 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-lg hover:from-blue-800 hover:to-blue-700 transition-all duration-300 shadow-sm flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nouvelle maquette
        </Link>
      </div>
      
      {/* Sélection du département et de l'année */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label htmlFor="departement" className="block text-sm font-medium text-gray-700 mb-1">
              Département
            </label>
            <select
              id="departement"
              value={departementFilter}
              onChange={(e) => setDepartementFilter(e.target.value)}
              className="w-full p-2 text-gray-900 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Tous les départements</option>
              {departements.map((dept: any) => (
                <option key={dept.id} value={dept.id}>
                  {dept.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="annee" className="block text-sm font-medium text-gray-700 mb-1">
              Année universitaire
            </label>
            <select
              id="annee"
              value={anneeFilter}
              onChange={(e) => setAnneeFilter(e.target.value)}
              className="w-full rounded-lg border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Toutes les années</option>
              {anneesUniversitaires.map((annee) => (
                <option key={annee} value={annee}>{annee}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleFilter}
              className="px-5 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-300 h-10"
            >
              Filtrer
            </button>
          </div>
        </div>
        
        <DataTable
          columns={columns}
          data={filteredMaquettes}
          keyField="id"
          actions={{
            edit: true,
            delete: true,
            view: true,
            basePath: "/maquettes"
          }}
        />
      </div>
    </div>
  );
} 