import { ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";

interface SortableHeaderProps {
  column: {
    key: string;
    header: string;
    width?: string;
  };
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onSort: (columnKey: string) => void;
}

/**
 * En-tête de colonne triable pour les tableaux
 */
export default function SortableHeader({
  column,
  sortColumn,
  sortDirection,
  onSort,
}: SortableHeaderProps) {
  return (
    <th
      scope="col"
      style={column.width ? { width: column.width } : {}}
      className="group relative px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
    >
      <button
        className="flex w-full items-center focus:outline-none"
        onClick={() => onSort(column.key)}
        aria-sort={sortColumn === column.key ? sortDirection : undefined}
      >
        {column.header}
        <span className="ml-2">
          {sortColumn === column.key ? (
            sortDirection === "asc" ? (
              <ChevronUp className="h-4 w-4 text-blue-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-blue-500" />
            )
          ) : (
            <ArrowUpDown className="h-4 w-4 text-gray-300 transition-colors duration-200 group-hover:text-gray-500" />
          )}
        </span>
      </button>
    </th>
  );
} 