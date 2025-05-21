"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DataTable from "@/components/ui/table/DataTable";

export default function InterventionsPage() {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enseignants, setEnseignants] = useState([]);
  const [cours, setCours] = useState([]);
  const [filtreEnseignant, setFiltreEnseignant] = useState('');
  const [filtreCours, setFiltreCours] = useState('');
  const [filtreAnnee, setFiltreAnnee] = useState('');
  const [annees, setAnnees] = useState<string[]>([]);

  useEffect(() => {
    const fetchEnseignants = async () => {
      try {
        const response = await fetch('/api/enseignants');
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des enseignants');
        }
        
        const data = await response.json();
        setEnseignants(data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchCours = async () => {
      try {
        const response = await fetch('/api/cours');
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des cours');
        }
        
        const data = await response.json();
        setCours(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchEnseignants();
    fetchCours();
    fetchInterventions();
  }, []);

  const fetchInterventions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/interventions');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des interventions');
      }
      
      const data = await response.json();
      
      // Extraire les années uniques des interventions
      const uniqueAnnees = [...new Set(data.map((intervention: any) => intervention.annee as string))].sort().reverse() as string[];
      setAnnees(uniqueAnnees);
      
      if (uniqueAnnees.length > 0 && !filtreAnnee) {
        setFiltreAnnee(uniqueAnnees[0]);
      }
      
      setInterventions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les interventions en fonction des critères sélectionnés
  const filteredInterventions = interventions.filter((intervention: any) => {
    const matchEnseignant = 
      filtreEnseignant === '' || 
      intervention.enseignant?.id.toString() === filtreEnseignant;
    
    const matchCours = 
      filtreCours === '' || 
      intervention.cours?.id.toString() === filtreCours;
    
    const matchAnnee = 
      filtreAnnee === '' || 
      intervention.annee === filtreAnnee;
    
    return matchEnseignant && matchCours && matchAnnee;
  });

  const columns = [
    { key: "id", header: "ID" },
    { 
      key: "date", 
      header: "Date",
      render: (value: string) => value ? new Date(value).toLocaleDateString() : "-"
    },
    { 
      key: "enseignant", 
      header: "Enseignant",
      render: (value: any) => value ? `${value.prenom} ${value.nom}` : "-"
    },
    { 
      key: "cours", 
      header: "Cours",
      render: (value: any) => value?.nom || "-"
    },
    { 
      key: "groupe", 
      header: "Groupe",
      render: (value: any) => value?.nom || "-"
    },
    { 
      key: "heures", 
      header: "Heures",
      render: (value: number) => `${value}h`
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-blue-100 rounded w-96 mx-auto"></div>
          <div className="h-72 bg-blue-50 rounded-lg w-full max-w-5xl"></div>
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
            Interventions
          </h1>
          <p className="mt-2 text-gray-600">
            Gestion des interventions et services d'enseignement
          </p>
        </div>
        <Link
          href="/interventions/nouvelle"
          className="px-4 py-2 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-lg hover:from-blue-800 hover:to-blue-700 transition-all duration-300 shadow-sm flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nouvelle intervention
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label htmlFor="enseignant" className="block text-sm font-medium text-gray-700 mb-1">
              Enseignant
            </label>
            <select
              id="enseignant"
              value={filtreEnseignant}
              onChange={(e) => setFiltreEnseignant(e.target.value)}
              className="w-full p-2 text-gray-900 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Tous les enseignants</option>
              {enseignants.map((enseignant: any) => (
                <option key={enseignant.id} value={enseignant.id}>
                  {enseignant.prenom} {enseignant.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="cours" className="block text-sm font-medium text-gray-700 mb-1">
              Cours
            </label>
            <select
              id="cours"
              value={filtreCours}
              onChange={(e) => setFiltreCours(e.target.value)}
              className="w-full p-2 text-gray-900 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Tous les cours</option>
              {cours.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="annee" className="block text-sm font-medium text-gray-700 mb-1">
              Année
            </label>
            <select
              id="annee"
              value={filtreAnnee}
              onChange={(e) => setFiltreAnnee(e.target.value)}
              className="w-full p-2 text-gray-900 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Toutes les années</option>
              {annees.map((annee) => (
                <option key={annee} value={annee}>{annee}</option>
              ))}
            </select>
          </div>
        </div>
        
        <DataTable
          columns={columns}
          data={filteredInterventions}
          keyField="id"
          actions={{
            edit: true,
            delete: true,
            view: true,
            basePath: "/interventions"
          }}
        />
      </div>
    </div>
  );
}