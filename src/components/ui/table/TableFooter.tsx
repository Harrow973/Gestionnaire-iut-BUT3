interface TableFooterProps {
  totalItems: number;
  filteredItemsCount?: number;
  totalItemsCount?: number;
  searchApplied?: boolean;
  label?: string;
  children?: React.ReactNode;
}

/**
 * Pied de tableau avec informations sur les résultats
 */
export default function TableFooter({
  totalItems,
  filteredItemsCount,
  totalItemsCount,
  searchApplied = false,
  label = "résultats",
  children,
}: TableFooterProps) {
  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
      <div className="text-xs text-gray-500">
        {searchApplied && filteredItemsCount !== undefined && totalItemsCount !== undefined 
          ? `${filteredItemsCount} sur ${totalItemsCount} ${label}`
          : `${totalItems} ${label}`
        }
      </div>
      
      {children && <div className="flex items-center space-x-2">{children}</div>}
    </div>
  );
} 