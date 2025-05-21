import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combine et fusionne des classes CSS avec tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Utilitaires pour l'application
 */

/**
 * Formate une date relative (il y a X minutes, etc.)
 * @param dateString Date à formater
 * @returns String indiquant le temps écoulé
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return "À l'instant";
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `Il y a ${diffInWeeks} semaine${diffInWeeks > 1 ? 's' : ''}`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `Il y a ${diffInMonths} mois`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `Il y a ${diffInYears} an${diffInYears > 1 ? 's' : ''}`;
}

/**
 * Formate une date au format français
 * @param dateString Date à formater
 * @param includeTime Inclure l'heure
 * @returns Date formatée
 */
export function formatDate(dateString: string, includeTime = false): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return date.toLocaleDateString('fr-FR', options);
}

/**
 * Génère une couleur aléatoire
 * @returns Couleur hexadécimale
 */
export function getRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/**
 * Tronque un texte à une longueur maximale
 * @param text Texte à tronquer
 * @param maxLength Longueur maximale
 * @returns Texte tronqué
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Génère un identifiant unique
 * @returns Identifiant unique
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Formate un nombre avec séparateur de milliers
 * @param num Nombre à formater
 * @returns Nombre formaté
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num);
}

/**
 * Convertit une durée en minutes en format heures:minutes
 * @param minutes Durée en minutes
 * @returns Durée formatée
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h${mins > 0 ? mins.toString().padStart(2, '0') : '00'}`;
}

/**
 * Filtre un tableau d'objets par une chaîne de recherche sur plusieurs propriétés
 * @param items Tableau d'objets à filtrer
 * @param searchTerm Chaîne de recherche
 * @param properties Propriétés à rechercher
 * @returns Tableau filtré
 */
export function filterBySearchTerm<T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  properties: string[]
): T[] {
  if (!searchTerm) return items;
  
  const term = searchTerm.toLowerCase().trim();
  
  return items.filter(item => 
    properties.some(prop => {
      const value = item[prop];
      return value && String(value).toLowerCase().includes(term);
    })
  );
}
