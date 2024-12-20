import { z } from 'zod';
import { User } from './auth';

export type GoalStatus = 'onTrack' | 'atRisk' | 'offTrack' | 'completed';
export type GoalCategory = 'physical' | 'tactical' | 'technical' | 'mental' | 'other';

export interface GoalNote {
  id: string;
  text: string;
  createdBy: string;
  createdByUser?: User;
  createdAt: string;
}

export interface DevelopmentGoal {
  id: string;
  athleteId: string;
  title: string;
  description?: string;
  category: GoalCategory;
  targetMetric?: {
    value: number;
    unit: string;
  };
  deadline: string;
  progress: number;
  status: GoalStatus;
  protocolId?: string;
  linkedSessions?: string[];
  assignedTo?: string;
  assignedToUser?: User;
  notes: GoalNote[];
  createdBy: string;
  created: string;
  updated: string;
}

export const targetMetricSchema = z.object({
  value: z.number().min(0, 'Target value must be positive'),
  unit: z.string().min(1, 'Unit is required'),
});

export const goalSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  category: z.enum(['physical', 'tactical', 'technical', 'mental', 'other']),
  targetMetric: z.union([
    targetMetricSchema,
    z.undefined()
  ]).optional(),
  deadline: z.string(),
  protocolId: z.string().optional(),
  linkedSessions: z.array(z.string()).optional(),
  assignedTo: z.string().optional(),
});

export type CreateGoalData = z.infer<typeof goalSchema>;

export const goalNoteSchema = z.object({
  text: z.string().min(1, 'Note text is required'),
});

export type CreateGoalNoteData = z.infer<typeof goalNoteSchema>;