"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Form from "@/components/ui/form/Form";

export default function NewEnseignantPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fields = [
    {
      name: "nom",
      label: "Nom",
      type: "text" as const,
      required: true,
      placeholder: "Ex: Dubois",
    },
    {
      name: "prenom",
      label: "Prénom",
      type: "text" as const,
      required: true,
      placeholder: "Ex: Pierre",
    },
    {
      name: "email",
      label: "Email",
      type: "email" as const,
      required: true,
      placeholder: "Ex: pierre.dubois@iut.fr",
    },
    {
      name: "departement_id",
      label: "Département",
      type: "select" as const,
      required: true,
      options: [
        { value: 1, label: "Informatique" },
        { value: 2, label: "Génie Civil" },
        { value: 3, label: "GEA" },
        { value: 4, label: "TC" },
      ],
    },
    {
      name: "statut_id",
      label: "Statut",
      type: "select" as const,
      required: true,
      options: [
        { value: 1, label: "Titulaire" },
        { value: 2, label: "Vacataire" },
        { value: 3, label: "Contractuel" },
      ],
    },
  ];

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Simulation d'un appel API
      console.log("Données soumises:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Redirection vers la liste des enseignants
      router.push("/enseignants");
      router.refresh(); // Rafraîchir les données
    } catch (error) {
      console.error("Erreur lors de la création de l'enseignant:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Nouvel enseignant</h1>
        <p className="mt-1 text-gray-600">
          Ajoutez un nouvel enseignant au système
        </p>
      </div>
      
      <Form
        title="Informations de l'enseignant"
        fields={fields}
        onSubmit={handleSubmit}
        submitLabel="Créer l'enseignant"
      />
    </div>
  );
} 