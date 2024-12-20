import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAssessment,
  getAssessments,
  getAthleteAssessments,
  updateAssessment,
  deleteAssessment,
} from '@/lib/api';
import { CreateAssessmentData } from '@/types/assessment';

export function useAssessments(athleteId?: string) {
  return useQuery({
    queryKey: ['assessments', { athleteId }],
    queryFn: () => getAssessments(athleteId),
  });
}

export function useAthleteAssessments(athleteId: string, protocolId?: string) {
  return useQuery({
    queryKey: ['assessments', { athleteId, protocolId }],
    queryFn: () => getAthleteAssessments(athleteId, protocolId),
    enabled: !!athleteId,
  });
}

export function useCreateAssessment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAssessmentData) => createAssessment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['assessments', { athleteId: variables.athleteId }]
      });
    },
  });
}

export function useUpdateAssessment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAssessmentData> }) =>
      updateAssessment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['assessments', { athleteId: variables.data.athleteId }]
      });
    },
  });
}

export function useDeleteAssessment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
    },
  });
}