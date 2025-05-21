"use client";

import { useState } from "react";

export default function RapportsPage() {
  const [selectedReport, setSelectedReport] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [format, setFormat] = useState("pdf");
  const [filters, setFilters] = useState({
    departement: "",
    annee: "2023-2024",
    semestre: "",
  });

  const handleGenerateReport = async () => {
    if (!selectedReport) {
      alert("Veuillez sélectionner un type de rapport");
      return;
    }
    
    setIsGenerating(true);
    
    // Simulation de génération de rapport
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert(`Rapport ${selectedReport} généré avec succès au format ${format}`);
    } catch (error) {
      console.error("Erreur lors de la génération du rapport:", error);
      alert("Une erreur est survenue lors de la génération du rapport");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
        <p className="mt-1 text-gray-600">
          Générez des rapports et exportez des données
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-lg text-gray-900 font-semibold mb-6">Générateur de rapports</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">
                Type de rapport
              </label>
              <select
                id="reportType"
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="w-full rounded-md border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Sélectionner un type de rapport</option>
                <option value="heures_enseignant">Récapitulatif des heures par enseignant</option>
                <option value="heures_departement">Récapitulatif des heures par département</option>
                <option value="maquette_detail">Maquette pédagogique détaillée</option>
                <option value="interventions">Liste des interventions</option>
                <option value="planning">Planning des interventions</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-1">
                Format d'export
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center text-gray-900">
                  <input
                    type="radio"
                    value="pdf"
                    checked={format === "pdf"}
                    onChange={() => setFormat("pdf")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 "
                  />
                  <span className="ml-2">PDF</span>
                </label>
                <label className="inline-flex items-center text-gray-900">
                  <input
                    type="radio"
                    value="excel"
                    checked={format === "excel"}
                    onChange={() => setFormat("excel")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">Excel</span>
                </label>
                <label className="inline-flex items-center text-gray-900">
                  <input
                    type="radio"
                    value="csv"
                    checked={format === "csv"}
                    onChange={() => setFormat("csv")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">CSV</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating || !selectedReport}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
              >
                {isGenerating ? "Génération en cours..." : "Générer le rapport"}
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-700">Filtres</h3>
            <div>
              <label htmlFor="departement" className="block text-sm font-medium text-gray-700 mb-1">
                Département
              </label>
              <select
                id="departement"
                value={filters.departement}
                onChange={(e) => setFilters({...filters, departement: e.target.value})}
                className="w-full rounded-md border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Tous les départements</option>
                <option value="1">Informatique</option>
                <option value="2">Génie Civil</option>
                <option value="3">GEA</option>
                <option value="4">TC</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="annee" className="block text-sm font-medium text-gray-700 mb-1">
                Année universitaire
              </label>
              <select
                id="annee"
                value={filters.annee}
                onChange={(e) => setFilters({...filters, annee: e.target.value})}
                className="w-full rounded-md border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="2023-2024">2023-2024</option>
                <option value="2022-2023">2022-2023</option>
                <option value="2021-2022">2021-2022</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="semestre" className="block text-sm font-medium text-gray-700 mb-1">
                Semestre
              </label>
              <select
                id="semestre"
                value={filters.semestre}
                onChange={(e) => setFilters({...filters, semestre: e.target.value})}
                className="w-full rounded-md border-gray-300 p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Tous les semestres</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
                <option value="S4">S4</option>
                <option value="S5">S5</option>
                <option value="S6">S6</option>
                
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Rapports récents */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Rapports récents</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Format</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Heures Informatique 2023-2024</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Récapitulatif des heures par département</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">PDF</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">15/09/2023</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Télécharger</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Interventions S1 2023-2024</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Liste des interventions</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Excel</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">10/09/2023</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Télécharger</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Maquette BUT Info 1A</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Maquette pédagogique détaillée</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">PDF</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">05/09/2023</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Télécharger</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 