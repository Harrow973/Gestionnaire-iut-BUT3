"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DataTable from "@/components/ui/table/DataTable";

export default function CoursPage() {
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [types, setTypes] = useState([]);
  const [maquetteFilter, setMaquetteFilter] = useState('');
  const [maquettes, setMaquettes] = useState([]);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await fetch('/api/types-cours');
        if (response.ok) {
          const data = await response.json();
          setTypes(data);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des types de cours:", err);
      }
    };

    const fetchMaquettes = async () => {
      try {
        const response = await fetch('/api/maquettes');
        if (response.ok) {
          const data = await response.json();
          setMaquettes(data);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des maquettes:", err);
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
        console.log("Cours reçus :", data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTypes();
    fetchMaquettes();
    fetchCours();
  }, []);

  // Filtrer les cours en fonction des critères sélectionnés
  const filteredCours = cours.filter((c: any) => {
    const matchType = typeFilter === '' || c.type?.id?.toString() === typeFilter;
    const matchMaquette = maquetteFilter === '' || c.maquette?.id?.toString() === maquetteFilter;
    return matchType && matchMaquette;
  });

  // Vérification défensive : tous les objets ont-ils un champ 'id' ?
  const allHaveId = filteredCours.every((c: any) => c && c.id !== undefined && c.id !== null);

  if (!allHaveId && filteredCours.length > 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg max-w-xl">
          <h2 className="text-red-600 font-semibold text-lg mb-2">Erreur de données</h2>
          <p className="text-red-700">Certains objets cours n'ont pas de champ <code>id</code>. Vérifiez la structure des données reçues depuis l'API.</p>
        </div>
      </div>
    );
  }

  const columns = [
    { 
      key: "code", 
      header: "Code", 
      render: (value: string) => (
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium">{value}</span>
      )
    },
    { 
      key: "nom", 
      header: "Nom", 
      render: (value: string) => (
        <span className="font-medium text-blue-800">{value}</span>
      )
    },
    { 
      key: "maquette", 
      header: "Maquette",
      render: (value: any) => value?.nom || "-"
    },
    { 
      key: "type", 
      header: "Type de cours",
      render: (value: any) => value?.nom || "-"
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-blue-100 rounded w-64 mx-auto"></div>
          <div className="h-60 bg-blue-50 rounded-lg w-full max-w-3xl"></div>
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
            Cours
          </h1>
          <p className="mt-2 text-gray-600">
            Gestion des cours et modules d'enseignement
          </p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Type de cours
            </label>
            <select
              id="type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full p-2 text-gray-900 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Tous les types</option>
              {types.map((type: any) => (
                <option key={type.id} value={type.id}>
                  {type.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="maquette" className="block text-sm font-medium text-gray-700 mb-1">
              Maquette
            </label>
            <select
              id="maquette"
              value={maquetteFilter}
              onChange={(e) => setMaquetteFilter(e.target.value)}
              className="w-full p-2 text-gray-900 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Toutes les maquettes</option>
              {maquettes.map((maquette: any) => (
                <option key={maquette.id} value={maquette.id}>
                  {maquette.nom} ({maquette.annee})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <DataTable
          columns={columns}
          data={filteredCours}
          keyField="id"
          actions={{
            edit: true,
            delete: true,
            view: true,
            basePath: "/cours"
          }}
        />
      </div>
    </div>
  );
} 