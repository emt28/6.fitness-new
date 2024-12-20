import { User } from './auth';

export interface CoachNote {
  id: string;
  athleteId: string;
  content: string;
  createdBy: string;
  createdByUser?: User;
  created: string;
  updated: string;
  visibility: 'coaches' | 'all';
  type: 'general' | 'technical' | 'tactical' | 'physical' | 'mental';
}