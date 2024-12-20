import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createProtocol, getProtocols, updateProtocol, deleteProtocol } from '@/lib/api';
import { CreateTestProtocolData } from '@/types/protocol';

export function useProtocols() {
  return useQuery({
    queryKey: ['protocols'],
    queryFn: getProtocols,
  });
}

export function useCreateProtocol() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTestProtocolData) => createProtocol(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocols'] });
    },
  });
}

export function useUpdateProtocol() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTestProtocolData> }) =>
      updateProtocol(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocols'] });
    },
  });
}

export function useDeleteProtocol() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteProtocol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocols'] });
    },
  });
}