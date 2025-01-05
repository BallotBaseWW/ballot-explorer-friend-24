import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  
  // Handle date format YYYYMMDD
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function calculateAge(dateStr: string | null): number | null {
  if (!dateStr) return null;
  
  const year = Number(dateStr.substring(0, 4));
  const month = Number(dateStr.substring(4, 6)) - 1;
  const day = Number(dateStr.substring(6, 8));
  
  const birthDate = new Date(year, month, day);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}