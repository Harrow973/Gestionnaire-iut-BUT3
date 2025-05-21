"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "./FormField";
import ActionButton from "../button/ActionButton";

interface Field {
  name: string;
  label: string;
  type: "text" | "number" | "email" | "date" | "select" | "textarea";
  required?: boolean;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  min?: number;
  max?: number;
}

interface FormProps {
  title: string;
  fields: Field[];
  onSubmit: (data: any) => Promise<void>;
  initialValues?: Record<string, any>;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
}

export default function Form({
  title,
  fields,
  onSubmit,
  initialValues = {},
  submitLabel = "Enregistrer",
  cancelLabel = "Annuler",
  onCancel,
}: FormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let parsedValue = value;

    if (type === "number") {
      parsedValue = value === "" ? "" : Number(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));

    // Supprimer l'erreur si l'utilisateur modifie le champ
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = "Ce champ est obligatoire";
      }

      if (field.type === "number" && formData[field.name] !== "") {
        const value = Number(formData[field.name]);
        if (field.min !== undefined && value < field.min) {
          newErrors[field.name] = `La valeur minimale est ${field.min}`;
        }
        if (field.max !== undefined && value > field.max) {
          newErrors[field.name] = `La valeur maximale est ${field.max}`;
        }
      }

      if (field.type === "email" && formData[field.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.name])) {
          newErrors[field.name] = "Adresse email invalide";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Redirection ou autre action après soumission réussie
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      setErrors({
        form: "Une erreur est survenue lors de la soumission du formulaire",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl text-gray-900 font-bold mb-6">{title}</h2>

      {errors.form && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <FormField
            key={field.name}
            name={field.name}
            label={field.label}
            type={field.type}
            required={field.required}
            placeholder={field.placeholder}
            options={field.options}
            min={field.min}
            max={field.max}
            value={formData[field.name]}
            onChange={handleChange}
            error={errors[field.name]}
          />
        ))}

        <div className="flex justify-end space-x-3 pt-4">
          <ActionButton
            label={cancelLabel}
            onClick={handleCancel}
            variant="secondary"
          />
          <ActionButton
            label={submitLabel}
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          />
        </div>
      </form>
    </div>
  );
} 