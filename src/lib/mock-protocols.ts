import { TestProtocol } from '@/types/protocol';

export const mockProtocols: TestProtocol[] = [
  {
    id: '1',
    name: '20m Sprint',
    description: 'Measures explosive speed over 20 meters',
    unit: 'seconds',
    criteria: 'lower',
    categories: ['speed', 'physical'],
    normativeData: [
      {
        ageGroup: 'U12',
        needs_improvement: { min: 4.5, max: 5.0 },
        median: { min: 4.0, max: 4.5 },
        excellent: { min: 3.5, max: 4.0 },
      },
      {
        ageGroup: 'U14',
        needs_improvement: { min: 4.2, max: 4.7 },
        median: { min: 3.8, max: 4.2 },
        excellent: { min: 3.3, max: 3.8 },
      },
    ],
    createdBy: '1',
    created: '2024-03-01T10:00:00Z',
    updated: '2024-03-01T10:00:00Z',
  },
  {
    id: '2',
    name: 'Vertical Jump',
    description: 'Measures explosive leg power',
    unit: 'centimeters',
    criteria: 'higher',
    categories: ['strength', 'physical'],
    normativeData: [
      {
        ageGroup: 'U12',
        needs_improvement: { min: 25, max: 30 },
        median: { min: 30, max: 35 },
        excellent: { min: 35, max: 40 },
      },
      {
        ageGroup: 'U14',
        needs_improvement: { min: 30, max: 35 },
        median: { min: 35, max: 40 },
        excellent: { min: 40, max: 45 },
      },
    ],
    createdBy: '1',
    created: '2024-03-01T11:00:00Z',
    updated: '2024-03-01T11:00:00Z',
  },
  {
    id: '3',
    name: 'Serve Speed',
    description: 'Measures first serve speed',
    unit: 'km/h',
    criteria: 'higher',
    categories: ['tennis-specific', 'strength'],
    normativeData: [
      {
        ageGroup: 'U12',
        needs_improvement: { min: 80, max: 90 },
        median: { min: 90, max: 100 },
        excellent: { min: 100, max: 110 },
      },
      {
        ageGroup: 'U14',
        needs_improvement: { min: 90, max: 100 },
        median: { min: 100, max: 110 },
        excellent: { min: 110, max: 120 },
      },
    ],
    createdBy: '1',
    created: '2024-03-01T12:00:00Z',
    updated: '2024-03-01T12:00:00Z',
  },
];