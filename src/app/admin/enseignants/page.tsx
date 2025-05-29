"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaChalkboardTeacher,
  FaPlus,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaEnvelope,
  FaUniversity,
  FaUserTag,
} from "react-icons/fa";

interface Enseignant {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  departement_id?: number;
  statut_id?: number;
  departement?: {
    id: number;
    nom: string;
    code: string;
  };
  statut?: {
    id: number;
    nom: string;
    heures_min: number;
    heures_max: number;
  };
}

interface Departement {
  id: number;
  nom: string;
  code: string;
}

interface Statut {
  id: number;
  nom: string;
  heures_min: number;
  heures_max: number;
}

export default function EnseignantManagement() {
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [statuts, setStatuts] = useState<Statut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedEnseignant, setSelectedEnseignant] = useState<Partial<Enseignant> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Charger les données
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Charger les enseignants
        const ensResponse = await fetch("/api/enseignants");
        if (!ensResponse.ok) throw new Error("Erreur lors du chargement des enseignants");
        const ensData = await ensResponse.json();
        setEnseignants(ensData);

        // Charger les départements
        const depResponse = await fetch("/api/departements");
        if (!depResponse.ok) throw new Error("Erreur lors du chargement des départements");
        const depData = await depResponse.json();
        setDepartements(depData);

        // Charger les statuts des enseignants
        const statutsResponse = await fetch("/api/statuts");
        if (!statutsResponse.ok) throw new Error("Erreur lors du chargement des statuts");
        const statutsData = await statutsResponse.json();
        setStatuts(statutsData);
      } catch (err) {
        console.error("Erreur:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const openEditModal = (enseignant: Enseignant) => {
    setSelectedEnseignant({ ...enseignant });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEnseignant(null);
    setIsModalOpen(false);
  };

  const handleNewEnseignant = () => {
    setSelectedEnseignant({
      nom: "",
      prenom: "",
      email: "",
      departement_id: undefined,
      statut_id: undefined,
    });
    setIsModalOpen(true);
  };

  const deleteEnseignant = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet enseignant ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/enseignants/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      setEnseignants(enseignants.filter((ens) => ens.id !== id));
    } catch (err) {
      console.error("Erreur de suppression:", err);
      alert("Erreur lors de la suppression de l'enseignant");
    }
  };

  const handleSaveEnseignant = async () => {
    if (
      !selectedEnseignant ||
      !selectedEnseignant.nom ||
      !selectedEnseignant.prenom ||
      !selectedEnseignant.email ||
      !selectedEnseignant.departement_id
    ) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      // Déterminer si c'est une création ou une mise à jour
      const isUpdate = selectedEnseignant.id !== undefined;
      const url = isUpdate ? `/api/enseignants/${selectedEnseignant.id}` : "/api/enseignants";
      const method = isUpdate ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedEnseignant),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement");
      }

      const savedEnseignant = await response.json();

      if (isUpdate) {
        setEnseignants(enseignants.map((ens) => (ens.id === savedEnseignant.id ? savedEnseignant : ens)));
      } else {
        setEnseignants([...enseignants, savedEnseignant]);
      }

      closeModal();
    } catch (err) {
      console.error("Erreur d'enregistrement:", err);
      alert("Erreur lors de l'enregistrement de l'enseignant");
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
          <h1 className="text-2xl font-bold text-gray-800">Gestion des enseignants</h1>
        </div>
        <button
          onClick={handleNewEnseignant}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <FaPlus className="h-4 w-4" />
          <span>Nouvel enseignant</span>
        </button>
      </div>

      {/* Enseignants Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Département
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {enseignants.map((enseignant) => (
                <tr key={enseignant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
                        <FaChalkboardTeacher className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {enseignant.prenom} {enseignant.nom}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaEnvelope className="mr-2 text-gray-400" />
                      {enseignant.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaUniversity className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{enseignant.departement?.code || "-"}</span>
                      <span className="ml-2 text-xs text-gray-500">({enseignant.departement?.nom || "-"})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {enseignant.statut ? (
                      <div className="flex items-center">
                        <FaUserTag className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{enseignant.statut.nom}</span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({enseignant.statut.heures_min}-{enseignant.statut.heures_max}h)
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Non défini</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(enseignant)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <FaEdit />
                    </button>
                    <button onClick={() => deleteEnseignant(enseignant.id)} className="text-red-600 hover:text-red-900">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {enseignants.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucun enseignant trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Formulaire Enseignant */}
      {isModalOpen && selectedEnseignant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedEnseignant.id ? "Modifier l'enseignant" : "Ajouter un enseignant"}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="nom"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={selectedEnseignant.nom || ""}
                    onChange={(e) => setSelectedEnseignant({ ...selectedEnseignant, nom: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">
                    Prénom
                  </label>
                  <input
                    type="text"
                    id="prenom"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={selectedEnseignant.prenom || ""}
                    onChange={(e) => setSelectedEnseignant({ ...selectedEnseignant, prenom: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedEnseignant.email || ""}
                  onChange={(e) => setSelectedEnseignant({ ...selectedEnseignant, email: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="departement" className="block text-sm font-medium text-gray-700">
                  Département
                </label>
                <select
                  id="departement"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedEnseignant.departement_id || ""}
                  onChange={(e) =>
                    setSelectedEnseignant({
                      ...selectedEnseignant,
                      departement_id: Number(e.target.value) || undefined,
                    })
                  }
                >
                  <option value="">Sélectionnez un département</option>
                  {departements.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.code} - {dept.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="statut" className="block text-sm font-medium text-gray-700">
                  Statut
                </label>
                <select
                  id="statut"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedEnseignant.statut_id || ""}
                  onChange={(e) =>
                    setSelectedEnseignant({ ...selectedEnseignant, statut_id: Number(e.target.value) || undefined })
                  }
                >
                  <option value="">Sélectionnez un statut</option>
                  {statuts.map((statut) => (
                    <option key={statut.id} value={statut.id}>
                      {statut.nom} ({statut.heures_min}-{statut.heures_max}h)
                    </option>
                  ))}
                </select>
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
                onClick={handleSaveEnseignant}
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
