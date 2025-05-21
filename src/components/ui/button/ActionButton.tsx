import React from "react";

interface ActionButtonProps {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Bouton d'action réutilisable avec différentes variantes
 */
export default function ActionButton({
  label,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  isLoading = false,
  icon,
  className = "",
}: ActionButtonProps) {
  // Définir les classes de base pour tous les boutons
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";
  
  // Classes spécifiques à la variante
  const variantClasses = {
    primary: "border border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300",
    secondary: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500",
    danger: "border border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300",
  };
  
  // Classes spécifiques à la taille
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Chargement...
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {label}
        </>
      )}
    </button>
  );
} 