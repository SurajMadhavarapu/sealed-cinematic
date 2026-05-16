import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

// Format relative time
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diff = then.getTime() - now.getTime();

  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return 'Unlocked';
  if (days === 0) return 'Unlocks today';
  if (days === 1) return 'Unlocks tomorrow';
  if (days < 7) return `Unlocks in ${days} days`;
  if (days < 30) return `Unlocks in ${Math.ceil(days / 7)} weeks`;
  if (days < 365) return `Unlocks in ${Math.ceil(days / 30)} months`;
  return `Unlocks in ${Math.ceil(days / 365)} years`;
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

// Generate initials
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
