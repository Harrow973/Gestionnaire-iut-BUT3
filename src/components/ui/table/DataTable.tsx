"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TableHeader from "./TableHeader";
import EmptyState from "../feedback/EmptyState";
import LoadingState from "../feedback/LoadingState";
import SortableHeader from "./SortableHeader";
import TableFooter from "./TableFooter";
import { filterBySearchTerm } from "@/lib/utils";
import Link from "next/link";
import { Edit, Eye, Trash } from "lucide-react";

interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
  searchable?: boolean;
}

interface Actions {
  edit?: boolean;
  delete?: boolean;
  view?: boolean;
  basePath?: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  keyField: string;
  emptyMessage?: string;
  isLoading?: boolean;
  title?: string;
  showSearch?: boolean;
  initialSortField?: string; 
  initialSortDirection?: "asc" | "desc";
  actions?: Actions;
}

export default function DataTable({
  columns,
  data,
  onRowClick,
  keyField,
  emptyMessage = "Aucune donnée à afficher",
  isLoading = false,
  title,
  showSearch = false,
  initialSortField = "",
  initialSortDirection = "asc",
  actions,
}: DataTableProps) {
  const [sortColumn, setSortColumn] = useState(initialSortField);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(initialSortDirection);
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Set initial sort on component mount or when initialSortField changes
  useEffect(() => {
    if (initialSortField) {
      setSortColumn(initialSortField);
      setSortDirection(initialSortDirection);
    }
  }, [initialSortField, initialSortDirection]);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  // Get searchable columns
  const searchableColumns = columns
    .filter(col => col.searchable !== false)
    .map(col => col.key);

  // Filter data based on search term
  const filteredData = searchTerm
    ? filterBySearchTerm(data, searchTerm, searchableColumns)
    : [...data];

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (aValue === null || aValue === undefined) return sortDirection === "asc" ? 1 : -1;
    if (bValue === null || bValue === undefined) return sortDirection === "asc" ? -1 : 1;
    
    // Handle string comparison
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    // Handle number/default comparison
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Apply default sort by ID if no sort is specified
  const finalSortedData = !sortColumn && keyField
    ? [...sortedData].sort((a, b) => {
        const aValue = a[keyField];
        const bValue = b[keyField];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        if (typeof aValue === "string" && typeof bValue === "string") {
          return aValue.localeCompare(bValue);
        }
        
        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
        return 0;
      })
    : sortedData;

  if (isLoading) {
    return <LoadingState title={title} columns={columns.length} />;
  }

  if (data.length === 0) {
    return (
      <div className="w-full overflow-hidden rounded-xl bg-white shadow-lg">
        <TableHeader title={title} />
        <EmptyState message={emptyMessage} />
      </div>
    );
  }

  const noResults = finalSortedData.length === 0 && searchTerm.length > 0;

  // Determine if we need to add an actions column
  const hasActions = actions && (actions.edit || actions.delete || actions.view);
  const allColumns = hasActions 
    ? [...columns, { key: "actions", header: "Actions", width: "100px" }]
    : columns;

  return (
    <div className="w-full overflow-hidden rounded-xl bg-white shadow-lg">
      <TableHeader 
        title={title} 
        showSearch={showSearch} 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />

      {noResults ? (
        <EmptyState 
          message={`Aucun résultat pour "${searchTerm}"`} 
          title="Pas de correspondance" 
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                {allColumns.map((column) => (
                  <SortableHeader
                    key={column.key}
                    column={column}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              <AnimatePresence>
                {finalSortedData.map((row) => (
                  <motion.tr
                    key={row[keyField]}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`transition-colors duration-150 ${
                      onRowClick ? "cursor-pointer" : ""
                    } ${hoveredRow === row[keyField] ? "bg-blue-50" : ""}`}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    onMouseEnter={() => setHoveredRow(row[keyField])}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {columns.map((column) => (
                      <td key={`${row[keyField]}-${column.key}`} className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {column.render ? (
                          column.render(row[column.key], row)
                        ) : row[column.key] === null || row[column.key] === undefined ? (
                          <span className="text-gray-400">—</span>
                        ) : (
                          row[column.key]
                        )}
                      </td>
                    ))}
                    
                    {hasActions && (
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <div className="flex items-center justify-end space-x-2">
                          {actions?.view && actions.basePath && (
                            <Link 
                              href={`${actions.basePath}/${row[keyField]}`}
                              className="rounded-full p-1.5 text-blue-600 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          )}
                          
                          {actions?.edit && actions.basePath && (
                            <Link 
                              href={`${actions.basePath}/${row[keyField]}/edit`}
                              className="rounded-full p-1.5 text-amber-600 hover:bg-amber-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          )}
                          
                          {actions?.delete && (
                            <button 
                              className="rounded-full p-1.5 text-red-600 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Ici, vous pourriez implémenter la logique de suppression
                                // ou déclencher une modale de confirmation
                                console.log(`Delete item with ID: ${row[keyField]}`);
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
      
      <TableFooter 
        totalItems={finalSortedData.length} 
        filteredItemsCount={filteredData.length} 
        totalItemsCount={data.length}
        searchApplied={searchTerm.length > 0}
      />
    </div>
  );
} 