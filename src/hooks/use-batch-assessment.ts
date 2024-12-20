import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAssessment } from '@/lib/api';
import { CreateAssessmentData } from '@/types/assessment';

interface BatchAssessmentData {
  protocolId: string;
  athleteIds: string[];
  values: Array<{
    athleteId: string;
    value: number;
    notes?: string;
  }>;
}

export function useBatchAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BatchAssessmentData) => {
      const promises = data.values.map(({ athleteId, value, notes }) => {
        const assessmentData: CreateAssessmentData = {
          athleteId,
          protocolId: data.protocolId,
          value,
          notes,
        };
        return createAssessment(assessmentData);
      });

      return Promise.all(promises);
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      variables.athleteIds.forEach(athleteId => {
        queryClient.invalidateQueries({
          queryKey: ['assessments', { athleteId }],
        });
      });
      queryClient.invalidateQueries({
        queryKey: ['assessments'],
      });
    },
  });
}