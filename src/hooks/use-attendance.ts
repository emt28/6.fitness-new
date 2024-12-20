import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSessions,
  getTemplates,
  getSchedules,
  getAttendance,
  createSession,
  createTemplate,
  deleteTemplate,
  createSchedule,
  recordAttendance,
  getAthleteAttendanceStats,
} from '@/lib/attendance';
import { startOfWeek } from 'date-fns';

export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: getSessions,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useTemplates() {
  return useQuery({
    queryKey: ['attendance-templates'],
    queryFn: getTemplates,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-templates'] });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-templates'] });
    },
  });
}

export function useSchedules(weekStartDate?: string) {
  return useQuery({
    queryKey: ['schedules', weekStartDate],
    queryFn: () => getSchedules(weekStartDate),
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useAttendance(sessionId?: string, athleteId?: string, date?: string) {
  return useQuery({
    queryKey: ['attendance', { sessionId, athleteId, date }],
    queryFn: () => getAttendance(sessionId, athleteId, date),
    enabled: !!sessionId || !!athleteId || !!date,
  });
}

export function useRecordAttendance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: recordAttendance,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['attendance', { sessionId: variables.sessionId }],
      });
      queryClient.invalidateQueries({
        queryKey: ['attendance', { athleteId: variables.athleteId }],
      });
      queryClient.invalidateQueries({
        queryKey: ['attendance-stats', variables.athleteId],
      });
    },
  });
}

export function useAthleteAttendanceStats(athleteId: string) {
  return useQuery({
    queryKey: ['attendance-stats', athleteId],
    queryFn: () => getAthleteAttendanceStats(athleteId),
    enabled: !!athleteId,
  });
}

export function useWeeklyAttendance(weekStartDate: Date) {
  const start = startOfWeek(weekStartDate);

  return useQuery({
    queryKey: ['weekly-attendance', start.toISOString()],
    queryFn: async () => {
      const schedules = await getSchedules(start.toISOString());
      const attendance = await getAttendance(undefined, undefined, start.toISOString());
      return { schedules, attendance };
    },
  });
}