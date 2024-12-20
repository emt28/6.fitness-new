import { Assessment } from '@/types/assessment';

export const mockAssessments: Assessment[] = [
  {
    id: '1',
    athleteId: '1', // Emma Thompson
    protocolId: '1', // 20m Sprint
    value: 3.8,
    performanceLevel: 'excellent',
    notes: 'Great improvement in technique',
    assessedBy: '1',
    assessedAt: '2024-03-10T10:00:00Z',
    created: '2024-03-10T10:00:00Z',
    updated: '2024-03-10T10:00:00Z',
  },
  {
    id: '2',
    athleteId: '1',
    protocolId: '1',
    value: 4.1,
    performanceLevel: 'median',
    assessedBy: '1',
    assessedAt: '2024-02-10T10:00:00Z',
    created: '2024-02-10T10:00:00Z',
    updated: '2024-02-10T10:00:00Z',
  },
  {
    id: '3',
    athleteId: '2', // James Wilson
    protocolId: '2', // Vertical Jump
    value: 38,
    performanceLevel: 'excellent',
    notes: 'Consistent performance',
    assessedBy: '1',
    assessedAt: '2024-03-11T14:30:00Z',
    created: '2024-03-11T14:30:00Z',
    updated: '2024-03-11T14:30:00Z',
  },
];