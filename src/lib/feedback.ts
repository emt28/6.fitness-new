import { getCurrentUser } from './mock-auth';
import { SessionFeedback, FeedbackTemplate, TrainingLogEntry, CreateSessionFeedbackData, CreateFeedbackTemplateData } from '@/types/feedback';
import { getAttendance } from './attendance';

// In-memory storage
let sessionFeedback: SessionFeedback[] = [];
let feedbackTemplates: FeedbackTemplate[] = [];
let trainingLog: TrainingLogEntry[] = [];
let customElements: CustomElement[] = [];

interface CustomElement {
  id: string;
  value: string;
  type: 'focus' | 'goals' | 'drills';
  userId: string;
}

export async function getSessionFeedback(sessionId: string): Promise<SessionFeedback | null> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return sessionFeedback.find(f => f.sessionId === sessionId) || null;
}

export async function createSessionFeedback(data: CreateSessionFeedbackData & { sessionId: string }): Promise<SessionFeedback> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated to create feedback');
  }

  // Get attendance records for this session
  const attendance = await getAttendance(data.sessionId);
  const presentAthletes = attendance.filter(a => 
    a.status === 'present' || a.status === 'late'
  );

  // Create session feedback
  const feedback: SessionFeedback = {
    id: String(sessionFeedback.length + 1),
    ...data,
    createdBy: user.id,
    createdByUser: user,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };

  sessionFeedback = [...sessionFeedback, feedback];

  // Create training log entries for each present athlete
  const newTrainingLogs = presentAthletes.map(attendance => ({
    id: String(trainingLog.length + 1 + presentAthletes.indexOf(attendance)),
    athleteId: attendance.athleteId,
    sessionId: data.sessionId,
    date: attendance.date,
    feedback: {
      mainFocus: data.mainFocus,
      secondaryGoals: data.secondaryGoals,
      drills: data.drills,
      notes: data.notes,
      media: data.media,
    },
    attendanceStatus: attendance.status,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  }));

  trainingLog = [...trainingLog, ...newTrainingLogs];

  return feedback;
}

export async function updateSessionFeedback(
  id: string,
  data: Partial<CreateSessionFeedbackData>
): Promise<SessionFeedback> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = sessionFeedback.findIndex(f => f.id === id);
  if (index === -1) throw new Error('Feedback not found');

  const updatedFeedback = {
    ...sessionFeedback[index],
    ...data,
    updated: new Date().toISOString(),
  };

  sessionFeedback = [
    ...sessionFeedback.slice(0, index),
    updatedFeedback,
    ...sessionFeedback.slice(index + 1),
  ];

  // Update corresponding training log entries
  const attendance = await getAttendance(updatedFeedback.sessionId);
  const presentAthletes = attendance.filter(a => 
    a.status === 'present' || a.status === 'late'
  );

  trainingLog = trainingLog.map(entry => {
    if (entry.sessionId === updatedFeedback.sessionId && 
        presentAthletes.some(a => a.athleteId === entry.athleteId)) {
      return {
        ...entry,
        feedback: {
          mainFocus: data.mainFocus || entry.feedback.mainFocus,
          secondaryGoals: data.secondaryGoals || entry.feedback.secondaryGoals,
          drills: data.drills || entry.feedback.drills,
          notes: data.notes || entry.feedback.notes,
          media: data.media || entry.feedback.media,
        },
        updated: new Date().toISOString(),
      };
    }
    return entry;
  });

  return updatedFeedback;
}

export async function getFeedbackTemplates(): Promise<FeedbackTemplate[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return feedbackTemplates;
}

export async function createFeedbackTemplate(data: CreateFeedbackTemplateData): Promise<FeedbackTemplate> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated to create templates');
  }

  const template: FeedbackTemplate = {
    id: String(feedbackTemplates.length + 1),
    ...data,
    createdBy: user.id,
    createdByUser: user,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };

  feedbackTemplates = [...feedbackTemplates, template];
  return template;
}

export async function deleteFeedbackTemplate(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  feedbackTemplates = feedbackTemplates.filter(t => t.id !== id);
}

export async function getTrainingLog(athleteId: string): Promise<TrainingLogEntry[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return trainingLog
    .filter(entry => entry.athleteId === athleteId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getCustomElements(type: 'focus' | 'goals' | 'drills'): Promise<CustomElement[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const user = getCurrentUser();
  if (!user) return [];
  
  return customElements.filter(e => e.type === type && e.userId === user.id);
}

export async function createCustomElement(data: { type: 'focus' | 'goals' | 'drills'; value: string }): Promise<CustomElement> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated to create custom elements');
  }

  const element: CustomElement = {
    id: String(customElements.length + 1),
    value: data.value,
    type: data.type,
    userId: user.id,
  };

  customElements = [...customElements, element];
  return element;
}

export async function deleteCustomElement(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  customElements = customElements.filter(e => e.id !== id);
}