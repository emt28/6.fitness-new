import { Athlete } from './athlete';
import { User } from './auth';

export type AttendanceStatus = 'present' | 'late' | 'absent';

export interface FitnessSession {
  id: string;
  name: string;
  date: string;
  dayOfWeek: number; // 0-6 for Sunday-Saturday
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  maxAthletes: number;
  selectedAthletes?: string[]; // Array of athlete IDs
  excludedDates?: string[]; // Array of dates when session won't run
  createdBy: string;
  created: string;
  updated: string;
}

export interface SessionTemplate {
  id: string;
  name: string;
  description: string;
  sessions: FitnessSession[];
  createdBy: string;
  created: string;
  updated: string;
}

export interface SessionAttendance {
  id: string;
  sessionId: string;
  athleteId: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
  recordedBy: string;
  created: string;
  updated: string;
}

export interface SessionSchedule {
  id: string;
  templateId: string;
  weekStartDate: string;
  sessions: FitnessSession[];
  createdBy: string;
  created: string;
  updated: string;
}

export interface CreateSessionData {
  name: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  maxAthletes: number;
  selectedAthletes?: string[];
  excludedDates?: string[];
}

export interface CreateTemplateData {
  name: string;
  description: string;
  sessions: CreateSessionData[];
}

export interface CreateScheduleData {
  templateId: string;
  weekStartDate: string;
}

export interface CreateAttendanceData {
  sessionId: string;
  athleteId: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface AttendanceStats {
  totalSessions: number;
  attendedSessions: number;
  lateSessions: number;
  missedSessions: number;
  attendanceRate: number;
  recentAttendance: Array<{
    date: string;
    status: AttendanceStatus;
    session: FitnessSession;
  }>;
}