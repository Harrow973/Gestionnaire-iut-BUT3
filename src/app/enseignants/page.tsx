"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DataTable from "@/components/ui/table/DataTable";

export default function EnseignantsPage() {
  const [enseignants, setEnseignants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departementFilter, setDepartementFilter] = useState('');
  const [departements, setDepartements] = useState([]);

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
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

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

    fetchEnseignants();
    fetchDepartements();
  }, []);

  // Filtrer les enseignants en fonction des critères de recherche et du filtre de département
  const filteredEnseignants = enseignants.filter((enseignant: any) => {
    const matchSearchTerm = 
      searchTerm === '' || 
      enseignant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enseignant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enseignant.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchDepartement = 
      departementFilter === '' || 
      (enseignant.departement && enseignant.departement.id.toString() === departementFilter);
    
    return matchSearchTerm && matchDepartement;
  });

  const columns = [
    { key: "id", header: "ID" },
    { 
      key: "nom", 
      header: "Nom",
      render: (value: string, row: any) => (
        <span className="font-medium">{value.toUpperCase()} {row.prenom}</span>
      )
    },
    { key: "email", header: "Email" },
    { 
      key: "departement", 
      header: "Département",
      render: (value: any) => value?.nom || "-"
    },
    { 
      key: "statuts", 
      header: "Statut",
      render: (value: any[]) => {
        const statut = value?.find((s: any) => s.date_fin === null);
        
        if (!statut) return <span className="text-gray-500">-</span>;
        
        const statutNom = statut.statut.nom;
        const color = 
          statutNom === "Titulaire" ? "bg-green-100 text-green-800" :
          statutNom === "Vacataire" ? "bg-blue-100 text-blue-800" :
          "bg-yellow-100 text-yellow-800";
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${color}`}>
            {statutNom}
          </span>
        );
      }
    },
  ];

  if (loading) {
    return <div className="text-center py-8">Chargement des enseignants...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enseignants</h1>
          <p className="mt-1 text-gray-600">
            Gérez les enseignants et leur affectation
          </p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-between mb-4">
          <h2 className="text-gray-900 font-semibold">Liste des enseignants</h2>
          
          {/* Filtres et recherche */}
          <div className="flex space-x-2 text-gray-900">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <select 
              value={departementFilter}
              onChange={(e) => setDepartementFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les départements</option>
              {departements.map((dept: any) => (
                <option key={dept.id} value={dept.id}>
                  {dept.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <DataTable
          columns={columns}
          data={filteredEnseignants}
          keyField="id"
          actions={{
            edit: true,
            delete: true,
            view: true,
            basePath: "/enseignants"
          }}
        />
      </div>
    </div>
  );
} 