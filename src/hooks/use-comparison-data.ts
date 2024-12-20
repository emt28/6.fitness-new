import { useAthletes } from './use-athletes';
import { useProtocols } from './use-protocols';
import { useQueries, useQuery } from '@tanstack/react-query';
import { getAthleteAssessments } from '@/lib/api';
import { useMemo } from 'react';

export function useComparisonData(selectedAthletes: string[], selectedProtocol: string, dateRange: number) {
  const { data: athletes, isLoading: athletesLoading } = useAthletes();
  const { data: protocols, isLoading: protocolsLoading } = useProtocols();

  const assessmentQueries = useQueries({
    queries: selectedAthletes.map(athleteId => ({
      queryKey: ['assessments', { athleteId, protocolId: selectedProtocol }],
      queryFn: () => getAthleteAssessments(athleteId, selectedProtocol),
      enabled: !!athleteId && !!selectedProtocol,
    })),
  });

  const isLoading = athletesLoading || 
    protocolsLoading || 
    assessmentQueries.some(q => q.isLoading);

  const comparisonData = useMemo(() => {
    if (!athletes || !protocols || !selectedAthletes.length) return [];

    const compareDate = new Date();
    compareDate.setDate(compareDate.getDate() - dateRange);

    return selectedAthletes.map((athleteId, index) => {
      const athlete = athletes.find(a => a.id === athleteId);
      const assessments = assessmentQueries[index].data?.filter(
        a => new Date(a.assessedAt) >= compareDate
      ) || [];

      return {
        athlete,
        assessments,
      };
    });
  }, [athletes, protocols, selectedAthletes, assessmentQueries, dateRange]);

  return {
    data: comparisonData,
    athletes,
    protocols,
    isLoading,
  };
}