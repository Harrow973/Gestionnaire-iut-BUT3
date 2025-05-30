import React from "react";

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  title?: string;
  className?: string;
}

/**
 * Composant pour afficher un état vide (aucune donnée, résultat de recherche vide, etc.)
 */
export default function EmptyState({
  message,
  icon,
  title,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
      {icon ? (
        <div className="rounded-full bg-gray-50 p-6">{icon}</div>
      ) : (
        <div className="rounded-full bg-gray-50 p-6">
          <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
            />
          </svg>
        </div>
      )}
      
      {title && <h3 className="mt-3 text-lg font-medium text-gray-700">{title}</h3>}
      <p className="mt-2 text-center text-base font-medium text-gray-600">{message}</p>
    </div>
  );
} 