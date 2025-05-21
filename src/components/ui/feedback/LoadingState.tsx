import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  columns?: number;
  rows?: number;
  title?: string;
  className?: string;
}

/**
 * Composant pour afficher un état de chargement avec skeleton loader
 */
export default function LoadingState({
  message = "Chargement des données...",
  columns = 4,
  rows = 5,
  title,
  className = "",
}: LoadingStateProps) {
  return (
    <div className={`w-full overflow-hidden rounded-xl bg-white ${className}`}>
      {title && (
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        </div>
      )}
      
      <div className="px-6 py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <span className="ml-3 text-sm font-medium text-gray-600">{message}</span>
        </div>
        
        <div className="mt-6 space-y-3">
          {[...Array(rows)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="grid grid-cols-12 gap-4">
                {[...Array(columns)].map((_, colIndex) => (
                  <div 
                    key={colIndex} 
                    className={`col-span-${Math.floor(12 / columns)} h-10 rounded-md bg-gray-100`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 