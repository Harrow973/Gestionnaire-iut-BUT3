interface FieldProps {
  name: string;
  label: string;
  type: "text" | "number" | "email" | "date" | "select" | "textarea";
  required?: boolean;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  min?: number;
  max?: number;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  error?: string;
}

/**
 * Composant de champ de formulaire réutilisable
 */
export default function FormField({
  name,
  label,
  type,
  required = false,
  placeholder,
  options = [],
  min,
  max,
  value,
  onChange,
  error,
}: FieldProps) {
  const baseInputClasses = `mt-1 block w-full rounded-md p-2 text-gray-800 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
    error ? "border-red-500" : ""
  }`;

  return (
    <div className="space-y-1">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={baseInputClasses}
          rows={4}
        />
      ) : type === "select" ? (
        <select
          id={name}
          name={name}
          value={value || ""}
          onChange={onChange}
          required={required}
          className={baseInputClasses}
        >
          <option value="">Sélectionner...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          className={baseInputClasses}
        />
      )}

      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
} 