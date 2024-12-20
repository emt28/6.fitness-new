import { z } from 'zod';

export type AgeGroup = 'U10' | 'U12' | 'U14' | 'U16' | 'U18' | 'College';
export type PerformanceCriteria = 'lower' | 'higher';
export type PerformanceLevel = 'needs_improvement' | 'median' | 'excellent';
export type ProtocolCategory = 
  | 'physical'
  | 'tactical'
  | 'speed'
  | 'strength'
  | 'coordination'
  | 'tennis-specific'
  | 'match-development'
  | 'other';

export interface NormativeRange {
  ageGroup: AgeGroup;
  needs_improvement: { min: number; max: number };
  median: { min: number; max: number };
  excellent: { min: number; max: number };
}

export interface TestProtocol {
  id: string;
  name: string;
  description: string;
  unit: string;
  criteria: PerformanceCriteria;
  categories: ProtocolCategory[];
  normativeData: NormativeRange[];
  createdBy: string;
  created: string;
  updated: string;
}

export interface CreateTestProtocolData {
  name: string;
  description: string;
  unit: string;
  criteria: PerformanceCriteria;
  categories: ProtocolCategory[];
  normativeData: NormativeRange[];
}

export const PROTOCOL_CATEGORIES: { value: ProtocolCategory; label: string }[] = [
  { value: 'physical', label: 'Physical' },
  { value: 'tactical', label: 'Tactical' },
  { value: 'speed', label: 'Speed' },
  { value: 'strength', label: 'Strength' },
  { value: 'coordination', label: 'Coordination' },
  { value: 'tennis-specific', label: 'Tennis-Specific' },
  { value: 'match-development', label: 'Match Development' },
  { value: 'other', label: 'Other' },
];