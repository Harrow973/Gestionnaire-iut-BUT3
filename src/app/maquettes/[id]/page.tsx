"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import DataTable from "@/components/ui/table/DataTable";

export default function MaquetteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const maquetteId = params.id;
  const [isLoading, setIsLoading] = useState(true);

  // Ces données seraient normalement chargées depuis une API
  const [maquette, setMaquette] = useState<any>(null);
  const [cours, setCours] = useState<any[]>([]);

  useEffect(() => {
    // Simulation d'un appel API
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Données simulées
      setMaquette({
        id: maquetteId,
        nom: `BUT Informatique ${maquetteId === "1" ? "1ère" : maquetteId === "2" ? "2ème" : "3ème"} année`,
        annee_universitaire: "2023-2024",
        parcours: "Informatique",
        date_creation: "2023-07-15",
        description: "Maquette pédagogique du BUT Informatique",
      });
      
      setCours([
        {
          id: 1,
          code: "R1.01",
          intitule: "Introduction aux systèmes informatiques",
          cm: 12,
          td: 20,
          tp: 16,
          ci: 0,
          projet: 0,
          total: 48,
        },
        {
          id: 2,
          code: "R1.02",
          intitule: "Introduction à l'algorithmique",
          cm: 16,
          td: 24,
          tp: 20,
          ci: 0,
          projet: 0,
          total: 60,
        },
        {
          id: 3,
          code: "R1.03",
          intitule: "Introduction aux bases de données",
          cm: 10,
          td: 16,
          tp: 24,
          ci: 0,
          projet: 0,
          total: 50,
        },
        {
          id: 4,
          code: "R1.04",
          intitule: "Introduction à la programmation web",
          cm: 8,
          td: 12,
          tp: 28,
          ci: 0,
          projet: 0,
          total: 48,
        },
        {
          id: 5,
          code: "R1.05",
          intitule: "Mathématiques discrètes",
          cm: 20,
          td: 24,
          tp: 0,
          ci: 0,
          projet: 0,
          total: 44,
        },
      ]);
      
      setIsLoading(false);
    };
    
    fetchData();
  }, [maquetteId]);

  const coursColumns = [
    { key: "code", header: "Code" },
    { key: "intitule", header: "Intitulé" },
    { key: "cm", header: "CM" },
    { key: "td", header: "TD" },
    { key: "tp", header: "TP" },
    { key: "ci", header: "CI" },
    { key: "projet", header: "Projet" },
    { key: "total", header: "Total" },
  ];

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-32 bg-gray-100 rounded mb-6"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-gray-100 rounded"></div>
      </div>
    );
  }

  if (!maquette) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Maquette non trouvée</h1>
        <p className="text-gray-600 mb-6">
          La maquette pédagogique demandée n'existe pas ou a été supprimée.
        </p>
        <Link
          href="/maquettes"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retour à la liste des maquettes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{maquette.nom}</h1>
          <p className="mt-1 text-gray-600">
            Année universitaire: {maquette.annee_universitaire}
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/maquettes/${maquetteId}/edit`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Modifier
          </Link>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
      
      {/* Détails de la maquette */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-lg text-gray-900 font-semibold mb-4">Informations générales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Parcours</p>
            <p className="font-medium text-gray-900">{maquette.parcours}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Année universitaire</p>
            <p className="font-medium text-gray-900">{maquette.annee_universitaire}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date de création</p>
            <p className="font-medium text-gray-900">{maquette.date_creation}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Description</p>
            <p className="font-medium text-gray-900">{maquette.description}</p>
          </div>
        </div>
      </div>
      
      {/* Liste des cours */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg text-gray-900 font-semibold">Liste des cours</h2>
        </div>
        
        <DataTable
          columns={coursColumns}
          data={cours}
          keyField="id"
          actions={{
            edit: true,
            delete: true,
            view: false,
            basePath: `/maquettes/${maquetteId}/cours`
          }}
        />
        
        {/* Résumé des heures */}
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-md font-semibold mb-3">Résumé de la répartition des heures</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {["CM", "TD", "TP", "CI", "Projet"].map((type) => {
              const key = type.toLowerCase();
              const total = cours.reduce((sum, course) => sum + (course[key] || 0), 0);
              
              return (
                <div key={type} className="bg-white p-3 rounded shadow-sm">
                  <p className="text-sm text-gray-600">{type}</p>
                  <p className="text-xl font-bold">{total} h</p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 bg-blue-50 p-3 rounded shadow-sm">
            <p className="text-sm text-blue-600">Volume horaire total</p>
            <p className="text-2xl font-bold text-blue-800">
              {cours.reduce((sum, course) => sum + course.total, 0)} h
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 