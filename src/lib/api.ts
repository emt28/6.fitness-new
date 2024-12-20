import { CreateAthleteData, Athlete } from '@/types/athlete';
import { CreateTestProtocolData, TestProtocol } from '@/types/protocol';
import { Assessment, CreateAssessmentData } from '@/types/assessment';
import { AssessmentTemplate, CreateTemplateData } from '@/types/template';
import { DashboardStats } from '@/types/dashboard';
import { mockAthletes } from './mock-data';
import { mockProtocols } from './mock-protocols';
import { mockAssessments } from './mock-assessments';
import { calculatePerformanceLevel } from './utils';

let athletes = [...mockAthletes];
let protocols = [...mockProtocols];
let assessments = [...mockAssessments];
let templates: AssessmentTemplate[] = [];

// Athlete APIs
export async function getAthletes(): Promise<Athlete[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return athletes;
}

export async function createAthlete(data: CreateAthleteData): Promise<Athlete> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newAthlete: Athlete = {
    id: String(athletes.length + 1),
    ...data,
    createdBy: '1', // Replace with actual user ID
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };

  athletes = [...athletes, newAthlete];
  return newAthlete;
}

export async function updateAthlete(
  id: string,
  data: Partial<CreateAthleteData>
): Promise<Athlete> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = athletes.findIndex(a => a.id === id);
  if (index === -1) throw new Error('Athlete not found');

  const updatedAthlete = {
    ...athletes[index],
    ...data,
    updated: new Date().toISOString(),
  };

  athletes = [
    ...athletes.slice(0, index),
    updatedAthlete,
    ...athletes.slice(index + 1),
  ];

  return updatedAthlete;
}

export async function deleteAthlete(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  athletes = athletes.filter(a => a.id !== id);
}

// Protocol APIs
export async function getProtocols(): Promise<TestProtocol[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return protocols;
}

export async function createProtocol(data: CreateTestProtocolData): Promise<TestProtocol> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newProtocol: TestProtocol = {
    id: String(protocols.length + 1),
    ...data,
    createdBy: '1', // Replace with actual user ID
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };

  protocols = [...protocols, newProtocol];
  return newProtocol;
}

export async function updateProtocol(
  id: string,
  data: Partial<CreateTestProtocolData>
): Promise<TestProtocol> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = protocols.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Protocol not found');

  const updatedProtocol = {
    ...protocols[index],
    ...data,
    updated: new Date().toISOString(),
  };

  protocols = [
    ...protocols.slice(0, index),
    updatedProtocol,
    ...protocols.slice(index + 1),
  ];

  return updatedProtocol;
}

export async function deleteProtocol(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  protocols = protocols.filter(p => p.id !== id);
}

// Assessment APIs
export async function createAssessment(data: CreateAssessmentData): Promise<Assessment> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const protocol = protocols.find(p => p.id === data.protocolId);
  if (!protocol) throw new Error('Protocol not found');

  const performanceLevel = calculatePerformanceLevel(data.value, protocol);
  
  const newAssessment: Assessment = {
    id: String(assessments.length + 1),
    ...data,
    performanceLevel,
    assessedBy: '1', // Replace with actual user ID
    assessedAt: data.assessedAt || new Date().toISOString(),
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };

  assessments = [...assessments, newAssessment];
  return newAssessment;
}

export async function getAssessments(athleteId?: string): Promise<Assessment[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return athleteId 
    ? assessments.filter(a => a.athleteId === athleteId)
    : assessments;
}

export async function getAthleteAssessments(athleteId: string, protocolId?: string): Promise<Assessment[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return assessments.filter(
    a => a.athleteId === athleteId && (!protocolId || a.protocolId === protocolId)
  );
}

export async function updateAssessment(
  id: string,
  data: Partial<CreateAssessmentData>
): Promise<Assessment> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = assessments.findIndex(a => a.id === id);
  if (index === -1) throw new Error('Assessment not found');

  const protocol = protocols.find(p => p.id === assessments[index].protocolId);
  if (!protocol) throw new Error('Protocol not found');

  const updatedAssessment = {
    ...assessments[index],
    ...data,
    performanceLevel: data.value 
      ? calculatePerformanceLevel(data.value, protocol)
      : assessments[index].performanceLevel,
    assessedAt: data.assessedAt || assessments[index].assessedAt,
    updated: new Date().toISOString(),
  };

  assessments = [
    ...assessments.slice(0, index),
    updatedAssessment,
    ...assessments.slice(index + 1),
  ];

  return updatedAssessment;
}

export async function deleteAssessment(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  assessments = assessments.filter(a => a.id !== id);
}

// Template APIs
export async function getTemplates(): Promise<AssessmentTemplate[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return templates;
}

export async function createTemplate(data: CreateTemplateData): Promise<AssessmentTemplate> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const templateProtocols = protocols.filter(p => data.protocols.includes(p.id));
  
  const newTemplate: AssessmentTemplate = {
    id: String(templates.length + 1),
    name: data.name,
    description: data.description,
    protocols: templateProtocols,
    createdBy: '1', // Replace with actual user ID
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };

  templates = [...templates, newTemplate];
  return newTemplate;
}

export async function updateTemplate(
  id: string,
  data: Partial<CreateTemplateData>
): Promise<AssessmentTemplate> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = templates.findIndex(t => t.id === id);
  if (index === -1) throw new Error('Template not found');

  const templateProtocols = data.protocols
    ? protocols.filter(p => data.protocols?.includes(p.id))
    : templates[index].protocols;

  const updatedTemplate = {
    ...templates[index],
    ...data,
    protocols: templateProtocols,
    updated: new Date().toISOString(),
  };

  templates = [
    ...templates.slice(0, index),
    updatedTemplate,
    ...templates.slice(index + 1),
  ];

  return updatedTemplate;
}

export async function deleteTemplate(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  templates = templates.filter(t => t.id !== id);
}

// Dashboard APIs
export async function getDashboardStats(): Promise<DashboardStats> {
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    totalAthletes: athletes.length,
    activeAthletes: athletes.filter(a => {
      const lastAssessment = assessments
        .filter(assessment => assessment.athleteId === a.id)
        .sort((a, b) => new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime())[0];
      return lastAssessment && new Date(lastAssessment.assessedAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }).length,
    totalAssessments: assessments.length,
    assessmentsTrend: 12.5,
    protocols,
    recentAssessments: assessments
      .sort((a, b) => new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime())
      .slice(0, 10),
    recentActivities: assessments.map(a => ({
      id: a.id,
      type: 'assessment' as const,
      description: `New assessment recorded`,
      user: { id: a.assessedBy, name: 'Coach', role: 'lead_coach' },
      timestamp: a.assessedAt,
    })).slice(0, 10),
    userActivity: [
      {
        userId: '1',
        userName: 'John Coach',
        assessmentCount: 45,
        lastActive: new Date().toISOString(),
      },
      {
        userId: '2',
        userName: 'Sarah Trainer',
        assessmentCount: 32,
        lastActive: new Date().toISOString(),
      },
    ],
    performanceDistribution: {
      excellent: assessments.filter(a => a.performanceLevel === 'excellent').length,
      median: assessments.filter(a => a.performanceLevel === 'median').length,
      needsImprovement: assessments.filter(a => a.performanceLevel === 'needs_improvement').length,
    },
    templateUsage: templates.map(t => ({
      templateId: t.id,
      templateName: t.name,
      useCount: Math.floor(Math.random() * 50),
    })),
  };
}