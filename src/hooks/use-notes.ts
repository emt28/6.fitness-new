import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotes, createNote } from '@/lib/mock-notes';
import { CoachNote } from '@/types/note';

export function useAthleteNotes(athleteId: string) {
  return useQuery({
    queryKey: ['notes', athleteId],
    queryFn: () => getNotes(athleteId),
    enabled: !!athleteId,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ athleteId, data }: {
      athleteId: string;
      data: Pick<CoachNote, 'content' | 'type' | 'visibility'>;
    }) => createNote(athleteId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['notes', variables.athleteId],
      });
    },
  });
}