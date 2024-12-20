import { addDays, format, parse, startOfWeek } from 'date-fns';
import {
  FitnessSession,
  SessionTemplate,
  SessionAttendance,
  SessionSchedule,
  CreateSessionData,
  CreateTemplateData,
  CreateScheduleData,
  CreateAttendanceData,
  AttendanceStats,
} from '@/types/attendance';

// In-memory storage
let sessions: FitnessSession[] = [];
let templates: SessionTemplate[] = [];
let schedules: SessionSchedule[] = [];
let attendance: SessionAttendance[] = [];

// Create a dummy template for testing
const dummyTemplate: SessionTemplate = {
  id: '1',
  name: 'Tennis Training Schedule',
  description: 'Weekly tennis training sessions for junior players',
  sessions: [
    {
      id: '1',
      name: 'Morning Training',
      dayOfWeek: 1, // Monday
      startTime: '09:00',
      endTime: '10:30',
      maxAthletes: 10,
      selectedAthletes: ['1', '2', '3'], // Emma, James, Sofia
      createdBy: '1',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      date: format(startOfWeek(new Date()), 'yyyy-MM-dd'),
    },
    {
      id: '2',
      name: 'Afternoon Practice',
      dayOfWeek: 3, // Wednesday
      startTime: '14:00',
      endTime: '15:30',
      maxAthletes: 10,
      selectedAthletes: ['4', '5', '6'], // Lucas, Sarah, Michael
      createdBy: '1',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      date: format(addDays(startOfWeek(new Date()), 2), 'yyyy-MM-dd'),
    },
  ],
  createdBy: '1',
  created: new Date().toISOString(),
  updated: new Date().toISOString(),
};

templates = [dummyTemplate];

export async function getSessions(): Promise<FitnessSession[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Getting sessions:', sessions);
  return sessions;
}

export async function createSession(data: CreateSessionData & { date: string }): Promise<FitnessSession> {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Creating session with data:', data);

  const newSession: FitnessSession = {
    id: String(sessions.length + 1),
    ...data,
    createdBy: '1',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };

  sessions = [...sessions, newSession];
  console.log('Session created:', newSession);
  return newSession;
}

export async function getTemplates(): Promise<SessionTemplate[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Getting templates:', templates);
  return templates;
}

export async function createTemplate(data: CreateTemplateData): Promise<SessionTemplate> {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Creating template with data:', data);
  
  const newTemplate: SessionTemplate = {
    id: String(templates.length + 1),
    name: data.name,
    description: data.description,
    sessions: data.sessions.map((session, index) => ({
      id: String(sessions.length + index + 1),
      ...session,
      createdBy: '1',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    })),
    createdBy: '1',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };

  templates = [...templates, newTemplate];
  console.log('Template created:', newTemplate);
  return newTemplate;
}

export async function deleteTemplate(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Deleting template:', id);
  templates = templates.filter(t => t.id !== id);
}

export async function getSchedules(weekStartDate?: string): Promise<SessionSchedule[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Getting schedules for week:', weekStartDate);
  console.log('Current schedules:', schedules);
  return schedules.filter(s => !weekStartDate || s.weekStartDate === weekStartDate);
}

export async function createSchedule(data: CreateScheduleData): Promise<SessionSchedule> {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Creating schedule with data:', data);
  
  const template = templates.find(t => t.id === data.templateId);
  if (!template) {
    console.error('Template not found:', data.templateId);
    throw new Error('Template not found');
  }

  // Create new sessions for this week's schedule
  const weekStart = new Date(data.weekStartDate);
  const scheduleSessions = template.sessions.map(templateSession => {
    const sessionDate = addDays(weekStart, templateSession.dayOfWeek);
    return {
      ...templateSession,
      id: `${templateSession.id}-${data.weekStartDate}`, // Make unique for this week
      date: format(sessionDate, 'yyyy-MM-dd'),
    };
  });

  console.log('Generated schedule sessions:', scheduleSessions);

  const newSchedule: SessionSchedule = {
    id: String(schedules.length + 1),
    templateId: data.templateId,
    weekStartDate: data.weekStartDate,
    sessions: scheduleSessions,
    createdBy: '1',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };

  // Remove any existing schedule for this week
  schedules = schedules.filter(s => s.weekStartDate !== data.weekStartDate);
  
  // Add the new schedule
  schedules = [...schedules, newSchedule];

  // Update sessions array with the new sessions
  sessions = [
    ...sessions.filter(s => !s.id.includes(data.weekStartDate)), // Remove old sessions
    ...scheduleSessions,
  ];

  console.log('Schedule created:', newSchedule);
  console.log('Updated schedules:', schedules);
  console.log('Updated sessions:', sessions);

  return newSchedule;
}

export async function getAttendance(
  sessionId?: string,
  athleteId?: string,
  date?: string
): Promise<SessionAttendance[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Getting attendance:', { sessionId, athleteId, date });
  return attendance.filter(a =>
    (!sessionId || a.sessionId === sessionId) &&
    (!athleteId || a.athleteId === athleteId) &&
    (!date || a.date === date)
  );
}

export async function recordAttendance(data: CreateAttendanceData): Promise<SessionAttendance> {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Recording attendance:', data);
  
  // Check if attendance record already exists
  const existingIndex = attendance.findIndex(
    a => a.sessionId === data.sessionId && 
        a.athleteId === data.athleteId && 
        a.date === data.date
  );

  const attendanceRecord: SessionAttendance = {
    id: existingIndex >= 0 ? attendance[existingIndex].id : String(attendance.length + 1),
    ...data,
    recordedBy: '1',
    created: existingIndex >= 0 ? attendance[existingIndex].created : new Date().toISOString(),
    updated: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    attendance = [
      ...attendance.slice(0, existingIndex),
      attendanceRecord,
      ...attendance.slice(existingIndex + 1),
    ];
  } else {
    attendance = [...attendance, attendanceRecord];
  }

  console.log('Attendance recorded:', attendanceRecord);
  console.log('Updated attendance records:', attendance);

  return attendanceRecord;
}

export async function getAthleteAttendanceStats(athleteId: string): Promise<AttendanceStats> {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Getting attendance stats for athlete:', athleteId);
  
  const athleteAttendance = attendance.filter(a => a.athleteId === athleteId);
  const totalSessions = athleteAttendance.length;
  const attendedSessions = athleteAttendance.filter(a => a.status === 'present').length;
  const lateSessions = athleteAttendance.filter(a => a.status === 'late').length;
  const missedSessions = athleteAttendance.filter(a => a.status === 'absent').length;

  const recentAttendance = athleteAttendance
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
    .map(a => ({
      date: a.date,
      status: a.status,
      session: sessions.find(s => s.id === a.sessionId)!,
    }));

  const stats = {
    totalSessions,
    attendedSessions,
    lateSessions,
    missedSessions,
    attendanceRate: totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0,
    recentAttendance,
  };

  console.log('Attendance stats:', stats);
  return stats;
}