"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Form from "@/components/ui/form/Form";

export default function NewDepartementPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fields = [
    {
      name: "nom",
      label: "Nom du département",
      type: "text" as const,
      required: true,
      placeholder: "Ex: Informatique",
    },
    {
      name: "code",
      label: "Code",
      type: "text" as const,
      required: true,
      placeholder: "Ex: INFO",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea" as const,
      placeholder: "Description du département...",
    },
  ];

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/departements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création du département');
      }
      
      // Redirection vers la liste des départements
      router.push("/departements");
      router.refresh(); // Rafraîchir les données
    } catch (error) {
      console.error("Erreur lors de la création du département:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Nouveau département</h1>
        <p className="mt-1 text-gray-600">
          Créez un nouveau département dans l'IUT
        </p>
      </div>
      
      <Form
        title="Informations du département"
        fields={fields}
        onSubmit={handleSubmit}
        submitLabel="Créer le département"
      />
    </div>
  );
} 