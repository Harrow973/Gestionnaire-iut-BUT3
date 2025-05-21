import React from "react";
import { Search } from "lucide-react";

interface TableHeaderProps {
  title?: string;
  showSearch?: boolean;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  children?: React.ReactNode;
}

/**
 * En-tête réutilisable pour les tableaux avec titre et barre de recherche optionnels
 */
export default function TableHeader({
  title,
  showSearch = false,
  searchTerm = "",
  onSearchChange,
  children
}: TableHeaderProps) {
  if (!title && !showSearch && !children) return null;
  
  return (
    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
      {title && <h3 className="text-lg font-medium text-gray-800">{title}</h3>}
      
      <div className="flex items-center space-x-3">
        {children}
        
        {showSearch && (
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-0 py-2 pl-10 pr-4 text-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
} 