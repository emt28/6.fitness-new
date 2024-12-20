import { User } from './auth';

export type FeedbackType = 'general' | 'technical' | 'tactical' | 'physical' | 'mental';

export interface SessionFeedback {
  id: string;
  sessionId: string;
  mainFocus: string;
  secondaryGoals: string[];
  drills: string[];
  notes: string;
  media?: string[];
  createdBy: string;
  createdByUser?: User;
  created: string;
  updated: string;
}

export interface FeedbackTemplate {
  id: string;
  name: string;
  mainFocus: string;
  secondaryGoals: string[];
  drills: string[];
  notes: string;
  createdBy: string;
  createdByUser?: User;
  created: string;
  updated: string;
}

export interface TrainingLogEntry {
  id: string;
  athleteId: string;
  sessionId: string;
  date: string;
  feedback: {
    mainFocus: string;
    secondaryGoals: string[];
    drills: string[];
    notes: string;
    media?: string[];
  };
  attendanceStatus: 'present' | 'late' | 'absent';
  created: string;
  updated: string;
}

export interface CreateSessionFeedbackData {
  mainFocus: string;
  secondaryGoals: string[];
  drills: string[];
  notes: string;
  media?: string[];
}

export interface CreateFeedbackTemplateData {
  name: string;
  mainFocus: string;
  secondaryGoals: string[];
  drills: string[];
  notes: string;
}