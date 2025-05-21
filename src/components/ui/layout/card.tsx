import React from "react";

// Card component principal
interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  noPadding?: boolean;
}

/**
 * Composant Card réutilisable avec en-tête, corps et pied optionnels
 */
export default function Card({
  title,
  subtitle,
  children,
  footer,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  footerClassName = "",
  noPadding = false,
}: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {(title || subtitle) && (
        <div className={`border-b border-gray-100 px-6 py-4 ${headerClassName}`}>
          {title && <h3 className="text-lg font-medium text-gray-800">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      
      <div className={`${noPadding ? '' : 'p-6'} ${bodyClassName}`}>
        {children}
      </div>
      
      {footer && (
        <div className={`border-t border-gray-100 px-6 py-4 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
}

// Composants additionnels pour compatibilité avec shadcn/ui pattern

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div className={`border-b border-gray-100 px-6 py-4 space-y-1.5 ${className}`}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className = "" }: CardTitleProps) {
  return (
    <h3 className={`text-lg font-medium text-gray-800 ${className}`}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardDescription({ children, className = "" }: CardDescriptionProps) {
  return (
    <p className={`mt-1 text-sm text-gray-500 ${className}`}>
      {children}
    </p>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return (
    <div className={`p-6 pt-0 ${className}`}>
      {children}
    </div>
  );
}

export { Card }; 