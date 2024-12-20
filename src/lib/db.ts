import { pb } from './pocketbase';
import type { ListResult } from 'pocketbase';
import type { Athlete, CreateAthleteData } from '@/types/athlete';
import type { TestProtocol, CreateTestProtocolData } from '@/types/protocol';
import type { Assessment, CreateAssessmentData } from '@/types/assessment';
import type { DevelopmentGoal, CreateGoalData, GoalNote, CreateGoalNoteData } from '@/types/development';
import type { CoachNote } from '@/types/note';

// Athletes
export async function getAthletes() {
  const records = await pb.collection('athletes').getList(1, 50, {
    sort: 'name',
    expand: 'createdBy',
  });
  return records.items as unknown as Athlete[];
}

export async function createAthlete(data: CreateAthleteData) {
  const record = await pb.collection('athletes').create({
    ...data,
    createdBy: pb.authStore.model?.id,
  });
  return record as unknown as Athlete;
}

// Protocols
export async function getProtocols() {
  const records = await pb.collection('protocols').getList(1, 50, {
    sort: 'name',
    expand: 'createdBy',
  });
  return records.items as unknown as TestProtocol[];
}

export async function createProtocol(data: CreateTestProtocolData) {
  const record = await pb.collection('protocols').create({
    ...data,
    createdBy: pb.authStore.model?.id,
  });
  return record as unknown as TestProtocol;
}

// Assessments
export async function getAssessments(athleteId?: string) {
  const filter = athleteId ? `athleteId = "${athleteId}"` : '';
  const records = await pb.collection('assessments').getList(1, 100, {
    filter,
    sort: '-assessedAt',
    expand: 'athleteId,protocolId,assessedBy',
  });
  return records.items as unknown as Assessment[];
}

export async function createAssessment(data: CreateAssessmentData) {
  const record = await pb.collection('assessments').create({
    ...data,
    assessedBy: pb.authStore.model?.id,
  });
  return record as unknown as Assessment;
}

// Development Goals
export async function getGoals(athleteId: string) {
  const records = await pb.collection('goals').getList(1, 50, {
    filter: `athleteId = "${athleteId}"`,
    sort: '-created',
    expand: 'protocolId,assignedTo',
  });
  return records.items as unknown as DevelopmentGoal[];
}

export async function createGoal(data: CreateGoalData & { athleteId: string }) {
  const record = await pb.collection('goals').create({
    ...data,
    createdBy: pb.authStore.model?.id,
  });
  return record as unknown as DevelopmentGoal;
}

// Goal Notes
export async function addGoalNote(goalId: string, data: CreateGoalNoteData) {
  const record = await pb.collection('goal_notes').create({
    goalId,
    ...data,
    createdBy: pb.authStore.model?.id,
  });
  return record as unknown as GoalNote;
}

// Coach Notes
export async function getCoachNotes(athleteId: string) {
  const records = await pb.collection('coach_notes').getList(1, 50, {
    filter: `athleteId = "${athleteId}"`,
    sort: '-created',
    expand: 'createdBy',
  });
  return records.items as unknown as CoachNote[];
}

export async function createCoachNote(athleteId: string, data: {
  content: string;
  type: CoachNote['type'];
  visibility: CoachNote['visibility'];
}) {
  const record = await pb.collection('coach_notes').create({
    athleteId,
    ...data,
    createdBy: pb.authStore.model?.id,
  });
  return record as unknown as CoachNote;
}

// Audit Logs
export async function logAuditEvent(action: string, details: string) {
  await pb.collection('audit_logs').create({
    action,
    userId: pb.authStore.model?.id,
    details,
    timestamp: new Date().toISOString(),
  });
}