"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaSchool,
  FaPlus,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaUniversity,
  FaUsers,
  FaBuilding,
  FaMapMarkedAlt,
  FaSpinner,
  FaSync,
} from "react-icons/fa";

interface Department {
  id: number;
  nom: string;
  code: string;
  responsable?: string;
  nb_enseignants?: number;
  nb_etudiants?: number;
  localisation?: string;
  description?: string;
}

interface Enseignant {
  id: number;
  nom: string;
  prenom: string;
  email?: string;
  departement_id: number;
}

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Charger les départements depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Récupérer les départements
        const deptResponse = await fetch("/api/departements");
        if (!deptResponse.ok) {
          throw new Error("Erreur lors de la récupération des départements");
        }
        const deptData = await deptResponse.json();

        // Récupérer les enseignants
        const ensResponse = await fetch("/api/enseignants");
        if (!ensResponse.ok) {
          throw new Error("Erreur lors de la récupération des enseignants");
        }
        const ensData = await ensResponse.json();

        // Stocker les enseignants
        setEnseignants(ensData);

        // Calculer le nombre d'enseignants par département
        const deptWithStats = deptData.map((dept: Department) => {
          const enseignantCount = ensData.filter((ens: Enseignant) => ens.departement_id === dept.id).length;
          return {
            ...dept,
            nb_enseignants: enseignantCount,
          };
        });

        setDepartments(deptWithStats);
      } catch (err) {
        console.error("Erreur de chargement des données:", err);
        setError("Impossible de charger les données. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fonction pour actualiser les statistiques
  const refreshStats = async () => {
    try {
      setLoadingStats(true);

      // Récupérer les statistiques du dashboard
      const statsResponse = await fetch("/api/dashboard/stats");
      if (!statsResponse.ok) {
        throw new Error("Erreur lors de la récupération des statistiques");
      }
      const statsData = await statsResponse.json();

      // Trouver les stats des enseignants
      const enseignantsStat = statsData.find((stat: any) => stat.label === "Enseignants");
      const totalEnseignants = enseignantsStat ? enseignantsStat.count : 0;

      // Mettre à jour les départements avec les statistiques globales
      // Ici on distribue les enseignants en fonction du ratio actuel dans chaque département
      if (totalEnseignants > 0) {
        const enseignantsParDept = departments.map((dept) => {
          const count = enseignants.filter((ens) => ens.departement_id === dept.id).length;
          return {
            ...dept,
            nb_enseignants: count,
            // Attribution de nombre d'étudiants fictif en fonction du nombre d'enseignants
            // (en pratique, cette donnée viendrait d'une vraie API)
            nb_etudiants: Math.round(count * 15), // Ratio moyen de 15 étudiants par enseignant
          };
        });

        setDepartments(enseignantsParDept);
      }
    } catch (err) {
      console.error("Erreur lors de l'actualisation des statistiques:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const openEditModal = (department: Department) => {
    setSelectedDepartment({ ...department });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedDepartment(null);
    setIsModalOpen(false);
  };

  const handleNewDepartment = () => {
    const newDepartment: Department = {
      id: 0, // Sera remplacé par la base de données
      nom: "",
      code: "",
      responsable: "",
      nb_enseignants: 0,
      nb_etudiants: 0,
      localisation: "",
      description: "",
    };

    setSelectedDepartment(newDepartment);
    setIsModalOpen(true);
  };

  const deleteDepartment = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce département ?")) {
      try {
        const response = await fetch(`/api/departements/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression du département");
        }

        // Mettre à jour l'état local après suppression
        setDepartments(departments.filter((dept) => dept.id !== id));
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
        alert("Une erreur est survenue lors de la suppression du département.");
      }
    }
  };

  const handleSaveDepartment = async () => {
    if (!selectedDepartment) return;

    try {
      let response;

      // Déterminer si c'est une création ou une mise à jour
      if (selectedDepartment.id === 0) {
        // Création d'un nouveau département
        response = await fetch("/api/departements", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nom: selectedDepartment.nom,
            code: selectedDepartment.code,
            responsable: selectedDepartment.responsable,
            nb_enseignants: selectedDepartment.nb_enseignants,
            nb_etudiants: selectedDepartment.nb_etudiants,
            localisation: selectedDepartment.localisation,
            description: selectedDepartment.description,
          }),
        });
      } else {
        // Mise à jour d'un département existant
        response = await fetch(`/api/departements/${selectedDepartment.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nom: selectedDepartment.nom,
            code: selectedDepartment.code,
            responsable: selectedDepartment.responsable,
            nb_enseignants: selectedDepartment.nb_enseignants,
            nb_etudiants: selectedDepartment.nb_etudiants,
            localisation: selectedDepartment.localisation,
            description: selectedDepartment.description,
          }),
        });
      }

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement du département");
      }

      const savedDepartment = await response.json();

      // Mettre à jour l'état local
      if (selectedDepartment.id === 0) {
        setDepartments([...departments, savedDepartment]);
      } else {
        setDepartments(departments.map((dept) => (dept.id === savedDepartment.id ? savedDepartment : dept)));
      }

      closeModal();
    } catch (err) {
      console.error("Erreur lors de l'enregistrement:", err);
      alert("Une erreur est survenue lors de l'enregistrement du département.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-blue-600 text-3xl" />
        <span className="ml-2 text-lg">Chargement des départements...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
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
          <h1 className="text-2xl font-bold text-gray-800">Gestion des départements</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshStats}
            className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            disabled={loadingStats}
          >
            {loadingStats ? <FaSpinner className="h-4 w-4 animate-spin" /> : <FaSync className="h-4 w-4" />}
            <span>Actualiser les statistiques</span>
          </button>
          <button
            onClick={handleNewDepartment}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <FaPlus className="h-4 w-4" />
            <span>Nouveau département</span>
          </button>
        </div>
      </div>

      {departments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-500">Aucun département n'a été trouvé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FaUniversity className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{dept.nom}</h3>
                      <p className="text-sm text-gray-500">Code: {dept.code}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(dept)}
                      className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteDepartment(dept.id)}
                      className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-3">
                {dept.responsable && (
                  <div className="flex items-center space-x-2 text-sm">
                    <FaUsers className="text-gray-400" />
                    <div>
                      <span className="text-gray-600">Responsable:</span>
                      <span className="ml-1 font-medium">{dept.responsable}</span>
                    </div>
                  </div>
                )}

                <div className="grid gap-3">
                  <div className="bg-gray-50 rounded-md p-3 flex flex-col items-center">
                    <span className="text-sm text-gray-500">Enseignants</span>
                    <span className="text-lg font-bold text-blue-600">{dept.nb_enseignants || 0}</span>
                  </div>
                </div>

                {dept.localisation && (
                  <div className="flex items-center space-x-2 text-sm">
                    <FaBuilding className="text-gray-400" />
                    <div>
                      <span className="text-gray-600">Localisation:</span>
                      <span className="ml-1">{dept.localisation}</span>
                    </div>
                  </div>
                )}

                {dept.description && (
                  <div className="text-sm text-gray-600 mt-2 border-t border-gray-100 pt-2">{dept.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Map view toggle */}
      <div className="bg-white rounded-lg shadow-sm p-4 mt-6 border border-gray-100">
        <div className="flex items-center space-x-2 text-blue-600 cursor-pointer hover:text-blue-800 transition-colors">
          <FaMapMarkedAlt />
          <span className="font-medium">Voir la carte des départements</span>
        </div>
      </div>

      {/* Edit/Add Department Modal */}
      {isModalOpen && selectedDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedDepartment.id ? "Modifier le département" : "Ajouter un département"}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                  Nom du département
                </label>
                <input
                  type="text"
                  id="nom"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedDepartment.nom}
                  onChange={(e) => setSelectedDepartment({ ...selectedDepartment, nom: e.target.value })}
                  required
                />
              </div>

              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Code
                </label>
                <input
                  type="text"
                  id="code"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedDepartment.code}
                  onChange={(e) => setSelectedDepartment({ ...selectedDepartment, code: e.target.value })}
                  required
                />
              </div>

              <div>
                <label htmlFor="responsable" className="block text-sm font-medium text-gray-700">
                  Responsable
                </label>
                <input
                  type="text"
                  id="responsable"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedDepartment.responsable || ""}
                  onChange={(e) => setSelectedDepartment({ ...selectedDepartment, responsable: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nb_enseignants" className="block text-sm font-medium text-gray-700">
                    Nombre d'enseignants
                  </label>
                  <input
                    type="number"
                    id="nb_enseignants"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={selectedDepartment.nb_enseignants || 0}
                    onChange={(e) =>
                      setSelectedDepartment({ ...selectedDepartment, nb_enseignants: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>

                <div>
                  <label htmlFor="nb_etudiants" className="block text-sm font-medium text-gray-700">
                    Nombre d'étudiants
                  </label>
                  <input
                    type="number"
                    id="nb_etudiants"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={selectedDepartment.nb_etudiants || 0}
                    onChange={(e) =>
                      setSelectedDepartment({ ...selectedDepartment, nb_etudiants: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div>
                <label htmlFor="localisation" className="block text-sm font-medium text-gray-700">
                  Localisation
                </label>
                <input
                  type="text"
                  id="localisation"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedDepartment.localisation || ""}
                  onChange={(e) => setSelectedDepartment({ ...selectedDepartment, localisation: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedDepartment.description || ""}
                  onChange={(e) => setSelectedDepartment({ ...selectedDepartment, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3 rounded-b-lg">
              <button
                type="button"
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={closeModal}
              >
                Annuler
              </button>
              <button
                type="button"
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleSaveDepartment}
                disabled={!selectedDepartment.nom || !selectedDepartment.code}
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
