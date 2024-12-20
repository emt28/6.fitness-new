import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createAthlete, getAthletes, deleteAthlete, updateAthlete } from '@/lib/api';
import { CreateAthleteData } from '@/types/athlete';

export function useAthletes() {
  return useQuery({
    queryKey: ['athletes'],
    queryFn: getAthletes,
  });
}

export function useCreateAthlete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAthleteData) => createAthlete(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
    },
  });
}

export function useUpdateAthlete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAthleteData> }) =>
      updateAthlete(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
    },
  });
}

export function useDeleteAthlete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteAthlete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
    },
  });
}