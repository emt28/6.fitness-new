import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TestProtocol, NormativeRange, PerformanceLevel } from '@/types/protocol';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

export function calculatePerformanceLevel(
  value: number,
  protocol: TestProtocol,
): PerformanceLevel {
  const age = 'U14'; // TODO: Calculate based on athlete's age
  const range = protocol.normativeData.find(d => d.ageGroup === age);
  
  if (!range) return 'median';

  if (protocol.criteria === 'lower') {
    if (value <= range.excellent.max) return 'excellent';
    if (value <= range.median.max) return 'median';
    return 'needs_improvement';
  } else {
    if (value >= range.excellent.min) return 'excellent';
    if (value >= range.median.min) return 'median';
    return 'needs_improvement';
  }
}