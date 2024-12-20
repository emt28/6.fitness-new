import { z } from 'zod';
import { PerformanceLevel } from './protocol';

export interface Assessment {
  id: string;
  athleteId: string;
  protocolId: string;
  value: number;
  performanceLevel: PerformanceLevel;
  notes?: string;
  assessedBy: string;
  assessedAt: string;
  created: string;
  updated: string;
}

export interface CreateAssessmentData {
  athleteId: string;
  protocolId: string;
  value: number;
  notes?: string;
  assessedAt: string;
}

export const assessmentSchema = z.object({
  athleteId: z.string().min(1, 'Athlete is required'),
  protocolId: z.string().min(1, 'Protocol is required'),
  value: z.number().min(0, 'Value must be positive'),
  notes: z.string().optional(),
  assessedAt: z.string().refine(
    (date) => new Date(date) <= new Date(),
    'Assessment date cannot be in the future'
  ),
});