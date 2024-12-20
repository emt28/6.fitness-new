import { useQuery } from '@tanstack/react-query';
import { Assessment } from '@/types/assessment';
import { Athlete } from '@/types/athlete';
import { calculateAge } from '@/lib/utils';

// Mock function to get peer data - replace with actual API call
async function getPeerData(athlete: Athlete) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // In a real implementation, this would fetch from your backend:
  // - Athletes in the same age group
  // - Their assessment data
  // - Filtered by relevant criteria (e.g., gender, competition level)
  
  // For now, return mock data
  return {
    athletes: [
      {
        id: 'peer1',
        name: 'Peer Athlete 1',
        dateOfBirth: athlete.dateOfBirth,
        dominantHand: 'right',
        wtn: 16.5,
        createdBy: '1',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      },
      // Add more mock peer athletes...
    ],
    assessments: [
      {
        id: 'pa1',
        athleteId: 'peer1',
        protocolId: '1',
        value: 4.0,
        performanceLevel: 'excellent',
        assessedBy: '1',
        assessedAt: new Date().toISOString(),
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      },
      // Add more mock assessments...
    ],
  };
}

export function usePeerData(athlete: Athlete) {
  return useQuery({
    queryKey: ['peer-data', athlete.id],
    queryFn: () => getPeerData(athlete),
  });
}