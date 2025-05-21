"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DataTable from "@/components/ui/table/DataTable";

export default function DepartementsPage() {
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartements();
  }, []);

  const columns = [
    { key: "id", header: "ID" },
    { key: "nom", header: "Nom", 
      render: (value: string) => (
        <span className="font-medium text-blue-800">{value}</span>
      )
    },
    { key: "code", header: "Code", 
      render: (value: string) => (
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium">{value}</span>
      )
    },
    { 
      key: "description", 
      header: "Description",
      render: (value: string) => (
        <span className="truncate block max-w-xs text-gray-600">{value || "-"}</span>
      )
    },
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
            Départements
          </h1>
          <p className="mt-2 text-gray-600">
            Gérez les départements de l'IUT
          </p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <DataTable
          columns={columns}
          data={departements}
          keyField="id"
        />
      </div>
    </div>
  );
} 