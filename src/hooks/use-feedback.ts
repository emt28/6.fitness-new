import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSessionFeedback,
  createSessionFeedback,
  updateSessionFeedback,
  getFeedbackTemplates,
  createFeedbackTemplate,
  deleteFeedbackTemplate,
  getTrainingLog,
  getCustomElements,
  createCustomElement,
  deleteCustomElement,
} from '@/lib/feedback';
import { CreateSessionFeedbackData, CreateFeedbackTemplateData } from '@/types/feedback';

export function useSessionFeedback(sessionId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['session-feedback', sessionId],
    queryFn: () => getSessionFeedback(sessionId!),
    enabled: !!sessionId,
  });

  const createFeedback = useMutation({
    mutationFn: (data: CreateSessionFeedbackData) => createSessionFeedback(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-feedback'] });
      queryClient.invalidateQueries({ queryKey: ['training-log'] });
    },
  });

  const updateFeedback = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSessionFeedbackData> }) =>
      updateSessionFeedback(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-feedback'] });
      queryClient.invalidateQueries({ queryKey: ['training-log'] });
    },
  });

  return {
    ...query,
    createFeedback,
    updateFeedback,
  };
}

export function useFeedbackTemplates() {
  return useQuery({
    queryKey: ['feedback-templates'],
    queryFn: getFeedbackTemplates,
  });
}

export function useCreateFeedbackTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateFeedbackTemplateData) => createFeedbackTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-templates'] });
    },
  });
}

export function useDeleteFeedbackTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteFeedbackTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-templates'] });
    },
  });
}

export function useTrainingLog(athleteId: string) {
  return useQuery({
    queryKey: ['training-log', athleteId],
    queryFn: () => getTrainingLog(athleteId),
    enabled: !!athleteId,
  });
}

interface CustomElement {
  id: string;
  value: string;
  type: 'focus' | 'goals' | 'drills';
  userId: string;
}

export function useCustomElements(type: 'focus' | 'goals' | 'drills') {
  const queryClient = useQueryClient();
  
  const { data } = useQuery({
    queryKey: ['custom-elements', type],
    queryFn: () => getCustomElements(type),
  });

  const addElement = useMutation({
    mutationFn: (value: string) => createCustomElement({ type, value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-elements', type] });
    },
  });

  const removeElement = useMutation({
    mutationFn: (id: string) => deleteCustomElement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-elements', type] });
    },
  });

  return { data, addElement, removeElement };
}